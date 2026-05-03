import { useMemo, useRef, useState, useEffect, useCallback } from "react";
import DigitCanvas from "../components/DigitCanvas";
import ModelStatusBadge from "../components/ModelStatusBadge";
import PredictionBars from "../components/PredictionBars";
import SectionHeader from "../components/SectionHeader";
import InfoCard from "../components/InfoCard";

const CLASS_NAMES = ["0","1","2","3","4","5","6","7","8","9"];
const MODEL_URL = "/mnist_tfjs/model.json";

function simulatedScores() {
  const raw = Array.from({ length: 10 }, () => Math.random() * 0.8 + 0.1);
  const s = raw.reduce((a, b) => a + b, 0);
  return raw.map((v) => v / s);
}

function preprocessCanvas(tf, canvas) {
  return tf.tidy(() => {
    const pixels = tf.browser.fromPixels(canvas, 1);
    const resized = tf.image.resizeBilinear(pixels, [28, 28]);
    const normalized = resized.toFloat().div(255.0);
    return normalized.expandDims(0).reshape([1, 28, 28, 1]);
  });
}

function getConvLayers(model) {
  return (model?.layers ?? []).filter((layer) => layer?.getClassName?.() === "Conv2D");
}

async function buildGradCam(tf, model, input, classIndex, convLayerName, gradModelCache, targetSize = 280) {
  const convLayers = getConvLayers(model);
  const convLayer = convLayers.find((layer) => layer.name === convLayerName) ?? convLayers.at(-1);
  if (!convLayer) return { cam: null, error: "Grad-CAM indisponible: aucune couche Conv2D détectée." };

  const cacheKey = convLayer.name;
  let gradModel = gradModelCache[cacheKey];
  if (!gradModel) {
    gradModel = tf.model({ inputs: model.inputs, outputs: [convLayer.output, model.output] });
    gradModelCache[cacheKey] = gradModel;
  }

  let camTensor = null;
  try {
    camTensor = tf.tidy(() => {
      const gradFunction = tf.grads((modelInputs) => {
        const [, predictions] = gradModel.apply(modelInputs, { training: false });
        return predictions.squeeze().gather(classIndex);
      });

      const [convOutputs] = gradModel.predict(input);
      const [grads] = gradFunction([input]);
      const pooledGrads = grads.mean([0, 1, 2]);
      const convMap = convOutputs.squeeze();

      let cam = convMap.mul(pooledGrads).sum(-1).relu();
      cam = cam.div(cam.max().add(1e-8));

      return tf.image.resizeBilinear(cam.expandDims(-1), [targetSize, targetSize], true).squeeze().clone();
    });
    return { cam: camTensor, error: null };
  } catch {
    camTensor?.dispose();
    return { cam: null, error: "Grad-CAM indisponible pour ce modèle TF.js." };
  }
}

