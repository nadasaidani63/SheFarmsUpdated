import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from './AuthLayout';

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || '';

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    console.log('Password reset for email:', email, 'New password:', formData.password);
    setIsSubmitted(true);
    // Ici vous pourrez ajouter la logique de réinitialisation de mot de passe
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
          Create New Password
        </h2>
        
        {email && (
          <p style={{
            textAlign: 'center',
            marginBottom: '20px',
            color: '#666',
            fontSize: '14px'
          }}>
            Resetting password for: <strong>{email}</strong>
          </p>
        )}
        
        {!isSubmitted ? (
          <>
            <p style={{ 
              textAlign: 'center', 
              marginBottom: '30px',
              color: '#666',
              lineHeight: '1.5'
            }}>
              Enter your new password below.
            </p>
            
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '5px',
                  color: '#333',
                  fontWeight: '500'
                }}>
                  New Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '16px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Enter new password"
                  required
                />
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '5px',
                  color: '#333',
                  fontWeight: '500'
                }}>
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '16px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Confirm new password"
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
                Update Password
              </button>
            </form>
          </>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              fontSize: '3rem', 
              marginBottom: '20px',
              color: '#28a745'
            }}>
              <span aria-hidden="true">✓</span>
            </div>
            <h3 style={{ 
              color: '#333', 
              marginBottom: '15px'
            }}>
              Password Updated!
            </h3>
            <p style={{ 
              color: '#666',
              lineHeight: '1.5',
              marginBottom: '30px'
            }}>
              Your password has been successfully updated. You can now login with your new password.
            </p>
            <Link
              to="/login"
              style={{
                backgroundColor: '#28a745',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '6px',
                textDecoration: 'none',
                display: 'inline-block'
              }}
            >
              Go to Login
            </Link>
          </div>
        )}
        
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Link to="/" style={{ color: '#666', textDecoration: 'none' }}>
            ← Back to Home
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};

export default ResetPassword;
