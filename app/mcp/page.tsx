import "../content.css";
import "./mcp.css";
import Reveal from "../components/Reveal";
import EndpointBox from "./EndpointBox";
import StarterQuestions from "./StarterQuestions";

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

      {/* BLOCO 3 — por onde começar (perguntas prontas) */}
      <Reveal>
        <section className="block">
          <h3>Por onde começar</h3>
          <p className="lead" style={{ marginTop: 10 }}>
            Seis perguntas prontas. Clique para copiar e cole direto no Claude — depois é só seguir a conversa.
          </p>
          <StarterQuestions />
        </section>
      </Reveal>

      {/* BLOCO 3.5 — faixas de validade */}
      <Reveal>
        <section className="block">
          <h3>Até onde o modelo foi testado</h3>
          <p className="lead" style={{ marginTop: 10 }}>
            Cada alavanca tem uma faixa de validade. Se você extrapolar, o MCP avisa antes de mostrar o número.
          </p>
          <div className="bands">
            <div className="band verde"><span className="bdot" /><b>Verde</b><span>Dentro dos cenários — modelo validado.</span></div>
            <div className="band amarela"><span className="bdot" /><b>Amarela</b><span>Extrapolação razoável, dentro do plausível.</span></div>
            <div className="band vermelha"><span className="bdot" /><b>Vermelha</b><span>Fora do território testado — o MCP pede confirmação.</span></div>
          </div>
          <div className="note">
            <b>Exemplo.</b> Ao simular 15 contratos mid/mês (validado até 5), o Claude responde algo como:
            <em> “este resultado é uma extrapolação fora do que foi testado — quer continuar?”</em> Só calcula
            depois que você confirma.
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
            <b>Histórico para os fundadores.</b> Quando você pede para salvar uma simulação, ela fica registrada
            com data, premissas, resultado e a sua justificativa. Os fundadores revisam tudo em
            <code> /api/mcp/log</code>. Motor atual: <b>v8</b> — quando o v9 chegar, ele ganha um endpoint próprio
            e o v8 continua acessível para comparação.
          </div>
        </section>
      </Reveal>
    </div>
  );
}
