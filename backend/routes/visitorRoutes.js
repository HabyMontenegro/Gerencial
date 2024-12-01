// routes/visitorRoutes.js
const express = require('express');
const { generatePoisson } = require('../services/visitorService'); // Importa la función que ya tienes
const router = express.Router();

// Ruta para Poisson
router.get('/poisson', (req, res) => {
  const poissonValue = generatePoisson(); // Llamamos a la función
  res.json({ value: poissonValue }); // Enviamos la respuesta como JSON
});

module.exports = router;
