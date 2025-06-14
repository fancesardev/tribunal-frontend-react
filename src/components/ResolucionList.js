import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
// Importar componentes de Material-UI
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';

function ResolucionList() {
  const [resoluciones, setResoluciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResoluciones = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/resoluciones/');
        setResoluciones(response.data);
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    };

    fetchResoluciones();
  }, []);

  if (loading) {
    return <p>Cargando resoluciones...</p>;
  }

  if (error) {
    return <p>Error al cargar las resoluciones: {error.message}</p>;
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" component="h2" gutterBottom>
        Listado de Resoluciones
      </Typography>

      <Button
        component={Link}
        to="/resoluciones/nuevo"
        variant="contained"
        color="primary"
        sx={{ mb: 3 }}
      >
        Añadir Nueva Resolución
      </Button>

      {resoluciones.length === 0 ? (
        <Alert severity="info">No hay resoluciones registradas.</Alert>
      ) : (
        <TableContainer component={Paper} sx={{ mt: 3 }}>
          <Table sx={{ minWidth: 650 }} aria-label="tabla de resoluciones">
            <TableHead>
              <TableRow>
                <TableCell>ID Resolución</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell>Descripción</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {resoluciones.map((resolucion) => (
                <TableRow
                  key={resolucion.id_resolucion}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {resolucion.id_resolucion}
                  </TableCell>
                  <TableCell>{resolucion.fecha}</TableCell>
                  <TableCell>{resolucion.descripcion}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}

export default ResolucionList;