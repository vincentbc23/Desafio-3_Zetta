import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { MapPin, AlertTriangle, Navigation } from 'lucide-react';
import { Header } from '../components/Header';
import { BotaoPrincipal } from '../components/BotaoPrincipal';
import { api } from '../api/client';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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

interface IngestionResponse {
  reportId: string;
  location: {
    latitude: number;
    longitude: number;
    description: string | null;
    accuracyMeters: number | null;
    source: string;
    confirmed: boolean;
  };
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

export default function Reportar() {
  const navigate = useNavigate();
  const [localizacao, setLocalizacao] = useState('Localização ainda não capturada');
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [locationSource, setLocationSource] = useState<'gps' | 'manual'>('gps');
  const [locationConfirmed, setLocationConfirmed] = useState(false);
  const [description, setDescription] = useState('');
  const [features, setFeatures] = useState<IngestionFeatures | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const precisionThreshold = 25;

  const riscoAlto =
    !!features &&
    (features.DiaSemChuva >= 10 ||
      features.Temperatura_C >= 32 ||
      features['Umidade_Relativa_%'] <= 35 ||
      features.Vento_ms >= 8);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) {
      return;
    }

    const initialCenter: [number, number] = [-15.7939, -47.8828];
    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      attributionControl: true,
    }).setView(initialCenter, 5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!coords || !mapRef.current) {
      return;
    }

    const latLng: L.LatLngExpression = [coords.latitude, coords.longitude];

    if (!markerRef.current) {
      markerRef.current = L.marker(latLng, {
        draggable: true,
        icon: L.divIcon({
          className: 'report-fire-marker',
          html: `
            <div style="position:relative;width:36px;height:36px;">
              <div style="position:absolute;inset:0;background:rgba(255,59,48,.25);border-radius:9999px;filter:blur(8px);"></div>
              <div style="position:relative;display:flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:9999px;background:#FF3B30;color:#fff;border:2px solid rgba(255,255,255,.9);box-shadow:0 0 0 6px rgba(255,59,48,.12);">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
              </div>
            </div>
          `,
          iconSize: [36, 36],
          iconAnchor: [18, 36],
          popupAnchor: [0, -36],
        }),
      }).addTo(mapRef.current);

      markerRef.current.on('dragend', () => {
        const marker = markerRef.current;

        if (!marker) {
          return;
        }

        const position = marker.getLatLng();
        setCoords({ latitude: position.lat, longitude: position.lng });
        setLocationSource('manual');
        setLocationConfirmed(true);
        setGpsAccuracy(null);
      });
    } else {
      markerRef.current.setLatLng(latLng);
    }

    mapRef.current.flyTo(latLng, 13, { duration: 1.2 });
  }, [coords]);

  useEffect(() => {
    if (!coords) {
      return;
    }

    let cancelled = false;

    const updateLocationLabel = async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}&addressdetails=1`,
          {
            headers: {
              'Accept-Language': 'pt-BR',
            },
          }
        );

        const data = await response.json();
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

        if (!locationString) {
          locationString = `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`;
        }

        if (!cancelled) {
          setLocalizacao(locationString);
        }
      } catch {
        if (!cancelled) {
          setLocalizacao(`${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`);
        }
      }
    };

    void updateLocationLabel();

    return () => {
      cancelled = true;
    };
  }, [coords]);

  const handleGPS = () => {
    setGpsLoading(true);
    setErrorMessage('');
    setLocationConfirmed(false);
    
    // Obter localização real do dispositivo
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          setCoords({ latitude, longitude });
          setGpsAccuracy(accuracy ?? null);
          setLocationSource('gps');
          setLocationConfirmed(accuracy <= precisionThreshold);

          if (accuracy > precisionThreshold) {
            setErrorMessage(`Precisão do GPS está em cerca de ${Math.round(accuracy)}m. Arraste o marcador até o foco exato antes de enviar.`);
          }
          setGpsLoading(false);
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
          setErrorMessage(errorMessage);
          setGpsLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 20000,
          maximumAge: 0
        }
      );
    } else {
      setLocalizacao('Geolocalização não suportada pelo navegador');
      setErrorMessage('Geolocalização não suportada pelo navegador');
      setGpsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!coords) {
      setErrorMessage('Capture sua localização via GPS antes de enviar.');
      return;
    }

    if (gpsAccuracy != null && gpsAccuracy > precisionThreshold && !locationConfirmed) {
      setErrorMessage('A precisão do GPS ainda está baixa. Arraste o marcador até o foco exato e confirme antes de enviar.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const payload = {
        latitude: coords.latitude,
        longitude: coords.longitude,
        description,
        accuracyMeters: gpsAccuracy,
        locationSource,
        locationConfirmed,
      };

      const response = await api.post<IngestionResponse>('/api/reportar', payload);
      setFeatures(response.features);

      setTimeout(() => {
        navigate('/sucesso', { state: response });
      }, 1200);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao enviar dados para ingestão.';
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
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
          className="w-full h-64 rounded-xl mb-8 overflow-hidden relative border border-white/10"
        >
          <div ref={mapContainerRef} className="absolute inset-0" />
          <div className="absolute top-3 left-3 space-y-2">
            <div className="bg-[#0A1929]/80 text-[#F2F2F7] text-xs px-3 py-1 rounded-full border border-white/20 backdrop-blur-sm">
              {coords
                ? `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`
                : 'Capture o GPS para centralizar'}
            </div>
            <div className="bg-[#0A1929]/80 text-[#F2F2F7] text-xs px-3 py-1 rounded-full border border-white/20 backdrop-blur-sm">
              {gpsAccuracy != null ? `Precisão aproximada: ${Math.round(gpsAccuracy)}m` : 'Precisão ainda não disponível'}
            </div>
            <div className="bg-[#0A1929]/80 text-[#F2F2F7] text-xs px-3 py-1 rounded-full border border-white/20 backdrop-blur-sm">
              {locationConfirmed ? 'Posição confirmada' : 'Arraste o marcador para confirmar'}
            </div>
          </div>
          <div className="absolute bottom-3 left-3 right-3 bg-black/40 text-white text-xs rounded-lg px-3 py-2 backdrop-blur-sm">
            Arraste o marcador vermelho até o foco exato do incêndio. Em caso de GPS impreciso, a confirmação manual é obrigatória.
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
                readOnly
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
            <div className="mt-2 text-xs text-gray-300 flex flex-wrap gap-2">
              <span>Origem: {locationSource === 'gps' ? 'GPS' : 'Manual'}</span>
              <span>•</span>
              <span>Confirmada: {locationConfirmed ? 'Sim' : 'Não'}</span>
            </div>
          </div>

          <div>
            <label className="block text-[#F2F2F7] mb-2 font-semibold">Descrição do ocorrido</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva fumaça, chamas, vento forte, acessos bloqueados, pessoas em risco ou qualquer detalhe importante."
              rows={5}
              maxLength={1200}
              className="w-full bg-[#0A1929] text-[#F2F2F7] px-4 py-3 rounded-lg border border-white/20 focus:outline-none focus:border-[#FF3B30] focus:shadow-[0_0_15px_rgba(255,59,48,0.3)] transition-all resize-none"
            />
            <div className="mt-2 flex justify-between text-xs text-gray-400">
              <span>Essa descrição ajuda a equipe a entender o contexto, mas não altera a severidade automaticamente.</span>
              <span>{description.length}/1200</span>
            </div>
          </div>

          {features && (
            <div className="bg-[#0A1929]/60 border border-white/10 rounded-lg p-5">
              <p className="text-[#F2F2F7] font-semibold mb-3">Atributos coletados para o modelo</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <p className="text-gray-300">DiaSemChuva: <span className="text-[#F2F2F7]">{features.DiaSemChuva}</span></p>
                <p className="text-gray-300">Precipitacao: <span className="text-[#F2F2F7]">{features.Precipitacao}</span></p>
                <p className="text-gray-300">Temperatura_C: <span className="text-[#F2F2F7]">{features.Temperatura_C}</span></p>
                <p className="text-gray-300">Umidade_Relativa_%: <span className="text-[#F2F2F7]">{features['Umidade_Relativa_%']}</span></p>
                <p className="text-gray-300">Vento_ms: <span className="text-[#F2F2F7]">{features.Vento_ms}</span></p>
                <p className="text-gray-300">Mes: <span className="text-[#F2F2F7]">{features.Mes}</span></p>
                <p className="text-gray-300">Hora: <span className="text-[#F2F2F7]">{features.Hora}</span></p>
                <p className="text-gray-300">Latitude: <span className="text-[#F2F2F7]">{features.Latitude}</span></p>
                <p className="text-gray-300">Longitude: <span className="text-[#F2F2F7]">{features.Longitude}</span></p>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="bg-[#FF3B30]/15 border border-[#FF3B30]/40 rounded-lg p-3 text-[#F2F2F7] text-sm">
              {errorMessage}
            </div>
          )}
          
          {/* Aviso */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-[#FF9500]/10 border border-[#FF9500]/40 rounded-lg p-4 flex items-start gap-3 backdrop-blur-sm"
          >
            <AlertTriangle className="w-6 h-6 text-[#FF9500] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[#FF9500] font-semibold">
                {features
                  ? riscoAlto
                    ? 'Risco elevado de propagação'
                    : 'Risco moderado no momento'
                  : 'Aguardando dados climáticos para classificar o risco'}
              </p>
              <p className="text-[#FF9500]/80 text-sm mt-1">
                {features
                  ? riscoAlto
                    ? 'Condições atuais indicam maior chance de propagação. Priorize áreas seguras e reporte qualquer mudança.'
                    : 'Condições atuais mais estáveis, mas siga monitorando e mantenha distância da área afetada.'
                  : 'Após enviar o reporte, o sistema usa clima e localização para calcular o nível de atenção.'}
              </p>
            </div>
          </motion.div>
          
          <BotaoPrincipal fullWidth isLoading={isLoading}>
            ENVIAR PARA INGESTAO AUTOMATICA
          </BotaoPrincipal>
        </motion.form>
      </div>
    </div>
  );
}