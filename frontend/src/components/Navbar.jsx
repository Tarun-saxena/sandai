import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  const location = useLocation();
  
  const isActive = (path) => location.pathname === path;
  
  return (
    <nav className="navbar">
      <div className="navbar-title">
        Retra.AI
      </div>
      <div className="navbar-links">
        <Link 
          to="/" 
          className={`nav-link ${isActive('/') ? 'active' : ''}`}
        >
          Home
        </Link>
        <Link 
          to="/reports" 
          className={`nav-link ${isActive('/reports') ? 'active' : ''}`}
        >
          Reports
        </Link>
        <Link 
          to="/data" 
          className={`nav-link ${isActive('/data') ? 'active' : ''}`}
        >
          Data
        </Link>
        <Link 
          to="/about" 
          className={`nav-link ${isActive('/about') ? 'active' : ''}`}
        >
          About
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
