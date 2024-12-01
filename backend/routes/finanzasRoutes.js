const express = require('express');
const router = express.Router();
const { obtenerCuentaBanco, obtenerMovimientos } = require('../controllers/finanzasController');

// Ruta para obtener los datos de cuentaBanco
router.get('/cuentas', obtenerCuentaBanco);
router.get('/movimientos', obtenerMovimientos);

module.exports = router;
