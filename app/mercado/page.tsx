import "../content.css";
import Reveal from "../components/Reveal";

export const metadata = { title: "Mercado · Amplify" };

export default function Mercado() {
  return (
    <div className="page">
      <section className="block">
        <span className="eyebrow">Mercado · TAM / SAM / SOM</span>
        <h2>Onde o dinheiro está — e qual fração é nossa.</h2>
        <div className="body-col">
          <p>
            O mercado se lê como um funil: do universo total de empresas que poderiam comprar, para as que se
            encaixam no nosso método, até as que estão prontas para comprar agora. Cada degrau é mais estreito,
            mas mais qualificado.
          </p>
        </div>

        <div className="funnel">
          <div className="frow">
            <div className="fbar" style={{ width: "100%" }}>
              <div className="ftag">TAM · universo total <span className="est">estimativa por triangulação</span></div>
              <div className="fbig"><span className="cy">~45 mil</span> médias empresas não-tech no Brasil</div>
              <div className="fsub"><span className="cy">~R$ 5–6 bi</span></div>
              <div className="fdesc">Indústria, varejo, serviços, saúde, construção, educação — faturamento ~R$ 4,8M a R$ 300M.</div>
            </div>
          </div>
          <div className="fconn">↓</div>
          <div className="frow">
            <div className="fbar" style={{ width: "76%" }}>
              <div className="ftag">SAM · mercado endereçável <span className="est">estimativa por triangulação</span></div>
              <div className="fbig"><span className="cy">~13 mil</span> empresas da persona</div>
              <div className="fsub"><span className="cy">~R$ 1,5–1,8 bi</span></div>
              <div className="fdesc">Já sentem a pressão da cadeia; maturidade digital média a alta.</div>
            </div>
          </div>
          <div className="fconn">↓</div>
          <div className="frow">
            <div className="fbar" style={{ width: "54%" }}>
              <div className="ftag">SOM · mercado servível <span className="est">estimativa por triangulação</span></div>
              <div className="fbig"><span className="cy">~1,5–2 mil</span> empresas</div>
              <div className="fsub"><span className="cy">~R$ 180–250 mi</span></div>
              <div className="fdesc">As que travaram no piloto: têm dor, referência e estão no momento de compra.</div>
            </div>
          </div>
          <div className="fconn">↓</div>
          <div className="frow">
            <div className="fbar" style={{ width: "34%" }}>
              <div className="ftag">Meta ano 1 · captura realista <span className="est">meta</span></div>
              <div className="fbig"><span className="cy">~R$ 7–8 mi</span></div>
              <div className="fsub">Captura do ano 1.</div>
              <div className="fdesc">Limitado por capacidade de aquisição e entrega, não por mercado.</div>
            </div>
          </div>
        </div>

        <div className="note">
          <b>Mercado nunca é o gargalo.</b> A meta do ano 1 é <strong>~3–4% do SOM</strong> e <strong>~0,5%
          do SAM</strong> — há mercado de sobra. O que limita o crescimento é a <strong>capacidade de aquisição
          e de entrega</strong>, não o tamanho do mercado. Dimensionamento por triangulação de fontes públicas
          (Sebrae, IBGE, BNDES).
        </div>
      </section>

      <Reveal>
        <section className="block">
          <h3>Por que o SOM é o melhor lugar para começar</h3>
          <div className="grid3">
            <div className="cell"><h3>Já tem dor</h3><p>Cruzou o limiar que faz comprar. Não precisa ser convencido de que IA funciona — precisa de método para escalar.</p></div>
            <div className="cell"><h3>Ciclo mais curto</h3><p>Prova de valor interna encurta a venda. A objeção é de execução, não de crença.</p></div>
            <div className="cell"><h3>Ainda no mercado</h3><p>Não investiu o suficiente para montar capacidade interna e sair. A janela de compra está aberta.</p></div>
          </div>
        </section>
      </Reveal>
    </div>
  );
}
