// OrdenServicio.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import './OrdenServicio.css';
import NavBar from './NavBar';

const OrdenServicio = () => {
  const [cart, setCart] = useState([]);
  const [servicioFechas, setServicioFechas] = useState({});
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('serviciosCart') || '[]');
    setCart(saved);
  }, []);

  const handleFechaChange = (id, value) => {
    setServicioFechas(prev => ({ ...prev, [id]: value }));
  };

  const handleCancelar = (id) => {
    const updated = cart.filter(item => item.id !== id);
    setCart(updated);
    localStorage.setItem('serviciosCart', JSON.stringify(updated));
  };

  const handleConfirmar = async () => {
    if (cart.length === 0) {
      setError('No hay servicios para reservar');
      return;
    }
    // Validar cada fecha
    for (let item of cart) {
      if (!servicioFechas[item.id]) {
        setError(`Selecciona fecha para ${item.nombre}`);
        return;
      }
    }
    setError(null);
    try {
      const inserts = cart.map(item => ({
        reserva_id: null,
        servicio_id: item.id,
        fecha_servicio: servicioFechas[item.id],
        estado: 'Confirmada'
      }));
      const { data, error: insertErr } = await supabase
        .from('reservas_servicios')
        .insert(inserts)
        .select();
      if (insertErr) throw insertErr;
      localStorage.removeItem('serviciosCart');
      navigate('/pagos-servicio', { state: { reservas: data } });
    } catch (e) {
      console.error(e);
      setError('Error al confirmar reserva');
    }
  };

  // Calcular total
  const total = cart.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);

  return (
    <div className="os-container">
      <NavBar />
      <h1 className="os-title">Confirmar Reserva de Servicios</h1>
      {error && <p className="os-error">{error}</p>}

      <div className="os-list">
        {cart.map(item => (
          <div key={item.id} className="os-item">
            <div className="os-info">
              <span className="os-name">{item.nombre} x{item.cantidad}</span>
              <input
                type="datetime-local"
                className="os-datetime"
                value={servicioFechas[item.id] || ''}
                onChange={e => handleFechaChange(item.id, e.target.value)}
              />
            </div>
            <button className="os-cancel" onClick={() => handleCancelar(item.id)}>Cancelar</button>
          </div>
        ))}
      </div>

      <div className="os-total">
        Total: <strong>${total.toFixed(2)}</strong>
      </div>

      <button className="os-btn" onClick={handleConfirmar} disabled={cart.length === 0}>
        Reservar Servicios
      </button>
    </div>
  );
};

export default OrdenServicio;