import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "./Ticket.css";

const TicketPedido = () => {
  const navigate = useNavigate();
  const { pedidoId } = useLocation().state || {};
  const [pedido, setPedido] = useState(null);
  const [detalles, setDetalles] = useState([]);
  const [cliente, setCliente] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!pedidoId) {
      setTimeout(() => navigate("/restaurante"), 3000);
      return;
    }
    const fetchData = async () => {
      try {
        // Traer pedido con cliente
        const { data: ped, error: pedErr } = await supabase
          .from("pedidos")
          .select(`
            id,
            fecha,
            cliente:clientes(nombre, apellido_paterno)
          `)
          .eq("id", pedidoId)
          .single();
        if (pedErr) throw pedErr;
        setPedido(ped);

        // Traer detalles con item nombre
        const { data: det, error: detErr } = await supabase
          .from("detalles_pedidos")
          .select(`
            item:item_id(id, nombre),
            cantidad,
            precio_unitario,
            subtotal
          `)
          .eq("pedido_id", pedidoId);
        if (detErr) throw detErr;
        setDetalles(det);

        // Cliente
        setCliente(ped.cliente);
      } catch (err) {
        console.error("Error cargando datos de ticket pedido:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [pedidoId, navigate]);

  if (loading) {
    return <div className="ticket-container"><p>Cargando ticket de pedido...</p></div>;
  }
  if (!pedido) {
    return <div className="ticket-container"><p>Pedido no encontrado. Redirigiendo...</p></div>;
  }

  const fechaGen = new Date();

  return (
    <div className="ticket-container">
      <h2>Hotel “Punta Arena”</h2>
      <h3>Ticket de Pedido</h3>

      <div className="ticket-section">
        <strong>Pedido #{pedido.id}</strong><br />
        <strong>Emitido:</strong> {fechaGen.toLocaleString()}
      </div>

      <div className="ticket-section">
        <strong>Cliente:</strong> {cliente?.nombre} {cliente?.apellido_paterno}<br />
        <strong>Fecha del pedido:</strong> {new Date(pedido.fecha).toLocaleString()}
      </div>

      <div className="ticket-section">
        <strong>Detalles:</strong>
        <ul>
          {detalles.map((d) => (
            <li key={d.item.id}>
              {d.item.nombre} x{d.cantidad} = ${d.subtotal.toFixed(2)}
            </li>
          ))}
        </ul>
      </div>

      <div className="ticket-section">
        <strong>Total:</strong> ${detalles.reduce((sum, d) => sum + d.subtotal, 0).toFixed(2)}
      </div>

      <button onClick={() => window.print()} className="btn-print">
        Imprimir Ticket
      </button>
    </div>
  );
};

export default TicketPedido;
