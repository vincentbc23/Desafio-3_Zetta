import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { RefreshCw, Activity, AlertTriangle, Flame, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router';
import Plotly from 'plotly.js-dist-min';
import { AUTH_TOKEN_KEY, AUTH_USER_KEY, clearAuthSession, type FirefighterUser } from '../auth/session';

type EncodedNumericArray = {
  dtype?: string;
  bdata?: string;
};

type PlotlyTrace = {
  name?: string;
  y?: unknown;
};

type PlotlyFigure = {
  data?: PlotlyTrace[];
  layout?: {
    title?: string | { text?: string };
    [key: string]: unknown;
  };
};

type ChartDefinition = {
  id: string;
  filename: string;
  fallbackTitle: string;
};

type LoadedChart = ChartDefinition & {
  figure: PlotlyFigure;
};

const chartFiles: ChartDefinition[] = [
  { id: 'cidades', filename: 'cidades_mais_ocorrencias.json', fallbackTitle: 'Top Localidades com Ocorrencias' },
  { id: 'mes', filename: 'registros_historicos_mes.json', fallbackTitle: 'Registros Historicos por Mes' },
  { id: 'ano', filename: 'registros_historicos_ano.json', fallbackTitle: 'Registros Historicos por Ano' },
  { id: 'hora', filename: 'registros_historicos_hora.json', fallbackTitle: 'Registros por Hora' },
  { id: 'frp-hora', filename: 'frp_hora.json', fallbackTitle: 'FRP por Hora' },
  { id: 'frp-temp', filename: 'FRP_temperatura.json', fallbackTitle: 'FRP x Temperatura' },
  { id: 'frp-vento', filename: 'frp_vento.json', fallbackTitle: 'FRP x Vento' },
  { id: 'boxplot', filename: 'boxplot_risco_mes.json', fallbackTitle: 'Faixa de Risco por Mes' },
  { id: 'densidade', filename: 'mapa_densidade.json', fallbackTitle: 'Mapa de Densidade' },
  { id: 'mapa', filename: 'mapa_registros.json', fallbackTitle: 'Mapa de Registros' },
  { id: 'correlacao', filename: 'correlacao_geral.json', fallbackTitle: 'Correlacao Geral' },
  { id: 'desvios', filename: 'desvios_media_historica.json', fallbackTitle: 'Desvios da Media Historica' },
  { id: 'relogio', filename: 'relogio_registros_mes.json', fallbackTitle: 'Relogio de Registros por Mes' },
];

const tooltipStyle = {
  backgroundColor: '#1C1C1E',
  border: '1px solid rgba(255,255,255,0.2)',
  borderRadius: '12px',
  color: '#F2F2F7',
};

const formatNumber = (value: number) => new Intl.NumberFormat('pt-BR').format(value);

const formatDecimal = (value: number, digits = 2) =>
  new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);

const decodeNumericArray = (value: unknown): number[] => {
  if (Array.isArray(value)) {
    return value.map((item) => Number(item)).filter((item) => Number.isFinite(item));
  }

  if (!value || typeof value !== 'object') {
    return [];
  }

  const encoded = value as EncodedNumericArray;
  if (!encoded.dtype || !encoded.bdata) {
    return [];
  }

  const binary = atob(encoded.bdata);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }

  const view = new DataView(bytes.buffer);
  const result: number[] = [];

  if (encoded.dtype === 'i4') {
    for (let offset = 0; offset <= bytes.length - 4; offset += 4) {
      result.push(view.getInt32(offset, true));
    }
    return result;
  }

  if (encoded.dtype === 'f8') {
    for (let offset = 0; offset <= bytes.length - 8; offset += 8) {
      result.push(view.getFloat64(offset, true));
    }
    return result;
  }

  return [];
};

const extractTitle = (chart: LoadedChart): string => {
  const rawTitle = chart.figure.layout?.title;
  if (typeof rawTitle === 'string' && rawTitle.trim()) {
    return rawTitle;
  }

  if (rawTitle && typeof rawTitle === 'object' && typeof rawTitle.text === 'string' && rawTitle.text.trim()) {
    return rawTitle.text;
  }

  return chart.fallbackTitle;
};

function PlotlyPanel({ chart, heightClass = 'h-[340px]' }: { chart: LoadedChart; heightClass?: string }) {
  const plotRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!plotRef.current) {
      return;
    }

    const layout = {
      ...(chart.figure.layout || {}),
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      font: {
        color: '#F2F2F7',
        ...((chart.figure.layout?.font as Record<string, unknown> | undefined) || {}),
      },
      margin: {
        l: 50,
        r: 20,
        t: 48,
        b: 40,
        ...((chart.figure.layout?.margin as Record<string, unknown> | undefined) || {}),
      },
    };

    const config = {
      responsive: true,
      displaylogo: false,
      modeBarButtonsToRemove: ['lasso2d', 'select2d'],
    };

    void (Plotly as any).react(plotRef.current, chart.figure.data || [], layout, config);

    return () => {
      if (plotRef.current) {
        (Plotly as any).purge(plotRef.current);
      }
    };
  }, [chart]);

  return <div ref={plotRef} className={`w-full ${heightClass}`} />;
}

