import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
} from 'recharts';
import { RefreshCw, Activity, AlertTriangle, Flame, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router';
import { AUTH_TOKEN_KEY, AUTH_USER_KEY, clearAuthSession, type FirefighterUser } from '../auth/session';

interface AnalyticsResponse {
  resumo: {
    totalReports: number;
    reportsLast24h: number;
    highRiskReports: number;
  };
  graficos: {
    cidadesMaisOcorrencias: Array<{ localidade: string; focos: number }>;
    registrosHistoricosMes: Array<{ mes: number; mesLabel: string; quantidade: number }>;
    registrosHistoricosAno: Array<{ ano: number; quantidade: number }>;
    registrosHistoricosHora: Array<{ hora: string; ocorrencias: number }>;
    variacaoFrpMes: Array<{ mes: number; mesLabel: string; media_frp: number }>;
    frpHora: Array<{ hora: string; media_frp: number }>;
    frpTemperatura: Array<{ temperatura: number; media_frp: number; amostras: number }>;
    frpVento: Array<{ vento: number; media_frp: number; amostras: number }>;
    boxplotRiscoMes: Array<{ mes: number; mesLabel: string; minimo: number; q1: number; mediana: number; q3: number; maximo: number }>;
    porRegiao: Array<{ nome: string; ocorrencias: number }>;
    porClasse: Array<{ nome: string; valor: number }>;
  };
  ultimosReportes: Array<{
    id: string;
    description: string | null;
    created_at: string;
    temperatura_c: number | null;
    umidade_relativa_pct: number | null;
    vento_ms: number | null;
    prob_incendio: number | null;
    classe_prevista: string | null;
    frp_previsto: number | null;
  }>;
  updatedAt: string;
}

const classeColors: Record<string, string> = {
  alto: '#FF3B30',
  medio: '#FF9500',
  baixo: '#FFCC00',
  indefinido: '#34C759',
};

const formatNumber = (value: number) => new Intl.NumberFormat('pt-BR').format(value);

const formatDecimal = (value: number, digits = 2) => new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: digits,
  maximumFractionDigits: digits,
}).format(value);

const tooltipStyle = {
  backgroundColor: '#1C1C1E',
  border: '1px solid rgba(255,255,255,0.2)',
  borderRadius: '12px',
  color: '#F2F2F7',
};

