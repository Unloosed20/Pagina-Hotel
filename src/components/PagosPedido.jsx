// components/PagosPedido.jsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "./Pagos.css"; // Puede compartir estilos con Pagos

const PagosPedido = () => {
  const { pedido, total } = useLocation().state || {};
  const navigate = useNavigate();

  const [metodoPagoId, setMetodoPagoId] = useState("");
  const [metodosPago, setMetodosPago] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Cargamos métodos de pago
    supabase.from("metodos_pago").select("id, nombre")
      .then(({ data, error }) => {
        if (error) setError("No se pudieron cargar los métodos");
        else setMetodosPago(data);
      });

    // Validación inicial
    if (!pedido?.id || typeof total !== "number") {
      setError("Datos de pedido o total faltantes. Volviendo al menú...");
      setTimeout(() => navigate("/restaurante"), 3000);
    }
  }, [pedido, total, navigate]);

  const handlePago = async () => {
    if (!metodoPagoId) {
      setError("Selecciona un método de pago");
      return;
    }
    setLoading(true);
    try {
      // Insertar registro en pagos_pedidos
      const { data: pagoData, error: pagoErr } = await supabase
        .from("pagos_pedidos")
        .insert([{
          pedido_id: pedido.id,
          metodo_pago_id: +metodoPagoId,
          monto: total
        }])
        .select()
        .single();

      if (pagoErr) throw pagoErr;

      // Opcional: actualizar estado del pedido a 'Pagado'
      await supabase
        .from("pedidos")
        .update({ estado: "Servido" })
        .eq("id", pedido.id);

      // Redirige a confirmación
      navigate("/ticket-pedidos", { state: { pedidoId: pedido.id } });
    } catch (err) {
      console.error(err);
      setError("Error al procesar el pago. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return <div className="pagos-container"><p className="error-message">{error}</p></div>;
  }

  return (
    <div className="pagos-container">
      <h2>Pago de Pedido #{pedido?.id}</h2>
      <p>Total: <strong>${total.toFixed(2)}</strong></p>
      <div className="metodo-group">
        <label htmlFor="metodo">Método de Pago:</label>
        <select
          id="metodo"
          value={metodoPagoId}
          onChange={e => setMetodoPagoId(e.target.value)}
          disabled={loading || metodosPago.length === 0}
        >
          <option value="">{metodosPago.length ? "Seleccione..." : "Cargando..."}</option>
          {metodosPago.map(m => (
            <option key={m.id} value={m.id}>{m.nombre}</option>
          ))}
        </select>
      </div>
      <button
        className="btn-pagar"
        onClick={handlePago}
        disabled={loading || !metodoPagoId}
      >
        {loading ? "Procesando..." : "Pagar Ahora"}
      </button>
    </div>
  );
};

export default PagosPedido;
