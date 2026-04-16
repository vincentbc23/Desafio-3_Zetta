import { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { MapPin, Camera, AlertTriangle, Navigation } from 'lucide-react';
import { Header } from '../components/Header';
import { BotaoPrincipal } from '../components/BotaoPrincipal';

export default function Reportar() {
  const navigate = useNavigate();
  const [localizacao, setLocalizacao] = useState('Rua Exemplo, 123 - Centro');
  const [descricao, setDescricao] = useState('');
  const [intensidade, setIntensidade] = useState<'baixa' | 'media' | 'alta'>('media');
  const [isLoading, setIsLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);

  const handleGPS = () => {
    setGpsLoading(true);
    
    // Obter localização real do dispositivo
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          try {
            // Usar Nominatim (OpenStreetMap) para geocoding reverso
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
              {
                headers: {
                  'Accept-Language': 'pt-BR'
                }
              }
            );
            
            const data = await response.json();
            
            // Montar endereço legível
            const address = data.address;
            let locationString = '';
            
            if (address.road) {
              locationString += address.road;
              if (address.house_number) {
                locationString += `, ${address.house_number}`;
              }
            } else if (address.suburb || address.neighbourhood) {
              locationString += address.suburb || address.neighbourhood;
            }
            
            if (address.city || address.town || address.village) {
              locationString += ` - ${address.city || address.town || address.village}`;
            }
            
            if (address.state) {
              locationString += `, ${address.state}`;
            }
            
            // Se não conseguiu montar um endereço, usar as coordenadas
            if (!locationString) {
              locationString = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
            }
            
            setLocalizacao(locationString);
          } catch (error) {
            // Em caso de erro no geocoding, usar as coordenadas
            setLocalizacao(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
          } finally {
            setGpsLoading(false);
          }
        },
        (error) => {
          // Tratar erros de geolocalização
          let errorMessage = 'Erro ao obter localização';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Permissão de localização negada';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Localização indisponível';
              break;
            case error.TIMEOUT:
              errorMessage = 'Tempo esgotado ao buscar localização';
              break;
          }
          
          setLocalizacao(errorMessage);
          setGpsLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      setLocalizacao('Geolocalização não suportada pelo navegador');
      setGpsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simular envio
    setTimeout(() => {
      navigate('/sucesso');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#0A1929]">
      <Header />
      
      <div className="max-w-4xl mx-auto px-8 py-12">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-[#F2F2F7] mb-8"
        >
          Reportar Incêndio
        </motion.h1>
        
        {/* Mapa pequeno */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="w-full h-64 rounded-xl mb-8 overflow-hidden relative"
          style={{
            backgroundImage: 'url(https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-G4sMDQmtjKLy72KZpwE4JKYXP4WfMC.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                filter: [
                  'drop-shadow(0 0 10px rgba(255, 59, 48, 0.6))',
                  'drop-shadow(0 0 20px rgba(255, 59, 48, 1))',
                  'drop-shadow(0 0 10px rgba(255, 59, 48, 0.6))'
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <MapPin className="w-12 h-12 text-[#FF3B30]" />
            </motion.div>
          </div>
        </motion.div>
        
        {/* Formulário */}
        <motion.form 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSubmit} 
          className="bg-[#1C1C1E]/80 backdrop-blur-md border border-white/10 rounded-xl p-8 space-y-6"
        >
          <div>
            <label className="block text-[#F2F2F7] mb-2 font-semibold">Localização</label>
            <div className="flex gap-2">
              <input 
                type="text"
                value={localizacao}
                onChange={(e) => setLocalizacao(e.target.value)}
                className="flex-1 bg-[#0A1929] text-[#F2F2F7] px-4 py-3 rounded-lg border border-white/20 focus:outline-none focus:border-[#FF3B30] focus:shadow-[0_0_15px_rgba(255,59,48,0.3)] transition-all"
              />
              <motion.button
                type="button"
                onClick={handleGPS}
                disabled={gpsLoading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-[#FF9500] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#FF9500]/90 disabled:opacity-50 flex items-center gap-2"
              >
                {gpsLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Navigation className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <Navigation className="w-5 h-5" />
                )}
                GPS
              </motion.button>
            </div>
          </div>
          
          <div>
            <label className="block text-[#F2F2F7] mb-2 font-semibold">Descrição</label>
            <textarea 
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              rows={4}
              placeholder="Descreva o que você está vendo..."
              className="w-full bg-[#0A1929] text-[#F2F2F7] px-4 py-3 rounded-lg border border-white/20 focus:outline-none focus:border-[#FF3B30] focus:shadow-[0_0_15px_rgba(255,59,48,0.3)] placeholder-gray-500 transition-all"
            />
          </div>
          
          <div>
            <label className="block text-[#F2F2F7] mb-3 font-semibold">Intensidade</label>
            <div className="flex gap-4">
              <motion.button
                type="button"
                onClick={() => setIntensidade('baixa')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                  intensidade === 'baixa' 
                    ? 'bg-[#34C759] text-white shadow-[0_4px_15px_rgba(52,199,89,0.4)]' 
                    : 'bg-[#0A1929] text-gray-400 border border-white/20 hover:bg-[#1C1C1E]'
                }`}
              >
                Baixa
              </motion.button>
              <motion.button
                type="button"
                onClick={() => setIntensidade('media')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                  intensidade === 'media' 
                    ? 'bg-[#FF9500] text-white shadow-[0_4px_15px_rgba(255,149,0,0.4)]' 
                    : 'bg-[#0A1929] text-gray-400 border border-white/20 hover:bg-[#1C1C1E]'
                }`}
              >
                Média
              </motion.button>
              <motion.button
                type="button"
                onClick={() => setIntensidade('alta')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                  intensidade === 'alta' 
                    ? 'bg-[#FF3B30] text-white shadow-[0_4px_15px_rgba(255,59,48,0.4)]' 
                    : 'bg-[#0A1929] text-gray-400 border border-white/20 hover:bg-[#1C1C1E]'
                }`}
              >
                Alta
              </motion.button>
            </div>
          </div>
          
          {/* Upload de imagem */}
          <div>
            <label className="block text-[#F2F2F7] mb-3 font-semibold">Enviar Imagem</label>
            <motion.div 
              whileHover={{ borderColor: 'rgba(255, 59, 48, 0.5)' }}
              className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center transition-all cursor-pointer hover:bg-[#0A1929]/50"
            >
              <Camera className="w-12 h-12 text-gray-500 mx-auto mb-3" />
              <p className="text-gray-400">Clique para adicionar uma foto</p>
            </motion.div>
          </div>
          
          {/* Aviso */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-[#FF9500]/10 border border-[#FF9500]/40 rounded-lg p-4 flex items-start gap-3 backdrop-blur-sm"
          >
            <AlertTriangle className="w-6 h-6 text-[#FF9500] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[#FF9500] font-semibold">Risco alto de propagação</p>
              <p className="text-[#FF9500]/80 text-sm mt-1">
                Condições climáticas favoráveis à propagação rápida do fogo. Mantenha-se em local seguro.
              </p>
            </div>
          </motion.div>
          
          <BotaoPrincipal fullWidth isLoading={isLoading}>
            🚨 ENVIAR ALERTA
          </BotaoPrincipal>
        </motion.form>
      </div>
    </div>
  );
}