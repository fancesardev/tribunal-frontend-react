import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  return (
    <nav className="navbar">
      <ul className="navbar-list">
        <li className="navbar-item">
          <Link to="/" className="navbar-link">Inicio</Link>
        </li>
        <li className="navbar-item">
          <Link to="/equipos" className="navbar-link">Equipos</Link>
        </li>
        <li className="navbar-item">
          <Link to="/equipos/nuevo" className="navbar-link">Añadir Equipo</Link> {/* <--- Añade esta línea */}
        </li>
        <li className="navbar-item">
          <Link to="/jugadores" className="navbar-link">Jugadores</Link>
        </li>
        <li className="navbar-item">
          <Link to="/jugadores/nuevo" className="navbar-link">Añadir Jugador</Link> {/* <--- Añade esta línea */}
        </li>
        <li className="navbar-item">
          <Link to="/resoluciones" className="navbar-link">Resoluciones</Link>
        </li>
        <li className="navbar-item">
          <Link to="/resoluciones/nuevo" className="navbar-link">Añadir Resolución</Link> {/* <--- Añade esta línea */}
        </li>
        <li className="navbar-item">
          <Link to="/sanciones" className="navbar-link">Sanciones</Link>
        </li>
        <li className="navbar-item">
          <Link to="/sanciones/nuevo" className="navbar-link">Añadir Sanción</Link> {/* <--- Añade esta línea */}
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;