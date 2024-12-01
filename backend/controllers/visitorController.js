const { generatePoisson } = require('../services/visitorService');

const getPoissonVisitors = (req, res) => {
  try {
    const visitors = generatePoisson(); // Llama al servicio de Poisson
    res.status(200).json({ value: visitors }); // Cambia 'visitors' a 'value'
  } catch (error) {
    console.error('Error al generar visitantes:', error);
    res.status(500).json({ error: 'Error al generar visitantes' });
  }
};

module.exports = { getPoissonVisitors };
