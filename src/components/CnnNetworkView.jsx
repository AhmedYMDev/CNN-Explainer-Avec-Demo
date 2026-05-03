import { useState, useMemo } from "react";

const LAYERS = [
  { id: "input", label: "Input", shape: "28×28×1", maps: 1, w: 28, h: 28, color: "#888" },
  { id: "conv1", label: "Conv2D", shape: "26×26×32", maps: 6, w: 16, h: 16, color: "#ff6600" },
  { id: "relu1", label: "ReLU", shape: "26×26×32", maps: 6, w: 16, h: 16, color: "#28a745" },
  { id: "pool1", label: "MaxPool", shape: "13×13×32", maps: 6, w: 10, h: 10, color: "#4a90d9" },
  { id: "conv2", label: "Conv2D", shape: "11×11×64", maps: 8, w: 10, h: 10, color: "#ff6600" },
  { id: "relu2", label: "ReLU", shape: "11×11×64", maps: 8, w: 10, h: 10, color: "#28a745" },
  { id: "pool2", label: "MaxPool", shape: "5×5×64", maps: 8, w: 6, h: 6, color: "#4a90d9" },
  { id: "flatten", label: "Flatten", shape: "1600", maps: 1, w: 4, h: 40, color: "#6b4c9a" },
  { id: "dense", label: "Dense", shape: "128", maps: 1, w: 4, h: 28, color: "#e8a317" },
  { id: "output", label: "Softmax", shape: "10", maps: 1, w: 4, h: 20, color: "#dc3545" },
];

/* Generate pseudo-random heatmap colors for feature map cells */
function generateHeatmapColor(layerIdx, mapIdx, seed) {
  const v = Math.sin(layerIdx * 31 + mapIdx * 17 + seed * 7) * 0.5 + 0.5;
  if (v < 0.3) return `hsl(220, 60%, ${40 + v * 40}%)`;
  if (v < 0.6) return `hsl(35, 10%, ${70 + v * 20}%)`;
  return `hsl(25, 90%, ${40 + (1 - v) * 30}%)`;
}

function FeatureMapStack({ layer, layerIdx }) {
  const maps = [];
  const stackOffset = 2;
  for (let i = layer.maps - 1; i >= 0; i--) {
    const bg = generateHeatmapColor(layerIdx, i, 42);
    maps.push(
      <div
        key={i}
        className="feature-map-cell"
        style={{
          width: layer.w,
          height: layer.h,
          background: bg,
          border: `1px solid rgba(0,0,0,0.12)`,
          position: "absolute",
          top: i * stackOffset,
          left: i * stackOffset,
          zIndex: layer.maps - i,
        }}
      />
    );
  }
  const totalW = layer.w + (layer.maps - 1) * stackOffset;
  const totalH = layer.h + (layer.maps - 1) * stackOffset;
  return (
    <div style={{ position: "relative", width: totalW, height: totalH }}>
      {maps}
    </div>
  );
}

export default function CnnNetworkView({ onLayerClick }) {
  const [hoveredLayer, setHoveredLayer] = useState(null);

  const sectionMap = {
    input: "hero",
    conv1: "convolution",
    relu1: "activation",
    pool1: "pooling",
    conv2: "convolution",
    relu2: "activation",
    pool2: "pooling",
    flatten: "fully-connected",
    dense: "fully-connected",
    output: "live-demo",
  };

  const handleClick = (layer) => {
    const sectionId = sectionMap[layer.id];
    if (sectionId) {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
    onLayerClick?.(layer);
  };

  return (
    <div className="cnn-network-view">
      <h3>Architecture du réseau — Tiny CNN (MNIST)</h3>
      <div className="network-layers">
        {LAYERS.map((layer, i) => (
          <div key={layer.id} style={{ display: "flex", alignItems: "center" }}>
            <div
              className="network-layer"
              onMouseEnter={() => setHoveredLayer(layer.id)}
              onMouseLeave={() => setHoveredLayer(null)}
              onClick={() => handleClick(layer)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && handleClick(layer)}
            >
              {hoveredLayer === layer.id && (
                <div className="layer-tooltip">
                  {layer.label} — {layer.shape}
                  <br />
                  <span style={{ opacity: 0.7 }}>Cliquer pour naviguer</span>
                </div>
              )}
              <FeatureMapStack layer={layer} layerIdx={i} />
              <span className="layer-label" style={{ color: layer.color }}>{layer.label}</span>
              <span className="layer-shape">{layer.shape}</span>
            </div>
            {i < LAYERS.length - 1 && <div className="layer-connector" />}
          </div>
        ))}
      </div>
    </div>
  );
}
