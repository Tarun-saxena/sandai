import { useState, useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import "./MapPage.css";

const MapPage = () => {
  const [samples, setSamples] = useState([]);
  const [grainCategory, setGrainCategory] = useState("All");

  const categories = [
    { label: "All", value: "All" },
    { label: "Fine (< 0.25mm)", value: "Fine" },
    { label: "Medium (0.25-0.5mm)", value: "Medium" },
    { label: "Coarse (> 0.5mm)", value: "Coarse" },
  ];

  useEffect(() => {
    const fetchSamples = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/sand-samples");
        setSamples(response.data);
      } catch (error) {
        console.error("Error fetching sand samples:", error);
      }
    };

    fetchSamples();
  }, []);

  // Filter logic
  const filteredSamples =
    grainCategory === "All"
      ? samples
      : samples.filter((sample) => sample.category === grainCategory);

  return (
    <div className="map-page">
      {/* Sidebar */}
      <div className="sidebar">
        <h2>Filters</h2>

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
            fillColor="#ff7800"
            color="#000"
            weight={1}
            opacity={1}
            fillOpacity={0.8}
          >
            <Popup>
              <div className="popup-card">
                <img
                  src={sample.imageURL}
                  alt="Sand sample"
                  className="popup-image"
                />
                <h3>Sand Sample</h3>
                <p><strong>Diameter:</strong> {sample.diameter}mm</p>
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
