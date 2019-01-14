document.addEventListener('DOMContentLoaded', function () {
  let btn = document.getElementById('btn');
  btn.addEventListener('click', runComputation);
  let maxIterSpan = document.getElementById('maxIterSpan');
  let slider = document.getElementById("iterations");
  maxIterSpan.textContent = slider.value;
  slider.addEventListener('change', function() {
    maxIterSpan.textContent = slider.value;
  });
  let pFactorSpan = document.getElementById('pFactorSpan');
  let pFactorSlider = document.getElementById("pFactor");
  pFactorSpan.textContent = pFactorSlider.value;
  pFactorSlider.addEventListener('change', function() {
    pFactorSpan.textContent = pFactorSlider.value;
  });
});

function runComputation() {
  const canvas = document.getElementById("fractal");
  const w = canvas.width;
  const h = canvas.height;
  const ctx = canvas.getContext('2d');
  const imgData = ctx.createImageData(w, h);
  const R = Number(document.getElementById("inputR").value);
  const ParallelismFactor = Number(document.getElementById("pFactor").value);
  const IterationsN = Number(document.getElementById("iterations").value);
  const MinX = -2;
  const MaxX = 1;
  const MinY = -1;
  const MaxY = 1;
  const timePassedElem = document.getElementById('timePassed');
  timePassedElem.textContent = '';
  let workersFinished = 0;
  const startTime = performance.now();
  for (let i = 0; i < ParallelismFactor; ++i) {
    let worker = new Worker('fractal.js');
    const workFraction = getWorkFraction(w, i, ParallelismFactor);
    worker.postMessage({
      R: R,
      w: w,
      h: h,
      maxIterations: IterationsN,
      workFraction: workFraction,
      minX: MinX,
      maxX: MaxX,
      minY: MinY,
      maxY: MaxY,
      z0: {
        x: 0,
        y: 0
      }
    });
    worker.onmessage = function(p) {
      ++workersFinished;
      const data = p.data;
      data.forEach((p) => {
        imgData.data[p.j * w * 4 + p.i * 4 + 3] = 255;
      })
      const endTime = performance.now();
      if (workersFinished == ParallelismFactor) {
        timePassedElem.textContent = (endTime - startTime) + ' ms';
      }
      ctx.putImageData(imgData, 0, 0);
    }
  }
}

function getWorkFraction(w, i, pFactor) {
  const share = w / pFactor;
  const min = i * share;
  const max = min + share;
  const res = {
    startIncl: min,
    endExcl: max
  };
  return res;
}