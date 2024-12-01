const { connectDB, sql } = require('../config/db');

// Función para obtener empleados de la empresa
const getEmpleadosDeEmpresa = async (req, res) => {
    console.log("LA HEMOS CONSEGUIDO MUCHACHOS: ", global.idDeEmpresa);
    try {
        const idEmpresa = global.idDeEmpresa;
        const { pagina, empleadosPorPagina } = req.query; // Obtenemos parámetros de paginación

        if (!idEmpresa) {
            return res.status(400).json({ message: 'IdEmpresa no está disponible' });  
        }

        if (!pagina || !empleadosPorPagina || isNaN(pagina) || isNaN(empleadosPorPagina) || pagina <= 0 || empleadosPorPagina <= 0) {
            return res.status(400).json({ message: 'Debe especificar página y empleadosPorPagina con valores válidos positivos' });
        }        

        const offset = (pagina - 1) * empleadosPorPagina; // Calcular el offset para la paginación

        const pool = await connectDB();

        const empleadosResult = await pool.request()
            .input('IdEmpresa', sql.Int, idEmpresa)
            .input('Offset', sql.Int, offset)
            .input('Limite', sql.Int, empleadosPorPagina)
            .query(`
                SELECT 
                    e.IdEmpleado,
                    e.IdEmpleo AS EmpleadoIdEmpleo,
                    e.NombreEmpleado, 
                    e.CantidadBuff AS EmpleadoCantidadBuff, 
                    e.TipoBuff AS EmpleadoTipoBuff,
                    e.SalarioGanado
                FROM Empleado e
                WHERE e.IdEmpleo IN (SELECT IdEmpleo FROM Empleo WHERE IdEmpresa = @IdEmpresa)
                ORDER BY e.IdEmpleado
                OFFSET @Offset ROWS FETCH NEXT @Limite ROWS ONLY;
            `);

        const empleados = empleadosResult.recordset;

        if (empleados.length === 0) {
            return res.status(404).json({ message: 'No se encontraron empleados para esta empresa' });
        }

        res.status(200).json(empleados);
    } catch (err) {
        console.error('Error al obtener los empleados:', err);
        res.status(500).json({ message: 'Error en el servidor al obtener empleados' });
    }
};

// Función para obtener empleos de la empresa
const getEmpleosDeEmpresa = async (req, res) => {
    try {
        const idEmpresa = global.idDeEmpresa;
        const { pagina, empleosPorPagina } = req.query; // Obtenemos parámetros de paginación

        if (!idEmpresa) {
            return res.status(400).json({ message: 'IdEmpresa no está disponible' });
        }

        if (!pagina || !empleosPorPagina || isNaN(pagina) || isNaN(empleosPorPagina) || pagina <= 0 || empleosPorPagina <= 0) {
            return res.status(400).json({ message: 'Debe especificar página y empleosPorPagina con valores válidos' });
        }

        const offset = (pagina - 1) * empleosPorPagina; // Calcular el offset para la paginación

        const pool = await connectDB();

        const empleosResult = await pool.request()
            .input('IdEmpresa', sql.Int, idEmpresa)
            .input('Offset', sql.Int, offset)
            .input('Limite', sql.Int, empleosPorPagina)
            .query(`
                SELECT 
                    emp.IdEmpleo, 
                    emp.NombreEmpleo, 
                    emp.Salario
                FROM Empleo emp
                WHERE emp.IdEmpresa = @IdEmpresa
                ORDER BY emp.IdEmpleo
                OFFSET @Offset ROWS FETCH NEXT @Limite ROWS ONLY;
            `);

        const empleos = empleosResult.recordset;

        if (empleos.length === 0) {
            return res.status(404).json({ message: 'No se encontraron empleos para esta empresa' });
        }

        res.status(200).json(empleos);
    } catch (err) {
        console.error('Error al obtener los empleos:', err);
        res.status(500).json({ message: 'Error en el servidor al obtener empleos' });
    }
};

