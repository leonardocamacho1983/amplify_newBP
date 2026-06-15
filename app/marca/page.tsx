import "../content.css";
import Reveal from "../components/Reveal";

export const metadata = { title: "Marca & estratégia · Amplify" };

export default function Marca() {
  return (
    <div className="page">
      <section className="block">
        <span className="eyebrow">A marca</span>
        <h2>Inteligência como <span className="cy">capacidade de realizar mais</span>.</h2>
        <div className="body-col">
          <p>
            A Amplify é uma casa de <strong>educação corporativa e consultoria em inteligência artificial</strong>.
            Conectamos estratégia, capacitação e implementação para que a IA deixe de ser experimento de área e
            vire capacidade da organização inteira.
          </p>
          <p>
            Existe muita gente tratando IA como coleção de ferramentas ou promessa de mágica. Nossa posição é
            simples e difícil de copiar: <strong>IA só vale quando vira método, e método só vale quando vira
            resultado.</strong>
          </p>
        </div>

        <div style={{ marginTop: 36 }}>
          <span className="eyebrow">A tese</span>
          <div className="tese">Curiosidade vira <span className="cy">método</span>. Método vira <span className="cy">operação</span>. Operação vira <span className="cy">resultado</span>.</div>
          <div className="flow">
            <span>Curiosidade</span><span className="arr">→</span>
            <span>Método</span><span className="arr">→</span>
            <span>Operação</span><span className="arr">→</span>
            <span>Resultado</span>
          </div>
        </div>

        <div className="note">
          <b>Promessa central.</b> Tiramos a IA do improviso. Quem sai da Amplify não sai com uma lista de
          ferramentas — sai com um plano claro, ferramentas escolhidas e a confiança para implementar.
        </div>
      </section>

      <Reveal>
        <section className="block">
          <h3>De onde a autoridade vem</h3>
          <div className="body-col">
            <p>
              A credibilidade se sustenta primeiro no <strong>método e nos resultados</strong> — não no carisma
              de uma figura. Histórico de capacitação em escala, satisfação alta e cases em setores diferentes
              são a base institucional.
            </p>
            <p>
              Sobre essa base, há um <strong>corpo de especialistas acessíveis</strong>: pessoas sênior, com
              nome e rosto, apresentadas como time — não como vitrine de um guru. Isso reduz o risco percebido
              mais do que qualquer nome isolado.
            </p>
          </div>
          <div className="note">
            <b>Regra de credibilidade.</b> Nenhuma afirmação central de autoridade deve depender de um único
            indivíduo estar presente para ser verdadeira.
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="block">
          <h3>Dois níveis de motivação — não dois clientes</h3>
          <div className="duo">
            <div className="a">
              <div className="h">Custo · a porta</div>
              <p>Tangível e imediato: &ldquo;a IA faz em minutos o que tomava uma tarde&rdquo;. É o que o cliente menos sofisticado verbaliza primeiro e o que abre a conversa.</p>
              <p>Risco: ancorar tudo aqui coloca a marca na prateleira de &ldquo;mais uma ferramenta de produtividade&rdquo;.</p>
            </div>
            <div className="b">
              <div className="h">Velocidade · a tese</div>
              <p>Inovar e testar rápido e barato — validar uma ideia em dias, não em trimestres. É onde mora o valor real e o que sustenta o preço premium.</p>
              <p>É o argumento do decisor estratégico. Vende capacidade de adaptação, não economia de horas.</p>
            </div>
          </div>
          <div className="body-col" style={{ marginTop: 22 }}>
            <p>
              Use custo como porta — é o que ele diz primeiro — e velocidade como tese — é o que justifica o
              ticket. O cliente amadurece de um para o outro conforme a marca o educa.
            </p>
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="block">
          <h3>Voz &amp; tom</h3>
          <p className="lead" style={{ marginTop: 10 }}>
            Executivo, direto, denso sem ser pesado. A marca vende método e decisão para um par — nunca fala
            como anúncio de infoproduto.
          </p>
          <div className="duo">
            <div className="a">
              <div className="h">A marca soa assim</div>
              <p>&ldquo;Não é aula. É aceleração.&rdquo;</p>
              <p>&ldquo;Enquanto outros assistem tutoriais, você já está implementando.&rdquo;</p>
              <p>&ldquo;Tire a IA do improviso.&rdquo;</p>
            </div>
            <div className="b">
              <div className="h">A marca evita</div>
              <p>&ldquo;O curso revolucionário que vai mudar sua vida!!!&rdquo;</p>
              <p>&ldquo;Aprenda as 50 melhores ferramentas de IA do mercado.&rdquo;</p>
              <p>Jargão técnico, superlativo vazio, urgência gritada.</p>
            </div>
          </div>
        </section>
      </Reveal>
    </div>
  );
}
