//erpController.js
const { connectDB, sql } = require('../config/db');

// Obtener productos según el IdEmpresa
const obtenerProductos = async (req, res) => {
    try {
        const idEmpresa = global.idDeEmpresa; // Verifica cómo obtienes este valor
        console.log('idEmpresa:', idEmpresa); // Log para verificar el valor de idEmpresa

        const pool = await connectDB();
        const query = `
            SELECT 
                IdProducto, 
                NombreProducto, 
                CantidadProducto, 
                FechaCantidad, 
                PrecioInicial 
            FROM Producto 
            WHERE IdEmpresa = @idEmpresa
        `;
        
        // Log antes de ejecutar la consulta para ver la consulta completa
        console.log('Consulta SQL:', query);

        const result = await pool.request()
            .input('idEmpresa', sql.Int, idEmpresa)
            .query(query);

        // Log para verificar los resultados de la consulta
        console.log('Resultado de la consulta:', result.recordset);

        // Si hay productos, los retornamos, si no, retornamos un mensaje adecuado
        if (result.recordset.length > 0) {
            res.status(200).json(result.recordset);
        } else {
            console.log('No se encontraron productos.');
            res.status(404).json({ error: 'No se encontraron productos.' });
        }

    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).json({ error: 'Error al obtener los productos.' });
    }
};


// Actualizar datos de un producto
const actualizarProducto = async (req, res) => {
    // Log para ver los datos que vienen en el body
    console.log('Datos recibidos en el body:', req.body);

    const idEmpresa = global.idDeEmpresa;
    const { idProducto, nombreProducto, cantidadProducto, fechaCantidad, precioInicial } = req.body;

    try {
        const pool = await connectDB();
        const query = `
            UPDATE Producto
            SET 
                NombreProducto = @nombreProducto,
                CantidadProducto = @cantidadProducto,
                FechaCantidad = @fechaCantidad,
                PrecioInicial = @precioInicial
            WHERE 
                IdProducto = @idProducto AND IdEmpresa = @idEmpresa
        `;
        
        // Log para verificar que los datos están siendo asignados correctamente a la consulta
        console.log('Datos para la consulta:', {
            idProducto, nombreProducto, cantidadProducto, fechaCantidad, precioInicial, idEmpresa
        });

        const result = await pool.request()
            .input('idProducto', sql.Int, idProducto)
            .input('nombreProducto', sql.NVarChar(100), nombreProducto)
            .input('cantidadProducto', sql.Int, cantidadProducto)
            .input('fechaCantidad', sql.Int, fechaCantidad)
            .input('precioInicial', sql.Decimal(18, 2), precioInicial)
            .input('idEmpresa', sql.Int, idEmpresa)
            .query(query);

        if (result.rowsAffected[0] > 0) {
            res.status(200).json({ message: 'Producto actualizado correctamente.' });
        } else {
            console.log("QUE SERÁ: ", result);
            res.status(404).json({ error: 'Producto no encontrado.' });
        }
    } catch (error) {
        console.error('Error al actualizar producto:', error);
        res.status(500).json({ error: 'Error al actualizar el producto.' });
    }
};

// Obtener proveedores según el IdEmpresa
const obtenerProveedores = async (req, res) => {
    try {
        const idEmpresa = global.idDeEmpresa; // Asegúrate de que `idDeEmpresa` esté correctamente asignado
        console.log('idEmpresa:', idEmpresa); // Log para verificar el valor de idEmpresa

        const pool = await connectDB();
        const query = `
            SELECT 
                NombreProveedor, 
                CantidadEntrega, 
                CostoEntrega
            FROM Proveedor
            WHERE IdEmpresa = @idEmpresa
        `;
        
        // Log antes de ejecutar la consulta para ver la consulta completa
        console.log('Consulta SQL:', query);

        const result = await pool.request()
            .input('idEmpresa', sql.Int, idEmpresa)
            .query(query);

        // Log para verificar los resultados de la consulta
        console.log('Resultado de la consulta:', result.recordset);

        // Si hay proveedores, los retornamos, si no, retornamos un mensaje adecuado
        if (result.recordset.length > 0) {
            res.status(200).json(result.recordset);
        } else {
            console.log('No se encontraron proveedores.');
            res.status(404).json({ error: 'No se encontraron proveedores.' });
        }

    } catch (error) {
        console.error('Error al obtener proveedores:', error);
        res.status(500).json({ error: 'Error al obtener los proveedores.' });
    }
};

