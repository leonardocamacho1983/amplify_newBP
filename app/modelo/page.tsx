import "../content.css";
import Reveal from "../components/Reveal";

export const metadata = { title: "Modelo de negócio · Amplify" };

export default function Modelo() {
  return (
    <div className="page">
      <section className="block">
        <span className="eyebrow">Modelo de negócio · a jornada</span>
        <h2>Quatro quadrantes em looping contínuo.</h2>
        <div className="body-col">
          <p>
            A jornada não é uma escada com fim — é um infinito. O cliente entra pela curiosidade, ganha método,
            opera com a IA e colhe resultado; o resultado realimenta novas frentes. Cada quadrante tem um produto
            que o sustenta.
          </p>
        </div>

        <div className="quads">
          <div className="quad">
            <div className="qn">01 · Atrair</div>
            <h3>Curiosidade</h3>
            <p>Conteúdo e cursos grátis capturam o lead; capacitação aberta paga (bootcamp, palestra, meet-up) é o topo de vendas que já gera receita e converte para o programa.</p>
          </div>
          <div className="quad">
            <div className="qn">02 · Capacitar</div>
            <h3>Método</h3>
            <p>O Programa de Transformação (dois tiers) instala o método. É o motor recorrente: absorve assessoria de IA e workshops do cliente ativo.</p>
          </div>
          <div className="quad">
            <div className="qn">03 · Implementar</div>
            <h3>Operação</h3>
            <p>A IA entra na rotina. A comunidade (Club, Start, Expert) sustenta a operação no dia a dia com suporte e troca — recorrência de baixo ticket e alta retenção.</p>
          </div>
          <div className="quad">
            <div className="qn">04 · Escalar</div>
            <h3>Resultado</h3>
            <p>A rede de Amplifiers leva o método a mais empresas; produtos parceiros ampliam o alcance. O resultado de um cliente vira prova social para o próximo.</p>
          </div>
        </div>
        <div className="flow" style={{ marginTop: 28 }}>
          <span>Curiosidade</span><span className="arr">→</span>
          <span>Método</span><span className="arr">→</span>
          <span>Operação</span><span className="arr">→</span>
          <span>Resultado</span><span className="arr">∞</span>
        </div>
      </section>

      <Reveal>
        <section className="block">
          <h3>As fontes de receita</h3>
          <p className="lead" style={{ marginTop: 10 }}>
            O que entra no modelo financeiro — e o que é canal ou marketing, não receita direta.
          </p>
          <div className="revsrc">
            <div className="rr">
              <span className="rname">Programa de Transformação</span>
              <span className="rdesc">Motor recorrente, dois tiers. Âncora do modelo; absorve assessoria e workshops do cliente ativo.</span>
              <span className="rtag">receita · âncora</span>
            </div>
            <div className="rr">
              <span className="rname">Capacitação aberta paga</span>
              <span className="rdesc">Bootcamp, workshop, palestra, meet-up. Topo de vendas: gera receita e converte para o programa.</span>
              <span className="rtag">receita</span>
            </div>
            <div className="rr">
              <span className="rname">Comunidade</span>
              <span className="rdesc">Club, Start e Expert. Recorrência mensal; sustenta a operação e a retenção.</span>
              <span className="rtag">receita · recorrente</span>
            </div>
            <div className="rr">
              <span className="rname">Conteúdo / cursos grátis</span>
              <span className="rdesc">Topo de marketing — captura de lead. Entra como custo de marketing, não como receita.</span>
              <span className="rtag mute">não é receita</span>
            </div>
            <div className="rr">
              <span className="rname">Rede de Amplifiers</span>
              <span className="rdesc">Canal faseado. Certificação é a entrada; vende em escala nos anos 2-3. Dimensiona comissão, não receita bruta no ano 1.</span>
              <span className="rtag mute">canal</span>
            </div>
            <div className="rr">
              <span className="rname">Produtos parceiros / reseller</span>
              <span className="rdesc">Soluções de terceiros revendidas. Upside não modelado no ano 1.</span>
              <span className="rtag mute">upside</span>
            </div>
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="block">
          <h3>A tese financeira</h3>
          <div className="body-col">
            <p>
              <strong>Investe-se na rede no ano 1, colhe-se nos anos 2-3.</strong> A margem do ano 1 é modesta
              porque se constrói a estrutura e a rede sem a receita plena delas; nos anos seguintes a rede ativa,
              o trailing acumula e o G&amp;A dilui. A margem cresce como consequência, não como esforço heroico.
            </p>
          </div>
          <div className="note">
            <b>Veja por si.</b> A tela do BP vivo deixa você mexer em cada premissa e ver essa curva reagir nos
            três cenários — receita, custos e EBITDA, mês a mês.
          </div>
        </section>
      </Reveal>
    </div>
  );
}
