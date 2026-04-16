import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Flame, Calendar, MapPin, Wind, Thermometer, Droplets, Layers } from 'lucide-react';
import { Header } from '../components/Header';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface IncendioMarcador {
  id: number;
  lat: number;
  lng: number;
  risco: 'alto' | 'medio' | 'controlado';
  confirmacoes: number;
  alertasFalsos: number;
  localizacao: string;
}

// Função para criar ícones customizados animados
const createCustomIcon = (risco: 'alto' | 'medio' | 'controlado') => {
  const cor = risco === 'alto' ? '#FF3B30' : risco === 'medio' ? '#FF9500' : '#34C759';
  
  return L.divIcon({
    className: 'custom-fire-marker',
    html: `
      <div style="position: relative; width: 40px; height: 40px;">
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 40px;
          height: 40px;
          background: ${cor};
          border-radius: 50%;
          filter: blur(10px);
          opacity: 0.6;
          animation: pulse 2s infinite;
        "></div>
        <svg 
          style="
            position: relative;
            width: 32px;
            height: 32px;
            margin: 4px;
            filter: drop-shadow(0 0 8px ${cor});
            animation: bounce 1s infinite;
          "
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="${cor}" 
          stroke="currentColor" 
          stroke-width="2" 
          stroke-linecap="round" 
          stroke-linejoin="round"
        >
          <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
        </svg>
      </div>
      <style>
        @keyframes pulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.6; }
          50% { transform: translate(-50%, -50%) scale(1.5); opacity: 0.3; }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      </style>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
  });
};

export default function Mapa() {
  const [dataFiltro, setDataFiltro] = useState('');
  const [regiaoFiltro, setRegiaoFiltro] = useState('');
  const [mapStyle, setMapStyle] = useState('streets');
  const [isStyleOpen, setIsStyleOpen] = useState(false);
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  
  // Coordenadas centrais do Brasil (Brasília)
  const centerPosition: [number, number] = [-15.7939, -47.8828];
  
  // Dados meteorológicos
  const dadosMeteo = {
    vento: 15,
    temperatura: 32,
    umidade: 28
  };
  
  // Marcadores de exemplo com coordenadas reais do Brasil
  const marcadores: IncendioMarcador[] = [
    { id: 1, lat: -15.7939, lng: -47.8828, risco: 'alto', confirmacoes: 12, alertasFalsos: 1, localizacao: 'Brasília - DF' },
    { id: 2, lat: -23.5505, lng: -46.6333, risco: 'medio', confirmacoes: 5, alertasFalsos: 0, localizacao: 'São Paulo - SP' },
    { id: 3, lat: -22.9068, lng: -43.1729, risco: 'controlado', confirmacoes: 3, alertasFalsos: 0, localizacao: 'Rio de Janeiro - RJ' },
    { id: 4, lat: -3.7172, lng: -38.5433, risco: 'alto', confirmacoes: 8, alertasFalsos: 2, localizacao: 'Fortaleza - CE' },
    { id: 5, lat: -12.9714, lng: -38.5014, risco: 'medio', confirmacoes: 6, alertasFalsos: 1, localizacao: 'Salvador - BA' },
    { id: 6, lat: -16.3578, lng: -46.9064, risco: 'alto', confirmacoes: 15, alertasFalsos: 0, localizacao: 'Unaí - MG (Noroeste)' },
    { id: 7, lat: -17.2219, lng: -46.8750, risco: 'medio', confirmacoes: 9, alertasFalsos: 1, localizacao: 'Paracatu - MG (Noroeste)' },
    { id: 8, lat: -18.5789, lng: -46.5181, risco: 'alto', confirmacoes: 11, alertasFalsos: 0, localizacao: 'Patos de Minas - MG (Noroeste)' },
  ];

  // URLs dos diferentes estilos de mapa
  const mapStyles: { [key: string]: { url: string; attribution: string } } = {
    streets: {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    },
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: '&copy; Esri'
    },
    terrain: {
      url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
      attribution: '&copy; OpenTopoMap'
    },
    dark: {
      url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      attribution: '&copy; CartoDB'
    }
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;
    
    // Criar o mapa
    const map = L.map(mapContainerRef.current).setView(centerPosition, 5);
    mapRef.current = map;
    
    // Adicionar camada de tiles
    const tileLayer = L.tileLayer(mapStyles[mapStyle].url, {
      attribution: mapStyles[mapStyle].attribution,
      maxZoom: 19
    }).addTo(map);
    
    // Adicionar marcadores
    marcadores.forEach((marcador) => {
      const marker = L.marker([marcador.lat, marcador.lng], {
        icon: createCustomIcon(marcador.risco)
      }).addTo(map);
      
      // Popup customizado
      const popupContent = `
        <div style="text-align: center; padding: 8px; min-width: 200px;">
          <h3 style="font-weight: bold; font-size: 16px; margin-bottom: 4px;">Incêndio #${marcador.id}</h3>
          <p style="font-size: 12px; color: #666; margin-bottom: 8px;">${marcador.localizacao}</p>
          <div style="display: flex; gap: 8px; font-size: 12px; margin-bottom: 8px; justify-content: center;">
            <span style="color: #34C759;">👍 ${marcador.confirmacoes}</span>
            <span>|</span>
            <span style="color: #FF3B30;">👎 ${marcador.alertasFalsos}</span>
          </div>
          <span style="display: inline-block; padding: 4px 12px; border-radius: 16px; font-size: 11px; font-weight: 600; ${
            marcador.risco === 'alto' ? 'background: #ffebee; color: #c62828;' :
            marcador.risco === 'medio' ? 'background: #fff3e0; color: #ef6c00;' :
            'background: #e8f5e9; color: #2e7d32;'
          }">
            ${marcador.risco === 'alto' ? '🔥 Alto Risco' :
              marcador.risco === 'medio' ? '⚠️ Médio Risco' :
              '✅ Controlado'}
          </span>
        </div>
      `;
      
      marker.bindPopup(popupContent);
    });
    
    // Cleanup
    return () => {
      map.remove();
    };
  }, [mapStyle]);

  return (
    <div className="min-h-screen bg-[#0A1929]">
      <Header />
      
      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Filtros */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#1C1C1E]/80 backdrop-blur-md border border-white/10 rounded-xl p-6 mb-8"
        >
          <div className="flex gap-6">
            <div className="flex-1">
              <label className="block text-[#F2F2F7] mb-2 font-semibold flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Data
              </label>
              <input 
                type="date"
                value={dataFiltro}
                onChange={(e) => setDataFiltro(e.target.value)}
                className="w-full bg-[#0A1929] text-[#F2F2F7] px-4 py-3 rounded-lg border border-white/20 focus:outline-none focus:border-[#FF3B30] focus:shadow-[0_0_15px_rgba(255,59,48,0.3)] transition-all"
              />
            </div>
            
            <div className="flex-1">
              <label className="block text-[#F2F2F7] mb-2 font-semibold flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Região
              </label>
              <select 
                value={regiaoFiltro}
                onChange={(e) => setRegiaoFiltro(e.target.value)}
                className="w-full bg-[#0A1929] text-[#F2F2F7] px-4 py-3 rounded-lg border border-white/20 focus:outline-none focus:border-[#FF3B30] focus:shadow-[0_0_15px_rgba(255,59,48,0.3)] transition-all"
              >
                <option value="">Todas as regiões</option>
                <option value="norte">Norte</option>
                <option value="sul">Sul</option>
                <option value="leste">Leste</option>
                <option value="oeste">Oeste</option>
              </select>
            </div>
          </div>
        </motion.div>
        
        {/* Mapa Interativo */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-[#1C1C1E]/80 backdrop-blur-md border border-white/10 rounded-xl p-6"
        >
          <div className="relative w-full h-[600px] rounded-lg overflow-hidden">
            <div 
              ref={mapContainerRef} 
              style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}
            />

            {/* Controle de Estilo do Mapa */}
            <div className="absolute top-4 left-4 z-[1000]">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsStyleOpen(!isStyleOpen)}
                className="bg-[#1C1C1E]/90 backdrop-blur-md border border-white/20 text-white p-3 rounded-lg shadow-xl flex items-center gap-2"
              >
                <Layers className="w-5 h-5" />
                <span className="text-sm font-semibold">Estilo</span>
              </motion.button>
              
              <AnimatePresence>
                {isStyleOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-2 bg-[#1C1C1E]/95 backdrop-blur-md border border-white/20 rounded-lg shadow-2xl overflow-hidden"
                  >
                    <button
                      onClick={() => { setMapStyle('streets'); setIsStyleOpen(false); }}
                      className="w-full px-4 py-3 text-left text-white hover:bg-white/10 transition-colors text-sm"
                    >
                      🗺️ Ruas
                    </button>
                    <button
                      onClick={() => { setMapStyle('satellite'); setIsStyleOpen(false); }}
                      className="w-full px-4 py-3 text-left text-white hover:bg-white/10 transition-colors text-sm"
                    >
                      🛰️ Satélite
                    </button>
                    <button
                      onClick={() => { setMapStyle('terrain'); setIsStyleOpen(false); }}
                      className="w-full px-4 py-3 text-left text-white hover:bg-white/10 transition-colors text-sm"
                    >
                      ⛰️ Terreno
                    </button>
                    <button
                      onClick={() => { setMapStyle('dark'); setIsStyleOpen(false); }}
                      className="w-full px-4 py-3 text-left text-white hover:bg-white/10 transition-colors text-sm"
                    >
                      🌙 Escuro
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Painel de Informações Meteorológicas */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="absolute top-4 right-4 bg-[#1C1C1E]/90 backdrop-blur-md border border-white/20 rounded-xl p-4 shadow-2xl min-w-[200px] z-[1000]"
            >
              <h3 className="text-[#F2F2F7] font-bold text-sm mb-3">Condições Climáticas</h3>
              
              {/* Vento */}
              <div className="flex items-center gap-3 mb-3">
                <motion.div
                  animate={{ rotate: [0, 10, 0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Wind className="w-6 h-6 text-[#00C7FF]" />
                </motion.div>
                <div>
                  <p className="text-gray-400 text-xs">Vento</p>
                  <p className="text-[#F2F2F7] font-bold text-lg">{dadosMeteo.vento} km/h</p>
                </div>
              </div>
              
              {/* Temperatura */}
              <div className="flex items-center gap-3 mb-3">
                <Thermometer className="w-6 h-6 text-[#FF3B30]" />
                <div>
                  <p className="text-gray-400 text-xs">Temperatura</p>
                  <p className="text-[#F2F2F7] font-bold text-lg">{dadosMeteo.temperatura}°C</p>
                </div>
              </div>
              
              {/* Umidade */}
              <div className="flex items-center gap-3">
                <Droplets className="w-6 h-6 text-[#34C759]" />
                <div>
                  <p className="text-gray-400 text-xs">Umidade</p>
                  <p className="text-[#F2F2F7] font-bold text-lg">{dadosMeteo.umidade}%</p>
                </div>
              </div>
              
              {/* Alerta de risco */}
              {dadosMeteo.umidade < 30 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-3 pt-3 border-t border-white/10"
                >
                  <p className="text-[#FF9500] text-xs font-semibold">⚠️ Risco Elevado</p>
                  <p className="text-gray-400 text-xs">Umidade baixa</p>
                </motion.div>
              )}
            </motion.div>
          </div>
          
          {/* Legenda */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 flex items-center justify-center gap-8"
          >
            <div className="flex items-center gap-2">
              <Flame className="w-6 h-6 text-[#FF3B30]" style={{ filter: 'drop-shadow(0 0 8px #FF3B30)' }} />
              <span className="text-[#F2F2F7] font-semibold">Alto risco</span>
            </div>
            <div className="flex items-center gap-2">
              <Flame className="w-6 h-6 text-[#FF9500]" style={{ filter: 'drop-shadow(0 0 8px #FF9500)' }} />
              <span className="text-[#F2F2F7] font-semibold">Médio</span>
            </div>
            <div className="flex items-center gap-2">
              <Flame className="w-6 h-6 text-[#34C759]" style={{ filter: 'drop-shadow(0 0 8px #34C759)' }} />
              <span className="text-[#F2F2F7] font-semibold">Controlado</span>
            </div>
          </motion.div>
          
          {/* Dica de uso */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-gray-400 text-sm mt-4"
          >
            💡 Use o scroll para zoom e arraste para navegar pelo mapa
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}