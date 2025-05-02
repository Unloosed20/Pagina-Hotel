import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import "./GestionVentas.css";

const GestionVentas = () => {
  const [items, setItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [mesa, setMesa] = useState("");

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    const { data, error } = await supabase
      .from("items_menu_bar")
      .select("id, nombre, precio, tipo, precio_copa, disponible, receta_item(cantidad_usada, producto_id)")
      .eq("disponible", true);
    if (!error) setItems(data);
  };

  const addToCart = (item) => {
    setCart((prev) => {
      const exists = prev.find((i) => i.id === item.id);
      if (exists) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, cantidad: i.cantidad + 1 } : i
        );
      }
      return [...prev, { ...item, cantidad: 1 }];
    });
  };

  const updateQuantity = (id, cantidad) => {
    setCart((prev) =>
      prev.map((i) => (i.id === id ? { ...i, cantidad: Math.max(1, cantidad) } : i))
    );
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  };

  const total = cart.reduce(
    (sum, i) =>
      sum +
      i.cantidad * (i.tipo === 'Bebida' && i.precio_copa ? i.precio_copa : i.precio),
    0
  );

  const handleSubmit = async () => {
    if (cart.length === 0) return alert("El carrito está vacío.");

    // 1. Crear pedido
    const { data: pedido, error: pedError } = await supabase
      .from("pedidos")
      .insert([
        {
          origen: "Restaurante",
          mesa_numero: mesa || null,
        },
      ])
      .select()
      .single();
    if (pedError) return alert("Error al crear pedido.");

    // 2. Preparar detalles y stock updates
    const detalles = cart.map((i) => ({
      pedido_id: pedido.id,
      item_id: i.id,
      cantidad: i.cantidad,
      precio_unitario:
        i.tipo === 'Bebida' && i.precio_copa ? i.precio_copa : i.precio,
      subtotal: i.cantidad * (i.tipo === 'Bebida' && i.precio_copa ? i.precio_copa : i.precio),
    }));

    // 3. Insertar detalles de pedido
    const { error: detError } = await supabase
      .from("detalles_pedidos")
      .insert(detalles);
    if (detError) return alert("Error al guardar detalles.");

    // 4. Actualizar stock en productos
    for (let item of cart) {
      if (item.receta_item && item.receta_item.length > 0) {
        // Para cada producto usado en la receta, descontar cantidad_usada * cantidad
        for (let rec of item.receta_item) {
          await supabase
            .from("productos")
            .update({
              stock: supabase.raw('stock - ?', [rec.cantidad_usada * item.cantidad]),
            })
            .eq("id", rec.producto_id);
        }
      }
    }

    alert("Venta registrada y stock actualizado correctamente");
    setCart([]);
    setMesa("");
    fetchItems();
  };

  return (
    <div className="container">
      <h1 className="title">Gestión de Ventas</h1>

      <div className="ventas-panel">
        <section className="menu-section">
          <h2>Menú Disponible</h2>
          <div className="items-grid">
            {items.map((item) => (
              <div key={item.id} className="item-card">
                <h3>{item.nombre}</h3>
                <p>{item.tipo}</p>
                <p>
                  {item.tipo === 'Bebida' && item.precio_copa
                    ? `Copa: ${item.precio_copa}`
                    : `Precio: ${item.precio}`}
                </p>
                <button onClick={() => addToCart(item)}>Agregar</button>
              </div>
            ))}
          </div>
        </section>

        <section className="cart-section">
          <h2>Carrito</h2>
          <input
            type="number"
            placeholder="Mesa #"
            value={mesa}
            onChange={(e) => setMesa(e.target.value)}
          />
          <div className="cart-list">
            {cart.map((i) => (
              <div key={i.id} className="cart-item">
                <span>{i.nombre}</span>
                <input
                  type="number"
                  value={i.cantidad}
                  min="1"
                  onChange={(e) => updateQuantity(i.id, parseInt(e.target.value))}
                />
                <button onClick={() => removeFromCart(i.id)}>Eliminar</button>
              </div>
            ))}
          </div>
          <div className="total">Total: {total.toFixed(2)}</div>
          <button className="sell-btn" onClick={handleSubmit}>Registrar Venta</button>
        </section>
      </div>
    </div>
  );
};

export default GestionVentas;