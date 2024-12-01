const express = require('express');
const router = express.Router();
const { reiniciarDatos } = require('../controllers/reinicioController');

router.post('/reiniciar', reiniciarDatos);

module.exports = router;
