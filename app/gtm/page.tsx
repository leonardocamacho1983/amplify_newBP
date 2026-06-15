import "../content.css";
import Reveal from "../components/Reveal";

export const metadata = { title: "GTM & Funil · Amplify" };

const FUNNEL = [
  { num: "~6.000", label: "Leads / ano (~500/mês)", w: "100%", rate: null },
  { num: "1.200", label: "MQL", w: "78%", rate: "20%" },
  { num: "300", label: "Oportunidades", w: "57%", rate: "25%" },
  { num: "120", label: "Propostas", w: "40%", rate: "40%" },
  { num: "~54", label: "Programas fechados", w: "27%", rate: "45%" },
];

const SOURCES = [
  "Bootcamp e masterclass",
  "Eventos do LIDE",
  "Plano Starter da Comunidade",
  "Shockwave (B2C)",
  "Conteúdo / inbound",
  "Indicação",
];

export default function Gtm() {
  return (
    <div className="page">
      {/* BLOCO 1 — virada de estratégia */}
      <section className="block">
        <span className="eyebrow">GTM · a virada de estratégia</span>
        <h2>De um catálogo de produtos a uma <span className="cy serif-em">jornada</span>.</h2>
        <div className="body-col">
          <p>
            A mudança não é de portfólio — é de lógica. Os produtos são os mesmos; o que muda é como se
            encaixam. Em vez de vender itens soltos que competem entre si pela atenção do cliente, vendemos
            uma <strong>jornada única em que cada produto é um degrau</strong> de ascensão de valor.
          </p>
        </div>
        <div className="beforeafter">
          <div className="ba-col before">
            <div className="bah">Antes · catálogo</div>
            <h3>Produtos soltos competindo entre si</h3>
            <ul>
              <li>Bootcamp vendido como item avulso</li>
              <li>Consultoria como projeto isolado</li>
              <li>Comunidade como assinatura à parte</li>
              <li>Automação como serviço pontual</li>
              <li>O cliente escolhe um e a relação termina ali</li>
            </ul>
          </div>
          <div className="ba-arrow">→</div>
          <div className="ba-col after">
            <div className="bah">Depois · jornada</div>
            <h3>Cada produto é um degrau da mesma escada</h3>
            <ul>
              <li>Educação grátis atrai e qualifica</li>
              <li>Capacitação paga é a porta que se autofinancia</li>
              <li>Programa de transformação é o motor recorrente</li>
              <li>Comunidade sustenta a operação no dia a dia</li>
              <li>A mesma capacidade, reorganizada para ascensão de valor</li>
            </ul>
          </div>
        </div>
      </section>

      {/* BLOCO 2 — educação como porta de entrada */}
      <Reveal>
        <section className="block">
          <h3>Educação como porta de entrada</h3>
          <p className="lead" style={{ marginTop: 10 }}>
            A educação gratuita é o ímã, a capacitação paga é a porta que se autofinancia, a jornada é o destino.
          </p>
          <div className="ladder">
            <div className="rung free">
              <div className="rnum">01</div>
              <div className="rbody">
                <h3>Experiências educativas grátis</h3>
                <p>Usamos nosso potencial educacional para criar degustação que atrai e captura leads. É o topo de marketing — não gera receita, é custo de aquisição.</p>
              </div>
              <span className="rtag cost">topo de marketing · custo</span>
            </div>
            <div className="rung paid">
              <div className="rnum">02</div>
              <div className="rbody">
                <h3>Capacitação aberta paga</h3>
                <p>Bootcamps, workshops e palestras: a porta de entrada que já gera receita <strong>e</strong> qualifica quem entra. Topo de vendas que se autofinancia.</p>
              </div>
              <span className="rtag">topo de vendas · receita</span>
            </div>
            <div className="rung journey">
              <div className="rnum">03</div>
              <div className="rbody">
                <h3>A jornada completa</h3>
                <p>O programa de transformação recorrente — o motor do negócio. É o destino para onde os degraus anteriores conduzem.</p>
              </div>
              <span className="rtag">motor · recorrente</span>
            </div>
          </div>
        </section>
      </Reveal>

      {/* BLOCO 2.5 — precificação */}
      <Reveal>
        <section className="block">
          <h3>O preço de cada degrau</h3>
          <p className="lead" style={{ marginTop: 10 }}>
            Dos R$ 1.800 de um bootcamp aos seis dígitos do programa anual — é a mesma jornada subindo de ticket.
          </p>
          <div className="pricing">
            <div className="price-row">
              <div className="pr-tag">a porta</div>
              <div className="pr-body">
                <h4>Capacitação aberta</h4>
                <p>Bootcamp <b>R$ 1.800</b>/pessoa · palestra, workshop, meet-up <b>~R$ 12–16k</b>/evento</p>
              </div>
              <div className="pr-note">topo de vendas,<br />se autofinancia</div>
            </div>
            <div className="price-row">
              <div className="pr-tag">continuidade</div>
              <div className="pr-body">
                <h4>Comunidade</h4>
                <p>Club <b>R$ 4.000</b>/mês · Start <b>R$ 600</b>/mês · Expert <b>R$ 350</b>/mês</p>
              </div>
              <div className="pr-note">recorrência de baixo ticket,<br />alta retenção</div>
            </div>
            <div className="price-row">
              <div className="pr-tag">entrada no programa</div>
              <div className="pr-body">
                <h4>Piloto trimestral</h4>
                <p><b>R$ 40–120k</b> por trimestre</p>
              </div>
              <div className="pr-note">porta mais curta<br />para a transformação</div>
            </div>
            <div className="price-row anchor">
              <div className="pr-tag">o motor</div>
              <div className="pr-body">
                <h4>Programa de Transformação</h4>
                <p>Tier mid <b>R$ 80–250k</b>/ano · tier topo <b>R$ 300–600k</b>/ano · faturado por trimestre, comunidade inclusa</p>
              </div>
              <div className="pr-note">recorrente,<br />âncora do modelo</div>
            </div>
          </div>
          <div className="note">
            <b>A ascensão é a tese.</b> O cliente entra barato pela educação, prova valor na capacitação paga e
            ascende ao programa recorrente — o motor. Cada degrau financia e qualifica o seguinte.
          </div>
        </section>
      </Reveal>

      {/* BLOCO 3 — funil com volume */}
      <Reveal>
        <section className="block">
          <h3>O funil de vendas com volume</h3>
          <p className="lead" style={{ marginTop: 10 }}>
            A matemática reversa, de cima para baixo: quantos leads no topo sustentam quantos programas no fim.
          </p>
          <div className="vfunnel">
            {FUNNEL.map((s, i) => (
              <div key={s.label} style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
                {i > 0 && (
                  <div className="vconv">
                    <span>↓</span>
                    <span className="vrate">{s.rate}</span>
                    <span>de conversão</span>
                  </div>
                )}
                <div className="vstage">
                  <div className="vbar" style={{ width: s.w }}>
                    <div className="vnum">{s.num}</div>
                    <div className="vlabel">{s.label}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <h3 style={{ marginTop: 48, fontSize: 18 }}>Fontes de topo de funil</h3>
          <div className="chips">
            {SOURCES.map((s) => <span key={s}>{s}</span>)}
          </div>

          <div className="note">
            <b>O gargalo real é o topo.</b> O número de leads/mês é o driver de toda a aquisição: as taxas de
            conversão são relativamente estáveis, então é o volume de entrada que determina quantos programas
            fecham no fim. Crescer significa, antes de tudo, alimentar o topo.
          </div>
        </section>
      </Reveal>
    </div>
  );
}
