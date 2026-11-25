import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from './AuthLayout';

const PasswordRecovery = () => {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Password recovery for:', email);
    // Naviguer vers la page de reset password
    navigate('/reset-password', { state: { email } });
  };

  return (
    <AuthLayout>
      <div className="auth-card" style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '10px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h2 style={{ 
          textAlign: 'center', 
          marginBottom: '30px',
          color: '#333'
        }}>
          Reset Your Password
        </h2>
        
        <p style={{ 
          textAlign: 'center', 
          marginBottom: '30px',
          color: '#666',
          lineHeight: '1.5'
        }}>
          Enter your email address and we'll send you a link to reset your password.
        </p>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '5px',
              color: '#333',
              fontWeight: '500'
            }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
              placeholder="Enter your email"
              required
            />
          </div>
          
          <button
            type="submit"
            style={{
              width: '100%',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              padding: '12px',
              borderRadius: '6px',
              fontSize: '16px',
              cursor: 'pointer',
              marginBottom: '20px'
            }}
          >
            Send Reset Link
          </button>
        </form>
        
        <div style={{ textAlign: 'center' }}>
          <p style={{ marginBottom: '10px', color: '#666' }}>
            Remember your password?{' '}
            <Link to="/login" style={{ color: '#28a745', textDecoration: 'none' }}>
              Login
            </Link>
          </p>
        </div>
        
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Link to="/" style={{ color: '#666', textDecoration: 'none' }}>
            ← Back to Home
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};

export default PasswordRecovery;
