import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import Navbar from './components/Navbar';
import MapPage from './pages/MapPage';
import ReportsPage from './pages/ReportsPage';

// Create a light theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Navbar></Navbar>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          
          <main style={{ flexGrow: 1 }}>
            <Routes>
              <Route path="/" element={<MapPage />} />
              <Route path="/reports" element={<ReportsPage />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
