const STEPS = [
  { label: "Input",       icon: "IN",  sectionId: "hero" },
  { label: "Convolution",  icon: "CV",  sectionId: "convolution" },
  { label: "ReLU",         icon: "RE",  sectionId: "activation" },
  { label: "Pooling",      icon: "PL",  sectionId: "pooling" },
  { label: "Dense",        icon: "FC",  sectionId: "fully-connected" },
  { label: "Softmax",      icon: "SM",  sectionId: "live-demo" },
];

export default function PipelineStepper({ activeStep }) {
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="pipeline-stepper">
      {STEPS.map((step, i) => (
        <div key={step.sectionId} style={{ display: "flex", alignItems: "center" }}>
          <div
            className={`pipeline-step${activeStep === i ? " active" : ""}`}
            onClick={() => scrollTo(step.sectionId)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && scrollTo(step.sectionId)}
          >
            <div className="step-icon">{step.icon}</div>
            <div className="step-label">{step.label}</div>
          </div>
          {i < STEPS.length - 1 && <div className="step-connector" />}
        </div>
      ))}
    </div>
  );
}
