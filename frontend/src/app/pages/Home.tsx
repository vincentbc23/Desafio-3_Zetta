import { motion } from 'motion/react';
import { Flame, MapPin, Bell } from 'lucide-react';
import { useNavigate } from 'react-router';
import { Header } from '../components/Header';
import { CardInformacao } from '../components/CardInformacao';
import { BotaoPrincipal } from '../components/BotaoPrincipal';
import { useState } from 'react';
import { Notificacao } from '../components/Notificacao';

export default function Home() {
  const navigate = useNavigate();
  const [notificacaoVisivel, setNotificacaoVisivel] = useState(true);

  return (
    <div className="min-h-screen bg-[#0A1929]">
      <Header />
      
      {/* Notificação simulada */}
      <Notificacao
        tipo="alerta"
        titulo="Incêndio próximo detectado"
        mensagem="Área: 2.3 km da sua localização"
        visivel={notificacaoVisivel}
        onFechar={() => setNotificacaoVisivel(false)}
      />
      
      {/* Mapa de fundo */}
      <div 
        className="relative h-[calc(100vh-80px)]"
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
        <div className="relative z-10 max-w-7xl mx-auto px-8 py-12 h-full flex flex-col justify-between">
          {/* Cards superiores */}
          <div className="grid grid-cols-2 gap-6 max-w-2xl">
            <CardInformacao 
              icon={Flame}
              titulo="Incêndios hoje"
              valor="27"
            />
            <CardInformacao 
              icon={MapPin}
              titulo="Área queimada"
              valor="1.243 ha"
            />
          </div>
          
          {/* Texto e Botão central */}
          <div className="flex flex-col items-center justify-center gap-8">
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