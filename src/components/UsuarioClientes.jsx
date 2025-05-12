// src/RegistroUsuario.jsx
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../supabaseClient"; // Asegúrate de que la ruta es correcta
import "./UsuarioClientes.css";

const UsuarioClientes = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    // Recuperar datos del cliente almacenados en sessionStorage (viene de RegistroClientes)
    const clienteData = sessionStorage.getItem("clienteData");
    if (!clienteData) {
      alert("No hay datos de cliente. Redirigiendo...");
      navigate("/registro-clientes");
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { username, password, confirmPassword } = formData;
    if (password !== confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }

    try {
      // 1️⃣ Creamos el usuario en la tabla 'usuarios'
      const { data: usuarioData, error: usuarioError } = await supabase
        .from("usuarios")
        .insert([
          { nombre_usuario: username, contraseña: password, role_id: 3 },
        ])
        .select("id")
        .single();
      if (usuarioError) throw usuarioError;

      // 2️⃣ Creamos el perfil en la tabla 'clientes'
      const clienteData = JSON.parse(sessionStorage.getItem("clienteData"));
      const { error: clienteError } = await supabase
        .from("clientes")
        .insert([
          {
            usuario_id: usuarioData.id,
            nombre: clienteData.nombre,
            apellido_paterno: clienteData.apellidoPaterno,
            apellido_materno: clienteData.apellidoMaterno,
            email: clienteData.email,
            telefono: clienteData.telefono,
            direccion: clienteData.direccion,
            nacionalidad: clienteData.nacionalidad,
            fecha_nacimiento: clienteData.fechaDeNacimiento,
            rfc: clienteData.rfc,
            membresia_id: clienteData.membresia,
          },
        ]);
      if (clienteError) {
        // Si falla, deshacemos el usuario
        await supabase.from("usuarios").delete().eq("id", usuarioData.id);
        throw clienteError;
      }

      // 3️⃣ Iniciar sesión automáticamente en Supabase Auth
      const { data: loginData, error: loginError } = await supabase.auth.signIn({
        email: clienteData.email,
        password,
      });
      if (loginError || !loginData.session) {
        throw loginError || new Error("No se obtuvo sesión tras el login");
      }

      // 4️⃣ Limpieza y redirección
      sessionStorage.removeItem("clienteData");
      navigate("/pagina-principal"); // cliente => ruta protegida

    } catch (error) {
      console.error("Error al crear cuenta o iniciar sesión:", error);
      alert("Error: " + error.message);
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

export default UsuarioClientes;

