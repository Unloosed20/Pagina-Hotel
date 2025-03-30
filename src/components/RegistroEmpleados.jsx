import React, { useState } from "react";
import "./RegistroEmpleados.css";

const RegistroEmpleados = () => {
  const [formData, setFormData] = useState({
    nombre: "",
    domicilio: "",
    curp: "",
    rfc: "",
    puesto: "",
    email: "",
    telefono: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Datos del formulario:", formData);
    // Aquí puedes agregar la lógica para enviar los datos al backend
  };

  return (
    <div className="register-container">
      <h1>Registrar Personal</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="nombre"
          placeholder="Nombre completo"
          value={formData.nombre}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="domicilio"
          placeholder="Domicilio"
          value={formData.domicilio}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="curp"
          placeholder="CURP"
          value={formData.curp}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="rfc"
          placeholder="RFC"
          value={formData.rfc}
          onChange={handleChange}
          required
        />
        <select name="puesto" value={formData.puesto} onChange={handleChange} required>
          <option value="" disabled>
            Selecciona el puesto
          </option>
          <option value="recepcionista">Recepcionista</option>
          <option value="limpieza">Limpieza</option>
          <option value="chef">Chef</option>
          <option value="gerente">Gerente</option>
        </select>
        <input
          type="email"
          name="email"
          placeholder="Correo electrónico"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="tel"
          name="telefono"
          placeholder="Teléfono"
          value={formData.telefono}
          onChange={handleChange}
          required
        />
        <button type="submit">Registrar</button>
      </form>
      <div className="options">
        <a href="#">Ver personal registrado</a>
      </div>
      <a href="#" className="back-link">
        Volver al menú principal
      </a>
    </div>
  );
};

export default RegistroEmpleados;
