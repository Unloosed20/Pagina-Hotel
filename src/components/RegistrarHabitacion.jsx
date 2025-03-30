import { useState } from "react";
import "./RegistrarHabitacion.css";

const RegistrarHabitacion = () => {
  const [roomType, setRoomType] = useState("");
  const [roomNumber, setRoomNumber] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Habitación registrada: ${roomType}, Número: ${roomNumber}`);
    setRoomType("");
    setRoomNumber("");
  };

  return (
    <div className="register-container">
      <h1>Registrar Habitación</h1>
      <form onSubmit={handleSubmit}>
        <select
          value={roomType}
          onChange={(e) => setRoomType(e.target.value)}
          required
        >
          <option value="" disabled>
            Selecciona el tipo de habitación
          </option>
          <option value="single">Individual</option>
          <option value="double">Doble</option>
          <option value="suite">Suite</option>
          <option value="presidential">Presidencial</option>
        </select>
        <input
          type="number"
          value={roomNumber}
          onChange={(e) => setRoomNumber(e.target.value)}
          placeholder="Número de habitación"
          required
        />
        <button type="submit">Registrar</button>
      </form>
      <div className="options">
        <a href="#">Ver habitaciones registradas</a>
      </div>
      <a href="#" className="back-link">
        Volver al menú principal
      </a>
    </div>
  );
};

export default RegistrarHabitacion;
