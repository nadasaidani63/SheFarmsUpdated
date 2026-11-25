import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Plus, Smartphone, Edit } from 'lucide-react';
import UiIcon from '../../components/UiIcon';

const SoilDataForm = ({ onSubmit, onClose, isLoading }) => {
  const [formData, setFormData] = useState({
    pH: '',
    humidity: '',
    temperature: '',
    nitrogen: '',
    phosphorus: '',
    potassium: '',
    organicMatter: '',
    source: 'manual'
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.pH || parseFloat(formData.pH) < 0 || parseFloat(formData.pH) > 14) {
      newErrors.pH = 'pH must be between 0 and 14';
    }

    if (!formData.humidity || parseFloat(formData.humidity) < 0 || parseFloat(formData.humidity) > 100) {
      newErrors.humidity = 'Humidity must be between 0 and 100%';
    }

    if (!formData.temperature || parseFloat(formData.temperature) < -10 || parseFloat(formData.temperature) > 50) {
      newErrors.temperature = 'Temperature must be between -10°C and 50°C';
    }

    if (!formData.nitrogen || parseFloat(formData.nitrogen) < 0 || parseFloat(formData.nitrogen) > 100) {
      newErrors.nitrogen = 'Nitrogen must be between 0 and 100%';
    }

    if (!formData.phosphorus || parseFloat(formData.phosphorus) < 0 || parseFloat(formData.phosphorus) > 100) {
      newErrors.phosphorus = 'Phosphorus must be between 0 and 100%';
    }

    if (!formData.potassium || parseFloat(formData.potassium) < 0 || parseFloat(formData.potassium) > 100) {
      newErrors.potassium = 'Potassium must be between 0 and 100%';
    }

    if (!formData.organicMatter || parseFloat(formData.organicMatter) < 0 || parseFloat(formData.organicMatter) > 20) {
      newErrors.organicMatter = 'Organic matter must be between 0 and 20%';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    onSubmit({
      pH: parseFloat(formData.pH),
      humidity: parseFloat(formData.humidity),
      temperature: parseFloat(formData.temperature),
      nitrogen: parseFloat(formData.nitrogen),
      phosphorus: parseFloat(formData.phosphorus),
      potassium: parseFloat(formData.potassium),
      organicMatter: parseFloat(formData.organicMatter),
      source: formData.source
    });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const FormField = ({ label, field, type = "number", step, min, max, placeholder, unit }) => (
    <div className="form-field-group">
      <label className="form-label">
        {label}
      </label>
      <div className="input-wrapper">
        <input
          type={type}
          id={field}
          step={step}
          min={min}
          max={max}
          value={formData[field]}
          onChange={(e) => handleInputChange(field, e.target.value)}
          className={`form-input ${errors[field] ? 'error' : ''}`}
          placeholder={placeholder}
        />
        {errors[field] && (
          <div className="error-message">
            <span className="error-icon"><UiIcon name="alert" size={15} /></span>
            {errors[field]}
          </div>
        )}
      </div>
    </div>
  );

  const modalContent = (
    <div 
      className="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]"
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
      onClick={onClose}
    >
      <div 
        className="modal-content bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative"
        style={{ zIndex: 10000 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">
            Add Soil Data
          </h2>
          <button
            onClick={onClose}
            className="modal-close-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {/* Data Source Section */}
          <div className="form-section">
            <div className="section-header-left">
              <h3 className="section-title-left">Data Source</h3>
            </div>
            <div className="source-selection">
              <button
                type="button"
                onClick={() => handleInputChange('source', 'manual')}
                className={`source-option ${formData.source === 'manual' ? 'selected' : ''}`}
              >
                <div className="source-icon manual">
                  <Edit className="w-6 h-6" />
                </div>
                <div className="source-content">
                  <div className="source-title">Manual Entry</div>
                  <div className="source-description">Enter measurements manually</div>
                </div>
                <div className="selection-indicator"></div>
              </button>
              
              <button
                type="button"
                onClick={() => handleInputChange('source', 'sensor')}
                className={`source-option ${formData.source === 'sensor' ? 'selected' : ''}`}
              >
                <div className="source-icon sensor">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div className="source-content">
                  <div className="source-title">Sensor Data</div>
                  <div className="source-description">Import from IoT sensors</div>
                </div>
                <div className="selection-indicator"></div>
              </button>
            </div>
          </div>

          {/* Soil Metrics Section */}
          <div className="form-section">
            <div className="section-header-left">
              <h3 className="section-title-left">Soil Metrics</h3>
            </div>
            <div className="form-grid">
              <FormField
                label="pH Level (0-14)"
                field="pH"
                step="0.1"
                min="0"
                max="14"
                placeholder="e.g., 6.5"
              />

              <FormField
                label="Humidity (%)"
                field="humidity"
                step="1"
                min="0"
                max="100"
                placeholder="e.g., 65"
              />

              <FormField
                label="Temperature (°C)"
                field="temperature"
                step="0.1"
                min="-10"
                max="50"
                placeholder="e.g., 22"
              />

              <FormField
                label="Nitrogen (%)"
                field="nitrogen"
                step="1"
                min="0"
                max="100"
                placeholder="e.g., 85"
              />

              <FormField
                label="Phosphorus (%)"
                field="phosphorus"
                step="1"
                min="0"
                max="100"
                placeholder="e.g., 70"
              />

              <FormField
                label="Potassium (%)"
                field="potassium"
                step="1"
                min="0"
                max="100"
                placeholder="e.g., 90"
              />
            </div>
            
            {/* Full width field */}
            <div className="form-row-full">
              <FormField
                label="Organic Matter (%)"
                field="organicMatter"
                step="0.1"
                min="0"
                max="20"
                placeholder="e.g., 4.2"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              <span>Cancel</span>
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary"
            >
              {isLoading ? (
                <>
                  <div className="loading-spinner"></div>
                  <span>Adding...</span>
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  <span>Add Soil Data</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default SoilDataForm;
