// ============================================================================
// MCP · Esquema de premissas
// ----------------------------------------------------------------------------
// Espelha as alavancas do painel do BP vivo (app/bp/sliders.ts) para que a IA
// de um sócio descubra o que pode mexer: rótulo, grupo, unidade, faixa e o
// valor de cada cenário base. A planilha v8 (lib/calc.ts) é a fonte de verdade.
// ============================================================================
import { SCENARIOS, type Assumptions, type ScenarioKey } from "@/lib/calc";
import { GROUPS } from "@/app/bp/sliders";

export const SCENARIO_KEYS: ScenarioKey[] = ["pessimista", "realista", "otimista"];

export interface LeverMeta {
  key: keyof Assumptions;
  label: string;
  grupo: string;
  nota?: string;
  hint?: string;
  unidade: "R$" | "%" | "×" | "un";
  min: number;
  max: number;
  step: number;
  /** valor em cada cenário base, para referência */
  base: Record<ScenarioKey, number>;
}

const unidade = (kind: string): LeverMeta["unidade"] =>
  kind === "money" ? "R$" : kind === "pct" ? "%" : kind === "mult" ? "×" : "un";

// Lista achatada de todas as alavancas, na ordem do painel.
export const LEVERS: LeverMeta[] = GROUPS.flatMap((g) =>
  g.fields.map((f) => ({
    key: f.key,
    label: f.label,
    grupo: g.title,
    nota: g.note,
    hint: f.hint,
    unidade: unidade(f.kind),
    min: f.min,
    max: f.max,
    step: f.step,
    base: {
      pessimista: SCENARIOS.pessimista[f.key],
      realista: SCENARIOS.realista[f.key],
      otimista: SCENARIOS.otimista[f.key],
    },
  }))
);

const LEVER_BY_KEY = new Map(LEVERS.map((l) => [l.key as string, l]));

export interface OverrideIssue {
  key: string;
  motivo: string;
}

/** Mescla overrides sobre um cenário base, validando chaves e faixas.
 *  Valores fora da faixa são fixados (clamp) no limite e reportados como aviso. */
export function mergeOverrides(
  base: ScenarioKey,
  overrides: Record<string, number> | undefined
): { assumptions: Assumptions; avisos: OverrideIssue[]; aplicados: Record<string, number> } {
  const assumptions: Assumptions = { ...SCENARIOS[base] };
  const avisos: OverrideIssue[] = [];
  const aplicados: Record<string, number> = {};
  if (!overrides) return { assumptions, avisos, aplicados };

  for (const [k, raw] of Object.entries(overrides)) {
    const meta = LEVER_BY_KEY.get(k);
    if (!meta) {
      avisos.push({ key: k, motivo: "alavanca desconhecida — ignorada" });
      continue;
    }
    if (typeof raw !== "number" || Number.isNaN(raw)) {
      avisos.push({ key: k, motivo: "valor não numérico — ignorado" });
      continue;
    }
    let v = raw;
    if (v < meta.min) { v = meta.min; avisos.push({ key: k, motivo: `abaixo do mínimo (${meta.min}) — fixado no limite` }); }
    if (v > meta.max) { v = meta.max; avisos.push({ key: k, motivo: `acima do máximo (${meta.max}) — fixado no limite` }); }
    assumptions[meta.key] = v;
    aplicados[k] = v;
  }
  return { assumptions, avisos, aplicados };
}
