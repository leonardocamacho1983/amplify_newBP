import type { Assumptions } from "@/lib/calc";

export type FieldKind = "money" | "int" | "pct" | "mult";

export interface Field {
  key: keyof Assumptions;
  label: string;
  min: number;
  max: number;
  step: number;
  kind: FieldKind;
  hint?: string;
}

export interface Group {
  title: string;
  note?: string;
  fields: Field[];
}

// Painel de premissas — mesmas categorias da planilha (spec §5).
export const GROUPS: Group[] = [
  {
    title: "Programa de transformação",
    fields: [
      { key: "contratosMidPico", label: "Contratos mid novos/mês (pico)", min: 0, max: 10, step: 1, kind: "int" },
      { key: "ticketMid", label: "Ticket médio mid (anual)", min: 50000, max: 250000, step: 5000, kind: "money" },
      { key: "contasTopo", label: "Contas topo (upside, ano)", min: 0, max: 5, step: 1, kind: "int" },
      { key: "ticketTopo", label: "Ticket médio topo (anual)", min: 200000, max: 800000, step: 10000, kind: "money" },
      { key: "renovacao", label: "Taxa de renovação anual", min: 0, max: 1, step: 0.05, kind: "pct", hint: "Referência — não aplicada à base na planilha" },
      { key: "custoVarPrograma", label: "Custo variável por programa", min: 0, max: 0.5, step: 0.01, kind: "pct" },
    ],
  },
  {
    title: "Capacitação aberta",
    fields: [
      { key: "bootcampsAno1", label: "Bootcamps no ano 1 (S2/26)", min: 0, max: 20, step: 1, kind: "int" },
      { key: "pessoasTurma", label: "Pessoas por turma", min: 20, max: 150, step: 5, kind: "int" },
      { key: "ticketBootcamp", label: "Ticket bootcamp (p/ pessoa)", min: 500, max: 4000, step: 100, kind: "money" },
      { key: "custoBootcamp", label: "Custo direto por bootcamp", min: 5000, max: 40000, step: 1000, kind: "money" },
      { key: "crescBootcamp", label: "Crescimento bootcamps ano 2-3", min: 1, max: 3, step: 0.1, kind: "mult" },
      { key: "outrasPico", label: "Outras capacit./mês (pico)", min: 0, max: 10, step: 1, kind: "int" },
      { key: "ticketOutras", label: "Ticket médio outras capacit.", min: 5000, max: 30000, step: 1000, kind: "money" },
      { key: "custoOutras", label: "Custo direto outras capacit.", min: 0, max: 20000, step: 1000, kind: "money" },
    ],
  },
  {
    title: "Comunidade",
    fields: [
      { key: "clubNovosPico", label: "Club — novos/mês (pico)", min: 0, max: 30, step: 1, kind: "int" },
      { key: "clubTicket", label: "Club — ticket mensal", min: 1000, max: 8000, step: 250, kind: "money" },
      { key: "startNovosPico", label: "Start — novos/mês (pico)", min: 0, max: 40, step: 1, kind: "int" },
      { key: "startTicket", label: "Start — ticket mensal", min: 200, max: 1500, step: 50, kind: "money" },
      { key: "expertNovosPico", label: "Expert — novos/mês (pico)", min: 0, max: 40, step: 1, kind: "int" },
      { key: "expertTicket", label: "Expert — ticket mensal", min: 100, max: 1000, step: 50, kind: "money" },
      { key: "churnComunidade", label: "Churn mensal", min: 0, max: 0.15, step: 0.005, kind: "pct" },
      { key: "custoComunidade", label: "Custo plataforma+gestão", min: 0, max: 0.6, step: 0.01, kind: "pct" },
    ],
  },
  {
    title: "Rede de Amplifiers",
    note: "Faseada — benchmark de mercado.",
    fields: [
      { key: "redeMesInicio", label: "Mês de início da rede", min: 1, max: 18, step: 1, kind: "int" },
      { key: "redeFimAno1", label: "Amplifiers ativos — fim ano 1", min: 0, max: 40, step: 1, kind: "int" },
      { key: "redeFimAno2", label: "Amplifiers ativos — fim ano 2", min: 0, max: 100, step: 1, kind: "int" },
      { key: "redeFimAno3", label: "Amplifiers ativos — fim ano 3", min: 0, max: 200, step: 1, kind: "int" },
      { key: "recPorAmplifier", label: "Receita orig./Amplifier/mês", min: 0, max: 40000, step: 1000, kind: "money" },
      { key: "comVendaRede", label: "Comissão venda nova", min: 0, max: 0.4, step: 0.01, kind: "pct" },
      { key: "comTrailingRede", label: "Comissão trailing recorrente", min: 0, max: 0.2, step: 0.01, kind: "pct" },
      { key: "custoFormacao", label: "Custo formação por Amplifier", min: 0, max: 8000, step: 250, kind: "money" },
    ],
  },
  {
    title: "Geral",
    fields: [
      { key: "comInterno", label: "Comissão time interno s/ venda", min: 0, max: 0.15, step: 0.01, kind: "pct" },
      { key: "impostos", label: "Impostos sobre receita bruta", min: 0, max: 0.25, step: 0.01, kind: "pct" },
    ],
  },
];
