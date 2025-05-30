import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import "./GestionMembresias.css";

const GestionMembresias = () => {
  const [membresias, setMembresias] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ nombre: "", nivel: "", descuento_porcentaje: "", descripcion: "" });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [memRes, solRes] = await Promise.all([
        supabase.from("membresias").select("*"),
        supabase.from("solicitudes_membresias").select(
          `id, fecha_solicitud, estado, observaciones, cliente:clientes(nombre, apellido_paterno), membresia:membresias(nombre)`
        )
      ]);
      if (memRes.error) throw memRes.error;
      if (solRes.error) throw solRes.error;
      setMembresias(memRes.data || []);
      setSolicitudes(solRes.data || []);
    } catch (err) {
      console.error("Error cargando datos:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async id => {
    if (!window.confirm("¿Confirmar aprobación de la solicitud?")) return;
    try {
      setLoading(true);
      const { error: resError } = await supabase
        .from("solicitudes_membresias")
        .update({ estado: "Aceptada" })
        .eq("id", id);
      if (resError) throw resError;
      cargarDatos();
    } catch (err) {
      console.error(err);
      setError(err.message);
      setLoading(false);
    }
  };

  const handleReject = async id => {
    if (!window.confirm("¿Confirmar rechazo de la solicitud?")) return;
    try {
      setLoading(true);
      const { error: resError } = await supabase
        .from("solicitudes_membresias")
        .update({ estado: "Rechazada" })
        .eq("id", id);
      if (resError) throw resError;
      cargarDatos();
    } catch (err) {
      console.error(err);
      setError(err.message);
      setLoading(false);
    }
  };

  const openModal = (m = null) => {
    setError(null);
    if (m) {
      setIsEditing(true);
      setEditing(m);
      setForm({
        nombre: m.nombre,
        nivel: m.nivel.toString(),
        descuento_porcentaje: m.descuento_porcentaje.toString(),
        descripcion: m.descripcion || ""
      });
    } else {
      setIsEditing(false);
      setEditing(null);
      setForm({ nombre: "", nivel: "", descuento_porcentaje: "", descripcion: "" });
    }
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);
  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = {
        nombre: form.nombre,
        nivel: parseInt(form.nivel, 10),
        descuento_porcentaje: parseFloat(form.descuento_porcentaje),
        descripcion: form.descripcion
      };
      let res;
      if (isEditing && editing) {
        res = await supabase.from("membresias").update(payload).eq("id", editing.id);
      } else {
        res = await supabase.from("membresias").insert([payload]);
      }
      if (res.error) throw res.error;
      alert(isEditing ? "Membresía actualizada" : "Membresía registrada");
      cargarDatos();
      closeModal();
    } catch (err) {
      console.error(err);
      setError(err.message);
      setLoading(false);
    }
  };

  const handleDelete = async id => {
    if (!window.confirm("¿Eliminar esta membresía?")) return;
    try {
      setLoading(true);
      const { error: delError } = await supabase.from("membresias").delete().eq("id", id);
      if (delError) throw delError;
      setMembresias(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Cargando membresías...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="container">
      <h1 className="title">Gestión de Membresías</h1>
      <button className="add-btn" onClick={() => openModal()}>Nueva Membresía</button>

      <section className="list-section">
        <h2>Membresías Disponibles</h2>
        <div className="scroll-container">
          <table className="client-table">
            <thead>
              <tr><th>Nombre</th><th>Nivel</th><th>Descuento %</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {membresias.map(m => (
                <tr key={m.id}>
                  <td>{m.nombre}</td>
                  <td>{m.nivel}</td>
                  <td>{(m.descuento_porcentaje ?? 0).toFixed(2)}</td>
                  <td>
                    <button onClick={() => openModal(m)}>Editar</button>
                    <button onClick={() => handleDelete(m.id)}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="requests-section">
        <h2>Solicitudes de Membresía</h2>
        <div className="scroll-container">
          <table className="client-table">
            <thead>
              <tr><th>ID</th><th>Cliente</th><th>Membresía</th><th>Fecha</th><th>Estado</th><th>Obs.</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {solicitudes.map(s => {
                const clienteNombre = s.cliente ? `${s.cliente.nombre} ${s.cliente.apellido_paterno}` : "-";
                const membresiaNombre = s.membresia?.nombre || "-";
                return (
                  <tr key={s.id}>
                    <td>{s.id}</td>
                    <td>{clienteNombre}</td>
                    <td>{membresiaNombre}</td>
                    <td>{new Date(s.fecha_solicitud).toLocaleString()}</td>
                    <td>{s.estado}</td>
                    <td>{s.observaciones || "-"}</td>
                    <td>
                      {s.estado === 'Pendiente' && (
                        <>
                          <button onClick={() => handleApprove(s.id)}>Aceptar</button>
                          <button onClick={() => handleReject(s.id)}>Rechazar</button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {modalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>{isEditing ? "Editar Membresía" : "Registrar Membresía"}</h2>
            <form onSubmit={handleSubmit}>
              <input name="nombre" placeholder="Nombre" value={form.nombre} onChange={handleChange} required />
              <input name="nivel" type="number" placeholder="Nivel" value={form.nivel} onChange={handleChange} required />
              <input name="descuento_porcentaje" type="number" step="0.01" placeholder="% Descuento" value={form.descuento_porcentaje} onChange={handleChange} required />
              <textarea name="descripcion" placeholder="Descripción" value={form.descripcion} onChange={handleChange} />
              <button type="submit">Guardar</button>
              <button type="button" onClick={closeModal}>Cancelar</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionMembresias;
