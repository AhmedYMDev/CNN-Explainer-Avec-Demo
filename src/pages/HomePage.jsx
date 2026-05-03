import PipelineStepper from "../components/PipelineStepper";
import CnnNetworkView from "../components/CnnNetworkView";

const MODULES = [
  {
    sectionId: "convolution",
    title: "Convolution",
    desc: "Fenêtre glissante 3×3, choix de filtre (edge, blur, sharpen), animation pas à pas.",
    badge: "Étape 1",
  },
  {
    sectionId: "activation",
    title: "Activation ReLU",
    desc: "Visualiser f(x)=max(0,x) : les valeurs négatives disparaissent.",
    badge: "Étape 2",
  },
  {
    sectionId: "pooling",
    title: "Pooling",
    desc: "MaxPooling vs AveragePooling : compression spatiale.",
    badge: "Étape 3",
  },
  {
    sectionId: "fully-connected",
    title: "Fully Connected",
    desc: "Flatten → Dense → Softmax : classification finale en probabilités.",
    badge: "Étape 4",
  },
  {
    sectionId: "live-demo",
    title: "Live Demo MNIST",
    desc: "Dessinez un chiffre 0-9. Le modèle TF.js réel prédit en temps réel.",
    badge: "Demo",
  },
];

function scrollTo(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth" });
}

export default function HomePage() {
  return (
    <section className="page">
      {/* Hero */}
      <div className="hero">
        <h1 className="hero-title">CNN Explainer</h1>
        <p className="hero-sub">
          Un système de visualisation interactif pour comprendre les réseaux de neurones convolutifs (CNN),
          de la convolution jusqu'à la prédiction MNIST en temps réel.
        </p>
        <div className="hero-actions">
          <button className="btn lg" onClick={() => scrollTo("convolution")}>Explorer les CNN ↓</button>
          <button className="btn lg secondary" onClick={() => scrollTo("live-demo")}>Démo Live</button>
        </div>
      </div>

      {/* Interactive CNN Architecture View */}
      <CnnNetworkView />

      {/* Pipeline */}
      <div className="pipeline-card">
        <h2>Pipeline CNN interactif</h2>
        <p className="lead" style={{ marginBottom: 20 }}>
          Cliquez sur une étape pour naviguer directement vers la section correspondante.
        </p>
        <PipelineStepper />
      </div>

      {/* Modules */}
      <div>
        <h2 style={{ marginBottom: 16 }}>Modules d'apprentissage</h2>
        <div className="module-grid">
          {MODULES.map((m) => (
            <div
              key={m.sectionId}
              className="module-card"
              onClick={() => scrollTo(m.sectionId)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && scrollTo(m.sectionId)}
              style={{ cursor: "pointer" }}
            >
              <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
                <span className="badge badge-orange">{m.badge}</span>
              </div>
              <div className="module-title">{m.title}</div>
              <div className="module-desc">{m.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* But pédagogique */}
      <div className="two-col">
        <article className="panel panel-accent">
          <h3>But pédagogique</h3>
          <p style={{ color: "var(--text-2)", lineHeight: 1.7 }}>
            Comprendre les opérations fondamentales des CNN : extraction locale de motifs par convolution,
            non-linéarité ReLU, compression spatiale par pooling, puis classification par couches denses et Softmax.
          </p>
        </article>
        <article className="panel panel-purple">
          <h3>Modèle MNIST réel</h3>
          <p style={{ color: "var(--text-2)", lineHeight: 1.7 }}>
            La section <strong style={{ color: "var(--text)" }}>Live Demo</strong> charge un modèle TensorFlow.js
            entraîné sur MNIST depuis <code>/mnist_tfjs/model.json</code>.
            En cas d'échec, l'application bascule automatiquement en mode simulation.
          </p>
        </article>
      </div>
    </section>
  );
}
