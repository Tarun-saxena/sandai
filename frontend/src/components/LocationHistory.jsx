import { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './LocationHistory.css';

const LocationHistory = ({ latitude, longitude, onClose }) => {
  const [historyData, setHistoryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLocationHistory();
  }, [latitude, longitude]);

  const fetchLocationHistory = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`https://sandai.onrender.com/api/sand-samples/location-history`, {
        params: {
          lat: latitude,
          lon: longitude,
          radius: 0.001 // ~100m radius
        }
      });
      setHistoryData(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching location history:', error);
      setError('Failed to fetch location history');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const prepareChartData = () => {
    if (!historyData || !historyData.samples) return [];
    
    return historyData.samples.map((sample, index) => ({
      sample: `Sample ${index + 1}`,
      date: formatDate(sample.createdAt),
      D50: sample.d50,
      Dmean: sample.dmean,
      Dmed: sample.dmed,
      fullDate: sample.createdAt
    }));
  };

  if (loading) {
    return (
      <div className="location-history-modal">
        <div className="location-history-content">
          <div className="loading">Loading location history...</div>
          <button onClick={onClose} className="close-btn">×</button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="location-history-modal">
        <div className="location-history-content">
          <div className="error">{error}</div>
          <button onClick={onClose} className="close-btn">×</button>
        </div>
      </div>
    );
  }

  const chartData = prepareChartData();

  return (
    <div className="location-history-modal">
      <div className="location-history-content">
        <div className="modal-header">
          <h2>Location History Analysis</h2>
          <button onClick={onClose} className="close-btn">×</button>
        </div>
        
        <div className="location-info">
          <p><strong>Coordinates:</strong> {latitude.toFixed(6)}°, {longitude.toFixed(6)}°</p>
          <p><strong>Total Samples:</strong> {historyData.totalSamples}</p>
          {historyData.timeSpan && (
            <p><strong>Time Span:</strong> {formatDate(historyData.timeSpan.earliest)} to {formatDate(historyData.timeSpan.latest)}</p>
          )}
        </div>

        {historyData.totalSamples === 1 ? (
          <div className="single-sample">
            <h3>Single Sample Record</h3>
            <div className="sample-details">
              <p><strong>Date:</strong> {formatDate(historyData.samples[0].createdAt)}</p>
              <p><strong>Sediment Type:</strong> {historyData.samples[0].sedimentType}</p>
              <p><strong>D50:</strong> {historyData.samples[0].d50.toFixed(3)}mm</p>
              <p><strong>Mean Size:</strong> {historyData.samples[0].dmean.toFixed(3)}mm</p>
              <p><strong>Grain Count:</strong> {historyData.samples[0].numberOfGrains}</p>
            </div>
          </div>
        ) : historyData.totalSamples > 1 ? (
          <>
            {/* Trends Analysis */}
            <div className="trends-analysis">
              <h3>Temporal Changes</h3>
              <div className="trend-cards">
                <div className="trend-card">
                  <div className="trend-label">D50 Change</div>
                  <div className={`trend-value ${historyData.trends.d50Change >= 0 ? 'increase' : 'decrease'}`}>
                    {historyData.trends.d50Change >= 0 ? '+' : ''}{historyData.trends.d50Change.toFixed(3)}mm
                  </div>
                </div>
                <div className="trend-card">
                  <div className="trend-label">Mean Size Change</div>
                  <div className={`trend-value ${historyData.trends.dmeanChange >= 0 ? 'increase' : 'decrease'}`}>
                    {historyData.trends.dmeanChange >= 0 ? '+' : ''}{historyData.trends.dmeanChange.toFixed(3)}mm
                  </div>
                </div>
              </div>
            </div>

            {/* Chart */}
            <div className="chart-section">
              <h3>Grain Size Evolution</h3>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="sample" />
                    <YAxis label={{ value: 'Size (mm)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip 
                      labelFormatter={(label) => {
                        const item = chartData.find(d => d.sample === label);
                        return item ? `${item.sample} (${item.date})` : label;
                      }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="D50" stroke="#2196F3" strokeWidth={2} name="D50" />
                    <Line type="monotone" dataKey="Dmean" stroke="#FF9800" strokeWidth={2} name="Mean Size" />
                    <Line type="monotone" dataKey="Dmed" stroke="#4CAF50" strokeWidth={2} name="Median Size" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Sediment Type Evolution */}
            <div className="sediment-evolution">
              <h3>Sediment Type Evolution</h3>
              <div className="evolution-timeline">
                {historyData.trends.sedimentTypeEvolution.map((item, index) => (
                  <div key={index} className="timeline-item">
                    <div className="timeline-date">{formatDate(item.date)}</div>
                    <div className={`timeline-badge ${item.type.replace(/[\s\/]/g, '-').toLowerCase()}`}>
                      {item.type}
                    </div>
                    <div className="timeline-d50">D50: {item.d50.toFixed(3)}mm</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="no-data">
            <p>No samples found for this location.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationHistory;