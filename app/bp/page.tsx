"use client";

import { useMemo, useState } from "react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, ReferenceLine,
} from "recharts";
import {
  runModel, SCENARIOS, type Assumptions, type ScenarioKey, type ModelResult, type MonthRow,
} from "@/lib/calc";
import { fmtBRL, fmtNum, fmtPct } from "@/lib/format";
import { GROUPS, type Field } from "./sliders";
import "./bp.css";

const SCEN: { key: ScenarioKey; label: string }[] = [
  { key: "pessimista", label: "Pessimista" },
  { key: "realista", label: "Realista" },
  { key: "otimista", label: "Otimista" },
];

const COL = { programa: "#2dd4bf", capacitacao: "#6b7a77", comunidade: "#3a4240" };

const fieldText = (f: Field, v: number) =>
  f.kind === "money" ? fmtBRL(v) :
  f.kind === "pct" ? fmtPct(v, f.step < 0.01 ? 1 : 0) :
  f.kind === "mult" ? `${v.toFixed(1)}×` :
  fmtNum(v);

function sourcesByYear(m: ModelResult) {
  const agg = (s: number) => {
    const sl = m.months.slice(s, s + 12);
    const sum = (f: (r: MonthRow) => number) => sl.reduce((a, r) => a + f(r), 0);
    return {
      Programa: sum((r) => r.recMid + r.recTopo),
      Capacitação: sum((r) => r.recBootcamp + r.recOutras),
      Comunidade: sum((r) => r.clubReceita + r.startReceita + r.expertReceita),
    };
  };
  return [
    { ano: "Ano 1", ...agg(0) },
    { ano: "Ano 2", ...agg(12) },
    { ano: "Ano 3", ...agg(24) },
  ];
}

function cascadeForYear(m: ModelResult, y: number) {
  const sl = m.months.slice(y * 12, y * 12 + 12);
  const sum = (f: (r: MonthRow) => number) => sl.reduce((a, r) => a + f(r), 0);
  const receita = sum((r) => r.receitaBruta);
  const impostos = sum((r) => r.impostos);
  const cogs = sum((r) => r.cogsProgramas + r.cogsBootcamp + r.cogsComunidade);
  const comissoes = sum((r) => r.comissaoInterna - r.comissaoRede);
  const custoRede = sum((r) => r.custoRede);
  const ga = sum((r) => r.gaGestao + r.gaVendas + r.gaMarketing + r.gaProduto + r.gaSoftware);
  const recLiq = receita + impostos;
  const mc = recLiq + cogs;
  const mo = mc + comissoes + custoRede;
  const ebitda = mo + ga;
  return [
    { label: "Receita bruta", value: receita, type: "in" },
    { label: "(−) Impostos s/ receita", value: impostos, type: "sub" },
    { label: "Receita líquida", value: recLiq, type: "subtotal" },
    { label: "(−) COGS — entrega", value: cogs, type: "sub" },
    { label: "Margem de contribuição", value: mc, type: "subtotal" },
    { label: "(−) Comissões (interno + rede)", value: comissoes, type: "sub" },
    { label: "(−) Custo de rede", value: custoRede, type: "sub" },
    { label: "Margem operacional", value: mo, type: "subtotal" },
    { label: "(−) G&A / estrutura", value: ga, type: "sub" },
    { label: "EBITDA", value: ebitda, type: "ebitda" },
  ];
}

function CTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#0a0a0a", border: "1px solid rgba(246,247,244,.16)", borderRadius: 10, padding: "10px 13px", fontSize: 12 }}>
      <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: "#737977", marginBottom: 6 }}>{label}</div>
      {payload.map((p) => (
        <div key={p.name} style={{ display: "flex", gap: 10, justifyContent: "space-between", color: "#f6f7f4" }}>
          <span style={{ color: p.color }}>{p.name}</span>
          <span style={{ fontFamily: "var(--mono)" }}>{fmtBRL(p.value, true)}</span>
        </div>
      ))}
    </div>
  );
}

