import { useEffect, useState } from "react";

export default function PresentationToggle() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (active) {
      root.classList.add("presentation-mode");
    } else {
      root.classList.remove("presentation-mode");
    }
    return () => root.classList.remove("presentation-mode");
  }, [active]);

  return (
    <button
      className={`pres-toggle${active ? " active" : ""}`}
      onClick={() => setActive((v) => !v)}
      title="Mode soutenance"
      type="button"
    >
      <span>{active ? "Défaut" : "Proj."}</span>
      <span>{active ? "Mode soutenance ON" : "Mode soutenance"}</span>
    </button>
  );
}
