import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import "./HabitacionesCliente.css";

const HabitacionesCliente = () => {
  const [habitaciones, setHabitaciones] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchHabitaciones();
  }, []);

  const fetchHabitaciones = async () => {
    const { data, error } = await supabase
      .from("habitaciones")
      .select(`
        id,
        numero_habitacion,
        imagen_url,
        tipos_habitaciones (
          tipo,
          descripcion,
          precio_noche
        )
      `)
      .eq("estado", "Disponible");
    if (error) return console.error(error);

    const withUrls = data.map(h => {
      const { publicURL } = supabase
        .storage
        .from("habitaciones")
        .getPublicUrl(h.imagen_url || "");
      return { ...h, publicURL };
    });
    setHabitaciones(withUrls);
  };

  const handleReservar = (habitacion) => {
    // Navega a /reserva, pasando el objeto habitación en state
    navigate("/reserva-habitaciones", { state: { habitacion } });
  };

  return (
    <div className="hc-container">
      <h1 className="hc-title">Nuestras Habitaciones</h1>
      <div className="hc-grid">
        {habitaciones.map(h => (
          <div key={h.id} className="hc-card">
            {h.publicURL && <img src={h.publicURL} className="hc-img" alt="" />}
            <div className="hc-info">
              <h2 className="hc-name">{h.tipos_habitaciones.tipo}</h2>
              <p className="hc-desc">{h.tipos_habitaciones.descripcion}</p>
              <p className="hc-price">${h.tipos_habitaciones.precio_noche} / noche</p>
              <button className="hc-btn" onClick={() => handleReservar(h)}>
                Reservar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HabitacionesCliente;
