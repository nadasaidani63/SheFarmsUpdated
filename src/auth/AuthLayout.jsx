import React from 'react';
import { Link } from 'react-router-dom';

const AuthLayout = ({ children }) => (
  <div className="app auth-page">
    <Link to="/" className="auth-brand">
      <img src="/images/shefarms-logo.jpg" alt="" />
      <span>SheFarms</span>
    </Link>
    <main className="auth-canvas">{children}</main>
  </div>
);

export default AuthLayout;
