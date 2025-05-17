import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Ticket.css";

const Ticket = () => {
  const { factura, reserva, pago } = useLocation().state || {};
  const navigate = useNavigate();

  // Redirigir si faltan datos, usando useEffect para efectos secundarios
  useEffect(() => {
    if (!factura || !reserva || !pago) {
      const timer = setTimeout(() => navigate("/"), 3000);
      return () => clearTimeout(timer);
    }
  }, [factura, reserva, pago, navigate]);

  // Mostrar mensaje de datos incompletos
  if (!factura || !reserva || !pago) {
    return (
      <div className="ticket-container">
        <p>Datos de ticket incompletos. Redirigiendo...</p>
      </div>
    );
  }

  // Desestructurar datos para el ticket
  const {
    id: factId,
    created_at: fechaFactura,
  } = factura;
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
      <h2>Hotel “TuEstancia”</h2>
      <h3>Ticket de Pago</h3>

      <div className="ticket-section">
        <strong>Factura #{factId}</strong><br />
        Fecha: {new Date(fechaFactura).toLocaleString()}
      </div>

      <div className="ticket-section">
        <strong>Cliente:</strong> {nombre} {apellido_paterno}<br />
        <strong>Reserva #{reservaId}</strong><br />
        Habitación: {habitaciones[0]?.habitacion_id || 'N/A'}<br />
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
