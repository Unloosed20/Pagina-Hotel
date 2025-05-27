import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import './Ticket.css';
import NavBar from './NavBar';

const TicketServicio = () => {
  const navigate = useNavigate();
  const { reservas } = useLocation().state || {};
  const [detalles, setDetalles] = useState([]);
  const [cliente, setCliente] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!reservas || reservas.length === 0) {
      navigate('/servicios-cliente');
      return;
    }
    // Obtener datos de cliente con reserva asociada
    const userRaw = localStorage.getItem('user');
    if (userRaw) {
      const user = JSON.parse(userRaw);
      supabase.from('clientes')
        .select('nombre, apellido_paterno')
        .eq('usuario_id', user.id)
        .single()
        .then(({ data, error }) => {
          if (!error) setCliente(data);
        });
    }
    // Cargar detalles de servicio y reserva
    Promise.all(
      reservas.map(r =>
        supabase
          .from('reservas_servicios')
          .select(`
            id,
            fecha_servicio,
            servicio:servicios(nombre, precio)
          `)
          .eq('id', r.id)
          .single()
          .then(({ data }) => data)
      )
    )
      .then(results => {
        setDetalles(results);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error cargando detalles:', err);
        setLoading(false);
      });
  }, [navigate, reservas]);

  if (loading) return <div className="ticket-container"><p>Cargando ticket...</p></div>;

  // Fecha de emisión
  const fechaEmision = new Date();
  // Calcular total
  const total = detalles.reduce((sum, d) => sum + (d.servicio?.precio || 0), 0);

  return (
    <div className="ticket-container">
      <NavBar />
      <h2>Hotel “Punta Arena”</h2>
      <h3>Ticket de Servicios</h3>

      <div className="ticket-section">
        <strong>Emitido:</strong> {fechaEmision.toLocaleString()}
      </div>

      {cliente && (
        <div className="ticket-section">
          <strong>Cliente:</strong> {cliente.nombre} {cliente.apellido_paterno}
        </div>
      )}

      <div className="ticket-section">
        <strong>Detalles:</strong>
        <ul>
          {detalles.map(d => (
            <li key={d.id}>
              {d.servicio.nombre} — {new Date(d.fecha_servicio).toLocaleString()} — ${d.servicio.precio.toFixed(2)}
            </li>
          ))}
        </ul>
      </div>

      <div className="ticket-section">
        <strong>Total:</strong> ${total.toFixed(2)}
      </div>

      <button onClick={() => window.print()} className="btn-print">
        Imprimir Ticket
      </button>
    </div>
  );
};

export default TicketServicio;
