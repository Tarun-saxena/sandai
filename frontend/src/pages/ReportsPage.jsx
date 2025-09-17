import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import './ReportsPage.css';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const ReportsPage = () => {
  const [stats, setStats] = useState(null);
  const [distribution, setDistribution] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [samples, setSamples] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsResponse, distributionResponse, samplesResponse] = await Promise.all([
        axios.get('https://sandai.onrender.com/api/sand-samples/stats/grain-size'),
        axios.get('https://sandai.onrender.com/api/sand-samples/stats/sediment-distribution'),
        axios.get('https://sandai.onrender.com/api/sand-samples')
      ]);
      
      setStats(statsResponse.data);
      setDistribution(distributionResponse.data);
      setSamples(samplesResponse.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching reports data:', error);
      setError('Failed to fetch reports data. Please check if the server is running.');
    } finally {
      setLoading(false);
    }
  };

  const getLocationStats = () => {
    if (samples.length === 0) return null;
    
    const latitudes = samples.map(s => s.latitude);
    const longitudes = samples.map(s => s.longitude);
    
    return {
      northernmost: Math.max(...latitudes).toFixed(4),
      southernmost: Math.min(...latitudes).toFixed(4),
      easternmost: Math.max(...longitudes).toFixed(4),
      westernmost: Math.min(...longitudes).toFixed(4),
    };
  };

  const getCategorizedStats = () => {
    if (samples.length === 0) return [];
    
    const categories = {};
    samples.forEach(sample => {
      const type = sample.sedimentType;
      categories[type] = (categories[type] || 0) + 1;
    });
    
    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading analytics data...</p>
      </div>
    );
  }

  const locationStats = getLocationStats();
  const categorizedStats = getCategorizedStats();

  return (
    <div className="reports-page">
      <div className="reports-container">
        <header className="reports-header">
          <h1>Sand Sample Analysis Reports</h1>
          <p className="reports-subtitle">Comprehensive analytics and statistical insights</p>
        </header>

        {error && (
          <div className="error-message">
            {error}
            <button onClick={fetchData} className="retry-btn">Retry</button>
          </div>
        )}

        <div className="reports-grid">
          {/* Statistics Cards */}
          <div className="stats-section">
            <div className="card">
              <div className="card-header">
                <h3>Overall Statistics</h3>
              </div>
              <div className="card-content">
                {stats ? (
                  <div className="stats-list">
                    <div className="stat-item">
                      <span className="stat-label">Total Samples:</span>
                      <span className="stat-value">{stats.totalSamples}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Average D50:</span>
                      <span className="stat-value">{stats.avgD50.toFixed(3)}mm</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Min D50:</span>
                      <span className="stat-value">{stats.minD50.toFixed(3)}mm</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Max D50:</span>
                      <span className="stat-value">{stats.maxD50.toFixed(3)}mm</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Average Mean Size:</span>
                      <span className="stat-value">{stats.avgDmean.toFixed(3)}mm</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Average Grain Count:</span>
                      <span className="stat-value">{Math.round(stats.avgNumberOfGrains)}</span>
                    </div>
                  </div>
                ) : (
                  <p>No statistics available</p>
                )}
              </div>
            </div>

            {locationStats && (
              <div className="card">
                <div className="card-header">
                  <h3>Geographic Coverage</h3>
                </div>
                <div className="card-content">
                  <div className="stats-list">
                    <div className="stat-item">
                      <span className="stat-label">Northernmost:</span>
                      <span className="stat-value">{locationStats.northernmost}°</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Southernmost:</span>
                      <span className="stat-value">{locationStats.southernmost}°</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Easternmost:</span>
                      <span className="stat-value">{locationStats.easternmost}°</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Westernmost:</span>
                      <span className="stat-value">{locationStats.westernmost}°</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Distribution Bar Chart */}
          <div className="chart-section full-width">
            <div className="card">
              <div className="card-header">
                <h3>Sediment Type Distribution</h3>
              </div>
              <div className="card-content">
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={distribution} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <XAxis dataKey="_id" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#007bff" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* Distribution Pie Chart */}
          <div className="chart-section">
            <div className="card">
              <div className="card-header">
                <h3>Sediment Type Breakdown</h3>
              </div>
              <div className="card-content">
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={400}>
                    <PieChart>
                      <Pie
                        data={categorizedStats}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={120}
                        fill="#8884d8"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {categorizedStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="summary-section">
            <div className="card">
              <div className="card-header">
                <h3>Sediment Type Summary</h3>
              </div>
              <div className="card-content">
                <div className="category-breakdown">
                  {categorizedStats.map((category, index) => (
                    <div key={category.name} className="category-item">
                      <div 
                        className="category-color" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      ></div>
                      <span className="category-name">{category.name}</span>
                      <span className="category-count">{category.value} samples</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;