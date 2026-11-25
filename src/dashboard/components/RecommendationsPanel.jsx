import React from 'react';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  TrendingUp,
  Lightbulb,
  Target,
  Calendar,
  ArrowRight
} from 'lucide-react';

const RecommendationsPanel = ({ data }) => {
  const getRecommendations = (soilData) => {
    if (!soilData) return [];

    const recommendations = [];

    // pH recommendations
    if (soilData.pH < 6.0) {
      recommendations.push({
        type: 'urgent',
        title: 'pH Level Too Low',
        description: 'Add lime to increase soil pH to optimal range',
        action: 'Apply 500kg limestone per hectare',
        timeline: '2-3 weeks',
        priority: 1,
        icon: AlertTriangle,
        color: 'red'
      });
    } else if (soilData.pH > 7.5) {
      recommendations.push({
        type: 'urgent',
        title: 'pH Level Too High',
        description: 'Add sulfur to decrease soil pH',
        action: 'Apply sulfur amendments',
        timeline: '3-4 weeks',
        priority: 1,
        icon: AlertTriangle,
        color: 'red'
      });
    }

    // Humidity recommendations
    if (soilData.humidity < 60) {
      recommendations.push({
        type: 'important',
        title: 'Low Soil Humidity',
        description: 'Increase irrigation frequency',
        action: 'Increase watering schedule',
        timeline: '1 week',
        priority: 2,
        icon: Clock,
        color: 'orange'
      });
    }

    // Nutrient recommendations
    if (soilData.nitrogen < 80) {
      recommendations.push({
        type: 'maintenance',
        title: 'Nitrogen Deficiency',
        description: 'Apply nitrogen-rich fertilizers',
        action: 'Apply urea or compost',
        timeline: '2 weeks',
        priority: 3,
        icon: TrendingUp,
        color: 'blue'
      });
    }

    if (soilData.phosphorus < 80) {
      recommendations.push({
        type: 'maintenance',
        title: 'Phosphorus Enhancement',
        description: 'Boost phosphorus levels for better root development',
        action: 'Apply phosphate fertilizer',
        timeline: '3 weeks',
        priority: 3,
        icon: TrendingUp,
        color: 'purple'
      });
    }

    if (soilData.organicMatter < 3) {
      recommendations.push({
        type: 'improvement',
        title: 'Low Organic Matter',
        description: 'Add compost to improve soil structure',
        action: 'Apply organic compost',
        timeline: '1 month',
        priority: 2,
        icon: Lightbulb,
        color: 'green'
      });
    }

    return recommendations.sort((a, b) => a.priority - b.priority);
  };

  const recommendations = getRecommendations(data);

  if (!data) {
    return (
      <div className="recommendations-container">
        <div className="recommendations-header">
          <div>
            <h3 className="section-title-left">Soil Recommendations</h3>
            <p className="recommendation-method-note">Rule-based thresholds · not machine learning</p>
          </div>
          <Lightbulb className="w-5 h-5 text-pink-500" />
        </div>
        <p className="text-sm text-gray-500">A soil reading is needed before recommendations can be calculated.</p>
      </div>
    );
  }

  return (
    <div className="recommendations-container">
      {/* Header Section */}
      <div className="recommendations-header">
        <div>
          <h3 className="section-title-left">Soil Recommendations</h3>
          <p className="recommendation-method-note">Rule-based thresholds · not machine learning</p>
        </div>
        <Lightbulb className="w-5 h-5 text-pink-500" />
      </div>

      {/* Recommendations Section */}
      <div className="recommendations-section">
        {recommendations.length === 0 ? (
          <div className="success-alert-box">
            <div className="success-icon-container">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="success-content">
              <div className="success-badge">✓ Great!</div>
              <p className="success-message">Soil conditions are optimal - maintain current practices</p>
            </div>
          </div>
        ) : (
          <div className="alert-recommendations">
            <div className="alert-header">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <span className="alert-title">Action Required</span>
              <span className="alert-count">{recommendations.length} issues found</span>
            </div>
            <div className="recommendations-list">
              {recommendations.slice(0, 2).map((rec, index) => {
                const IconComponent = rec.icon;
                return (
                  <div key={index} className={`recommendation-item recommendation-${rec.color}`}>
                    <div className="recommendation-icon">
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="recommendation-content">
                      <div className="recommendation-header">
                        <span className="recommendation-title">{rec.title}</span>
                        <span className="recommendation-timeline">{rec.timeline}</span>
                      </div>
                      <p className="recommendation-description">{rec.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Action Timeline Section */}
      <div className="timeline-section">
        <h4 className="timeline-title">Suggested Action Timeline</h4>
        <div className="timeline-card">
          <div className="timeline-step">
            <div className="step-indicator">
              <span className="step-number">3</span>
            </div>
            <div className="step-content">
              <span className="step-title">Next Month</span>
              <span className="step-description">Monitor progress and retest soil</span>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-400" />
        </div>
      </div>

      {/* Quick Actions Section */}
      <div className="quick-actions-section">
        <h4 className="quick-actions-title">Quick Actions</h4>
        <div className="action-buttons-grid">
          <button className="action-button action-button-purple">
            <Calendar className="w-4 h-4" />
            <span>Schedule Irrigation</span>
          </button>
          
          <button className="action-button action-button-red">
            <Target className="w-4 h-4" />
            <span>Order Fertilizer</span>
          </button>
          
          <button className="action-button action-button-pink">
            <Clock className="w-4 h-4" />
            <span>Set Reminder</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecommendationsPanel;
