// PagosServicio.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, useLocation } from 'react-router-dom';
import './PagosServicio.css';

const PagosServicio = () => {
  const navigate = useNavigate();
  const { reservas } = useLocation().state || {};
  const [metodos, setMetodos] = useState([]);
  const [metodoElegido, setMetodoElegido] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!reservas || reservas.length === 0) {
      navigate('/servicios-cliente');
      return;
    }
    // Cargar métodos de pago
    supabase
      .from('metodos_pago')
      .select('id, nombre')
      .then(({ data, error }) => {
        if (error) setError('No se pudieron cargar métodos de pago');
        else setMetodos(data);
      });
  }, [navigate, reservas]);

  const handlePago = async () => {
    if (!metodoElegido) {
      setError('Selecciona un método de pago');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      // Insertar pagos_servicios para cada reserva_servicio
      const pagos = reservas.map(r => ({
        reserva_servicio_id: r.id,
        metodo_pago_id: +metodoElegido,
        monto: r.precio || 0
      }));
      const { error: pagoErr } = await supabase
        .from('pagos_servicios')
        .insert(pagos);
      if (pagoErr) throw pagoErr;
      navigate('/ticket-servicio', { state: { reservas } });
    } catch (e) {
      console.error('Error al procesar pago:', e);
      setError('Error al procesar el pago');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ps-container">
      <h1 className="ps-title">Pago de Servicios</h1>
      {error && <p className="ps-error">{error}</p>}
      <label htmlFor="metodo">Método de Pago:</label>
      <select
        id="metodo"
        value={metodoElegido}
        onChange={e => setMetodoElegido(e.target.value)}
        disabled={loading}
      >
        <option value="">Seleccione...</option>
        {metodos.map(m => (
          <option key={m.id} value={m.id}>{m.nombre}</option>
        ))}
      </select>
      <button
        className="ps-btn"
        onClick={handlePago}
        disabled={loading || !metodoElegido}
      >
        {loading ? 'Procesando...' : 'Pagar Servicios'}
      </button>
    </div>
  );
};

export default PagosServicio;
