import { useState, useEffect } from 'react';
import axios from 'axios';
import './DataPage.css';

const DataPage = () => {
  const [samples, setSamples] = useState([]);
  const [filteredSamples, setFilteredSamples] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = [
    { label: 'All', value: 'All' },
    { label: 'Fine (< 0.25mm)', value: 'Fine', min: 0, max: 0.25 },
    { label: 'Medium (0.25-0.5mm)', value: 'Medium', min: 0.25, max: 0.5 },
    { label: 'Coarse (> 0.5mm)', value: 'Coarse', min: 0.5, max: Infinity },
  ];

  useEffect(() => {
    fetchSamples();
  }, []);

  useEffect(() => {
    filterAndSortSamples();
  }, [samples, searchTerm, selectedCategory, sortConfig]);

  const fetchSamples = async () => {
    try {
      setLoading(true);
      const response = await axios.get('https://sandai.onrender.com/api/sand-samples');
      setSamples(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching sand samples:', error);
      setError('Failed to fetch sand samples. Please check if the server is running.');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortSamples = () => {
    let filtered = [...samples];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(sample => 
        sample.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sample.latitude.toString().includes(searchTerm) ||
        sample.longitude.toString().includes(searchTerm) ||
        sample.diameter.toString().includes(searchTerm)
      );
    }

    // Apply category filter
    if (selectedCategory !== 'All') {
      const category = categories.find(cat => cat.value === selectedCategory);
      if (category) {
        filtered = filtered.filter(sample => 
          sample.diameter >= category.min && sample.diameter < category.max
        );
      }
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortConfig.key === 'createdAt') {
        const dateA = new Date(a[sortConfig.key]);
        const dateB = new Date(b[sortConfig.key]);
        return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
      } else {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
        } else {
          const aStr = String(aValue).toLowerCase();
          const bStr = String(bValue).toLowerCase();
          if (aStr < bStr) return sortConfig.direction === 'asc' ? -1 : 1;
          if (aStr > bStr) return sortConfig.direction === 'asc' ? 1 : -1;
          return 0;
        }
      }
    });

    setFilteredSamples(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleExport = () => {
    const csvContent = [
      ['Latitude', 'Longitude', 'Diameter (mm)', 'Description', 'Created At'].join(','),
      ...filteredSamples.map(sample => [
        sample.latitude,
        sample.longitude,
        sample.diameter,
        `"${sample.description}"`,
        new Date(sample.createdAt).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `sand_samples_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredSamples.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredSamples.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const getSortIcon = (columnKey) => {
    if (sortConfig.key === columnKey) {
      return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
    }
    return ' ↕';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading sand sample data...</p>
      </div>
    );
  }

  return (
    <div className="data-page">
      <div className="data-container">
        <header className="data-header">
          <h1>Sand Sample Data Management</h1>
          <p className="data-subtitle">View, search, and analyze sand sample records</p>
        </header>

        {error && (
          <div className="error-message">
            {error}
            <button onClick={fetchSamples} className="retry-btn">Retry</button>
          </div>
        )}

        <div className="data-controls">
          <div className="search-section">
            <input
              type="text"
              placeholder="Search samples (description, coordinates, diameter)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-section">
            <label htmlFor="category-select">Filter by size:</label>
            <select
              id="category-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="category-select"
            >
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          <div className="action-section">
            <button onClick={handleExport} className="export-btn">
              Export CSV ({filteredSamples.length} records)
            </button>
            <button onClick={fetchSamples} className="refresh-btn">
              Refresh Data
            </button>
          </div>
        </div>

        <div className="data-stats">
          <div className="stat-card">
            <span className="stat-number">{samples.length}</span>
            <span className="stat-label">Total Samples</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{filteredSamples.length}</span>
            <span className="stat-label">Filtered Results</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{totalPages}</span>
            <span className="stat-label">Pages</span>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('latitude')} className="sortable">
                  Latitude{getSortIcon('latitude')}
                </th>
                <th onClick={() => handleSort('longitude')} className="sortable">
                  Longitude{getSortIcon('longitude')}
                </th>
                <th onClick={() => handleSort('diameter')} className="sortable">
                  Diameter (mm){getSortIcon('diameter')}
                </th>
                <th>Description</th>
                <th onClick={() => handleSort('createdAt')} className="sortable">
                  Date Added{getSortIcon('createdAt')}
                </th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((sample) => (
                <tr key={sample._id} className="data-row">
                  <td>{sample.latitude.toFixed(6)}</td>
                  <td>{sample.longitude.toFixed(6)}</td>
                  <td>
                    <span className={`diameter-badge ${
                      sample.diameter < 0.25 ? 'fine' :
                      sample.diameter < 0.5 ? 'medium' : 'coarse'
                    }`}>
                      {sample.diameter}
                    </span>
                  </td>
                  <td className="description-cell">{sample.description}</td>
                  <td>{new Date(sample.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            <button 
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="pagination-btn"
            >
              Previous
            </button>
            
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index + 1}
                onClick={() => paginate(index + 1)}
                className={`pagination-btn ${currentPage === index + 1 ? 'active' : ''}`}
              >
                {index + 1}
              </button>
            ))}
            
            <button 
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="pagination-btn"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataPage;