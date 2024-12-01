const { connectDB, sql } = require('../config/db');

// Función para obtener los datos de cuentaBanco junto con el nombre de la empresa
const obtenerCuentaBanco = async (req, res) => {
  try {
    const idEmpresa = global.idDeEmpresa;
    // Establecer la conexión a la base de datos
    const pool = await connectDB();
    console.log("TRAJO EL ID?: ", idEmpresa);

    // Realizar la consulta SQL para obtener los datos de cuentaBanco y el nombre de la empresa
    const result = await pool.request()
      .input('IdEmpresa', sql.Int, idEmpresa)
      .query(`
        SELECT 
          cb.IdCuenta, 
          cb.IdEmpresa, 
          cb.NombreUsuario, 
          cb.Saldo, 
          cb.TipoCuenta, 
          e.NombreEmpresa
        FROM cuentaBanco cb
        INNER JOIN empresa e ON cb.IdEmpresa = e.IdEmpresa
        WHERE cb.IdEmpresa = @IdEmpresa
      `); // Consulta que une ambas tablas

    // Si se obtienen resultados, devolver los datos
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // Respuesta con los datos obtenidos, incluyendo NombreEmpresa
    } else {
      res.status(404).json({ message: 'No se encontraron cuentas para la empresa.' }); // Si no se encuentran cuentas
    }
  } catch (error) {
    console.error('Error al obtener los datos de cuentaBanco:', error);
    res.status(500).json({ message: 'Error interno del servidor al obtener los datos.' });
  }
};


const obtenerMovimientos = async (req, res) => {
  try {
    const idEmpresa = global.idDeEmpresa; // Obtener el IdEmpresa global
    const { tipo } = req.query; // Filtrar por tipo (Ingreso o Gasto), si se proporciona

    // Establecer la conexión a la base de datos
    const pool = await connectDB();
    console.log("TRAJO EL ID?: ", idEmpresa);

    // Base de la consulta
    let query = `
      SELECT 
        m.IdMovimiento,
        m.IdEmpresa, 
        m.Fecha, 
        m.Tipo, 
        m.Valor, 
        e.NombreEmpresa
      FROM Movimiento m
      INNER JOIN Empresa e ON m.IdEmpresa = e.IdEmpresa
      WHERE m.IdEmpresa = @IdEmpresa
    `;
    
    // Si se especifica el tipo (Ingreso o Gasto), agregamos un filtro adicional
    if (tipo === 'Ingreso' || tipo === 'Gasto') {
      query += ` AND m.Tipo = @Tipo`;
    }

    // Realizar la consulta SQL para obtener los movimientos
    const result = await pool.request()
      .input('IdEmpresa', sql.Int, idEmpresa)
      .input('Tipo', sql.NVarChar, tipo || '') // Si no se pasa tipo, no se filtra
      .query(query); // Ejecutar la consulta

    // Si se obtienen resultados, devolver los datos
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // Respuesta con los movimientos
    } else {
      res.status(404).json({ message: 'No se encontraron movimientos para la empresa.' });
    }
  } catch (error) {
    console.error('Error al obtener los movimientos:', error);
    res.status(500).json({ message: 'Error interno del servidor al obtener los movimientos.' });
  }
};

module.exports = {
  obtenerCuentaBanco,
  obtenerMovimientos
};

