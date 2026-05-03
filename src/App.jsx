import { lazy, Suspense } from "react";
import NavBar from "./components/NavBar";
import PresentationToggle from "./components/PresentationToggle";
import HomePage from "./pages/HomePage";
import ConvolutionPage from "./pages/ConvolutionPage";
import ActivationPage from "./pages/ActivationPage";
import PoolingPage from "./pages/PoolingPage";
import FullyConnectedPage from "./pages/FullyConnectedPage";
import ResultsPage from "./pages/ResultsPage";

const LiveDemoPage = lazy(() => import("./pages/LiveDemoPage"));

function SectionLoader() {
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "20vh" }}>
      <div style={{ textAlign: "center", color: "var(--muted)" }}>
        <p>Chargement...</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <div className="app-shell">
      <NavBar />
      <main className="content-wrap">
        <div id="hero" className="section-block">
          <HomePage />
        </div>
        <div id="convolution" className="section-block">
          <ConvolutionPage />
        </div>
        <div id="activation" className="section-block">
          <ActivationPage />
        </div>
        <div id="pooling" className="section-block">
          <PoolingPage />
        </div>
        <div id="fully-connected" className="section-block">
          <FullyConnectedPage />
        </div>
        <div id="live-demo" className="section-block">
          <Suspense fallback={<SectionLoader />}>
            <LiveDemoPage />
          </Suspense>
        </div>
        <div id="results" className="section-block">
          <ResultsPage />
        </div>
      </main>
      <PresentationToggle />
    </div>
  );
}
