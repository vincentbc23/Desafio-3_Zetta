import { motion } from 'motion/react';
import { 
  BookOpen, 
  ShieldAlert, 
  AlertTriangle, 
  Phone, 
  Video, 
  Users, 
  Heart,
  Shield,
  Leaf,
  Lock,
  Bell,
  Eye
} from 'lucide-react';
import { Header } from '../components/Header';
import { useState } from 'react';
import defesaCivilLogo from 'figma:asset/ebe836f5a99a1e98a0f9906e2f1f48ae5d728321.png';
import meioAmbienteImg from 'figma:asset/feb218a1b7fd3fb3ec618bc265cec8829a328e2c.png';

export default function Educacao() {
  const [loginVisible, setLoginVisible] = useState(false);

  const dicasPreventivas = [
    {
      emoji: "🚫",
      titulo: "Não queime lixo",
      descricao: "Nunca queime lixo ou resíduos. Use a coleta adequada."
    },
    {
      emoji: "💧",
      titulo: "Apague bem fogueiras",
      descricao: "Sempre apague completamente com água antes de sair."
    },
    {
      emoji: "🚬",
      titulo: "Cuidado com cigarros",
      descricao: "Nunca jogue pontas de cigarro em áreas verdes."
    },
    {
      emoji: "🌳",
      titulo: "Limpe seu terreno",
      descricao: "Mantenha a vegetação seca longe de construções."
    },
    {
      emoji: "⚠️",
      titulo: "Evite soltar balões",
      descricao: "Soltar balões é crime e pode causar incêndios."
    },
    {
      emoji: "🔥",
      titulo: "Cuidado com churrasqueiras",
      descricao: "Use em locais seguros e longe de vegetação."
    }
  ];

  const passosSeFogo = [
    { numero: "1", texto: "Ligue imediatamente 193 (Bombeiros)" },
    { numero: "2", texto: "Afaste-se do fogo e pessoas próximas" },
    { numero: "3", texto: "Não tente apagar sozinho se for grande" },
    { numero: "4", texto: "Informe a localização exata" },
    { numero: "5", texto: "Use o site Alerta Fogo para reportar" }
  ];

  const videosEducativos = [
    { 
      titulo: "Como Prevenir Incêndios", 
      duracao: "3:45",
      nivel: "Todos"
    },
    { 
      titulo: "O que fazer ao ver fogo", 
      duracao: "2:30",
      nivel: "Todos"
    },
    { 
      titulo: "Segurança para Crianças", 
      duracao: "4:15",
      nivel: "Crianças"
    },
    { 
      titulo: "Combate Florestal Básico", 
      duracao: "8:20",
      nivel: "Adultos"
    }
  ];

  const parceiros = [
    {
      nome: "Corpo de Bombeiros",
      telefone: "193",
      icon: ShieldAlert,
      cor: "#FF3B30",
      imagem: "https://images.unsplash.com/photo-1674831147403-3b3694e000b9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaXJlZmlnaHRlciUyMGhlcm8lMjBwb3J0cmFpdHxlbnwxfHx8fDE3NzUyNTI2ODl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    },
    {
      nome: "Defesa Civil",
      telefone: "199",
      icon: Shield,
      cor: "#FF9500",
      imagem: defesaCivilLogo
    },
    {
      nome: "Órgãos Ambientais",
      telefone: "(35) 3694-4054",
      icon: Leaf,
      cor: "#34C759",
      imagem: meioAmbienteImg
    }
  ];

  return (
    <div className="min-h-screen bg-[#0A1929]">
      <Header />
      
      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="flex justify-center mb-6">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="bg-gradient-to-r from-[#FF3B30] to-[#FF9500] p-4 rounded-full"
            >
              <BookOpen className="w-12 h-12 text-white" />
            </motion.div>
          </div>
          <h1 className="text-5xl font-bold text-[#F2F2F7] mb-4">
            Educação e Prevenção
          </h1>
          <p className="text-xl text-[#F2F2F7]/80 max-w-2xl mx-auto">
            Conhecimento salva vidas e preserva nossos ecossistemas
          </p>
        </motion.div>

        {/* Como Evitar Incêndios */}
        <section className="mb-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-3xl font-bold text-[#F2F2F7] mb-8 flex items-center gap-3">
              <ShieldAlert className="w-8 h-8 text-[#FF3B30]" />
              Como Evitar Incêndios
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dicasPreventivas.map((dica, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="bg-[#1C1C1E]/80 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:border-[#FF3B30]/50 transition-all"
                >
                  <div className="text-5xl mb-4">{dica.emoji}</div>
                  <h3 className="text-xl font-bold text-[#F2F2F7] mb-2">
                    {dica.titulo}
                  </h3>
                  <p className="text-[#F2F2F7]/70 text-lg leading-relaxed">
                    {dica.descricao}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* O que fazer ao ver fogo */}
        <section className="mb-16">
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-r from-[#FF3B30]/20 to-[#FF9500]/20 border border-[#FF3B30]/30 rounded-3xl p-8"
          >
            <h2 className="text-3xl font-bold text-[#F2F2F7] mb-8 flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-[#FF9500]" />
              O Que Fazer ao Ver Fogo
            </h2>
            <div className="space-y-4">
              {passosSeFogo.map((passo, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + 0.1 * index }}
                  className="flex items-center gap-4 bg-[#1C1C1E]/60 backdrop-blur-sm rounded-xl p-4"
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-[#FF3B30] to-[#FF9500] rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {passo.numero}
                  </div>
                  <p className="text-[#F2F2F7] text-xl font-medium"> 
                    {passo.texto}
                  </p> 
                </motion.div>
              ))}
            </div>
            
            {/* Botão de Emergência */}
            <motion.a
              href="tel:193"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-8 w-full bg-gradient-to-r from-[#FF3B30] to-[#FF6A00] text-white font-bold text-2xl py-5 rounded-2xl flex items-center justify-center gap-3 shadow-[0_8px_30px_rgba(255,59,48,0.4)] hover:shadow-[0_8px_40px_rgba(255,59,48,0.6)] transition-all"
            >
              <Phone className="w-7 h-7" />
              LIGAR 193 - EMERGÊNCIA
            </motion.a>
          </motion.div>
        </section>

        {/* Vídeos Educativos */}
        <section className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-[#F2F2F7] mb-8 flex items-center gap-3">
              <Video className="w-8 h-8 text-[#FF9500]" />
              Vídeos Educativos
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {videosEducativos.map((video, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 + 0.1 * index }}
                  whileHover={{ scale: 1.03 }}
                  className="bg-[#1C1C1E]/80 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden cursor-pointer hover:border-[#FF9500]/50 transition-all"
                >
                  <div className="relative h-48 bg-gradient-to-br from-[#FF3B30]/30 to-[#FF9500]/30 flex items-center justify-center">
                    <motion.div
                      whileHover={{ scale: 1.2 }}
                      className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center"
                    >
                      <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-[#FF3B30] border-b-8 border-b-transparent ml-1" />
                    </motion.div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-3 py-1 bg-[#FF9500]/20 text-[#FF9500] rounded-full text-sm font-medium">
                        {video.nivel}
                      </span>
                      <span className="text-[#F2F2F7]/60 text-sm">
                        {video.duracao}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-[#F2F2F7]">
                      {video.titulo}
                    </h3>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Ilustrações para Crianças */}
        <section className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-gradient-to-br from-[#34C759]/10 to-[#FF9500]/10 border border-[#34C759]/30 rounded-3xl p-8"
          >
            <h2 className="text-3xl font-bold text-[#F2F2F7] mb-6 flex items-center gap-3">
              <Heart className="w-8 h-8 text-[#34C759]" />
              Para as Crianças
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <img 
                  src="https://images.unsplash.com/photo-1504850012971-3dc85a46dc4a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaXJlZmlnaHRlciUyMHRlYWNoaW5nJTIwY2hpbGRyZW4lMjBmaXJlJTIwc2FmZXR5fGVufDF8fHx8MTc3NTI1MjY4OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Educação para crianças"
                  className="rounded-2xl w-full h-auto object-cover"
                />
              </div>
              <div className="space-y-4">
                <div className="bg-[#1C1C1E]/60 backdrop-blur-sm rounded-xl p-6">
                  <p className="text-[#F2F2F7] text-2xl font-bold mb-3">
                    🎨 Aprenda brincando!
                  </p>
                  <p className="text-[#F2F2F7]/80 text-lg leading-relaxed">
                    Jogos, desenhos e atividades divertidas para ensinar segurança de forma lúdica.
                  </p>
                </div>
                <div className="bg-[#1C1C1E]/60 backdrop-blur-sm rounded-xl p-6">
                  <p className="text-[#F2F2F7] text-2xl font-bold mb-3">
                    📚 Cartilhas ilustradas
                  </p>
                  <p className="text-[#F2F2F7]/80 text-lg leading-relaxed">
                    Material educativo com linguagem simples e ilustrações coloridas.
                  </p>
                </div>
                <div className="bg-[#1C1C1E]/60 backdrop-blur-sm rounded-xl p-6">
                  <p className="text-[#F2F2F7] text-2xl font-bold mb-3">
                    👨‍🚒 Heróis do dia a dia
                  </p>
                  <p className="text-[#F2F2F7]/80 text-lg leading-relaxed">
                    Conheça o trabalho dos bombeiros e como eles protegem nossa comunidade.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Parceiros e Órgãos Responsáveis */}
        <section className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
          >
            <h2 className="text-3xl font-bold text-[#F2F2F7] mb-8 flex items-center gap-3">
              <Users className="w-8 h-8 text-[#FF3B30]" />
              Parceiros e Órgãos Responsáveis
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {parceiros.map((parceiro, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1 + 0.1 * index }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="bg-[#1C1C1E]/80 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden hover:border-white/30 transition-all"
                >
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={parceiro.imagem}
                      alt={parceiro.nome}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div 
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: `${parceiro.cor}20` }}
                      >
                        <parceiro.icon 
                          className="w-6 h-6" 
                          style={{ color: parceiro.cor }}
                        />
                      </div>
                      <h3 className="text-xl font-bold text-[#F2F2F7]">
                        {parceiro.nome}
                      </h3>
                    </div>
                    <a 
                      href={`tel:${parceiro.telefone.replace(/\D/g, '')}`}
                      className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-white transition-all"
                      style={{ 
                        background: `linear-gradient(135deg, ${parceiro.cor}, ${parceiro.cor}dd)`,
                        boxShadow: `0 4px 15px ${parceiro.cor}40`
                      }}
                    >
                      <Phone className="w-5 h-5" />
                      {parceiro.telefone}
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Painel para Órgãos (Login) */}
        <section>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="bg-gradient-to-r from-[#1C1C1E] to-[#2C2C2E] border border-[#FF3B30]/30 rounded-3xl p-8"
          >
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="bg-[#FF3B30]/20 p-4 rounded-full">
                  <Lock className="w-10 h-10 text-[#FF3B30]" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-[#F2F2F7] mb-3">
                Painel Exclusivo para Órgãos
              </h2>
              <p className="text-[#F2F2F7]/70 text-lg">
                Acesso restrito para Bombeiros, Defesa Civil e Órgãos Ambientais
              </p>
            </div>

            {!loginVisible ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="bg-[#1C1C1E]/60 backdrop-blur-sm rounded-xl p-6 text-center"
                >
                  <Bell className="w-8 h-8 text-[#FF3B30] mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-[#F2F2F7] mb-2">
                    Alertas Prioritários
                  </h3>
                  <p className="text-[#F2F2F7]/70">
                    Receba notificações em tempo real
                  </p>
                </motion.div>
                
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="bg-[#1C1C1E]/60 backdrop-blur-sm rounded-xl p-6 text-center"
                >
                  <Eye className="w-8 h-8 text-[#FF9500] mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-[#F2F2F7] mb-2">
                    Monitoramento
                  </h3>
                  <p className="text-[#F2F2F7]/70">
                    Visão completa de todos os reportes
                  </p>
                </motion.div>
                
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="bg-[#1C1C1E]/60 backdrop-blur-sm rounded-xl p-6 text-center"
                >
                  <Users className="w-8 h-8 text-[#34C759] mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-[#F2F2F7] mb-2">
                    Coordenação
                  </h3>
                  <p className="text-[#F2F2F7]/70">
                    Gerencie equipes e recursos
                  </p>
                </motion.div>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md mx-auto bg-[#1C1C1E]/80 backdrop-blur-md rounded-2xl p-8"
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-[#F2F2F7] mb-2 font-medium">
                      Email Institucional
                    </label>
                    <input 
                      type="email"
                      placeholder="usuario@orgao.gov.br"
                      className="w-full px-4 py-3 bg-[#0A1929] border border-white/10 rounded-xl text-[#F2F2F7] focus:border-[#FF3B30] focus:outline-none focus:ring-2 focus:ring-[#FF3B30]/50 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[#F2F2F7] mb-2 font-medium">
                      Senha
                    </label>
                    <input 
                      type="password"
                      placeholder="••••••••"
                      className="w-full px-4 py-3 bg-[#0A1929] border border-white/10 rounded-xl text-[#F2F2F7] focus:border-[#FF3B30] focus:outline-none focus:ring-2 focus:ring-[#FF3B30]/50 transition-all"
                    />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-gradient-to-r from-[#FF3B30] to-[#FF6A00] text-white font-bold text-lg py-4 rounded-xl shadow-[0_4px_20px_rgba(255,59,48,0.4)] hover:shadow-[0_4px_30px_rgba(255,59,48,0.6)] transition-all"
                  >
                    Acessar Painel
                  </motion.button>
                </div>
              </motion.div>
            )}

            <div className="text-center">
              <motion.button
                onClick={() => setLoginVisible(!loginVisible)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-[#FF3B30] to-[#FF6A00] text-white font-bold text-lg px-8 py-4 rounded-xl shadow-[0_4px_20px_rgba(255,59,48,0.4)] hover:shadow-[0_4px_30px_rgba(255,59,48,0.6)] transition-all"
              >
                {loginVisible ? 'Voltar' : 'Fazer Login'}
              </motion.button>
            </div>
          </motion.div>
        </section>
      </div>
    </div>
  );
}