import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import "./RestauranteCliente.css";

const RestauranteCliente = () => {
  const [items, setItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    const { data, error } = await supabase
      .from("items_menu_bar")
      .select(`
        id,
        nombre,
        descripcion,
        tipo,
        precio,
        precio_copa,
        numero_copas_botella,
        imagen_url
      `)
      .eq("disponible", true);

    if (error) {
      console.error("Error al cargar items del menú:", error);
      return;
    }

    const itemsConURL = data.map((item) => {
      let publicURL = "";
      if (item.imagen_url) {
        if (item.imagen_url.startsWith("http")) {
          publicURL = item.imagen_url;
        } else {
          const { data: urlData, error: urlError } = supabase
            .storage
            .from("items_menu_bar")
            .getPublicUrl(item.imagen_url);
          if (!urlError) publicURL = urlData.publicUrl;
        }
      }
      return { ...item, publicURL };
    });

    setItems(itemsConURL);
  };

  const handleAgregarAlCarrito = (item) => {
    // Leer carrito actual de localStorage
    const prev = JSON.parse(localStorage.getItem("cart") || "[]");
    const idx = prev.findIndex((i) => i.id === item.id);
    if (idx >= 0) {
      prev[idx].cantidad += 1;
    } else {
      prev.push({ ...item, cantidad: 1 });
    }
    localStorage.setItem("cart", JSON.stringify(prev));
  };

  const handleFinalizar = () => {
    navigate("/orden-cliente");
  };

  return (
    <div className="rc-container">
      <h1 className="rc-title">Nuestro Menú</h1>

      <div className="rc-grid" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        {items.map((item) => (
          <div key={item.id} className="rc-card">
            {item.publicURL && (
              <img
                src={item.publicURL}
                alt={item.nombre}
                className="rc-img"
              />
            )}
            <div className="rc-info">
              <h2 className="rc-name">{item.nombre}</h2>
              <p className="rc-desc">{item.descripcion}</p>
              <p className="rc-price">
                {item.tipo === 'Bebida' && item.precio_copa
                  ? `Copa: $${item.precio_copa}`
                  : `Precio: $${item.precio}`}
              </p>
              <button
                className="rc-btn"
                onClick={() => handleAgregarAlCarrito(item)}
              >
                Agregar al carrito
              </button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <button className="rc-btn" onClick={handleFinalizar}>
          Finalizar compra
        </button>
      </div>
    </div>
  );
};

export default RestauranteCliente;
