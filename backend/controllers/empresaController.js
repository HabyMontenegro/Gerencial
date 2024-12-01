const { connectDB, sql } = require('../config/db');

// Función para obtener empleados divididos por tipo de buff
const obtenerEmpleadosPorTipo = async (req, res) => {
    try {
        const idEmpresa = global.idDeEmpresa; // Obtener ID de empresa desde variable global

        const pool = await connectDB();

        // Query para contar empleados por tipo de buff
        const empleadosQuery = `
            SELECT 
                emp.TipoBuff, 
                COUNT(*) AS Cantidad
            FROM Empleado emp
            INNER JOIN Empleo ej ON emp.IdEmpleo = ej.IdEmpleo
            WHERE ej.IdEmpresa = @idEmpresa
            GROUP BY emp.TipoBuff
        `;

        const empleadosResult = await pool.request()
            .input('idEmpresa', sql.Int, idEmpresa) // Pasar el ID de la empresa como parámetro
            .query(empleadosQuery);

        // Organizar los resultados en un objeto
        const empleadosPorTipo = empleadosResult.recordset.reduce((acc, row) => {
            acc[row.TipoBuff] = row.Cantidad;
            return acc;
        }, { Personas: 0, Ingresos: 0 }); // Inicializamos ambos tipos en 0

        res.status(200).json(empleadosPorTipo); // Enviar resultado como JSON
    } catch (error) {
        console.error('Error al obtener empleados por tipo:', error);
        res.status(500).json({ error: 'Error al obtener empleados por tipo.' });
    }
};

module.exports = { obtenerEmpleadosPorTipo };
