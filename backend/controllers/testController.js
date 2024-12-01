const { connectDB } = require('../config/db');

const testConnection = async (req, res) => {
    try {
        await connectDB();
        res.send('Conexión exitosa a la base de datos');
    } catch (err) {
        console.error('Error en la conexión:', err);
        res.status(500).send('Error de conexión: ' + err.message);
    }
};

module.exports = { testConnection };
