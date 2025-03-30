const express = require("express");
const { registrarCliente } = require("../controllers/RegistroClientesControlador");

const router = express.Router();

router.post("/registro-clientes", registrarCliente);

module.exports = router;
