import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "./Login.css";

const Login = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { username, password } = formData;

    try {
      // 1. Buscar al usuario en Supabase
      const { data, error: loginError } = await supabase
        .from("usuarios")
        .select("id, nombre_usuario, contraseña, role_id")
        .eq("nombre_usuario", username)
        .single();

      if (loginError || !data) {
        setError("Usuario no encontrado");
        return;
      }

      // 2. Verificar contraseña
      if (data.contraseña !== password) {
        setError("Contraseña incorrecta");
        return;
      }

      // 3. Guardar sesión en localStorage
      const userSession = {
        id: data.id,
        username: data.nombre_usuario,
        role: Number(data.role_id),        // si manejas tokens, agrégalos aquí
      };
      localStorage.setItem("user", JSON.stringify(userSession));

      // 4. Redirigir según rol
      if (data.role_id === 3) {
        navigate("/pagina-principal"); // Cliente
      } else if (data.role_id === 1) {
        navigate("/admin-dashboard"); // Administrador
      } else {
        setError("Acceso denegado. No tienes permisos.");
      }

    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      setError("Hubo un error al intentar iniciar sesión. Intenta nuevamente.");
    }
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
        {error && <p className="error-message">{error}</p>}
        <button type="submit">Login</button>
      </form>
      <div className="options">
        <a href="#">¿Perdiste tu contraseña?</a>
        <Link to="/registro-clientes" className="text-blue-500 hover:underline">
          No tienes cuenta? Regístrate
        </Link>
      </div>
      <a href="#" className="back-link">Volver</a>
    </div>
  );
};

export default Login;
