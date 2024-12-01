// En el archivo visitorService.js
function generatePoisson() {
  const lambda = 3; // Media de Poisson
  const L = Math.exp(-lambda);
  let k = 0;
  let p = 1;

  do {
    k++;
    p *= Math.random();
  } while (p > L);

  return k - 1;
}

module.exports = { generatePoisson };
