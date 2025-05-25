// OrdenServicio.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import './OrdenServicio.css';

const OrdenServicio = () => {
  const [cart, setCart] = useState([]);
  const [fecha, setFecha] = useState('');
  const [clienteId, setClienteId] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Cargar carrito de servicios
    const saved = JSON.parse(localStorage.getItem('serviciosCart') || '[]');
    setCart(saved);
    // Obtener cliente
    const userRaw = localStorage.getItem('user');
    if (!userRaw) {
      navigate('/login');
      return;
    }
    const user = JSON.parse(userRaw);
    supabase
      .from('clientes')
      .select('id')
      .eq('usuario_id', user.id)
      .single()
      .then(({ data, error }) => {
        if (error || !data) setError('Cliente no encontrado');
        else setClienteId(data.id);
      });
  }, [navigate]);

  const handleConfirmar = async () => {
    if (!fecha) {
      setError('Selecciona fecha y hora');
      return;
    }
    if (cart.length === 0) {
      setError('No hay servicios en el carrito');
      return;
    }
    setError(null);
    try {
      // Insertar reservas_servicios
      const inserts = cart.map(item => ({
        reserva_id: null,
        servicio_id: item.id,
        fecha_servicio: fecha,
        estado: 'Confirmada'
      }));
      const { data, error: insertErr } = await supabase
        .from('reservas_servicios')
        .insert(inserts)
        .select();
      if (insertErr) throw insertErr;
      // Limpiar carrito y navegar a pagos
      localStorage.removeItem('serviciosCart');
      navigate('/pagos-servicio', { state: { reservas: data } });
    } catch (e) {
      console.error(e);
      setError('Error al confirmar reserva');
    }
  };

  return (
    <div className="os-container">
      <h1 className="os-title">Confirmar Reserva de Servicios</h1>
      {error && <p className="os-error">{error}</p>}
      <label htmlFor="fecha">Fecha y Hora:</label>
      <input
        type="datetime-local"
        id="fecha"
        value={fecha}
        onChange={e => setFecha(e.target.value)}
      />

      <div className="os-list">
        {cart.map((item, idx) => (
          <div key={idx} className="os-item">
            <span className="os-name">{item.nombre}</span>
            <span className="os-cant">x{item.cantidad}</span>
          </div>
        ))}
      </div>

      <button className="os-btn" onClick={handleConfirmar}>
        Reservar Servicios
      </button>
    </div>
  );
};

export default OrdenServicio;