// E:\LAS_FUTBOL25\tribunal_frontend_react\src\components\JugadorList.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

// Importar componentes de Material-UI
import {
    Container,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    Box,
    CircularProgress, // Para indicar carga
    Alert, // Para mostrar errores
    Dialog, // Para la confirmación de borrado
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { API_ENDPOINTS } from '../config/api';

function JugadorList() {
    const [jugadores, setJugadores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openDialog, setOpenDialog] = useState(false); // Estado para el diálogo de confirmación
    const [jugadorToDelete, setJugadorToDelete] = useState(null); // Estado para el jugador a borrar

    const navigate = useNavigate();

    const fetchJugadores = async () => {
        try {
            // Utilizamos el endpoint de jugadores, que gracias al JugadorSerializer
            // ya incluye equipo_nombre y categoria del jugador.
            // En JugadorList.js
            const response = await axios.get("http://127.0.0.1:8000/api/jugadores/");
            setJugadores(response.data);
            setLoading(false);
        } catch (err) {
            console.error("Error al cargar jugadores:", err);
            setError("Error al cargar los jugadores.");
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJugadores();
    }, []);

    const handleDeleteClick = (jugadorId) => {
        setJugadorToDelete(jugadorId);
        setOpenDialog(true);
    };

    const handleConfirmDelete = async () => {
        setOpenDialog(false);
        if (jugadorToDelete) {
            try {
                await axios.delete(`http://localhost:8000/api/jugadores/${jugadorToDelete}/`);
                // Actualizar la lista de jugadores después de borrar
                setJugadores(jugadores.filter(j => j.id_jugador !== jugadorToDelete));
                setJugadorToDelete(null);
            } catch (err) {
                console.error("Error al borrar jugador:", err);
                setError("Error al borrar el jugador.");
            }
        }
    };

    const handleCancelDelete = () => {
        setOpenDialog(false);
        setJugadorToDelete(null);
    };

    const handleEditClick = (jugadorId) => {
        navigate(`/jugadores/edit/${jugadorId}`);
    };

    if (loading) {
        return (
            <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress />
                <Typography variant="h6" sx={{ ml: 2 }}>Cargando jugadores...</Typography>
            </Container>
        );
    }

    if (error) {
        return (
            <Container sx={{ mt: 4 }}>
                <Alert severity="error">{error}</Alert>
            </Container>
        );
    }

    return (
        <Container sx={{ mt: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h2">
                    Listado de Jugadores
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    component={Link}
                    to="/jugadores/add"
                >
                    Añadir Nuevo Jugador
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell>ID Jugador</TableCell>
                            <TableCell>Cód. Socio</TableCell> {/* Cambiado a Cód. Socio */}
                            <TableCell>Apellido</TableCell>
                            <TableCell>Nombre</TableCell>
                            <TableCell>DNI</TableCell>
                            <TableCell>Fecha Nac.</TableCell>
                            <TableCell>Categoría</TableCell> {/* Añadida Categoría del Jugador */}
                            <TableCell>Equipo</TableCell> {/* Ahora mostrará el nombre del equipo */}
                            <TableCell align="center">Acciones</TableCell> {/* Columna para botones de acción */}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {jugadores.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} align="center">No hay jugadores registrados.</TableCell>
                            </TableRow>
                        ) : (
                            jugadores.map((jugador) => (
                                <TableRow
                                    key={jugador.id_jugador}
                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                >
                                    <TableCell component="th" scope="row">
                                        {jugador.id_jugador}
                                    </TableCell>
                                    <TableCell>{jugador.codigo_socio || 'N/A'}</TableCell> {/* Usar codigo_socio */}
                                    <TableCell>{jugador.apellido}</TableCell>
                                    <TableCell>{jugador.nombre}</TableCell>
                                    <TableCell>{jugador.dni || 'N/A'}</TableCell>
                                    <TableCell>{jugador.fecha_nacimiento || 'N/A'}</TableCell>
                                    <TableCell>{jugador.categoria || 'N/A'}</TableCell> {/* Mostrar categoría del jugador */}
                                    <TableCell>{jugador.equipo_nombre || 'N/A'}</TableCell> {/* Usar equipo_nombre */}
                                    <TableCell align="center">
                                        <Button
                                            variant="outlined"
                                            color="info"
                                            size="small"
                                            startIcon={<EditIcon />}
                                            onClick={() => handleEditClick(jugador.id_jugador)}
                                            sx={{ mr: 1 }}
                                        >
                                            Editar
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            color="error"
                                            size="small"
                                            startIcon={<DeleteIcon />}
                                            onClick={() => handleDeleteClick(jugador.id_jugador)}
                                        >
                                            Borrar
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Diálogo de Confirmación para Borrar */}
            <Dialog
                open={openDialog}
                onClose={handleCancelDelete}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">{"Confirmar Borrado"}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        ¿Estás seguro de que quieres borrar este jugador? Esta acción no se puede deshacer.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelDelete} color="primary">
                        Cancelar
                    </Button>
                    <Button onClick={handleConfirmDelete} color="error" autoFocus>
                        Borrar
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}

export default JugadorList;