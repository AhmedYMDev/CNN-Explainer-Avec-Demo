export default function SectionHeader({ step, stepLabel, title, subtitle }) {
  return (
    <div className="section-header">
      {step != null && (
        <div>
          <span className="step-badge">
            Étape {step}{stepLabel ? ` — ${stepLabel}` : ""}
          </span>
        </div>
      )}
      <h1>{title}</h1>
      {subtitle && <p className="lead">{subtitle}</p>}
    </div>
  );
}