export default function BpPage() {
  const [scenario, setScenario] = useState<ScenarioKey>("realista");
  const [a, setA] = useState<Assumptions>({ ...SCENARIOS.realista });
  const [cYear, setCYear] = useState(0);

  const model = useMemo(() => runModel(a), [a]);

  const loadScenario = (k: ScenarioKey) => { setScenario(k); setA({ ...SCENARIOS[k] }); };
  const reset = () => setA({ ...SCENARIOS[scenario] });
  const setField = (k: keyof Assumptions, v: number) => setA((p) => ({ ...p, [k]: v }));

  const dirty = useMemo(
    () => (Object.keys(SCENARIOS[scenario]) as (keyof Assumptions)[]).some((k) => a[k] !== SCENARIOS[scenario][k]),
    [a, scenario]
  );

  const sources = useMemo(() => sourcesByYear(model), [model]);
  const cascade = useMemo(() => cascadeForYear(model, cYear), [model, cYear]);
  const ebitdaLine = useMemo(
    () => model.months.map((r) => ({ m: r.m, ebitda: Math.round(r.ebitda), acum: Math.round(r.ebitdaAcumulado) })),
    [model]
  );

  const ebAno1 = model.years[0].ebitda;
  const be = model.breakEvenMonth;

  return (
    <div className="page">
      <div className="bp-head">
        <span className="eyebrow">BP vivo · 36 meses</span>
        <h1>Mexa nas premissas. <span className="cy serif-em">Veja o EBITDA</span> reagir.</h1>
        <p className="lead" style={{ marginTop: 14 }}>
          Cada controle é uma alavanca da cascata. Comece num cenário, ajuste o que quiser — receita, custos
          e margem recalculam na hora. A planilha v8 é a fonte de verdade por trás de cada número.
        </p>

        <div className="scenario-row">
          <div className="scenario-pills">
            {SCEN.map((s) => (
              <button key={s.key} className={`pill${scenario === s.key ? " on" : ""}`} onClick={() => loadScenario(s.key)}>
                {s.label}
              </button>
            ))}
          </div>
          <button className="reset-btn" onClick={reset} disabled={!dirty} style={{ opacity: dirty ? 1 : 0.4 }}>
            ↺ Resetar cenário
          </button>
        </div>

        <div className="kpis">
          <div className="kpi">
            <div className="k">Receita ano 3</div>
            <div className="v">{fmtBRL(model.years[2].receitaBruta, true)}</div>
          </div>
          <div className="kpi">
            <div className="k">EBITDA ano 1</div>
            <div className={`v ${ebAno1 >= 0 ? "pos" : "neg"}`}>{fmtBRL(ebAno1, true)}</div>
          </div>
          <div className="kpi">
            <div className="k">Margem EBITDA ano 3</div>
            <div className="v pos">{fmtPct(model.years[2].margemEbitda)}</div>
          </div>
          <div className="kpi">
            <div className="k">Break-even</div>
            <div className="v">{be ? `Mês ${be}` : "—"}</div>
          </div>
        </div>
      </div>

      <div className="workspace">
        {/* premissas */}
        <aside className="panel">
          {GROUPS.map((g) => (
            <div className="pgroup" key={g.title}>
              <div className="gt">{g.title}</div>
              {g.note && <div className="gnote">{g.note}</div>}
              {g.fields.map((f) => {
                const locked = f.key === "renovacao";
                return (
                  <div className={`field${locked ? " locked" : ""}`} key={f.key}>
                    <div className="flabel">
                      <span>{f.label}{locked && <span className="lockbadge">ref</span>}</span>
                      <span className="fval">{fieldText(f, a[f.key])}</span>
                    </div>
                    <input
                      type="range" min={f.min} max={f.max} step={f.step} value={a[f.key]}
                      onChange={(e) => setField(f.key, Number(e.target.value))}
                    />
                    {f.hint && <div className="fhint">{f.hint}</div>}
                  </div>
                );
              })}
            </div>
          ))}
        </aside>

        {/* charts + cascade */}
        <div className="viz">
          <div className="card">
            <div className="ct">Receita por fonte · 3 anos</div>
            <div className="cs">Programa é a âncora recorrente; capacitação é o topo de vendas; comunidade acumula.</div>
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sources} margin={{ top: 6, right: 6, left: 6, bottom: 0 }}>
                  <CartesianGrid stroke="rgba(246,247,244,.06)" vertical={false} />
                  <XAxis dataKey="ano" tick={{ fill: "#9b9f9d", fontSize: 12 }} axisLine={{ stroke: "rgba(246,247,244,.12)" }} tickLine={false} />
                  <YAxis tickFormatter={(v) => fmtBRL(v, true)} tick={{ fill: "#737977", fontSize: 11 }} axisLine={false} tickLine={false} width={60} />
                  <Tooltip content={<CTooltip />} cursor={{ fill: "rgba(246,247,244,.04)" }} />
                  <Legend wrapperStyle={{ fontSize: 12, color: "#9b9f9d" }} iconType="circle" />
                  <Bar dataKey="Programa" stackId="r" fill={COL.programa} radius={[0, 0, 0, 0]} />
                  <Bar dataKey="Capacitação" stackId="r" fill={COL.capacitacao} />
                  <Bar dataKey="Comunidade" stackId="r" fill={COL.comunidade} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card">
            <div className="ct">EBITDA mensal · o vale e a virada</div>
            <div className="cs">Investe-se na estrutura cedo; a virada sustentada {be ? `acontece no mês ${be}` : "não ocorre em 36 meses"}.</div>
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={ebitdaLine} margin={{ top: 6, right: 10, left: 6, bottom: 0 }}>
                  <CartesianGrid stroke="rgba(246,247,244,.06)" vertical={false} />
                  <XAxis dataKey="m" tick={{ fill: "#737977", fontSize: 11 }} axisLine={{ stroke: "rgba(246,247,244,.12)" }} tickLine={false} ticks={[1, 6, 12, 18, 24, 30, 36]} />
                  <YAxis tickFormatter={(v) => fmtBRL(v, true)} tick={{ fill: "#737977", fontSize: 11 }} axisLine={false} tickLine={false} width={60} />
                  <Tooltip
                    cursor={{ stroke: "rgba(45,212,191,.3)" }}
                    content={({ active, payload, label }) =>
                      active && payload?.length ? (
                        <div style={{ background: "#0a0a0a", border: "1px solid rgba(246,247,244,.16)", borderRadius: 10, padding: "10px 13px", fontSize: 12 }}>
                          <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "#737977", marginBottom: 4 }}>MÊS {label}</div>
                          <div style={{ color: "#f6f7f4" }}>EBITDA: <span style={{ fontFamily: "var(--mono)" }}>{fmtBRL(Number(payload[0].value), true)}</span></div>
                          <div style={{ color: "#9b9f9d" }}>Acum.: <span style={{ fontFamily: "var(--mono)" }}>{fmtBRL(Number(payload[1].value), true)}</span></div>
                        </div>
                      ) : null
                    }
                  />
                  <ReferenceLine y={0} stroke="rgba(246,247,244,.2)" />
                  {be && <ReferenceLine x={be} stroke="rgba(45,212,191,.4)" strokeDasharray="3 3" />}
                  <Line type="monotone" dataKey="ebitda" stroke="#2dd4bf" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="acum" stroke="#6b7a77" strokeWidth={1.4} dot={false} strokeDasharray="4 3" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card cascade">
            <div className="ct">Cascata de EBITDA</div>
            <div className="cyearsel">
              {[0, 1, 2].map((y) => (
                <button key={y} className={cYear === y ? "on" : ""} onClick={() => setCYear(y)}>Ano {y + 1}</button>
              ))}
            </div>
            {cascade.map((r) => (
              <div key={r.label} className={`crow ${r.type === "subtotal" ? "subtotal" : ""} ${r.type === "ebitda" ? "ebitda" : ""}`}>
                <span className="clabel">{r.label}</span>
                <span className={`cval ${r.value < 0 ? "neg" : ""}`}>{fmtBRL(r.value)}</span>
              </div>
            ))}
            <div className="crow" style={{ borderTop: "none" }}>
              <span className="clabel" style={{ color: "var(--ink-mute)", fontFamily: "var(--mono)", fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase" }}>Margem EBITDA</span>
              <span className="cval" style={{ color: "var(--cyan)" }}>{fmtPct(model.years[cYear].margemEbitda)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
