export const SOIL_SENSOR_API_URL = (
  import.meta.env.VITE_SOIL_SENSOR_API_URL || 'http://127.0.0.1:8001'
).replace(/\/$/, '');

export async function soilSensorRequest(path, options = {}) {
  let response;
  try {
    response = await fetch(`${SOIL_SENSOR_API_URL}${path}`, {
      ...options,
      headers: {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new Error(`Cannot reach the virtual soil sensor API at ${SOIL_SENSOR_API_URL}. Start the simulator and try again.`);
  }

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = body.detail;
    const message = Array.isArray(detail)
      ? detail.map((item) => item.msg).join(', ')
      : detail;
    throw new Error(message || `Soil sensor request failed (HTTP ${response.status}).`);
  }
  return body;
}

export function normalizeSoilReading(reading) {
  return {
    ...reading,
    id: reading.id ?? `${reading.sensor_id}-${reading.timestamp}`,
    date: reading.timestamp,
    pH: Number(reading.ph),
    humidity: Number(reading.moisture),
    temperature: Number(reading.temperature),
    nitrogen: Number(reading.nitrogen),
    phosphorus: Number(reading.phosphorus),
    potassium: Number(reading.potassium),
    organicMatter: Number(reading.organic_matter),
  };
}
