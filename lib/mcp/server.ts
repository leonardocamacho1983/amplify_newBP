// ============================================================================
// MCP · Servidor de ferramentas do BP Amplify
// ----------------------------------------------------------------------------
// Núcleo independente de transporte: define as ferramentas e processa mensagens
// JSON-RPC do protocolo MCP. O route handler (app/api/mcp/route.ts) só cuida de
// HTTP, auth e CORS — toda a lógica vive aqui, o que mantém tudo testável.
// ============================================================================
import type { ScenarioKey } from "@/lib/calc";
import { LEVERS, SCENARIO_KEYS, ENGINE, analyzeOverrides } from "./schema";
import { summarize, diffSummaries } from "./summary";
import { addProposal, getProposal, listProposals, storageIsDurable } from "./store";

export const SERVER_INFO = { name: "amplify-bp", version: "1.0.0", engine: ENGINE };
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
      "Simula uma variação: parte de um cenário base e aplica overrides nas alavancas. Devolve o resultado e o delta (proposta − base) ano a ano. Cada alavanca é classificada em faixa de validade (verde/amarela/vermelha). Se alguma premissa cair na faixa VERMELHA (fora do território testado), a ferramenta NÃO mostra os números: devolve requerConfirmacao=true com os alertas — avise o usuário e, se ele confirmar, chame de novo com confirmarExtrapolacao=true.",
    inputSchema: {
      type: "object",
      properties: {
        base: { type: "string", enum: SCENARIO_KEYS, description: "Cenário base. Padrão: realista." },
        overrides: overridesShape,
        anoFoco: { type: "integer", minimum: 1, maximum: 3, description: "Ano (1-3) para a quebra de custos. Padrão 1." },
        confirmarExtrapolacao: { type: "boolean", description: "Defina true para calcular mesmo com premissas na faixa vermelha (fora do território testado)." },
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
    description: "Registra uma simulação relevante (cenário base + overrides + justificativa) com data e snapshot do resultado, para os fundadores revisarem depois. Use quando o sócio pedir para 'salvar', 'registrar' ou 'guardar' uma simulação. Devolve o id. Também legível em GET /api/mcp/log.",
    inputSchema: {
      type: "object",
      properties: {
        nome: { type: "string", description: "Nome curto da simulação." },
        autor: { type: "string", description: "Quem propôs (opcional)." },
        justificativa: { type: "string", description: "Por que isso é relevante — campo livre (opcional, mas recomendado)." },
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
        motor: ENGINE,
        cenarios: SCENARIO_KEYS,
        legendaFaixas: {
          verde: "dentro do intervalo dos cenários (modelo validado)",
          amarela: "fora dos cenários, mas dentro da faixa plausível do painel",
          vermelha: "fora do painel — território não testado (extrapolação)",
        },
        alavancas: LEVERS.map((l) => ({
          key: l.key, label: l.label, grupo: l.grupo, unidade: l.unidade, step: l.step,
          base: l.base, hint: l.hint,
          faixaValidada: l.validado,   // verde [min, max]
          faixaPlausivel: l.plausivel, // amarela até estes limites
        })),
      };

    case "rodar_cenario": {
      if (!isScenario(args.cenario)) throw new Error("cenario inválido");
      const { assumptions } = analyzeOverrides(args.cenario, undefined);
      return { motor: ENGINE, cenario: args.cenario, resultado: summarize(assumptions, anoIdx(args.anoFoco)) };
    }

    case "simular": {
      const base: ScenarioKey = isScenario(args.base) ? args.base : "realista";
      const an = analyzeOverrides(base, args.overrides as Record<string, number>);
      // Faixa vermelha sem confirmação: não mostra números, pede confirmação.
      if (an.vermelhas.length && args.confirmarExtrapolacao !== true) {
        return {
          motor: ENGINE,
          requerConfirmacao: true,
          mensagem:
            "Há premissas fora do território testado (faixa vermelha). Avise o usuário e, se ele confirmar, chame de novo com confirmarExtrapolacao=true.",
          alertasVermelhos: an.vermelhas,
          alertasAmarelos: an.amarelas,
          avisos: an.avisos,
          resultado: null,
        };
      }
      const ano = anoIdx(args.anoFoco);
      const resultado = summarize(an.assumptions, ano);
      const baseSummary = summarize(analyzeOverrides(base, undefined).assumptions, ano);
      return {
        motor: ENGINE, base,
        overridesAplicados: an.aplicados, faixas: an.bands,
        alertasAmarelos: an.amarelas, alertasVermelhos: an.vermelhas, avisos: an.avisos,
        extrapolacao: an.vermelhas.length > 0,
        resultado, delta: diffSummaries(baseSummary, resultado),
      };
    }

    case "comparar": {
      const variantes = (args.variantes as { nome: string; base?: ScenarioKey; overrides?: Record<string, number> }[]) ?? [];
      return {
        motor: ENGINE,
        variantes: variantes.map((v) => {
          const base: ScenarioKey = isScenario(v.base) ? v.base : "realista";
          const an = analyzeOverrides(base, v.overrides);
          return {
            nome: v.nome, base, anos: summarize(an.assumptions).anos,
            faixas: an.bands, extrapolacao: an.vermelhas.length > 0,
            alertas: [...an.vermelhas, ...an.amarelas].map((a) => a.mensagem),
          };
        }),
      };
    }

    case "salvar_proposta": {
      const nome = String(args.nome ?? "").trim();
      if (!nome) throw new Error("nome é obrigatório");
      const base: ScenarioKey = isScenario(args.base) ? args.base : "realista";
      const an = analyzeOverrides(base, args.overrides as Record<string, number>);
      const resumo = summarize(an.assumptions);
      const proposta = await addProposal({
        nome,
        autor: args.autor ? String(args.autor) : undefined,
        justificativa: args.justificativa ? String(args.justificativa) : undefined,
        cenarioBase: base,
        overrides: an.aplicados,
        motor: ENGINE,
        extrapolacao: an.vermelhas.length > 0,
        resultado: { anos: resumo.anos, breakEven: { status: resumo.breakEven.status, mes: resumo.breakEven.mes } },
      });
      return {
        registro: proposta,
        alertasVermelhos: an.vermelhas, alertasAmarelos: an.amarelas, avisos: an.avisos,
        resultado: resumo,
        persistencia: storageIsDurable() ? "durável (Vercel KV)" : "efêmera (memória) — configure KV para persistir",
      };
    }

    case "listar_propostas": {
      const propostas = await listProposals();
      return { motor: ENGINE, total: propostas.length, propostas, persistencia: storageIsDurable() ? "durável" : "efêmera" };
    }

    case "ver_proposta": {
      const p = await getProposal(String(args.id));
      if (!p) throw new Error("proposta não encontrada");
      const an = analyzeOverrides(p.cenarioBase, p.overrides);
      return { motor: ENGINE, registro: p, alertas: [...an.vermelhas, ...an.amarelas], resultadoAtual: summarize(an.assumptions, anoIdx(args.anoFoco)) };
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
          "BP vivo da Amplify — motor v8 (a planilha é a fonte de verdade). Use listar_premissas para descobrir as alavancas e suas faixas de validade, simular/comparar para testar hipóteses e salvar_proposta para registrar uma simulação relevante aos fundadores. " +
          "Faixas de validade: verde = validado pelos cenários; amarela = extrapolação razoável; vermelha = fora do território testado. Se simular devolver requerConfirmacao=true, avise o usuário sobre a extrapolação e só prossiga (confirmarExtrapolacao=true) se ele confirmar. As simulações registradas ficam legíveis em GET /api/mcp/log.",
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
