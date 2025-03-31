const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./db");

pool.connect()
  .then(() => console.log("✅ Conectado a la base de datos en Railway"))
  .catch((err) => {
    console.error("❌ Error de conexión:", err);
    console.log("Detalles del error:", err.stack);
  });


const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Importar rutas
const registroRoutes = require("./routes/RegistroClientes");

app.use("/api", registroRoutes);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
