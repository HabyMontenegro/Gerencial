const express = require('express');
const { obtenerEmpleadosPorTipo } = require('../controllers/empresaController');
const router = express.Router();

// Ruta para obtener empleados por tipo
router.get('/empleados/tipos', obtenerEmpleadosPorTipo);

module.exports = router;
