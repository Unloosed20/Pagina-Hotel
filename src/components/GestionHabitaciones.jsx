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
    tipo: "",
    imagen_file: null,      // Archivo seleccionado
    imagen_url: ""          // URL en Supabase
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
      .select("*, tipos_habitaciones(tipo), imagen_url");
    if (!error) setHabitaciones(data);
  };

  const handleTipoChange = (e) => {
    const { name, value } = e.target;
    setFormTipo((prev) => ({ ...prev, [name]: value }));
  };

  const handleHabitacionChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "imagen_file") {
      setFormData((prev) => ({ ...prev, imagen_file: files[0] }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: name === "tipo" ? parseInt(value) : value
      }));
    }
  };

  const registrarTipoHabitacion = async (e) => {
    e.preventDefault();
    await supabase.from("tipos_habitaciones").insert([formTipo]);
    setFormTipo({ tipo: "", descripcion: "", numero_persona: "", precio_noche: "" });
    fetchTiposHabitacion();
    setTipoModalOpen(false);
  };

  const openModal = (hab = null) => {
    if (hab) {
      setIsEditing(true);
      setEditingHabitacion(hab);
      setFormData({
        numero_habitacion: hab.numero_habitacion,
        estado: hab.estado,
        tipo: hab.tipo,
        imagen_file: null,
        imagen_url: hab.imagen_url || ""
      });
    } else {
      setIsEditing(false);
      setEditingHabitacion(null);
      setFormData({ numero_habitacion: "", estado: "Disponible", tipo: "", imagen_file: null, imagen_url: "" });
    }
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);
  const closeTipoModal = () => setTipoModalOpen(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    let url = formData.imagen_url;

    // Si cargó un archivo nuevo, súbelo primero
    if (formData.imagen_file) {
      const fileExt = formData.imagen_file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase
        .storage
        .from("habitaciones")
        .upload(fileName, formData.imagen_file, { upsert: true });

      if (uploadError) {
        return alert("Error subiendo imagen: " + uploadError.message);
      }

      const { publicURL } = supabase
        .storage
        .from("habitaciones")
        .getPublicUrl(fileName);

      url = publicURL;
    }

    const payload = {
      numero_habitacion: formData.numero_habitacion,
      estado: formData.estado,
      tipo: formData.tipo,
      imagen_url: url
    };

    if (isEditing && editingHabitacion) {
      await supabase.from("habitaciones").update(payload).eq("id", editingHabitacion.id);
      alert("Habitación actualizada correctamente");
    } else {
      await supabase.from("habitaciones").insert([payload]);
      alert("Habitación registrada correctamente");
    }

    fetchHabitaciones();
    closeModal();
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Eliminar esta habitación?")) {
      await supabase.from("habitaciones").delete().eq("id", id);
      fetchHabitaciones();
    }
  };

  return (
    <div className="container">
      <h1 className="title">Gestión de Habitaciones</h1>

      <div className="actions">
        <button className="add-btn" onClick={() => setTipoModalOpen(true)}>Registrar Tipo</button>
        <button className="add-btn" onClick={() => openModal()}>Registrar Habitación</button>
      </div>

      <section className="habitaciones-section">
        <h2>Lista de Habitaciones</h2>
        <div className="scroll-container">
          <table className="client-table">
            <thead>
              <tr>
                <th>Número</th>
                <th>Tipo</th>
                <th>Estado</th>
                <th>Imagen</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {habitaciones.map((hab) => (
                <tr key={hab.id}>
                  <td>{hab.numero_habitacion}</td>
                  <td>{hab.tipos_habitaciones.tipo}</td>
                  <td>{hab.estado}</td>
                  <td>
                    {hab.imagen_url && (
                      <img src={hab.imagen_url} alt="" className="thumb" />
                    )}
                  </td>
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

      {modalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>{isEditing ? "Editar Habitación" : "Registrar Habitación"}</h2>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                name="numero_habitacion"
                placeholder="Número de habitación"
                value={formData.numero_habitacion}
                onChange={handleHabitacionChange}
                required
              />
              <select name="estado" value={formData.estado} onChange={handleHabitacionChange} required>
                <option value="Disponible">Disponible</option>
                <option value="Ocupada">Ocupada</option>
                <option value="Mantenimiento">Mantenimiento</option>
              </select>
              <select name="tipo" value={formData.tipo} onChange={handleHabitacionChange} required>
                <option value="">Seleccionar tipo</option>
                {tiposHabitacion.map((t) => (
                  <option key={t.id} value={t.id}>{t.tipo}</option>
                ))}
              </select>
              <label>Imagen:</label>
              <input type="file" name="imagen_file" accept="image/*" onChange={handleHabitacionChange} />
              <button type="submit">Guardar</button>
              <button type="button" onClick={closeModal}>Cancelar</button>
            </form>
          </div>
        </div>
      )}

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
