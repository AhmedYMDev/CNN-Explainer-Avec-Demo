export default function MatrixGrid({ matrix, title, highlightCells = [] }) {
  const highlightSet = new Set(highlightCells.map(([r, c]) => `${r},${c}`));

  return (
    <div className="panel">
      <h3>{title}</h3>
      <div
        className="matrix-grid"
        style={{
          gridTemplateColumns: `repeat(${matrix[0].length}, minmax(22px, 1fr))`,
        }}
      >
        {matrix.flatMap((row, r) =>
          row.map((value, c) => {
            const key = `${r}-${c}`;
            const highlighted = highlightSet.has(`${r},${c}`);
            return (
              <div key={key} className={highlighted ? "cell highlighted" : "cell"}>
                {Number(value).toFixed(1).replace(/\.0$/, "")}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
