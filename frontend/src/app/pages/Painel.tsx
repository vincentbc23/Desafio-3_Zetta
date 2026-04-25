import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import {
  Shield,
  AlertTriangle,
  Bell,
  MapPin,
  Clock,
  Users,
  Radio,
  CheckCircle,
  AlertCircle,
  LogOut,
  TrendingUp,
  Activity
} from 'lucide-react';
import { AUTH_TOKEN_KEY, AUTH_USER_KEY, clearAuthSession, type FirefighterUser } from '../auth/session';

type ApiAlerta = {
  id: number;
  latitude: number | null;
  longitude: number | null;
  description: string | null;
  created_at: string;
  prob_incendio: number | null;
  classe_prevista: string | null;
  frp_previsto: number | null;
  temperatura_c: number | null;
  umidade_relativa_pct: number | null;
  vento_ms: number | null;
};

type AlertaPainel = {
  id: number;
  tipo: 'CRÍTICO' | 'URGENTE' | 'MODERADO';
  descricao: string;
  localizacao: string;
  status: 'EM ANDAMENTO' | 'RESPONDENDO' | 'MONITORANDO';
  tempo: string;
  recursos: string;
  intensidadeProvavel: string;
  temperatura: string;
  umidade: string;
  vento: string;
  cor: string;
};

const formatTempoRelativo = (createdAt: string) => {
  const diffMs = Date.now() - new Date(createdAt).getTime();
  const diffMin = Math.max(1, Math.floor(diffMs / 60000));

  if (diffMin < 60) {
    return `${diffMin} min atrás`;
  }

  const hours = Math.floor(diffMin / 60);
  const minutes = diffMin % 60;
  return minutes > 0 ? `${hours}h ${minutes}min atrás` : `${hours}h atrás`;
};

const classifyAlert = (probIncendio: number | null, classePrevista: string | null): AlertaPainel['tipo'] => {
  const classe = (classePrevista || '').toLowerCase();
  const prob = Number(probIncendio || 0);

  if (classe === 'alto' || prob >= 0.7) {
    return 'CRÍTICO';
  }

  if (classe === 'medio' || prob >= 0.4) {
    return 'URGENTE';
  }

  return 'MODERADO';
};

const buildAlertaPainel = (item: ApiAlerta): AlertaPainel => {
  const tipo = classifyAlert(item.prob_incendio, item.classe_prevista);
  const lat = typeof item.latitude === 'number' ? item.latitude.toFixed(4) : 'N/A';
  const lon = typeof item.longitude === 'number' ? item.longitude.toFixed(4) : 'N/A';
  const intensidadeProvavel =
    typeof item.frp_previsto === 'number'
      ? `${item.frp_previsto.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} FRP`
      : 'Nao informado';

  return {
    id: item.id,
    tipo,
    descricao: item.description || 'Reporte de foco de incendio',
    localizacao: `Coordenadas (${lat}, ${lon})`,
    status: tipo === 'CRÍTICO' ? 'EM ANDAMENTO' : tipo === 'URGENTE' ? 'RESPONDENDO' : 'MONITORANDO',
    tempo: formatTempoRelativo(item.created_at),
    recursos:
      tipo === 'CRÍTICO'
        ? '4 viaturas, 2 aeronaves'
        : tipo === 'URGENTE'
          ? '2 viaturas em deslocamento'
          : '1 viatura em observação',
    intensidadeProvavel,
    temperatura:
      typeof item.temperatura_c === 'number'
        ? `${item.temperatura_c.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} °C`
        : 'Nao informado',
    umidade:
      typeof item.umidade_relativa_pct === 'number'
        ? `${item.umidade_relativa_pct.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`
        : 'Nao informado',
    vento:
      typeof item.vento_ms === 'number'
        ? `${item.vento_ms.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} m/s`
        : 'Nao informado',
    cor: tipo === 'CRÍTICO' ? '#FF3B30' : tipo === 'URGENTE' ? '#FF9500' : '#FFCC00',
  };
};

const recursosDisponiveis = [
  { tipo: 'Viaturas', total: 45, ativas: 12, disponiveis: 33 },
  { tipo: 'Equipes', total: 120, ativas: 38, disponiveis: 82 },
  { tipo: 'Helicópteros', total: 8, ativas: 2, disponiveis: 6 },
  { tipo: 'Aeronaves', total: 5, ativas: 1, disponiveis: 4 }
];

