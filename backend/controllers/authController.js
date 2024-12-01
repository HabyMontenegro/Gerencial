const { connectDB, sql } = require('../config/db');

// Definir la variable global en el contexto adecuado
let globalIdEmpresa = null;

global.idDeEmpresa = null;

// Función para el login
const login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const pool = await connectDB();

        const result = await pool.request()
            .input('Nombre', sql.VarChar, username)
            .query('SELECT * FROM Usuario WHERE Nombre = @Nombre');
        
        const user = result.recordset[0];
        if (!user) {
            return res.status(400).json({ message: 'Usuario no encontrado' });
        }

        if (user.Contrasena !== password) {
            return res.status(400).json({ message: 'Contraseña incorrecta' });
        }

        const empresaResult = await pool.request()
            .input('IdUsuario', sql.Int, user.IdUsuario)
            .query('SELECT IdEmpresa FROM Empresa WHERE IdUsuario = @IdUsuario');
        
        const empresa = empresaResult.recordset[0];
        if (!empresa) {
            return res.status(400).json({ message: 'Empresa no encontrada para el usuario' });
        }

        // Asignar el IdEmpresa a la variable global
        globalIdEmpresa = empresa.IdEmpresa;
        idDeEmpresa = globalIdEmpresa;

        // Guardar el IdEmpresa en la sesión
        req.session.idEmpresa = empresa.IdEmpresa;
        req.session.save(); // Asegura que la sesión se guarda

        res.status(200).json({ message: 'Login exitoso', idEmpresa: empresa.IdEmpresa });
    } catch (err) {
        console.error('Error en el login:', err);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

// Función para registrar la empresa
const registerEmpresa = async (req, res) => {
    const {
        nombreEmpresa, dueñoNombre, presupuestoInicial, contrasena,
        productoNombre, productoCantidad, productoPrecio,
        puestoNombre, puestoSalario
    } = req.body;

    try {
        const pool = await connectDB();

        // Insertar en Usuario
        const usuarioResult = await pool.request()
            .input('Nombre', sql.VarChar, dueñoNombre)
            .input('Contrasena', sql.VarChar, contrasena)
            .query(`INSERT INTO Usuario (Nombre, Contrasena) OUTPUT INSERTED.IdUsuario VALUES (@Nombre, @Contrasena);`);
        const idUsuario = usuarioResult.recordset[0].IdUsuario;

        // Insertar en Empresa
        const empresaResult = await pool.request()
            .input('NombreEmpresa', sql.VarChar, nombreEmpresa)
            .input('PresupuestoInicial', sql.Decimal, presupuestoInicial)
            .input('IdUsuario', sql.Int, idUsuario)
            .query(`INSERT INTO Empresa (NombreEmpresa, PresupuestoInicial, IdUsuario) OUTPUT INSERTED.IdEmpresa VALUES (@NombreEmpresa, @PresupuestoInicial, @IdUsuario);`);
        const idEmpresa = empresaResult.recordset[0].IdEmpresa;

        // Insertar en Producto
        await pool.request()
            .input('NombreProducto', sql.VarChar, productoNombre)
            .input('CantidadProducto', sql.Int, productoCantidad)
            .input('PrecioInicial', sql.Decimal, productoPrecio)
            .input('IdEmpresa', sql.Int, idEmpresa)
            .query(`INSERT INTO Producto (NombreProducto, CantidadProducto, PrecioInicial, IdEmpresa) VALUES (@NombreProducto, @CantidadProducto, @PrecioInicial, @IdEmpresa);`);

        // Insertar en Empleo
        await pool.request()
            .input('NombreEmpleo', sql.VarChar, puestoNombre)
            .input('Salario', sql.Decimal, puestoSalario)
            .input('IdEmpresa', sql.Int, idEmpresa)
            .query(`INSERT INTO Empleo (NombreEmpleo, Salario, IdEmpresa) VALUES (@NombreEmpleo, @Salario, @IdEmpresa);`);

        res.status(200).json({ message: 'Empresa registrada con éxito' });
    } catch (err) {
        console.error('Error en el registro de empresa:', err);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};



// Función que genera el valor Poisson y evalúa los compradores
const generatePoissonAndEvaluateVisitors = async (req, res) => {
    try {
        const pool = await connectDB();

        const idEmpresa = globalIdEmpresa || req.session.idEmpresa;
        if (!idEmpresa) {
            return res.status(400).json({ message: 'IdEmpresa no definido en la aplicación' });
        }

        const { cycle, counter } = req.body;

        // Inicializamos lambda y variables
        let lambda = 3;
        let porcentajeAumentoVentas = 0;

        // Verificar nóminas vencidas
        const nominasEnDeudaResult = await pool.request()
            .input('IdEmpresa', sql.Int, idEmpresa)
            .query(`
                SELECT COUNT(*) AS NominasVencidas
                FROM NominaEmpresa
                WHERE IdEmpresa = @IdEmpresa AND Estado = 'En Deuda';
            `);
        const nominasVencidas = nominasEnDeudaResult.recordset[0].NominasVencidas;

        // Obtener empleados y sus buffs
        const empleadosResult = await pool.request()
            .input('IdEmpresa', sql.Int, idEmpresa)
            .query(`
                SELECT TipoBuff, CantidadBuff 
                FROM Empleado 
                WHERE IdEmpleo IN (SELECT IdEmpleo FROM Empleo WHERE IdEmpresa = @IdEmpresa);
            `);
        const empleados = empleadosResult.recordset;

        // Ajustar lambda y ganancias según la cantidad de nóminas vencidas
        empleados.forEach(empleado => {
            if (nominasVencidas >= 3) {
                // Si hay 3 o más nóminas vencidas, los buffs afectan negativamente
                if (empleado.TipoBuff === 'Personas') {
                    lambda -= empleado.CantidadBuff; // Reducimos lambda
                    if (lambda < 0) lambda = 0; // Aseguramos que no sea negativo
                } else if (empleado.TipoBuff === 'Ingresos') {
                    porcentajeAumentoVentas -= empleado.CantidadBuff; // Reducimos el porcentaje
                }
            } else {
                // Si hay menos de 3 nóminas vencidas, los buffs afectan positivamente
                if (empleado.TipoBuff === 'Personas') {
                    lambda += empleado.CantidadBuff; // Incrementamos lambda
                } else if (empleado.TipoBuff === 'Ingresos') {
                    porcentajeAumentoVentas += empleado.CantidadBuff; // Incrementamos el porcentaje
                }
            }
        });

        // Generación del valor Poisson
        const L = Math.exp(-lambda);
        let k = 0;
        let p = 1;
        do {
            k++;
            p *= Math.random();
        } while (p > L);

        const poissonValue = k - 1;

        let compradores = 0;
        let totalIngresos = 0; // Acumulador para el total de ingresos

        for (let i = 0; i < poissonValue; i++) {
            const esComprador = Math.random() < 0.5 ? 1 : 0;

            if (esComprador === 1) {
                compradores++;

                const letraRandom = String.fromCharCode(65 + Math.floor(Math.random() * 26));
                const nombreCliente = `Cliente ${letraRandom}`;
                const correoCliente = `${nombreCliente.replace(' ', '')}@gmail.com`;
                const telefonoCliente = `+1${Math.floor(1000000000 + Math.random() * 9000000000)}`;

                await pool.request()
                    .input('Nombre', sql.NVarChar, nombreCliente)
                    .input('Telefono', sql.NVarChar, telefonoCliente)
                    .input('Email', sql.NVarChar, correoCliente)
                    .input('IdEmpresa', sql.Int, idEmpresa)
                    .query(`
                        INSERT INTO ClienteEmpresa (Nombre, Telefono, Email, IdEmpresa)
                        VALUES (@Nombre, @Telefono, @Email, @IdEmpresa);
                    `);

                const productoResult = await pool.request()
                    .input('IdEmpresa', sql.Int, idEmpresa)
                    .query('SELECT TOP 1 IdProducto, PrecioInicial FROM Producto WHERE IdEmpresa = @IdEmpresa');

                const producto = productoResult.recordset[0];

                if (producto) {
                    const cantidadComprada = Math.floor(Math.random() * 5) + 1;

                    const stockResult = await pool.request()
                        .input('IdEmpresa', sql.Int, idEmpresa)
                        .query(`
                            SELECT TOP 1 CantidadProducto
                            FROM Producto
                            WHERE IdEmpresa = @IdEmpresa;
                        `);

                    const cantidadDisponible = stockResult.recordset[0]?.CantidadProducto || 0;

                    if (cantidadDisponible < cantidadComprada) {
                        return res.status(400).json({
                            message: `No hay suficiente stock para completar la compra. Stock disponible: ${cantidadDisponible}, solicitado: ${cantidadComprada}`
                        });
                    }

                    const nuevaCantidadDisponible = cantidadDisponible - cantidadComprada;

                    await pool.request()
                        .input('IdEmpresa', sql.Int, idEmpresa)
                        .input('IdProducto', sql.Int, producto.IdProducto)
                        .input('NuevaCantidadDisponible', sql.Int, nuevaCantidadDisponible)
                        .query(`
                            UPDATE Producto
                            SET CantidadProducto = @NuevaCantidadDisponible
                            WHERE IdEmpresa = @IdEmpresa AND IdProducto = @IdProducto;
                        `);

                    const totalVenta = producto.PrecioInicial * cantidadComprada * (1 + porcentajeAumentoVentas / 100);
                    totalIngresos += totalVenta;

                    await pool.request()
                        .input('IdEmpresa', sql.Int, idEmpresa)
                        .input('Dia', sql.Int, cycle)
                        .input('Hora', sql.Int, counter)
                        .input('IdProducto', sql.Int, producto.IdProducto)
                        .input('CantidadVendida', sql.Int, cantidadComprada)
                        .input('ValorTotalVenta', sql.Decimal, totalVenta)
                        .query(`
                            INSERT INTO KpiVentaDiaria (IdEmpresa, Dia, Hora, IdProducto, CantidadVendida, ValorTotalVenta)
                            VALUES (@IdEmpresa, @Dia, @Hora, @IdProducto, @CantidadVendida, @ValorTotalVenta);
                        `);

                    await pool.request()
                        .input('IdEmpresa', sql.Int, idEmpresa)
                        .input('ValorTotalVenta', sql.Decimal, totalVenta)
                        .query(`
                            UPDATE CuentaBanco
                            SET Saldo = Saldo + @ValorTotalVenta
                            WHERE IdEmpresa = @IdEmpresa;
                        `);

                    const puntuacionSatisfaccion = Math.floor(Math.random() * 51) + 50;

                    await pool.request()
                        .input('IdEmpresa', sql.Int, idEmpresa)
                        .input('PuntuacionSatisfaccion', sql.Int, puntuacionSatisfaccion)
                        .input('Dia', sql.Int, cycle)
                        .input('Hora', sql.Int, counter)
                        .query(`
                            INSERT INTO KpiSatisfaccion (IdEmpresa, PuntuacionSatisfaccion, Dia, Hora)
                            VALUES (@IdEmpresa, @PuntuacionSatisfaccion, @Dia, @Hora);
                        `);
                }
            }
        }

        if (totalIngresos > 0) {
            const fecha = parseInt(`${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}`);

            await pool.request()
                .input('IdEmpresa', sql.Int, idEmpresa)
                .input('Fecha', sql.Int, fecha)
                .input('Tipo', sql.NVarChar, 'Ingreso')
                .input('Valor', sql.Decimal, totalIngresos)
                .query(`
                    INSERT INTO Movimiento (IdEmpresa, Fecha, Tipo, Valor)
                    VALUES (@IdEmpresa, @Fecha, @Tipo, @Valor);
                `);
        }

        await pool.request()
            .input('CantidadVisitantes', sql.Int, poissonValue)
            .input('CantidadCompradores', sql.Int, compradores)
            .input('Dia', sql.Int, cycle)
            .input('Hora', sql.Int, counter)
            .input('IdEmpresa', sql.Int, idEmpresa)
            .query(`
                INSERT INTO KpiIndiceConversion (CantidadVisitantes, CantidadCompradores, Dia, Hora, IdEmpresa)
                VALUES (@CantidadVisitantes, @CantidadCompradores, @Dia, @Hora, @IdEmpresa);
            `);

        res.status(200).json({
            message: 'Simulación completada exitosamente',
            totalVisitantes: poissonValue,
            totalCompradores: compradores,
            totalIngresos
        });
    } catch (err) {
        console.error('Error en la simulación:', err);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};



// Función para obtener el promedio de la puntuación de satisfacción
const getAverageSatisfaction = async (req, res) => {
    try {
        const idEmpresa = globalIdEmpresa || req.session.idEmpresa;
        if (!idEmpresa) {
            return res.status(400).json({ message: 'IdEmpresa no definido en la aplicación' });
        }

      

        const pool = await connectDB();
        
        // Consulta para obtener el promedio de PuntuacionSatisfaccion
        let query = `
            SELECT AVG(PuntuacionSatisfaccion) AS PromedioSatisfaccion
            FROM KpiSatisfaccion
            WHERE IdEmpresa = @IdEmpresa
        `;

        
        const result = await pool.request()
            .input('IdEmpresa', sql.Int, idEmpresa)
            
            .query(query);
        const promedioSatisfaccion = result.recordset[0].PromedioSatisfaccion;

        console.log("PROMEDIO ES: ", promedioSatisfaccion);
        if (promedioSatisfaccion === null) {
            return res.status(404).json({ message: 'No se encontraron registros de satisfacción para la empresa' });
        }

        res.status(200).json({ promedioSatisfaccion });
    } catch (err) {
        console.error('Error al obtener el promedio de satisfacción:', err);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

// Función para obtener el índice de conversión
const getConversionIndex = async (req, res) => {
    try {
        const idEmpresa = globalIdEmpresa || req.session.idEmpresa;
        if (!idEmpresa) {
            return res.status(400).json({ message: 'IdEmpresa no definido en la aplicación' });
        }

        const pool = await connectDB();
        
        // Consulta para obtener la suma total de CantidadVisitantes y CantidadCompradores de la tabla KpiIndiceConversion
        const query = `
            SELECT SUM(CantidadVisitantes) AS TotalVisitantes, SUM(CantidadCompradores) AS TotalCompradores
            FROM KpiIndiceConversion
            WHERE IdEmpresa = @IdEmpresa;
        `;

        const result = await pool.request()
            .input('IdEmpresa', sql.Int, idEmpresa)
            .query(query);

        if (result.recordset.length === 0 || result.recordset[0].TotalVisitantes === 0) {
            return res.status(404).json({ message: 'No se encontraron registros de índice de conversión o no hay visitantes registrados' });
        }

        const { TotalVisitantes, TotalCompradores } = result.recordset[0];

        // Calcular el índice de conversión
        const conversionIndex = (TotalCompradores / TotalVisitantes) * 100; // El índice de conversión en porcentaje

        console.log('Índice de conversión general:', conversionIndex);

        res.status(200).json({
            message: 'Índice de conversión calculado exitosamente',
            conversionIndex
        });
    } catch (err) {
        console.error('Error al obtener el índice de conversión:', err);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};


const getSalesData = async (req, res) => {
    try {
        const idEmpresa = globalIdEmpresa || req.session.idEmpresa;
        if (!idEmpresa) {
            return res.status(400).json({ message: 'IdEmpresa no definido en la aplicación' });
        }

        const pool = await connectDB();
        
        // Consulta para obtener los datos de ventas
        const query = `
            SELECT Dia, SUM(CantidadVendida) AS TotalCantidadVendida
            FROM KpiVentaDiaria
            WHERE IdEmpresa = @IdEmpresa
            GROUP BY Dia
            ORDER BY Dia;
        `;

        const result = await pool.request()
            .input('IdEmpresa', sql.Int, idEmpresa)
            .query(query);

        // Verificamos si hay datos
        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'No se encontraron datos de ventas para la empresa' });
        }

        // Enviar los datos al frontend para graficarlos
        const salesData = result.recordset.map(row => ({
            dia: row.Dia,
            totalCantidadVendida: row.TotalCantidadVendida
        }));

        res.status(200).json(salesData);

    } catch (err) {
        console.error('Error al obtener los datos de ventas:', err);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};


const getSalesDataMoney = async (req, res) => {
    try {
        const idEmpresa = globalIdEmpresa || req.session.idEmpresa;
        if (!idEmpresa) {
            return res.status(400).json({ message: 'IdEmpresa no definido en la aplicación' });
        }

        const pool = await connectDB();
        
        // Consulta para obtener el valor total de ventas por día
        const query = `
            SELECT Dia, 
                   SUM(ValorTotalVenta) AS TotalValorVenta
            FROM KpiVentaDiaria
            WHERE IdEmpresa = @IdEmpresa
            GROUP BY Dia
            ORDER BY Dia;
        `;

        const result = await pool.request()
            .input('IdEmpresa', sql.Int, idEmpresa)
            .query(query);

        // Verificamos si hay datos
        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'No se encontraron datos de ventas para la empresa' });
        }

        // Enviar los datos al frontend para graficarlos
        const salesData = result.recordset.map(row => ({
            dia: row.Dia,
            totalValorVenta: row.TotalValorVenta
        }));

        res.status(200).json(salesData);

    } catch (err) {
        console.error('Error al obtener los datos de ventas:', err);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};


module.exports = { login, registerEmpresa, 
    generatePoissonAndEvaluateVisitors, getAverageSatisfaction, 
    getConversionIndex, getSalesData, getSalesDataMoney };