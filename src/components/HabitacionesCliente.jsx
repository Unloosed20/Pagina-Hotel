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
      .select(
        `
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

    if (error) {
      console.error("Error fetch habitaciones:", error);
      return;
    }

    const habitacionesConURL = data.map((h) => {
      let publicURL = "";
      if (h.imagen_url) {
        if (h.imagen_url.startsWith("http")) {
          publicURL = h.imagen_url;
        } else {
          const { data: urlData, error: urlError } = supabase
            .storage
            .from("habitaciones")
            .getPublicUrl(h.imagen_url);
          if (urlError) {
            console.error("Error obteniendo URL pública:", urlError);
          } else {
            publicURL = urlData.publicUrl;
          }
        }
      }
      return { ...h, publicURL };
    });

    setHabitaciones(habitacionesConURL);
  };

  const handleReservar = (habitacion) => {
    navigate("/reserva-habitaciones", { state: { habitacion } });
  };

  return (
    <div className="hc-container">
      <h1 className="hc-title">Nuestras Habitaciones</h1>
      {/* Scroll container para cards */}
      <div className="hc-grid" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
        {habitaciones.map((h) => (
          <div key={h.id} className="hc-card">
            {h.publicURL && (
              <img src={h.publicURL} alt={`Habitación ${h.numero_habitacion}`} className="hc-img" />
            )}
            <div className="hc-info">
              <h2 className="hc-name">Habitación {h.numero_habitacion} - {h.tipos_habitaciones.tipo}</h2>
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