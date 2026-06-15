// ============================================================================
// MCP · Servidor de ferramentas do BP Amplify
// ----------------------------------------------------------------------------
// Núcleo independente de transporte: define as ferramentas e processa mensagens
// JSON-RPC do protocolo MCP. O route handler (app/api/mcp/route.ts) só cuida de
// HTTP, auth e CORS — toda a lógica vive aqui, o que mantém tudo testável.
// ============================================================================
import type { ScenarioKey } from "@/lib/calc";
import { LEVERS, SCENARIO_KEYS, mergeOverrides } from "./schema";
import { summarize, diffSummaries } from "./summary";
import { addProposal, getProposal, listProposals, storageIsDurable } from "./store";

export const SERVER_INFO = { name: "amplify-bp", version: "1.0.0" };
const DEFAULT_PROTOCOL = "2025-06-18";

// ---- JSON-RPC -------------------------------------------------------------
interface RpcRequest { jsonrpc: "2.0"; id?: string | number | null; method: string; params?: Record<string, unknown> }
interface RpcResponse { jsonrpc: "2.0"; id: string | number | null; result?: unknown; error?: { code: number; message: string } }

const ok = (id: RpcRequest["id"], result: unknown): RpcResponse => ({ jsonrpc: "2.0", id: id ?? null, result });
const err = (id: RpcRequest["id"], code: number, message: string): RpcResponse => ({ jsonrpc: "2.0", id: id ?? null, error: { code, message } });

// ---- Definição das ferramentas -------------------------------------------
const isScenario = (v: unknown): v is ScenarioKey => SCENARIO_KEYS.includes(v as ScenarioKey);
const overridesShape = {
  type: "object",
  description: "Mapa de alavanca→valor a sobrescrever sobre o cenário base. Chaves válidas vêm de listar_premissas.",
  additionalProperties: { type: "number" },
} as const;

const TOOLS = [
  {
    name: "listar_premissas",
    description:
      "Lista todas as alavancas do BP (rótulo, grupo, unidade, faixa min/max e o valor em cada cenário base). Use antes de simular para saber o que pode mexer e com quais limites.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "rodar_cenario",
    description: "Roda um cenário base (pessimista, realista ou otimista) e devolve receita, EBITDA e margem por ano, break-even e custos por categoria.",
    inputSchema: {
      type: "object",
      properties: {
        cenario: { type: "string", enum: SCENARIO_KEYS, description: "Cenário base." },
        anoFoco: { type: "integer", minimum: 1, maximum: 3, description: "Ano (1-3) para a quebra de custos. Padrão 1." },
      },
      required: ["cenario"],
      additionalProperties: false,
    },
  },
  {
    name: "simular",
    description:
      "Simula uma variação: parte de um cenário base e aplica overrides nas alavancas. Devolve o resultado e o delta (proposta − base) ano a ano. Valores fora da faixa são fixados no limite e reportados.",
    inputSchema: {
      type: "object",
      properties: {
        base: { type: "string", enum: SCENARIO_KEYS, description: "Cenário base. Padrão: realista." },
        overrides: overridesShape,
        anoFoco: { type: "integer", minimum: 1, maximum: 3, description: "Ano (1-3) para a quebra de custos. Padrão 1." },
      },
      required: ["overrides"],
      additionalProperties: false,
    },
  },
  {
    name: "comparar",
    description: "Compara várias variantes lado a lado (cada uma com seu base e overrides). Devolve receita, EBITDA e margem por ano de cada variante.",
    inputSchema: {
      type: "object",
      properties: {
        variantes: {
          type: "array",
          minItems: 1,
          items: {
            type: "object",
            properties: {
              nome: { type: "string" },
              base: { type: "string", enum: SCENARIO_KEYS },
              overrides: overridesShape,
            },
            required: ["nome"],
            additionalProperties: false,
          },
        },
      },
      required: ["variantes"],
      additionalProperties: false,
    },
  },
  {
    name: "salvar_proposta",
    description: "Salva uma proposta nomeada (cenário base + overrides + nota) para os fundadores revisarem depois. Devolve o id e o resultado calculado.",
    inputSchema: {
      type: "object",
      properties: {
        nome: { type: "string", description: "Nome curto da proposta." },
        autor: { type: "string", description: "Quem propôs (opcional)." },
        nota: { type: "string", description: "Justificativa / contexto (opcional)." },
        base: { type: "string", enum: SCENARIO_KEYS, description: "Cenário base. Padrão: realista." },
        overrides: overridesShape,
      },
      required: ["nome", "overrides"],
      additionalProperties: false,
    },
  },
  {
    name: "listar_propostas",
    description: "Lista as propostas salvas (mais recentes primeiro), com metadados e overrides.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "ver_proposta",
    description: "Mostra uma proposta salva por id e recalcula o resultado atual dela.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string" },
        anoFoco: { type: "integer", minimum: 1, maximum: 3 },
      },
      required: ["id"],
      additionalProperties: false,
    },
  },
] as const;

