const pool = require("../config/db");
const bcrypt = require("bcrypt");

const registrarCliente = async (req, res) => {
  try {
    const { nombre, apellidoPaterno, apellidoMaterno, email, telefono, direccion, nacionalidad, fechaDeNacimiento, rfc, username, password } = req.body;

    // Validar si el username ya existe
    const usuarioExistente = await pool.query(
      `SELECT id FROM usuarios WHERE username = $1`, [username]
    );

    if (usuarioExistente.rows.length > 0) {
      return res.status(400).json({ error: "El nombre de usuario ya está en uso" });
    }

    // Encriptar contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insertar usuario
    const usuarioResult = await pool.query(
      `INSERT INTO usuarios (username, password, id_rol) 
       VALUES ($1, $2, 3) RETURNING id`,
      [username, hashedPassword]
    );

    const usuarioId = usuarioResult.rows[0].id;

    // Insertar cliente
    const fechaNacimientoFormatted = new Date(fechaDeNacimiento).toISOString().split("T")[0];
    const clienteResult = await pool.query(
      `INSERT INTO clientes 
        (usuario_id, nombre, apellido_paterno, apellido_materno, email, telefono, direccion, nacionalidad, fecha_nacimiento, rfc) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [usuarioId, nombre, apellidoPaterno, apellidoMaterno, email, telefono, direccion, nacionalidad, fechaNacimientoFormatted, rfc]
    );

    res.status(201).json({ message: "✅ Cliente registrado", cliente: clienteResult.rows[0] });

  } catch (error) {
    console.error("❌ Error al registrar cliente:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

module.exports = { registrarCliente };