async function heatmapToDataUrl(heatmap) {
  const [height, width] = heatmap.shape;
  const values = await heatmap.data();
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  const imageData = ctx.createImageData(width, height);

  for (let i = 0; i < values.length; i += 1) {
    const v = Math.max(0, Math.min(1, values[i]));
    const idx = i * 4;
    imageData.data[idx] = Math.floor(255 * v);
    imageData.data[idx + 1] = Math.floor(110 * (1 - v));
    imageData.data[idx + 2] = 0;
    imageData.data[idx + 3] = Math.floor(180 * v);
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL("image/png");
}

function normalizeModelTopology(topology) {
  const layers = topology?.model_config?.config?.layers;
  if (!Array.isArray(layers)) return topology;
  const normalizedLayers = layers.map((layer) => {
    if (layer?.class_name !== "InputLayer") return layer;
    const config = layer.config ?? {};
    if (!config.batch_shape || config.batchInputShape) return layer;
    return { ...layer, config: { ...config, batchInputShape: config.batch_shape } };
  });
  return {
    ...topology,
    model_config: {
      ...topology.model_config,
      config: { ...topology.model_config.config, layers: normalizedLayers },
    },
  };
}

function joinUrl(baseUrl, filePath) {
  if (filePath.startsWith("http://") || filePath.startsWith("https://") || filePath.startsWith("/")) return filePath;
  return `${baseUrl}${filePath}`;
}

function concatArrayBuffers(buffers) {
  const total = buffers.reduce((sum, buf) => sum + buf.byteLength, 0);
  const merged = new Uint8Array(total);
  let offset = 0;
  for (const buf of buffers) { merged.set(new Uint8Array(buf), offset); offset += buf.byteLength; }
  return merged.buffer;
}

async function loadModelWithCompat(tf) {
  const modelResponse = await fetch(MODEL_URL);
  if (!modelResponse.ok) throw new Error("Model JSON unavailable");
  const modelJson = await modelResponse.json();
  const baseUrl = MODEL_URL.slice(0, MODEL_URL.lastIndexOf("/") + 1);
  const normalizedTopology = normalizeModelTopology(modelJson.modelTopology);
  const groups = modelJson.weightsManifest ?? [];
  const weightSpecs = groups.flatMap((g) => g.weights ?? []);
  const shardUrls = groups.flatMap((g) => (g.paths ?? []).map((p) => joinUrl(baseUrl, p)));
  const shardBuffers = await Promise.all(
    shardUrls.map(async (url) => {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Weight shard unavailable: ${url}`);
      return res.arrayBuffer();
    })
  );
  const weightData = concatArrayBuffers(shardBuffers);
  const ioHandler = {
    load: async () => ({
      modelTopology: normalizedTopology, weightSpecs, weightData,
      format: modelJson.format, generatedBy: modelJson.generatedBy, convertedBy: modelJson.convertedBy,
    }),
  };
  return tf.loadLayersModel(ioHandler);
}

function Preview28({ canvasRef }) {
  const previewRef = useRef(null);

  useEffect(() => {
    const src = canvasRef.current;
    const dst = previewRef.current;
    if (!src || !dst) return;
    const ctx = dst.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, 28, 28);
    ctx.drawImage(src, 0, 0, 28, 28);
  });

  return (
    <div className="preview-canvas-wrap">
      <canvas ref={previewRef} width={28} height={28} style={{ width: 84, height: 84, imageRendering: "pixelated" }} />
      <span className="preview-label">Aperçu 28×28</span>
    </div>
  );
}

export default function LiveDemoPage() {
  const modelRef = useRef(null);
  const tfRef = useRef(null);
  const gradModelCacheRef = useRef({});
  const canvasContainerRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [scores, setScores] = useState(() => Array(10).fill(0));
  const [pred, setPred] = useState(null);
  const [mode, setMode] = useState("inconnu");
  const [isEmpty, setIsEmpty] = useState(true);
  const [gradCamEnabled, setGradCamEnabled] = useState(true);
  const [gradCamUrl, setGradCamUrl] = useState(null);
  const [gradCamMessage, setGradCamMessage] = useState("");
  const [inputPreviewUrl, setInputPreviewUrl] = useState(null);
  const [convLayerNames, setConvLayerNames] = useState([]);
  const [selectedConvLayer, setSelectedConvLayer] = useState("");
  const [compareLayers, setCompareLayers] = useState(false);
  const [secondConvLayer, setSecondConvLayer] = useState("");
  const [secondGradCamUrl, setSecondGradCamUrl] = useState(null);
  const [gradCamOpacity, setGradCamOpacity] = useState(0.7);

  const sorted = useMemo(
    () => scores.map((v, i) => ({ label: CLASS_NAMES[i], value: v })).sort((a, b) => b.value - a.value),
    [scores]
  );
  const top3 = sorted.slice(0, 3);

  const getTf = async () => {
    if (tfRef.current) return tfRef.current;
    const tf = await import("@tensorflow/tfjs");
    tfRef.current = tf;
    return tf;
  };

  const loadModel = useCallback(async () => {
    if (modelRef.current) return modelRef.current;
    try {
      setLoading(true);
      setMode("loading");
      const tf = await getTf();
      const response = await fetch(MODEL_URL);
      if (!response.ok) { setMode("simule"); return null; }
      let m;
      try { m = await tf.loadLayersModel(MODEL_URL); }
      catch { m = await loadModelWithCompat(tf); }
      modelRef.current = m;
      const convNames = getConvLayers(m).map((layer) => layer.name);
      setConvLayerNames(convNames);
      setSelectedConvLayer((current) => (current && convNames.includes(current) ? current : (convNames.at(-1) ?? "")));
      setSecondConvLayer((current) => {
        if (current && convNames.includes(current)) return current;
        if (convNames.length >= 2) return convNames[convNames.length - 2];
        return convNames.at(-1) ?? "";
      });
      setMode("tfjs");
      return m;
    } catch {
      setMode("simule");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const onPredict = async () => {
    const model = await loadModel();
    const canvas = canvasContainerRef.current?.querySelector("canvas");
    if (!canvas) return;

    if (isEmpty) { return; }

    if (!model) {
      const fake = simulatedScores();
      setScores(fake);
      setPred(fake.indexOf(Math.max(...fake)));
      setGradCamUrl(null);
      setSecondGradCamUrl(null);
      setInputPreviewUrl(canvas.toDataURL("image/png"));
      setGradCamMessage(gradCamEnabled ? "Grad-CAM indisponible en mode simulation." : "");
      return;
    }

    const tf = await getTf();
    const input = preprocessCanvas(tf, canvas);
    let prediction;
    try {
      prediction = model.predict(input);
      const probs = await prediction.data();
      const values = Array.from(probs);
      const classIndex = values.indexOf(Math.max(...values));
      setScores(values);
      setPred(classIndex);
      setInputPreviewUrl(canvas.toDataURL("image/png"));

      if (!gradCamEnabled) {
        setGradCamUrl(null);
        setSecondGradCamUrl(null);
        setGradCamMessage("");
      } else {
        const { cam, error } = await buildGradCam(tf, model, input, classIndex, selectedConvLayer, gradModelCacheRef.current, canvas.width);
        if (!cam) {
          setGradCamUrl(null);
          setSecondGradCamUrl(null);
          setGradCamMessage(error ?? "Grad-CAM indisponible.");
        } else {
          const url = await heatmapToDataUrl(cam);
          cam.dispose();
          setGradCamUrl(url);
          setGradCamMessage("");

          if (compareLayers && secondConvLayer && secondConvLayer !== selectedConvLayer) {
            const second = await buildGradCam(tf, model, input, classIndex, secondConvLayer, gradModelCacheRef.current, canvas.width);
            if (second.cam) {
              const secondUrl = await heatmapToDataUrl(second.cam);
              second.cam.dispose();
              setSecondGradCamUrl(secondUrl);
            } else {
              setSecondGradCamUrl(null);
            }
          } else {
            setSecondGradCamUrl(null);
          }
        }
      }
    } finally {
      input.dispose();
      if (Array.isArray(prediction)) prediction.forEach((t) => t.dispose());
      else prediction?.dispose();
    }
  };

  const handleClear = () => {
    // Reset predictions and scores
    setPred(null);
    setScores(Array(10).fill(0));
    setIsEmpty(true);
    setGradCamUrl(null);
    setSecondGradCamUrl(null);
    setGradCamMessage("");
    setInputPreviewUrl(null);
    // Clear the drawing canvas
    const canvas = canvasContainerRef.current?.querySelector("canvas");
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  };

  return (
    <section className="page">
      <SectionHeader
        step={6}
        stepLabel="Prédiction en temps réel"
        title="Live Demo — Reconnaissance MNIST"
        subtitle="Dessinez un chiffre (0–9) dans le canvas ci-dessous. Le modèle TensorFlow.js entraîné sur MNIST prédit votre chiffre en temps réel."
      />

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <ModelStatusBadge mode={mode} />
        <span className="badge badge-purple">
          /mnist_tfjs/model.json
        </span>
      </div>

      {mode === "simule" && (
        <div className="warning">
          Modèle TF.js introuvable à <code>/mnist_tfjs/model.json</code>. Les prédictions affichées sont simulées.
        </div>
      )}

      <div className="live-layout">
        {/* Colonne gauche */}
        <div style={{ display: "grid", gap: 16 }}>
          <div ref={canvasContainerRef}>
            <DigitCanvas onChange={() => setIsEmpty(false)} />
          </div>

          <div className="canvas-actions">
            <label className="gradcam-toggle">
              <input
                type="checkbox"
                checked={gradCamEnabled}
                onChange={(event) => setGradCamEnabled(event.target.checked)}
              />
              <span>Activer Grad-CAM</span>
            </label>
            {gradCamEnabled && convLayerNames.length > 0 && (
              <label className="gradcam-toggle">
                <span>Couche</span>
                <select value={selectedConvLayer} onChange={(event) => setSelectedConvLayer(event.target.value)}>
                  {convLayerNames.map((name) => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </label>
            )}
            {gradCamEnabled && convLayerNames.length > 1 && (
              <label className="gradcam-toggle">
                <input
                  type="checkbox"
                  checked={compareLayers}
                  onChange={(event) => setCompareLayers(event.target.checked)}
                />
                <span>Comparer 2 couches</span>
              </label>
            )}
            {gradCamEnabled && compareLayers && convLayerNames.length > 1 && (
              <label className="gradcam-toggle">
                <span>Couche 2</span>
                <select value={secondConvLayer} onChange={(event) => setSecondConvLayer(event.target.value)}>
                  {convLayerNames.map((name) => (
                    <option key={`second-${name}`} value={name}>{name}</option>
                  ))}
                </select>
              </label>
            )}
            <button type="button" className="btn secondary sm" onClick={handleClear}>
              Effacer
            </button>
            <button
              type="button"
              className="btn sm"
              onClick={onPredict}
              disabled={loading || isEmpty}
            >
              {loading ? "Chargement..." : "Prédire"}
            </button>
          </div>

          {isEmpty && (
            <div className="empty-msg">Dessinez un chiffre dans le canvas pour prédire</div>
          )}

          {/* Preview 28×28 */}
          {!isEmpty && (
            <div className="panel" style={{ display: "flex", justifyContent: "center" }}>
              <Preview28 canvasRef={{ current: canvasContainerRef.current?.querySelector("canvas") }} />
            </div>
          )}
        </div>

        {/* Colonne droite */}
        <div style={{ display: "grid", gap: 16, alignContent: "start" }}>
          {pred !== null && (
            <>
              <div className="panel panel-accent" style={{ textAlign: "center" }}>
                <div className="prediction-big">{pred}</div>
                <div className="prediction-label">Prédiction principale</div>
                <div style={{ marginTop: 8 }}>
                  <span className="badge badge-green">{(Math.max(...scores) * 100).toFixed(1)}% de confiance</span>
                </div>
              </div>

              {/* Top 3 */}
              <div className="panel">
                <h3>Top 3 prédictions</h3>
                <div className="top3-grid" style={{ marginTop: 12 }}>
                  {top3.map((item, i) => (
                    <div key={item.label} className={`top3-card${i === 0 ? " first" : ""}`}>
                      <div className="digit">{item.label}</div>
                      <div className="prob">{(item.value * 100).toFixed(1)}%</div>
                      {i === 0 && <div style={{ fontSize: "0.7rem", color: "var(--accent)", marginTop: 4 }}>★ Meilleure</div>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Barres probabilités */}
              <div className="panel">
                <h3>Probabilités — 10 classes</h3>
                <div style={{ marginTop: 12 }}>
                  <PredictionBars scores={scores} topN={3} />
                </div>
              </div>

              {gradCamEnabled && (
                <div className="panel">
                  <h3>Grad-CAM</h3>
                  <div className="gradcam-opacity-control">
                    <span>Opacité heatmap</span>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={gradCamOpacity}
                      onChange={(event) => setGradCamOpacity(Number(event.target.value))}
                    />
                    <strong>{Math.round(gradCamOpacity * 100)}%</strong>
                  </div>
                  {gradCamUrl && inputPreviewUrl ? (
                    <div className={`gradcam-grid${secondGradCamUrl ? " two" : ""}`} style={{ marginTop: 12 }}>
                      <div>
                        <div className="gradcam-layer-label">{selectedConvLayer || "Couche principale"}</div>
                        <div className="gradcam-preview">
                          <img src={inputPreviewUrl} alt="Entrée" className="gradcam-base" />
                          <img src={gradCamUrl} alt="Heatmap Grad-CAM" className="gradcam-overlay" style={{ opacity: gradCamOpacity }} />
                        </div>
                      </div>
                      {secondGradCamUrl && (
                        <div>
                          <div className="gradcam-layer-label">{secondConvLayer || "Couche secondaire"}</div>
                          <div className="gradcam-preview">
                            <img src={inputPreviewUrl} alt="Entrée" className="gradcam-base" />
                            <img src={secondGradCamUrl} alt="Heatmap Grad-CAM couche 2" className="gradcam-overlay" style={{ opacity: gradCamOpacity }} />
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="muted" style={{ marginTop: 8 }}>
                      {gradCamMessage || "Lancez une prédiction pour afficher la heatmap."}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {pred === null && (
            <div className="panel" style={{ display: "grid", placeItems: "center", minHeight: 200 }}>
              <div style={{ textAlign: "center", color: "var(--muted)" }}>
                <p>Le résultat de la prédiction apparaîtra ici</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <InfoCard
        retenir="Le modèle CNN entraîné sur MNIST atteint ~99% de précision sur le dataset de test. Il a appris à reconnaître les chiffres manuscrits en détectant des motifs (bords, courbes) via des couches de convolution."
        erreur="Dessiner le chiffre trop petit ou trop dans un coin. Le modèle MNIST s'attend à un chiffre centré et occupant la majorité du canvas de 28×28 pixels."
        notebook="Le modèle est entraîné dans le notebook avec model.fit(x_train, y_train). Il est ensuite exporté avec tensorflowjs_converter vers le format TF.js pour être chargé dans le navigateur."
      />
    </section>
  );
}
