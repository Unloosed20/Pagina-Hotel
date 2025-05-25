import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import './PerfilCliente.css';

const PerfilCliente = () => {
  const [cliente, setCliente] = useState(null);
  const [reservas, setReservas] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({ nombre: '', email: '' });
  const [membresiaReqStatus, setMembresiaReqStatus] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const userRaw = localStorage.getItem('user');
      if (!userRaw) return;
      const user = JSON.parse(userRaw);
      // Traer datos de cliente
      const { data: cli } = await supabase
        .from('clientes')
        .select('id, nombre, email, membresia_id, membresia: membresias(nombre)')
        .eq('usuario_id', user.id)
        .single();
      setCliente(cli);
      setFormData({ nombre: cli.nombre, email: cli.email });
      // Traer reservas
      const { data: res } = await supabase
        .from('reservas')
        .select('id, fecha_inicio, fecha_fin')
        .eq('cliente_id', cli.id);
      setReservas(res);
      // Traer última solicitud de membresía
      const { data: req } = await supabase
        .from('solicitudes_membresias')
        .select('estado')
        .eq('cliente_id', cli.id)
        .order('fecha_solicitud', { ascending: false })
        .limit(1)
        .single();
      setMembresiaReqStatus(req?.estado || null);
    };
    fetchData();
  }, []);

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    await supabase
      .from('clientes')
      .update({ nombre: formData.nombre, email: formData.email })
      .eq('id', cliente.id);
    setCliente(prev => ({ ...prev, ...formData }));
    closeModal();
  };

  const solicitarMembresia = async () => {
    await supabase.from('solicitudes_membresias').insert([{ cliente_id: cliente.id, membresia_id: cliente.membresia_id }]);
    setMembresiaReqStatus('Pendiente');
  };

  if (!cliente) return <p>Cargando perfil...</p>;

  return (
    <div className="pc-container">
      <div className="pc-header">
        <h1>Perfil del Cliente</h1>
      </div>
      <div className="pc-info">
        <p><strong>Nombre:</strong> {cliente.nombre}</p>
        <p><strong>Email:</strong> {cliente.email}</p>
      </div>
      <div className="pc-membership">
        <h2>Nivel de Membresía</h2>
        <p>{cliente.membresia.nombre}</p>
        <button onClick={solicitarMembresia} disabled={membresiaReqStatus === 'Pendiente'}>
          {membresiaReqStatus === 'Pendiente' ? 'Solicitud Pendiente' : 'Solicitar Actualización'}
        </button>
      </div>
      <div className="pc-reservations">
        <h2>Reservas</h2>
        <ul>
          {reservas.map(r => (
            <li key={r.id}>
              Reserva #{r.id}: {new Date(r.fecha_inicio).toLocaleDateString()} - {new Date(r.fecha_fin).toLocaleDateString()}
            </li>
          ))}
        </ul>
      </div>
      <div className="pc-actions">
        <button onClick={openModal}>Editar Perfil</button>
        <button onClick={() => { localStorage.removeItem('user'); window.location.reload(); }}>Cerrar Sesión</button>
      </div>

      {modalOpen && (
        <div className="pc-modal">
          <div className="pc-modal-content">
            <h2>Editar Perfil</h2>
            <label>Nombre</label>
            <input name="nombre" value={formData.nombre} onChange={handleChange} />
            <label>Email</label>
            <input name="email" value={formData.email} onChange={handleChange} />
            <div className="pc-modal-actions">
              <button onClick={handleSave}>Guardar</button>
              <button onClick={closeModal}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerfilCliente;
