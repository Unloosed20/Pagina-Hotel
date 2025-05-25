import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "./Ticket.css";
import NavBar from "./NavBar";

const Ticket = () => {
  const navigate = useNavigate();
  const { factura, reserva: reservaBase, pago } = useLocation().state || {};
  const [reserva, setReserva] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1) Redirigir si faltan datos mínimos
  useEffect(() => {
    if (!factura || !reservaBase?.id || !pago) {
      const timer = setTimeout(() => navigate("/"), 3000);
      return () => clearTimeout(timer);
    }
  }, [factura, reservaBase, pago, navigate]);

  // 2) Cargar datos completos de la reserva (cliente y habitaciones)
  useEffect(() => {
    const fetchReserva = async () => {
      if (!reservaBase?.id) return;
      try {
        const { data, error } = await supabase
          .from("reservas")
          .select(`
            id,
            fecha_inicio,
            fecha_fin,
            cliente:clientes (nombre, apellido_paterno),
            habitaciones:reservas_habitaciones!inner (
              habitacion:habitaciones!inner (id)
            )
          `)
          .eq("id", reservaBase.id)
          .single();
        if (error) throw error;
        setReserva(data);
      } catch (err) {
        console.error("Error cargando reserva completa:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReserva();
  }, [reservaBase]);

  // Mientras carga la reserva
  if (loading) {
    return (
      <div className="ticket-container">
        <p>Cargando ticket...</p>
      </div>
    );
  }

  // Si al final no hay datos válidos
  if (!factura || !reserva || !pago) {
    return (
      <div className="ticket-container">
        <p>Datos de ticket incompletos. Redirigiendo...</p>
      </div>
    );
  }

  // Desestructurar datos para el ticket
  const { id: factId } = factura;
  const fechaGeneracion = new Date();
  const {
    id: reservaId,
    cliente: { nombre, apellido_paterno },
    habitaciones,
    fecha_inicio,
    fecha_fin,
  } = reserva;
  const { id: pagoId, metodo_pago_id, monto } = pago;

  return (
    <div className="ticket-container">
      <NavBar />
      <h2>Hotel “Punta Arena”</h2>
      <h3>Ticket de Pago</h3>

      <div className="ticket-section">
        <strong>Factura #{factId}</strong><br />
        <strong>Emitido:</strong> {fechaGeneracion.toLocaleString()}
      </div>

      <div className="ticket-section">
        <strong>Cliente:</strong> {nombre} {apellido_paterno}<br />
        <strong>Reserva #{reservaId}</strong><br />
        Habitación: {habitaciones[0]?.habitacion.id || 'N/A'}<br />
        Fecha de ingreso: {new Date(fecha_inicio).toLocaleDateString()}<br />
        Fecha de salida: {new Date(fecha_fin).toLocaleDateString()}
      </div>

      <div className="ticket-section">
        <strong>Pago #{pagoId}</strong><br />
        Método de pago ID: {metodo_pago_id}<br />
        Monto: ${monto.toFixed(2)}
      </div>

      <button onClick={() => window.print()} className="btn-print">
        Imprimir Ticket
      </button>
    </div>
  );
};

export default Ticket;
