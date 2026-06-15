"use client";

import { useState, useSyncExternalStore } from "react";

// Lê a origem atual sem efeito (evita cascata de render): no servidor cai no
// placeholder, no cliente vira a URL real do deploy.
const subscribe = () => () => {};

export default function EndpointBox() {
  const origin = useSyncExternalStore(
    subscribe,
    () => window.location.origin,
    () => ""
  );
  const url = origin ? `${origin}/api/mcp` : "https://seu-deploy.vercel.app/api/mcp";
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard indisponível — usuário copia manualmente */
    }
  };

  return (
    <div className="endpoint">
      <span className="ep-label">Endpoint MCP</span>
      <code className="ep-url">{url}</code>
      <button className="ep-copy" onClick={copy}>{copied ? "copiado ✓" : "copiar"}</button>
    </div>
  );
}
