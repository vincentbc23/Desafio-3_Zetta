import { motion } from 'motion/react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Header } from '../components/Header';
import { Clock, MapPin, TrendingUp, RefreshCw } from 'lucide-react';
import { useApi } from '../api/useApi';
import { apiConfig } from '../api/config';

interface DadosResponse {
  resumo: {
    totalIncendios: number;
    incendiosUltimas24h: number;
  };
  porRegiao: Array<{
    nome: string;
    incendios: number;
  }>;
  porHorario: Array<{
    hora: string;
    ocorrencias: number;
  }>;
  porClasse: Array<{
    nome: string;
    valor: number;
  }>;
  updatedAt: string;
}

const corClasse = (classe: string) => {
  const normalized = classe.toLowerCase();

  if (normalized === 'alto') {
    return '#FF3B30';
  }

  if (normalized === 'medio') {
    return '#FF9500';
  }

  if (normalized === 'baixo') {
    return '#FFCC00';
  }

  return '#34C759';
};

const labelClasse = (classe: string) => {
  const normalized = classe.toLowerCase();
  if (normalized === 'medio') return 'Médio';
  if (normalized === 'alto') return 'Alto';
  if (normalized === 'baixo') return 'Baixo';
  if (normalized === 'controlado') return 'Controlado';
  if (normalized === 'indefinido') return 'Indefinido';
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

// Componente customizado para tooltip
const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name?: string; value?: string | number }>; label?: string }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-[#1C1C1E] border border-white/20 rounded-lg p-3 shadow-xl backdrop-blur-md">
        <p className="text-[#F2F2F7] font-semibold mb-1">{label}</p>
        {payload.map((entry, index: number) => (
          <p key={`tooltip-${index}`} className="text-[#F2F2F7]">
            {entry.name}: <span className="font-bold text-[#FF3B30]">{entry.value ?? 0}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Dados() {
  const { data, error, refetch, refreshing } = useApi<DadosResponse>('/api/dados', [], apiConfig.refreshIntervalMs);

  const totalIncendios = data?.resumo.totalIncendios ?? 0;
  const incendiosUltimas24h = data?.resumo.incendiosUltimas24h ?? 0;
  const alto = data?.porClasse.find((item) => item.nome.toLowerCase() === 'alto')?.valor ?? 0;
  const taxaControle = totalIncendios > 0 ? Math.max(0, Math.round(((totalIncendios - alto) / totalIncendios) * 100)) : 0;

  const dadosRegiao = (data?.porRegiao ?? []).map((item) => ({
    nome: item.nome,
    incendios: item.incendios,
    id: `regiao-${item.nome.toLowerCase()}`,
  }));

  const dadosHorario = (data?.porHorario ?? []).map((item) => ({
    hora: item.hora,
    ocorrencias: item.ocorrencias,
    id: `hora-${item.hora}`,
  }));

  const dadosTipo = (data?.porClasse ?? []).map((item) => ({
    nome: item.nome,
    valor: item.valor,
    cor: corClasse(item.nome),
    id: `classe-${item.nome}`,
  }));

  return (
    <div className="min-h-screen bg-[#0A1929]">
      <Header />
      
      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="flex items-center justify-between mb-8 gap-4">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-[#F2F2F7]"
          >
            Dados e Estatísticas
          </motion.h1>

          <div className="flex items-center gap-3">
            {data?.updatedAt && (
              <span className="text-xs text-gray-300">
                Atualizado: {new Date(data.updatedAt).toLocaleTimeString('pt-BR')}
              </span>
            )}
            <button
              type="button"
              onClick={() => void refetch()}
              className="bg-[#1C1C1E]/80 border border-white/20 text-[#F2F2F7] px-3 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-[#2A2A2C] transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Atualizar agora
            </button>
          </div>
        </div>
        
        {/* Cards de métricas */}
        <div className="grid grid-cols-3 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#1C1C1E]/80 backdrop-blur-md border border-white/10 p-6 rounded-xl"
          >
            <div className="flex items-center gap-3 mb-2">
              <MapPin className="w-6 h-6 text-[#FF3B30]" />
              <h3 className="text-[#F2F2F7] font-semibold">Total de Incêndios</h3>
            </div>
            <motion.p
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="text-4xl font-bold text-[#F2F2F7]"
            >
              {totalIncendios}
            </motion.p>
            <p className="text-gray-400 text-sm mt-2">Este mês</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#1C1C1E]/80 backdrop-blur-md border border-white/10 p-6 rounded-xl"
          >
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-6 h-6 text-[#FF9500]" />
              <h3 className="text-[#F2F2F7] font-semibold">Tempo Médio</h3>
            </div>
            <motion.p
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4, type: "spring" }}
              className="text-4xl font-bold text-[#F2F2F7]"
            >
              {incendiosUltimas24h}
            </motion.p>
            <p className="text-gray-400 text-sm mt-2">Ocorrências nas últimas 24h</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-[#1C1C1E]/80 backdrop-blur-md border border-white/10 p-6 rounded-xl"
          >
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-6 h-6 text-[#34C759]" />
              <h3 className="text-[#F2F2F7] font-semibold">Taxa de Controle</h3>
            </div>
            <motion.p
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
              className="text-4xl font-bold text-[#F2F2F7]"
            >
              {taxaControle}%
            </motion.p>
            <p className="text-gray-400 text-sm mt-2">Sem classificação de risco alto</p>
          </motion.div>
        </div>

        {error && (
          <div className="mb-8 bg-[#FF3B30]/15 border border-[#FF3B30]/40 rounded-lg p-3 text-[#F2F2F7] text-sm">
            Não foi possível atualizar os gráficos em tempo real.
          </div>
        )}
        
        {/* Gráficos */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          {/* Gráfico de Barras - Incêndios por Região */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-[#1C1C1E]/80 backdrop-blur-md border border-white/10 p-6 rounded-xl"
          >
            <h2 className="text-[#F2F2F7] text-xl font-bold mb-6">📊 Incêndios por Região</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dadosRegiao}>
                <CartesianGrid key="grid-bar" strokeDasharray="3 3" stroke="#2A2A2A" />
                <XAxis
                  key="xaxis-bar"
                  dataKey="nome"
                  stroke="#F2F2F7"
                  tick={false}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis key="yaxis-bar" stroke="#F2F2F7" />
                <Tooltip key="tooltip-bar" content={<CustomTooltip />} />
                <Bar
                  key="bar-incendios"
                  dataKey="incendios"
                  fill="#FF3B30"
                  radius={[8, 8, 0, 0]}
                  isAnimationActive={false}
                />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
          
          {/* Gráfico de Pizza - Tipos de Incêndio */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-[#1C1C1E]/80 backdrop-blur-md border border-white/10 p-6 rounded-xl"
          >
            <h2 className="text-[#F2F2F7] text-xl font-bold mb-6">🥧 Tipos de Incêndio</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  key="pie-tipos"
                  data={dadosTipo}
                  dataKey="valor"
                  nameKey="nome"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  labelLine={false}
                  label={({ name, value }) => `${labelClasse(String(name ?? ''))}: ${value ?? 0}`}
                >
                  {dadosTipo.map((entry) => (
                    <Cell key={`cell-${entry.id}`} fill={entry.cor} />
                  ))}
                </Pie>
                <Tooltip key="tooltip-pie" content={<CustomTooltip />} />
                <Legend
                  formatter={(value) => (
                    <span className="text-[#F2F2F7] text-sm font-semibold">
                      {labelClasse(String(value))}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
        
        {/* Gráfico de Linha - Horários Críticos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-[#1C1C1E]/80 backdrop-blur-md border border-white/10 p-6 rounded-xl"
        >
          <h2 className="text-[#F2F2F7] text-xl font-bold mb-6">📈 Horários Críticos</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dadosHorario}>
              <CartesianGrid key="grid-line" strokeDasharray="3 3" stroke="#2A2A2A" />
              <XAxis key="xaxis-line" dataKey="hora" stroke="#F2F2F7" />
              <YAxis key="yaxis-line" stroke="#F2F2F7" />
              <Tooltip key="tooltip-line" content={<CustomTooltip />} />
              <Line
                key="line-ocorrencias"
                type="monotone"
                dataKey="ocorrencias"
                stroke="#FF3B30"
                strokeWidth={3}
                isAnimationActive={false}
                dot={{
                  fill: '#FF3B30',
                  r: 6,
                  strokeWidth: 2,
                  stroke: '#FF6A00'
                }}
                activeDot={{
                  r: 8,
                  fill: '#FF3B30',
                  stroke: '#FF6A00',
                  strokeWidth: 2
                }}
              />
            </LineChart>
          </ResponsiveContainer>
          <p className="text-gray-400 text-sm mt-4 text-center">
            📡 Dados atualizados automaticamente pelo backend
          </p>
        </motion.div>
      </div>
    </div>
  );
}