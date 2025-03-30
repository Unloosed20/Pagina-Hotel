const express = require("express");
const { registrarCliente, obtenerClientes } = require("../controllers/RegistroClientesControlador");

const router = express.Router();

// Ruta para registrar un cliente
router.post("/registro-clientes", registrarCliente);

module.exports = router;
