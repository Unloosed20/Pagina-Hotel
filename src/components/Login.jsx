import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient"; // Asegúrate de que la ruta es correcta
import "./Login.css"; // Asegúrate de importar el CSS

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
      // Llamada a Supabase para autenticar al usuario
      const { data, error: loginError } = await supabase
        .from("usuarios")
        .select("id, nombre_usuario, contraseña, role_id")
        .eq("nombre_usuario", username) // Buscar usuario por nombre de usuario
        .single(); // Debería devolver solo un registro

      if (loginError || !data) {
        setError("Usuario no encontrado");
        return;
      }

      // Verificar si la contraseña proporcionada es correcta
      if (data.contraseña !== password) {
        setError("Contraseña incorrecta");
        return;
      }

      // Verificar si el rol es 3 (cliente)
      if (data.role_id !== 3) {
        setError("Acceso denegado. No tienes permisos para acceder.");
        return;
      }

      // Si las credenciales son correctas y el rol es 3, redirige a la página principal
      navigate("/pagina-principal");

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
