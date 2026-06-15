// ============================================================================
// MCP · Resumo de resultado
// ----------------------------------------------------------------------------
// Converte um ModelResult (36 meses) num objeto JSON enxuto, pensado para a IA
// ler e raciocinar: totais por ano, margem, break-even e a composição de custos
// do ano escolhido. Tudo em R$ inteiros.
// ============================================================================
import { runModel, type Assumptions, type ModelResult, type MonthRow } from "@/lib/calc";

export interface YearSummary {
  ano: number;
  receitaBruta: number;
  ebitda: number;
  margemEbitda: number;
}

export interface CostCategory {
  categoria: string;
  valor: number;
  pctReceita: number;
}

export interface ModelSummary {
  anos: YearSummary[];
  breakEven: { status: string; mes: number | null; descricao: string };
  custosPorCategoria: { ano: number; receitaBruta: number; categorias: CostCategory[] };
}

const r0 = (x: number) => Math.round(x);
const r4 = (x: number) => Math.round(x * 10000) / 10000;

function costCategories(m: ModelResult, ano: number): ModelSummary["custosPorCategoria"] {
  const sl = m.months.slice(ano * 12, ano * 12 + 12);
  const sum = (f: (row: MonthRow) => number) => sl.reduce((a, row) => a + f(row), 0);
  const receita = sum((row) => row.receitaBruta);
  const cogs = -sum((row) => row.cogsProgramas + row.cogsBootcamp + row.cogsComunidade);
  const comissoes = -sum((row) => row.comissaoInterna - row.comissaoRede);
  const custoRede = -sum((row) => row.custoRede);
  const ga = -sum((row) => row.ga);
  const impostos = -sum((row) => row.impostos);
  const cat = (categoria: string, valor: number): CostCategory => ({
    categoria,
    valor: r0(valor),
    pctReceita: receita ? r4(valor / receita) : 0,
  });
  return {
    ano: ano + 1,
    receitaBruta: r0(receita),
    categorias: [
      cat("COGS", cogs),
      cat("Comissões", comissoes),
      cat("Custo de rede", custoRede),
      cat("G&A", ga),
      cat("Impostos", impostos),
    ],
  };
}

export function summarize(a: Assumptions, anoFoco = 0): ModelSummary {
  const m = runModel(a);
  const be = m.breakEven;
  const descricao =
    be.status === "from-start" ? "EBITDA acumulado positivo desde o início" :
    be.status === "month" ? `vira no mês ${be.month}` :
    "não atinge break-even em 36 meses";
  return {
    anos: m.years.map((y, i) => ({
      ano: i + 1,
      receitaBruta: r0(y.receitaBruta),
      ebitda: r0(y.ebitda),
      margemEbitda: r4(y.margemEbitda),
    })),
    breakEven: { status: be.status, mes: be.month, descricao },
    custosPorCategoria: costCategories(m, Math.min(2, Math.max(0, anoFoco))),
  };
}

/** Delta ano a ano entre dois cenários (proposta − base). */
export function diffSummaries(base: ModelSummary, novo: ModelSummary) {
  return novo.anos.map((y, i) => ({
    ano: y.ano,
    receitaBruta: y.receitaBruta - base.anos[i].receitaBruta,
    ebitda: y.ebitda - base.anos[i].ebitda,
    margemEbitda: r4(y.margemEbitda - base.anos[i].margemEbitda),
  }));
}
