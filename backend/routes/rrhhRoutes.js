const express = require('express');
const {getEmpleadosDeEmpresa, getEmpleosDeEmpresa, getAplicantesEmpleos, 
    insertarAplicanteEmpleo, contratarEmpleado, crearEmpleo, CrearNomina, getNomina,
    actualizarSaldoYEstadoNomina
} = require('../controllers/rrhhController');
const router = express.Router();

router.get('/obtenerEmpleo', getEmpleosDeEmpresa);
router.get('/obtenerEmpleado', getEmpleadosDeEmpresa);
router.get('/obtenerAplicante', getAplicantesEmpleos);
router.post('/insertarAplicante', insertarAplicanteEmpleo);
router.post('/contratarEmpleado/:idAplicante', contratarEmpleado);
router.post('/empleos/crear', crearEmpleo);
router.post('/crearnomina', CrearNomina);
router.get('/obtenernomina', getNomina);
router.post('/cuentaynomina', actualizarSaldoYEstadoNomina);

module.exports = router;
