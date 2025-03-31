import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient"; // Asegúrate de que la ruta es correcta
import "./GestionClientes.css";

const GestionClientes = () => {
  const [clientes, setClientes] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState(null);
  const [formData, setFormData] = useState({
    nombre: "",
    apellido_paterno: "",
    apellido_materno: "",
    email: "",
    telefono: "",
    direccion: "",
    nacionalidad: "",
    fecha_nacimiento: "",
    rfc: "",
    membresia_id: 1,
    username: "",
    password: "",
  });

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    const { data, error } = await supabase
      .from("clientes")
      .select("*, usuarios(nombre_usuario)");

    if (error) {
      console.error("Error al obtener clientes:", error);
    } else {
      setClientes(data);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!editingCliente) {
      try {
        // 1. Insertar usuario en "usuarios"
        const { data: usuarioData, error: usuarioError } = await supabase
          .from("usuarios")
          .insert([
            {
              nombre_usuario: formData.username,
              contraseña: formData.password,
              role_id: 3, // Cliente
            },
          ])
          .select();

        if (usuarioError) throw usuarioError;
        if (!usuarioData || usuarioData.length === 0) throw new Error("Error al crear usuario");

        const usuarioId = usuarioData[0].id;

        // 2. Insertar cliente en "clientes"
        const { error: clienteError } = await supabase.from("clientes").insert([
          {
            usuario_id: usuarioId,
            nombre: formData.nombre,
            apellido_paterno: formData.apellido_paterno,
            apellido_materno: formData.apellido_materno,
            email: formData.email,
            telefono: formData.telefono,
            direccion: formData.direccion,
            nacionalidad: formData.nacionalidad,
            fecha_nacimiento: formData.fecha_nacimiento,
            rfc: formData.rfc,
            membresia_id: formData.membresia_id,
          },
        ]);

        if (clienteError) {
          // Si falla la inserción del cliente, eliminar el usuario creado
          await supabase.from("usuarios").delete().eq("id", usuarioId);
          throw clienteError;
        }

        alert("Cliente registrado exitosamente.");
      } catch (error) {
        console.error("Error:", error);
        alert("Error al registrar cliente: " + error.message);
      }
    } else {
      // Actualizar cliente existente
      const { error } = await supabase.from("clientes").update(formData).eq("id", editingCliente.id);
      if (error) {
        console.error("Error al actualizar:", error);
        alert("Error al actualizar cliente.");
      }
    }

    fetchClientes();
    closeModal();
  };

  const handleDelete = async (id, usuarioId) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este cliente?")) {
      try {
        // 1. Eliminar cliente
        const { error: clienteError } = await supabase.from("clientes").delete().eq("id", id);
        if (clienteError) throw clienteError;

        // 2. Eliminar usuario asociado
        const { error: usuarioError } = await supabase.from("usuarios").delete().eq("id", usuarioId);
        if (usuarioError) throw usuarioError;

        alert("Cliente eliminado exitosamente.");
        fetchClientes();
      } catch (error) {
        console.error("Error:", error);
        alert("Error al eliminar cliente.");
      }
    }
  };

  const openModal = (cliente = null) => {
    if (cliente) {
      setEditingCliente(cliente);
      setFormData(cliente);
    } else {
      setEditingCliente(null);
      setFormData({
        nombre: "",
        apellido_paterno: "",
        apellido_materno: "",
        email: "",
        telefono: "",
        direccion: "",
        nacionalidad: "",
        fecha_nacimiento: "",
        rfc: "",
        membresia_id: 1,
        username: "",
        password: "",
      });
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  return (
    <div className="container">
      <h1 className="title">Gestión de Clientes</h1>
      <button className="add-btn" onClick={() => openModal()}>
        Agregar Cliente
      </button>
      <table className="client-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Teléfono</th>
            <th>Usuario</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {clientes.map((cliente) => (
            <tr key={cliente.id}>
              <td>{`${cliente.nombre} ${cliente.apellido_paterno}`}</td>
              <td>{cliente.email}</td>
              <td>{cliente.telefono}</td>
              <td>{cliente.usuarios.nombre_usuario}</td>
              <td>
                <button className="edit-btn" onClick={() => openModal(cliente)}>Editar</button>
                <button className="delete-btn" onClick={() => handleDelete(cliente.id, cliente.usuario_id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {modalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>{editingCliente ? "Editar Cliente" : "Agregar Cliente"}</h2>
            <form onSubmit={handleSubmit}>
              <input type="text" name="nombre" placeholder="Nombre" value={formData.nombre} onChange={handleChange} required />
              <input type="text" name="apellido_paterno" placeholder="Apellido Paterno" value={formData.apellido_paterno} onChange={handleChange} required />
              <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
              <input type="text" name="telefono" placeholder="Teléfono" value={formData.telefono} onChange={handleChange} />
              <input type="text" name="username" placeholder="Usuario" value={formData.username} onChange={handleChange} required />
              <input type="password" name="password" placeholder="Contraseña" value={formData.password} onChange={handleChange} required />
              <select name="membresia_id" value={formData.membresia_id} onChange={handleChange}>
                <option value="1">Sin membresía</option>
                <option value="2">Básica</option>
                <option value="3">Premium</option>
                <option value="4">VIP</option>
              </select>
              <button type="submit">Guardar</button>
              <button type="button" onClick={closeModal}>Cancelar</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionClientes;
