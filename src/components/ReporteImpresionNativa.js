// src/components/ReporteImpresionNativa.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Importa useNavigate
import axios from 'axios';
import { format, parseISO } from 'date-fns';
import {
    Typography, Table, TableBody, TableCell,
    TableHead, TableRow, Container, CircularProgress
} from '@mui/material';

// CSS para impresión (podemos mover esto a un archivo CSS separado después si lo prefieres)
const printStyles = `
@page {
    size: A4 portrait;
    margin: 20mm;
}
body {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    font-family: sans-serif;
}
.no-print {
    display: none !important;
}
table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;
}
th, td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
    font-size: 0.8em;
}
th {
    background-color: #f2f2f2;
}
h1, h2 {
    text-align: center;
    margin-bottom: 10px;
}
`;

function ReporteImpresionNativa() {
    const { category } = useParams();
    const navigate = useNavigate(); // Inicializa useNavigate
    const [sancionesToPrint, setSancionesToPrint] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSancionesForPrint = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get('http://127.0.0.1:8000/api/sanciones/');
                let filteredData = response.data;

                if (category && category !== 'todas') {
                    filteredData = filteredData.filter(sancion =>
                        sancion.jugador_detail && sancion.jugador_detail.categoria === category
                    );
                }
                console.log("Datos cargados para impresión nativa:", filteredData);
                setSancionesToPrint(filteredData);
                setLoading(false);
            } catch (err) {
                console.error("Error al cargar sanciones para impresión nativa:", err);
                setError("Error al cargar las sanciones para el reporte de impresión.");
                setLoading(false);
            }
        };
        fetchSancionesForPrint();
    }, [category]);

    useEffect(() => {
        // Este efecto se ejecuta cada vez que 'loading', 'error' o 'sancionesToPrint' cambian.
        // Activamos la impresión solo cuando se han cargado los datos.
        if (!loading && !error) {
            if (sancionesToPrint.length > 0) {
                console.log("Activando ventana de impresión nativa...");
                // Pequeño retraso para asegurar que el DOM esté completamente renderizado
                setTimeout(() => {
                    window.print();
                    // Una vez que la ventana de impresión se abre (o se cierra si el usuario cancela),
                    // podemos volver a la página anterior o a la lista de sanciones.
                    // Usamos un pequeño delay para que la ventana de impresión tenga tiempo de abrirse.
                    setTimeout(() => navigate('/sanciones'), 500); 
                }, 100); 
            } else {
                console.log("No hay datos para imprimir, volviendo a la lista de sanciones.");
                // Si no hay datos, pero ya terminó de cargar, notificamos y volvemos.
                alert("No hay sanciones para imprimir en esta categoría.");
                navigate('/sanciones'); // Volver a la lista de sanciones
            }
        }
    }, [loading, error, sancionesToPrint, navigate]); // Añadir 'navigate' a las dependencias del useEffect

    if (loading) return <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Container>;
    if (error) return <Container sx={{ mt: 4 }}><Typography color="error">{error}</Typography></Container>;
    // No mostrar nada si no hay sanciones, el useEffect ya manejará la navegación
    if (sancionesToPrint.length === 0) return null; 

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            {/* Opcional: Inyecta los estilos de impresión directamente para esta vista */}
            <style>{printStyles}</style>
            <Typography variant="h5" component="h1" gutterBottom align="center">
                Reporte de Sanciones
            </Typography>
            {category && category !== 'todas' && (
                <Typography variant="h6" component="h2" gutterBottom align="center">
                    Categoría: {category}
                </Typography>
            )}
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>Jugador</TableCell>
                        <TableCell>Cód. Socio</TableCell>
                        <TableCell>Equipo</TableCell>
                        <TableCell>Cat.</TableCell>
                        <TableCell>Inicio</TableCell>
                        <TableCell>Fin</TableCell>
                        <TableCell>Desc.</TableCell>
                        <TableCell>Estado</TableCell>
                        <TableCell>Tipo</TableCell>
                        <TableCell>Cant. Fechas</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {sancionesToPrint.map((sancion) => (
                        <TableRow key={sancion.id_sancion}>
                            <TableCell>{sancion.jugador_detail ? `${sancion.jugador_detail.nombre} ${sancion.jugador_detail.apellido}` : 'N/A'}</TableCell>
                            <TableCell>{sancion.jugador_detail ? sancion.jugador_detail.codigo_socio : 'N/A'}</TableCell>
                            <TableCell>{sancion.jugador_detail ? sancion.jugador_detail.equipo_nombre : 'N/A'}</TableCell>
                            <TableCell>{sancion.jugador_detail ? sancion.jugador_detail.categoria : 'N/A'}</TableCell>
                            <TableCell>{sancion.fecha_inicio ? format(parseISO(sancion.fecha_inicio), 'dd/MM/yyyy') : 'N/A'}</TableCell>
                            <TableCell>{sancion.fecha_fin ? format(parseISO(sancion.fecha_fin), 'dd/MM/yyyy') : 'N/A'}</TableCell>
                            <TableCell>{sancion.descripcion}</TableCell>
                            <TableCell>{sancion.estado_calculado}</TableCell>
                            <TableCell>{sancion.tipo_sancion}</TableCell>
                            <TableCell>{sancion.cantidad_fechas}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Container>
    );
}

export default ReporteImpresionNativa;