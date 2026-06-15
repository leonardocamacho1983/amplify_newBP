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
              <div className="ftag">TAM · universo total</div>
              <div className="fval">Médias empresas não-tech no Brasil</div>
              <div className="fdesc">Indústria, varejo, serviços, saúde, construção, educação — faturamento ~R$ 4,8M a R$ 300M.</div>
            </div>
          </div>
          <div className="fconn">↓</div>
          <div className="frow">
            <div className="fbar" style={{ width: "78%" }}>
              <div className="ftag">SAM · mercado endereçável</div>
              <div className="fval">As que já sentem a pressão da cadeia</div>
              <div className="fdesc">Concorrente, cliente e fornecedor já usam IA. Maturidade digital média a alta; orçamento de capacitação existente.</div>
            </div>
          </div>
          <div className="fconn">↓</div>
          <div className="frow">
            <div className="fbar" style={{ width: "52%" }}>
              <div className="ftag">SOM · alcançável agora</div>
              <div className="fval">As que travaram no piloto</div>
              <div className="fdesc">Já testaram, viram valor e não escalaram. Dor + referência, sem solução interna. O coração do funil de venda.</div>
            </div>
          </div>
        </div>

        <div className="note">
          <b>Dimensionamento em R$.</b> Os tamanhos absolutos (número de empresas e valor por degrau) ainda
          precisam ser fechados com a fonte de dados oficial — esta tela traz a estrutura do funil; os números
          entram quando validados, sem estimativa inventada.
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
