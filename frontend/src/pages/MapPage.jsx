import { useState, useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import "./MapPage.css";

const MapPage = () => {
  const [samples, setSamples] = useState([]);
  const [grainCategory, setGrainCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const categories = [
    { label: "All", value: "All" },
    { label: "Fine (< 0.25mm)", value: "Fine" },
    { label: "Medium (0.25-0.5mm)", value: "Medium" },
    { label: "Coarse (> 0.5mm)", value: "Coarse" },
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

  // Filter logic with proper diameter categorization
  const getCategoryFromDiameter = (diameter) => {
    if (diameter < 0.25) return "Fine";
    if (diameter >= 0.25 && diameter < 0.5) return "Medium";
    if (diameter >= 0.5) return "Coarse";
    return "All";
  };

  const filteredSamples =
    grainCategory === "All"
      ? samples
      : samples.filter((sample) => getCategoryFromDiameter(sample.diameter) === grainCategory);

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

        {/* Grain Size Category */}
        <div className="filter-group">
          <p className="filter-label">Grain Size Category</p>
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
                <h3>Sand Sample Details</h3>
                <p><strong>Location:</strong> {sample.latitude.toFixed(4)}°, {sample.longitude.toFixed(4)}°</p>
                <p><strong>Diameter:</strong> {sample.diameter}mm</p>
                <p><strong>Category:</strong> {getCategoryFromDiameter(sample.diameter)}</p>
                <p><strong>Description:</strong> {sample.description}</p>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapPage;
