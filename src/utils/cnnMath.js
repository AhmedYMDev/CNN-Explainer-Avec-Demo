export const FILTERS = {
  edge: {
    name: "Edge Detection",
    kernel: [
      [-1, -1, -1],
      [-1, 8, -1],
      [-1, -1, -1],
    ],
  },
  sharpen: {
    name: "Sharpen",
    kernel: [
      [0, -1, 0],
      [-1, 5, -1],
      [0, -1, 0],
    ],
  },
  blur: {
    name: "Blur",
    kernel: [
      [1 / 9, 1 / 9, 1 / 9],
      [1 / 9, 1 / 9, 1 / 9],
      [1 / 9, 1 / 9, 1 / 9],
    ],
  },
  emboss: {
    name: "Emboss",
    kernel: [
      [-2, -1, 0],
      [-1, 1, 1],
      [0, 1, 2],
    ],
  },
};

export function randomMatrix(rows, cols, min = 0, max = 9) {
  const m = [];
  for (let r = 0; r < rows; r += 1) {
    const row = [];
    for (let c = 0; c < cols; c += 1) {
      row.push(Math.floor(Math.random() * (max - min + 1)) + min);
    }
    m.push(row);
  }
  return m;
}

export function reluArray(arr) {
  return arr.map((v) => Math.max(0, v));
}

export function convolve2d(input, kernel, stride = 1) {
  const out = [];
  const steps = [];
  for (let i = 0; i <= input.length - 3; i += stride) {
    const row = [];
    for (let j = 0; j <= input[0].length - 3; j += stride) {
      let sum = 0;
      const cells = [];
      for (let ki = 0; ki < 3; ki += 1) {
        for (let kj = 0; kj < 3; kj += 1) {
          sum += input[i + ki][j + kj] * kernel[ki][kj];
          cells.push([i + ki, j + kj]);
        }
      }
      row.push(Number(sum.toFixed(2)));
      steps.push({ anchor: [i, j], cells });
    }
    out.push(row);
  }
  return { out, steps };
}

export function pool2d(input, mode = "max") {
  const out = [];
  const steps = [];
  for (let i = 0; i < input.length; i += 2) {
    const row = [];
    for (let j = 0; j < input[0].length; j += 2) {
      const vals = [input[i][j], input[i][j + 1], input[i + 1][j], input[i + 1][j + 1]];
      const pooled = mode === "avg" ? vals.reduce((a, b) => a + b, 0) / 4 : Math.max(...vals);
      row.push(Number(pooled.toFixed(2)));
      steps.push({
        cells: [
          [i, j],
          [i, j + 1],
          [i + 1, j],
          [i + 1, j + 1],
        ],
      });
    }
    out.push(row);
  }
  return { out, steps };
}
