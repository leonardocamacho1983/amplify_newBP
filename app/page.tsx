import Link from "next/link";
import "./content.css";

export default function Capa() {
  return (
    <div className="page capa">
      <div className="ring" aria-hidden />
      <div style={{ position: "relative", zIndex: 2 }}>
        <span className="eyebrow">Sala de decisão · 2026</span>
        <h1>
          Inteligência como <span className="cy">capacidade da empresa</span> — e um plano para chegar lá.
        </h1>
        <p className="lead">
          Documento interno dos sócios. Persona, marca, mercado e modelo de negócio — e um BP vivo onde as
          premissas viram receita, custo e EBITDA em tempo real, nos três cenários.
        </p>
        <Link href="/bp" className="enter">Abrir o BP vivo →</Link>
        <div className="links">
          <Link href="/persona">01 · Persona &amp; ICP</Link>
          <Link href="/marca">02 · Marca &amp; estratégia</Link>
          <Link href="/mercado">03 · Mercado</Link>
          <Link href="/modelo">04 · Modelo de negócio</Link>
          <Link href="/gtm">05 · GTM &amp; Funil</Link>
          <Link href="/bp">06 · BP vivo</Link>
        </div>
      </div>
    </div>
  );
}
