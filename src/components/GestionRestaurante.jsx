import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import "./GestionRestaurante.css";

const GestionRestaurante = () => {
  const [items, setItems] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [productos, setProductos] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    tipo: "Comida",
    precio_copa: "",
    numero_copas_botella: "",
    imagen_file: null,
    imagen_url: "",
    ingredientes: []
  });

  useEffect(() => {
    fetchItems();
    fetchPedidos();
    fetchProductos();
  }, []);

  const fetchItems = async () => {
    const { data, error } = await supabase.from("items_menu_bar").select("*");
    if (!error) setItems(data);
    else console.error("Error fetching items:", error);
  };

  const fetchPedidos = async () => {
    const { data, error } = await supabase
      .from("pedidos")
      .select(`
        id,
        fecha,
        estado,
        origen,
        mesa_numero,
        detalles:detalles_pedidos(*)
      `);
    if (!error) setPedidos(data);
    else console.error("Error fetching pedidos:", error);
  };

  const fetchProductos = async () => {
    const { data, error } = await supabase.from("productos").select("id, nombre");
    if (!error) setProductos(data);
    else console.error("Error fetching productos:", error);
  };

  const handleChange = (e) => {
    const { name, value, files, type, checked } = e.target;
    if (name === "imagen_file") {
      setFormData(f => ({ ...f, imagen_file: files[0] }));
    } else if (type === "checkbox") {
      setFormData(f => ({ ...f, [name]: checked }));
    }
    else {
      setFormData(f => ({ ...f, [name]: value }));
    }
  };

  const openModal = (item = null) => {
    if (item) {
      setIsEditing(true);
      setEditingItem(item);
      supabase
        .from("receta_item")
        .select("producto_id, cantidad_usada")
        .eq("item_id", item.id)
        .then(({ data: recetaData, error: recetaError }) => {
          if (recetaError) {
            console.error("Error fetching receta:", recetaError);
            setFormData({
              nombre: item.nombre,
              descripcion: item.descripcion,
              precio: item.precio,
              tipo: item.tipo,
              precio_copa: item.precio_copa || "",
              numero_copas_botella: item.numero_copas_botella || "",
              imagen_file: null,
              imagen_url: item.imagen_url || "",
              ingredientes: []
            });
          } else {
            setFormData({
              nombre: item.nombre,
              descripcion: item.descripcion,
              precio: item.precio,
              tipo: item.tipo,
              precio_copa: item.precio_copa || "",
              numero_copas_botella: item.numero_copas_botella || "",
              imagen_file: null,
              imagen_url: item.imagen_url || "",
              ingredientes: recetaData || []
            });
          }
        });
    } else {
      setIsEditing(false);
      setEditingItem(null);
      setFormData({
        nombre: "",
        descripcion: "",
        precio: "",
        tipo: "Comida",
        precio_copa: "",
        numero_copas_botella: "",
        imagen_file: null,
        imagen_url: "",
        ingredientes: []
      });
    }
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    let url = formData.imagen_url;
    if (formData.imagen_file) {
      const ext = formData.imagen_file.name.split(".").pop();
      const fileName = `${Date.now()}.${ext}`;
      const { error: upErr } = await supabase
        .storage
        .from("items_menu_bar")
        .upload(fileName, formData.imagen_file, { upsert: true });
      if (upErr) return alert("Error subiendo imagen: " + upErr.message);

      const { data: urlData } = supabase // No se necesita error handling aquí si upErr ya lo hizo
        .storage
        .from("items_menu_bar")
        .getPublicUrl(fileName);
      if (urlData) url = urlData.publicUrl;
    }

    const payload = {
      nombre: formData.nombre,
      descripcion: formData.descripcion,
      precio: parseFloat(formData.precio),
      disponible: true, // Asumiendo que siempre es true al crear/editar, puedes añadir un input si es necesario
      tipo: formData.tipo,
      precio_copa:
        formData.tipo === "Bebida" && formData.precio_copa
          ? parseFloat(formData.precio_copa)
          : null,
      numero_copas_botella:
        formData.tipo === "Bebida" && formData.numero_copas_botella
          ? parseInt(formData.numero_copas_botella, 10)
          : null,
      imagen_url: url
    };

    let itemId = editingItem?.id;
    if (isEditing && itemId) {
      const { error } = await supabase.from("items_menu_bar").update(payload).eq("id", itemId);
      if (error) return alert("Error actualizando item: " + error.message);
    } else {
      const { data, error } = await supabase
        .from("items_menu_bar")
        .insert([payload])
        .select()
        .single();
      if (error) return alert("Error creando item: " + error.message);
      if (data) itemId = data.id;
    }

    if (itemId) { // Asegurarse que itemId existe
        if (isEditing) {
            await supabase.from("receta_item").delete().eq("item_id", itemId);
        }
        const receta = formData.ingredientes
            .filter((i) => i.producto_id && i.cantidad_usada && parseFloat(i.cantidad_usada) > 0)
            .map((i) => ({
            item_id: itemId,
            producto_id: parseInt(i.producto_id, 10),
            cantidad_usada: parseFloat(i.cantidad_usada)
            }));

        if (receta.length) {
            const { error: recetaError } = await supabase.from("receta_item").insert(receta);
            if (recetaError) alert("Error guardando receta: " + recetaError.message);
        }
    }

    fetchItems();
    closeModal();
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Eliminar este item?")) {
      // Primero eliminar referencias en receta_item
      const { error: recetaDeleteError } = await supabase.from("receta_item").delete().eq("item_id", id);
      if (recetaDeleteError) {
          alert("Error eliminando receta asociada: " + recetaDeleteError.message);
          // Decide si quieres continuar con la eliminación del item o no
          // return; 
      }
      const { error } = await supabase.from("items_menu_bar").delete().eq("id", id);
      if (error) alert("Error eliminando item: " + error.message);
      else fetchItems();
    }
  };

  const handleIngredienteChange = (index, field, value) => {
    const newIngredientes = [...formData.ingredientes];
    newIngredientes[index] = { ...newIngredientes[index], [field]: value };
    setFormData(f => ({ ...f, ingredientes: newIngredientes }));
  };

  const addIngrediente = () => {
    setFormData(f => ({
      ...f,
      ingredientes: [...f.ingredientes, { producto_id: "", cantidad_usada: "" }]
    }));
  };

  const removeIngrediente = (index) => {
    setFormData(f => ({
      ...f,
      ingredientes: f.ingredientes.filter((_, i) => i !== index)
    }));
  };


  return (
    <div className="container">
      <h1 className="title">Gestión Restaurante-Bar</h1>

      {/* Contenedor principal de las secciones, ahora en columna */}
      <div
        style={{
          display: "flex",
          flexDirection: "column", // Apila las secciones verticalmente
          gap: "30px",             // Espacio entre las secciones
          paddingBottom: "20px"
        }}
      >
        {/* Platillos y Bebidas */}
        <section
          className="items-section"
          style={{
            width: "100%", // Ocupa el ancho completo
            display: "flex",
            flexDirection: "column"
          }}
        >
          <div
            className="section-header"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "8px"
            }}
          >
            <h2>Platillos y Bebidas</h2>
            <button className="add-btn" onClick={() => openModal()}>
              Nuevo Item
            </button>
          </div>
          <div
            className="scroll-container"
            style={{
              flex: 1, // Permite que este div crezca si la sección tiene espacio vertical
              maxHeight: "400px",
              overflowY: "auto",
              border: "1px solid #ccc",
              borderRadius: "4px",
              padding: "8px"
            }}
          >
            <table className="client-table">
              <thead>
                <tr>
                  <th>Imagen</th>
                  <th>Nombre</th>
                  <th>Tipo</th>
                  <th>Precio</th>
                  <th>Disp.</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      {item.imagen_url && (
                        <img
                          src={item.imagen_url} // Asumimos que la URL ya es pública y correcta
                          alt={item.nombre}
                          className="thumb"
                        />
                      )}
                    </td>
                    <td>{item.nombre}</td>
                    <td>{item.tipo}</td>
                    <td>
                      {item.tipo === "Bebida" && item.precio_copa
                        ? `Botella: ${item.precio} / Copa: ${item.precio_copa}`
                        : item.precio}
                    </td>
                    <td>{item.disponible ? "Sí" : "No"}</td>
                    <td>
                      <button
                        className="edit-btn"
                        onClick={() => openModal(item)}
                      >
                        Editar
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(item.id)}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Pedidos */}
        <section
          className="pedidos-section"
          style={{
            width: "100%", // Ocupa el ancho completo
            display: "flex",
            flexDirection: "column"
          }}
        >
          <div
            className="section-header"
            style={{
              display: "flex",
              justifyContent: "space-between", // Mantenido por si se añade algo a la derecha
              alignItems: "center",
              marginBottom: "8px"
            }}
          >
            <h2>Pedidos</h2>
            {/* El placeholder fue eliminado ya que no es necesario */}
          </div>
          <div
            className="scroll-container"
            style={{
              flex: 1,
              maxHeight: "400px",
              overflowY: "auto",
              border: "1px solid #ccc",
              borderRadius: "4px",
              padding: "8px"
            }}
          >
            <table className="client-table">
              <thead>
                <tr>
                  <th>ID Pedido</th>
                  <th>Detalle</th>
                  <th>Fecha</th>
                  <th>Origen</th>
                  <th>Mesa</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {pedidos.map((p) => (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td>
                      {p.detalles
                        .map((d) => {
                          const itemObj = items.find((i) => i.id === d.item_id);
                          const nombre = itemObj
                            ? itemObj.nombre
                            : `Item ID #${d.item_id}`;
                          return `${nombre} x${d.cantidad}`;
                        })
                        .join(", ")}
                    </td>
                    <td>
                      {new Date(p.fecha).toLocaleString("es-MX", {
                        dateStyle: "short",
                        timeStyle: "short"
                      })}
                    </td>
                    <td>{p.origen}</td>
                    <td>{p.mesa_numero ?? "-"}</td>
                    <td>{p.estado}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Modal de Item */}
      {modalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>{isEditing ? "Editar Item" : "Registrar Item"}</h2>
            <form onSubmit={handleSubmit}>
              <input
                name="nombre"
                placeholder="Nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
              />
              <textarea
                name="descripcion"
                placeholder="Descripción"
                value={formData.descripcion}
                onChange={handleChange}
              />
              <select name="tipo" value={formData.tipo} onChange={handleChange}>
                <option value="Comida">Comida</option>
                <option value="Bebida">Bebida</option>
              </select>
              <input
                name="precio"
                type="number"
                step="0.01"
                placeholder="Precio (Botella si es bebida)"
                value={formData.precio}
                onChange={handleChange}
                required
              />
              {formData.tipo === "Bebida" && (
                <>
                  <input
                    name="precio_copa"
                    type="number"
                    step="0.01"
                    placeholder="Precio Copa (opcional)"
                    value={formData.precio_copa}
                    onChange={handleChange}
                  />
                  <input
                    name="numero_copas_botella"
                    type="number"
                    placeholder="Copas/Botella (opcional)"
                    value={formData.numero_copas_botella}
                    onChange={handleChange}
                  />
                </>
              )}
              <label htmlFor="imagen_file_input">Imagen del Item:</label>
              <input
                id="imagen_file_input"
                type="file"
                name="imagen_file"
                accept="image/*"
                onChange={handleChange}
              />
              {formData.imagen_url && !formData.imagen_file && (
                <div style={{ marginTop: '10px' }}>
                  <p>Imagen actual:</p>
                  <img src={formData.imagen_url} alt="Preview" style={{ width: '100px', height: '100px', objectFit: 'cover' }}/>
                </div>
              )}
              {formData.imagen_file && (
                 <div style={{ marginTop: '10px' }}>
                  <p>Nueva imagen seleccionada:</p>
                  <img src={URL.createObjectURL(formData.imagen_file)} alt="Preview" style={{ width: '100px', height: '100px', objectFit: 'cover' }}/>
                </div>
              )}

              <h3>Ingredientes</h3>
              {formData.ingredientes.map((ing, idx) => (
                <div key={idx} className="ingrediente-row">
                  <select
                    value={ing.producto_id}
                    onChange={(e) => handleIngredienteChange(idx, "producto_id", e.target.value)}
                  >
                    <option value="">Selecciona producto</option>
                    {productos.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombre}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="Cant. usada"
                    value={ing.cantidad_usada}
                    onChange={(e) => handleIngredienteChange(idx, "cantidad_usada", e.target.value)}
                  />
                  <button type="button" onClick={() => removeIngrediente(idx)} className="remove-ingrediente-btn">
                    ×
                  </button>
                </div>
              ))}
              <button type="button" onClick={addIngrediente} className="add-ingrediente-btn">
                + Agregar Ingrediente
              </button>

              <div className="modal-actions">
                <button type="submit" className="save-btn">Guardar</button>
                <button type="button" onClick={closeModal} className="cancel-btn">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionRestaurante;