// ============================================================================
// Amplify BP v8 — Motor de cálculo (cascata de EBITDA, 36 meses)
// ----------------------------------------------------------------------------
// Reimplementação determinística da planilha BP_Amplify_v8.xlsx.
// A PLANILHA É A FONTE DE VERDADE. Cada bloco abaixo reproduz, célula a célula,
// as abas Premissas / Rede / Receita / P&L. Onde a planilha tem um
// comportamento não-óbvio (ou um provável erro de fórmula), está marcado com
// `QUIRK DA PLANILHA:` para auditoria — esses pontos são necessários para
// bater com os valores de referência da spec (seção 7).
//
// Horizonte: 36 meses, início ago/2026. m = 1..36.
// Ano 1 = meses 1-12, Ano 2 = 13-24, Ano 3 = 25-36.
// ============================================================================

export type ScenarioKey = "pessimista" | "realista" | "otimista";

export interface Assumptions {
  // — Programa de Transformação —
  contratosMidPico: number; // E8
  ticketMid: number; // E9 (anual)
  contasTopo: number; // E10
  ticketTopo: number; // E11 (anual)
  renovacao: number; // E12 (não usado na planilha — ver nota)
  custoVarPrograma: number; // E13 (% receita)

  // — Capacitação aberta —
  bootcampsAno1: number; // E15
  pessoasTurma: number; // E16
  ticketBootcamp: number; // E17 (por pessoa)
  custoBootcamp: number; // E18 (por turma)
  crescBootcamp: number; // E19 (mult. ano 2 e 3)
  outrasPico: number; // E20
  ticketOutras: number; // E21
  custoOutras: number; // E22

  // — Comunidade —
  clubNovosPico: number; // E25
  clubTicket: number; // E26
  startNovosPico: number; // E27
  startTicket: number; // E28
  expertNovosPico: number; // E29
  expertTicket: number; // E30
  churnComunidade: number; // E31
  custoComunidade: number; // E32 (% receita)

  // — Rede de distribuição —
  redeMesInicio: number; // E34
  redeFimAno1: number; // E35
  redeFimAno2: number; // E36
  redeFimAno3: number; // E37
  recPorAmplifier: number; // E38 (mensal)
  comVendaRede: number; // E39
  comTrailingRede: number; // E40
  custoFormacao: number; // E41

  // — Geral —
  comInterno: number; // E43 (fixo 0.05)
  impostos: number; // E45 (fixo 0.12)
}

// Premissas base por cenário (aba Premissas, colunas Pess / Real / Otim) ------
export const SCENARIOS: Record<ScenarioKey, Assumptions> = {
  pessimista: {
    contratosMidPico: 2, ticketMid: 110000, contasTopo: 0, ticketTopo: 300000,
    renovacao: 0.6, custoVarPrograma: 0.25,
    bootcampsAno1: 7, pessoasTurma: 70, ticketBootcamp: 1800, custoBootcamp: 18000,
    crescBootcamp: 1.3, outrasPico: 2, ticketOutras: 12000, custoOutras: 8000,
    clubNovosPico: 5, clubTicket: 4000, startNovosPico: 8, startTicket: 600,
    expertNovosPico: 5, expertTicket: 350, churnComunidade: 0.05, custoComunidade: 0.30,
    redeMesInicio: 9, redeFimAno1: 3, redeFimAno2: 10, redeFimAno3: 25,
    recPorAmplifier: 8000, comVendaRede: 0.25, comTrailingRede: 0.10, custoFormacao: 4000,
    comInterno: 0.05, impostos: 0.12,
  },
  realista: {
    contratosMidPico: 3, ticketMid: 130000, contasTopo: 1, ticketTopo: 400000,
    renovacao: 0.7, custoVarPrograma: 0.20,
    bootcampsAno1: 9, pessoasTurma: 85, ticketBootcamp: 1800, custoBootcamp: 18000,
    crescBootcamp: 1.5, outrasPico: 3, ticketOutras: 14000, custoOutras: 8000,
    clubNovosPico: 8, clubTicket: 4000, startNovosPico: 12, startTicket: 600,
    expertNovosPico: 10, expertTicket: 350, churnComunidade: 0.04, custoComunidade: 0.25,
    redeMesInicio: 6, redeFimAno1: 8, redeFimAno2: 25, redeFimAno3: 60,
    recPorAmplifier: 12000, comVendaRede: 0.20, comTrailingRede: 0.08, custoFormacao: 3000,
    comInterno: 0.05, impostos: 0.12,
  },
  otimista: {
    contratosMidPico: 5, ticketMid: 150000, contasTopo: 2, ticketTopo: 500000,
    renovacao: 0.8, custoVarPrograma: 0.15,
    bootcampsAno1: 12, pessoasTurma: 100, ticketBootcamp: 1800, custoBootcamp: 18000,
    crescBootcamp: 1.8, outrasPico: 4, ticketOutras: 16000, custoOutras: 8000,
    clubNovosPico: 12, clubTicket: 4000, startNovosPico: 20, startTicket: 600,
    expertNovosPico: 18, expertTicket: 350, churnComunidade: 0.03, custoComunidade: 0.20,
    redeMesInicio: 6, redeFimAno1: 15, redeFimAno2: 45, redeFimAno3: 110,
    recPorAmplifier: 18000, comVendaRede: 0.15, comTrailingRede: 0.05, custoFormacao: 2000,
    comInterno: 0.05, impostos: 0.12,
  },
};

const round = (x: number) => Math.round(x);

// Rampa com piso/limite, com ROUND — espelha as fórmulas da planilha:
//   IF(m < mesInicio, 0, ROUND(pico * MIN(1, (m-mesInicio+1)/(mesPico-mesInicio+1)), 0))
function rampa(m: number, pico: number, mesPico: number, mesInicio: number): number {
  if (m < mesInicio) return 0;
  return round(pico * Math.min(1, (m - mesInicio + 1) / (mesPico - mesInicio + 1)));
}

// ----- Estruturas de saída -------------------------------------------------
export interface MonthRow {
  m: number;
  // receita por linha
  recMid: number;
  recTopo: number;
  recBootcamp: number;
  recOutras: number;
  clubAtivos: number; clubReceita: number;
  startAtivos: number; startReceita: number;
  expertAtivos: number; expertReceita: number;
  receitaBruta: number;
  // rede
  redeAtivos: number; redeNovos: number; recOriginadaRede: number;
  custoFormacaoRede: number; comissaoRede: number; custoTimeRede: number;
  // cascata P&L
  impostos: number;
  receitaLiquida: number;
  cogsProgramas: number;
  cogsBootcamp: number;
  cogsComunidade: number;
  margemContribuicao: number;
  comissaoInterna: number;
  custoRede: number; // formação + time central
  margemOperacional: number;
  gaGestao: number; gaVendas: number; gaMarketing: number; gaProduto: number; gaSoftware: number;
  ebitda: number;
  ebitdaAcumulado: number;
}

export interface YearAgg {
  receitaBruta: number;
  receitaLiquida: number;
  margemContribuicao: number;
  margemOperacional: number;
  ebitda: number;
  margemEbitda: number;
}

export interface ModelResult {
  months: MonthRow[];
  years: [YearAgg, YearAgg, YearAgg];
  breakEvenMonth: number | null; // primeiro mês com EBITDA acumulado >= 0
}

