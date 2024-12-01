// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');

const app = express();

// Configuración de express-session
app.use(session({
    secret: process.env.SESSION_SECRET || 'clave-secreta', // Usa una clave desde variables de entorno para mayor seguridad
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // Activa cookies seguras solo en producción
        httpOnly: true, // Ayuda a proteger contra ataques XSS
        maxAge: 24 * 60 * 60 * 1000 // 1 día
    }
}));

// Middleware
app.use(cors());
app.use(express.json());

// Rutas
const authRoutes = require('./routes/authRoutes');
const testRoutes = require('./routes/testRoutes');
const rrhhRoutes = require('./routes/rrhhRoutes');
const erpRoutes = require('./routes/erpRoutes');
const finanzasRoutes = require('./routes/finanzasRoutes');
const reinicio = require('./routes/reinicioRoutes');
const despidos = require('./routes/despidoRoutes');
const trabajadores = require('./routes/empresaRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/rrhh', rrhhRoutes);
app.use('/api/erp', erpRoutes);
app.use('/api/finanzas', finanzasRoutes);
app.use('/api/reinicio', reinicio);
app.use('/api/despido', despidos);
app.use('/api/trabajadores', trabajadores);
app.use('/api', testRoutes);


// Iniciar servidor
const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
