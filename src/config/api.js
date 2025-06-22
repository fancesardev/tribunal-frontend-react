// src/config/api.js
export const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://127.0.0.1:8000';

export const API_ENDPOINTS = {
    sanciones: `${API_BASE_URL}/api/sanciones/`,
    sancionesDetail: (id) => `<span class="math-inline">\{API\_BASE\_URL\}/api/sanciones/</span>{id}/`,
    jugadores: `${API_BASE_URL}/api/jugadores/`, // ¡Asegúrate de que esta línea exista!
    jugadoresDetail: (id) => `<span class="math-inline">\{API\_BASE\_URL\}/api/jugadores/</span>{id}/`, // ¡Asegúrate de que esta línea exista!
    resoluciones: `${API_BASE_URL}/api/resoluciones/`,
    resolucionesDetail: (id) => `<span class="math-inline">\{API\_BASE\_URL\}/api/resoluciones/</span>{id}/`,
    equipos: `${API_BASE_URL}/api/equipos/`, // ¡Asegúrate de que esta línea exista!
    equiposDetail: (id) => `<span class="math-inline">\{API\_BASE\_URL\}/api/equipos/</span>{id}/`, // Si tienes un endpoint de detalle para equipos
};