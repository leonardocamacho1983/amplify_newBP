import "../content.css";
import Reveal from "../components/Reveal";

export const metadata = { title: "Persona & ICP · Amplify" };

export default function Persona() {
  return (
    <div className="page">
      <section className="block">
        <span className="eyebrow">A persona</span>
        <h2>Com quem a Amplify fala.</h2>
        <div className="body-col">
          <p>
            O cliente é o <strong>decisor de uma média empresa brasileira</strong> — CEO, fundador, C-level,
            diretoria ou gerência — em setores que <strong>não têm forte base tecnológica própria</strong>.
            Empresas nativas de tecnologia resolvem IA sozinhas; não são nosso público. Nosso público é a
            indústria, o varejo, os serviços, a saúde, a construção, a educação: negócios sólidos que precisam
            da IA mas não nasceram dela.
          </p>
        </div>
        <div className="pquote">&ldquo;Meu concorrente vai usar IA — e meus clientes já esperam que eu use também.&rdquo;</div>
        <div className="body-col">
          <p>
            Este cliente <strong>não é leigo</strong>. Tem maturidade digital média a alta: usa sistemas de
            gestão, tem presença digital, e parte do time já experimentou IA no improviso. Ele já testou, viu
            potencial — e travou. O que falta não é informação básica; é <strong>método e direção</strong>. A
            comunicação parte de onde ele está: &ldquo;você já testou, viu valor e ficou preso no
            improviso&rdquo;.
          </p>
        </div>
      </section>

      <Reveal>
        <section className="block">
          <h3>Três tiers de cliente</h3>
          <p className="lead" style={{ marginTop: 10 }}>
            O que prevê o comportamento de compra não é faturamento isolado, mas a combinação de porte, como o
            dinheiro se move e quem decide.
          </p>
          <div className="tiers">
            <div className="tier">
              <div className="tnum">Tier 1 · porta de entrada</div>
              <h3>Dono no centro</h3>
              <div className="rng">~R$ 4,8M a R$ 30M</div>
              <div className="field2"><span className="k">Quem decide</span>O próprio fundador. Compra com o bolso e a urgência dele. Decisão rápida, sem comitê.</div>
              <div className="field2"><span className="k">Dor dominante</span>Sobrecarga. &ldquo;Perco tempo e dinheiro fazendo na mão o que a IA já faz.&rdquo;</div>
              <div className="field2"><span className="k">Alavanca</span>Tempo e custo, no nível pessoal. Imediatismo.</div>
            </div>
            <div className="tier">
              <div className="tnum">Tier 2 · sweet spot</div>
              <h3>Decisão compartilhada</h3>
              <div className="rng">~R$ 30M a R$ 100M</div>
              <div className="field2"><span className="k">Quem decide</span>Diretoria identifica, CEO aprova. Já há orçamento de capacitação e alguém de inovação.</div>
              <div className="field2"><span className="k">Dor dominante</span>&ldquo;A concorrência vai me passar e eu não tenho um plano.&rdquo;</div>
              <div className="field2"><span className="k">Alavanca</span>Ansiedade competitiva + capacidade. Ciclo curto, ticket maior.</div>
            </div>
            <div className="tier">
              <div className="tnum">Tier 3 · consultivo</div>
              <h3>Compra estruturada</h3>
              <div className="rng">~R$ 100M a R$ 300M</div>
              <div className="field2"><span className="k">Quem decide</span>Processo formal, múltiplos stakeholders, TI estruturada, jurídico. Ciclo mais longo.</div>
              <div className="field2"><span className="k">Dor dominante</span>&ldquo;Temos iniciativas de IA soltas, mas nada virou capacidade da empresa.&rdquo;</div>
              <div className="field2"><span className="k">Alavanca</span>Sistematizar o fragmentado. Diagnóstico antes da proposta.</div>
            </div>
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="block">
          <h3>O melhor cliente: o que aconteceu com a última tentativa</h3>
          <p className="lead" style={{ marginTop: 10 }}>
            Porte qualifica o ticket. Mas o que mais prevê uma boa venda é o histórico de adoção. O cliente
            ideal <strong>já investiu o suficiente para ter dor e referência — mas não tanto a ponto de já ter
            resolvido sozinho.</strong>
          </p>
          <div className="matrix">
            <div className="mrow">
              <div className="mh"><span className="badge">ideal</span>Travou no piloto</div>
              <div className="mb">Testou, gostou, mas não conseguiu transformar em rotina. Tem dor, prova de valor e a frustração de não escalar sozinho. A oferta certa é método. Cliente mais valioso do funil.</div>
            </div>
            <div className="mrow">
              <div className="mh"><span className="badge">forte</span>Sucesso isolado</div>
              <div className="mb">Uma área (em geral marketing) teve ganho real e a empresa quer replicar. Não precisa ser convencido de que IA funciona — precisa que alguém saiba sistematizar. Ticket maior.</div>
            </div>
            <div className="mrow">
              <div className="mh"><span className="badge mute">trabalhar</span>Fracassou e desconfia</div>
              <div className="mb">Tentou, deu errado, ficou cético. Exige mais prova (cases, números) e é sensível a hype. Vale a pena, mas o ciclo é mais longo e a objeção é emocional, não racional.</div>
            </div>
            <div className="mrow">
              <div className="mh"><span className="badge mute">imaturo</span>Nunca se mexeu</div>
              <div className="mb">Curiosidade barata, sem investimento. Ainda não cruzou o limiar de dor que faz comprar. Educar custa caro e converte devagar.</div>
            </div>
          </div>
          <div className="note">
            <b>Regra do sino.</b> Quem investiu muito e teve sucesso já montou capacidade interna e saiu do
            mercado. O melhor cliente está no meio da curva: gastou o bastante para conhecer a diferença entre
            &ldquo;falar de IA&rdquo; e &ldquo;implementar IA&rdquo; — exatamente o que a Amplify entrega.
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="block">
          <h3>A pressão vem da cadeia inteira</h3>
          <div className="grid3">
            <div className="cell"><h3>O concorrente lateral</h3><p>Quem vende o mesmo vai ficar mais rápido e mais barato. Pressão horizontal, ainda meio abstrata.</p></div>
            <div className="cell"><h3>O cliente da frente</h3><p>O cliente do cliente já espera IA embutida: prazo menor, atendimento ágil, proposta na hora. Não é medo — é um e-mail que ele já recebeu.</p></div>
            <div className="cell"><h3>O fornecedor que ultrapassa</h3><p>A agência, a contabilidade, o escritório que o atende já usa IA e entrega mais por menos. Recalibra o que ele considera produtividade normal.</p></div>
          </div>
        </section>
      </Reveal>
    </div>
  );
}
