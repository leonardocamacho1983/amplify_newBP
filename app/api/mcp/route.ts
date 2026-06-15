// ============================================================================
// MCP · Endpoint HTTP (Streamable HTTP, modo stateless)
// ----------------------------------------------------------------------------
// É a URL que o sócio cola na IA dele (Claude, etc.). Cada POST traz uma (ou
// mais) mensagens JSON-RPC do protocolo MCP; respondemos em application/json.
// Stateless de propósito: combina com o ambiente serverless da Vercel.
//
// Auth opcional: defina MCP_TOKEN no ambiente para exigir
//   Authorization: Bearer <MCP_TOKEN>
// Sem MCP_TOKEN o endpoint fica aberto — recomendado só para testes.
// ============================================================================
import { handleRpc } from "@/lib/mcp/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, Mcp-Session-Id, Mcp-Protocol-Version",
  "Access-Control-Expose-Headers": "Mcp-Session-Id, Mcp-Protocol-Version",
  "Access-Control-Max-Age": "86400",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...CORS },
  });

function authorized(req: Request): boolean {
  const token = process.env.MCP_TOKEN;
  if (!token) return true; // aberto se não configurado
  const header = req.headers.get("authorization") || "";
  return header === `Bearer ${token}`;
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

// Sem stream de eventos no modo stateless — clientes caem no POST.
export function GET() {
  return json({ jsonrpc: "2.0", error: { code: -32000, message: "Use POST para JSON-RPC do MCP." }, id: null }, 405);
}

export async function POST(req: Request) {
  if (!authorized(req)) {
    return json({ jsonrpc: "2.0", error: { code: -32001, message: "Não autorizado." }, id: null }, 401);
  }

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return json({ jsonrpc: "2.0", error: { code: -32700, message: "JSON inválido." }, id: null }, 400);
  }

  // Lote ou mensagem única.
  if (Array.isArray(payload)) {
    const responses = (await Promise.all(payload.map((m) => handleRpc(m)))).filter(Boolean);
    if (responses.length === 0) return new Response(null, { status: 202, headers: CORS });
    return json(responses);
  }

  const response = await handleRpc(payload as Parameters<typeof handleRpc>[0]);
  if (!response) return new Response(null, { status: 202, headers: CORS }); // notificação
  return json(response);
}
