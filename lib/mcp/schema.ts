// ============================================================================
// MCP · Esquema de premissas + faixas de validade
// ----------------------------------------------------------------------------
// Espelha as alavancas do painel do BP vivo (app/bp/sliders.ts) e classifica
// cada valor proposto em três faixas, para a IA avisar o sócio quando estiver
// extrapolando o que foi de fato testado:
//   • verde    — dentro do intervalo dos cenários (modelo validado)
//   • amarela  — fora dos cenários, mas dentro da faixa plausível do painel
//   • vermelha — fora do painel (território não testado — usar com cautela)
// A planilha v8 (lib/calc.ts) é a fonte de verdade.
// ============================================================================
import { SCENARIOS, type Assumptions, type ScenarioKey } from "@/lib/calc";
import { GROUPS } from "@/app/bp/sliders";

export const SCENARIO_KEYS: ScenarioKey[] = ["pessimista", "realista", "otimista"];
export const ENGINE = "v8";

export type Band = "verde" | "amarela" | "vermelha";

export interface LeverMeta {
  key: keyof Assumptions;
  label: string;
  grupo: string;
  nota?: string;
  hint?: string;
  unidade: "R$" | "%" | "×" | "un";
  step: number;
  /** valor em cada cenário base */
  base: Record<ScenarioKey, number>;
  /** faixa verde: [min, max] dos cenários (validado) */
  validado: [number, number];
  /** faixa plausível do painel: [min, max] dos sliders (limite do amarelo) */
  plausivel: [number, number];
}

const unidade = (kind: string): LeverMeta["unidade"] =>
  kind === "money" ? "R$" : kind === "pct" ? "%" : kind === "mult" ? "×" : "un";

// Lista achatada de todas as alavancas, na ordem do painel.
export const LEVERS: LeverMeta[] = GROUPS.flatMap((g) =>
  g.fields.map((f) => {
    const base = {
      pessimista: SCENARIOS.pessimista[f.key],
      realista: SCENARIOS.realista[f.key],
      otimista: SCENARIOS.otimista[f.key],
    };
    const vals = [base.pessimista, base.realista, base.otimista];
    return {
      key: f.key,
      label: f.label,
      grupo: g.title,
      nota: g.note,
      hint: f.hint,
      unidade: unidade(f.kind),
      step: f.step,
      base,
      validado: [Math.min(...vals), Math.max(...vals)] as [number, number],
      plausivel: [f.min, f.max] as [number, number],
    };
  })
);

const LEVER_BY_KEY = new Map(LEVERS.map((l) => [l.key as string, l]));

export function classify(l: LeverMeta, v: number): Band {
  if (v >= l.validado[0] && v <= l.validado[1]) return "verde";
  if (v >= l.plausivel[0] && v <= l.plausivel[1]) return "amarela";
  return "vermelha";
}

export interface OverrideIssue { key: string; motivo: string }
export interface BandAlert {
  key: string;
  label: string;
  valor: number;
  unidade: string;
  band: Band;
  validado: [number, number];
  plausivel: [number, number];
  mensagem: string;
}

export interface OverrideAnalysis {
  assumptions: Assumptions;
  aplicados: Record<string, number>;
  bands: Record<string, Band>;
  avisos: OverrideIssue[];       // chaves inválidas / não numéricas (ignoradas)
  amarelas: BandAlert[];         // extrapolações razoáveis
  vermelhas: BandAlert[];        // fora do território testado
}

const fmtVal = (l: LeverMeta, v: number) =>
  l.unidade === "%" ? `${(v * 100).toFixed(l.step < 0.01 ? 1 : 0)}%` :
  l.unidade === "×" ? `${v}×` :
  l.unidade === "R$" ? `R$ ${v.toLocaleString("pt-BR")}` :
  `${v}`;

function alertFor(l: LeverMeta, v: number, band: Band): BandAlert {
  const range = (r: [number, number]) => `${fmtVal(l, r[0])}–${fmtVal(l, r[1])}`;
  const mensagem =
    band === "vermelha"
      ? `${l.label}: ${fmtVal(l, v)} está fora do território testado (validado ${range(l.validado)}; faixa do painel ${range(l.plausivel)}). O resultado é uma extrapolação — usar com cautela.`
      : `${l.label}: ${fmtVal(l, v)} extrapola o intervalo dos cenários (${range(l.validado)}), mas segue dentro da faixa plausível do painel.`;
  return { key: l.key as string, label: l.label, valor: v, unidade: l.unidade, band, validado: l.validado, plausivel: l.plausivel, mensagem };
}

/** Mescla overrides sobre um cenário base SEM fixar no limite (o motor aceita
 *  qualquer número) e classifica cada um em verde/amarela/vermelha. */
export function analyzeOverrides(
  base: ScenarioKey,
  overrides: Record<string, number> | undefined
): OverrideAnalysis {
  const assumptions: Assumptions = { ...SCENARIOS[base] };
  const aplicados: Record<string, number> = {};
  const bands: Record<string, Band> = {};
  const avisos: OverrideIssue[] = [];
  const amarelas: BandAlert[] = [];
  const vermelhas: BandAlert[] = [];

  for (const [k, raw] of Object.entries(overrides ?? {})) {
    const meta = LEVER_BY_KEY.get(k);
    if (!meta) { avisos.push({ key: k, motivo: "alavanca desconhecida — ignorada" }); continue; }
    if (typeof raw !== "number" || !Number.isFinite(raw)) { avisos.push({ key: k, motivo: "valor não numérico — ignorado" }); continue; }
    assumptions[meta.key] = raw;
    aplicados[k] = raw;
    const band = classify(meta, raw);
    bands[k] = band;
    if (band === "amarela") amarelas.push(alertFor(meta, raw, band));
    if (band === "vermelha") vermelhas.push(alertFor(meta, raw, band));
  }
  return { assumptions, aplicados, bands, avisos, amarelas, vermelhas };
}
