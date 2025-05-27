import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "./OrdenCliente.css";
import NavBar from "./NavBar";

const OrdenCliente = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [clienteId, setClienteId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Al montar: cargar carrito y cliente
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(saved);

    const userRaw = localStorage.getItem("user");
    if (!userRaw) {
      navigate("/login");
      return;
    }
    const user = JSON.parse(userRaw);
    supabase
      .from("clientes")
      .select("id")
      .eq("usuario_id", user.id)
      .single()
      .then(({ data, error }) => {
        if (!error && data) setClienteId(data.id);
        else setError("Perfil de cliente no encontrado.");
      });
  }, [navigate]);

  // Sincronizar cada vez que cambie el carro
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const updateQuantity = (idx, delta) => {
    setCart(cart.map((item, i) =>
      i === idx ? { ...item, cantidad: Math.max(1, item.cantidad + delta) } : item
    ));
  };

  const removeItem = idx => {
    setCart(cart.filter((_, i) => i !== idx));
  };

  const total = cart.reduce((sum, item) => {
    const unitPrice = item.tipo === 'Bebida' && item.precio_copa ? item.precio_copa : item.precio;
    return sum + unitPrice * item.cantidad;
  }, 0);

  const handleSubmit = async () => {
    if (!clienteId || cart.length === 0) return;
    setLoading(true);
    try {
      // 1) Insertar pedido
      const { data: pedido, error: pedidoErr } = await supabase
        .from("pedidos")
        .insert([{ cliente_id: clienteId, origen: 'Restaurante' }])
        .select()
        .single();
      if (pedidoErr) throw pedidoErr;

      // 2) Insertar detalles
      const detalles = cart.map(item => {
        const unit = item.tipo === 'Bebida' && item.precio_copa ? item.precio_copa : item.precio;
        return {
          pedido_id: pedido.id,
          item_id: item.id,
          cantidad: item.cantidad,
          precio_unitario: unit,
          subtotal: unit * item.cantidad,
          tipo_venta: item.tipo === 'Bebida' ? 'copa' : 'unidad'
        };
      });
      const { error: detallesErr } = await supabase
        .from("detalles_pedidos")
        .insert(detalles);
      if (detallesErr) throw detallesErr;

      // Navegar a Pagos de pedido
      localStorage.removeItem("cart");
      navigate("/pagos-pedidos", { state: {
        pedido,
        total
      }});
    } catch (err) {
      console.error("Error al procesar pedido:", err);
      setError(err.message || "No se pudo enviar el pedido.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="oc-container">
      <NavBar />
      <h1 className="oc-title">Tu Pedido</h1>
      {cart.length === 0 ? (
        <p>No hay items en tu pedido.</p>
      ) : (
        <div className="oc-list">
          {cart.map((item, idx) => (
            <div key={item.id} className="oc-item">
              <span className="oc-name">{item.nombre}</span>
              <div className="oc-qty">
                <button onClick={() => updateQuantity(idx, -1)}>-</button>
                <span>{item.cantidad}</span>
                <button onClick={() => updateQuantity(idx, 1)}>+</button>
              </div>
              <span className="oc-price">
                ${(item.tipo==='Bebida' && item.precio_copa ? item.precio_copa : item.precio) * item.cantidad}
              </span>
              <button className="oc-remove" onClick={() => removeItem(idx)}>×</button>
            </div>
          ))}
          <div className="oc-total"><strong>Total: ${total.toFixed(2)}</strong></div>
          {error && <p className="oc-error">{error}</p>}
          <button className="oc-submit" onClick={handleSubmit} disabled={loading}>
            {loading ? "Enviando..." : "Pagar Pedido"}
          </button>
        </div>
      )}
    </div>
  );
};

export default OrdenCliente;
