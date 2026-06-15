// ============================================================================
// MCP · Armazenamento de propostas
// ----------------------------------------------------------------------------
// Onde ficam as propostas que os sócios salvam. Dois modos, escolhidos por
// ambiente, sem mudar o código:
//   • Vercel KV / Upstash Redis  — se KV_REST_API_URL + KV_REST_API_TOKEN
//     estiverem definidos (durável, compartilhado entre os sócios).
//   • Memória do processo         — fallback de desenvolvimento (efêmero:
//     some quando o lambda recicla). Bom para testar, não para produção.
// Persistimos a coleção inteira sob uma única chave JSON — volume é baixo
// (algumas propostas) e mantém a implementação simples.
// ============================================================================
import type { ScenarioKey } from "@/lib/calc";
import type { YearSummary } from "./summary";

export interface Proposal {
  id: string;
  nome: string;
  autor?: string;
  /** justificativa livre — "por que isso é relevante" */
  justificativa?: string;
  cenarioBase: ScenarioKey;
  overrides: Record<string, number>;
  /** snapshot do resultado no momento do registro (preserva o que foi visto,
   *  mesmo que o motor evolua para v9 depois) */
  resultado?: { anos: YearSummary[]; breakEven: { status: string; mes: number | null } };
  /** motor de cálculo usado (hoje sempre "v8") */
  motor: string;
  /** true se alguma premissa estava fora do território testado (faixa vermelha) */
  extrapolacao: boolean;
  criadoEm: string; // ISO
}

const KEY = "bp:proposals";

interface Store {
  list(): Promise<Proposal[]>;
  save(list: Proposal[]): Promise<void>;
  durable: boolean;
}

// ---- Vercel KV / Upstash via REST (sem dependência extra) -----------------
function kvStore(url: string, token: string): Store {
  const cmd = async <T>(command: unknown[]): Promise<T> => {
    const res = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(command),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`KV ${res.status}: ${await res.text()}`);
    const { result } = (await res.json()) as { result: T };
    return result;
  };
  return {
    durable: true,
    async list() {
      const raw = await cmd<string | null>(["GET", KEY]);
      if (!raw) return [];
      try { return JSON.parse(raw) as Proposal[]; } catch { return []; }
    },
    async save(list) {
      await cmd(["SET", KEY, JSON.stringify(list)]);
    },
  };
}

// ---- Fallback em memória --------------------------------------------------
const memory: { list: Proposal[] } = { list: [] };
const memStore: Store = {
  durable: false,
  async list() { return memory.list; },
  async save(list) { memory.list = list; },
};

function getStore(): Store {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (url && token) return kvStore(url, token);
  return memStore;
}

export const storageIsDurable = () => getStore().durable;

export async function listProposals(): Promise<Proposal[]> {
  const list = await getStore().list();
  return [...list].sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));
}

export async function getProposal(id: string): Promise<Proposal | undefined> {
  return (await getStore().list()).find((p) => p.id === id);
}

export async function addProposal(p: Omit<Proposal, "id" | "criadoEm">): Promise<Proposal> {
  // (id e timestamp gerados no servidor)
  const store = getStore();
  const list = await store.list();
  const proposal: Proposal = {
    ...p,
    id: `prop_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
    criadoEm: new Date().toISOString(),
  };
  await store.save([...list, proposal]);
  return proposal;
}
