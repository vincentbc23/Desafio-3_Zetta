const MG_BOUNDS = {
  minLat: -22.95,
  maxLat: -14.1,
  minLng: -51.3,
  maxLng: -39.7,
};

const isInsideMinasGerais = (latitude, longitude) => {
  return (
    latitude >= MG_BOUNDS.minLat &&
    latitude <= MG_BOUNDS.maxLat &&
    longitude >= MG_BOUNDS.minLng &&
    longitude <= MG_BOUNDS.maxLng
  );
};

const toRad = (value) => (value * Math.PI) / 180;

// Distância aproximada (km) usando haversine.
const distanceKm = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
};

export const classifyMgRegion = (latitude, longitude) => {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return 'Não classificada';
  }

  if (!isInsideMinasGerais(latitude, longitude)) {
    return 'Fora de Minas Gerais';
  }

  // Região Metropolitana de BH (aproximação por raio a partir de BH).
  // BH: -19.9167, -43.9345
  if (distanceKm(latitude, longitude, -19.9167, -43.9345) <= 85) {
    return 'Região Metropolitana de BH';
  }

  // Triângulo Mineiro / Alto Paranaíba (extremo oeste).
  if (longitude <= -46.6 && latitude >= -20.8) {
    return 'Triângulo Mineiro/Alto Paranaíba';
  }

  // Sul / Sudoeste
  if (latitude <= -21.0 && longitude <= -44.3) {
    return 'Sul/Sudoeste de Minas';
  }

  // Zona da Mata / Campo das Vertentes (leste/sudeste)
  if (latitude <= -20.6 && longitude > -44.3) {
    return 'Zona da Mata/Campo das Vertentes';
  }

  // Vale do Rio Doce (leste-central)
  if (longitude > -43.2 && longitude <= -41.3 && latitude > -20.9 && latitude <= -18.3) {
    return 'Vale do Rio Doce';
  }

  // Vale do Jequitinhonha / Mucuri (nordeste)
  if (longitude > -41.3 && latitude > -20.9) {
    return 'Vale do Jequitinhonha/Mucuri';
  }

  // Oeste
  if (longitude <= -45.2 && latitude <= -20.2) {
    return 'Oeste de Minas';
  }

  // Central
  if (longitude > -45.2 && longitude <= -43.2 && latitude > -20.6 && latitude <= -18.3) {
    return 'Central Mineira';
  }

  if (latitude > -18.2 && longitude <= -45.3) {
    return 'Noroeste de Minas';
  }

  if (latitude > -18.2 && longitude > -45.3) {
    return 'Norte de Minas';
  }

  return 'Zona da Mata/Campo das Vertentes';
};
