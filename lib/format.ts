// Helpers de formatação — pt-BR, mono nos números.

export const fmtBRL = (n: number, compact = false): string => {
  if (compact) {
    const abs = Math.abs(n);
    if (abs >= 1_000_000) return `R$ ${(n / 1_000_000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}M`;
    if (abs >= 1_000) return `R$ ${(n / 1_000).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}k`;
  }
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
};

export const fmtNum = (n: number): string =>
  Math.round(n).toLocaleString("pt-BR", { maximumFractionDigits: 0 });

export const fmtPct = (n: number, digits = 1): string => `${(n * 100).toFixed(digits)}%`;
