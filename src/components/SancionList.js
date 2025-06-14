import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom'; // Asegúrate de importar Link si lo usas con Button
import { format, parseISO, addDays } from 'date-fns'; // Importa addDays para calcular fechas de alerta
import { es } from 'date-fns/locale'; // Para formatear fechas en español si es necesario

import {
    Container, TextField, Button, Typography, Box, MenuItem,
    FormControl, InputLabel, Select, Checkbox, FormControlLabel,
    Grid, Paper, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, IconButton, Chip, CircularProgress // Asegúrate de CircularProgress
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import PrintIcon from '@mui/icons-material/Print'; // Importa el icono de imprimir

function SancionList() {
    const [sanciones, setSanciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('todas'); // Estado para el filtro de categoría, 'todas' por defecto
    const [categories, setCategories] = useState([]); // Nuevo estado para almacenar las categorías únicas
    const navigate = useNavigate();

    useEffect(() => {
        fetchSancionesAndCategories();
    }, []); // Sin dependencias para que se ejecute solo una vez al montar

    const fetchSancionesAndCategories = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get('http://127.00.1:8000/api/sanciones/');
            const fetchedSanciones = response.data;

            // Calcular el estado de las sanciones (cumplida, activa, pendiente, etc.)
            const sancionesConEstadoCalculado = fetchedSanciones.map(sancion => {
                const hoy = new Date();
                let estado_calculado = sancion.estado; // Estado base del backend
                let fechas_restantes = null;

                if (sancion.fecha_inicio && sancion.cantidad_fechas !== null && sancion.cantidad_fechas !== undefined) {
                    const fechaInicio = parseISO(sancion.fecha_inicio);
                    const fechaFinCalculada = addDays(fechaInicio, sancion.cantidad_fechas); // Suma los días a la fecha de inicio

                    // Si la sanción tiene 'tipo_sancion' y 'doble_amarilla_pagada'
                    if (sancion.tipo_sancion === 'Doble Amarilla' && sancion.doble_amarilla_pagada) {
                        estado_calculado = 'Pagada'; // Si es Doble Amarilla y ya pagada, se considera pagada
                    } else if (hoy > fechaFinCalculada) {
                        estado_calculado = 'Cumplida';
                    } else if (hoy >= fechaInicio && hoy <= fechaFinCalculada) {
                        estado_calculado = 'Activa';
                        // Calcular fechas restantes
                        const diffTime = fechaFinCalculada.getTime() - hoy.getTime();
                        fechas_restantes = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Días restantes
                    } else if (hoy < fechaInicio) {
                        estado_calculado = 'Pendiente';
                    }
                } else if (sancion.tipo_sancion === 'Doble Amarilla' && sancion.doble_amarilla_pagada) {
                    // Caso donde es Doble Amarilla pero sin fechas o fechas_inicio, solo por si acaso
                    estado_calculado = 'Pagada';
                }

                return { ...sancion, estado_calculado, fechas_restantes };
            });

            setSanciones(sancionesConEstadoCalculado);

            // Extraer categorías únicas de las sanciones
            const uniqueCategories = [
                ...new Set(fetchedSanciones // Usar las sanciones originales para obtener categorías
                    .map(sancion => sancion.jugador_detail?.categoria)
                    .filter(Boolean) // Filtrar null/undefined
                )
            ].sort(); // Ordenar alfabéticamente

            setCategories(['todas', ...uniqueCategories]); // Añadir 'todas' al inicio
            setLoading(false);

        } catch (err) {
            console.error("Error al cargar las sanciones:", err);
            setError("Error al cargar las sanciones.");
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("¿Estás seguro de que quieres eliminar esta sanción?")) {
            try {
                await axios.delete(`http://127.0.0.1:8000/api/sanciones/${id}/`);
                alert("Sanción eliminada con éxito!");
                fetchSancionesAndCategories(); // Recargar la lista y categorías
            } catch (error) {
                console.error("Error al eliminar sanción:", error.response ? error.response.data : error);
                alert("Error al eliminar sanción.");
            }
        }
    };

    const getEstadoChipProps = (estado) => {
        switch (estado) {
            case 'Cumplida':
            case 'Pagada': // Asegúrate de que Pagada también sea 'success'
                return { label: estado, color: 'success' };
            case 'Activa':
                return { label: 'Activa', color: 'warning' };
            case 'Pendiente':
                return { label: 'Pendiente', color: 'info' };
            default:
                return { label: estado, color: 'default' };
        }
    };

    // Función de filtrado de sanciones (usando el estado selectedCategory)
    const filteredSanciones = sanciones.filter(sancion => {
        if (selectedCategory === 'todas') { // Si 'todas' está seleccionada, muestra todas
            return true;
        }
        // Asegúrate de que jugador_detail y categoria existan en los datos del backend
        return sancion.jugador_detail && sancion.jugador_detail.categoria === selectedCategory;
    });

    const handlePrint = () => {
        // Navegamos a la nueva ruta para el componente de impresión, pasando la categoría seleccionada
        // La categoría se pasa como parámetro de la URL
        navigate(`/sanciones/reporte-nativo/${selectedCategory}`);
    };

    if (loading) return <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Container>;
    if (error) return <Container sx={{ mt: 4 }}><Typography color="error">{error}</Typography></Container>;

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Listado de Sanciones
            </Typography>

            {/* Controles de filtro y botones de acción */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                {/* Filtro por Categoría */}
                <FormControl sx={{ minWidth: 150 }}>
                    <InputLabel id="category-select-label">Categoría</InputLabel>
                    <Select
                        labelId="category-select-label"
                        id="category-select"
                        value={selectedCategory}
                        label="Categoría"
                        onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                        {/* Genera los MenuItem dinámicamente a partir de las categorías obtenidas */}
                        {categories.map((cat) => (
                            <MenuItem key={cat} value={cat}>
                                {cat === 'todas' ? 'Todas' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {/* Botones de acción */}
                <Box>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={() => navigate('/sanciones/nuevo')}
                        sx={{ mr: 1 }}
                    >
                        Añadir Sanción
                    </Button>
                    <Button
                        variant="contained"
                        color="secondary"
                        startIcon={<PrintIcon />}
                        onClick={handlePrint}
                        disabled={filteredSanciones.length === 0 && selectedCategory !== 'todas'} // Deshabilita si no hay sanciones filtradas
                    >
                        Imprimir
                    </Button>
                </Box>
            </Box>

            {filteredSanciones.length === 0 && selectedCategory !== 'todas' ? (
                 <Typography>No hay sanciones disponibles para la categoría "{selectedCategory}".</Typography>
            ) : filteredSanciones.length === 0 && selectedCategory === 'todas' ? (
                 <Typography>No hay sanciones registradas en el sistema.</Typography>
            ) : (
                <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 650 }} aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell>Jugador</TableCell>
                                <TableCell>Cód. Socio</TableCell>
                                <TableCell>Equipo</TableCell>
                                <TableCell>Categoría</TableCell>
                                <TableCell>Resolución</TableCell>
                                <TableCell>Fecha Inicio</TableCell>
                                <TableCell>Fecha Fin</TableCell>
                                <TableCell>Descripción</TableCell>
                                <TableCell>Estado</TableCell>
                                <TableCell>Tipo Sanción</TableCell>
                                <TableCell>Doble Amarilla Pagada</TableCell>
                                <TableCell>Fecha Pago D.A.</TableCell>
                                <TableCell>Cantidad Fechas</TableCell>
                                <TableCell>Alerta Sanción</TableCell>
                                <TableCell align="right">Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredSanciones.map((sancion) => (
                                <TableRow key={sancion.id_sancion}>
                                    <TableCell>{sancion.jugador_detail ? `${sancion.jugador_detail.nombre} ${sancion.jugador_detail.apellido}` : 'N/A'}</TableCell>
                                    <TableCell>{sancion.jugador_detail ? sancion.jugador_detail.codigo_socio : 'N/A'}</TableCell>
                                    <TableCell>{sancion.jugador_detail ? sancion.jugador_detail.equipo_nombre : 'N/A'}</TableCell>
                                    <TableCell>{sancion.jugador_detail ? sancion.jugador_detail.categoria : 'N/A'}</TableCell>
                                    <TableCell>{sancion.resolucion_detail ? sancion.resolucion_detail.numero_resolucion : 'N/A'}</TableCell>
                                    <TableCell>{sancion.fecha_inicio ? format(parseISO(sancion.fecha_inicio), 'dd/MM/yyyy') : 'N/A'}</TableCell>
                                    <TableCell>{sancion.fecha_fin ? format(parseISO(sancion.fecha_fin), 'dd/MM/yyyy') : 'N/A'}</TableCell>
                                    <TableCell>{sancion.descripcion}</TableCell>
                                    <TableCell>
                                        <Chip {...getEstadoChipProps(sancion.estado_calculado)} />
                                    </TableCell>
                                    <TableCell>{sancion.tipo_sancion}</TableCell>
                                    <TableCell>{sancion.doble_amarilla_pagada ? 'Sí' : 'No'}</TableCell>
                                    <TableCell>{sancion.fecha_pago_doble_amarilla ? format(parseISO(sancion.fecha_pago_doble_amarilla), 'dd/MM/yyyy') : 'N/A'}</TableCell>
                                    <TableCell>{sancion.cantidad_fechas}</TableCell>
                                    <TableCell>
                                        {sancion.estado_calculado === 'Activa' && sancion.fechas_restantes !== null && sancion.fechas_restantes > 0 && (
                                            <>
                                                {sancion.fechas_restantes <= 2 && ( // Alerta para 1 o 2 fechas restantes
                                                    <Chip
                                                        label={`¡Faltan ${sancion.fechas_restantes} fechas!`}
                                                        color="warning"
                                                        size="small"
                                                        sx={{ mr: 1 }}
                                                    />
                                                )}
                                                {sancion.fechas_restantes === 1 && ( // Alerta específica para la última fecha
                                                    <Typography variant="body2" color="error" sx={{ fontWeight: 'bold' }}>
                                                        ¡ÚLTIMA FECHA!
                                                    </Typography>
                                                )}
                                            </>
                                        )}
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton onClick={() => navigate(`/sanciones/editar/${sancion.id_sancion}`)} color="primary">
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton onClick={() => handleDelete(sancion.id_sancion)} color="error">
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Container>
    );
}

export default SancionList;