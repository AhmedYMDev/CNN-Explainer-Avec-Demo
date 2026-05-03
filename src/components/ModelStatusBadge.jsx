export default function ModelStatusBadge({ mode }) {
  if (mode === "tfjs") {
    return (
      <span className="badge badge-green">
        <span className="badge-dot" />
        Modèle réel chargé — /mnist_tfjs/model.json
      </span>
    );
  }
  if (mode === "simule") {
    return (
      <span className="badge badge-orange">
        <span className="badge-dot" />
        Mode simulation (modèle introuvable)
      </span>
    );
  }
  if (mode === "loading") {
    return (
      <span className="badge badge-cyan">
        <span className="badge-dot" />
        Chargement du modèle TF.js...
      </span>
    );
  }
  return (
    <span className="badge badge-purple">
      <span className="badge-dot" />
      Modèle non chargé
    </span>
  );
}
