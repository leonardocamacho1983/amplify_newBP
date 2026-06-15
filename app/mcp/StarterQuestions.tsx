"use client";

import { useState } from "react";

const QUESTIONS = [
  "Quais são as alavancas do BP que mais impactam o EBITDA do ano 1?",
  "E se fecharmos 8 contratos mid/mês em vez de 3? Qual o impacto nos três anos?",
  "O que rende mais no Ano 2: dobrar bootcamps ou acelerar a rede de Amplifiers?",
  "Me mostra o cenário pessimista com a quebra de custos por categoria.",
  "Qual combinação de variáveis faria o EBITDA do ano 1 ser negativo?",
  "Compara o cenário realista com o otimista lado a lado.",
];

export default function StarterQuestions() {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const copy = async (q: string, i: number) => {
    try {
      await navigator.clipboard.writeText(q);
      setCopiedIdx(i);
      setTimeout(() => setCopiedIdx((c) => (c === i ? null : c)), 1600);
    } catch {
      /* clipboard indisponível — usuário seleciona e copia manualmente */
    }
  };

  return (
    <div className="starters">
      {QUESTIONS.map((q, i) => (
        <button key={q} className="starter" onClick={() => copy(q, i)} title="Copiar para o Claude">
          <span className="starter-q">“{q}”</span>
          <span className="starter-copy">{copiedIdx === i ? "copiado ✓" : "copiar"}</span>
        </button>
      ))}
    </div>
  );
}
