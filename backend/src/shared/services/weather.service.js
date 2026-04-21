import { env } from '../config/env.js';

const DAILY_LOOKBACK_DAYS = 15;
const DRY_DAY_THRESHOLD_MM = 1;

const formatDate = (date) => {
  const y = date.getUTCFullYear();
  const m = `${date.getUTCMonth() + 1}`.padStart(2, '0');
  const d = `${date.getUTCDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const buildCurrentUrl = (latitude, longitude) => {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    timezone: 'auto',
    current: 'temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation',
  });

  return `${env.weatherApiBaseUrl}?${params.toString()}`;
};

const buildArchiveUrl = (latitude, longitude, startDate, endDate) => {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    timezone: 'auto',
    start_date: startDate,
    end_date: endDate,
    daily: 'precipitation_sum',
  });

  return `${env.weatherArchiveBaseUrl}?${params.toString()}`;
};

const parseTimezoneParts = (timezone) => {
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: timezone,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  });

  const parts = formatter.formatToParts(new Date());
  const partMap = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return {
    month: Number(partMap.month),
    hour: Number(partMap.hour),
  };
};

const calculateDiaSemChuva = (precipitationSeries) => {
  let daysWithoutRain = 0;

  for (let i = precipitationSeries.length - 1; i >= 0; i -= 1) {
    const precipitation = Number(precipitationSeries[i]) || 0;

    if (precipitation < DRY_DAY_THRESHOLD_MM) {
      daysWithoutRain += 1;
      if (daysWithoutRain >= DAILY_LOOKBACK_DAYS) {
        break;
      }
      continue;
    }

    break;
  }

  return Math.min(daysWithoutRain, DAILY_LOOKBACK_DAYS);
};

export const collectWeatherFeatures = async (latitude, longitude) => {
  const currentResponse = await fetch(buildCurrentUrl(latitude, longitude));

  if (!currentResponse.ok) {
    throw new Error('Failed to fetch current weather data');
  }

  const currentData = await currentResponse.json();
  const endDate = new Date();
  const startDate = new Date(endDate);
  startDate.setUTCDate(endDate.getUTCDate() - (DAILY_LOOKBACK_DAYS - 1));

  const archiveResponse = await fetch(
    buildArchiveUrl(latitude, longitude, formatDate(startDate), formatDate(endDate))
  );

  if (!archiveResponse.ok) {
    throw new Error('Failed to fetch weather archive data');
  }

  const archiveData = await archiveResponse.json();
  const precipitationSeries = archiveData?.daily?.precipitation_sum ?? [];

  if (!currentData?.current || precipitationSeries.length === 0) {
    throw new Error('Weather provider returned incomplete data');
  }

  const { month, hour } = parseTimezoneParts(currentData.timezone || 'UTC');

  return {
    DiaSemChuva: calculateDiaSemChuva(precipitationSeries),
    Precipitacao: Number(currentData.current.precipitation ?? 0),
    Temperatura_C: Number(currentData.current.temperature_2m ?? 0),
    'Umidade_Relativa_%': Number(currentData.current.relative_humidity_2m ?? 0),
    Vento_ms: Number(currentData.current.wind_speed_10m ?? 0),
    Mes: month,
    Hora: hour,
    Latitude: Number(latitude),
    Longitude: Number(longitude),
    weatherProvider: 'open-meteo',
    weatherCollectedAt: new Date().toISOString(),
  };
};
