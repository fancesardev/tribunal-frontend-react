// E:\LAS_FUTBOL25\tribunal_frontend_react\src\components\JugadorForm.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

// Importar componentes de Material-UI
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import { Grid } from '@mui/material';
import { API_ENDPOINTS } from '../config/api'; // Importación correcta

function JugadorForm() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [codigoSocio, setCodigoSocio] = useState('');
    const [dni, setDni] = useState('');
    const [fechaNacimiento, setFechaNacimiento] = useState('');
    const [equipo, setEquipo] = useState('');
    const [categoria, setCategoria] = useState('C40');
    const [equipos, setEquipos] = useState([]);

    const [loadingData, setLoadingData] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const CATEGORIA_CHOICES = [
        { value: 'C33', label: 'Categoría C33' },
        { value: 'C40', label: 'Categoría C40' },
        { value: 'C45', label: 'Categoría C45' },
    ];

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                // CAMBIO AQUÍ: Usar API_ENDPOINTS.equipos
                const equiposRes = await axios.get(API_ENDPOINTS.equipos);
                setEquipos(equiposRes.data);

                if (id) {
                    // CAMBIO AQUÍ: Usar API_ENDPOINTS.jugadoresDetail(id)
                    const jugadorRes = await axios.get(API_ENDPOINTS.jugadoresDetail(id));
                    const jugadorData = jugadorRes.data;
                    setNombre(jugadorData.nombre);
                    setApellido(jugadorData.apellido);
                    setCodigoSocio(jugadorData.codigo_socio || '');
                    setDni(jugadorData.dni || '');
                    setFechaNacimiento(jugadorData.fecha_nacimiento || '');
                    setEquipo(jugadorData.equipo);
                    setCategoria(jugadorData.categoria || 'C40');
                } else {
                    if (equiposRes.data.length > 0) {
                        setEquipo(equiposRes.data[0].id_equipo);
                    }
                }
                setLoadingData(false);
            } catch (err) {
                console.error("Error al cargar datos iniciales o del jugador:", err);
                setError(err.response ? err.response.data : { detail: "Error al cargar equipos o datos del jugador. Asegúrate de tener datos de equipos." });
                setLoadingData(false);
            }
        };
        fetchInitialData();
    }, [id]); // Asegúrate de que [id] es la única dependencia si no hay otras necesarias para evitar bucles.

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        if (equipos.length === 0 && !id) {
            setError({ detail: "Asegúrate de tener al menos un equipo antes de añadir un jugador." });
            return;
        }

        const playerData = {
            nombre,
            apellido,
            codigo_socio: codigoSocio,
            dni: dni || null,
            fecha_nacimiento: fechaNacimiento || null,
            equipo,
            categoria,
        };

        try {
            let response;
            if (id) {
                // CAMBIO AQUÍ: Usar API_ENDPOINTS.jugadoresDetail(id) para PATCH
                response = await axios.patch(API_ENDPOINTS.jugadoresDetail(id), playerData);
                console.log('Jugador actualizado:', response.data);
                setSuccess(true);
            } else {
                // CAMBIO AQUÍ: Usar API_ENDPOINTS.jugadores para POST
                response = await axios.post(API_ENDPOINTS.jugadores, playerData);
                console.log('Jugador creado:', response.data);
                setSuccess(true);
                // Limpiar campos del formulario después de una creación exitosa
                setNombre('');
                setApellido('');
                setCodigoSocio('');
                setDni('');
                setFechaNacimiento('');
                setEquipo(equipos.length > 0 ? equipos[0].id_equipo : '');
                setCategoria('C40');
            }

            setTimeout(() => {
                navigate('/jugadores');
            }, 1500);
        } catch (err) {
            console.error('Error al guardar jugador:', err.response ? err.response.data : err.message);
            setError(err.response ? err.response.data : { detail: 'Error desconocido al guardar el jugador.' });
        }
    };

    if (loadingData) {
        return <Typography>Cargando datos para el formulario de jugadores...</Typography>;
    }

    const formDisabled = equipos.length === 0 && !id;

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 800, mx: 'auto', p: 2 }}>
            <Typography variant="h4" component="h2" gutterBottom sx={{ mb: 4 }}>
                {id ? 'Editar Jugador' : 'Añadir Nuevo Jugador'}
            </Typography>

            <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        id="nombre"
                        label="Nombre"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        required
                        disabled={formDisabled}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        id="apellido"
                        label="Apellido"
                        value={apellido}
                        onChange={(e) => setApellido(e.target.value)}
                        required
                        disabled={formDisabled}
                    />
                </Grid>

                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        id="codigoSocio"
                        label="Código de Socio"
                        value={codigoSocio}
                        onChange={(e) => setCodigoSocio(e.target.value)}
                        required
                        disabled={formDisabled}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        id="dni"
                        label="DNI (opcional)"
                        value={dni}
                        onChange={(e) => setDni(e.target.value)}
                        disabled={formDisabled}
                    />
                </Grid>

                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        type="date"
                        id="fechaNacimiento"
                        label="Fecha de Nacimiento (opcional)"
                        value={fechaNacimiento}
                        onChange={(e) => setFechaNacimiento(e.target.value)}
                        disabled={formDisabled}
                        InputLabelProps={{ shrink: true }}
                    />
                </Grid>

                <Grid item xs={12} sm={6}>
                    <FormControl fullWidth required disabled={formDisabled}>
                        <InputLabel id="categoria-label">Categoría del Jugador</InputLabel>
                        <Select
                            labelId="categoria-label"
                            id="categoria"
                            value={categoria}
                            label="Categoría del Jugador"
                            onChange={(e) => setCategoria(e.target.value)}
                        >
                            {CATEGORIA_CHOICES.map((cat) => (
                                <MenuItem key={cat.value} value={cat.value}>
                                    {cat.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>

                <Grid item xs={12}>
                    {equipos.length > 0 ? (
                        <FormControl fullWidth required disabled={formDisabled}>
                            <InputLabel id="equipo-label">Equipo</InputLabel>
                            <Select
                                labelId="equipo-label"
                                id="equipo"
                                value={equipo}
                                label="Equipo"
                                onChange={(e) => setEquipo(e.target.value)}
                            >
                                {equipos.map((eq) => (
                                    <MenuItem key={eq.id_equipo} value={eq.id_equipo}>
                                        {eq.nombre} ({eq.categoria})
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    ) : (
                        <Alert severity="warning">No hay equipos disponibles. Por favor, añade un equipo primero.</Alert>
                    )}
                </Grid>

                <Grid item xs={12}>
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={formDisabled}
                        sx={{ mt: 2, mr: 2 }}
                    >
                        {id ? 'Guardar Cambios' : 'Añadir Jugador'}
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={() => navigate('/jugadores')}
                        sx={{ mt: 2 }}
                    >
                        Cancelar
                    </Button>
                </Grid>
            </Grid>

            {success && (
                <Alert severity="success" sx={{ mt: 2 }}>
                    ¡Jugador {id ? 'actualizado' : 'añadido'} exitosamente!
                </Alert>
            )}
            {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                    <Typography variant="body1">Hubo un error:</Typography>
                    {error.nombre && <Typography variant="body2">- Nombre: {error.nombre[0]}</Typography>}
                    {error.apellido && <Typography variant="body2">- Apellido: {error.apellido[0]}</Typography>}
                    {error.codigo_socio && <Typography variant="body2">- Código de Socio: {error.codigo_socio[0]}</Typography>}
                    {error.dni && <Typography variant="body2">- DNI: {error.dni[0]}</Typography>}
                    {error.fecha_nacimiento && <Typography variant="body2">- Fecha Nacimiento: {error.fecha_nacimiento[0]}</Typography>}
                    {error.equipo && <Typography variant="body2">- Equipo: {error.equipo[0]}</Typography>}
                    {error.categoria && <Typography variant="body2">- Categoría: {error.categoria[0]}</Typography>}
                    {error.detail && <Typography variant="body2">- {error.detail}</Typography>}
                </Alert>
            )}
        </Box>
    );
}

export default JugadorForm;