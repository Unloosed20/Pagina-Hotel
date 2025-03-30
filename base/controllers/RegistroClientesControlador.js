const pool = require("../config/db");

const registrarCliente = async (req, res) => {
  try {
    const { nombre, apellidoPaterno, apellidoMaterno, email, telefono, direccion, nacionalidad, fechaDeNacimiento, rfc, username, password } = req.body;

    // 1️ Insertar usuario en la tabla "usuarios"
    const usuarioResult = await pool.query(
      `INSERT INTO usuarios (username, password, id_rol) 
       VALUES ($1, $2, 3) RETURNING id`,
      [username, password]
    );

    const usuarioId = usuarioResult.rows[0].id;

    // 2️ Insertar cliente en la tabla "clientes"
    const clienteResult = await pool.query(
      `INSERT INTO clientes 
        (usuario_id, nombre, apellido_paterno, apellido_materno, email, telefono, direccion, nacionalidad, fecha_nacimiento, rfc) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [usuarioId, nombre, apellidoPaterno, apellidoMaterno, email, telefono, direccion, nacionalidad, fechaDeNacimiento, rfc]
    );

    res.status(201).json({ message: "Cliente registrado con éxito", cliente: clienteResult.rows[0] });
  } catch (error) {
    console.error("Error al registrar cliente:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

module.exports = { registrarCliente };
