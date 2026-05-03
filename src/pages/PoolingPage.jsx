import { useEffect, useMemo, useState } from "react";
import MatrixGrid from "../components/MatrixGrid";
import SectionHeader from "../components/SectionHeader";
import InfoCard from "../components/InfoCard";
import { pool2d, randomMatrix } from "../utils/cnnMath";

export default function PoolingPage() {
  const [input, setInput] = useState(() => randomMatrix(6, 6, 0, 9));
  const [mode, setMode] = useState("max");
  const [step, setStep] = useState(0);

  const maxResult = useMemo(() => pool2d(input, "max"), [input]);
  const avgResult = useMemo(() => pool2d(input, "avg"), [input]);
  const { out, steps } = mode === "max" ? maxResult : avgResult;

  useEffect(() => {
    if (!steps.length) return undefined;
    const timer = setInterval(() => {
      setStep((prev) => (prev + 1) % steps.length);
    }, 700);
    return () => clearInterval(timer);
  }, [steps.length]);

  useEffect(() => { setStep(0); }, [mode, input]);

  const highlighted = steps[step]?.cells || [];

  // Valeur active dans la fenêtre
  const activeVals = highlighted
    .map(([r, c]) => input[r]?.[c])
    .filter((v) => v !== undefined);
  const activeResult = mode === "max"
    ? Math.max(...activeVals)
    : activeVals.length > 0 ? (activeVals.reduce((a, b) => a + b, 0) / activeVals.length).toFixed(2) : null;

  const inSize = `${input.length}×${input[0].length}`;
  const outSize = `${out.length}×${out[0]?.length ?? 0}`;

  return (
    <section className="page">
      <SectionHeader
        step={4}
        stepLabel="Pooling"
        title="Pooling"
        subtitle="Le pooling 2×2 réduit la taille spatiale en agrégeant les valeurs dans une fenêtre. Il garde l'information dominante tout en diminuant le nombre de paramètres."
      />

      <div className="controls-row">
        <label>
          <span>Mode</span>
          <select value={mode} onChange={(e) => setMode(e.target.value)}>
            <option value="max">MaxPooling</option>
            <option value="avg">AveragePooling</option>
          </select>
        </label>
        <button type="button" className="btn sm secondary" onClick={() => setInput(randomMatrix(6, 6, 0, 9))}>
          Random feature map
        </button>

        <div style={{ display: "flex", gap: 8, alignItems: "center", marginLeft: "auto" }}>
          <span className="badge badge-cyan">Entrée : {inSize}</span>
          <span style={{ color: "var(--accent)", fontSize: "1.2rem" }}>→</span>
          <span className="badge badge-green">Sortie : {outSize}</span>
          <span className="badge badge-orange">Réduction ×4</span>
        </div>
      </div>

      {activeVals.length > 0 && (
        <div className="calc-box">
          <strong style={{ color: "var(--text)" }}>Fenêtre active : </strong>
          [{activeVals.join(", ")}]
          {" → "}
          <strong style={{ color: "var(--accent)" }}>
            {mode === "max" ? "max" : "moy"} = {activeResult}
          </strong>
        </div>
      )}

      <div className="two-col">
        <MatrixGrid matrix={input} title={`Feature map entrée ${inSize}`} highlightCells={highlighted} />
        <MatrixGrid matrix={out} title={`Sortie ${mode === "max" ? "MaxPooling" : "AveragePooling"} ${outSize}`} />
      </div>

      {/* Comparaison */}
      <div className="panel">
        <h3>Comparaison MaxPooling vs AveragePooling</h3>
        <div className="two-col" style={{ marginTop: 12 }}>
          <MatrixGrid matrix={maxResult.out} title="MaxPooling (max de la fenêtre)" />
          <MatrixGrid matrix={avgResult.out} title="AveragePooling (moyenne de la fenêtre)" />
        </div>
      </div>

      <InfoCard
        retenir="Le pooling = garde l'information dominante. MaxPooling conserve le signal le plus fort (utile pour la détection de motifs). AveragePooling lisse les valeurs (utile pour la globalisation). Le MaxPooling est le plus courant dans les CNN MNIST/CIFAR."
        erreur="Oublier que le pooling perd de l'information spatiale. C'est un compromis : on gagne en robustesse aux translations légères mais on perd en précision de localisation (important pour la détection d'objets)."
        notebook="Dans Keras : MaxPooling2D(pool_size=(2,2)). Après un pooling 2×2, une feature map 26×26 devient 13×13. Le nombre de filtres ne change pas."
      />
    </section>
  );
}
