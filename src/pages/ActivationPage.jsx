import { useMemo, useState } from "react";
import SectionHeader from "../components/SectionHeader";
import InfoCard from "../components/InfoCard";
import { reluArray } from "../utils/cnnMath";

function randomVector(n = 14) {
  return Array.from({ length: n }, () => Number((Math.random() * 8 - 4).toFixed(2)));
}

function ReLUGraph() {
  const W = 200, H = 120, cx = W / 2, cy = H / 2;
  return (
    <svg width={W} height={H} style={{ display: "block", margin: "0 auto" }}>
      <line x1={10} y1={cy} x2={W - 10} y2={cy} stroke="var(--line)" strokeWidth="1" />
      <line x1={cx} y1={10} x2={cx} y2={H - 10} stroke="var(--line)" strokeWidth="1" />
      <polyline
        points={`10,${cy} ${cx},${cy} ${W - 10},${10}`}
        fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round"
      />
      <text x={W - 8} y={14} fill="var(--accent)" fontSize="11" textAnchor="end">f(x)</text>
      <text x={W - 8} y={cy - 4} fill="var(--muted)" fontSize="10" textAnchor="end">x</text>
    </svg>
  );
}

function Bars({ values, title, showNeg = false }) {
  return (
    <div className="panel">
      <h3>{title}</h3>
      <div className="bar-chart">
        {values.map((v, idx) => {
          const isNeg = v < 0;
          const isZero = v === 0;
          const h = Math.abs(v) * 14 + 4;
          return (
            <div key={idx} className="bar-wrap" title={`x=${v}`}>
              <div
                style={{
                  width: "100%", height: `${h}px`,
                  borderRadius: "5px 5px 2px 2px",
                  background: isZero
                    ? "rgba(100,160,220,0.2)"
                    : isNeg && showNeg
                    ? "linear-gradient(180deg, #ff6b8a, #c43354)"
                    : "linear-gradient(180deg, #30e8a0, #1ab878)",
                  opacity: isZero ? 0.35 : 1,
                  transition: "height 0.4s ease",
                  position: "relative",
                }}
              >
                  <div style={{
                    position: "absolute", top: -18, left: "50%", transform: "translateX(-50%)",
                    fontSize: "0.6rem", color: "var(--danger)", whiteSpace: "nowrap"
                  }}></div>
              </div>
              <span style={{
                fontSize: "0.72rem",
                color: isNeg && showNeg ? "var(--danger)" : isZero ? "var(--muted)" : "var(--success)"
              }}>{v.toFixed(1)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ActivationPage() {
  const [values, setValues] = useState(() => randomVector(14));
  const relu = useMemo(() => reluArray(values), [values]);
  const negCount = values.filter((v) => v < 0).length;

  return (
    <section className="page">
      <SectionHeader
        step={3}
        stepLabel="Activation ReLU"
        title="Activation ReLU"
        subtitle="La fonction ReLU applique f(x) = max(0, x). Toutes les valeurs négatives sont remises à zéro, les positives restent intactes."
      />

      <div className="formula-display">
        f(x) = max(0, x)
      </div>

      <div className="two-col">
        <div className="panel" style={{ display: "grid", gap: 12, placeItems: "center" }}>
          <h3>Courbe ReLU</h3>
          <ReLUGraph />
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
            <span className="badge badge-red">Valeurs négatives → 0</span>
            <span className="badge badge-green">Valeurs positives → inchangées</span>
          </div>
        </div>
        <div className="panel" style={{ display: "grid", gap: 10 }}>
          <h3>Statistiques</h3>
          <div style={{ display: "grid", gap: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: "rgba(255,91,122,0.1)", borderRadius: "var(--r-sm)" }}>
              <span style={{ color: "var(--muted)" }}>Valeurs supprimées (neg.)</span>
              <span style={{ color: "var(--danger)", fontWeight: 700 }}>{negCount} / {values.length}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: "rgba(48,232,160,0.1)", borderRadius: "var(--r-sm)" }}>
              <span style={{ color: "var(--muted)" }}>Neurones activés</span>
              <span style={{ color: "var(--success)", fontWeight: 700 }}>{values.length - negCount} / {values.length}</span>
            </div>
            <div className="controls-row" style={{ marginTop: 24, justifyContent: "center" }}>
              <button type="button" className="btn secondary" onClick={() => setValues(randomVector(14))}>
                Randomize
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="two-col">
        <Bars values={values} title="Avant ReLU" showNeg />
        <Bars values={relu} title="Après ReLU" />
      </div>

      <InfoCard
        retenir="ReLU est la fonction d'activation la plus utilisée dans les CNN. Elle introduit la non-linéarité qui permet au réseau d'apprendre des motifs complexes. Sans activation, le CNN se réduirait à une transformation linéaire."
        erreur="Ne pas confondre ReLU avec Sigmoid. ReLU ne sature pas pour les grandes valeurs positives, ce qui accélère la convergence. Sigmoid peut causer le problème de vanishing gradient."
        notebook="Dans Keras : Conv2D(32, (3,3), activation='relu') ou Dense(128, activation='relu'). L'activation est appliquée après la transformation linéaire de chaque couche."
      />
    </section>
  );
}
