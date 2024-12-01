// despidoRoutes.js
const express = require('express');
const router = express.Router();
const { despedirEmpleado } = require('../controllers/despidoController');

// Ruta para despedir un empleado, pasando el idEmpleado como parámetro
router.delete('/despedir/:idEmpleado', despedirEmpleado);

module.exports = router;
