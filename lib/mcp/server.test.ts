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

  it("simular aplica override e calcula delta positivo ao subir contratos", async () => {
    const r = await call("simular", { base: "realista", overrides: { contratosMidPico: 8 } });
    const sc = r.structuredContent as { delta: { ebitda: number }[]; overridesAplicados: Record<string, number> };
    expect(sc.overridesAplicados.contratosMidPico).toBe(8);
    expect(sc.delta[0].ebitda).toBeGreaterThan(0);
  });

  it("simular fixa valores fora da faixa e avisa", async () => {
    const r = await call("simular", { base: "realista", overrides: { contratosMidPico: 999 } });
    const sc = r.structuredContent as { overridesAplicados: Record<string, number>; avisos: { key: string }[] };
    expect(sc.overridesAplicados.contratosMidPico).toBe(10); // max do slider
    expect(sc.avisos.some((a) => a.key === "contratosMidPico")).toBe(true);
  });

  it("salvar e ver proposta (store em memória)", async () => {
    const saved = await call("salvar_proposta", {
      nome: "Mais bootcamps", base: "realista", overrides: { bootcampsAno1: 15 }, autor: "sócio",
    });
    const id = (saved.structuredContent as { proposta: { id: string } }).proposta.id;
    expect(id).toMatch(/^prop_/);

    const lista = await call("listar_propostas");
    expect((lista.structuredContent as { total: number }).total).toBeGreaterThanOrEqual(1);

    const ver = await call("ver_proposta", { id });
    expect((ver.structuredContent as { proposta: { nome: string } }).proposta.nome).toBe("Mais bootcamps");
  });

  it("ferramenta desconhecida retorna isError", async () => {
    const r = await call("nao_existe");
    expect(r.isError).toBe(true);
  });
});
