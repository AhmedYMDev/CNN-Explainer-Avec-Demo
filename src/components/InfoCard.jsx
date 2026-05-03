function BookIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 2h5a1 1 0 0 1 1 1v10a1 1 0 0 0-1-1H2V2zm12 0H9a1 1 0 0 0-1 1v10a1 1 0 0 1 1-1h5V2z"/>
    </svg>
  );
}
function AlertIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="8" cy="8" r="6"/>
      <path d="M8 5v3m0 2.5v.5"/>
    </svg>
  );
}
function LinkIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M6 10l4-4M9 5h2v2M5 11H4a3 3 0 0 1 0-6h2M11 5h1a3 3 0 0 1 0 6h-2"/>
    </svg>
  );
}

export default function InfoCard({ retenir, erreur, notebook }) {
  return (
    <div className="panel pedagogic-panel">
      {retenir && (
        <div className="info-box retenir">
          <div className="info-box-title"><BookIcon />À retenir</div>
          <p>{retenir}</p>
        </div>
      )}
      {erreur && (
        <div className="info-box erreur">
          <div className="info-box-title"><AlertIcon />Erreur fréquente</div>
          <p>{erreur}</p>
        </div>
      )}
      {notebook && (
        <div className="info-box notebook">
          <div className="info-box-title"><LinkIcon />Lien avec le notebook</div>
          <p>{notebook}</p>
        </div>
      )}
    </div>
  );
}
