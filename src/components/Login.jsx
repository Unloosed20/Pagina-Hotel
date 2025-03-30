import { useState } from "react";
import "./Login.css"; // Asegúrate de importar el CSS
import { Link } from "react-router-dom";
const Login = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Datos enviados:", formData);
  };

  return (
    <div className="login-container">
      <h1>Bienvenido</h1>
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
        <button type="submit">Login</button>
      </form>
      <div className="options">
        <a href="#">¿Perdiste tu contraseña?</a>
        <Link to="/registro-clientes" className="text-blue-500 hover:underline">No tienes cuenta? Regístrate</Link>
      </div>
      <a href="#" className="back-link">Volver</a>
    </div>
  );
};

export default Login;