// ============================================================================
// Núcleo do cálculo
// ============================================================================
export function runModel(a: Assumptions): ModelResult {
  const months: MonthRow[] = [];

  // estado acumulado
  let midAtivos = 0;
  let clubAtivos = 0, startAtivos = 0, expertAtivos = 0;
  let prevRedeAtivos = 0;
  let ebitdaAcum = 0;

  for (let m = 1; m <= 36; m++) {
    // ---- Programa de Transformação (Receita rows 4-7) ----
    // contratos novos: rampa(mesInicio=2, mesPico=6). ativos = acumulado puro.
    // QUIRK DA PLANILHA: renovação (E12) NÃO é aplicada — a base só acumula.
    const midNovos = rampa(m, a.contratosMidPico, 6, 2);
    midAtivos += midNovos;
    const recMid = (midAtivos * a.ticketMid) / 12;
    const recTopo = m >= 4 ? (a.contasTopo * a.ticketTopo) / 12 : 0;

    // ---- Bootcamp (Receita row 8) — fases ----
    let recBootcamp: number;
    if (m <= 6) recBootcamp = (a.bootcampsAno1 / 6) * a.pessoasTurma * a.ticketBootcamp;
    else if (m <= 12) recBootcamp = 0;
    else if (m <= 24) recBootcamp = ((a.bootcampsAno1 * a.crescBootcamp) / 12) * a.pessoasTurma * a.ticketBootcamp;
    else recBootcamp = ((a.bootcampsAno1 * a.crescBootcamp * a.crescBootcamp) / 12) * a.pessoasTurma * a.ticketBootcamp;

    // ---- Outras capacitações (Receita row 80) ----
    const outrasEventos = rampa(m, a.outrasPico, 6, 2);
    const recOutras = outrasEventos * a.ticketOutras;

    // ---- Comunidade (Receita rows 9-14): rampa(mesInicio=4, mesPico=8) + churn ----
    clubAtivos = clubAtivos * (1 - a.churnComunidade) + rampa(m, a.clubNovosPico, 8, 4);
    startAtivos = startAtivos * (1 - a.churnComunidade) + rampa(m, a.startNovosPico, 8, 4);
    expertAtivos = expertAtivos * (1 - a.churnComunidade) + rampa(m, a.expertNovosPico, 8, 4);
    const clubReceita = clubAtivos * a.clubTicket;
    const startReceita = startAtivos * a.startTicket;
    const expertReceita = expertAtivos * a.expertTicket;

    // ---- RECEITA BRUTA TOTAL (Receita row 16) ----
    // QUIRK DA PLANILHA: a fórmula é =recMid+recTopo+recBootcamp+recOutras
    //   + START_ATIVOS + EXPERT_ATIVOS (rows 11 e 13, contagens, não receitas)
    //   + row15 (vazia). Club receita e as receitas reais de comunidade NÃO
    //   entram no total. Reproduzido fielmente para bater com a referência.
    const receitaBruta = recMid + recTopo + recBootcamp + recOutras + startAtivos + expertAtivos;

    // ---- Rede de distribuição (aba Rede) ----
    let redeAtivos: number;
    if (m <= 12) {
      redeAtivos = m < a.redeMesInicio
        ? 0
        : round((a.redeFimAno1 * (m - a.redeMesInicio + 1)) / (12 - a.redeMesInicio + 1));
    } else if (m <= 24) {
      redeAtivos = round(a.redeFimAno1 + ((a.redeFimAno2 - a.redeFimAno1) * (m - 12)) / 12);
    } else {
      redeAtivos = round(a.redeFimAno2 + ((a.redeFimAno3 - a.redeFimAno2) * (m - 24)) / 12);
    }
    const redeNovos = Math.max(0, redeAtivos - prevRedeAtivos);
    const recOriginadaRede = redeAtivos * a.recPorAmplifier;
    const custoFormacaoRede = redeNovos * a.custoFormacao;
    const fracNovos = redeNovos / Math.max(redeAtivos, 1);
    const comissaoRede =
      recOriginadaRede * a.comVendaRede * fracNovos +
      recOriginadaRede * a.comTrailingRede * (1 - fracNovos);
    const custoTimeRede = m < a.redeMesInicio ? 0 : (1 + Math.floor(redeAtivos / 18)) * 12000;
    prevRedeAtivos = redeAtivos;

    // ---- Cascata P&L ----
    const impostos = -receitaBruta * a.impostos;
    const receitaLiquida = receitaBruta + impostos;

    const cogsProgramas = -(recMid + recTopo) * a.custoVarPrograma;

    // COGS bootcamp + capacitação (P&L row 8) — bootcamp segue as mesmas fases
    let custoBootcampMes: number;
    if (m <= 6) custoBootcampMes = (a.bootcampsAno1 / 6) * a.custoBootcamp;
    else if (m <= 12) custoBootcampMes = 0;
    else if (m <= 24) custoBootcampMes = (a.bootcampsAno1 * a.crescBootcamp / 12) * a.custoBootcamp;
    else custoBootcampMes = (a.bootcampsAno1 * a.crescBootcamp * a.crescBootcamp / 12) * a.custoBootcamp;
    const cogsBootcamp = -(custoBootcampMes + outrasEventos * a.custoOutras);

    // COGS comunidade (P&L row 9)
    // QUIRK DA PLANILHA: = (START_ATIVOS + EXPERT_ATIVOS) * custoComunidade
    //   (rows 11,13,15 — mesmo padrão do total; Club e receitas reais ausentes).
    const cogsComunidade = -(startAtivos + expertAtivos) * a.custoComunidade;

    const margemContribuicao = receitaLiquida + cogsProgramas + cogsBootcamp + cogsComunidade;

    // Comissão interna: sobre (receita bruta − receita originada pela rede)
    const comissaoInterna = -Math.max(0, receitaBruta - recOriginadaRede) * a.comInterno;
    const custoRede = -(custoTimeRede + custoFormacaoRede);
    const margemOperacional = margemContribuicao + comissaoInterna - comissaoRede + custoRede;

    // G&A (P&L rows 15-19) — degraus fixos
    const gaGestao = -(m <= 2 ? 31800 : 41800);
    const gaVendas = -(m <= 3 ? 43000 : 51000);
    const gaMarketing = -(m <= 12 ? 18000 : 10000);
    const gaProduto = -(m <= 2 ? 0 : 21000);
    // QUIRK/NOTA: esta linha (Software/Jurídico/PR/Ads) existe na planilha mas
    // não consta na seção 5/6 da spec. É necessária para bater o EBITDA.
    const gaSoftware = -(m <= 1 ? 6000 : m <= 2 ? 27000 : 42000);

    const ebitda = margemOperacional + gaGestao + gaVendas + gaMarketing + gaProduto + gaSoftware;
    ebitdaAcum += ebitda;

    months.push({
      m,
      recMid, recTopo, recBootcamp, recOutras,
      clubAtivos, clubReceita, startAtivos, startReceita, expertAtivos, expertReceita,
      receitaBruta,
      redeAtivos, redeNovos, recOriginadaRede, custoFormacaoRede, comissaoRede, custoTimeRede,
      impostos, receitaLiquida,
      cogsProgramas, cogsBootcamp, cogsComunidade, margemContribuicao,
      comissaoInterna, custoRede, margemOperacional,
      gaGestao, gaVendas, gaMarketing, gaProduto, gaSoftware,
      ebitda, ebitdaAcumulado: ebitdaAcum,
    });
  }

  // ---- Agregação anual ----
  const aggYear = (start: number): YearAgg => {
    const slice = months.slice(start, start + 12);
    const sum = (f: (r: MonthRow) => number) => slice.reduce((s, r) => s + f(r), 0);
    const receitaBruta = sum((r) => r.receitaBruta);
    const ebitda = sum((r) => r.ebitda);
    return {
      receitaBruta,
      receitaLiquida: sum((r) => r.receitaLiquida),
      margemContribuicao: sum((r) => r.margemContribuicao),
      margemOperacional: sum((r) => r.margemOperacional),
      ebitda,
      margemEbitda: receitaBruta === 0 ? 0 : ebitda / receitaBruta,
    };
  };

  const breakEven = months.find((r) => r.ebitdaAcumulado >= 0);

  return {
    months,
    years: [aggYear(0), aggYear(12), aggYear(24)],
    breakEvenMonth: breakEven ? breakEven.m : null,
  };
}

export function runScenario(key: ScenarioKey): ModelResult {
  return runModel(SCENARIOS[key]);
}
