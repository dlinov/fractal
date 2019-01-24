onmessage = function(e) {
  console.log('Worker: Message received from main script: ' + e.data);
  const data = e.data;
  const squaredR = data.R * data.R;
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
  const c = new Complex(0, 0);
  for (let i = iMin; i < iMax; i++) {
    c.x = i / w * xScale + minX;
    for (let j = 0; j < h; j++) {
      c.y = j / h * yScale + minY;
      let z = new Complex(Z0.x, Z0.y);
      for (let k = 0; k < maxIterations; ++k) {
        z.multInline(z)
        z.plusInline(c);
        if (z.absSq > squaredR) {
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
  plusInline(other) {
    const nX = this.x + other.x;
    const nY = this.y + other.y;
    this.x = nX;
    this.y = nY;
  }
  multInline(other) {
    const nX = this.x * other.x - this.y * other.y;
    const nY = this.x * other.y + other.x * this.y;
    this.x = nX;
    this.y = nY;
  }
  get absSq() {
    return this.x * this.x + this.y * this.y;
  }
};