export default function Orgaos() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState<FirefighterUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [data, setData] = useState<AnalyticsResponse | null>(null);

  const fetchAnalytics = async (backgroundRefresh = false) => {
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
      const response = await fetch('/api/orgaos/analytics', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorPayload = (await response.json().catch(() => null)) as { message?: string } | null;
        throw new Error(errorPayload?.message || 'Não foi possível carregar os gráficos de análise.');
      }

      const payload = (await response.json()) as AnalyticsResponse;
      setData(payload);
      setErrorMessage('');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Não foi possível carregar os gráficos de análise.';
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

    void fetchAnalytics(false);
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
        // logout local permanece funcional mesmo sem resposta do backend
      }
    }

    clearAuthSession();
    navigate('/login', { replace: true });
  };

  const riscoMedio = useMemo(() => {
    const valores = data?.graficos.boxplotRiscoMes ?? [];
    if (!valores.length) {
      return 0;
    }

    const total = valores.reduce((acc, item) => acc + Number(item.mediana || 0), 0);
    return total / valores.length;
  }, [data]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A1929] flex items-center justify-center text-[#F2F2F7]">
        <div className="flex items-center gap-3 bg-[#1C1C1E]/80 border border-white/10 rounded-2xl px-6 py-4">
          <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Carregando análises avançadas...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A1929] text-[#F2F2F7]">
      <div className="bg-[#1C1C1E]/90 backdrop-blur-md border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-8 py-4 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Sala de Análise dos Órgãos</h1>
            <p className="text-sm text-gray-400">Visualizações estratégicas para profissionais de resposta</p>
          </div>

          <div className="flex items-center gap-3">
            {data?.updatedAt && (
              <span className="text-xs text-gray-300">
                Atualizado: {new Date(data.updatedAt).toLocaleString('pt-BR')}
              </span>
            )}

            <button
              type="button"
              onClick={() => void fetchAnalytics(true)}
              className="bg-[#1C1C1E]/80 border border-white/20 text-[#F2F2F7] px-3 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-[#2A2A2C] transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Atualizar
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

      <div className="max-w-[1600px] mx-auto px-8 py-8 space-y-8">
        {usuario && (
          <div className="bg-[#1C1C1E]/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-200">
            Sessão ativa: {usuario.name} ({usuario.email})
          </div>
        )}

        {errorMessage && (
          <div className="bg-[#FF3B30]/10 border border-[#FF3B30]/40 rounded-lg p-4 text-sm">
            {errorMessage}
          </div>
        )}

        <div className="grid grid-cols-3 gap-6">
          <motion.div className="bg-[#1C1C1E]/80 border border-white/10 rounded-xl p-6" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-2">
              <Flame className="w-5 h-5 text-[#FF3B30]" />
              <h2 className="font-semibold">Total de Reportes</h2>
            </div>
            <p className="text-4xl font-bold">{formatNumber(data?.resumo.totalReports ?? 0)}</p>
          </motion.div>

          <motion.div className="bg-[#1C1C1E]/80 border border-white/10 rounded-xl p-6" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-2">
              <Activity className="w-5 h-5 text-[#FF9500]" />
              <h2 className="font-semibold">Últimas 24h</h2>
            </div>
            <p className="text-4xl font-bold">{formatNumber(data?.resumo.reportsLast24h ?? 0)}</p>
          </motion.div>

          <motion.div className="bg-[#1C1C1E]/80 border border-white/10 rounded-xl p-6" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="w-5 h-5 text-[#FFCC00]" />
              <h2 className="font-semibold">Risco Alto</h2>
            </div>
            <p className="text-4xl font-bold">{formatNumber(data?.resumo.highRiskReports ?? 0)}</p>
            <p className="text-xs text-gray-400 mt-2">Mediana média de risco: {formatDecimal(riscoMedio * 100, 1)}%</p>
          </motion.div>
        </div>

        <div className="grid grid-cols-2 gap-8">
          <div className="bg-[#1C1C1E]/80 border border-white/10 rounded-xl p-6">
            <h3 className="font-semibold mb-4">Top Localidades com Ocorrências</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data?.graficos.cidadesMaisOcorrencias || []} layout="vertical" margin={{ left: 32 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                <XAxis type="number" stroke="#F2F2F7" />
                <YAxis type="category" dataKey="localidade" stroke="#F2F2F7" width={140} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="focos" fill="#FF4500" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-[#1C1C1E]/80 border border-white/10 rounded-xl p-6">
            <h3 className="font-semibold mb-4">Registros Históricos por Mês</h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={data?.graficos.registrosHistoricosMes || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                <XAxis dataKey="mesLabel" stroke="#F2F2F7" />
                <YAxis stroke="#F2F2F7" />
                <Tooltip contentStyle={tooltipStyle} />
                <Line dataKey="quantidade" type="monotone" stroke="#FF3B30" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-[#1C1C1E]/80 border border-white/10 rounded-xl p-6">
            <h3 className="font-semibold mb-4">Registros por Hora</h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={data?.graficos.registrosHistoricosHora || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                <XAxis dataKey="hora" stroke="#F2F2F7" />
                <YAxis stroke="#F2F2F7" />
                <Tooltip contentStyle={tooltipStyle} />
                <Line dataKey="ocorrencias" type="monotone" stroke="#FF6A00" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-[#1C1C1E]/80 border border-white/10 rounded-xl p-6">
            <h3 className="font-semibold mb-4">Variação de FRP por Mês</h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={data?.graficos.variacaoFrpMes || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                <XAxis dataKey="mesLabel" stroke="#F2F2F7" />
                <YAxis stroke="#F2F2F7" />
                <Tooltip contentStyle={tooltipStyle} />
                <Line dataKey="media_frp" type="monotone" stroke="#34C759" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-[#1C1C1E]/80 border border-white/10 rounded-xl p-6">
            <h3 className="font-semibold mb-4">FRP por Hora</h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={data?.graficos.frpHora || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                <XAxis dataKey="hora" stroke="#F2F2F7" />
                <YAxis stroke="#F2F2F7" />
                <Tooltip contentStyle={tooltipStyle} />
                <Line dataKey="media_frp" type="monotone" stroke="#00B8D9" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-[#1C1C1E]/80 border border-white/10 rounded-xl p-6">
            <h3 className="font-semibold mb-4">Distribuição de Classes de Risco</h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={data?.graficos.porClasse || []}
                  dataKey="valor"
                  nameKey="nome"
                  cx="50%"
                  cy="50%"
                  outerRadius={95}
                  label={(entry) => `${entry.nome}: ${entry.valor}`}
                >
                  {(data?.graficos.porClasse || []).map((entry) => (
                    <Cell key={`classe-${entry.nome}`} fill={classeColors[entry.nome] || '#8E8E93'} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-[#1C1C1E]/80 border border-white/10 rounded-xl p-6">
            <h3 className="font-semibold mb-4">FRP x Temperatura</h3>
            <ResponsiveContainer width="100%" height={280}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                <XAxis dataKey="temperatura" name="Temperatura" unit="°C" stroke="#F2F2F7" />
                <YAxis dataKey="media_frp" name="FRP" stroke="#F2F2F7" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={tooltipStyle} />
                <Scatter name="FRP" data={data?.graficos.frpTemperatura || []} fill="#FF3B30" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-[#1C1C1E]/80 border border-white/10 rounded-xl p-6">
            <h3 className="font-semibold mb-4">FRP x Vento</h3>
            <ResponsiveContainer width="100%" height={280}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                <XAxis dataKey="vento" name="Vento" unit="m/s" stroke="#F2F2F7" />
                <YAxis dataKey="media_frp" name="FRP" stroke="#F2F2F7" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={tooltipStyle} />
                <Scatter name="FRP" data={data?.graficos.frpVento || []} fill="#FF9500" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-[#1C1C1E]/80 border border-white/10 rounded-xl p-6 col-span-2">
            <h3 className="font-semibold mb-4">Faixa de Risco por Mês (Min/Q1/Mediana/Q3/Max)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data?.graficos.boxplotRiscoMes || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                <XAxis dataKey="mesLabel" stroke="#F2F2F7" />
                <YAxis stroke="#F2F2F7" domain={[0, 1]} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line dataKey="minimo" stroke="#8E8E93" dot={false} />
                <Line dataKey="q1" stroke="#00B8D9" dot={false} />
                <Line dataKey="mediana" stroke="#34C759" strokeWidth={3} dot={false} />
                <Line dataKey="q3" stroke="#FF9500" dot={false} />
                <Line dataKey="maximo" stroke="#FF3B30" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-[#1C1C1E]/80 border border-white/10 rounded-xl p-6 col-span-2">
            <h3 className="font-semibold mb-4">Registros Históricos por Ano</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data?.graficos.registrosHistoricosAno || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                <XAxis dataKey="ano" stroke="#F2F2F7" />
                <YAxis stroke="#F2F2F7" />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="quantidade" fill="#FF6A00" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#1C1C1E]/80 border border-white/10 rounded-xl p-6 overflow-x-auto">
          <h3 className="font-semibold mb-4">Detalhes da Base de Dados (últimos 20 registros)</h3>
          <table className="w-full text-sm text-left min-w-[1100px]">
            <thead>
              <tr className="text-gray-400 border-b border-white/10">
                <th className="py-2 pr-3">Data</th>
                <th className="py-2 pr-3">Descrição</th>
                <th className="py-2 pr-3">Classe</th>
                <th className="py-2 pr-3">Prob.</th>
                <th className="py-2 pr-3">FRP</th>
                <th className="py-2 pr-3">Temp (°C)</th>
                <th className="py-2 pr-3">Umidade (%)</th>
                <th className="py-2 pr-3">Vento (m/s)</th>
              </tr>
            </thead>
            <tbody>
              {(data?.ultimosReportes || []).map((item) => (
                <tr key={item.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-2 pr-3 whitespace-nowrap">{new Date(item.created_at).toLocaleString('pt-BR')}</td>
                  <td className="py-2 pr-3">{item.description || 'Sem descrição'}</td>
                  <td className="py-2 pr-3 uppercase">{item.classe_prevista || 'indefinido'}</td>
                  <td className="py-2 pr-3">{item.prob_incendio != null ? `${formatDecimal(item.prob_incendio * 100, 1)}%` : '-'}</td>
                  <td className="py-2 pr-3">{item.frp_previsto != null ? formatDecimal(item.frp_previsto) : '-'}</td>
                  <td className="py-2 pr-3">{item.temperatura_c != null ? formatDecimal(item.temperatura_c, 1) : '-'}</td>
                  <td className="py-2 pr-3">{item.umidade_relativa_pct != null ? formatDecimal(item.umidade_relativa_pct, 1) : '-'}</td>
                  <td className="py-2 pr-3">{item.vento_ms != null ? formatDecimal(item.vento_ms, 2) : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}