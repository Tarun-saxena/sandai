import React from "react";
import "./Navbar.css";

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-title"><img src="../public/logo.png" alt="Logo" className="logo" /></div>
      <div className="navbar-links">
        <button>Home</button>
        <button>Report</button>
        <button>Data</button>
        <button>About</button>
      </div>
    </nav>
  );
};

export default Navbar;
