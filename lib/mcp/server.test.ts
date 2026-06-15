import { describe, it, expect } from "vitest";
import { handleRpc } from "./server";

// Helper: chama tools/call e devolve o structuredContent já parseado.
async function call(name: string, args: Record<string, unknown> = {}) {
  const res = await handleRpc({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name, arguments: args } });
  const result = res?.result as { isError?: boolean; structuredContent?: unknown };
  return result;
}

describe("MCP server", () => {
  it("initialize negocia protocolo e anuncia tools", async () => {
    const res = await handleRpc({ jsonrpc: "2.0", id: 0, method: "initialize", params: { protocolVersion: "2025-06-18" } });
    const r = res?.result as { protocolVersion: string; capabilities: { tools: unknown } };
    expect(r.protocolVersion).toBe("2025-06-18");
    expect(r.capabilities.tools).toBeDefined();
  });

  it("notificação não gera resposta", async () => {
    const res = await handleRpc({ jsonrpc: "2.0", method: "notifications/initialized" });
    expect(res).toBeNull();
  });

  it("tools/list expõe as ferramentas esperadas", async () => {
    const res = await handleRpc({ jsonrpc: "2.0", id: 2, method: "tools/list" });
    const names = (res?.result as { tools: { name: string }[] }).tools.map((t) => t.name);
    expect(names).toContain("simular");
    expect(names).toContain("salvar_proposta");
    expect(names).toContain("listar_premissas");
  });

  it("rodar_cenario realista bate com os valores de referência", async () => {
    const r = await call("rodar_cenario", { cenario: "realista" });
    const anos = (r.structuredContent as { resultado: { anos: { receitaBruta: number }[] } }).resultado.anos;
    expect(anos[0].receitaBruta).toBeGreaterThan(4_000_000);
    expect(anos[0].receitaBruta).toBeLessThan(5_500_000);
  });

  it("simular aplica override (faixa amarela) e calcula delta positivo", async () => {
    // contratosMidPico=8: acima do otimista (5), dentro do painel (max 10) → amarela
    const r = await call("simular", { base: "realista", overrides: { contratosMidPico: 8 } });
    const sc = r.structuredContent as {
      delta: { ebitda: number }[]; overridesAplicados: Record<string, number>;
      faixas: Record<string, string>; resultado: unknown;
    };
    expect(sc.overridesAplicados.contratosMidPico).toBe(8);
    expect(sc.faixas.contratosMidPico).toBe("amarela");
    expect(sc.resultado).not.toBeNull();
    expect(sc.delta[0].ebitda).toBeGreaterThan(0);
  });

  it("simular em faixa vermelha pede confirmação antes de mostrar números", async () => {
    const r = await call("simular", { base: "realista", overrides: { contratosMidPico: 15 } });
    const sc = r.structuredContent as { requerConfirmacao?: boolean; resultado: unknown; alertasVermelhos: { key: string }[] };
    expect(sc.requerConfirmacao).toBe(true);
    expect(sc.resultado).toBeNull();
    expect(sc.alertasVermelhos.some((a) => a.key === "contratosMidPico")).toBe(true);
  });

  it("simular calcula a extrapolação quando confirmarExtrapolacao=true", async () => {
    const r = await call("simular", { base: "realista", overrides: { contratosMidPico: 15 }, confirmarExtrapolacao: true });
    const sc = r.structuredContent as { requerConfirmacao?: boolean; resultado: unknown; extrapolacao: boolean };
    expect(sc.requerConfirmacao).toBeUndefined();
    expect(sc.resultado).not.toBeNull();
    expect(sc.extrapolacao).toBe(true);
  });

  it("salvar registra com justificativa, snapshot e motor v8; ver recalcula", async () => {
    const saved = await call("salvar_proposta", {
      nome: "Mais bootcamps", base: "realista", overrides: { bootcampsAno1: 15 },
      autor: "sócio", justificativa: "testar capacidade de entrega",
    });
    const reg = (saved.structuredContent as { registro: { id: string; justificativa: string; motor: string; resultado: unknown } }).registro;
    expect(reg.id).toMatch(/^prop_/);
    expect(reg.justificativa).toBe("testar capacidade de entrega");
    expect(reg.motor).toBe("v8");
    expect(reg.resultado).toBeTruthy();

    const lista = await call("listar_propostas");
    expect((lista.structuredContent as { total: number }).total).toBeGreaterThanOrEqual(1);

    const ver = await call("ver_proposta", { id: reg.id });
    expect((ver.structuredContent as { registro: { nome: string } }).registro.nome).toBe("Mais bootcamps");
  });

  it("ferramenta desconhecida retorna isError", async () => {
    const r = await call("nao_existe");
    expect(r.isError).toBe(true);
  });
});
