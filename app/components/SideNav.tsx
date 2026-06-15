"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", idx: "00", label: "Capa" },
  { href: "/persona", idx: "01", label: "Persona & ICP" },
  { href: "/marca", idx: "02", label: "Marca & estratégia" },
  { href: "/mercado", idx: "03", label: "Mercado" },
  { href: "/modelo", idx: "04", label: "Modelo de negócio" },
  { href: "/gtm", idx: "05", label: "GTM & Funil" },
  { href: "/bp", idx: "06", label: "BP vivo" },
  { href: "/mcp", idx: "07", label: "MCP para sócios" },
];

export default function SideNav() {
  const path = usePathname();
  return (
    <nav className="sidenav">
      <Link href="/" className="brand">
        <span className="row">
          <span className="dot" />
          <strong>Amplify</strong>
        </span>
        <small>Sala de decisão</small>
      </Link>
      <div className="navlist">
        {NAV.map((n) => {
          const active = n.href === "/" ? path === "/" : path.startsWith(n.href);
          return (
            <Link key={n.href} href={n.href} className={`navlink${active ? " active" : ""}`}>
              <span className="nidx">{n.idx}</span>
              <span>{n.label}</span>
            </Link>
          );
        })}
      </div>
      <div className="foot">
        Documento interno · 2026
        <br />
        Confidencial — sócios
      </div>
    </nav>
  );
}
