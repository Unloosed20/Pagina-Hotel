import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient"; // Asegúrate de que la ruta es correcta
import "./GestionEmpleados.css";

const GestionEmpleados = () => {
  const [empleados, setEmpleados] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEmpleado, setEditingEmpleado] = useState(null);
  const [formData, setFormData] = useState({
    nombre: "",
    apellido_paterno: "",
    apellido_materno: "",
    direccion: "",
    curp: "",
    fecha_contratacion: "",
    rfc: "",
    puesto_id: "",
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
      .select("*, usuarios(id, nombre_usuario, contraseña),  puesto:puestos(nombre)");

    if (error) {
      console.error("Error al obtener empleados:", error);
    } else {
      setEmpleados(data);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target; // Extraemos name y value correctamente
  
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: name === "puesto_id" ? parseInt(value) || "" : value, // Convierte solo el puesto a número
    }));
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
            apellido_paterno: formData.apellido_paterno,
            apellido_materno: formData.apellido_materno,
            direccion: formData.direccion,
            curp: formData.curp,
            rfc: formData.rfc,
            fecha_contratacion: formData.fecha_contratacion,
            puesto_id: formData.puesto_id,
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
      try {
        // 1. Actualizar datos del empleado
        const { error: empleadoError } = await supabase
          .from("empleados")
          .update({
            nombre: formData.nombre,
            apellido_paterno: formData.apellido_paterno,
            apellido_materno: formData.apellido_materno,
            direccion: formData.direccion,
            curp: formData.curp,
            rfc: formData.rfc,
            fecha_contratacion: formData.fecha_contratacion,
            puesto_id: formData.puesto_id,
            email: formData.email,
            telefono: formData.telefono,
          })
          .eq("id", editingEmpleado.id);
  
        if (empleadoError) throw empleadoError;
  
        // 2. Actualizar datos del usuario
        const { error: usuarioError } = await supabase
          .from("usuarios")
          .update({
            nombre_usuario: formData.username,
            contraseña: formData.password,
          })
          .eq("id", editingEmpleado.usuario_id);
  
        if (usuarioError) throw usuarioError;
  
        alert("Empleado actualizado exitosamente.");
      } catch (error) {
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
      setFormData({
        nombre: empleado.nombre,
        apellido_paterno: empleado.apellido_paterno,
        apellido_materno: empleado.apellido_materno,
        direccion: empleado.direccion,
        curp: empleado.curp,
        rfc: empleado.rfc,
        fecha_contratacion: empleado.fecha_contratacion,
        puesto_id: empleado.puesto_id,
        email: empleado.email,
        telefono: empleado.telefono,
        username: empleado.usuarios ? empleado.usuarios.nombre_usuario : "",
        password: empleado.usuarios ? empleado.usuarios.contraseña : "",
      });
    } else {
      setEditingEmpleado(null);
      setFormData({
        nombre: "",
        apellido_paterno: "",
        apellido_materno: "",
        direccion: "",
        curp: "",
        rfc: "",
        fecha_contratacion: "",
        puesto_id: "",
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
              <td>{`${empleado.nombre} ${empleado.apellido_paterno} ${empleado.apellido_materno}`}</td>
              <td>{empleado.puesto ? empleado.puesto.nombre : "Sin puesto"}</td>
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
              <input type="text" name="apellido_paterno" placeholder="Apellido Paterno" value={formData.apellido_paterno} onChange={handleChange} required />
              <input type="text" name="apellido_materno" placeholder="Apellido materno" value={formData.apellido_materno} onChange={handleChange} required />
              <input type="text" name="direccion" placeholder="Direccion" value={formData.direccion} onChange={handleChange} required />
              <input type="text" name="curp" placeholder="CURP" value={formData.curp} onChange={handleChange} required />
              <input type="text" name="rfc" placeholder="RFC" value={formData.rfc} onChange={handleChange} required />
              <input type="date" name="fecha_contratacion" value={formData.fecha_contratacion} onChange={handleChange}/>
              <select name="puesto_id" value={formData.puesto_id} onChange={handleChange} required>
                <option value="">Selecciona el puesto</option>
                <option value="1">Recepcionista</option>
                <option value="2">Limpieza</option>
                <option value="3">Chef</option>
                <option value="4">Gerente</option>
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