export default function Painel() {
  const navigate = useNavigate();
  const [filtroAlerta, setFiltroAlerta] = useState('TODOS');
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [usuario, setUsuario] = useState<FirefighterUser | null>(null);
  const [alertasPrioritarios, setAlertasPrioritarios] = useState<AlertaPainel[]>([]);
  const [alertasErro, setAlertasErro] = useState('');

  useEffect(() => {
    const token = window.localStorage.getItem(AUTH_TOKEN_KEY);

    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    const cachedUser = window.localStorage.getItem(AUTH_USER_KEY);
    if (cachedUser) {
      try {
        setUsuario(JSON.parse(cachedUser) as FirefighterUser);
      } catch {
        window.localStorage.removeItem(AUTH_USER_KEY);
      }
    }

    const loadAlertas = async (tokenValue: string) => {
      try {
        const response = await fetch('/api/dados', {
          headers: {
            Authorization: `Bearer ${tokenValue}`,
          },
        });

        if (!response.ok) {
          throw new Error('Falha ao carregar alertas prioritarios.');
        }

        const data = (await response.json()) as { ultimosReportes?: ApiAlerta[] };
        const alertas = (data.ultimosReportes || []).map(buildAlertaPainel);
        setAlertasPrioritarios(alertas);
        setAlertasErro('');
      } catch {
        setAlertasPrioritarios([]);
        setAlertasErro('Nao foi possivel carregar os alertas prioritarios do banco de dados.');
      }
    };

    const validateSession = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Sessão inválida');
        }

        const data = (await response.json()) as { firefighter: FirefighterUser };
        window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.firefighter));
        setUsuario(data.firefighter);
        await loadAlertas(token);
      } catch {
        window.localStorage.removeItem(AUTH_TOKEN_KEY);
        window.localStorage.removeItem(AUTH_USER_KEY);
        navigate('/login', { replace: true });
      } finally {
        setIsAuthenticating(false);
      }
    };

    void validateSession();
  }, [navigate]);

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
        // Logout local continua funcionando se o backend estiver indisponível.
      }
    }

    clearAuthSession();
    navigate('/login', { replace: true });
  };

  const alertasFiltrados = useMemo(() => {
    return filtroAlerta === 'TODOS'
      ? alertasPrioritarios
      : alertasPrioritarios.filter((alerta) => alerta.tipo === filtroAlerta);
  }, [filtroAlerta]);

  if (isAuthenticating) {
    return (
      <div className="min-h-screen bg-[#0A1929] flex items-center justify-center text-[#F2F2F7]">
        <div className="flex items-center gap-3 bg-[#1C1C1E]/80 border border-white/10 rounded-2xl px-6 py-4">
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full"
          />
          Verificando acesso...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A1929]">
      <div className="bg-[#1C1C1E]/90 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-8 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-[#FF3B30] to-[#FF6A00] rounded-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#F2F2F7]">Painel de Coordenação</h1>
              <p className="text-sm text-gray-400">Centro de Operações</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {usuario && (
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-[#F2F2F7]">{usuario.name}</p>
                <p className="text-xs text-gray-400">{usuario.email}</p>
              </div>
            )}

            <motion.div
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex items-center gap-2 bg-[#34C759]/20 px-4 py-2 rounded-lg border border-[#34C759]/50"
            >
              <Activity className="w-4 h-4 text-[#34C759]" />
              <span className="text-sm text-[#34C759] font-medium">Sistema Ativo</span>
            </motion.div>

            <button
              onClick={() => navigate('/orgaos')}
              className="px-3 py-2 rounded-lg border border-white/20 text-sm text-[#F2F2F7] hover:bg-[#2A2A2C] transition-colors"
            >
              Análise de Órgãos
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-gray-400 hover:text-[#F2F2F7] transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-8 py-8">
        <div className="grid grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-[#FF3B30] to-[#FF6A00] p-6 rounded-xl shadow-lg"
          >
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="w-8 h-8 text-white" />
              <span className="text-white/80 text-sm">Críticos</span>
            </div>
            <p className="text-4xl font-bold text-white">3</p>
            <p className="text-white/80 text-sm mt-1">Alertas ativos</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#1C1C1E]/80 backdrop-blur-md border border-white/10 p-6 rounded-xl"
          >
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-[#34C759]" />
              <span className="text-gray-400 text-sm">Equipes</span>
            </div>
            <p className="text-4xl font-bold text-[#F2F2F7]">38</p>
            <p className="text-gray-400 text-sm mt-1">Em campo</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#1C1C1E]/80 backdrop-blur-md border border-white/10 p-6 rounded-xl"
          >
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-8 h-8 text-[#FF9500]" />
              <span className="text-gray-400 text-sm">Tempo Médio</span>
            </div>
            <p className="text-4xl font-bold text-[#F2F2F7]">18m</p>
            <p className="text-gray-400 text-sm mt-1">De resposta</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-[#1C1C1E]/80 backdrop-blur-md border border-white/10 p-6 rounded-xl"
          >
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-[#34C759]" />
              <span className="text-gray-400 text-sm">Taxa de Controle</span>
            </div>
            <p className="text-4xl font-bold text-[#F2F2F7]">94%</p>
            <p className="text-gray-400 text-sm mt-1">Últimas 24h</p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-r from-[#FF3B30] to-[#FF6A00] rounded-xl p-6 mb-8 cursor-pointer"
          onClick={() => navigate('/dados')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-lg">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-white text-xl font-bold mb-1">Dados e Estatísticas Completas</h3>
                <p className="text-white/90 text-sm">Acesse análises detalhadas, gráficos e relatórios de incêndios</p>
              </div>
            </div>
            <div className="text-white text-2xl">→</div>
          </div>
        </motion.div>

        <div className="grid grid-cols-3 gap-8">
          <div className="col-span-2">
            <div className="bg-[#1C1C1E]/80 backdrop-blur-md border border-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Bell className="w-6 h-6 text-[#FF3B30]" />
                  <h2 className="text-xl font-bold text-[#F2F2F7]">Alertas Prioritários</h2>
                </div>

                <div className="flex gap-2">
                  {['TODOS', 'CRÍTICO', 'URGENTE', 'MODERADO'].map((tipo) => (
                    <button
                      key={tipo}
                      onClick={() => setFiltroAlerta(tipo)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        filtroAlerta === tipo
                          ? 'bg-[#FF3B30] text-white'
                          : 'bg-[#2C2C2E] text-gray-400 hover:bg-[#3C3C3E]'
                      }`}
                    >
                      {tipo}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {alertasErro && (
                  <div className="bg-[#FF3B30]/10 border border-[#FF3B30]/40 rounded-lg p-4 text-sm text-[#F2F2F7]">
                    {alertasErro}
                  </div>
                )}

                {!alertasErro && alertasFiltrados.length === 0 && (
                  <div className="bg-[#2C2C2E] border border-white/10 rounded-lg p-4 text-sm text-gray-300">
                    Nenhum alerta prioritario encontrado para o filtro selecionado.
                  </div>
                )}

                {alertasFiltrados.map((alerta, index) => (
                  <motion.div
                    key={alerta.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-[#2C2C2E] border-l-4 rounded-lg p-5"
                    style={{ borderColor: alerta.cor }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span
                          className="px-3 py-1 rounded-full text-xs font-bold text-white"
                          style={{ backgroundColor: alerta.cor }}
                        >
                          {alerta.tipo}
                        </span>
                        <span className="text-[#F2F2F7] font-semibold">{alerta.descricao}</span>
                      </div>
                      <span className="text-gray-400 text-sm whitespace-nowrap ml-4">{alerta.tempo}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-300">{alerta.localizacao}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Radio className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-300">{alerta.recursos}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {alerta.status === 'EM ANDAMENTO' && <AlertCircle className="w-4 h-4 text-[#FF3B30]" />}
                        {alerta.status === 'RESPONDENDO' && <Radio className="w-4 h-4 text-[#FF9500]" />}
                        {alerta.status === 'CONTROLADO' && <CheckCircle className="w-4 h-4 text-[#34C759]" />}
                        {alerta.status === 'MONITORANDO' && <Clock className="w-4 h-4 text-[#FFCC00]" />}
                        <span className="text-gray-300">{alerta.status}</span>
                      </div>
                    </div>

                    <div className="mt-4 rounded-lg border border-[#FF9500]/40 bg-[#FF9500]/10 px-4 py-3">
                      <p className="text-xs uppercase tracking-wide text-[#FF9500]">Provavel intensidade do fogo</p>
                      <p className="text-2xl font-extrabold text-[#F2F2F7] mt-1">{alerta.intensidadeProvavel}</p>
                    </div>

                    <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                      <div className="bg-black/20 rounded-lg px-3 py-2">
                        <p className="text-gray-400 text-xs">Temperatura</p>
                        <p className="text-[#F2F2F7] font-semibold">{alerta.temperatura}</p>
                      </div>
                      <div className="bg-black/20 rounded-lg px-3 py-2">
                        <p className="text-gray-400 text-xs">Umidade</p>
                        <p className="text-[#F2F2F7] font-semibold">{alerta.umidade}</p>
                      </div>
                      <div className="bg-black/20 rounded-lg px-3 py-2">
                        <p className="text-gray-400 text-xs">Vento</p>
                        <p className="text-[#F2F2F7] font-semibold">{alerta.vento}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-[#1C1C1E]/80 backdrop-blur-md border border-white/10 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <Radio className="w-6 h-6 text-[#34C759]" />
                <h2 className="text-xl font-bold text-[#F2F2F7]">Recursos Disponíveis</h2>
              </div>

              <div className="space-y-4">
                {recursosDisponiveis.map((recurso, index) => (
                  <motion.div
                    key={recurso.tipo}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-[#2C2C2E] rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[#F2F2F7] font-semibold">{recurso.tipo}</span>
                      <span className="text-gray-400 text-sm">{recurso.total} total</span>
                    </div>

                    <div className="flex gap-2 text-sm mb-2">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-[#FF3B30] rounded-full" />
                        <span className="text-gray-300">{recurso.ativas} ativas</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-[#34C759] rounded-full" />
                        <span className="text-gray-300">{recurso.disponiveis} disponíveis</span>
                      </div>
                    </div>

                    <div className="w-full bg-[#1C1C1E] rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-[#FF3B30] to-[#34C759] h-full transition-all"
                        style={{ width: `${(recurso.ativas / recurso.total) * 100}%` }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}