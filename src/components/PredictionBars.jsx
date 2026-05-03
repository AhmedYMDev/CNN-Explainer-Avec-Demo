const CLASS_NAMES = ["0","1","2","3","4","5","6","7","8","9"];

export default function PredictionBars({ scores, topN = 3 }) {
  const sorted = scores
    .map((v, i) => ({ label: CLASS_NAMES[i], value: v, idx: i }))
    .sort((a, b) => b.value - a.value);

  const topSet = new Set(sorted.slice(0, topN).map((x) => x.idx));

  return (
    <ul className="score-list">
      {sorted.map((item) => (
        <li key={item.label}>
          <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: topSet.has(item.idx) ? "var(--accent)" : "var(--muted)" }}>
            {item.label}
          </span>
          <div className="score-bar-bg">
            <div
              className={`score-bar${topSet.has(item.idx) ? " top" : ""}`}
              style={{ width: `${(item.value * 100).toFixed(1)}%` }}
            />
          </div>
          <strong style={{ fontFamily: "var(--font-mono)", fontSize: "0.82rem", color: topSet.has(item.idx) ? "var(--success)" : "var(--muted)" }}>
            {(item.value * 100).toFixed(1)}%
          </strong>
        </li>
      ))}
    </ul>
  );
}
