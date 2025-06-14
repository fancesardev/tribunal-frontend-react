import React, { useState, useEffect } from 'react';
import axios from 'axios';

function EquipoList() {
  const [equipos, setEquipos] = useState([]); // Estado para almacenar la lista de equipos
  const [loading, setLoading] = useState(true); // Estado para indicar si los datos se están cargando
  const [error, setError] = useState(null);   // Estado para manejar errores

  useEffect(() => {
    // Función que se ejecuta cuando el componente se monta
    const fetchEquipos = async () => {
      try {
        // Realiza la petición GET a tu API de Django
        const response = await axios.get('http://localhost:8000/api/equipos/');
        setEquipos(response.data); // Almacena los datos en el estado
        setLoading(false); // Indica que la carga ha terminado
      } catch (err) {
        setError(err); // Almacena cualquier error
        setLoading(false); // Indica que la carga ha terminado
      }
    };

    fetchEquipos(); // Llama a la función para obtener los equipos
  }, []); // El array vacío [] significa que este efecto se ejecuta solo una vez (al montar el componente)

  if (loading) {
    return <p>Cargando equipos...</p>;
  }

  if (error) {
    return <p>Error al cargar los equipos: {error.message}</p>;
  }

  return (
    <div>
      <h2>Listado de Equipos</h2>
      {equipos.length === 0 ? (
        <p>No hay equipos registrados en la base de datos.</p>
      ) : (
        <ul>
          {equipos.map(equipo => (
            // Asegúrate de que 'id_equipo' sea la clave primaria correcta de tus datos
            <li key={equipo.id_equipo}>
              {equipo.nombre} (ID: {equipo.id_equipo}) - Categoría: {equipo.categoria} {/* <--- Muestra la categoría */}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default EquipoList;