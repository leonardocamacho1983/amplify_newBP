import { describe, it, expect } from "vitest";
import { runScenario } from "./calc";

// Valores de referência da spec (seção 7, planilha corrigida — comunidade em R$).
// A planilha é a fonte de verdade; tolerância 2%.
const REF = {
  realista: {
    // Com G&A crescente (ano2 = ano1×1,6; ano3 = ano2×1,5).
    receita: [4_700_000, 14_355_000, 22_961_000],
    ebitda: [797_000, 5_276_000, 8_667_000],
    margem: [0.170, 0.368, 0.377],
  },
  pessimista: { receitaAno1: 2_625_000, ebitdaAno1: -523_000 },
  otimista: { receitaAno1: 8_161_000, ebitdaAno1: 3_276_000 },
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

  it("cenário pessimista: receita e EBITDA ano 1 (±2%)", () => {
    const { years } = runScenario("pessimista");
    expect(within(years[0].receitaBruta, REF.pessimista.receitaAno1), "receita").toBe(true);
    expect(within(years[0].ebitda, REF.pessimista.ebitdaAno1), "ebitda").toBe(true);
  });

  it("cenário otimista: receita e EBITDA ano 1 (±2%)", () => {
    const { years } = runScenario("otimista");
    expect(within(years[0].receitaBruta, REF.otimista.receitaAno1), "receita").toBe(true);
    expect(within(years[0].ebitda, REF.otimista.ebitdaAno1), "ebitda").toBe(true);
  });
});
