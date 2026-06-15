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

interface CChild { label: string; value: number }
interface CRow { label: string; value: number; type: string; key?: string; children?: CChild[] }
interface CCat { label: string; value: number }

function cascadeForYear(m: ModelResult, y: number): { rows: CRow[]; categories: CCat[]; receita: number } {
  const sl = m.months.slice(y * 12, y * 12 + 12);
  const sum = (f: (r: MonthRow) => number) => sl.reduce((a, r) => a + f(r), 0);

  const receita = sum((r) => r.receitaBruta);
  const impostos = sum((r) => r.impostos);

  const cogsProg = sum((r) => r.cogsProgramas);
  const cogsBoot = sum((r) => r.cogsBootcamp);
  const cogsCom = sum((r) => r.cogsComunidade);
  const cogs = cogsProg + cogsBoot + cogsCom;

  const comInterno = sum((r) => r.comissaoInterna);   // já negativo
  const comRede = sum((r) => -r.comissaoRede);         // entra como redutor
  const comissoes = comInterno + comRede;

  const custoTime = sum((r) => -r.custoTimeRede);
  const custoForm = sum((r) => -r.custoFormacaoRede);
  const custoRede = custoTime + custoForm;

  const ga = sum((r) => r.ga);
  // Breakdown de G&A proporcional: nos anos 2-3 o total é escalado (GA_GROWTH_*),
  // mas mantemos o mix de composição do ano 1 para detalhar as cinco linhas.
  const rawGestao = sum((r) => r.gaGestao);
  const rawVendas = sum((r) => r.gaVendas);
  const rawMkt = sum((r) => r.gaMarketing);
  const rawProd = sum((r) => r.gaProduto);
  const rawSoft = sum((r) => r.gaSoftware);
  const rawGa = rawGestao + rawVendas + rawMkt + rawProd + rawSoft;
  const sc = rawGa === 0 ? 0 : ga / rawGa;

  const recLiq = receita + impostos;
  const mc = recLiq + cogs;
  const mo = mc + comissoes + custoRede;
  const ebitda = mo + ga;

  const rows: CRow[] = [
    { label: "Receita bruta", value: receita, type: "in" },
    { label: "(−) Impostos s/ receita", value: impostos, type: "sub" },
    { label: "Receita líquida", value: recLiq, type: "subtotal" },
    {
      label: "(−) COGS — entrega", value: cogs, type: "sub", key: "cogs", children: [
        { label: "COGS programas", value: cogsProg },
        { label: "COGS bootcamp + capacitação", value: cogsBoot },
        { label: "COGS comunidade", value: cogsCom },
      ],
    },
    { label: "Margem de contribuição", value: mc, type: "subtotal" },
    {
      label: "(−) Comissões (interno + rede)", value: comissoes, type: "sub", key: "comissoes", children: [
        { label: "Comissão — time interno", value: comInterno },
        { label: "Comissão — rede", value: comRede },
      ],
    },
    {
      label: "(−) Custo de rede", value: custoRede, type: "sub", key: "custoRede", children: [
        { label: "Time central", value: custoTime },
        { label: "Formação de Amplifiers", value: custoForm },
      ],
    },
    { label: "Margem operacional", value: mo, type: "subtotal" },
    {
      label: "(−) G&A / estrutura", value: ga, type: "sub", key: "ga", children: [
        { label: "Gestão", value: rawGestao * sc },
        { label: "Vendas / Solutions", value: rawVendas * sc },
        { label: "Marketing", value: rawMkt * sc },
        { label: "Produto", value: rawProd * sc },
        { label: "Software / Jurídico / PR / Ads", value: rawSoft * sc },
      ],
    },
    { label: "EBITDA", value: ebitda, type: "ebitda" },
  ];

  const categories: CCat[] = [
    { label: "COGS", value: -cogs },
    { label: "Comissões", value: -comissoes },
    { label: "Custo de rede", value: -custoRede },
    { label: "G&A", value: -ga },
    { label: "Impostos", value: -impostos },
  ];

  return { rows, categories, receita };
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

type FlashDir = "up" | "down";
interface FlashState { cells: Record<string, FlashDir>; nonce: number }

export default function BpPage() {
  const [scenario, setScenario] = useState<ScenarioKey>("realista");
  const [a, setA] = useState<Assumptions>({ ...SCENARIOS.realista });
  const [cYear, setCYear] = useState(0);

  // acordeão de premissas — primeira categoria aberta por padrão
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => ({ [GROUPS[0].title]: true }));
  const toggleGroup = (t: string) => setOpenGroups((p) => ({ ...p, [t]: !p[t] }));

  // linhas de custo expansíveis na cascata
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const toggleRow = (k: string) => setExpanded((p) => ({ ...p, [k]: !p[k] }));

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
  const maxCat = useMemo(() => Math.max(...cascade.categories.map((c) => c.value), 1), [cascade]);
  const ebitdaLine = useMemo(
    () => model.months.map((r) => ({ m: r.m, ebitda: Math.round(r.ebitda), acum: Math.round(r.ebitdaAcumulado) })),
    [model]
  );

  // Feedback de impacto: a cada recálculo do modelo, comparamos os anos com o
  // valor anterior e marcamos as células que mudaram para um flash sutil. O nonce
  // força o replay da animação. Ajuste de estado em render (padrão React, sem
  // efeito): model só muda de identidade quando uma premissa muda.
  const [prevModel, setPrevModel] = useState(model);
  const [flash, setFlash] = useState<FlashState>({ cells: {}, nonce: 0 });
  if (prevModel !== model) {
    const cells: Record<string, FlashDir> = {};
    // q = quantização: arredonda à mesma resolução exibida (R$ inteiro / 0,1pp na margem)
    const mark = (key: string, now: number, before: number, q = 1) => {
      if (Math.round(now * q) !== Math.round(before * q)) cells[key] = now >= before ? "up" : "down";
    };
    model.years.forEach((y, i) => {
      const p = prevModel.years[i];
      mark(`rec-${i}`, y.receitaBruta, p.receitaBruta);
      mark(`ebt-${i}`, y.ebitda, p.ebitda);
      mark(`mar-${i}`, y.margemEbitda, p.margemEbitda, 1000);
    });
    setPrevModel(model);
    if (Object.keys(cells).length) setFlash((f) => ({ cells, nonce: f.nonce + 1 }));
  }

  const flashCell = (key: string, text: string, cls = "") => {
    const dir = flash.cells[key];
    return (
      <td key={key} className={cls}>
        <span key={dir ? `${key}-${flash.nonce}` : key} className={dir ? `flashv flash-${dir}` : undefined}>
          {text}
          {dir && <i className="farrow">{dir === "up" ? "▲" : "▼"}</i>}
        </span>
      </td>
    );
  };

  const be = model.breakEven;
  const beText =
    be.status === "from-start" ? "Positivo desde o início" :
    be.status === "month" ? `Mês ${be.month}` :
    "Não atinge em 36 meses";
  const beShort =
    be.status === "from-start" ? "desde o início" :
    be.status === "month" ? `mês ${be.month}` :
    "não em 36 meses";

  // vale = existe EBITDA mensal negativo no cenário ativo (só ocorre no pessimista típico)
  const temVale = model.months.some((r) => r.ebitda < 0);

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

        <table className="yeartable">
          <thead>
            <tr>
              <th></th>
              <th>Ano 1</th>
              <th>Ano 2</th>
              <th>Ano 3</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th>Receita</th>
              {model.years.map((y, i) => flashCell(`rec-${i}`, fmtBRL(y.receitaBruta, true)))}
            </tr>
            <tr>
              <th>EBITDA</th>
              {model.years.map((y, i) => flashCell(`ebt-${i}`, fmtBRL(y.ebitda, true), y.ebitda >= 0 ? "pos" : "neg"))}
            </tr>
            <tr>
              <th>Margem EBITDA</th>
              {model.years.map((y, i) => flashCell(`mar-${i}`, fmtPct(y.margemEbitda), y.ebitda >= 0 ? "pos" : "neg"))}
            </tr>
            <tr className="be-row">
              <th>Break-even</th>
              <td colSpan={3} className={be.status === "never" ? "neg" : "pos"}>{beText}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="workspace">
        {/* premissas — acordeão por categoria */}
        <aside className="panel">
          {GROUPS.map((g) => {
            const open = !!openGroups[g.title];
            return (
              <div className={`pgroup${open ? " open" : ""}`} key={g.title}>
                <button className="ghead" onClick={() => toggleGroup(g.title)} aria-expanded={open}>
                  <span className="gt">{g.title}</span>
                  <span className="gmeta">
                    {!open && <span className="gcount">{g.fields.length} controles</span>}
                    <span className="gchev" aria-hidden>›</span>
                  </span>
                </button>
                {open && (
                  <div className="gbody">
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
                )}
              </div>
            );
          })}
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
            <div className="ct">EBITDA mensal e acumulado · 36 meses</div>
            <div className="cs">
              {temVale
                ? `A operação passa por um vale antes da virada sustentada (${beShort}).`
                : `Sem vale neste cenário: o acumulado fica positivo ${beShort}. Eixos independentes — mensal à esquerda, acumulado à direita.`}
            </div>
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={ebitdaLine} margin={{ top: 6, right: 6, left: 6, bottom: 0 }}>
                  <CartesianGrid stroke="rgba(246,247,244,.06)" vertical={false} />
                  <XAxis dataKey="m" tick={{ fill: "#737977", fontSize: 11 }} axisLine={{ stroke: "rgba(246,247,244,.12)" }} tickLine={false} ticks={[1, 6, 12, 18, 24, 30, 36]} />
                  {/* Eixo esquerdo: EBITDA mensal (auto-escala à faixa do cenário). */}
                  <YAxis yAxisId="mes" tickFormatter={(v) => fmtBRL(v, true)} tick={{ fill: "#2dd4bf", fontSize: 11 }} axisLine={false} tickLine={false} width={56} domain={["auto", "auto"]} />
                  {/* Eixo direito: EBITDA acumulado. */}
                  <YAxis yAxisId="acum" orientation="right" tickFormatter={(v) => fmtBRL(v, true)} tick={{ fill: "#9b9f9d", fontSize: 11 }} axisLine={false} tickLine={false} width={56} domain={["auto", "auto"]} />
                  <Tooltip
                    cursor={{ stroke: "rgba(45,212,191,.3)" }}
                    content={({ active, payload, label }) =>
                      active && payload?.length ? (
                        <div style={{ background: "#0a0a0a", border: "1px solid rgba(246,247,244,.16)", borderRadius: 10, padding: "10px 13px", fontSize: 12 }}>
                          <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "#737977", marginBottom: 4 }}>MÊS {label}</div>
                          <div style={{ color: "#2dd4bf" }}>EBITDA mensal: <span style={{ fontFamily: "var(--mono)" }}>{fmtBRL(Number(payload[0].value), true)}</span></div>
                          <div style={{ color: "#9b9f9d" }}>Acumulado: <span style={{ fontFamily: "var(--mono)" }}>{fmtBRL(Number(payload[1].value), true)}</span></div>
                        </div>
                      ) : null
                    }
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} iconType="plainline" />
                  <ReferenceLine yAxisId="mes" y={0} stroke="rgba(246,247,244,.2)" />
                  {be.status === "month" && be.month && <ReferenceLine yAxisId="mes" x={be.month} stroke="rgba(45,212,191,.4)" strokeDasharray="3 3" />}
                  <Line yAxisId="mes" name="EBITDA mensal" type="monotone" dataKey="ebitda" stroke="#2dd4bf" strokeWidth={2} dot={false} />
                  <Line yAxisId="acum" name="EBITDA acumulado" type="monotone" dataKey="acum" stroke="#6b7a77" strokeWidth={1.4} dot={false} strokeDasharray="4 3" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* linha inferior: cascata + custos por categoria lado a lado */}
          <div className="viz-bottom">
            <div className="card cascade">
              <div className="ct">Cascata de EBITDA</div>
              <div className="cyearsel">
                {[0, 1, 2].map((y) => (
                  <button key={y} className={cYear === y ? "on" : ""} onClick={() => setCYear(y)}>Ano {y + 1}</button>
                ))}
              </div>
              {cascade.rows.map((r) => {
                const isExp = r.key ? !!expanded[r.key] : false;
                return (
                  <div key={r.label}>
                    <div
                      className={`crow ${r.type === "subtotal" ? "subtotal" : ""} ${r.type === "ebitda" ? "ebitda" : ""} ${r.key ? "clickable" : ""} ${isExp ? "open" : ""}`}
                      onClick={r.key ? () => toggleRow(r.key!) : undefined}
                      role={r.key ? "button" : undefined}
                      tabIndex={r.key ? 0 : undefined}
                      onKeyDown={r.key ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleRow(r.key!); } } : undefined}
                    >
                      <span className="clabel">
                        {r.key && <span className="chev" aria-hidden>›</span>}
                        {r.label}
                      </span>
                      <span className={`cval ${r.value < 0 ? "neg" : ""}`}>{fmtBRL(r.value)}</span>
                    </div>
                    {isExp && r.children!.map((c) => (
                      <div key={c.label} className="crow child">
                        <span className="clabel">{c.label}</span>
                        <span className={`cval ${c.value < 0 ? "neg" : ""}`}>{fmtBRL(c.value)}</span>
                      </div>
                    ))}
                  </div>
                );
              })}
              <div className="crow" style={{ borderTop: "none" }}>
                <span className="clabel" style={{ color: "var(--ink-mute)", fontFamily: "var(--mono)", fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase" }}>Margem EBITDA</span>
                <span className="cval" style={{ color: "var(--cyan)" }}>{fmtPct(model.years[cYear].margemEbitda)}</span>
              </div>
            </div>

            <div className="card costcat">
              <div className="ct">Custos por categoria · Ano {cYear + 1}</div>
              <div className="cs">Para onde vai o dinheiro: peso de cada bloco de custo sobre a receita bruta.</div>
              <div className="catlist">
                {cascade.categories.map((c) => {
                  const pct = cascade.receita ? c.value / cascade.receita : 0;
                  const w = (c.value / maxCat) * 100;
                  return (
                    <div className="catrow" key={c.label}>
                      <div className="cathead">
                        <span className="catlabel">{c.label}</span>
                        <span className="catval">{fmtBRL(c.value, true)}<span className="catpct">{fmtPct(pct, 0)}</span></span>
                      </div>
                      <div className="cattrack"><div className="catbar" style={{ width: `${w}%` }} /></div>
                    </div>
                  );
                })}
              </div>
              <div className="catfoot">
                <span>Receita bruta</span>
                <span className="catfootv">{fmtBRL(cascade.receita, true)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
