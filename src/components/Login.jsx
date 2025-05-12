/* src/components/Login.jsx */
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { supabase } from "../supabaseClient";
import "./Login.css";

const Login = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = new URLSearchParams(location.search).get('redirect');

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { username, password } = formData;
    try {
      // 1) Get user record by username
      const { data: userRecord, error: fetchError } = await supabase
        .from('usuarios')
        .select('id, email, role_id')
        .eq('nombre_usuario', username)
        .single();
      if (fetchError || !userRecord) {
        setError("Usuario no encontrado");
        return;
      }
      // 2) Sign in via Supabase Auth using email
      const { user, error: authError } = await supabase.auth.signIn({
        email: userRecord.email,
        password,
      });
      if (authError || !user) {
        setError("Credenciales inválidas");
        return;
      }
      // 3) Redirect based on redirect param or role
      if (redirectTo) {
        navigate(redirectTo, { replace: true });
      } else if (userRecord.role_id === 3) {
        navigate("/pagina-principal", { replace: true });
      } else if (userRecord.role_id === 1) {
        navigate("/admin-dashboard", { replace: true });
      } else {
        setError("Acceso denegado. No tienes permisos.");
      }
    } catch (err) {
      console.error(err);
      setError("Error al iniciar sesión. Intenta de nuevo.");
    }
  };

  return (
    <div className="login-container">
      <h1>Bienvenido</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="username"
          placeholder="Nombre de usuario"
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