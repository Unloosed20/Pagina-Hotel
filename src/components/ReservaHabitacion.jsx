import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./ReservaHabitacion.css";
import suiteImg from "../assets/suite.jpg";
import dobleImg from "../assets/doble.jpg";
import familiarImg from "../assets/familiar.jpg"

const habitaciones = [
  {
    id: 1,
    nombre: "Suite de Lujo",
    descripcion: "Una habitación con vista al mar, jacuzzi y servicio 24/7.",
    precio: 250,
    imagen: suiteImg,
  },
  {
    id: 2,
    nombre: "Habitación Doble",
    descripcion: "Ideal para parejas, incluye desayuno y acceso a la piscina.",
    precio: 150,
    imagen: dobleImg,
  },
  {
    id: 3,
    nombre: "Habitación Familiar",
    descripcion: "Espaciosa, con dos camas dobles y balcón privado.",
    precio: 180,
    imagen: familiarImg,
  },
];

const ReservaHabitacion = () => {
  const [fechaEntrada, setFechaEntrada] = useState(null);
  const [fechaSalida, setFechaSalida] = useState(null);
  const [habitacionSeleccionada, setHabitacionSeleccionada] = useState(null);
  const [numPersonas, setNumPersonas] = useState(1);
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");

  return (
    <div className="reserva-container">
      <h2>Reserva tu Habitación</h2>

      <label>Fecha de Entrada:</label>
      <DatePicker
        selected={fechaEntrada}
        onChange={(date) => setFechaEntrada(date)}
        minDate={new Date()}
        className="input"
      />

      <label>Fecha de Salida:</label>
      <DatePicker
        selected={fechaSalida}
        onChange={(date) => setFechaSalida(date)}
        minDate={fechaEntrada}
        className="input"
      />

      <label>Habitación:</label>
      <select
        onChange={(e) =>
          setHabitacionSeleccionada(
            habitaciones.find((hab) => hab.id === parseInt(e.target.value))
          )
        }
      >
        <option value="">Seleccione una opción</option>
        {habitaciones.map((hab) => (
          <option key={hab.id} value={hab.id}>
            {hab.nombre} - ${hab.precio} por noche
          </option>
        ))}
      </select>

      {habitacionSeleccionada && (
        <div className="habitacion-detalle">
          <img
            src={habitacionSeleccionada.imagen}
            alt={habitacionSeleccionada.nombre}
          />
          <h3>{habitacionSeleccionada.nombre}</h3>
          <p>{habitacionSeleccionada.descripcion}</p>
          <p className="precio">Costo: ${habitacionSeleccionada.precio} por noche</p>
        </div>
      )}

      <label>Número de Personas:</label>
      <input
        type="number"
        value={numPersonas}
        min="1"
        onChange={(e) => setNumPersonas(e.target.value)}
      />

      <label>Nombre:</label>
      <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} />

      <label>Email:</label>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />

      <button className="btn-reservar">Confirmar Reserva</button>
    </div>
  );
};

export default ReservaHabitacion;
