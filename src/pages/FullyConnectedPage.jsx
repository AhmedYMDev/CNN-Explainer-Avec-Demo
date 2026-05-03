import { useMemo, useState } from "react";
import SectionHeader from "../components/SectionHeader";
import InfoCard from "../components/InfoCard";
import PredictionBars from "../components/PredictionBars";

function softmax(arr) {
  const maxVal = Math.max(...arr);
  const exps = arr.map((v) => Math.exp(v - maxVal));
  const s = exps.reduce((a, b) => a + b, 0);
  return exps.map((v) => v / s);
}
function randomVec(n, min = 0, max = 1) {
  return Array.from({ length: n }, () => min + Math.random() * (max - min));
}

export default function FullyConnectedPage() {
  const [features, setFeatures] = useState(() => randomVec(12, 0, 1));

  const hidden = useMemo(() => {
    const w = randomVec(8, -1, 1);
    return w.map((wi, i) => Math.max(0, wi + features[i % features.length]));
  }, [features]);

  const logits = useMemo(() => {
    return Array.from({ length: 10 }, (_, i) =>
      hidden[(i + 2) % hidden.length] * (0.6 + i * 0.03)
    );
  }, [hidden]);

  const probs = useMemo(() => softmax(logits), [logits]);
  const predicted = useMemo(() => probs.indexOf(Math.max(...probs)), [probs]);

  const sorted = useMemo(() =>
    probs.map((p, i) => ({ p, i })).sort((a, b) => b.p - a.p),
    [probs]
  );

  return (
    <section className="page">
      <SectionHeader
        step={5}
        stepLabel="Fully Connected"
        title="Fully Connected"
        subtitle="Les features extraites sont aplaties (Flatten), passées dans des couches Dense avec ReLU, puis Softmax transforme les logits en probabilités normalisées sur 10 classes."
      />

      <div className="controls-row">
        <button type="button" className="btn" onClick={() => setFeatures(randomVec(12, 0, 1))}>
          Nouvelle propagation
        </button>
      </div>

      <div className="formula-display">
        Softmax(zᵢ) = e^zᵢ / Σⱼ e^zʲ — la somme des probabilités = 1
      </div>

      <div className="three-col">
        <article className="panel">
          <h3>Feature vector (Flatten)</h3>
          <p className="muted" style={{ fontSize: "0.82rem", marginBottom: 10 }}>
            Sortie du dernier pooling aplatie en 1D
          </p>
          <ul className="vector-list">
            {features.map((v, i) => (
              <li key={`f-${i}`}>
                <span style={{ color: "var(--muted)", marginRight: 8, fontSize: "0.75rem" }}>x{i}</span>
                {v.toFixed(3)}
              </li>
            ))}
          </ul>
        </article>

        <article className="panel">
          <h3>Hidden layer (Dense + ReLU)</h3>
          <p className="muted" style={{ fontSize: "0.82rem", marginBottom: 10 }}>
            128 neurones, activation ReLU
          </p>
          <ul className="vector-list">
            {hidden.map((v, i) => (
              <li key={`h-${i}`} className={v === 0 ? "" : ""}>
                <span style={{ color: "var(--muted)", marginRight: 8, fontSize: "0.75rem" }}>h{i}</span>
                <span style={{ color: v === 0 ? "var(--muted)" : "var(--success)" }}>{v.toFixed(3)}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="panel">
          <h3>Softmax output</h3>
          <p className="muted" style={{ fontSize: "0.82rem", marginBottom: 10 }}>
            10 classes (chiffres 0-9)
          </p>
          <ul className="vector-list">
            {sorted.map(({ p, i }) => (
              <li key={`p-${i}`} className={i === predicted ? "selected" : ""}>
                <span style={{ marginRight: 8 }}>Classe {i}</span>
                <span style={{ color: i === predicted ? "var(--accent)" : "var(--muted)" }}>
                  {(p * 100).toFixed(1)}%
                </span>
              </li>
            ))}
          </ul>
        </article>
      </div>

      {/* Résultat */}
      <div className="panel panel-accent">
        <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
          <div>
            <div className="prediction-big">{predicted}</div>
            <div className="prediction-label">Prédiction</div>
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <h3 style={{ marginBottom: 12 }}>Probabilités (toutes classes)</h3>
            <PredictionBars scores={probs} topN={3} />
          </div>
        </div>
      </div>

      <InfoCard
        retenir="Softmax transforme n'importe quel vecteur de scores (logits) en probabilités qui somment à 1. La classe avec la probabilité la plus haute est la prédiction finale du réseau."
        erreur="Confondre logits et probabilités. Les logits sont les sorties brutes de la couche Dense finale (peuvent être négatifs ou > 1). Softmax les convertit en probabilités ∈ [0,1] avec somme = 1."
        notebook="Dans Keras : Dense(10, activation='softmax'). Pour l'entraînement : loss='categorical_crossentropy' si one-hot, ou 'sparse_categorical_crossentropy' si labels entiers."
      />
    </section>
  );
}
