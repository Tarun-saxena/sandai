import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import MapPage from './pages/MapPage';
import ReportsPage from './pages/ReportsPage';
import DataPage from './pages/DataPage';
import AboutPage from './pages/AboutPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<MapPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/data" element={<DataPage />} />
            <Route path="/about" element={<AboutPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
