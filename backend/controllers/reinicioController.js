const { connectDB, sql } = require('../config/db');

const reiniciarDatos = async (req, res) => {
    const idEmpresa = global.idDeEmpresa; // Asumimos que el idEmpresa se pasa en el cuerpo de la solicitud

    try {
        // Conectamos a la base de datos
        const pool = await connectDB();
        
        // Transacción para asegurar que todas las operaciones se realicen correctamente
        const transaction = new sql.Transaction(pool);

        await transaction.begin();

        try {
            // 1. Actualizar cantidad de producto
            await transaction.request()
                .input('IdProducto', sql.Int, 3)
                .input('CantidadProducto', sql.Int, 64)
                .query('UPDATE dbo.Producto SET CantidadProducto = @CantidadProducto WHERE IdProducto = @IdProducto');

            // 2. Eliminar registros de diversas tablas
            await transaction.request().query('DELETE FROM dbo.Factura');
            await transaction.request().query('DELETE FROM dbo.NominaEmpresa');
            await transaction.request().query('DELETE FROM dbo.Movimiento');
            await transaction.request().query('DELETE FROM dbo.KpiSatisfaccion');
            await transaction.request().query('DELETE FROM dbo.KpiVentaDiaria');
            await transaction.request().query('DELETE FROM dbo.KpiIndiceConversion');
            await transaction.request().query('DELETE FROM dbo.ClienteEmpresa');

            // 3. Eliminar registros de empleados y aplicantes según el IdEmpresa
            await transaction.request()
                .input('IdEmpresa', sql.Int, idEmpresa)
                .query(`
                    DELETE FROM dbo.Empleado
                    WHERE IdEmpleo IN (SELECT IdEmpleo FROM dbo.Empleo WHERE IdEmpresa = @IdEmpresa)
                `);

            await transaction.request()
                .input('IdEmpresa', sql.Int, idEmpresa)
                .query(`
                    DELETE FROM dbo.AplicanteEmpleo
                    WHERE IdEmpleoAplicado IN (SELECT IdEmpleo FROM dbo.Empleo WHERE IdEmpresa = @IdEmpresa)
                `);

            // 4. Restaurar saldo de la cuenta a partir del presupuesto inicial
            const resultPresupuesto = await transaction.request()
                .input('IdEmpresa', sql.Int, idEmpresa)
                .query('SELECT PresupuestoInicial FROM dbo.Empresa WHERE IdEmpresa = @IdEmpresa');

            if (resultPresupuesto.recordset.length > 0) {
                const presupuestoInicial = resultPresupuesto.recordset[0].PresupuestoInicial;

                // Actualizamos el saldo en la tabla CuentaBanco
                await transaction.request()
                    .input('IdEmpresa', sql.Int, idEmpresa)
                    .input('Saldo', sql.Decimal(18, 2), presupuestoInicial)
                    .query(`
                        UPDATE dbo.CuentaBanco
                        SET Saldo = @Saldo
                        WHERE IdEmpresa = @IdEmpresa
                    `);
            } else {
                throw new Error('No se encontró el presupuesto inicial para la empresa.');
            }

            // 5. Confirmamos la transacción
            await transaction.commit();

            res.status(200).json({ message: 'Datos reiniciados y saldo restaurado exitosamente.' });
        } catch (err) {
            // Si algo falla, deshacemos la transacción
            await transaction.rollback();
            console.error('Error en transacción:', err);
            res.status(500).json({ message: 'Error al reiniciar los datos.', error: err.message });
        }
    } catch (err) {
        console.error('Error en conexión a la base de datos:', err);
        res.status(500).json({ message: 'Error en la conexión a la base de datos.', error: err.message });
    }
};

module.exports = {
    reiniciarDatos
};
