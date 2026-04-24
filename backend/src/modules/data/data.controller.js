import { query } from '../../shared/db/client.js';

const toNumber = (value) => Number(value || 0);

const monthLabels = {
  1: 'Jan',
  2: 'Fev',
  3: 'Mar',
  4: 'Abr',
  5: 'Mai',
  6: 'Jun',
  7: 'Jul',
  8: 'Ago',
  9: 'Set',
  10: 'Out',
  11: 'Nov',
  12: 'Dez',
};

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

export const getOrgaosAnalytics = async (_req, res, next) => {
  try {
    const [
      cardsResult,
      byRegionResult,
      byClassResult,
      byHourResult,
      byMonthResult,
      byYearResult,
      topLocationsResult,
      frpByMonthResult,
      frpByHourResult,
      frpVsTempResult,
      frpVsWindResult,
      riskBoxplotByMonthResult,
      latestReportsResult,
    ] = await Promise.all([
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
            CASE
              WHEN ABS(r.latitude) <= 2 AND ABS(r.longitude) <= 2 THEN 'Centro'
              WHEN r.latitude >= 0 AND r.longitude >= 0 THEN 'Norte'
              WHEN r.latitude < 0 AND r.longitude >= 0 THEN 'Leste'
              WHEN r.latitude < 0 AND r.longitude < 0 THEN 'Sul'
              ELSE 'Oeste'
            END AS nome,
            COUNT(*)::int AS ocorrencias
          FROM reports r
          GROUP BY 1
          ORDER BY 2 DESC
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
            LPAD(hours.hour::text, 2, '0') || 'h' AS hora,
            COALESCE(counts.ocorrencias, 0)::int AS ocorrencias
          FROM generate_series(0, 23) AS hours(hour)
          LEFT JOIN (
            SELECT EXTRACT(HOUR FROM created_at)::int AS hour, COUNT(*)::int AS ocorrencias
            FROM reports
            GROUP BY 1
          ) counts ON counts.hour = hours.hour
          ORDER BY hours.hour
        `
      ),
      query(
        `
          SELECT
            months.mes,
            COALESCE(counts.quantidade, 0)::int AS quantidade
          FROM generate_series(1, 12) AS months(mes)
          LEFT JOIN (
            SELECT EXTRACT(MONTH FROM created_at)::int AS mes, COUNT(*)::int AS quantidade
            FROM reports
            GROUP BY 1
          ) counts ON counts.mes = months.mes
          ORDER BY months.mes
        `
      ),
      query(
        `
          SELECT
            EXTRACT(YEAR FROM created_at)::int AS ano,
            COUNT(*)::int AS quantidade
          FROM reports
          GROUP BY 1
          ORDER BY 1
        `
      ),
      query(
        `
          SELECT
            COALESCE(NULLIF(UPPER(TRIM(SPLIT_PART(r.description, '-', 1))), ''), 'NÃO INFORMADO') AS localidade,
            COUNT(*)::int AS focos
          FROM reports r
          GROUP BY 1
          ORDER BY 2 DESC
          LIMIT 10
        `
      ),
      query(
        `
          SELECT
            months.mes,
            COALESCE(frp.media_frp, 0)::double precision AS media_frp
          FROM generate_series(1, 12) AS months(mes)
          LEFT JOIN (
            SELECT
              EXTRACT(MONTH FROM r.created_at)::int AS mes,
              AVG(COALESCE(p.frp_previsto, 0))::double precision AS media_frp
            FROM reports r
            LEFT JOIN LATERAL (
              SELECT frp_previsto
              FROM predictions
              WHERE report_id = r.id
              ORDER BY created_at DESC
              LIMIT 1
            ) p ON true
            GROUP BY 1
          ) frp ON frp.mes = months.mes
          ORDER BY months.mes
        `
      ),
      query(
        `
          SELECT
            LPAD(hours.hour::text, 2, '0') || 'h' AS hora,
            COALESCE(values.media_frp, 0)::double precision AS media_frp
          FROM generate_series(0, 23) AS hours(hour)
          LEFT JOIN (
            SELECT
              wf.hora,
              AVG(COALESCE(p.frp_previsto, 0))::double precision AS media_frp
            FROM weather_features wf
            LEFT JOIN LATERAL (
              SELECT frp_previsto
              FROM predictions
              WHERE report_id = wf.report_id
              ORDER BY created_at DESC
              LIMIT 1
            ) p ON true
            GROUP BY 1
          ) values ON values.hora = hours.hour
          ORDER BY hours.hour
        `
      ),
      query(
        `
          SELECT
            ROUND(wf.temperatura_c::numeric, 0)::int AS temperatura,
            AVG(COALESCE(p.frp_previsto, 0))::double precision AS media_frp,
            COUNT(*)::int AS amostras
          FROM weather_features wf
          LEFT JOIN LATERAL (
            SELECT frp_previsto
            FROM predictions
            WHERE report_id = wf.report_id
            ORDER BY created_at DESC
            LIMIT 1
          ) p ON true
          GROUP BY 1
          ORDER BY 1
        `
      ),
      query(
        `
          SELECT
            ROUND(wf.vento_ms::numeric, 1)::double precision AS vento,
            AVG(COALESCE(p.frp_previsto, 0))::double precision AS media_frp,
            COUNT(*)::int AS amostras
          FROM weather_features wf
          LEFT JOIN LATERAL (
            SELECT frp_previsto
            FROM predictions
            WHERE report_id = wf.report_id
            ORDER BY created_at DESC
            LIMIT 1
          ) p ON true
          GROUP BY 1
          ORDER BY 1
        `
      ),
      query(
        `
          SELECT
            months.mes,
            COALESCE(stats.minimo, 0)::double precision AS minimo,
            COALESCE(stats.q1, 0)::double precision AS q1,
            COALESCE(stats.mediana, 0)::double precision AS mediana,
            COALESCE(stats.q3, 0)::double precision AS q3,
            COALESCE(stats.maximo, 0)::double precision AS maximo
          FROM generate_series(1, 12) AS months(mes)
          LEFT JOIN (
            SELECT
              EXTRACT(MONTH FROM r.created_at)::int AS mes,
              MIN(p.prob_incendio) AS minimo,
              PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY p.prob_incendio) AS q1,
              PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY p.prob_incendio) AS mediana,
              PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY p.prob_incendio) AS q3,
              MAX(p.prob_incendio) AS maximo
            FROM reports r
            LEFT JOIN LATERAL (
              SELECT prob_incendio
              FROM predictions
              WHERE report_id = r.id
              ORDER BY created_at DESC
              LIMIT 1
            ) p ON true
            WHERE p.prob_incendio IS NOT NULL
            GROUP BY 1
          ) stats ON stats.mes = months.mes
          ORDER BY months.mes
        `
      ),
      query(
        `
          SELECT
            r.id,
            r.latitude,
            r.longitude,
            r.description,
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

    const cards = cardsResult.rows[0] || {};
    const highRiskResult = await query(
      `
        SELECT
          COUNT(DISTINCT p.report_id)::int AS high_risk_reports
        FROM predictions p
        WHERE p.prob_incendio >= 0.7 OR LOWER(COALESCE(p.classe_prevista, '')) = 'alto'
      `
    );

    const highRisk = highRiskResult.rows[0] || {};

    return res.status(200).json({
      resumo: {
        totalReports: toNumber(cards.total_reports),
        reportsLast24h: toNumber(cards.reports_last_24h),
        highRiskReports: toNumber(highRisk.high_risk_reports),
      },
      graficos: {
        cidadesMaisOcorrencias: topLocationsResult.rows,
        registrosHistoricosMes: byMonthResult.rows.map((item) => ({
          ...item,
          mesLabel: monthLabels[item.mes] || String(item.mes),
        })),
        registrosHistoricosAno: byYearResult.rows,
        registrosHistoricosHora: byHourResult.rows,
        variacaoFrpMes: frpByMonthResult.rows.map((item) => ({
          ...item,
          mesLabel: monthLabels[item.mes] || String(item.mes),
        })),
        frpHora: frpByHourResult.rows,
        frpTemperatura: frpVsTempResult.rows,
        frpVento: frpVsWindResult.rows,
        boxplotRiscoMes: riskBoxplotByMonthResult.rows.map((item) => ({
          ...item,
          mesLabel: monthLabels[item.mes] || String(item.mes),
        })),
        porRegiao: byRegionResult.rows,
        porClasse: byClassResult.rows,
      },
      ultimosReportes: latestReportsResult.rows,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    return next(error);
  }
};
