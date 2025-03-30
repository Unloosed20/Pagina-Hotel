const express = require("express");
const router = express.Router();
const { registrarClienteYUsuario } = require("../controllers/RegistroClientesControlador");

router.post("/registro", registrarClienteYUsuario);

module.exports = router;
