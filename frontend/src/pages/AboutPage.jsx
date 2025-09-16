import React from 'react';
import './AboutPage.css';

const AboutPage = () => {
  return (
    <div className="about-page">
      <div className="about-container">
        <header className="about-header">
          <h1>Sand Sample Analysis System</h1>
          <p className="subtitle">Advanced Geospatial Analysis for Sand Particle Research</p>
        </header>

        <div className="about-content">
          <section className="about-section">
            <h2>Project Overview</h2>
            <p>
              The Sand Sample Analysis System is a comprehensive web-based platform designed to 
              analyze, visualize, and manage sand particle data collected from various geographical 
              locations. This system enables researchers and environmental scientists to study 
              sand particle characteristics, their distribution patterns, and geographical correlations.
            </p>
          </section>

          <section className="about-section">
            <h2>Key Features</h2>
            <div className="features-grid">
              <div className="feature-card">
                <h3> Interactive Mapping</h3>
                <p>Visualize sand sample locations on an interactive map with detailed popup information and filtering capabilities.</p>
              </div>
              <div className="feature-card">
                <h3> Statistical Analysis</h3>
                <p>Comprehensive statistical analysis of sand particle diameters including distribution charts and aggregated metrics.</p>
              </div>
              <div className="feature-card">
                <h3> Data Management</h3>
                <p>Efficient data management system with search, filter, and export functionalities for research datasets.</p>
              </div>
              <div className="feature-card">
                <h3> Detailed Reports</h3>
                <p>Generate detailed analytical reports with visualizations for diameter distribution and geographical trends.</p>
              </div>
            </div>
          </section>

          <section className="about-section">
            <h2>Technical Architecture</h2>
            <div className="tech-stack">
              <div className="tech-category">
                <h3>Frontend</h3>
                <ul>
                  <li>React.js for dynamic user interface</li>
                  <li>Leaflet for interactive mapping</li>
                  <li>Recharts for data visualization</li>
                  <li>CSS3 for responsive design</li>
                </ul>
              </div>
              <div className="tech-category">
                <h3>Backend</h3>
                <ul>
                  <li>Node.js with Express.js framework</li>
                  <li>MongoDB for data storage</li>
                  <li>Mongoose for database modeling</li>
                  <li>Multer for file upload handling</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="about-section">
            <h2>Data Structure</h2>
            <p>
              Each sand sample record contains the following information:
            </p>
            <ul className="data-structure-list">
              <li><strong>Geographic Coordinates:</strong> Latitude and longitude of sample location</li>
              <li><strong>Particle Diameter:</strong> Measured size of sand particles in millimeters</li>
              <li><strong>Description:</strong> Detailed description of the sand sample characteristics</li>
              <li><strong>Timestamp:</strong> Date and time of sample collection</li>
            </ul>
          </section>

          <section className="about-section">
            <h2>Usage Guidelines</h2>
            <div className="usage-steps">
              <div className="step">
                <h4>Step 1: Data Upload</h4>
                <p>Upload sand sample data through CSV files via the backend API endpoints.</p>
              </div>
              <div className="step">
                <h4>Step 2: Map Visualization</h4>
                <p>View sample locations on the interactive map, use filters to focus on specific particle size categories.</p>
              </div>
              <div className="step">
                <h4>Step 3: Data Analysis</h4>
                <p>Explore detailed data tables with search and sorting capabilities in the Data section.</p>
              </div>
              <div className="step">
                <h4>Step 4: Generate Reports</h4>
                <p>Access comprehensive statistical reports and visualizations in the Reports section.</p>
              </div>
            </div>
          </section>

          <section className="about-section">
            <h2>Research Applications</h2>
            <p>
              This system supports various research applications including:
            </p>
            <ul className="applications-list">
              <li>Coastal erosion and sediment transport studies</li>
              <li>Environmental impact assessments</li>
              <li>Geological surveys and mineral exploration</li>
              <li>Construction material quality analysis</li>
              <li>Climate change impact research</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;