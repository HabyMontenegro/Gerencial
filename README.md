
# Módulo Gerencial de Modelos y Simulaciones

Este proyecto es una aplicación desarrollada utilizando React, Node.js y Next.js. Su objetivo es proporcionar una solución para el módulo gerencial de modelos y simulaciones.

## Requisitos

Antes de comenzar, asegúrate de tener los siguientes requisitos instalados en tu sistema:

- **Node.js** (Versión recomendada: v22.11.0)
- **SQL Server Management Studio** (SSMS)

### Configuración de SQL Server
1. Crear un usuario con los siguientes credenciales:
   - **Usuario**: `sa`
   - **Contraseña**: `sa`
2. Crear una base de datos llamada `gerencial`.

## Instalación y Configuración

1. Clona este repositorio en tu máquina local:
   ```bash
   git clone https://github.com/HabyMontenegro/Gerencial.git
   cd modulo-gerencial
   ```

2. Instala las dependencias del backend y frontend:
   ```bash
   cd ../backend
   npm install

   cd ../frontend
   npm install
   ```

3. Configura las variables de entorno. Asegurate que tu archivo `.env` en la raíz del proyecto backend tenga el siguiente contenido:
   ```plaintext
   DB_SERVER=127.0.0.1
   DB_DATABASE=gerencial
   DB_USER=sa
   DB_PASSWORD=sa
   ```

4. Configura la base de datos:
   - Copia y pega el contenido de `Tablas.txt` en tu base de datos `gerencial` para crear las tablas necesarias.
   - Copia y pega el contenido de `Triggers.txt` para configurar los triggers requeridos.
   - Inserta los datos iniciales copiando y pegando el contenido de `InsertDatos.txt`.

## Uso

### Iniciar el backend
Navega al directorio del backend y ejecuta el siguiente comando:
```bash
npm run dev
```

### Iniciar el frontend
Navega al directorio del frontend y ejecuta el siguiente comando:
```bash
npm start
```

Una vez que ambos servidores estén en ejecución, accede a la aplicación en tu navegador en la URL proporcionada (por defecto: `http://localhost:3000`).

## Estructura del Proyecto

- **Frontend**: Contiene el código de la interfaz de usuario desarrollado en React y Next.js.
- **Backend**: Maneja la lógica del servidor y la conexión a la base de datos utilizando Node.js.
- **Archivos de Configuración**:
  - `Tablas.txt`: Define las tablas requeridas en la base de datos.
  - `Triggers.txt`: Contiene los triggers necesarios para el funcionamiento del sistema.
  - `InsertDatos.txt`: Proporciona los datos iniciales para poblar la base de datos.


## Contacto

Si tienes preguntas o problemas con el proyecto, no dudes en contactarme en mi correo electrónico o abrir un *issue* en el repositorio.

También puedes enviar un correo a: hmontenegrom@unicesar.edu.co o habysmonth@gmail.com

---

¡Gracias por usar el **Módulo Gerencial de Modelos y Simulaciones**!
