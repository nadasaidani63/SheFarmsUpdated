import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-brand">
            <img src="/images/shefarms-logo.jpg" alt="SheFarms Logo" className="footer-logo" />
            <span className="footer-brand-name">SheFarms</span>
          </div>
          

        </div>
        
        <div className="footer-bottom">
          <p>© 2025 SheFarms. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
