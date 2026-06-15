import "../content.css";
import "./mcp.css";
import Reveal from "../components/Reveal";
import EndpointBox from "./EndpointBox";

export const metadata = { title: "MCP para sócios · Amplify" };

const TOOLS = [
  { name: "listar_premissas", desc: "Lista todas as alavancas do BP: rótulo, grupo, unidade, faixa min/max e o valor em cada cenário base." },
  { name: "rodar_cenario", desc: "Roda pessimista / realista / otimista — receita, EBITDA e margem por ano, break-even e custos por categoria." },
  { name: "simular", desc: "Parte de um cenário base e aplica suas mudanças; devolve o resultado e o delta (proposta − base) ano a ano." },
  { name: "comparar", desc: "Coloca várias variantes lado a lado para decidir entre alavancas." },
  { name: "salvar_proposta", desc: "Salva uma proposta nomeada (base + mudanças + nota) para os fundadores revisarem depois." },
  { name: "listar_propostas", desc: "Lista as propostas salvas, mais recentes primeiro." },
  { name: "ver_proposta", desc: "Abre uma proposta por id e recalcula o resultado atual dela." },
];

const ASKS = [
  "Liste as alavancas do BP e seus limites.",
  "E se a gente fechar 8 contratos mid por mês em vez de 3? Como fica o EBITDA?",
  "Compara dobrar os bootcamps vs. acelerar a rede de Amplifiers.",
  "Salva isso como proposta 'Foco em comunidade' pra eu mostrar aos fundadores.",
];

export default function McpPage() {
  return (
    <div className="page">
      {/* BLOCO 1 — o que é */}
      <section className="block">
        <span className="eyebrow">MCP · conecte sua IA ao BP</span>
        <h2>Converse com o BP pela <span className="cy serif-em">sua própria IA</span>.</h2>
        <div className="body-col">
          <p>
            O mesmo motor por trás do <strong>BP vivo</strong> (planilha v8) agora fala com qualquer IA via
            MCP. Você pluga uma URL no seu Claude, pergunta em linguagem natural — <em>“e se a gente
            dobrar os bootcamps?”</em> — e recebe os <strong>números reais do modelo</strong>, não chutes.
            Dá pra simular, comparar e <strong>salvar propostas</strong> para os fundadores revisarem.
          </p>
        </div>
        <EndpointBox />
        <div className="note" style={{ marginTop: 20 }}>
          <b>Acesso.</b> Se o endpoint estiver protegido por token, informe-o como header
          <code> Authorization: Bearer &lt;token&gt;</code> ao adicionar o conector. Peça o token a um fundador.
        </div>
      </section>

      {/* BLOCO 2 — como conectar */}
      <Reveal>
        <section className="block">
          <h3>Como conectar — 3 passos</h3>
          <div className="steps">
            <div className="step">
              <div className="snum">1</div>
              <h3>Copie a URL</h3>
              <p>Use o botão <code>copiar</code> acima. É o endereço do conector MCP remoto deste deploy.</p>
            </div>
            <div className="step">
              <div className="snum">2</div>
              <h3>Adicione na sua IA</h3>
              <p>No Claude: <code>Configurações → Connectors → Add custom connector</code> e cole a URL.</p>
              <p>Em outros clientes, registre um servidor MCP remoto com a mesma URL.</p>
            </div>
            <div className="step">
              <div className="snum">3</div>
              <h3>Pergunte</h3>
              <p>Fale com a IA normalmente. Ela chama as ferramentas do BP e traz os números calculados.</p>
            </div>
          </div>
        </section>
      </Reveal>

      {/* BLOCO 3 — exemplos */}
      <Reveal>
        <section className="block">
          <h3>O que dá pra pedir</h3>
          <p className="lead" style={{ marginTop: 10 }}>
            Linguagem natural. A IA traduz para as alavancas e devolve o impacto no EBITDA.
          </p>
          <div className="asks">
            {ASKS.map((a) => <div className="ask" key={a}>“{a}”</div>)}
          </div>
        </section>
      </Reveal>

      {/* BLOCO 4 — ferramentas */}
      <Reveal>
        <section className="block">
          <h3>As ferramentas disponíveis</h3>
          <p className="lead" style={{ marginTop: 10 }}>
            Sete ferramentas. Você não precisa decorá-las — a IA escolhe sozinha. Estão aqui só para você saber o alcance.
          </p>
          <div className="matrix">
            {TOOLS.map((t) => (
              <div className="mrow" key={t.name}>
                <div className="mh"><span className="badge mute">{t.name}</span></div>
                <div className="mb">{t.desc}</div>
              </div>
            ))}
          </div>
          <div className="note">
            <b>Limites respeitados.</b> Se você pedir um valor fora da faixa de uma alavanca, o modelo fixa no
            limite e avisa — ninguém simula o impossível. A planilha v8 segue sendo a fonte de verdade.
          </div>
        </section>
      </Reveal>
    </div>
  );
}
