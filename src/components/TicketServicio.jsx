// TicketServicio.jsx
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import './TicketServicio.css';

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
    // Obtener datos de cliente
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
    // Cargar información de servicios
    Promise.all(
      reservas.map(r =>
        supabase
          .from('servicios')
          .select('nombre, precio')
          .eq('id', r.servicio_id)
          .single()
          .then(({ data }) => ({ ...r, servicio: data }))
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

  if (loading) return <div className="ts-container">Cargando ticket...</div>;

  // Calcular total
  const total = detalles.reduce((sum, d) => sum + (d.servicio?.precio || 0), 0);

  return (
    <div className="ts-container">
      <h2 className="ts-header">Ticket de Servicios</h2>

      {cliente && (
        <div className="ts-client">
          <strong>Cliente:</strong> {cliente.nombre} {cliente.apellido_paterno}
        </div>
      )}

      <ul className="ts-list">
        {detalles.map(d => (
          <li key={d.id} className="ts-item">
            <span>{d.servicio?.nombre}</span>
            <span>${(d.servicio?.precio || 0).toFixed(2)}</span>
          </li>
        ))}
      </ul>

      <div className="ts-total">
        <strong>Total: ${total.toFixed(2)}</strong>
      </div>

      <button className="ts-print" onClick={() => window.print()}>
        Imprimir Ticket
      </button>
    </div>
  );
};

export default TicketServicio;
