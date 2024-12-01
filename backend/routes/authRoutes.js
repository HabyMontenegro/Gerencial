// En tu router de Express
const express = require('express');
const { login, registerEmpresa, generatePoissonAndEvaluateVisitors,
     getAverageSatisfaction, getConversionIndex, getSalesData, getSalesDataMoney } = require('../controllers/authController');

const router = express.Router();

router.post('/login', login);
router.post('/registro', registerEmpresa);
router.post('/generatePoisson', generatePoissonAndEvaluateVisitors);
router.get('/obtenersatisfaccion', getAverageSatisfaction);
router.get('/obtenerconversion', getConversionIndex);
router.get('/obtenergraficacantidad', getSalesData);
router.get('/obtenergraficadinero', getSalesDataMoney);

module.exports = router;