export default function Orgaos() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState<FirefighterUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [charts, setCharts] = useState<LoadedChart[]>([]);
  const [updatedAt, setUpdatedAt] = useState<string>('');

  const fetchCharts = async (backgroundRefresh = false) => {
    const token = window.localStorage.getItem(AUTH_TOKEN_KEY);

    if (!token) {
      clearAuthSession();
      navigate('/login', { replace: true });
      return;
    }

    if (backgroundRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const loaded = await Promise.all(
        chartFiles.map(async (item) => {
          const response = await fetch(`/api/graficos/${item.filename}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            throw new Error(`Falha ao carregar ${item.filename}`);
          }

          const figure = (await response.json()) as PlotlyFigure;
          return {
            ...item,
            figure,
          };
        })
      );

      setCharts(loaded);
      setUpdatedAt(new Date().toISOString());
      setErrorMessage('');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Nao foi possivel carregar os graficos em JSON.';
      setErrorMessage(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const cachedUser = window.localStorage.getItem(AUTH_USER_KEY);
    if (cachedUser) {
      try {
        setUsuario(JSON.parse(cachedUser) as FirefighterUser);
      } catch {
        window.localStorage.removeItem(AUTH_USER_KEY);
      }
    }

    void fetchCharts(false);
  }, []);

  const handleLogout = async () => {
    const token = window.localStorage.getItem(AUTH_TOKEN_KEY);

    if (token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch {
        // Local logout still works even if backend request fails.
      }
    }

    clearAuthSession();
    navigate('/login', { replace: true });
  };

  const totalRegistros = useMemo(() => {
    const byYear = charts.find((item) => item.id === 'ano');
    const trace = byYear?.figure.data?.[0];
    const values = decodeNumericArray(trace?.y);
    return values.reduce((acc, value) => acc + value, 0);
  }, [charts]);

  const totalPontos = useMemo(() => {
    return charts.reduce((acc, chart) => {
      const trace = chart.figure.data?.[0];
      return acc + decodeNumericArray(trace?.y).length;
    }, 0);
  }, [charts]);

  const riscoMedio = useMemo(() => {
    const boxplot = charts.find((item) => item.id === 'boxplot');
    const medianaTrace = boxplot?.figure.data?.find((trace) =>
      typeof trace.name === 'string' ? trace.name.toLowerCase().includes('mediana') : false
    );

    const values = decodeNumericArray((medianaTrace || boxplot?.figure.data?.[0])?.y);
    if (!values.length) {
      return 0;
    }

    const average = values.reduce((acc, value) => acc + value, 0) / values.length;
    return Math.max(0, Math.min(1, average));
  }, [charts]);

  const chartById = useMemo(() => {
    return charts.reduce<Record<string, LoadedChart>>((acc, chart) => {
      acc[chart.id] = chart;
      return acc;
    }, {});
  }, [charts]);

  const mainHistoricalChart = chartById.cidades;
  const monthlyChart = chartById.mes;
  const yearlyChart = chartById.ano;
  const mapDensityChart = chartById.densidade;
  const mapRecordsChart = chartById.mapa;

  const remainingCharts = useMemo(() => {
    return charts.filter((chart) => !['cidades', 'mes', 'ano', 'densidade', 'mapa'].includes(chart.id));
  }, [charts]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A1929] flex items-center justify-center text-[#F2F2F7]">
        <div className="flex items-center gap-3 bg-[#1C1C1E]/80 border border-white/10 rounded-2xl px-6 py-4">
          <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Carregando graficos dos JSON locais...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A1929] text-[#F2F2F7]">
      <div className="bg-[#1C1C1E]/90 backdrop-blur-md border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Sala de Analise dos Orgaos</h1>
            <p className="text-sm text-gray-400">Visualizacoes renderizadas direto dos JSON da pasta graficos</p>
          </div>

          <div className="flex w-full lg:w-auto flex-wrap items-center gap-2 sm:gap-3">
            {updatedAt && <span className="text-xs text-gray-300">Atualizado: {new Date(updatedAt).toLocaleString('pt-BR')}</span>}

            <button
              type="button"
              onClick={() => void fetchCharts(true)}
              className="bg-[#1C1C1E]/80 border border-white/20 text-[#F2F2F7] px-3 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-[#2A2A2C] transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Recarregar JSON
            </button>

            <button
              type="button"
              onClick={() => navigate('/painel')}
              className="bg-[#1C1C1E]/80 border border-white/20 text-[#F2F2F7] px-3 py-2 rounded-lg text-sm hover:bg-[#2A2A2C] transition-colors"
            >
              Voltar ao painel
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="text-gray-300 hover:text-white transition-colors flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        {usuario && (
          <div className="bg-[#1C1C1E]/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-200">
            Sessao ativa: {usuario.name} ({usuario.email})
          </div>
        )}

        {errorMessage && <div className="bg-[#FF3B30]/10 border border-[#FF3B30]/40 rounded-lg p-4 text-sm">{errorMessage}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          <motion.div className="bg-[#1C1C1E]/80 border border-white/10 rounded-xl p-6" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-2">
              <Flame className="w-5 h-5 text-[#FF3B30]" />
              <h2 className="font-semibold">Total de Registros (JSON)</h2>
            </div>
            <p className="text-4xl font-bold">{formatNumber(totalRegistros)}</p>
          </motion.div>

          <motion.div className="bg-[#1C1C1E]/80 border border-white/10 rounded-xl p-6" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-2">
              <Activity className="w-5 h-5 text-[#FF9500]" />
              <h2 className="font-semibold">Arquivos Carregados</h2>
            </div>
            <p className="text-4xl font-bold">{formatNumber(charts.length)}</p>
          </motion.div>

          <motion.div className="bg-[#1C1C1E]/80 border border-white/10 rounded-xl p-6" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="w-5 h-5 text-[#FFCC00]" />
              <h2 className="font-semibold">Risco Medio (Mediana)</h2>
            </div>
            <p className="text-4xl font-bold">{formatDecimal(riscoMedio * 100, 1)}%</p>
            <p className="text-xs text-gray-400 mt-2">Pontos totais plotados: {formatNumber(totalPontos)}</p>
          </motion.div>
        </div>

        {mainHistoricalChart && (
          <section className="bg-[#1C1C1E]/80 border border-white/10 rounded-xl p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-5">
              <h3 className="font-semibold text-lg">{extractTitle(mainHistoricalChart)}</h3>
              <p className="text-xs text-gray-400">Visualizacao ampliada para apoiar comparacao entre municipios.</p>
            </div>
            <PlotlyPanel chart={mainHistoricalChart} heightClass="h-[300px] sm:h-[420px] lg:h-[560px]" />
          </section>
        )}

        {(monthlyChart || yearlyChart) && (
          <section className="bg-[#1C1C1E]/80 border border-white/10 rounded-xl p-4 sm:p-6 lg:p-8">
            <div className="mb-5">
              <h3 className="font-semibold text-lg">Evolucao Temporal dos Registros</h3>
              <p className="text-xs text-gray-400 mt-1">Mes e ano na mesma secao para facilitar leitura de tendencia e sazonalidade.</p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {monthlyChart && (
                <div className="bg-black/10 border border-white/10 rounded-lg p-4">
                  <h4 className="font-medium mb-3 text-sm">{extractTitle(monthlyChart)}</h4>
                  <PlotlyPanel chart={monthlyChart} heightClass="h-[280px] sm:h-[320px] lg:h-[360px]" />
                </div>
              )}

              {yearlyChart && (
                <div className="bg-black/10 border border-white/10 rounded-lg p-4">
                  <h4 className="font-medium mb-3 text-sm">{extractTitle(yearlyChart)}</h4>
                  <PlotlyPanel chart={yearlyChart} heightClass="h-[280px] sm:h-[320px] lg:h-[360px]" />
                </div>
              )}
            </div>
          </section>
        )}

        {(mapDensityChart || mapRecordsChart) && (
          <section className="bg-[#1C1C1E]/80 border border-white/10 rounded-xl p-4 sm:p-6 lg:p-8">
            <div className="mb-5">
              <h3 className="font-semibold text-lg">Mapas de Monitoramento</h3>
              <p className="text-xs text-gray-400 mt-1">Visualizacao ampliada para leitura espacial de densidade e distribuicao de registros.</p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {mapDensityChart && (
                <div className="bg-black/10 border border-white/10 rounded-lg p-4">
                  <h4 className="font-medium mb-3 text-sm">{extractTitle(mapDensityChart)}</h4>
                  <PlotlyPanel chart={mapDensityChart} heightClass="h-[300px] sm:h-[420px] lg:h-[560px]" />
                </div>
              )}

              {mapRecordsChart && (
                <div className="bg-black/10 border border-white/10 rounded-lg p-4">
                  <h4 className="font-medium mb-3 text-sm">{extractTitle(mapRecordsChart)}</h4>
                  <PlotlyPanel chart={mapRecordsChart} heightClass="h-[300px] sm:h-[420px] lg:h-[560px]" />
                </div>
              )}
            </div>
          </section>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {remainingCharts.map((chart) => (
            <div key={chart.id} className="bg-[#1C1C1E]/80 border border-white/10 rounded-xl p-6">
              <h3 className="font-semibold mb-4">{extractTitle(chart)}</h3>
              <PlotlyPanel chart={chart} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
