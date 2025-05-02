import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { supabase } from "../supabaseClient";
import "./GestionReservas.css";

const GestionReservas = () => {
  const [reservas, setReservas] = useState([]);
  const [habitaciones, setHabitaciones] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [filterDate, setFilterDate] = useState(new Date());
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    cliente_id: "",
    habitacion_id: "",
    fecha_inicio: new Date(),
    fecha_fin: new Date(),
    estado: "Confirmada"
  });

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    // Refresca la vista cuando cambie la fecha de filtro
    fetchReservas();
  }, [filterDate]);

  const fetchAll = async () => {
    await Promise.all([fetchHabitaciones(), fetchClientes(), fetchReservas()]);
  };

  const fetchHabitaciones = async () => {
    const { data } = await supabase.from("habitaciones").select("id, numero_habitacion, estado");
    setHabitaciones(data || []);
  };

  const fetchClientes = async () => {
    const { data } = await supabase.from("clientes").select("id, nombre, apellido_paterno");
    setClientes(data || []);
  };

  const fetchReservas = async () => {
    // Trae todas y luego filtra por UI
    const { data } = await supabase
      .from("reservas")
      .select("*, habitaciones:reservas_habitaciones(habitacion_id), cliente:clientes(nombre, apellido_paterno)");
    if (data) {
      // Filtra las reservas que incluyen filterDate en el rango
      const f = filterDate.setHours(0,0,0,0);
      const filtradas = data.filter(r => {
        const inicio = new Date(r.fecha_inicio).setHours(0,0,0,0);
        const fin    = new Date(r.fecha_fin).setHours(0,0,0,0);
        return inicio <= f && f <= fin;
      });
      setReservas(filtradas);
    }
  };

  const openModal = (res = null) => {
    if (res) {
      setIsEditing(true);
      setEditing(res);
      setForm({
        cliente_id: res.cliente.id,
        habitacion_id: res.habitaciones[0].habitacion_id,
        fecha_inicio: new Date(res.fecha_inicio),
        fecha_fin:    new Date(res.fecha_fin),
        estado:       res.estado
      });
    } else {
      setIsEditing(false);
      setEditing(null);
      setForm({
        cliente_id: "",
        habitacion_id: "",
        fecha_inicio: new Date(),
        fecha_fin:    new Date(),
        estado:       "Confirmada"
      });
    }
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleDateChange = (name, date) => {
    setForm(f => ({ ...f, [name]: date }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      cliente_id:    parseInt(form.cliente_id),
      fecha_inicio:  form.fecha_inicio,
      fecha_fin:     form.fecha_fin,
      estado:        form.estado
    };
    if (isEditing && editing) {
      // Update reserva
      await supabase
        .from("reservas")
        .update(payload)
        .eq("id", editing.id);
      // Update habitación asignada
      await supabase
        .from("reservas_habitaciones")
        .update({ habitacion_id: form.habitacion_id })
        .eq("reserva_id", editing.id);
    } else {
      // Insert reserva
      const { data: res } = await supabase
        .from("reservas")
        .insert([payload])
        .select()
        .single();
      // Insert relación habitación
      await supabase
        .from("reservas_habitaciones")
        .insert([{ reserva_id: res.id, habitacion_id: form.habitacion_id }]);
    }
    await fetchReservas();
    closeModal();
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Cancelar esta reserva?")) {
      // Eliminación física; podrías cambiar estado en vez de borrar
      await supabase.from("reservas_habitaciones").delete().eq("reserva_id", id);
      await supabase.from("reservas").delete().eq("id", id);
      fetchReservas();
    }
  };

  return (
    <div className="container">
      <h1 className="title">Gestión de Reservas</h1>

      <div className="filter">
        <label>Filtrar por Fecha:</label>
        <DatePicker
          selected={filterDate}
          onChange={(date) => setFilterDate(date)}
          className="input"
        />
        <button className="add-btn" onClick={() => openModal()}>Nueva Reserva</button>
      </div>

      <div className="scroll-container">
        <table className="client-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Cliente</th>
              <th>Hab.</th>
              <th>Inicio</th>
              <th>Fin</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {reservas.map(r => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td>{`${r.cliente.nombre} ${r.cliente.apellido_paterno}`}</td>
                <td>{habitaciones.find(h => h.id === r.habitaciones[0].habitacion_id)?.numero_habitacion}</td>
                <td>{new Date(r.fecha_inicio).toLocaleDateString()}</td>
                <td>{new Date(r.fecha_fin).toLocaleDateString()}</td>
                <td>{r.estado}</td>
                <td>
                  <button className="edit-btn" onClick={() => openModal(r)}>Editar</button>
                  <button className="delete-btn" onClick={() => handleDelete(r.id)}>Cancelar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>{isEditing ? "Editar Reserva" : "Nueva Reserva"}</h2>
            <form onSubmit={handleSubmit}>
              <select name="cliente_id" value={form.cliente_id} onChange={handleChange} required>
                <option value="">Selecciona Cliente</option>
                {clientes.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.nombre} {c.apellido_paterno}
                  </option>
                ))}
              </select>
              <select name="habitacion_id" value={form.habitacion_id} onChange={handleChange} required>
                <option value="">Selecciona Habitación</option>
                {habitaciones.map(h => (
                  <option key={h.id} value={h.id}>
                    {h.numero_habitacion} ({h.estado})
                  </option>
                ))}
              </select>
              <label>Fecha Inicio:</label>
              <DatePicker
                selected={form.fecha_inicio}
                onChange={(d) => handleDateChange("fecha_inicio", d)}
                className="input"
                required
              />
              <label>Fecha Fin:</label>
              <DatePicker
                selected={form.fecha_fin}
                onChange={(d) => handleDateChange("fecha_fin", d)}
                className="input"
                required
              />
              <select name="estado" value={form.estado} onChange={handleChange} required>
                <option value="Confirmada">Confirmada</option>
                <option value="Cancelada">Cancelada</option>
                <option value="Completada">Completada</option>
              </select>
              <button type="submit">Guardar</button>
              <button type="button" onClick={closeModal}>Cerrar</button>
            </form>
          </div>
        </div>
      )}
    </div>
);

};

export default GestionReservas;