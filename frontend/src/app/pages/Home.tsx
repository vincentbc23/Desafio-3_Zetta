import { motion } from 'motion/react';
import { Flame, MapPin, Bell, AlertTriangle, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router';
import { Header } from '../components/Header';
import { CardInformacao } from '../components/CardInformacao';
import { BotaoPrincipal } from '../components/BotaoPrincipal';
import { useState } from 'react';
import { Notificacao } from '../components/Notificacao';
import { useApi } from '../api/useApi';
import { apiConfig } from '../api/config';

interface CardItem {
  id: string;
  titulo: string;
  valor: number | string;
  icon: string;
}

interface CardsResponse {
  totals: {
    totalReports: number;
    reportsLast24h: number;
    highRiskReports: number;
  };
  cards: CardItem[];
  updatedAt: string;
}

const iconMap = {
  flame: Flame,
  'map-pin': MapPin,
  'alert-triangle': AlertTriangle,
};

export default function Home() {
  const navigate = useNavigate();
  const [notificacaoVisivel, setNotificacaoVisivel] = useState(true);
  const { data, error, refetch, refreshing } = useApi<CardsResponse>('/api/cards', [], apiConfig.refreshIntervalMs);

  const cards = data?.cards ?? [
    { id: 'incendios_hoje', titulo: 'Incêndios hoje', valor: 0, icon: 'flame' },
    { id: 'reports_total', titulo: 'Total de reportes', valor: 0, icon: 'map-pin' },
  ];

  const highRiskCount = data?.totals.highRiskReports ?? 0;

  return (
    <div className="min-h-screen bg-[#0A1929]">
      <Header />
      
      <Notificacao
        tipo={highRiskCount > 0 ? 'alerta' : 'sucesso'}
        titulo={highRiskCount > 0 ? 'Alertas de risco alto detectados' : 'Monitoramento ativo'}
        mensagem={
          highRiskCount > 0
            ? `${highRiskCount} ocorrência(s) em risco alto nas últimas coletas.`
            : 'Nenhuma ocorrência em risco alto no momento.'
        }
        visivel={notificacaoVisivel}
        onFechar={() => setNotificacaoVisivel(false)}
      />
      
      {/* Mapa de fundo */}
      <div 
        className="relative min-h-[calc(100vh-80px)]"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1743264038602-365292f9f6a8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb3Jlc3QlMjBmaXJlJTIwbWFwJTIwYWVyaWFsJTIwdmlld3xlbnwxfHx8fDE3NzUyMjgyMjl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* Overlay com gradiente */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A1929]/80 via-black/60 to-[#0A1929]/90" />
        
        {/* Overlay de calor (laranja) */}
        <motion.div 
          animate={{ opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute inset-0 bg-[#FF9500]/10"
        />
        
        {/* Conteúdo */}
        <div className="relative z-10 max-w-7xl mx-auto px-8 py-12 min-h-[calc(100vh-80px)] flex flex-col items-center justify-center gap-10">
          <div className="w-full flex justify-end items-center gap-3">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl justify-items-stretch">
            {cards.slice(0, 2).map((card) => {
              const Icon = iconMap[card.icon as keyof typeof iconMap] || Flame;

              return (
                <CardInformacao
                  key={card.id}
                  icon={Icon}
                  titulo={card.titulo}
                  valor={card.valor}
                />
              );
            })}
          </div>

          {error && (
            <div className="w-full max-w-2xl bg-[#FF3B30]/15 border border-[#FF3B30]/40 rounded-lg p-3 text-[#F2F2F7] text-sm text-center">
              Não foi possível atualizar os cards em tempo real.
            </div>
          )}
          
          {/* Texto e Botão central */}
          <div className="flex flex-col items-center justify-center gap-8 w-full max-w-3xl text-center">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-[#F2F2F7] text-2xl font-medium text-center max-w-3xl"
            >Reporte incêndios e ajude a salvar vidas e ecossistemas!</motion.p>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="w-full flex justify-center"
            >
              <BotaoPrincipal onClick={() => navigate('/reportar')} className="text-xl px-10 py-5 scale-110">
                🔥 REPORTAR INCÊNDIO
              </BotaoPrincipal>
            </motion.div>
          </div>
          
          {/* Badge de notificações */}
          <motion.button
            onClick={() => setNotificacaoVisivel(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="fixed bottom-8 right-8 bg-[#1C1C1E]/80 backdrop-blur-md border border-white/10 rounded-full p-4 shadow-lg"
          >
            <div className="relative">
              <Bell className="w-6 h-6 text-[#F2F2F7]" />
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="absolute -top-1 -right-1 w-3 h-3 bg-[#FF3B30] rounded-full border-2 border-[#0A1929]"
              />
            </div>
          </motion.button>
        </div>
      </div>
    </div>
  );
}