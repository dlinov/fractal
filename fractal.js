onmessage = function(e) {
  console.log('Worker: Message received from main script: ' + e.data);
  const data = e.data;
  const R = data.R;
  const w = data.w;
  const h = data.h;
  const minX = data.minX;
  const maxX = data.maxX;
  const minY = data.minY;
  const maxY = data.maxY;
  const xScale = maxX - minX;
  const yScale = maxY - minY;
  const Z0 = new Complex(data.z0.x, data.z0.y);
  const maxIterations = data.maxIterations;
  const iMin = data.workFraction.startIncl;
  const iMax = data.workFraction.endExcl;
  let results = [];
  for (let i = iMin; i < iMax; i++) {
    const p = i / w * xScale + minX;
    for (let j = 0; j < h; j++) {
      const q = j / h * yScale + minY;
      const c = new Complex(p, q);
      let z = Z0;
      for (let k = 0; k < maxIterations; ++k) {
        z = z.mult(z).plus(c);
        if (z.abs > R) {
          results.push({i: i, j: j});
          break;
        }
      }
    }
  }
  postMessage(results);
  close();
}

class Complex {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  plus(other) {
    const nX = this.x + other.x;
    const nY = this.y + other.y;
    return new Complex(nX, nY);
  }
  minus(other) {
    const nX = this.x - other.x;
    const nY = this.y - other.y;
    return new Complex(nX, nY);
  }
  mult(other) {
    const nX = this.x * other.x - this.y * other.y;
    const nY = this.x * other.y + other.x * this.y;
    return new Complex(nX, nY);
  }
  div(other) {
    const den = other.x * other.x + other.y * other.y;
    const nX = (this.x * other.x + this.y * other.y) / den;
    const nY = (other.x * this.y - this.x * other.y) / den;
    return new Complex(nX, nY);
  }
  get abs() {
    return Math.sqrt(this.x * this.x + this.y + this.y);
  }
};