// src/config/api.js

// Usamos process.env.REACT_APP_BACKEND_URL para la URL del backend.
// Durante el desarrollo local, si esta variable no está definida, usará 'http://127.0.0.1:8000'.
// En Render, configuraremos REACT_APP_BACKEND_URL para que apunte a tu backend de Django.
export const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://127.0.0.1:8000';

// Puedes definir las rutas específicas aquí para mayor orden
export const API_ENDPOINTS = {
    sanciones: `${API_BASE_URL}/api/sanciones/`,
    sancionesDetail: (id) => `<span class="math-inline">\{API\_BASE\_URL\}/api/sanciones/</span>{id}/`,
    // Agrega otras rutas de API aquí si las tienes (ej. jugadores, equipos, etc.)
    // jugadores: `${API_BASE_URL}/api/jugadores/`,
};