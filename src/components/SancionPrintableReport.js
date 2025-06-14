import React, { useRef, useState, useEffect, useCallback } from 'react'; // Asegúrate de importar useCallback
import { useReactToPrint } from 'react-to-print';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import {
    Typography, Box, Paper, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, Container,
    CircularProgress, Button
} from '@mui/material';

const printStyles = `
  @page {
    size: A4 portrait;
    margin: 20mm;
  }
  body {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  .no-print {
      display: none !important;
  }
  .print-only {
      display: block !important;
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

function SancionPrintableReport() {
    const componentRef = useRef();
    const { category } = useParams();
    const [sancionesToPrint, setSancionesToPrint] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [contentReady, setContentReady] = useState(false);

    useEffect(() => {
        const fetchSancionesForPrint = async () => {
            setLoading(true);
            setError(null);
            setContentReady(false); 
            try {
                const response = await axios.get('http://127.0.0.1:8000/api/sanciones/');
                let filteredData = response.data;

                if (category && category !== 'todas') {
                    filteredData = filteredData.filter(sancion =>
                        sancion.jugador_detail && sancion.jugador_detail.categoria === category
                    );
                }
                console.log("Sanciones obtenidas de la API y filtradas (antes de setSancionesToPrint):", filteredData);
                setSancionesToPrint(filteredData);
                setLoading(false);
                // Si tenemos datos, marcamos el contenido como listo después de un pequeño delay
                // para asegurarnos de que el DOM se ha actualizado
                if (filteredData.length > 0) {
                    setTimeout(() => {
                        setContentReady(true);
                        console.log("Contenido marcado como listo para imprimir.");
                    }, 100); 
                } else {
                    setContentReady(true);
                }
            } catch (err) {
                console.error("Error al cargar sanciones para imprimir:", err);
                setError("Error al cargar las sanciones para el reporte.");
                setLoading(false);
                setContentReady(true);
            }
        };
        fetchSancionesForPrint();
    }, [category]);

    // **CORRECCIÓN CLAVE:** Este es el patrón correcto para useReactToPrint con useCallback
    // La función que se pasa a useReactToPrint como 'content' es un callback que se ejecuta cuando se imprime.
    // La función 'handlePrint' resultante del hook useReactToPrint es la que se usa en el onClick.
    const handlePrint = useReactToPrint({
        content: useCallback(() => { // Envuelve el content *dentro* de useReactToPrint con useCallback
            console.log("content callback: Accediendo a componentRef.current:", componentRef.current);
            if (!componentRef.current) {
                console.error("content callback: componentRef.current es NULL o UNDEFINED.");
            }
            return componentRef.current;
        }, []), // Las dependencias del useCallback de 'content' generalmente están vacías si componentRef es un useRef
        documentTitle: `Reporte_Sanciones_${category === 'todas' ? 'Todas' : category}`,
        pageStyle: printStyles,
        onAfterPrint: () => console.log("Impresión finalizada"),
        removeAfterPrint: true, 
    });


    if (loading) return <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Container>;
    if (error) return <Container sx={{ mt: 4 }}><Typography color="error">{error}</Typography></Container>;
    
    if (sancionesToPrint.length === 0) {
        console.log("No hay sanciones para imprimir en la lista filtrada.");
        return <Container sx={{ mt: 4 }}><Typography>No hay sanciones para imprimir en esta categoría.</Typography></Container>;
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ mb: 2 }} className="no-print">
                <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={handlePrint}
                    disabled={!contentReady} 
                >
                    {contentReady ? 'Imprimir Reporte' : 'Cargando para imprimir...'}
                </Button>
            </Box>

            {contentReady && sancionesToPrint.length > 0 && ( 
                // Eliminados los espacios en blanco entre las etiquetas <td>, <tr>, <table>
                // para evitar la advertencia de 'Whitespace text nodes'.
                <div ref={componentRef} style={{ padding: '10mm' }}>
                    <Typography variant="h5" component="h1" gutterBottom align="center">
                        Reporte de Sanciones
                    </Typography>
                    {category && category !== 'todas' && (
                        <Typography variant="h6" component="h2" gutterBottom align="center">
                            Categoría: {category}
                        </Typography>
                    )}
                    <TableContainer component={Paper} elevation={0} sx={{ border: 'none' }}>
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
                    </TableContainer>
                </div>
            )}
        </Container>
    );
}

export default SancionPrintableReport;