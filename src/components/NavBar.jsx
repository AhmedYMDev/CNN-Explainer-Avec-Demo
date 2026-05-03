import { useState, useEffect, useCallback } from "react";

const NAV_ITEMS = [
  { id: "hero", label: "Accueil" },
  { id: "convolution", label: "Convolution" },
  { id: "activation", label: "ReLU" },
  { id: "pooling", label: "Pooling" },
  { id: "fully-connected", label: "FC" },
  { id: "live-demo", label: "Live Demo" },
  { id: "results", label: "Résultats" },
];

function BrainIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-1.07-4.85A3 3 0 0 1 4.5 9.5a3 3 0 0 1 5-2.23M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 1.07-4.85A3 3 0 0 0 19.5 9.5a3 3 0 0 0-5-2.23"/>
    </svg>
  );
}
function HamburgerIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  );
}
function CloseIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  );
}

export default function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");

  const handleScroll = useCallback(() => {
    const scrollY = window.scrollY + 100;
    let current = "hero";
    for (const item of NAV_ITEMS) {
      const el = document.getElementById(item.id);
      if (el && el.offsetTop <= scrollY) {
        current = item.id;
      }
    }
    setActiveSection(current);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  return (
    <>
      <header className="top-nav">
        <a href="#hero" className="brand" onClick={(e) => { e.preventDefault(); scrollTo("hero"); }}>
          <span className="brand-icon"><BrainIcon /></span>
          CNN Explainer
        </a>
        <nav className="nav-links">
          {NAV_ITEMS.map(({ id, label }) => (
            <a
              key={id}
              href={`#${id}`}
              className={activeSection === id ? "link active" : "link"}
              onClick={(e) => { e.preventDefault(); scrollTo(id); }}
            >
              {label}
            </a>
          ))}
        </nav>
        <div className="nav-actions">
          <button
            type="button"
            className="hamburger"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Menu"
          >
            {menuOpen ? <CloseIcon /> : <HamburgerIcon />}
          </button>
        </div>
      </header>
      <nav className={`mobile-menu${menuOpen ? " open" : ""}`}>
        {NAV_ITEMS.map(({ id, label }) => (
          <a
            key={id}
            href={`#${id}`}
            className={activeSection === id ? "mobile-link active" : "mobile-link"}
            onClick={(e) => { e.preventDefault(); scrollTo(id); }}
          >
            {label}
          </a>
        ))}
      </nav>
    </>
  );
}
