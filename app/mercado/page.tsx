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
              <div className="fbig"><span className="cy">~45 mil</span> médias empresas no Brasil</div>
              <div className="fsub"><span className="cy">~R$ 5–6 bi</span> a um ticket médio de programa de ~R$ 130k/ano</div>
              <div className="fdesc">Indústria, varejo, serviços, saúde, construção, educação — faturamento ~R$ 4,8M a R$ 300M.</div>
            </div>
          </div>
          <div className="fconn">↓</div>
          <div className="frow">
            <div className="fbar" style={{ width: "78%" }}>
              <div className="ftag">SAM · mercado endereçável <span className="est">estimativa por triangulação</span></div>
              <div className="fbig"><span className="cy">~13 mil</span> empresas não-tech da persona</div>
              <div className="fsub"><span className="cy">~R$ 1,5–1,8 bi</span> de mercado endereçável</div>
              <div className="fdesc">Já sentem a pressão da cadeia; maturidade digital média a alta e orçamento de capacitação existente.</div>
            </div>
          </div>
          <div className="fconn">↓</div>
          <div className="frow">
            <div className="fbar" style={{ width: "52%" }}>
              <div className="ftag">SOM · alcançável agora <span className="est">ano 1</span></div>
              <div className="fbig"><span className="cy">~R$ 7–8 mi</span> no ano 1</div>
              <div className="fsub">Limitado por <strong>capacidade de aquisição e entrega</strong> — não por mercado.</div>
              <div className="fdesc">As que travaram no piloto: dor + referência, sem solução interna. O coração do funil de venda.</div>
            </div>
          </div>
        </div>

        <div className="note">
          <b>Mercado nunca é o gargalo.</b> O dimensionamento vem da triangulação de fontes públicas (Sebrae,
          IBGE, BNDES). O ponto-chave: o SOM do ano 1 é <strong>menos de 0,5% do SAM</strong> — ou seja, há
          mercado de sobra. O que limita o crescimento é a <strong>capacidade de aquisição e de entrega</strong>,
          não o tamanho do mercado. Números marcados como estimativa por triangulação.
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
