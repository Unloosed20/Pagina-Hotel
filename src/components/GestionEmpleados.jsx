import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient"; // Asegúrate de que la ruta es correcta
import "./GestionEmpleados.css";

const GestionEmpleados = () => {
  const [empleados, setEmpleados] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEmpleado, setEditingEmpleado] = useState(null);
  const [formData, setFormData] = useState({
    nombre: "",
    domicilio: "",
    curp: "",
    rfc: "",
    puesto: "",
    email: "",
    telefono: "",
    username: "",
    password: "",
  });

  useEffect(() => {
    fetchEmpleados();
  }, []);

  const fetchEmpleados = async () => {
    const { data, error } = await supabase
      .from("empleados")
      .select("*, usuarios(nombre_usuario)");

    if (error) {
      console.error("Error al obtener empleados:", error);
    } else {
      setEmpleados(data);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!editingEmpleado) {
      try {
        // 1. Insertar usuario en "usuarios"
        const { data: usuarioData, error: usuarioError } = await supabase
          .from("usuarios")
          .insert([
            {
              nombre_usuario: formData.username,
              contraseña: formData.password,
              role_id: 2, // Empleado
            },
          ])
          .select();

        if (usuarioError) throw usuarioError;
        if (!usuarioData || usuarioData.length === 0) throw new Error("Error al crear usuario");

        const usuarioId = usuarioData[0].id;

        // 2. Insertar empleado en "empleados"
        const { error: empleadoError } = await supabase.from("empleados").insert([
          {
            usuario_id: usuarioId,
            nombre: formData.nombre,
            domicilio: formData.domicilio,
            curp: formData.curp,
            rfc: formData.rfc,
            puesto: formData.puesto,
            email: formData.email,
            telefono: formData.telefono,
          },
        ]);

        if (empleadoError) {
          await supabase.from("usuarios").delete().eq("id", usuarioId);
          throw empleadoError;
        }

        alert("Empleado registrado exitosamente.");
      } catch (error) {
        console.error("Error:", error);
        alert("Error al registrar empleado: " + error.message);
      }
    } else {
      // Actualizar empleado existente
      const { error } = await supabase.from("empleados").update(formData).eq("id", editingEmpleado.id);
      if (error) {
        console.error("Error al actualizar:", error);
        alert("Error al actualizar empleado.");
      }
    }

    fetchEmpleados();
    closeModal();
  };

  const handleDelete = async (id, usuarioId) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este empleado?")) {
      try {
        // 1. Eliminar empleado
        const { error: empleadoError } = await supabase.from("empleados").delete().eq("id", id);
        if (empleadoError) throw empleadoError;

        // 2. Eliminar usuario asociado
        const { error: usuarioError } = await supabase.from("usuarios").delete().eq("id", usuarioId);
        if (usuarioError) throw usuarioError;

        alert("Empleado eliminado exitosamente.");
        fetchEmpleados();
      } catch (error) {
        console.error("Error:", error);
        alert("Error al eliminar empleado.");
      }
    }
  };

  const openModal = (empleado = null) => {
    if (empleado) {
      setEditingEmpleado(empleado);
      setFormData(empleado);
    } else {
      setEditingEmpleado(null);
      setFormData({
        nombre: "",
        domicilio: "",
        curp: "",
        rfc: "",
        puesto: "",
        email: "",
        telefono: "",
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
      <h1 className="title">Gestión de Empleados</h1>
      <button className="add-btn" onClick={() => openModal()}>
        Agregar Empleado
      </button>
      <table className="employee-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Puesto</th>
            <th>Email</th>
            <th>Teléfono</th>
            <th>Usuario</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {empleados.map((empleado) => (
            <tr key={empleado.id}>
              <td>{empleado.nombre}</td>
              <td>{empleado.puesto}</td>
              <td>{empleado.email}</td>
              <td>{empleado.telefono}</td>
              <td>{empleado.usuarios.nombre_usuario}</td>
              <td>
                <button className="edit-btn" onClick={() => openModal(empleado)}>Editar</button>
                <button className="delete-btn" onClick={() => handleDelete(empleado.id, empleado.usuario_id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {modalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>{editingEmpleado ? "Editar Empleado" : "Agregar Empleado"}</h2>
            <form onSubmit={handleSubmit}>
              <input type="text" name="nombre" placeholder="Nombre" value={formData.nombre} onChange={handleChange} required />
              <input type="text" name="domicilio" placeholder="Domicilio" value={formData.domicilio} onChange={handleChange} required />
              <input type="text" name="curp" placeholder="CURP" value={formData.curp} onChange={handleChange} required />
              <input type="text" name="rfc" placeholder="RFC" value={formData.rfc} onChange={handleChange} required />
              <select name="puesto" value={formData.puesto} onChange={handleChange} required>
                <option value="">Selecciona el puesto</option>
                <option value="Recepcionista">Recepcionista</option>
                <option value="Limpieza">Limpieza</option>
                <option value="Chef">Chef</option>
                <option value="Gerente">Gerente</option>
              </select>
              <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
              <input type="text" name="telefono" placeholder="Teléfono" value={formData.telefono} onChange={handleChange} required />
              <input type="text" name="username" placeholder="Usuario" value={formData.username} onChange={handleChange} required />
              <input type="password" name="password" placeholder="Contraseña" value={formData.password} onChange={handleChange} required />
              <button type="submit">Guardar</button>
              <button type="button" onClick={closeModal}>Cancelar</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionEmpleados;
