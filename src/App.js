import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';

import SancionList from './components/SancionList';
import SancionForm from './components/SancionForm';
import JugadorList from './components/JugadorList';
import JugadorForm from './components/JugadorForm';
import ResolucionList from './components/ResolucionList';
import ResolucionForm from './components/ResolucionForm';
import EquipoForm from './components/EquipoForm';
// import SancionPrintableReport from './components/SancionPrintableReport'; // <--- ¡Comenta o elimina esta línea!
import ReporteImpresionNativa from './components/ReporteImpresionNativa'; // <--- ¡Añade esta nueva importación!

// Material-UI
import Container from '@mui/material/Container';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import './App.css';

// Importaciones para DatePicker
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

function App() {
  return (
    <>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Router>
          <>
            <CssBaseline />
            <AppBar position="static">
              <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                  Tribunal de Liga
                </Typography>
                <Button color="inherit" component={Link} to="/sanciones">Sanciones</Button>
                <Button color="inherit" component={Link} to="/jugadores">Jugadores</Button>
                <Button color="inherit" component={Link} to="/resoluciones">Resoluciones</Button>
                <Button color="inherit" component={Link} to="/equipos/nuevo">Añadir Equipo</Button>
              </Toolbar>
            </AppBar>
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
              <Routes>
                <Route path="/" element={<SancionList />} />
                <Route path="/sanciones" element={<SancionList />} />
                <Route path="/sanciones/nuevo" element={<SancionForm />} />
                <Route path="/sanciones/editar/:id" element={<SancionForm />} />
                {/* <Route path="/sanciones/imprimir/:category" element={<SancionPrintableReport />} /> */}
                {/* <--- ¡NUEVA RUTA PARA EL REPORTE IMPRIMIBLE NATIVO! */}
                <Route path="/sanciones/reporte-nativo/:category" element={<ReporteImpresionNativa />} /> 
                <Route path="/jugadores" element={<JugadorList />} />
                <Route path="/jugadores/nuevo" element={<JugadorForm />} />
                <Route path="/jugadores/edit/:id" element={<JugadorForm />} />
                <Route path="/resoluciones" element={<ResolucionList />} />
                <Route path="/resoluciones/nuevo" element={<ResolucionForm />} />
                <Route path="/resoluciones/edit/:id" element={<ResolucionForm />} /> {/* Nueva ruta para edición */}
                <Route path="/equipos/nuevo" element={<EquipoForm />} />
              </Routes>
            </Container>
          </>
        </Router>
      </LocalizationProvider>
    </>
  );
}

export default App;