// Configuración del proveedor automático
const configuracionProveedor = async (req, res) => {
    const { proveerAuto, nombreProveedor } = req.body; // Asumimos que el cuerpo contiene estos dos valores

    try {
        const idEmpresa = 4; // El ID de la empresa siempre es 4, como mencionaste

        const pool = await connectDB();
        const query = `
            IF EXISTS (SELECT 1 FROM Configuracion WHERE IdEmpresa = @idEmpresa)
            BEGIN
                UPDATE Configuracion
                SET 
                    ProveerAuto = @proveerAuto,
                    tipoProveedor = @nombreProveedor
                WHERE IdEmpresa = @idEmpresa
            END
            ELSE
            BEGIN
                INSERT INTO Configuracion (IdEmpresa, ProveerAuto, tipoProveedor)
                VALUES (@idEmpresa, @proveerAuto, @nombreProveedor)
            END
        `;

        const result = await pool.request()
            .input('proveerAuto', sql.Bit, proveerAuto)  // Estado del botón de proveedor automático (1 o 0)
            .input('nombreProveedor', sql.NVarChar(50), nombreProveedor)  // Nombre del proveedor
            .input('idEmpresa', sql.Int, idEmpresa)  // ID de la empresa (siempre es 4)
            .query(query);

        // Verificamos si la operación fue exitosa
        if (result.rowsAffected[0] > 0) {
            res.status(200).json({ message: 'Configuración de proveedor actualizada correctamente.' });
        } else {
            res.status(400).json({ error: 'Error al actualizar la configuración del proveedor.' });
        }

    } catch (error) {
        console.error('Error al guardar configuración del proveedor:', error);
        res.status(500).json({ error: 'Error al guardar configuración del proveedor.' });
    }
};

const traerConfig = async (req, res) => {
    try {
        const idEmpresa = global.idDeEmpresa; // O el valor correcto para el id de empresa
        console.log('idEmpresa:', idEmpresa); // Log para verificar el valor de idEmpresa

        const pool = await connectDB();
        
        // Consulta para obtener la configuración del proveedor automático
        const configQuery = `
            SELECT ProveerAuto, tipoProveedor
            FROM Configuracion
            WHERE IdEmpresa = @idEmpresa
        `;
        
        const configResult = await pool.request()
            .input('idEmpresa', sql.Int, idEmpresa)
            .query(configQuery);

        if (configResult.recordset.length > 0) {
            const config = configResult.recordset[0]; // Configuración obtenida
            const proveerAuto = config.ProveerAuto;
            const nombreProveedor = config.tipoProveedor;

            // Ahora, vamos a obtener los detalles del proveedor basado en el nombre
            const proveedorQuery = `
                SELECT CantidadEntrega, CostoEntrega
                FROM Proveedor
                WHERE NombreProveedor = @nombreProveedor AND IdEmpresa = @idEmpresa
            `;
            
            const proveedorResult = await pool.request()
                .input('nombreProveedor', sql.NVarChar(50), nombreProveedor)
                .input('idEmpresa', sql.Int, idEmpresa)
                .query(proveedorQuery);

            if (proveedorResult.recordset.length > 0) {
                const proveedor = proveedorResult.recordset[0];
                const cantidadEntrega = proveedor.CantidadEntrega;
                const costoEntrega = proveedor.CostoEntrega;

                // Retornamos la configuración y los detalles del proveedor
                res.status(200).json({
                    proveerAuto,
                    nombreProveedor,
                    cantidadEntrega,
                    costoEntrega
                });
            } else {
                res.status(404).json({ error: 'Proveedor no encontrado.' });
            }
        } else {
            res.status(404).json({ error: 'Configuración no encontrada.' });
        }

    } catch (error) {
        console.error('Error al traer la configuración del proveedor:', error);
        res.status(500).json({ error: 'Error al traer la configuración del proveedor.' });
    }
};


