// Types pour l'analyse du sol
export const SoilDataTypes = {
  // Interface SoilData
  createSoilData: (id, date, pH, humidity, temperature, nitrogen, phosphorus, potassium, organicMatter, source = 'manual') => ({
    id,
    date,
    pH,
    humidity, // percentage
    temperature, // celsius
    nitrogen, // percentage
    phosphorus, // percentage
    potassium, // percentage
    organicMatter, // percentage
    source // 'manual' | 'sensor'
  }),

  // Interface SoilAnalysisResult
  createSoilAnalysisResult: (fertility, needsIrrigation, pHStatus, recommendations, overallScore) => ({
    fertility, // 'low' | 'medium' | 'high'
    needsIrrigation, // boolean
    pHStatus, // 'acidic' | 'neutral' | 'alkaline'
    recommendations, // string[]
    overallScore // 0-100
  }),

  // Interface SensorData
  createSensorData: (sensorId, timestamp, readings) => ({
    sensorId,
    timestamp,
    readings // Partial<Pick<SoilData, 'pH' | 'humidity' | 'temperature'>>
  })
};

// Utilitaires pour la validation
export const ValidationUtils = {
  isValidpH: (value) => value >= 0 && value <= 14,
  isValidPercentage: (value) => value >= 0 && value <= 100,
  isValidTemperature: (value) => value >= -10 && value <= 50,
  isValidOrganicMatter: (value) => value >= 0 && value <= 20
};
