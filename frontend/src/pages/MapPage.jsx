import { useState, useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import LocationHistory from "../components/LocationHistory";
import "./MapPage.css";

const MapPage = () => {
  const [samples, setSamples] = useState([]);
  const [grainCategory, setGrainCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);

  const categories = [
    { label: "All", value: "All" },
    { label: "Silt/Clay", value: "Silt/Clay" },
    { label: "Fine Sand", value: "Fine Sand" },
    { label: "Medium Sand", value: "Medium Sand" },
    { label: "Very Coarse Sand", value: "Very Coarse Sand" },
    { label: "Gravel", value: "Gravel" },
  ];

  useEffect(() => {
    const fetchSamples = async () => {
      try {
        setLoading(true);
        const response = await axios.get("https://sandai.onrender.com/api/sand-samples");
        setSamples(response.data);
        setError(null);
      } catch (error) {
        console.error("Error fetching sand samples:", error);
        setError("Failed to fetch sand samples. Please check if the server is running.");
      } finally {
        setLoading(false);
      }
    };

    fetchSamples();
  }, []);

  // Filter logic based on sediment type
  const filteredSamples =
    grainCategory === "All"
      ? samples
      : samples.filter((sample) => sample.sedimentType === grainCategory);

  const handleViewHistory = (latitude, longitude) => {
    setSelectedLocation({ latitude, longitude });
    setShowHistory(true);
  };

  const closeHistory = () => {
    setShowHistory(false);
    setSelectedLocation(null);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading sand sample locations...</p>
      </div>
    );
  }

  return (
    <div className="map-page">
      {/* Sidebar */}
      <div className="sidebar">
        <h2>Filters</h2>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* Sediment Type Category */}
        <div className="filter-group">
          <p className="filter-label">Sediment Type</p>
          <div className="filter-buttons">
            {categories.map((cat) => (
              <button
                key={cat.value}
                className={grainCategory === cat.value ? "active" : ""}
                onClick={() => setGrainCategory(cat.value)}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sample Count */}
        <div className="sample-info">
          <p className="sample-count">
            Showing <strong>{filteredSamples.length}</strong> of <strong>{samples.length}</strong> samples
          </p>
          {grainCategory !== "All" && (
            <p className="filter-info">
              Filtered by: <span className="filter-tag">{grainCategory}</span>
            </p>
          )}
        </div>
      </div>

      {/* Map */}
      <MapContainer
        center={[20, 77]} // Centered on India
        zoom={5}
        className="map-container"
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {filteredSamples.map((sample) => (
          <CircleMarker
            key={sample._id}
            center={[sample.latitude, sample.longitude]}
            radius={8}
            fillColor="#169618ff"
            color="#000"
            weight={1}
            opacity={1}
            fillOpacity={0.8}
          >
            <Popup>
              <div className="popup-card">
                <h3>Grain Size Sample Details</h3>
                <p><strong>Location:</strong> {sample.latitude.toFixed(4)}°, {sample.longitude.toFixed(4)}°</p>
                <p><strong>Grain Count:</strong> {sample.numberOfGrains}</p>
                <p><strong>D50:</strong> {sample.d50.toFixed(3)}mm</p>
                <p><strong>Mean Size:</strong> {sample.dmean.toFixed(3)}mm</p>
                <p><strong>Median Size:</strong> {sample.dmed.toFixed(3)}mm</p>
                <p><strong>Sediment Type:</strong> {sample.sedimentType}</p>
                <p><strong>Date:</strong> {new Date(sample.createdAt).toLocaleDateString()}</p>
                <button 
                  className="history-btn"
                  onClick={() => handleViewHistory(sample.latitude, sample.longitude)}
                >
                  View Location History
                </button>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
      
      {showHistory && selectedLocation && (
        <LocationHistory
          latitude={selectedLocation.latitude}
          longitude={selectedLocation.longitude}
          onClose={closeHistory}
        />
      )}
    </div>
  );
};

export default MapPage;
