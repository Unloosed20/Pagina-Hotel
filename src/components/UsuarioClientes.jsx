// src/RegistroUsuario.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient"; // Asegúrate de que la ruta es correcta
import "./UsuarioClientes.css";

const RegistroUsuario = () => {
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
      navigate("/registro-clientes"); // Si no hay datos, redirige a RegistroClientes
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
      // Recuperar los datos del cliente almacenados previamente
      const clienteData = JSON.parse(sessionStorage.getItem("clienteData"));

      // 1. Insertar en la tabla "usuarios" con el rol 3 (clientes)
      const { data: usuarioData, error: usuarioError } = await supabase
        .from("usuarios")
        .insert([
          {
            nombre_usuario: formData.username,
            contraseña: formData.password,
            role_id: 3, // Rol fijo para clientes
          },
        ])
        .select(); // Selecciona el registro insertado para obtener su id

      if (usuarioError) throw usuarioError;
      if (!usuarioData || usuarioData.length === 0) throw new Error("Error al crear el usuario");

      const usuarioId = usuarioData[0].id;

      // 2. Insertar en la tabla "clientes" usando el id del usuario recién creado
      const { error: clienteError } = await supabase
        .from("clientes")
        .insert([
          {
            usuario_id: usuarioId,
            nombre: clienteData.nombre,
            apellido_paterno: clienteData.apellidoPaterno,
            apellido_materno: clienteData.apellidoMaterno,
            email: clienteData.email,
            telefono: clienteData.telefono,
            direccion: clienteData.direccion,
            nacionalidad: clienteData.nacionalidad,
            fecha_nacimiento: clienteData.fechaDeNacimiento,
            rfc: clienteData.rfc,
            membresia_id: clienteData.membresia, // Asegúrate de que el valor enviado es correcto
          },
        ]);

      if (clienteError) throw clienteError;

      alert("Cuenta creada exitosamente");
      sessionStorage.removeItem("clienteData");
      navigate("/pagina-principal");
    } catch (error) {
      console.error("Error:", error);
      alert("Error al crear cuenta: " + error.message);
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

