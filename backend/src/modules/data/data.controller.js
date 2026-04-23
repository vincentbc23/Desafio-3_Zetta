import { query } from '../../shared/db/client.js';

const toNumber = (value) => Number(value || 0);

export const getCards = async (_req, res, next) => {
  try {
    const [summaryResult, highRiskResult] = await Promise.all([
      query(
        `
          SELECT
            COUNT(*)::int AS total_reports,
            COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '24 hours')::int AS reports_last_24h
          FROM reports
        `
      ),
      query(
        `
          SELECT
            COUNT(DISTINCT p.report_id)::int AS high_risk_reports
          FROM predictions p
          WHERE p.prob_incendio >= 0.7 OR LOWER(COALESCE(p.classe_prevista, '')) = 'alto'
        `
      ),
    ]);

    const summary = summaryResult.rows[0] || {};
    const highRisk = highRiskResult.rows[0] || {};

    const payload = {
      totals: {
        totalReports: toNumber(summary.total_reports),
        reportsLast24h: toNumber(summary.reports_last_24h),
        highRiskReports: toNumber(highRisk.high_risk_reports),
      },
      cards: [
        {
          id: 'incendios_hoje',
          titulo: 'Incêndios hoje',
          valor: toNumber(summary.reports_last_24h),
          icon: 'flame',
        },
        {
          id: 'reports_total',
          titulo: 'Total de reportes',
          valor: toNumber(summary.total_reports),
          icon: 'map-pin',
        },
        {
          id: 'risco_alto',
          titulo: 'Risco alto',
          valor: toNumber(highRisk.high_risk_reports),
          icon: 'alert-triangle',
        },
      ],
      updatedAt: new Date().toISOString(),
    };

    return res.status(200).json(payload);
  } catch (error) {
    return next(error);
  }
};

export const getDados = async (_req, res, next) => {
  try {
    const [summaryResult, regionResult, hourlyResult, classesResult, latestReportsResult] = await Promise.all([
      query(
        `
          SELECT
            COUNT(*)::int AS total_incendios,
            COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '24 hours')::int AS incendios_ultimas_24h
          FROM reports
        `
      ),
      query(
        `
          SELECT
            CASE
              WHEN ABS(r.latitude) <= 2 AND ABS(r.longitude) <= 2 THEN 'Centro'
              WHEN r.latitude >= 0 AND r.longitude >= 0 THEN 'Norte'
              WHEN r.latitude < 0 AND r.longitude >= 0 THEN 'Leste'
              WHEN r.latitude < 0 AND r.longitude < 0 THEN 'Sul'
              ELSE 'Oeste'
            END AS nome,
            COUNT(*)::int AS incendios
          FROM reports r
          GROUP BY 1
          ORDER BY 2 DESC
        `
      ),
      query(
        `
          SELECT
            LPAD(EXTRACT(HOUR FROM r.created_at)::text, 2, '0') || 'h' AS hora,
            COUNT(*)::int AS ocorrencias
          FROM reports r
          GROUP BY 1
          ORDER BY 1
        `
      ),
      query(
        `
          SELECT
            COALESCE(LOWER(p.classe_prevista), 'indefinido') AS nome,
            COUNT(*)::int AS valor
          FROM predictions p
          GROUP BY 1
          ORDER BY 2 DESC
        `
      ),
      query(
        `
          SELECT
            r.id,
            r.latitude,
            r.longitude,
            r.description,
            r.accuracy_meters,
            r.location_source,
            r.location_confirmed,
            r.created_at,
            wf.temperatura_c,
            wf.umidade_relativa_pct,
            wf.vento_ms,
            p.prob_incendio,
            p.classe_prevista,
            p.frp_previsto
          FROM reports r
          LEFT JOIN weather_features wf ON wf.report_id = r.id
          LEFT JOIN LATERAL (
            SELECT
              prob_incendio,
              classe_prevista,
              frp_previsto,
              created_at
            FROM predictions
            WHERE report_id = r.id
            ORDER BY created_at DESC
            LIMIT 1
          ) p ON true
          ORDER BY r.created_at DESC
          LIMIT 20
        `
      ),
    ]);

    return res.status(200).json({
      resumo: {
        totalIncendios: toNumber(summaryResult.rows[0]?.total_incendios),
        incendiosUltimas24h: toNumber(summaryResult.rows[0]?.incendios_ultimas_24h),
      },
      porRegiao: regionResult.rows,
      porHorario: hourlyResult.rows,
      porClasse: classesResult.rows,
      ultimosReportes: latestReportsResult.rows,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    return next(error);
  }
};
