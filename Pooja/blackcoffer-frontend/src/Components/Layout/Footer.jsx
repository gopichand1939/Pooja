
// src/Components/Layout/Footer.jsx
import React from "react";
import "../../styles/footer.css";

const Footer = () => {
  return (
    <footer className="bc-footer">
      <p>© {new Date().getFullYear()} Blackcoffer. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
