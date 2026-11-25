import React, { useState, useEffect } from 'react';
import { Drone, Wifi, Activity, MapPin, Battery, Signal, AlertTriangle, CheckCircle, Upload, Camera, Eye } from 'lucide-react';
import '../styles/PageTitles.css';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');

const DroneIoTPage = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [detectionResults, setDetectionResults] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [backendStatus, setBackendStatus] = useState({ state: 'checking', modelLoaded: false, detail: '' });

  useEffect(() => {
    let active = true;

    fetch(`${API_BASE_URL}/health`)
      .then(async (response) => {
        if (!response.ok) throw new Error('API health check failed');
        return response.json();
      })
      .then((health) => {
        if (active) {
          setBackendStatus({
            state: 'connected',
            modelLoaded: health.model_loaded,
            detail: health.model_error || '',
          });
        }
      })
      .catch(() => {
        if (active) {
          setBackendStatus({
            state: 'offline',
            modelLoaded: false,
            detail: `Cannot reach the AI API at ${API_BASE_URL}. Run start-backend.bat and refresh this page.`,
          });
        }
      });

    return () => { active = false; };
  }, []);

  const droneData = {
    status: 'active',
    battery: 87,
    altitude: 120,
    speed: 15,
    signal: 94,
    location: { lat: 33.5731, lng: -7.5898 }
  };

  const sensors = [
    { id: 1, name: 'Soil Moisture Sensor A1', value: 68, unit: '%', status: 'online', location: 'Field A - Zone 1' },
    { id: 2, name: 'Temperature Sensor B2', value: 24, unit: '°C', status: 'online', location: 'Greenhouse 1' },
    { id: 3, name: 'pH Sensor C3', value: 6.8, unit: 'pH', status: 'warning', location: 'Field B - Zone 2' },
    { id: 4, name: 'Humidity Sensor D4', value: 72, unit: '%', status: 'offline', location: 'Field C - Zone 3' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'status-completed';
      case 'warning': return 'status-pending';
      case 'offline': return 'status-in-progress';
      default: return 'status-pending';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'online': return <CheckCircle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'offline': return <AlertTriangle className="w-4 h-4" />;
      default: return <CheckCircle className="w-4 h-4" />;
    }
  };

  // Fonction pour gérer la sélection d'image
  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      setError(null);
      
      // Créer une preview de l'image
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Fonction pour analyser l'image avec le modèle AI
  const analyzeImage = async () => {
    if (!selectedImage) {
      setError("Veuillez sélectionner une image d'abord");
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedImage);

      const response = await fetch(`${API_BASE_URL}/predict`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw new Error(errorBody?.detail || `Image analysis failed (HTTP ${response.status})`);
      }

      const result = await response.json();
      setDetectionResults(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="tasks-container">
      {/* Header */}
      <div className="tasks-header">
        <h1 className="page-main-title">
          <Drone aria-hidden="true" /> Drone & IoT Monitoring
        </h1>
        <button className="btn-primary">
          <Drone className="w-5 h-5" />
          Deploy Drone
        </button>
      </div>

      <div
        className="task-card"
        role="status"
        style={{ marginBottom: '1rem', borderLeft: `4px solid ${backendStatus.state === 'offline' ? '#dc2626' : backendStatus.modelLoaded ? '#16a34a' : '#d97706'}` }}
      >
        <strong>AI backend: </strong>
        {backendStatus.state === 'checking' && 'Checking connection…'}
        {backendStatus.state === 'offline' && backendStatus.detail}
        {backendStatus.state === 'connected' && backendStatus.modelLoaded && 'Connected and model loaded.'}
        {backendStatus.state === 'connected' && !backendStatus.modelLoaded && `Connected, but image detection is unavailable. ${backendStatus.detail}`}
      </div>

      {/* Drone Status Cards */}
      <div className="tasks-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        <div className="task-card">
          <div className="task-header">
            <h3 className="task-title">Drone Status</h3>
            <div className={`w-3 h-3 rounded-full ${droneData.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></div>
          </div>
          <div className="task-description">
            <div className="text-2xl font-bold text-gray-800 mb-2">
              {droneData.status.toUpperCase()}
            </div>
            <div className="text-sm text-gray-600">
              Currently monitoring Field A
            </div>
          </div>
        </div>

        <div className="task-card">
          <div className="task-header">
            <h3 className="task-title">Battery Level</h3>
            <Battery className="w-5 h-5 text-gray-600" />
          </div>
          <div className="task-description">
            <div className="text-2xl font-bold text-gray-800 mb-2">
              {droneData.battery}%
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${droneData.battery}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="task-card">
          <div className="task-header">
            <h3 className="task-title">Altitude</h3>
            <MapPin className="w-5 h-5 text-gray-600" />
          </div>
          <div className="task-description">
            <div className="text-2xl font-bold text-gray-800 mb-2">
              {droneData.altitude}m
            </div>
            <div className="text-sm text-gray-600">
              Speed: {droneData.speed} km/h
            </div>
          </div>
        </div>

        <div className="task-card">
          <div className="task-header">
            <h3 className="task-title">Signal Strength</h3>
            <Signal className="w-5 h-5 text-gray-600" />
          </div>
          <div className="task-description">
            <div className="text-2xl font-bold text-gray-800 mb-2">
              {droneData.signal}%
            </div>
            <div className="text-sm text-gray-600">
              Connection: Excellent
            </div>
          </div>
        </div>
      </div>

      {/* IoT Sensors Section */}
      <div className="tasks-section">
        <div className="section-header">
          <h2 className="section-title-pink">
            <Activity className="w-6 h-6 title-icon" />
            IoT Sensors Network
          </h2>
        </div>
        
        <div className="tasks-grid">
          {sensors.map((sensor, index) => (
            <div key={sensor.id} className="task-card">
              <div className="task-header">
                <h4 className="task-title">{sensor.name}</h4>
                <div className={`task-status ${getStatusColor(sensor.status)}`}>
                  {getStatusIcon(sensor.status)}
                  {sensor.status}
                </div>
              </div>
              <div className="task-assignee">{sensor.location}</div>
              <div className="task-description">
                <div className="text-2xl font-bold text-gray-800">
                  {sensor.value}{sensor.unit}
                </div>
              </div>
              <div className="task-actions">
                <button className="btn-small btn-edit">
                  <Wifi className="w-4 h-4" />
                  Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Image Analysis Section */}
      <div className="tasks-section">
        <div className="section-header">
          <h2 className="section-title-pink">
            <Camera className="w-6 h-6 title-icon" />
            Analyse d'Images par IA
          </h2>
        </div>
        
        <div className="task-form" style={{ margin: '0', maxWidth: 'none' }}>
          <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
            <div className="form-group">
              <label className="form-label">Télécharger une image de drone</label>
              <div style={{ 
                border: '2px dashed #d1d5db', 
                borderRadius: '8px', 
                padding: '20px', 
                textAlign: 'center',
                backgroundColor: '#f9fafb',
                transition: 'border-color 0.3s ease'
              }}>
                <Upload className="w-8 h-8 mx-auto mb-3 text-gray-400" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="form-input"
                  style={{ marginBottom: '10px' }}
                />
                <p style={{ fontSize: '14px', color: '#6b7280', margin: '5px 0' }}>
                  Formats supportés: JPG, PNG, JPEG
                </p>
              </div>
              {imagePreview && (
                <div style={{ marginTop: '15px', textAlign: 'center' }}>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '250px',
                      borderRadius: '8px',
                      border: '2px solid #e0e0e0'
                    }}
                  />
                </div>
              )}
            </div>

            <div className="form-group">
              {error && (
                <div style={{
                  padding: '15px',
                  backgroundColor: '#fee2e2',
                  color: '#dc2626',
                  borderRadius: '8px',
                  border: '1px solid #fecaca',
                  marginBottom: '20px'
                }}>
                  <AlertTriangle className="w-4 h-4 inline mr-2" />
                  {error}
                </div>
              )}

              {detectionResults && (
                <div>
                  <label className="form-label">Résultats de la détection</label>
                  <div style={{
                    padding: '20px',
                    backgroundColor: '#f0fdf4',
                    borderRadius: '12px',
                    border: '1px solid #bbf7d0'
                  }}>
                    <div style={{ marginBottom: '15px' }}>
                      <p style={{ margin: '5px 0' }}><strong>Fichier:</strong> {detectionResults.filename}</p>
                      <p style={{ margin: '5px 0' }}><strong>Nombre d'objets détectés:</strong> {detectionResults.num_detections}</p>
                      <p style={{ margin: '5px 0 10px 0' }}><strong>Classes détectées:</strong></p>
                    </div>
                    
                    <div style={{ marginTop: '10px' }}>
                      {detectionResults.detected_classes.length > 0 ? (
                        detectionResults.detected_classes.map((className, index) => (
                          <span
                            key={index}
                            style={{
                              display: 'inline-block',
                              padding: '6px 12px',
                              margin: '4px',
                              backgroundColor: '#dcfce7',
                              color: '#166534',
                              borderRadius: '6px',
                              fontSize: '14px',
                              fontWeight: '500',
                              border: '1px solid #bbf7d0'
                            }}
                          >
                            {className}
                          </span>
                        ))
                      ) : (
                        <span style={{ color: '#6b7280' }}>Aucun objet détecté</span>
                      )}
                    </div>
                    
                    {/* Résumé statistique */}
                    {detectionResults.detected_classes.length > 0 && (
                      <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#eff6ff', borderRadius: '6px', border: '1px solid #bfdbfe' }}>
                        <h4 style={{ margin: '0 0 8px 0', color: '#1e40af', fontSize: '14px' }}>Résumé de détection:</h4>
                        {Object.entries(
                          detectionResults.detected_classes.reduce((acc, className) => {
                            acc[className] = (acc[className] || 0) + 1;
                            return acc;
                          }, {})
                        ).map(([className, count]) => (
                          <div key={className} style={{ fontSize: '13px', color: '#1e40af', marginBottom: '4px' }}>
                            <strong>{className}:</strong> {count} objet{count > 1 ? 's' : ''} détecté{count > 1 ? 's' : ''}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bouton d'analyse en bas à droite */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'flex-end', 
            marginTop: '25px',
            paddingTop: '20px',
            borderTop: '1px solid #e5e7eb'
          }}>
            {selectedImage && (
              <button
                className={`btn-primary ${isAnalyzing ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={analyzeImage}
                disabled={isAnalyzing}
                style={{ 
                  minWidth: '180px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  justifyContent: 'center'
                }}
              >
                <Eye className="w-5 h-5" />
                {isAnalyzing ? 'Analyse en cours...' : 'Analyser l\'image'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Drone Control Panel */}
      <div className="tasks-section">
        <div className="section-header">
          <h2 className="section-title-pink">
            <Drone className="w-6 h-6 title-icon" />
            Drone Control Panel
          </h2>
        </div>
        
        <div className="task-form" style={{ margin: '0', maxWidth: 'none' }}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Current Mission</label>
              <div className="task-meta">
                <p>Field surveillance and crop monitoring</p>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '65%' }}></div>
                </div>
                <small>65% Complete</small>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Weather Conditions</label>
              <div className="task-meta">
                <small>Wind Speed: 12 km/h</small>
                <small>Visibility: 8 km</small>
                <small>Weather: Clear</small>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button className="btn-primary">Return Home</button>
            <button className="btn-secondary">Emergency Land</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DroneIoTPage;
