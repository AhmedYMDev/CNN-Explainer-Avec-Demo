import { useEffect, useState } from "react";
import SectionHeader from "../components/SectionHeader";

function parseCSV(text) {
  const lines = text.trim().split("\n");
  const headers = lines[0].split(",");
  return lines.slice(1).map((line) => {
    const vals = line.split(",");
    return Object.fromEntries(headers.map((h, i) => [h.trim(), vals[i]?.trim() ?? ""]));
  });
}

function AccBar({ value, max = 100 }) {
  if (!value || value === "") return <span style={{ color: "var(--muted)" }}>—</span>;
  const pct = Math.min(parseFloat(value), max);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, height: 8, background: "rgba(100,160,220,0.15)", borderRadius: 4, overflow: "hidden" }}>
        <div style={{
          width: `${pct}%`, height: "100%", borderRadius: 4,
          background: pct > 95 ? "var(--success)" : pct > 85 ? "var(--accent)" : "var(--warning)"
        }} />
      </div>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.82rem", color: "var(--text-2)" }}>{pct}%</span>
    </div>
  );
}

export default function ResultsPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/results.csv")
      .then((r) => r.text())
      .then((text) => { setRows(parseCSV(text)); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <section className="page">
      <SectionHeader
        title="Résultats — Comparaison des modèles"
        subtitle="Synthèse des performances obtenues sur les différentes architectures du projet : MLP, CNN MNIST, CNN CIFAR-10, VGG, MobileNetV2."
      />

      {loading && <p className="lead">Chargement des résultats...</p>}

      {!loading && rows.length > 0 && (
        <div className="panel results-table-wrap">
          <table className="results-table">
            <thead>
              <tr>
                <th>Modèle</th>
                <th>Dataset</th>
                <th>Acc. Train</th>
                <th>Acc. Val.</th>
                <th>Acc. Test</th>
                <th>Loss Test</th>
                <th>Paramètres</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600, color: "var(--text)", whiteSpace: "nowrap" }}>{row.modele}</td>
                  <td>
                    <span className={`badge ${row.dataset === "MNIST" ? "badge-cyan" : "badge-purple"}`}>
                      {row.dataset}
                    </span>
                  </td>
                  <td><AccBar value={row.acc_train} /></td>
                  <td><AccBar value={row.acc_val} /></td>
                  <td><AccBar value={row.acc_test} /></td>
                  <td style={{ fontFamily: "var(--font-mono)", color: "var(--text-2)" }}>
                    {row.loss_test || "—"}
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", color: "var(--muted)" }}>
                    {row.params ? Number(row.params).toLocaleString() : "—"}
                  </td>
                  <td style={{ fontSize: "0.82rem", color: "var(--muted)", maxWidth: 220 }}>
                    {row.commentaire || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Summary cards */}
      <div className="three-col">
        <div className="panel panel-accent" style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2.5rem", fontWeight: 700, color: "var(--accent)" }}>99.1%</div>
          <div style={{ color: "var(--muted)", marginTop: 4 }}>Mini-CNN — Test MNIST</div>
        </div>
        <div className="panel panel-purple" style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2.5rem", fontWeight: 700, color: "var(--accent-2)" }}>87.9%</div>
          <div style={{ color: "var(--muted)", marginTop: 4 }}>MobileNetV2 — Test CIFAR-10</div>
        </div>
        <div className="panel" style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2.5rem", fontWeight: 700, color: "var(--success)" }}>+1.5%</div>
          <div style={{ color: "var(--muted)", marginTop: 4 }}>CNN vs MLP sur MNIST</div>
        </div>
      </div>

      <div className="panel">
        <h3>💡 Analyse comparative</h3>
        <ul style={{ color: "var(--text-2)", lineHeight: 2, paddingLeft: 20, margin: 0 }}>
          <li>Le <strong style={{ color: "var(--text)" }}>Mini-CNN</strong> surpasse le MLP avec 10× moins de paramètres (~93K vs ~407K).</li>
          <li>Le <strong style={{ color: "var(--text)" }}>CNN renforcé</strong> atteint 81.8% sur CIFAR-10 avec augmentation de données et BatchNorm.</li>
          <li><strong style={{ color: "var(--text)" }}>MobileNetV2</strong> (transfer learning) dépasse le CNN entraîné de zéro avec seulement ~2.3M paramètres utilisés.</li>
          <li>VGG16/VGG19 n'ont pas été exécutés localement (trop lourds sans GPU).</li>
        </ul>
      </div>
    </section>
  );
}
