import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Globe2 } from 'lucide-react';

const Header = ({ currentPage }) => {
  const [language, setLanguage] = useState('EN');
  const navItems = [
    ['home', 'Home', '/'],
    ['about', 'About', '/about'],
    ['features', 'Features', '/features'],
    ['contact', 'Contact', '/contact'],
  ];

  return (
    <header className="header shefarms-public-header">
      <div className="container">
        <nav className="nav">
          <Link to="/" className="logo-link" aria-label="SheFarms home">
            <img src="/images/shefarms-logo.jpg" alt="" className="logo" />
            <span className="brand-name">SheFarms</span>
          </Link>
          <div className="nav-menu">
            {navItems.map(([id, label, to]) => (
              <Link key={id} to={to} className={`nav-link ${currentPage === id ? 'active' : ''}`}>{label}</Link>
            ))}
          </div>
          <div className="nav-buttons">
            <div className="shefarms-language-picker" aria-label="Select language">
              <Globe2 size={16} aria-hidden="true" />
              {['EN', 'FR', 'عربي'].map((option) => (
                <button key={option} type="button" dir={option === 'عربي' ? 'rtl' : 'ltr'} className={language === option ? 'selected' : ''} onClick={() => setLanguage(option)}>{option}</button>
              ))}
            </div>
            <Link to="/login" className="shefarms-signin">Sign In</Link>
            <Link to="/register" className="shefarms-join">Join SheFarms <ArrowUpRight size={16} /></Link>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
