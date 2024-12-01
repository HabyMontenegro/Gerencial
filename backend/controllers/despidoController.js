// despidoController.js
const { connectDB, sql } = require('../config/db');

// Función para despedir empleado y actualizar nómina
const despedirEmpleado = async (req, res) => {
  const { idEmpleado } = req.params;  // Obtener el id del empleado a despedir desde los parámetros de la URL
  const idEmpresa = global.idDeEmpresa; // Usamos la variable global de IdEmpresa
  
  try {
    // Conectarse a la base de datos
    const pool = await connectDB();
    
    // Paso 1: Buscar las nóminas 'En Deuda' para la empresa actual
    const result = await pool.request()
      .input('IdEmpresa', sql.Int, idEmpresa)
      .query('SELECT COUNT(*) AS total FROM NominaEmpresa WHERE IdEmpresa = @IdEmpresa AND Estado = \'En Deuda\'');
    
    const { total } = result.recordset[0];  // Obtener el total de nóminas "En Deuda"
    
    // Paso 2: Si hay 3 o más nóminas "En Deuda"
    if (total >= 3) {
      // Paso 3: Obtener el salario del empleado que se está despidiendo
      const salarioResult = await pool.request()
        .input('IdEmpleado', sql.Int, idEmpleado)
        .query('SELECT Salario FROM Empleado WHERE IdEmpleado = @IdEmpleado');
      
      if (salarioResult.recordset.length === 0) {
        return res.status(404).json({ message: 'Empleado no encontrado' });
      }
      
      const salario = salarioResult.recordset[0].Salario;
      
      // Paso 4: Calcular el valor a restar a la cuenta bancaria
      const valorRestar = salario * 3;
      
      // Paso 5: Restar el valor de la cuenta bancaria
      await pool.request()
        .input('IdEmpresa', sql.Int, idEmpresa)
        .input('valorRestar', sql.Decimal(18, 2), valorRestar)
        .query('UPDATE CuentaBanco SET Saldo = Saldo - @valorRestar WHERE IdEmpresa = @IdEmpresa');
      
      // Paso 6: Eliminar al empleado de la base de datos
      await pool.request()
        .input('IdEmpleado', sql.Int, idEmpleado)
        .query('DELETE FROM Empleado WHERE IdEmpleado = @IdEmpleado');
      
      return res.status(200).json({ message: 'Empleado despedido y saldo actualizado' });
    } else {
      // Si hay menos de 3 nóminas "En Deuda", despedir sin hacer el cálculo adicional
      await pool.request()
        .input('IdEmpleado', sql.Int, idEmpleado)
        .query('DELETE FROM Empleado WHERE IdEmpleado = @IdEmpleado');
      
      return res.status(200).json({ message: 'Empleado despedido sin actualización de saldo' });
    }
  } catch (error) {
    console.error('Error al despedir empleado:', error);
    return res.status(500).json({ message: 'Error interno en el servidor' });
  }
};

module.exports = {
  despedirEmpleado,
};
