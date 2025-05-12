// src/components/UsuarioClientes.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "./UsuarioClientes.css";

const UsuarioClientes = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
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

    // 1️⃣ Registra en Supabase Auth usando el email
    const clienteData = JSON.parse(sessionStorage.getItem("clienteData"));
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: clienteData.email,
      password,
    });
    if (signUpError) {
      console.error("Error en Auth.signUp:", signUpError);
      alert("No se pudo crear cuenta de autenticación: " + signUpError.message);
      return;
    }

    // 2️⃣ Inserta en tu tabla 'usuarios' usando el UUID de Auth
    const { data: usuarioData, error: usuarioError } = await supabase
      .from("usuarios")
      .insert([
        {
          auth_id: signUpData.user.id,      // campo nuevo en tu tabla para enlazar
          nombre_usuario: username,
          role_id: 3,
        },
      ])
      .select("id")
      .single();
    if (usuarioError) {
      console.error("Error insertando en usuarios:", usuarioError);
      alert("Error al guardar usuario: " + usuarioError.message);
      // opcional: borrar la cuenta de Auth si quieres deshacer
      await supabase.auth.api.deleteUser(signUpData.user.id);
      return;
    }

    // 3️⃣ Inserta en la tabla 'clientes'
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
      console.error("Error insertando en clientes:", clienteError);
      alert("Error al guardar perfil de cliente: " + clienteError.message);
      // opcional: deshacer usuario y Auth
      await supabase.from("usuarios").delete().eq("id", usuarioData.id);
      await supabase.auth.api.deleteUser(signUpData.user.id);
      return;
    }

    // 4️⃣ ¡Listo! la sesión de Supabase ya está activa tras el signUp
    sessionStorage.removeItem("clienteData");
    navigate("/pagina-principal");
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
