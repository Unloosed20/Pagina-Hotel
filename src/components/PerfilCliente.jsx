import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import './PerfilCliente.css';

const PerfilCliente = () => {
  const [cliente, setCliente] = useState(null);
  const [reservas, setReservas] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({ nombre: '', email: '' });
  const [membresiaReqStatus, setMembresiaReqStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRaw = localStorage.getItem('user');
        if (!userRaw) throw new Error('Usuario no autenticado');
        const user = JSON.parse(userRaw);

        // Cliente
        const { data: cli, error: cliError } = await supabase
          .from('clientes')
          .select('id, nombre, email, membresia_id, membresias(nombre)')
          .eq('usuario_id', user.id)
          .single();
        if (cliError) throw cliError;
        setCliente(cli);
        setFormData({ nombre: cli.nombre, email: cli.email });

        // Reservas
        const { data: res, error: resError } = await supabase
          .from('reservas')
          .select('id, fecha_inicio, fecha_fin')
          .eq('cliente_id', cli.id);
        if (resError) throw resError;
        setReservas(res || []);

        // Última solicitud de membresía
        const { data: req, error: reqError } = await supabase
          .from('solicitudes_membresias')
          .select('estado')
          .eq('cliente_id', cli.id)
          .order('fecha_solicitud', { ascending: false })
          .limit(1)
          .single();
        if (reqError && reqError.code !== 'PGRST116') throw reqError;
        setMembresiaReqStatus(req?.estado || null);
      } catch (err) {
        console.error('Error cargando datos:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <p>Cargando perfil...</p>;
  if (error) return <p className="error">{error}</p>;

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);
  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSave = async () => {
    try {
      const { error: updateError } = await supabase
        .from('clientes')
        .update({ nombre: formData.nombre, email: formData.email })
        .eq('id', cliente.id);
      if (updateError) throw updateError;
      setCliente(prev => ({ ...prev, ...formData }));
      closeModal();
    } catch (err) {
      console.error('Error actualizando perfil:', err);
      alert('No se pudo actualizar el perfil');
    }
  };

  const solicitarMembresia = async () => {
    try {
      const { error: solError } = await supabase
        .from('solicitudes_membresias')
        .insert([{ cliente_id: cliente.id, membresia_id: cliente.membresia_id }]);
      if (solError) throw solError;
      setMembresiaReqStatus('Pendiente');
    } catch (err) {
      console.error('Error solicitando membresía:', err);
      alert('No se pudo solicitar la membresía');
    }
  };

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
        <p>{cliente.membresias?.nombre || 'Sin nivel'}</p>
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
