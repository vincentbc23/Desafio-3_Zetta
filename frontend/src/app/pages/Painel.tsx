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

const alertasPrioritarios = [
  {
    id: 1,
    tipo: 'CRÍTICO',
    descricao: 'Incêndio florestal de grandes proporções - Zona Norte',
    localizacao: 'Brasília - DF (-15.7939, -47.8828)',
    status: 'EM ANDAMENTO',
    tempo: '5 min atrás',
    recursos: '4 viaturas, 2 aeronaves',
    cor: '#FF3B30'
  },
  {
    id: 2,
    tipo: 'CRÍTICO',
    descricao: 'Incêndio próximo a reserva ambiental',
    localizacao: 'Unaí - MG (-16.3578, -46.9064)',
    status: 'EM ANDAMENTO',
    tempo: '12 min atrás',
    recursos: '3 viaturas, 1 helicóptero',
    cor: '#FF3B30'
  },
  {
    id: 3,
    tipo: 'CRÍTICO',
    descricao: 'Fogo em área de vegetação densa',
    localizacao: 'Fortaleza - CE (-3.7172, -38.5433)',
    status: 'EM ANDAMENTO',
    tempo: '18 min atrás',
    recursos: '5 viaturas, 15 bombeiros',
    cor: '#FF3B30'
  },
  {
    id: 4,
    tipo: 'URGENTE',
    descricao: 'Foco de incêndio próximo a área residencial',
    localizacao: 'São Paulo - SP (-23.5505, -46.6333)',
    status: 'RESPONDENDO',
    tempo: '22 min atrás',
    recursos: '2 viaturas em deslocamento',
    cor: '#FF9500'
  },
  {
    id: 5,
    tipo: 'URGENTE',
    descricao: 'Incêndio em plantação agrícola',
    localizacao: 'Paracatu - MG (-17.2219, -46.8750)',
    status: 'RESPONDENDO',
    tempo: '35 min atrás',
    recursos: '2 viaturas, 8 bombeiros',
    cor: '#FF9500'
  },
  {
    id: 6,
    tipo: 'URGENTE',
    descricao: 'Queimada em área de pastagem',
    localizacao: 'Salvador - BA (-12.9714, -38.5014)',
    status: 'CONTROLADO',
    tempo: '41 min atrás',
    recursos: '1 viatura, 4 bombeiros',
    cor: '#FF9500'
  },
  {
    id: 7,
    tipo: 'MODERADO',
    descricao: 'Queimada controlada em área rural',
    localizacao: 'Patos de Minas - MG (-18.5789, -46.5181)',
    status: 'MONITORANDO',
    tempo: '52 min atrás',
    recursos: '1 viatura em observação',
    cor: '#FFCC00'
  },
  {
    id: 8,
    tipo: 'MODERADO',
    descricao: 'Pequeno foco em terreno baldio',
    localizacao: 'Rio de Janeiro - RJ (-22.9068, -43.1729)',
    status: 'MONITORANDO',
    tempo: '1h 5min atrás',
    recursos: '1 viatura de prontidão',
    cor: '#FFCC00'
  }
];

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

                    <div className="flex gap-2 mt-4">
                      <button className="flex-1 bg-[#FF3B30] hover:bg-[#FF6A00] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                        Despachar Unidade
                      </button>
                      <button className="bg-[#3C3C3E] hover:bg-[#4C4C4E] text-[#F2F2F7] px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                        Ver Detalhes
                      </button>
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

            <div className="bg-[#1C1C1E]/80 backdrop-blur-md border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-bold text-[#F2F2F7] mb-4">Ações Rápidas</h3>
              <div className="space-y-2">
                <button className="w-full bg-[#FF3B30] hover:bg-[#FF6A00] text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                  <Bell className="w-5 h-5" />
                  Emitir Alerta Geral
                </button>
                <button
                  onClick={() => navigate('/mapa')}
                  className="w-full bg-[#2C2C2E] hover:bg-[#3C3C3E] text-[#F2F2F7] px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <MapPin className="w-5 h-5" />
                  Ver Mapa Completo
                </button>
                <button className="w-full bg-[#2C2C2E] hover:bg-[#3C3C3E] text-[#F2F2F7] px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                  <Users className="w-5 h-5" />
                  Coordenar Equipes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}