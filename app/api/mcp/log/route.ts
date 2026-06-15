// ============================================================================
// GET /api/mcp/log — histórico de simulações registradas
// ----------------------------------------------------------------------------
// Leitura simples para os fundadores revisarem "o que já foi discutido e
// simulado": data, premissas, resultado (snapshot) e justificativa de cada
// registro. Mais recentes primeiro. Sempre sobre o motor v8.
//
//   GET /api/mcp/log            → últimos 20
//   GET /api/mcp/log?limit=50   → últimos 50
//   GET /api/mcp/log?token=...  → alternativa ao header Authorization (se MCP_TOKEN)
// ============================================================================
import { listProposals, storageIsDurable } from "@/lib/mcp/store";
import { ENGINE } from "@/lib/mcp/schema";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...CORS },
  });

function authorized(req: Request, url: URL): boolean {
  const token = process.env.MCP_TOKEN;
  if (!token) return true;
  const header = req.headers.get("authorization") || "";
  return header === `Bearer ${token}` || url.searchParams.get("token") === token;
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  if (!authorized(req, url)) return json({ error: "Não autorizado." }, 401);

  const limit = Math.min(200, Math.max(1, Number(url.searchParams.get("limit")) || 20));
  const todas = await listProposals();
  const registros = todas.slice(0, limit).map((p) => ({
    id: p.id,
    data: p.criadoEm,
    nome: p.nome,
    autor: p.autor,
    justificativa: p.justificativa,
    motor: p.motor,
    cenarioBase: p.cenarioBase,
    premissas: p.overrides,
    extrapolacao: p.extrapolacao,
    resultado: p.resultado,
  }));

  return json({
    motor: ENGINE,
    persistencia: storageIsDurable() ? "durável (Vercel KV)" : "efêmera (memória)",
    total: todas.length,
    mostrando: registros.length,
    registros,
  });
}
