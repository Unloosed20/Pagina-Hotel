import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import "./GestionServicios.css";

const GestionServicios = () => {
  const [servicios, setServicios] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingServicio, setEditingServicio] = useState(null);

  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    disponible: true,
    imagen_file: null,
    imagen_url: ""
  });

  useEffect(() => {
    fetchServicios();
    fetchSolicitudes();
  }, []);

  const fetchServicios = async () => {
    const { data, error } = await supabase
      .from("servicios")
      .select("*, imagen_url");
    if (!error) setServicios(data);
  };

  const fetchSolicitudes = async () => {
    const { data, error } = await supabase
      .from("reservas_servicios")
      .select("*, servicio:servicios(nombre), reserva_id, fecha_reserva, fecha_servicio, estado");
    if (!error) setSolicitudes(data);
  };

  const openModal = (serv = null) => {
    if (serv) {
      setIsEditing(true);
      setEditingServicio(serv);
      setFormData({
        nombre: serv.nombre,
        descripcion: serv.descripcion,
        precio: serv.precio,
        disponible: serv.disponible,
        imagen_file: null,
        imagen_url: serv.imagen_url || ""
      });
    } else {
      setIsEditing(false);
      setEditingServicio(null);
      setFormData({
        nombre: "",
        descripcion: "",
        precio: "",
        disponible: true,
        imagen_file: null,
        imagen_url: ""
      });
    }
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (name === "imagen_file") {
      setFormData(prev => ({ ...prev, imagen_file: files[0] }));
    } else if (type === "checkbox") {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let url = formData.imagen_url;

    // Si sube una nueva imagen
    if (formData.imagen_file) {
      const ext = formData.imagen_file.name.split('.').pop();
      const fileName = `${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase
        .storage
        .from("servicios")
        .upload(fileName, formData.imagen_file, { upsert: true });

      if (uploadError) {
        return alert("Error subiendo imagen: " + uploadError.message);
      }

      const { publicURL } = supabase
        .storage
        .from("servicios")
        .getPublicUrl(fileName);

      url = publicURL;
    }

    const payload = {
      nombre: formData.nombre,
      descripcion: formData.descripcion,
      precio: parseFloat(formData.precio),
      disponible: formData.disponible,
      imagen_url: url
    };

    if (isEditing && editingServicio) {
      await supabase.from("servicios").update(payload).eq("id", editingServicio.id);
      alert("Servicio actualizado");
    } else {
      await supabase.from("servicios").insert([payload]);
      alert("Servicio registrado");
    }

    fetchServicios();
    closeModal();
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Eliminar este servicio?")) {
      await supabase.from("servicios").delete().eq("id", id);
      alert("Servicio eliminado");
      fetchServicios();
    }
  };

  return (
    <div className="container">
      <h1 className="title">Gestión de Servicios</h1>

      <button className="add-btn" onClick={() => openModal()}>
        Nuevo Servicio
      </button>

      <section className="list-section">
        <h2>Servicios Disponibles</h2>
        <div className="scroll-container">
          <table className="client-table">
            <thead>
              <tr>
                <th>Imagen</th>
                <th>Nombre</th>
                <th>Precio</th>
                <th>Disponible</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {servicios.map(s => (
                <tr key={s.id}>
                  <td>
                    {s.imagen_url && (
                      <img src={s.imagen_url} alt={s.nombre} className="thumb" />
                    )}
                  </td>
                  <td>{s.nombre}</td>
                  <td>{s.precio.toFixed(2)}</td>
                  <td>{s.disponible ? "Sí" : "No"}</td>
                  <td>
                    <button className="edit-btn" onClick={() => openModal(s)}>Editar</button>
                    <button className="delete-btn" onClick={() => handleDelete(s.id)}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="requests-section">
        <h2>Servicios Solicitados</h2>
        <div className="scroll-container">
          <table className="client-table">
            <thead>
              <tr>
                <th>ID Solicitud</th>
                <th>Reserva</th>
                <th>Servicio</th>
                <th>Fecha Solicitud</th>
                <th>Fecha Servicio</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {solicitudes.map(r => (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td>{r.reserva_id}</td>
                  <td>{r.servicio.nombre}</td>
                  <td>{new Date(r.fecha_reserva).toLocaleString()}</td>
                  <td>{new Date(r.fecha_servicio).toLocaleString()}</td>
                  <td>{r.estado}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {modalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>{isEditing ? "Editar Servicio" : "Registrar Servicio"}</h2>
            <form onSubmit={handleSubmit}>
              <input
                name="nombre"
                placeholder="Nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
              />
              <textarea
                name="descripcion"
                placeholder="Descripción"
                value={formData.descripcion}
                onChange={handleChange}
              />
              <input
                name="precio"
                type="number"
                step="0.01"
                placeholder="Precio"
                value={formData.precio}
                onChange={handleChange}
                required
              />
              <label className="checkbox-label">
                <input
                  name="disponible"
                  type="checkbox"
                  checked={formData.disponible}
                  onChange={handleChange}
                /> Disponible
              </label>
              <label>Imagen del Servicio:</label>
              <input
                type="file"
                name="imagen_file"
                accept="image/*"
                onChange={handleChange}
              />
              <button type="submit">Guardar</button>
              <button type="button" onClick={closeModal}>Cancelar</button>
            </form>
          </div>
        </div>
      )}
    </div>
);

};

export default GestionServicios;
