// E:\LAS_FUTBOL25\tribunal_frontend_react\src\components\EquipoForm.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Importar componentes de Material-UI
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';

function EquipoForm() {
    const [nombre, setNombre] = useState('');
    const [categoria, setCategoria] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    // Las categorías las obtenemos del modelo de Django.
    // En un caso real, podríamos tener un endpoint para obtener estas choices
    // o un componente específico para categorías. Por ahora, las hardcodeamos aquí
    // ya que coinciden con tu `models.py`.
    const CATEGORIA_CHOICES = [
        { value: 'C33', label: 'Categoría C33' },
        { value: 'C40', label: 'Categoría C40' },
        { value: 'C45', label: 'Categoría C45' },
    ];

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError(null);
        setSuccess(false);

        if (!nombre || !categoria) {
            setError('Todos los campos son obligatorios.');
            return;
        }

        try {
            const response = await axios.post('http://localhost:8000/api/equipos/', {
                nombre: nombre,
                categoria: categoria,
            });
            console.log('Equipo creado:', response.data);
            setSuccess(true);
            setNombre(''); // Limpiar formulario
            setCategoria('');
            // Opcional: Redirigir a la lista de equipos o mostrar un mensaje
            // navigate('/equipos');
        } catch (err) {
            console.error('Error al crear equipo:', err.response?.data || err.message);
            setError('Error al crear equipo: ' + (err.response?.data?.nombre || err.response?.data?.categoria || err.message));
        }
    };

    return (
        <Box
            component="form"
            sx={{
                '& .MuiTextField-root': { m: 1, width: '25ch' },
                p: 3,
                border: '1px solid #ccc',
                borderRadius: '8px',
                maxWidth: 600,
                mx: 'auto',
                mt: 4,
            }}
            noValidate
            autoComplete="off"
            onSubmit={handleSubmit}
        >
            <Typography variant="h5" component="h2" gutterBottom>
                Añadir Nuevo Equipo
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>Equipo añadido exitosamente!</Alert>}

            <div>
                <TextField
                    required
                    id="nombre-equipo"
                    label="Nombre del Equipo"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    variant="outlined"
                />
                <FormControl required sx={{ m: 1, minWidth: 200 }}>
                    <InputLabel id="categoria-label">Categoría</InputLabel>
                    <Select
                        labelId="categoria-label"
                        id="categoria"
                        value={categoria}
                        label="Categoría"
                        onChange={(e) => setCategoria(e.target.value)}
                    >
                        <MenuItem value="">
                            <em>Seleccionar Categoría</em>
                        </MenuItem>
                        {CATEGORIA_CHOICES.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </div>
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button variant="contained" color="primary" type="submit">
                    Guardar Equipo
                </Button>
                <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => navigate('/sanciones')} // Volver a la lista de sanciones
                    sx={{ ml: 2 }}
                >
                    Cancelar
                </Button>
            </Box>
        </Box>
    );
}

export default EquipoForm;