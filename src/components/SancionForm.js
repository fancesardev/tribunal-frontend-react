import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { format, parseISO, addWeeks } from 'date-fns';
import {
    Container, TextField, Button, Typography, Box, MenuItem,
    FormControl, InputLabel, Select, Checkbox, FormControlLabel,
    Grid
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { API_ENDPOINTS } from '../config/api';

function SancionForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [jugadores, setJugadores] = useState([]);
    const [resoluciones, setResoluciones] = useState([]);
    const [formData, setFormData] = useState({
        jugador: '',
        resolucion: '',
        fecha_inicio: null,
        descripcion: '',
        // estado: 'Pendiente', // Mantener esto en el estado local para el UI si es necesario, pero NO enviarlo si Django lo calcula
        tipo_sancion: '',
        doble_amarilla_pagada: false,
        fecha_pago_doble_amarilla: null,
        cantidad_fechas: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [calculatedFechaFin, setCalculatedFechaFin] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            console.log("SancionForm - useEffect principal (id):", id); // Depuración
            try {
                await fetchInitialData();
                if (id) {
                    await fetchSancionData(id);
                } else {
                    setLoading(false);
                }
            } catch (err) {
                console.error("Error en la carga inicial:", err);
                setError("Error al cargar los datos.");
                setLoading(false);
            }
        };
        loadData();
    }, [id]);

    useEffect(() => {
        const { fecha_inicio, cantidad_fechas, tipo_sancion } = formData;
        console.log("SancionForm - useEffect de cálculo de fecha_fin:"); // Depuración
        console.log("   fecha_inicio:", fecha_inicio); // Depuración
        console.log("   cantidad_fechas:", cantidad_fechas); // Depuración
        console.log("   tipo_sancion:", tipo_sancion); // Depuración

        if (
            (tipo_sancion === 'Provisorio' || tipo_sancion === 'Definitiva') &&
            fecha_inicio instanceof Date && !isNaN(fecha_inicio.getTime()) &&
            typeof cantidad_fechas === 'number' && cantidad_fechas > 0
        ) {
            try {
                const newFechaFin = addWeeks(fecha_inicio, cantidad_fechas);
                setCalculatedFechaFin(newFechaFin);
                console.log("   Fecha de Fin CALCULADA:", newFechaFin); // Depuración
            } catch (calcError) {
                console.error("Error al calcular newFechaFin con addWeeks:", calcError); // Depuración
                setCalculatedFechaFin(null);
            }
        } else {
            setCalculatedFechaFin(null);
            console.log("   Condiciones para calcular fecha_fin NO CUMPLIDAS."); // Depuración
        }
    }, [formData.fecha_inicio, formData.cantidad_fechas, formData.tipo_sancion]); // Quité formData completo para evitar loops si no es estrictamente necesario

    const fetchInitialData = async () => {
        try {
            const jugadoresRes = await axios.get('http://127.0.0.1:8000/api/jugadores/');
            setJugadores(jugadoresRes.data);
            const resolucionesRes = await axios.get('http://127.0.0.1:8000/api/resoluciones/');
            setResoluciones(resolucionesRes.data);
        } catch (error) {
            console.error("Error al cargar datos iniciales:", error);
        }
    };

    const fetchSancionData = async (sancionId) => {
        console.log("SancionForm - fetchSancionData para ID:", sancionId); // Depuración
        try {
            const response = await axios.get(`http://127.0.0.1:8000/api/sanciones/${sancionId}/`);
            const data = response.data;

            console.log("   Datos de sanción recibidos del backend:", data); // Depuración

            setFormData({
                jugador: data.jugador,
                resolucion: data.resolucion || '', // Si es null, se convierte a string vacío para el Select
                fecha_inicio: data.fecha_inicio ? parseISO(data.fecha_inicio) : null,
                descripcion: data.descripcion,
                // No establecemos 'estado' del backend en el estado local si es un campo calculado por Django
                // Solo si el frontend realmente necesita modificarlo.
                // Si el backend es quien calcula 'estado_calculado', no necesitamos 'estado' aquí para edición.
                tipo_sancion: data.tipo_sancion,
                doble_amarilla_pagada: data.doble_amarilla_pagada || false,
                fecha_pago_doble_amarilla: data.fecha_pago_doble_amarilla ? parseISO(data.fecha_pago_doble_amarilla) : null,
                cantidad_fechas: data.cantidad_fechas || 0,
            });
            // Al cargar, si ya hay una fecha_fin del backend, la mostramos inicialmente
            const parsedFechaFinBackend = data.fecha_fin ? parseISO(data.fecha_fin) : null;
            setCalculatedFechaFin(parsedFechaFinBackend);
            console.log("   Fecha de Fin del Backend (parsed):", parsedFechaFinBackend); // Depuración
            setLoading(false);
        } catch (error) {
            console.error("Error al cargar datos de la sanción:", error);
            setError("Error al cargar los datos de la sanción para edición.");
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        console.log("SancionForm - handleChange:", name, "=", type === 'checkbox' ? checked : value); // Depuración
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleDateChange = (date, name) => {
        console.log("SancionForm - handleDateChange:", name, "=", date); // Depuración
        setFormData(prev => ({
            ...prev,
            [name]: date
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Crear una copia de formData para manipularla antes de enviar
        const dataToSend = { ...formData };

        // Formatear fechas a 'yyyy-MM-dd' o null
        dataToSend.fecha_inicio = dataToSend.fecha_inicio ? format(dataToSend.fecha_inicio, 'yyyy-MM-dd') : null;
        dataToSend.fecha_pago_doble_amarilla = dataToSend.fecha_pago_doble_amarilla ? format(dataToSend.fecha_pago_doble_amarilla, 'yyyy-MM-dd') : null;
        
        // Convertir resolucion a null si es string vacío
        dataToSend.resolucion = dataToSend.resolucion === '' ? null : dataToSend.resolucion;

        // **¡IMPORTANTE!** Eliminar el campo 'estado' del objeto a enviar.
        // Django lo maneja automáticamente con su valor por defecto ('Pendiente')
        // o lo calcula según la lógica de 'estado_calculado' para GET.
        // Si Django espera que no se envíe, enviarlo causa un 400 Bad Request.
        delete dataToSend.estado; 
        
        console.log("SancionForm - handleSubmit - dataToSend final:", dataToSend); // Depuración

        try {
            let response;
            if (id) {
                response = await axios.patch(API_ENDPOINTS.sancionesDetail(id), dataToSend);
                alert("Sanción actualizada con éxito!");
            } else {
                response = await axios.post(API_ENDPOINTS.sanciones, dataToSend);
                alert("Sanción creada con éxito!");
            }
            console.log("Respuesta del servidor:", response.data);
            navigate('/sanciones');
        } catch (error) {
            console.error("Error al guardar sanción:", error.response ? error.response.data : error);
            alert("Error al guardar sanción. Por favor, revisa la consola para más detalles.");
        }
    };

    if (loading) return <Typography>Cargando formulario...</Typography>;
    if (error) return <Typography color="error">{error}</Typography>;

    console.log("SancionForm - Renderizado - calculatedFechaFin:", calculatedFechaFin); // Depuración: Ver el valor justo antes de renderizar

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    {id ? 'Editar Sanción' : 'Añadir Nueva Sanción'}
                </Typography>
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
                    <Grid container spacing={2}>
                        {/* Campo Jugador */}
                        <Grid item xs={12}>
                            <FormControl fullWidth margin="normal">
                                <InputLabel>Jugador</InputLabel>
                                <Select
                                    name="jugador"
                                    value={formData.jugador}
                                    onChange={handleChange}
                                    label="Jugador"
                                    required
                                >
                                    {jugadores.map((jugador) => (
                                        <MenuItem key={jugador.id_jugador} value={jugador.id_jugador}>
                                            {jugador.nombre} {jugador.apellido} ({jugador.equipo_nombre})
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Campo Resolución (AHORA OPCIONAL) */}
                        <Grid item xs={12}>
                            <FormControl fullWidth margin="normal">
                                <InputLabel>Resolución</InputLabel>
                                <Select
                                    name="resolucion"
                                    value={formData.resolucion}
                                    onChange={handleChange}
                                    label="Resolución"
                                    displayEmpty
                                >
                                    <MenuItem value="">
                                        <em>Ninguna</em>
                                    </MenuItem>
                                    {resoluciones.map((resolucion) => (
                                        <MenuItem key={resolucion.id_resolucion} value={resolucion.id_resolucion}>
                                            {resolucion.numero_resolucion}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Fecha de Inicio */}
                        <Grid item xs={12} sm={6}>
                            <DatePicker
                                label="Fecha de Inicio"
                                value={formData.fecha_inicio}
                                onChange={(date) => handleDateChange(date, 'fecha_inicio')}
                                slotProps={{ textField: { fullWidth: true, margin: "normal" } }}
                            />
                        </Grid>

                        {/* Cantidad de Fechas */}
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Cantidad de Fechas"
                                type="number"
                                name="cantidad_fechas"
                                value={formData.cantidad_fechas}
                                onChange={handleChange}
                                fullWidth
                                margin="normal"
                                inputProps={{ min: "0" }}
                            />
                        </Grid>

                        {/* Fecha de Fin (Calculada) - Se muestra si el tipo de sanción lo requiere */}
                        {(formData.tipo_sancion === 'Provisorio' || formData.tipo_sancion === 'Definitiva') && (
                            <Grid item xs={12} sm={6}>
                                <DatePicker
                                    label="Fecha de Fin (Calculada)"
                                    value={calculatedFechaFin}
                                    readOnly={true}
                                    slotProps={{ textField: { fullWidth: true, margin: "normal" } }}
                                />
                            </Grid>
                        )}

                        {/* Campo Descripción */}
                        <Grid item xs={12}>
                            <TextField
                                label="Descripción"
                                name="descripcion"
                                value={formData.descripcion}
                                onChange={handleChange}
                                fullWidth
                                margin="normal"
                                multiline
                                rows={3}
                            />
                        </Grid>

                        {/* Campo Tipo de Sanción */}
                        <Grid item xs={12}>
                            <FormControl fullWidth margin="normal">
                                <InputLabel>Tipo de Sanción</InputLabel>
                                <Select
                                    name="tipo_sancion"
                                    value={formData.tipo_sancion}
                                    onChange={handleChange}
                                    label="Tipo de Sanción"
                                    required
                                >
                                    <MenuItem value="Doble Amarilla">Doble Amarilla</MenuItem>
                                    <MenuItem value="Provisorio">Provisorio</MenuItem>
                                    <MenuItem value="Definitiva">Definitiva</MenuItem>
                                    {/* No hay 'Suspendido', 'Cumplida', 'Activa' para selección de tipo, esos son estados. */}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Campos condicionales para Doble Amarilla */}
                        {formData.tipo_sancion === 'Doble Amarilla' && (
                            <>
                                <Grid item xs={12} sm={6}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={formData.doble_amarilla_pagada}
                                                onChange={handleChange}
                                                name="doble_amarilla_pagada"
                                            />
                                        }
                                        label="Doble Amarilla Pagada"
                                    />
                                </Grid>
                                {formData.doble_amarilla_pagada && (
                                    <Grid item xs={12} sm={6}>
                                        <DatePicker
                                            label="Fecha de Pago Doble Amarilla"
                                            value={formData.fecha_pago_doble_amarilla}
                                            onChange={(date) => handleDateChange(date, 'fecha_pago_doble_amarilla')}
                                            slotProps={{ textField: { fullWidth: true, margin: "normal" } }}
                                        />
                                    </Grid>
                                )}
                            </>
                        )}

                        {/* Botones */}
                        <Grid item xs={12}>
                            <Button type="submit" variant="contained" color="primary" sx={{ mt: 3, mr: 2 }}>
                                {id ? 'Guardar Cambios' : 'Crear Sanción'}
                            </Button>
                            <Button variant="outlined" onClick={() => navigate('/sanciones')} sx={{ mt: 3 }}>
                                Cancelar
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            </Container>
        </LocalizationProvider>
    );
}

export default SancionForm;