// Función para obtener todos los aplicantes de la empresa
const getAplicantesEmpleos = async (req, res) => {
    try {
      const idEmpresa = global.idDeEmpresa;
      const { pagina, aplicantesPorPagina } = req.query; // Obtener parámetros de paginación
  
      if (!idEmpresa) {
        return res.status(400).json({ message: 'IdEmpresa no está disponible' });
      }
  
      if (!pagina || !aplicantesPorPagina || isNaN(pagina) || isNaN(aplicantesPorPagina) || pagina <= 0 || aplicantesPorPagina <= 0) {
        return res.status(400).json({ message: 'Debe especificar página y aplicantesPorPagina con valores válidos positivos' });
      }
  
      const offset = (pagina - 1) * aplicantesPorPagina; // Calcular el offset para la paginación
  
      const pool = await connectDB();
  
      const aplicantesResult = await pool.request()
        .input('IdEmpresa', sql.Int, idEmpresa)
        .input('Offset', sql.Int, offset)
        .input('Limite', sql.Int, aplicantesPorPagina)
        .query(`
          SELECT 
            a.IdAplicante, 
            a.NombreAplicante, 
            a.IdEmpleoAplicado,
            a.CantidadBuff AS AplicanteCantidadBuff, 
            a.TipoBuff AS AplicanteTipoBuff,
            a.ValorSalario
          FROM AplicanteEmpleo a
          WHERE a.IdEmpleoAplicado IN (SELECT IdEmpleo FROM Empleo WHERE IdEmpresa = @IdEmpresa)
          ORDER BY a.IdAplicante
          OFFSET @Offset ROWS FETCH NEXT @Limite ROWS ONLY;
        `);
  
      const aplicantes = aplicantesResult.recordset;
  
      if (aplicantes.length === 0) {
        return res.status(404).json({ message: 'No se encontraron aplicantes para esta empresa' });
      }
  
      res.status(200).json(aplicantes);
    } catch (err) {
      console.error('Error al obtener los aplicantes:', err);
      res.status(500).json({ message: 'Error en el servidor al obtener aplicantes' });
    }
};
  
const insertarAplicanteEmpleo = async (req, res) => {
  try {
    const pool = await connectDB(); // Aquí usas 'pool' en lugar de 'db'

    // 1. Generar un número aleatorio entre 1 y 100 para el nombre del aplicante
    const randomNum = Math.floor(Math.random() * 100) + 1;
    const nombreAplicante = `Persona ${randomNum}`;

    // 2. Obtener todos los IdEmpleo disponibles en la base de datos
    const empleos = await pool.request().query('SELECT IdEmpleo FROM Empleo');
    console.log("Empleos obtenidos: ", empleos);

    const empleosArray = empleos.recordset;
    console.log("Lo logramos? ", empleosArray);

    if (empleosArray.length === 0) {
      return res.status(400).json({ message: 'No hay empleos disponibles' });
    }

    // 3. Seleccionar aleatoriamente un IdEmpleo
    const randomEmpleo = empleosArray[Math.floor(Math.random() * empleosArray.length)];
    if (!randomEmpleo) {
      return res.status(400).json({ message: 'No se pudo seleccionar un empleo aleatorio' });
    }
    console.log("HEMOS OBTENIDO EL ID :D : ", randomEmpleo);
    const idEmpleoAplicado = randomEmpleo.IdEmpleo;
    console.log("HEMOS OBTENIDO EL ID: ", idEmpleoAplicado);

    // 4. Generar un valor aleatorio para CantidadBuff entre 3 y 8
    const cantidadBuff = Math.floor(Math.random() * 6) + 3;

    // 5. Generar un valor aleatorio para TipoBuff (Personas o Ingresos)
    const tipoBuff = Math.random() > 0.5 ? 'Personas' : 'Ingresos';

    // 6. Obtener el salario del empleo seleccionado
    const salarioEmpleoResult = await pool.request()
      .input('idEmpleoAplicado', sql.Int, idEmpleoAplicado)
      .query('SELECT Salario FROM Empleo WHERE IdEmpleo = @idEmpleoAplicado');
    const salarioEmpleo = salarioEmpleoResult.recordset[0].Salario;

    // 7. Calcular el ValorSalario según la fórmula proporcionada
    let valorSalario = salarioEmpleo;

    if (cantidadBuff > 6) {
      const y = cantidadBuff - 6;
      valorSalario = salarioEmpleo + (((y / 100) * salarioEmpleo) * 2.5);
    }

    // 8. Insertar el nuevo aplicante en la base de datos
    const result = await pool.request()
      .input('nombreAplicante', sql.NVarChar, nombreAplicante)
      .input('idEmpleoAplicado', sql.Int, idEmpleoAplicado)
      .input('cantidadBuff', sql.Int, cantidadBuff)
      .input('tipoBuff', sql.NVarChar, tipoBuff)
      .input('valorSalario', sql.Decimal, valorSalario)
      .query('INSERT INTO AplicanteEmpleo (NombreAplicante, IdEmpleoAplicado, CantidadBuff, TipoBuff, ValorSalario) VALUES (@nombreAplicante, @idEmpleoAplicado, @cantidadBuff, @tipoBuff, @valorSalario)');

    res.status(200).json({ message: 'Aplicante insertado correctamente', result });
  } catch (error) {
    console.error("Error en la inserción del aplicante:", error);
    res.status(500).json({ message: 'Error al insertar aplicante en la base de datos', error });
  }
};

