# CNN Visualizer App

Application React/Vite pour visualiser les operations d'un CNN.

## Installation
```bash
npm install
```

## Lancer en developpement
```bash
npm run dev
```

## Build de production
```bash
npm run build
```

## Modele TF.js
La page Live Demo charge le modele depuis:

```text
public/mnist_tfjs/model.json
```

Exporter le modele Keras depuis la racine du projet:

```bash
tensorflowjs_converter \
  --input_format=keras \
  results/models/mnist_cnn.h5 \
  app/public/mnist_tfjs
```

Si ce fichier est absent, l'application bascule en mode simulation. Ce mode est utile pour tester l'interface, mais il ne doit pas remplacer la vraie demo pendant la soutenance.

## Publication GitHub
Ne pas versionner `node_modules/` ni `dist/`. Ils sont regeneres par `npm install` et `npm run build`.
Le modele `public/mnist_tfjs/` est volontairement conserve: il est leger et permet a la demo de fonctionner apres un simple clone du depot.
