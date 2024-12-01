const sql = require('mssql');

const dbConfig = {
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    options: {
        encrypt: true,
        trustServerCertificate: true,
    },
    authentication: {
        type: 'default',
        options: {
            userName: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
        },
    },
};

const connectDB = async () => {
    try {
        const pool = await sql.connect(dbConfig);
        console.log('Conexión a la base de datos exitosa');
        return pool;
    } catch (err) {
        console.error('Error al conectar con la base de datos:', err);
        throw err;
    }
};

module.exports = { connectDB, sql };
