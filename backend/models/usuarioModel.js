const { connectDB, sql } = require('../config/db');

const getUserByUsername = async (username) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input('Nombre', sql.VarChar, username)
        .query('SELECT * FROM Usuario WHERE Nombre = @Nombre');
    return result.recordset[0];
};

module.exports = { getUserByUsername };
