import React, { useState, useEffect } from 'react'; // Agregamos useEffect
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom'; // Agregamos useParams para el ID

// Importar componentes de Material-UI
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress'; // Para indicar carga al editar
import { Container } from '@mui/material'; // Para la alineación de la carga

import { API_ENDPOINTS } from '../config/api'; // Asegúrate de que la ruta sea correcta

function ResolucionForm() {
    const { id } = useParams(); // Obtener el ID de la URL
    const navigate = useNavigate();

    const [fecha, setFecha] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [loadingData, setLoadingData] = useState(true); // Nuevo estado para la carga inicial (para edición)
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    // useEffect para cargar datos si estamos editando
    useEffect(() => {
        const fetchResolucion = async () => {
            if (id) { // Solo si hay un ID en la URL, significa que estamos en modo edición
                try {
                    setLoadingData(true);
                    const response = await axios.get(API_ENDPOINTS.resolucionesDetail(id));
                    const resolucionData = response.data;
                    setFecha(resolucionData.fecha);
                    setDescripcion(resolucionData.descripcion);
                    setLoadingData(false);
                } catch (err) {
                    console.error("Error al cargar la resolución para edición:", err);
                    setError({ detail: "Error al cargar los datos de la resolución para edición." });
                    setLoadingData(false);
                }
            } else {
                setLoadingData(false); // Si no hay ID, no hay que cargar datos, así que terminamos la carga inicial
            }
        };

        fetchResolucion();
    }, [id]); // Dependencia del ID para que se ejecute cuando el ID cambie (al cargar la página o navegar)

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        try {
            let response;
            const resolucionData = {
                fecha,
                descripcion
            };

            if (id) {
                // Si hay un ID, es una actualización (PATCH o PUT)
                response = await axios.patch(API_ENDPOINTS.resolucionesDetail(id), resolucionData);
                console.log('Resolución actualizada:', response.data);
                setSuccess(true);
            } else {
                // Si no hay ID, es una creación (POST)
                response = await axios.post(API_ENDPOINTS.resoluciones, resolucionData);
                console.log('Resolución creada:', response.data);
                setSuccess(true);
                // Limpiar campos del formulario solo si es una creación
                setFecha('');
                setDescripcion('');
            }

            setTimeout(() => {
                navigate('/resoluciones'); // Redirige a la lista de resoluciones
            }, 1500);
        } catch (err) {
            console.error('Error al guardar resolución:', err.response ? err.response.data : err.message);
            setError(err.response ? err.response.data : { detail: 'Error desconocido al guardar la resolución.' });
        }
    };

    if (loadingData) {
        return (
            <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                <CircularProgress />
                <Typography variant="h6" sx={{ mt: 2 }}>Cargando datos de resolución...</Typography>
            </Container>
        );
    }

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 500, mx: 'auto', p: 2 }}>
            <Typography variant="h4" component="h2" gutterBottom>
                {id ? 'Editar Resolución' : 'Añadir Nueva Resolución'} {/* Título dinámico */}
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
                sx={{ mt: 2, mr: 2 }} // Añadimos mr:2 para espaciar el botón Cancelar
            >
                {id ? 'Guardar Cambios' : 'Añadir Resolución'} {/* Texto dinámico del botón */}
            </Button>
            <Button
                variant="outlined"
                onClick={() => navigate('/resoluciones')}
                sx={{ mt: 2 }}
            >
                Cancelar
            </Button>

            {success && (
                <Alert severity="success" sx={{ mt: 2 }}>
                    ¡Resolución {id ? 'actualizada' : 'añadida'} exitosamente!
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