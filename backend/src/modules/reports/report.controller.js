import { withTransaction } from '../../shared/db/client.js';
import { collectWeatherFeatures } from '../../shared/services/weather.service.js';
import { predictFireRisk } from '../../shared/services/ml.service.js';

const validateCoordinates = (latitude, longitude) => {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return 'Latitude and longitude must be valid numbers.';
  }

  if (latitude < -90 || latitude > 90) {
    return 'Latitude must be between -90 and 90.';
  }

  if (longitude < -180 || longitude > 180) {
    return 'Longitude must be between -180 and 180.';
  }

  return null;
};

const normalizeLocationSource = (value) => {
  const source = String(value || 'gps').toLowerCase();

  if (['gps', 'manual', 'confirmed'].includes(source)) {
    return source;
  }

  return 'gps';
};

const normalizeAccuracy = (value) => {
  if (value == null || value === '') {
    return null;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
};

const normalizeDescription = (value) => {
  if (value == null) {
    return null;
  }

  const description = String(value).trim();

  return description.length > 0 ? description.slice(0, 1200) : null;
};

const normalizeFeatures = (features) => ({
  DiaSemChuva: features.DiaSemChuva,
  Precipitacao: features.Precipitacao,
  Temperatura_C: features.Temperatura_C,
  Umidade_Relativa_pct: features['Umidade_Relativa_%'],
  Vento_ms: features.Vento_ms,
  Mes: features.Mes,
  Hora: features.Hora,
  Latitude: features.Latitude,
  Longitude: features.Longitude,
});

export const ingestReport = async (req, res, next) => {
  try {
    const latitude = Number(req.body?.latitude);
    const longitude = Number(req.body?.longitude);
    const description = normalizeDescription(req.body?.description ?? req.body?.descricao);
    const accuracyMeters = normalizeAccuracy(req.body?.accuracyMeters ?? req.body?.accuracy_meters);
    const locationSource = normalizeLocationSource(req.body?.locationSource ?? req.body?.location_source);
    const locationConfirmed = Boolean(req.body?.locationConfirmed ?? req.body?.location_confirmed ?? false);

    const validationError = validateCoordinates(latitude, longitude);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const features = await collectWeatherFeatures(latitude, longitude);
    const modelFeatures = normalizeFeatures(features);
    const prediction = await predictFireRisk(modelFeatures);

    const report = await withTransaction(async (client) => {
      const reportResult = await client.query(
        `
          INSERT INTO reports (latitude, longitude, description, accuracy_meters, location_source, location_confirmed)
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING id, created_at, description, accuracy_meters, location_source, location_confirmed
        `,
        [latitude, longitude, description, accuracyMeters, locationSource, locationConfirmed]
      );

      const insertedReport = reportResult.rows[0];

      await client.query(
        `
          INSERT INTO weather_features (
            report_id,
            description,
            dia_sem_chuva,
            precipitacao,
            temperatura_c,
            umidade_relativa_pct,
            vento_ms,
            mes,
            hora,
            latitude,
            longitude,
            weather_provider,
            weather_collected_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        `,
        [
          insertedReport.id,
          description,
          features.DiaSemChuva,
          features.Precipitacao,
          features.Temperatura_C,
          features['Umidade_Relativa_%'],
          features.Vento_ms,
          features.Mes,
          features.Hora,
          features.Latitude,
          features.Longitude,
          features.weatherProvider,
          features.weatherCollectedAt,
        ]
      );

      await client.query(
        `
          INSERT INTO predictions (
            report_id,
            model_name,
            model_version,
            prob_incendio,
            classe_prevista,
            frp_previsto,
            payload_used,
            source
          ) VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8)
        `,
        [
          insertedReport.id,
          prediction.modelName,
          prediction.modelVersion,
          prediction.probIncendio,
          prediction.classePrevista,
          prediction.frpPrevisto,
          JSON.stringify(modelFeatures),
          prediction.source,
        ]
      );

      return insertedReport;
    });

    return res.status(201).json({
      reportId: report.id,
      createdAt: report.created_at,
      location: {
        latitude,
        longitude,
        description: report.description,
        accuracyMeters: report.accuracy_meters,
        source: report.location_source,
        confirmed: report.location_confirmed,
      },
      features: {
        DiaSemChuva: features.DiaSemChuva,
        Precipitacao: features.Precipitacao,
        Temperatura_C: features.Temperatura_C,
        'Umidade_Relativa_%': features['Umidade_Relativa_%'],
        Vento_ms: features.Vento_ms,
        Mes: features.Mes,
        Hora: features.Hora,
        Latitude: features.Latitude,
        Longitude: features.Longitude,
      },
      ml: {
        status: 'processed',
        source: prediction.source,
        modelName: prediction.modelName,
        modelVersion: prediction.modelVersion,
        probIncendio: prediction.probIncendio,
        classePrevista: prediction.classePrevista,
        frpPrevisto: prediction.frpPrevisto,
      },
    });
  } catch (error) {
    // Adicione esta linha para o log aparecer no terminal do Docker!
    console.error('[Erro Crítico no Reporte]:', error); 
    
    return next(error);
  }
};
  

    
export const reportar = ingestReport;

