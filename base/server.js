require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Pool } = require("pg");

const app = express();
const port = process.env.PORT || 5000;

// Configuración de CORS
app.use(cors());
app.use(bodyParser.json());

// Configuración de PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
});

// Ruta para registrar un cliente
app.post("/api/registro-clientes", async (req, res) => {
  try {
    const { nombre, apellidoPaterno, apellidoMaterno, email, telefono, direccion, nacionalidad, fechaDeNacimiento, rfc, membresia } = req.body;

    const query = `
      INSERT INTO clientes (nombre, apellido_paterno, apellido_materno, email, telefono, direccion, nacionalidad, fecha_nacimiento, rfc, membresia_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`;

    const values = [nombre, apellidoPaterno, apellidoMaterno, email, telefono, direccion, nacionalidad, fechaDeNacimiento, rfc, membresia || null];

    const result = await pool.query(query, values);
    res.status(201).json({ message: "Cliente registrado", cliente: result.rows[0] });

  } catch (error) {
    console.error("Error al registrar cliente:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
