const pool = require("../db");
const bcrypt = require("bcryptjs");

const registrarClienteYUsuario = async (req, res) => {
  const { nombre, apellidoPaterno, apellidoMaterno, email, telefono, direccion, nacionalidad, fechaDeNacimiento, rfc, membresia, username, password } = req.body;

  try {
    // Verificar si el email ya está registrado
    const checkUser = await pool.query("SELECT * FROM clientes WHERE email = $1", [email]);
    if (checkUser.rows.length > 0) {
      return res.status(400).json({ error: "El email ya está registrado" });
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar usuario en la tabla usuarios (Rol 3 = Cliente)
    const usuarioResult = await pool.query(
      "INSERT INTO usuarios (nombre_usuario, contraseña, role_id) VALUES ($1, $2, 3) RETURNING id",
      [username, hashedPassword]
    );

    const usuarioId = usuarioResult.rows[0].id;

    // Insertar cliente en la tabla clientes
    await pool.query(
      "INSERT INTO clientes (usuario_id, nombre, apellido_paterno, apellido_materno, email, telefono, direccion, nacionalidad, fecha_nacimiento, rfc, membresia_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)",
      [usuarioId, nombre, apellidoPaterno, apellidoMaterno, email, telefono, direccion, nacionalidad, fechaDeNacimiento, rfc, membresia || null]
    );

    res.status(201).json({ message: "Cliente y usuario registrados exitosamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en el servidor" });
  }
};

module.exports = { registrarClienteYUsuario };