const contratarEmpleado = async (req, res) => {
  const { idAplicante } = req.params; // Recuperamos el IdAplicante desde los parámetros de la URL

  try {
    const pool = await connectDB(); // Conexión a la base de datos

    // Obtener los datos del aplicante de la tabla AplicanteEmpleo
    const aplicanteResult = await pool.request()
      .input('idAplicante', sql.Int, idAplicante)
      .query('SELECT * FROM AplicanteEmpleo WHERE IdAplicante = @idAplicante');

    if (aplicanteResult.recordset.length === 0) {
      return res.status(404).json({ message: 'Aplicante no encontrado' });
    }

    const aplicante = aplicanteResult.recordset[0];

    // Insertar el aplicante en la tabla Empleado
    await pool.request()
      .input('nombreEmpleado', sql.NVarChar, aplicante.NombreAplicante)
      .input('idEmpleoAplicado', sql.Int, aplicante.IdEmpleoAplicado)
      .input('cantidadBuff', sql.Int, aplicante.CantidadBuff)
      .input('tipoBuff', sql.NVarChar, aplicante.TipoBuff)
      .input('valorSalario', sql.Decimal, aplicante.ValorSalario)
      .query(`INSERT INTO Empleado (IdEmpleo, NombreEmpleado, CantidadBuff, TipoBuff, SalarioGanado)
              VALUES (@idEmpleoAplicado, @nombreEmpleado, @cantidadBuff, @tipoBuff, @valorSalario)`);

    // Eliminar el aplicante de la tabla AplicanteEmpleo
    await pool.request()
      .input('idAplicante', sql.Int, idAplicante)
      .query('DELETE FROM AplicanteEmpleo WHERE IdAplicante = @idAplicante');

    // Enviar respuesta de éxito
    res.status(200).json({ message: 'Empleado contratado con éxito' });

  } catch (err) {
    console.error('Error en la contratación del aplicante:', err);
    res.status(500).json({ message: 'Error al contratar al empleado' });
  }
};

