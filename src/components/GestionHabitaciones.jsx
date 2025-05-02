import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import "./GestionHabitaciones.css";

const GestionHabitaciones = () => {
  const [tiposHabitacion, setTiposHabitacion] = useState([]);
  const [habitaciones, setHabitaciones] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [tipoModalOpen, setTipoModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    numero_habitacion: "",
    estado: "Disponible",
    tipo: ""
  });

  const [formTipo, setFormTipo] = useState({
    tipo: "",
    descripcion: "",
    numero_persona: "",
    precio_noche: ""
  });

  const [editingHabitacion, setEditingHabitacion] = useState(null);

  useEffect(() => {
    fetchTiposHabitacion();
    fetchHabitaciones();
  }, []);

  const fetchTiposHabitacion = async () => {
    const { data, error } = await supabase.from("tipos_habitaciones").select("*");
    if (!error) setTiposHabitacion(data);
  };

  const fetchHabitaciones = async () => {
    const { data, error } = await supabase
      .from("habitaciones")
      .select("*, tipos_habitaciones(tipo)");
    if (!error) setHabitaciones(data);
  };

  const handleTipoChange = (e) => {
    const { name, value } = e.target;
    setFormTipo((prev) => ({ ...prev, [name]: value }));
  };

  const handleHabitacionChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "tipo" ? parseInt(value) : value
    }));
  };

  const registrarTipoHabitacion = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from("tipos_habitaciones").insert([formTipo]);
    if (!error) {
      alert("Tipo de habitación registrado");
      setFormTipo({ tipo: "", descripcion: "", numero_persona: "", precio_noche: "" });
      fetchTiposHabitacion();
      setTipoModalOpen(false);
    }
  };

  const openModal = (habitacion = null) => {
    if (habitacion) {
      setIsEditing(true);
      setEditingHabitacion(habitacion);
      setFormData({
        numero_habitacion: habitacion.numero_habitacion,
        estado: habitacion.estado,
        tipo: habitacion.tipo
      });
    } else {
      setIsEditing(false);
      setEditingHabitacion(null);
      setFormData({ numero_habitacion: "", estado: "Disponible", tipo: "" });
    }
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);
  const closeTipoModal = () => setTipoModalOpen(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isEditing && editingHabitacion) {
      const { error } = await supabase
        .from("habitaciones")
        .update(formData)
        .eq("id", editingHabitacion.id);
      if (!error) alert("Habitación actualizada correctamente");
    } else {
      const { error } = await supabase.from("habitaciones").insert([formData]);
      if (!error) alert("Habitación registrada correctamente");
    }
    fetchHabitaciones();
    closeModal();
  };

  // Nueva función para eliminar habitación
  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar esta habitación?")) {
      const { error } = await supabase
        .from("habitaciones")
        .delete()
        .eq("id", id);
      if (!error) {
        alert("Habitación eliminada correctamente");
        fetchHabitaciones();
      } else {
        alert("Error al eliminar la habitación.");
      }
    }
  };

  return (
    <div className="container">
      <h1 className="title">Gestión de Habitaciones</h1>

      <div style={{ display: "flex", gap: "20px", justifyContent: "center", flexWrap: "wrap" }}>
        <button className="add-btn" onClick={() => setTipoModalOpen(true)}>Registrar Tipo de Habitación</button>
        <button className="add-btn" onClick={() => openModal()}>Registrar Habitación</button>
      </div>

      <section className="habitaciones-section">
        <h2>Lista de Habitaciones</h2>
        <div className="scroll-container">
          <table className="client-table">
            <thead>
              <tr>
                <th>Número</th>
                <th>Estado</th>
                <th>Tipo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {habitaciones.map((hab) => (
                <tr key={hab.id}>
                  <td>{hab.numero_habitacion}</td>
                  <td>{hab.estado}</td>
                  <td>{hab.tipos_habitaciones?.tipo}</td>
                  <td>
                    <button className="edit-btn" onClick={() => openModal(hab)}>Editar</button>
                    <button className="delete-btn" onClick={() => handleDelete(hab.id)}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modal Habitación */}
      {modalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>{isEditing ? "Editar Habitación" : "Registrar Habitación"}</h2>
            <form onSubmit={handleSubmit}>
              <input type="text" name="numero_habitacion" placeholder="Número de habitación" value={formData.numero_habitacion} onChange={handleHabitacionChange} required />
              <select name="estado" value={formData.estado} onChange={handleHabitacionChange} required>
                <option value="Disponible">Disponible</option>
                <option value="Ocupada">Ocupada</option>
                <option value="Mantenimiento">Mantenimiento</option>
              </select>
              <select name="tipo" value={formData.tipo} onChange={handleHabitacionChange} required>
                <option value="">Seleccionar tipo</option>
                {tiposHabitacion.map((tipo) => (
                  <option key={tipo.id} value={tipo.id}>{tipo.tipo}</option>
                ))}
              </select>
              <button type="submit">Guardar</button>
              <button type="button" onClick={closeModal}>Cancelar</button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tipo de Habitación */}
      {tipoModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>Registrar Tipo de Habitación</h2>
            <form onSubmit={registrarTipoHabitacion}>
              <input type="text" name="tipo" placeholder="Tipo" value={formTipo.tipo} onChange={handleTipoChange} required />
              <input type="text" name="descripcion" placeholder="Descripción" value={formTipo.descripcion} onChange={handleTipoChange} />
              <input type="number" name="numero_persona" placeholder="Número de personas" value={formTipo.numero_persona} onChange={handleTipoChange} required />
              <input type="number" name="precio_noche" placeholder="Precio por noche" step="0.01" value={formTipo.precio_noche} onChange={handleTipoChange} required />
              <button type="submit">Guardar</button>
              <button type="button" onClick={closeTipoModal}>Cancelar</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionHabitaciones;
