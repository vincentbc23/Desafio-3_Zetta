import { query } from '../../shared/db/client.js';
import { collectWeatherFeatures } from '../../shared/services/weather.service.js';

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

const createPendingPredictionRow = async (reportId, features) => {
  await query(
    `
      INSERT INTO predictions (
        report_id,
        model_name,
        model_version,
        payload_used,
        source
      ) VALUES ($1, $2, $3, $4::jsonb, $5)
    `,
    [
      reportId,
      'pending_ml_api',
      'not-deployed',
      JSON.stringify(features),
      'pending',
    ]
  );
};

export const ingestReport = async (req, res, next) => {
  try {
    const latitude = Number(req.body?.latitude);
    const longitude = Number(req.body?.longitude);

    const validationError = validateCoordinates(latitude, longitude);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const features = await collectWeatherFeatures(latitude, longitude);

    const reportResult = await query(
      `
        INSERT INTO reports (latitude, longitude)
        VALUES ($1, $2)
        RETURNING id, created_at
      `,
      [latitude, longitude]
    );

    const report = reportResult.rows[0];

    await query(
      `
        INSERT INTO weather_features (
          report_id,
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
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      `,
      [
        report.id,
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

    await createPendingPredictionRow(report.id, {
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

    return res.status(201).json({
      reportId: report.id,
      createdAt: report.created_at,
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
        status: 'pending',
        message: 'ML API ainda nao implantada. Dados salvos e prontos para inferencia futura.',
      },
    });
  } catch (error) {
    return next(error);
  }
};