const ProveerInventario = async (req, res) => {
    try {
        const idEmpresa = global.idDeEmpresa; // Obtenemos el ID de la empresa

        // Paso 1: Verificar cuántas facturas "No pagadas" hay para esta empresa
        const pool = await connectDB();

        const facturaCountQuery = `
            SELECT COUNT(*) AS NoPagadas
            FROM Factura
            WHERE IdEmpresa = @idEmpresa AND Estado = 'No pagada'
        `;

        const facturaCountResult = await pool.request()
            .input('idEmpresa', sql.Int, idEmpresa)
            .query(facturaCountQuery);

        const { NoPagadas } = facturaCountResult.recordset[0];

        // Paso 2: Si hay 3 o más facturas "No pagadas", desactivar ProveerAuto
        if (NoPagadas >= 3) {
            const updateConfigQuery = `
                UPDATE Configuracion
                SET ProveerAuto = 0
                WHERE IdEmpresa = @idEmpresa
            `;
            
            await pool.request()
                .input('idEmpresa', sql.Int, idEmpresa)
                .query(updateConfigQuery);

            return res.status(200).json({
                message: 'Proveedor automático desactivado debido a facturas impagas.'
            });
        }

        // Paso 3: Verificar configuración de proveedor automático
        const configQuery = `
            SELECT ProveerAuto, tipoProveedor
            FROM Configuracion
            WHERE IdEmpresa = @idEmpresa
        `;

        const configResult = await pool.request()
            .input('idEmpresa', sql.Int, idEmpresa)
            .query(configQuery);

        if (configResult.recordset.length === 0) {
            return res.status(404).json({ error: 'Configuración no encontrada.' });
        }

        const { ProveerAuto, tipoProveedor } = configResult.recordset[0];

        // Si la opción de proveedor automático no está activada, no hacemos nada
        if (!ProveerAuto) {
            return res.status(200).json({ message: 'Proveer automático desactivado.' });
        }

        // Paso 4: Obtener los detalles del proveedor
        const proveedorQuery = `
            SELECT IdProveedor, CantidadEntrega, CostoEntrega
            FROM Proveedor
            WHERE NombreProveedor = @nombreProveedor AND IdEmpresa = @idEmpresa
        `;

        const proveedorResult = await pool.request()
            .input('nombreProveedor', sql.NVarChar(50), tipoProveedor)
            .input('idEmpresa', sql.Int, idEmpresa)
            .query(proveedorQuery);

        if (proveedorResult.recordset.length === 0) {
            return res.status(404).json({ error: 'Proveedor no encontrado.' });
        }

        const { IdProveedor, CantidadEntrega, CostoEntrega } = proveedorResult.recordset[0];

        // Paso 5: Actualizar la cantidad del primer producto en la tabla Producto
        const productoQuery = `
            UPDATE Producto
            SET CantidadProducto = CantidadProducto + @CantidadEntrega
            WHERE IdProducto = (
                SELECT TOP 1 IdProducto
                FROM Producto
                WHERE IdEmpresa = @idEmpresa
                ORDER BY IdProducto ASC
            )
        `;

        const updateResult = await pool.request()
            .input('CantidadEntrega', sql.Int, CantidadEntrega)
            .input('idEmpresa', sql.Int, idEmpresa)
            .query(productoQuery);

        if (updateResult.rowsAffected[0] > 0) {
            // Paso 6: Registrar la factura en la tabla Factura
            const insertFacturaQuery = `
                INSERT INTO Factura (IdEmpresa, IdCobrador, Valor, Estado, IdProveedor, IdBanco)
                VALUES (@idEmpresa, NULL, @valor, 'No pagada', @idProveedor, NULL)
            `;

            await pool.request()
                .input('idEmpresa', sql.Int, idEmpresa)
                .input('valor', sql.Decimal(18, 2), CostoEntrega)
                .input('idProveedor', sql.Int, IdProveedor) // Inserta el proveedor siempre
                .query(insertFacturaQuery);

            return res.status(200).json({
                message: 'Inventario actualizado y factura registrada correctamente.',
                cantidadEntregada: CantidadEntrega,
                costoEntrega: CostoEntrega
            });
        } else {
            return res.status(404).json({ error: 'No se pudo actualizar el inventario.' });
        }

    } catch (error) {
        console.error('Error en ProveerInventario:', error);
        res.status(500).json({ error: 'Error al realizar el suministro del inventario.' });
    }
};



