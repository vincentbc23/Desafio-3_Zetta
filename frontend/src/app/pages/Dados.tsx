import { motion } from 'motion/react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Header } from '../components/Header';
import { Clock, MapPin, TrendingUp } from 'lucide-react';

const dadosRegiao = [
  { nome: 'Norte', incendios: 45, id: 'norte' },
  { nome: 'Sul', incendios: 23, id: 'sul' },
  { nome: 'Leste', incendios: 67, id: 'leste' },
  { nome: 'Oeste', incendios: 34, id: 'oeste' },
  { nome: 'Centro', incendios: 51, id: 'centro' }
];

const dadosHorario = [
  { hora: '00h', ocorrencias: 5, id: 'h00' },
  { hora: '04h', ocorrencias: 3, id: 'h04' },
  { hora: '08h', ocorrencias: 8, id: 'h08' },
  { hora: '12h', ocorrencias: 15, id: 'h12' },
  { hora: '16h', ocorrencias: 23, id: 'h16' },
  { hora: '20h', ocorrencias: 12, id: 'h20' }
];

const dadosTipo = [
  { nome: 'Florestal', valor: 45, cor: '#FF3B30', id: 'tipo-florestal' },
  { nome: 'Urbano', valor: 20, cor: '#FF9500', id: 'tipo-urbano' },
  { nome: 'Rural', valor: 25, cor: '#FFCC00', id: 'tipo-rural' },
  { nome: 'Industrial', valor: 10, cor: '#34C759', id: 'tipo-industrial' }
];

// Componente customizado para tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1C1C1E] border border-white/20 rounded-lg p-3 shadow-xl backdrop-blur-md">
        <p className="text-[#F2F2F7] font-semibold mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={`tooltip-${index}`} className="text-[#F2F2F7]">
            {entry.name}: <span className="font-bold text-[#FF3B30]">{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Dados() {
  return (
    <div className="min-h-screen bg-[#0A1929]">
      <Header />
      
      <div className="max-w-7xl mx-auto px-8 py-12">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-[#F2F2F7] mb-8"
        >
          Dados e Estatísticas
        </motion.h1>
        
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
              220
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
              23 min
            </motion.p>
            <p className="text-gray-400 text-sm mt-2">Tempo de resposta</p>
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
              87%
            </motion.p>
            <p className="text-gray-400 text-sm mt-2">Incêndios controlados</p>
          </motion.div>
        </div>
        
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
                <XAxis key="xaxis-bar" dataKey="nome" stroke="#F2F2F7" />
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
                  label={(entry) => `${entry.nome}: ${entry.valor}%`}
                  labelStyle={{ fill: '#F2F2F7', fontSize: '12px', fontWeight: 600 }}
                >
                  {dadosTipo.map((entry) => (
                    <Cell key={`cell-${entry.id}`} fill={entry.cor} />
                  ))}
                </Pie>
                <Tooltip key="tooltip-pie" content={<CustomTooltip />} />
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
            ⏱️ Pico de ocorrências entre 14h-18h
          </p>
        </motion.div>
      </div>
    </div>
  );
}