const crearEmpleo = async (req, res) => {
  const { nombreEmpleo, salario } = req.body; // Desestructuramos los datos enviados en la solicitud
  const idEmpresa = global.idDeEmpresa;  // Usamos la variable global para obtener el ID de la empresa

  if (!idEmpresa) {
    return res.status(400).json({ message: 'IdEmpresa no está disponible' });
  }

  try {
    const pool = await connectDB();

    // Insertamos el nuevo empleo en la tabla Empleo
    const result = await pool.request()
      .input('NombreEmpleo', sql.NVarChar, nombreEmpleo)
      .input('Salario', sql.Decimal, salario)
      .input('IdEmpresa', sql.Int, idEmpresa)
      .query(`
        INSERT INTO Empleo (NombreEmpleo, Salario, IdEmpresa) 
        VALUES (@NombreEmpleo, @Salario, @IdEmpresa);
      `);

    res.status(200).json({ message: 'Empleo creado con éxito' });
  } catch (err) {
    console.error('Error al crear empleo:', err);
    res.status(500).json({ message: 'Error al crear empleo' });
  }
};

const CrearNomina = async (req, res) => {
  try {
      const idEmpresa = global.idDeEmpresa;

      if (!idEmpresa) {
          return res.status(400).json({ message: 'IdEmpresa no está disponible' });
      }

      const { fechaPago } = req.body; // Obtenemos la fecha de pago desde el cuerpo de la solicitud

      if (!fechaPago || isNaN(fechaPago)) {
          return res.status(400).json({ message: 'Debe proporcionar una fecha válida (formato AAAAMMDD)' });
      }

      const pool = await connectDB();

      // Obtener el total de salarios de los empleados de la empresa
      const totalSalariosResult = await pool.request()
          .input('IdEmpresa', sql.Int, idEmpresa)
          .query(`
              SELECT SUM(e.SalarioGanado) AS ValorTotal
              FROM Empleado e
              INNER JOIN Empleo emp ON e.IdEmpleo = emp.IdEmpleo
              WHERE emp.IdEmpresa = @IdEmpresa
          `);

      const valorTotal = totalSalariosResult.recordset[0]?.ValorTotal || 0;

      if (valorTotal === 0) {
          return res.status(400).json({ message: 'No hay empleados con salario registrado en esta empresa' });
      }

      // Insertar la nómina en la tabla `NominaEmpresa`
      const result = await pool.request()
          .input('IdEmpresa', sql.Int, idEmpresa)
          .input('FechaPago', sql.Int, fechaPago)
          .input('ValorTotal', sql.Decimal(18, 2), valorTotal)
          .input('Estado', sql.NVarChar, 'En Deuda')
          .query(`
              INSERT INTO NominaEmpresa (IdEmpresa, FechaPago, ValorTotal, Estado)
              VALUES (@IdEmpresa, @FechaPago, @ValorTotal, @Estado)
          `);

      res.status(200).json({ message: 'Nómina creada con éxito', nominaId: result.recordset });
  } catch (err) {
      console.error('Error al crear la nómina:', err);
      res.status(500).json({ message: 'Error al crear la nómina' });
  }
};


const getNomina = async (req, res) => {
  try {
      const idEmpresa = global.idDeEmpresa;
      const { pagina, nominasPorPagina } = req.query; // Obtenemos parámetros de paginación

      // Log de los parámetros recibidos
      console.log('Parámetros de consulta:', req.query);

      if (!idEmpresa) {
          console.log('IdEmpresa no está disponible');
          return res.status(400).json({ message: 'IdEmpresa no está disponible' });
      }

      if (!pagina || !nominasPorPagina || isNaN(pagina) || isNaN(nominasPorPagina) || pagina <= 0 || nominasPorPagina <= 0) {
          console.log('Parámetros de paginación inválidos:', { pagina, nominasPorPagina });
          return res.status(400).json({ message: 'Debe especificar página y nominasPorPagina con valores válidos' });
      }

      const offset = (pagina - 1) * nominasPorPagina; // Calcular el offset para la paginación
      console.log('Offset calculado:', offset);

      const pool = await connectDB();
      console.log('Conexión a la base de datos establecida');

      const nominaResult = await pool.request()
          .input('IdEmpresa', sql.Int, idEmpresa)
          .input('Offset', sql.Int, offset)
          .input('Limite', sql.Int, nominasPorPagina)
          .query(`
              SELECT 
                  IdNomina, 
                  FechaPago, 
                  ValorTotal, 
                  Estado
              FROM NominaEmpresa
              WHERE IdEmpresa = @IdEmpresa
              AND Estado = 'En Deuda'
              ORDER BY IdNomina
              OFFSET @Offset ROWS FETCH NEXT @Limite ROWS ONLY
          `);

      // Log de los resultados de la consulta
      console.log('Resultados de la consulta:', nominaResult.recordset);

      const nominas = nominaResult.recordset;

      if (nominas.length === 0) {
          console.log('No se encontraron nóminas para esta empresa');
          return res.status(404).json({ message: 'No se encontraron nóminas para esta empresa' });
      }

      res.status(200).json(nominas);
  } catch (err) {
      console.error('Error al obtener las nóminas:', err);
      res.status(500).json({ message: 'Error en el servidor al obtener las nóminas' });
  }
};