const TraerFactura = async (req, res) => {
    try {
        const idEmpresa = global.idDeEmpresa; // Obtener el ID de la empresa

        // Conectar a la base de datos
        const pool = await connectDB();

        // Consulta para obtener las facturas con estado "No pagada"
        const query = `
            SELECT idFactura, Valor, IdProveedor, Estado
            FROM Factura
            WHERE IdEmpresa = @idEmpresa AND Estado = 'No pagada'
        `;

        // Ejecutar la consulta
        const result = await pool.request()
            .input('idEmpresa', sql.Int, idEmpresa)
            .query(query);

        // Verificar si se encontraron facturas
        if (result.recordset.length > 0) {
            res.status(200).json(result.recordset); // Retornar las facturas
        } else {
            res.status(404).json({ error: 'No hay facturas no pagadas.' });
        }

    } catch (error) {
        console.error('Error al traer las facturas:', error);
        res.status(500).json({ error: 'Error al obtener las facturas.' });
    }
};


const pagarFactura = async (req, res) => {
    try {
        const { idFactura } = req.params; // Cambio aquí para usar req.params en vez de req.body
        console.log("ID Factura en el backend:", idFactura);

        const idEmpresa = global.idDeEmpresa; // Obtenemos el ID de la empresa

        const pool = await connectDB();

        // Paso 1: Obtener el valor de la factura y el proveedor
        const facturaQuery = `
            SELECT Valor, IdProveedor
            FROM Factura
            WHERE idFactura = @idFactura AND IdEmpresa = @idEmpresa AND Estado = 'No pagada'
        `;

        const facturaResult = await pool.request()
            .input('idFactura', sql.Int, idFactura)
            .input('idEmpresa', sql.Int, idEmpresa)
            .query(facturaQuery);

        if (facturaResult.recordset.length === 0) {
            return res.status(404).json({ error: 'Factura no encontrada o ya está pagada.' });
        }

        const { Valor, IdProveedor } = facturaResult.recordset[0];

        // Paso 2: Obtener el saldo actual en la cuenta bancaria de la empresa
        const cuentaQuery = `
            SELECT Saldo
            FROM CuentaBanco
            WHERE IdEmpresa = @idEmpresa
        `;

        const cuentaResult = await pool.request()
            .input('idEmpresa', sql.Int, idEmpresa)
            .query(cuentaQuery);

        if (cuentaResult.recordset.length === 0) {
            return res.status(404).json({ error: 'Cuenta bancaria no encontrada.' });
        }

        const { Saldo } = cuentaResult.recordset[0];

        // Verificar que hay suficiente saldo para pagar la factura
        if (Saldo < Valor) {
            return res.status(400).json({ error: 'Saldo insuficiente para pagar la factura.' });
        }

        // Paso 3: Actualizar el estado de la factura a 'Pagada'
        const updateFacturaQuery = `
            UPDATE Factura
            SET Estado = 'Pagada'
            WHERE idFactura = @idFactura
        `;

        await pool.request()
            .input('idFactura', sql.Int, idFactura)
            .query(updateFacturaQuery);

        // Paso 4: Restar el valor de la factura de la cuenta bancaria
        const updateCuentaQuery = `
            UPDATE CuentaBanco
            SET Saldo = Saldo - @valor
            WHERE IdEmpresa = @idEmpresa
        `;

        await pool.request()
            .input('valor', sql.Decimal(18, 2), Valor)
            .input('idEmpresa', sql.Int, idEmpresa)
            .query(updateCuentaQuery);

        // Paso 5: Registrar el movimiento como un gasto en la tabla Movimientos
        const tipo = 'Gasto'; // El tipo es Gasto, ya que estamos pagando una factura
        const monto = Valor;
        const fecha = new Date();
        const fechaFormateada = fecha.getFullYear() * 10000 + (fecha.getMonth() + 1) * 100 + fecha.getDate();

        await pool.request()
            .input('IdEmpresa', sql.Int, idEmpresa)
            .input('Tipo', sql.VarChar, tipo)
            .input('Valor', sql.Decimal(18, 2), monto)
            .input('Fecha', sql.Int, fechaFormateada)  // Usamos el tipo de dato adecuado para la fecha
            .query('INSERT INTO Movimiento (IdEmpresa, Fecha, Tipo, Valor) VALUES (@IdEmpresa, @Fecha, @Tipo, @Valor)');

        res.status(200).json({ message: 'Factura pagada correctamente y saldo actualizado.' });

    } catch (error) {
        console.error('Error al pagar la factura:', error);
        res.status(500).json({ error: 'Error al pagar la factura.' });
    }
};


module.exports = {
    obtenerProductos,
    actualizarProducto,
    obtenerProveedores,
    configuracionProveedor,
    traerConfig,
    ProveerInventario,
    TraerFactura,
    pagarFactura,
};