// ---- Execução das ferramentas ---------------------------------------------
const anoIdx = (a: unknown) => (typeof a === "number" ? a - 1 : 0);

async function execute(name: string, args: Record<string, unknown>): Promise<unknown> {
  switch (name) {
    case "listar_premissas":
      return {
        cenarios: SCENARIO_KEYS,
        alavancas: LEVERS.map((l) => ({
          key: l.key, label: l.label, grupo: l.grupo, unidade: l.unidade,
          min: l.min, max: l.max, step: l.step, base: l.base, hint: l.hint,
        })),
      };

    case "rodar_cenario": {
      if (!isScenario(args.cenario)) throw new Error("cenario inválido");
      const { assumptions } = mergeOverrides(args.cenario, undefined);
      return { cenario: args.cenario, resultado: summarize(assumptions, anoIdx(args.anoFoco)) };
    }

    case "simular": {
      const base: ScenarioKey = isScenario(args.base) ? args.base : "realista";
      const { assumptions, avisos, aplicados } = mergeOverrides(base, args.overrides as Record<string, number>);
      const ano = anoIdx(args.anoFoco);
      const resultado = summarize(assumptions, ano);
      const baseSummary = summarize(mergeOverrides(base, undefined).assumptions, ano);
      return { base, overridesAplicados: aplicados, avisos, resultado, delta: diffSummaries(baseSummary, resultado) };
    }

    case "comparar": {
      const variantes = (args.variantes as { nome: string; base?: ScenarioKey; overrides?: Record<string, number> }[]) ?? [];
      return {
        variantes: variantes.map((v) => {
          const base: ScenarioKey = isScenario(v.base) ? v.base : "realista";
          const { assumptions, avisos } = mergeOverrides(base, v.overrides);
          return { nome: v.nome, base, avisos, anos: summarize(assumptions).anos };
        }),
      };
    }

    case "salvar_proposta": {
      const nome = String(args.nome ?? "").trim();
      if (!nome) throw new Error("nome é obrigatório");
      const base: ScenarioKey = isScenario(args.base) ? args.base : "realista";
      const { assumptions, avisos, aplicados } = mergeOverrides(base, args.overrides as Record<string, number>);
      const proposta = await addProposal({
        nome,
        autor: args.autor ? String(args.autor) : undefined,
        nota: args.nota ? String(args.nota) : undefined,
        cenarioBase: base,
        overrides: aplicados,
      });
      return {
        proposta,
        avisos,
        resultado: summarize(assumptions),
        persistencia: storageIsDurable() ? "durável (Vercel KV)" : "efêmera (memória) — configure KV para persistir",
      };
    }

    case "listar_propostas": {
      const propostas = await listProposals();
      return { total: propostas.length, propostas, persistencia: storageIsDurable() ? "durável" : "efêmera" };
    }

    case "ver_proposta": {
      const p = await getProposal(String(args.id));
      if (!p) throw new Error("proposta não encontrada");
      const { assumptions, avisos } = mergeOverrides(p.cenarioBase, p.overrides);
      return { proposta: p, avisos, resultado: summarize(assumptions, anoIdx(args.anoFoco)) };
    }

    default:
      throw new Error(`ferramenta desconhecida: ${name}`);
  }
}

// ---- Dispatch JSON-RPC ----------------------------------------------------
// Retorna a resposta JSON-RPC, ou null para notificações (sem id).
export async function handleRpc(msg: RpcRequest): Promise<RpcResponse | null> {
  const { method, id } = msg;
  const isNotification = id === undefined || id === null;

  switch (method) {
    case "initialize": {
      const requested = (msg.params?.protocolVersion as string) || DEFAULT_PROTOCOL;
      return ok(id, {
        protocolVersion: requested,
        capabilities: { tools: { listChanged: false } },
        serverInfo: SERVER_INFO,
        instructions:
          "BP vivo da Amplify (planilha v8). Use listar_premissas para descobrir as alavancas, simular/comparar para testar hipóteses e salvar_proposta para registrar uma sugestão aos fundadores.",
      });
    }
    case "ping":
      return ok(id, {});
    case "tools/list":
      return ok(id, { tools: TOOLS });
    case "tools/call": {
      const params = msg.params ?? {};
      const name = params.name as string;
      const args = (params.arguments as Record<string, unknown>) ?? {};
      try {
        const data = await execute(name, args);
        return ok(id, {
          content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
          structuredContent: data,
          isError: false,
        });
      } catch (e) {
        return ok(id, {
          content: [{ type: "text", text: `Erro: ${(e as Error).message}` }],
          isError: true,
        });
      }
    }
    default:
      // Notificações (ex.: notifications/initialized) não exigem resposta.
      if (isNotification) return null;
      return err(id, -32601, `método não suportado: ${method}`);
  }
}

export { TOOLS };
