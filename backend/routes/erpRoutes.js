const express = require('express');
const { obtenerProductos, actualizarProducto, obtenerProveedores,
    configuracionProveedor, traerConfig, ProveerInventario, TraerFactura, pagarFactura,
 } = require('../controllers/erpController');

const router = express.Router();

router.get('/obtenerproductos', obtenerProductos);
router.put('/actualizarproducto', actualizarProducto);
router.get('/obtenerproveedores', obtenerProveedores)
router.post('/configuracionproveedor', configuracionProveedor);
router.get('/obtenerconfig', traerConfig);
router.put('/inventarioproveer', ProveerInventario);
router.put('/pagarfactura/:idFactura', pagarFactura);
router.get('/obtenerfacturas', TraerFactura);

module.exports = router;