const actualizarSaldoYEstadoNomina = async (req, res) => {
  // Conectamos a la base de datos
  const pool = await connectDB();
  const idEmpresa = global.idDeEmpresa;
  const estadoNomina = "Pagado";
  const tpo = "Gasto";
  const fechaActual = new Date();
  const fechaFormateada = fechaActual.getFullYear() * 10000 + (fechaActual.getMonth() + 1) * 100 + fechaActual.getDate();
  try {
      const {monto, idNomina} = req.body;

      // Validamos los parámetros
      if (!monto || !idNomina) {
          return res.status(400).json({ message: 'Faltan parámetros necesarios' });
      }

      if (isNaN(monto) || monto <= 0) {
          return res.status(400).json({ message: 'El monto debe ser un número positivo' });
      }


      // Obtenemos el saldo actual de la cuenta de la empresa
      const resultSaldo = await pool.request()
          .input('IdEmpresa', sql.Int, idEmpresa)
          .query('SELECT Saldo FROM CuentaBanco WHERE IdEmpresa = @IdEmpresa');

      if (resultSaldo.recordset.length === 0) {
          return res.status(404).json({ message: 'Cuenta bancaria no encontrada para esta empresa' });
      }

      const saldoActual = resultSaldo.recordset[0].Saldo;

      // Actualizamos el saldo de la cuenta bancaria
      await pool.request()
          .input('IdEmpresa', sql.Int, idEmpresa)
          .input('NuevoSaldo', sql.Decimal, saldoActual - monto)
          .query('UPDATE CuentaBanco SET Saldo = @NuevoSaldo WHERE IdEmpresa = @IdEmpresa');

      // Registra el movimiento en la tabla Movimientos
      await pool.request()
          .input('IdEmpresa', sql.Int, idEmpresa)
          .input('Tipo', sql.VarChar, tpo)
          .input('Valor', sql.Decimal, monto)
          .input('Fecha', sql.Int, fechaFormateada)  // Agregamos la fecha formateada
          .query('INSERT INTO Movimiento (IdEmpresa, Fecha, Tipo, Valor) VALUES (@IdEmpresa, @Fecha, @Tipo, @Valor)');

      // Actualizamos el estado de la nómina
      await pool.request()
          .input('IdNomina', sql.Int, idNomina)
          .input('EstadoNomina', sql.VarChar(50), estadoNomina)
          .query('UPDATE NominaEmpresa SET Estado = @EstadoNomina WHERE IdNomina = @IdNomina');

      return res.status(200).json({ message: 'Saldo y estado de la nómina actualizados correctamente' });
  } catch (err) {
      console.error('Error al actualizar saldo y estado de la nómina:', err);
      res.status(500).json({ message: 'Error en el servidor al actualizar saldo y estado de la nómina' });
  }
};

module.exports = { getEmpleadosDeEmpresa, getEmpleosDeEmpresa, getAplicantesEmpleos, 
    insertarAplicanteEmpleo, contratarEmpleado, crearEmpleo, CrearNomina, getNomina, 
    actualizarSaldoYEstadoNomina };

