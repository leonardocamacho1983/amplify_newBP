import { describe, it, expect } from "vitest";
import { runScenario } from "./calc";

// Valores de referência da spec (seção 7) — extraídos da planilha BP_Amplify_v8.xlsx
// (aba Resumo). A planilha é a fonte de verdade; tolerância 2%.
const REF = {
  realista: {
    receita: [3_561_000, 9_017_000, 14_731_000],
    ebitda: [137_000, 3_308_000, 6_581_000],
    margem: [0.038, 0.367, 0.447],
  },
  pessimista: { ebitdaAno1: -890_000 },
  otimista: { ebitdaAno1: 2_143_000 },
};

const within = (actual: number, ref: number, tol = 0.02) => {
  const base = Math.abs(ref) < 1 ? 1 : Math.abs(ref);
  return Math.abs(actual - ref) / base <= tol;
};

describe("modelo BP Amplify v8 — bate com a planilha", () => {
  it("cenário realista: receita por ano (±2%)", () => {
    const { years } = runScenario("realista");
    years.forEach((y, i) =>
      expect(within(y.receitaBruta, REF.realista.receita[i]), `receita ano ${i + 1}`).toBe(true)
    );
  });

  it("cenário realista: EBITDA por ano (±2%)", () => {
    const { years } = runScenario("realista");
    years.forEach((y, i) =>
      expect(within(y.ebitda, REF.realista.ebitda[i]), `ebitda ano ${i + 1}`).toBe(true)
    );
  });

  it("cenário realista: margem EBITDA por ano (±2% absoluto)", () => {
    const { years } = runScenario("realista");
    years.forEach((y, i) =>
      expect(Math.abs(y.margemEbitda - REF.realista.margem[i]) <= 0.02, `margem ano ${i + 1}`).toBe(true)
    );
  });

  it("cenário pessimista: EBITDA ano 1 ~ −890k", () => {
    const { years } = runScenario("pessimista");
    expect(within(years[0].ebitda, REF.pessimista.ebitdaAno1)).toBe(true);
  });

  it("cenário otimista: EBITDA ano 1 ~ +2.143M", () => {
    const { years } = runScenario("otimista");
    expect(within(years[0].ebitda, REF.otimista.ebitdaAno1)).toBe(true);
  });
});
