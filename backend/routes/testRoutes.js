const express = require('express');
const { testConnection } = require('../controllers/testController');

const router = express.Router();

router.get('/prueba-conexion', testConnection);

module.exports = router;
