import { motion } from 'motion/react';
import { useLocation, useNavigate } from 'react-router';
import { CheckCircle, Home, Shield, MapPin, Thermometer, Droplets, Wind, Flame, BadgeInfo } from 'lucide-react';
import { BotaoPrincipal } from '../components/BotaoPrincipal';
import { useEffect } from 'react';

interface IngestionFeatures {
  DiaSemChuva: number;
  Precipitacao: number;
  Temperatura_C: number;
  'Umidade_Relativa_%': number;
  Vento_ms: number;
  Mes: number;
  Hora: number;
  Latitude: number;
  Longitude: number;
}

interface SuccessState {
  reportId: string;
  features: IngestionFeatures;
  ml: {
    status: string;
    source: string;
    modelName: string;
    modelVersion: string;
    probIncendio: number;
    classePrevista: string;
    frpPrevisto: number;
  };
}

export default function Sucesso() {
  const navigate = useNavigate();
  const location = useLocation();
  const successData = location.state as SuccessState | null;

  const statusCards = successData
    ? [
        {
          texto: `Reporte ${successData.reportId.slice(0, 8)} salvo no banco de dados`,
        },
        {
          texto: `Predição ${successData.ml.classePrevista} processada (${(successData.ml.probIncendio * 100).toFixed(1)}%)`,
        },
        {
          texto: `Dados já disponíveis no painel e no mapa em tempo real`,
        },
      ]
    : [
        { texto: 'Reporte registrado com sucesso' },
        { texto: 'Processamento concluído no backend' },
        { texto: 'Painel atualizado para acompanhamento' },
      ];

  useEffect(() => {
    // Animação de confetti ou celebração poderia ser adicionada aqui
  }, []);

  return (
    <div className="min-h-screen bg-[#0A1929] flex items-center justify-center px-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full text-center"
      >
        {/* Ícone de sucesso animado */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mb-8 flex justify-center"
        >
          <div className="relative">
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 bg-[#34C759] rounded-full blur-2xl"
            />
            <CheckCircle className="relative w-24 h-24 text-[#34C759]" />
          </div>
        </motion.div>

        {/* Título */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-4xl font-bold text-[#F2F2F7] mb-4"
        >
          ✅ Alerta Enviado!
        </motion.h1>

        {/* Descrição */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-[#1C1C1E]/80 backdrop-blur-md border border-white/10 rounded-xl p-6 mb-8"
        >
          <p className="text-[#F2F2F7] text-lg mb-4">
            Seu reporte foi recebido com sucesso!
          </p>

          {successData ? (
            <div className="space-y-4 text-left">
              <div className="grid grid-cols-1 gap-3 bg-[#0A1929]/60 border border-white/10 rounded-lg p-4">
                <div className="flex items-center gap-3 text-[#F2F2F7]">
                  <BadgeInfo className="w-5 h-5 text-[#FF9500]" />
                  <span className="text-sm break-all">Reporte: {successData.reportId}</span>
                </div>
                <div className="flex items-center gap-3 text-[#F2F2F7]">
                  <MapPin className="w-5 h-5 text-[#FF3B30]" />
                  <span className="text-sm">Lat {successData.features.Latitude.toFixed(6)} | Lng {successData.features.Longitude.toFixed(6)}</span>
                </div>
                <div className="flex items-center gap-3 text-[#F2F2F7]">
                  <Flame className="w-5 h-5 text-[#FF9500]" />
                  <span className="text-sm">Predição: {successData.ml.classePrevista} ({(successData.ml.probIncendio * 100).toFixed(1)}%)</span>
                </div>
                <div className="flex items-center gap-3 text-[#F2F2F7]">
                  <Shield className="w-5 h-5 text-[#34C759]" />
                  <span className="text-sm">Modelo: {successData.ml.modelName} v{successData.ml.modelVersion} via {successData.ml.source}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 bg-[#0A1929]/60 border border-white/10 rounded-lg p-3 text-[#F2F2F7]">
                  <Thermometer className="w-4 h-4 text-[#FF3B30]" />
                  <span>{successData.features.Temperatura_C.toFixed(1)}°C</span>
                </div>
                <div className="flex items-center gap-2 bg-[#0A1929]/60 border border-white/10 rounded-lg p-3 text-[#F2F2F7]">
                  <Droplets className="w-4 h-4 text-[#34C759]" />
                  <span>{successData.features['Umidade_Relativa_%'].toFixed(1)}%</span>
                </div>
                <div className="flex items-center gap-2 bg-[#0A1929]/60 border border-white/10 rounded-lg p-3 text-[#F2F2F7]">
                  <Wind className="w-4 h-4 text-[#00C7FF]" />
                  <span>{successData.features.Vento_ms.toFixed(1)} m/s</span>
                </div>
                <div className="flex items-center gap-2 bg-[#0A1929]/60 border border-white/10 rounded-lg p-3 text-[#F2F2F7]">
                  <Flame className="w-4 h-4 text-[#FF9500]" />
                  <span>{successData.features.DiaSemChuva} dias sem chuva</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-[#F2F2F7]/80 text-base">
              Seu reporte foi registrado. Volte à tela inicial para acompanhar o painel atualizado.
            </p>
          )}
          
          {/* Cards de status */}
          <div className="space-y-3">
            {statusCards.map((item, index) => (
              <motion.div
                key={item.texto}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="flex items-center gap-3 bg-[#34C759]/10 border border-[#34C759]/30 rounded-lg p-3"
              >
                <Shield className="w-5 h-5 text-[#34C759]" />
                <p className="text-sm text-[#F2F2F7] text-left">{item.texto}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Botões */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="space-y-4"
        >
          <BotaoPrincipal fullWidth onClick={() => navigate('/')}>
            <Home className="w-5 h-5 inline mr-2" />
            Voltar ao Início
          </BotaoPrincipal>
          
          <button 
            onClick={() => navigate('/mapa')}
            className="w-full text-[#F2F2F7] hover:text-white transition-colors"
          >
            Ver no Mapa
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}