import { useEffect, useMemo, useState } from "react";
import MatrixGrid from "../components/MatrixGrid";
import SectionHeader from "../components/SectionHeader";
import InfoCard from "../components/InfoCard";
import { FILTERS, convolve2d, randomMatrix } from "../utils/cnnMath";

export default function ConvolutionPage() {
  const [input, setInput] = useState(() => randomMatrix(7, 7, 0, 9));
  const [filterKey, setFilterKey] = useState("edge");
  const [stride, setStride] = useState(1);
  const [animate, setAnimate] = useState(true);
  const [stepIndex, setStepIndex] = useState(0);

  const kernel = FILTERS[filterKey].kernel;
  const { out, steps } = useMemo(() => convolve2d(input, kernel, stride), [input, kernel, stride]);

  useEffect(() => {
    if (!animate || steps.length === 0) return undefined;
    const timer = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % steps.length);
    }, 600);
    return () => clearInterval(timer);
  }, [animate, steps.length]);

  useEffect(() => { setStepIndex(0); }, [stride, filterKey, input]);

  const highlighted = steps[stepIndex]?.cells || [];
  const anchor = steps[stepIndex]?.anchor;

  // Calcul local affiché
  const calcLines = useMemo(() => {
    if (!anchor || highlighted.length !== 9) return [];
    const lines = [];
    for (let ki = 0; ki < 3; ki++) {
      for (let kj = 0; kj < 3; kj++) {
        const r = anchor[0] + ki;
        const c = anchor[1] + kj;
        const iv = input[r]?.[c] ?? 0;
        const kv = kernel[ki][kj];
        lines.push({ iv, kv, prod: iv * kv });
      }
    }
    return lines;
  }, [anchor, highlighted, input, kernel]);

  const localSum = calcLines.reduce((a, l) => a + l.prod, 0);

  return (
    <section className="page">
      <SectionHeader
        step={2}
        stepLabel="Convolution"
        title="Convolution"
        subtitle="Une fenêtre 3×3 glisse sur la grille d'entrée. À chaque position, on calcule la somme des produits entre l'entrée et le noyau (filtre). C'est le détecteur local de motifs."
      />

      <div className="controls-row">
        <label>
          <span>Filtre</span>
          <select value={filterKey} onChange={(e) => setFilterKey(e.target.value)}>
            {Object.entries(FILTERS).map(([k, v]) => (
              <option key={k} value={k}>{v.name}</option>
            ))}
          </select>
        </label>
        <label>
          <span>Stride : {stride}</span>
          <input type="range" min="1" max="2" step="1" value={stride}
            onChange={(e) => setStride(Number(e.target.value))} />
        </label>
        <button type="button" className="btn secondary sm" onClick={() => setInput(randomMatrix(7, 7, 0, 9))}>
          Random input
        </button>
        <button type="button" className="btn secondary sm" onClick={() => { setInput(randomMatrix(7, 7, 0, 9)); setStepIndex(0); }}>
          Reset
        </button>
        <button type="button" className={`btn sm ${animate ? "" : " secondary"}`} onClick={() => setAnimate((v) => !v)}>
          {animate ? "Pause" : "Animer"}
        </button>
      </div>

      <div className="formula-display">
        sortie[i,j] = Σ Σ input[i+ki, j+kj] × kernel[ki, kj]
      </div>

      <div className="two-col">
        <MatrixGrid matrix={input} title="Input 7×7" highlightCells={highlighted} />
        <MatrixGrid matrix={kernel} title={`Kernel 3×3 — ${FILTERS[filterKey].name}`} />
      </div>

      {calcLines.length > 0 && (
        <div className="calc-box">
          <strong style={{ color: "var(--text)", display: "block", marginBottom: 6 }}>
            Calcul à la position [{anchor[0]},{anchor[1]}] :
          </strong>
          {calcLines.map((l, i) => (
            <span key={i} style={{ marginRight: 12 }}>
              {l.iv} × {l.kv.toFixed(2)} = <span style={{ color: "var(--accent-2)" }}>{l.prod.toFixed(2)}</span>
              {i < calcLines.length - 1 ? " + " : ""}
            </span>
          ))}
          <div style={{ marginTop: 8 }}>
            Résultat : <span className="result">{localSum.toFixed(2)}</span>
          </div>
        </div>
      )}

      <MatrixGrid matrix={out} title={`Feature map de sortie (${out.length}×${out[0]?.length ?? 0})`} />

      <InfoCard
        retenir="La convolution = un détecteur local de motifs. Chaque filtre apprend à reconnaître un type de structure (bord, texture). Plus il y a de filtres, plus le réseau détecte de motifs différents."
        erreur="Confondre le stride et le padding. Le stride contrôle le déplacement du filtre (grand stride = petite sortie). Le padding ajoute des zéros autour pour préserver la taille."
        notebook="Dans le notebook, Conv2D(32, (3,3), activation='relu') crée 32 filtres 3×3. La sortie de cette couche est une feature map de dimensions (H-2, W-2, 32) sans padding."
      />
    </section>
  );
}
