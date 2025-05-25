import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import './ServiciosCliente.css';

const ServiciosCliente = () => {
  const [servicios, setServicios] = useState([]);
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchServicios();
    const saved = JSON.parse(localStorage.getItem('serviciosCart') || '[]');
    setCart(saved);
  }, []);

  const fetchServicios = async () => {
    const { data, error } = await supabase
      .from('servicios')
      .select('id, nombre, descripcion, precio, disponible')
      .eq('disponible', true);
    if (error) console.error('Error fetching servicios:', error);
    else setServicios(data);
  };

  const agregarAlCarrito = (serv) => {
    const updated = [...cart];
    const index = updated.findIndex(item => item.id === serv.id);
    if (index >= 0) {
      updated[index].cantidad += 1;
    } else {
      updated.push({ ...serv, cantidad: 1 });
    }
    setCart(updated);
    localStorage.setItem('serviciosCart', JSON.stringify(updated));
  };

  const handleSiguiente = () => {
    navigate('/orden-servicio');
  };

  return (
    <div className="sc-container">
      <h1 className="sc-title">Servicios Adicionales</h1>
      <div className="sc-grid">
        {servicios.map(serv => (
          <div key={serv.id} className="sc-card">
            <h3 className="sc-name">{serv.nombre}</h3>
            <p className="sc-desc">{serv.descripcion}</p>
            <p className="sc-price">${serv.precio.toFixed(2)}</p>
            <button
              className="sc-btn"
              onClick={() => agregarAlCarrito(serv)}
            >
              Agregar
            </button>
          </div>
        ))}
      </div>
      <button
        className="sc-next"
        onClick={handleSiguiente}
        disabled={cart.length === 0}
      >
        Siguiente: Confirmar ({cart.length})
      </button>
    </div>
  );
};

export default ServiciosCliente;
