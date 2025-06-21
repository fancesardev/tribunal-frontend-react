import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Importar componentes de Material-UI
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';

// ¡IMPORTANTE: Añadir esta línea para importar las URLs de la API!
import { API_ENDPOINTS } from '../config/api'; // Asegúrate de que la ruta sea correcta

function ResolucionForm() {
  const [fecha, setFecha] = useState(''); // Estado para la fecha
  const [descripcion, setDescripcion] = useState(''); // Estado para la descripción
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    try {
        // Esta es la línea corregida. Debe ser axios.post y la URL de la API.
        // Y el segundo argumento de axios.post es el objeto con los datos a enviar.
      const response = await axios.post(API_ENDPOINTS.resoluciones, {
        fecha,       // Envía la fecha
        descripcion // Envía la descripción
      });
      console.log('Resolución creada:', response.data);
      setSuccess(true);
      // Limpiar campos del formulario
      setFecha('');
      setDescripcion('');

      setTimeout(() => {
        navigate('/resoluciones'); // Redirige a la lista de resoluciones
      }, 1500);
    } catch (err) {
      console.error('Error al crear resolución:', err.response ? err.response.data : err.message);
      setError(err.response ? err.response.data : { detail: 'Error desconocido al crear la resolución.' });
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 500, mx: 'auto', p: 2 }}>
      <Typography variant="h4" component="h2" gutterBottom>
        Añadir Nueva Resolución
      </Typography>

      <Box mb={2}>
        <TextField
          fullWidth
          type="date"
          id="fechaResolucion"
          label="Fecha de Resolución"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          required
          InputLabelProps={{
            shrink: true,
          }}
        />
      </Box>

      <Box mb={2}>
        <TextField
          fullWidth
          id="descripcionResolucion"
          label="Descripción"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          required
          multiline
          rows={4}
        />
      </Box>

      <Button
        type="submit"
        variant="contained"
        color="primary"
        sx={{ mt: 2 }}
      >
        Añadir Resolución
      </Button>

      {success && (
        <Alert severity="success" sx={{ mt: 2 }}>
          ¡Resolución añadida exitosamente!
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          <Typography variant="body1">Hubo un error:</Typography>
          {error.fecha && <Typography variant="body2">- Fecha: {error.fecha[0]}</Typography>}
          {error.descripcion && <Typography variant="body2">- Descripción: {error.descripcion[0]}</Typography>}
          {error.detail && <Typography variant="body2">- {error.detail}</Typography>}
        </Alert>
      )}
    </Box>
  );
}

export default ResolucionForm;