import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./RegistroUsuario.css";

const RegistroUsuario = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    // Recuperar datos del cliente almacenados en sessionStorage
    const clienteData = sessionStorage.getItem("clienteData");
    if (!clienteData) {
      alert("No hay datos de cliente. Redirigiendo...");
      navigate("/registro-clientes"); // Si no hay datos, redirigir
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }

    try {
      const clienteData = JSON.parse(sessionStorage.getItem("clienteData"));

      const response = await fetch("https://tu-backend.com/api/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...clienteData, ...formData }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Cuenta creada exitosamente");
        sessionStorage.removeItem("clienteData"); // Eliminar datos temporales
        navigate("/pagina-principal");
      } else {
        alert("Error: " + data.error);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error en la conexión con el servidor");
    }
  };

  return (
    <div className="register-container">
      <h1>Crear Cuenta</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="username"
          placeholder="Usuario"
          value={formData.username}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirmar Contraseña"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />
        <button type="submit">Crear Cuenta</button>
      </form>
    </div>
  );
};

export default RegistroUsuario;

