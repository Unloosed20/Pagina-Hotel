require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Pool } = require("pg");

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json()); // Importante para recibir JSON en req.body

// Configuración de PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Usa la conexión completa
  ssl: {
    rejectUnauthorized: false, // Necesario para Railway
  },
});

pool.connect()
  .then(() => console.log("✅ Conectado a PostgreSQL en Railway"))
  .catch(err => console.error("❌ Error al conectar a la BD:", err));

// Ruta para registrar un cliente
app.post("/api/registro-clientes", async (req, res) => {
  try {
    const { nombre, apellidoPaterno, apellidoMaterno, email, telefono, direccion, nacionalidad, fechaDeNacimiento, rfc, membresia } = req.body;

    const query = `
      INSERT INTO clientes (nombre, apellido_paterno, apellido_materno, email, telefono, direccion, nacionalidad, fecha_nacimiento, rfc, membresia_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`;

    const values = [nombre, apellidoPaterno, apellidoMaterno, email, telefono, direccion, nacionalidad, fechaDeNacimiento, rfc, membresia || null];

    const result = await pool.query(query, values);
    res.status(201).json({ message: "✅ Cliente registrado", cliente: result.rows[0] });

  } catch (error) {
    console.error("❌ Error al registrar cliente:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
});
