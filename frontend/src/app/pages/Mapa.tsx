import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Flame, Calendar, MapPin, Wind, Thermometer, Droplets, Layers, RefreshCw } from 'lucide-react';
import { Header } from '../components/Header';
import { useApi } from '../api/useApi';
import { apiConfig } from '../api/config';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';


interface IncendioMarcador {
  id: string;
  lat: number;
  lng: number;
  description: string | null;
  accuracyMeters: number | null;
  locationSource: string;
  locationConfirmed: boolean;
  risco: 'alto' | 'medio' | 'controlado';
  probIncendio: number;
  frpPrevisto: number;
  createdAt: string;
  ventoMs: number;
  temperaturaC: number;
  umidadePct: number;
  regiaoMg: string;
  localizacao: string;
}


interface DadosMapaResponse {
  porRegiao?: Array<{
    nome: string;
    incendios: number;
  }>;
  ultimosReportes: Array<{
    id: string;
    latitude: number;
    longitude: number;
    description: string | null;
    accuracy_meters: number | null;
    location_source: string | null;
    location_confirmed: boolean | null;
    regiao_mg: string | null;
    created_at: string;
    temperatura_c: number | null;
    umidade_relativa_pct: number | null;
    vento_ms: number | null;
    prob_incendio: number | null;
    classe_prevista: string | null;
    frp_previsto: number | null;
  }>;
  updatedAt: string;
}


type MapStyleKey = 'streets' | 'satellite' | 'terrain' | 'dark';


// Bounding box de MG para restrição de pan/zoom
const minasGeraisBounds = L.latLngBounds(
  L.latLng(-24.72, -51.58),
  L.latLng(-12.42, -39.30)
);
const minasGeraisBoundsExpanded = minasGeraisBounds.pad(0.05);


// ✅ NOVO: Constrói polígono-máscara invertido (mundo com buraco no formato de MG)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildInvertedMask(geojson: any): GeoJSON.Feature {
  // Anel externo cobrindo o mundo inteiro
  const worldRing: GeoJSON.Position[] = [
    [-180, -90], [180, -90], [180, 90], [-180, 90], [-180, -90],
  ];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let geometry: any = geojson;
  if (geojson.type === 'FeatureCollection') geometry = geojson.features[0].geometry;
  else if (geojson.type === 'Feature') geometry = geojson.geometry;

  // Extrai todos os anéis externos (suporta Polygon e MultiPolygon)
  const innerRings: GeoJSON.Position[][] =
    geometry.type === 'Polygon'
      ? [geometry.coordinates[0]]
      : (geometry.coordinates as GeoJSON.Position[][][]).map((poly) => poly[0]);

  return {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [worldRing, ...innerRings],
    },
    properties: {},
  };
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
    popupAnchor: [0, -40],
  });
};


export default function Mapa() {
  const [dataFiltro, setDataFiltro] = useState('');
  const [regiaoFiltro, setRegiaoFiltro] = useState('');
  const [mapStyle, setMapStyle] = useState<MapStyleKey>('streets');
  const [isStyleOpen, setIsStyleOpen] = useState(false);
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const { data, error, refetch, refreshing } = useApi<DadosMapaResponse>(
    '/api/dados',
    [],
    apiConfig.refreshIntervalMs
  );

  const normalizeRegionKey = (value: string) =>
    value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

  const regiaoOptions = (data?.porRegiao ?? [])
    .map((item) => item.nome)
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, 'pt-BR'));


  const marcadores: IncendioMarcador[] = (data?.ultimosReportes ?? [])
    .map((reporte) => {
      const frp = Number(reporte.frp_previsto ?? 0);
      const risco: IncendioMarcador['risco'] =
        frp > 500 ? 'alto' : frp >= 50 ? 'medio' : 'controlado';

      return {
        id: reporte.id,
        lat: Number(reporte.latitude),
        lng: Number(reporte.longitude),
        description: reporte.description || null,
        accuracyMeters:
          reporte.accuracy_meters == null ? null : Number(reporte.accuracy_meters),
        locationSource: reporte.location_source || 'gps',
        locationConfirmed: Boolean(reporte.location_confirmed),
        risco,
        probIncendio: Number(reporte.prob_incendio ?? 0),
        frpPrevisto: Number(reporte.frp_previsto ?? 0),
        createdAt: reporte.created_at,
        ventoMs: Number(reporte.vento_ms ?? 0),
        temperaturaC: Number(reporte.temperatura_c ?? 0),
        umidadePct: Number(reporte.umidade_relativa_pct ?? 0),
        regiaoMg: reporte.regiao_mg || 'Não classificada',
        localizacao: `${
          reporte.regiao_mg ? `${reporte.regiao_mg} • ` : ''
        }${Number(reporte.latitude).toFixed(4)}, ${Number(reporte.longitude).toFixed(4)}`,
      };
    })
    .filter((item) => {
      const matchesData = !dataFiltro || item.createdAt.startsWith(dataFiltro);
      const matchesRegiao =
        !regiaoFiltro || normalizeRegionKey(item.regiaoMg) === regiaoFiltro;
      return matchesData && matchesRegiao;
    });


  const marcadorReferencia = marcadores[0];

  const dadosMeteo = {
    vento: marcadorReferencia ? Number(marcadorReferencia.ventoMs.toFixed(1)) : 0,
    temperatura: marcadorReferencia ? Number(marcadorReferencia.temperaturaC.toFixed(1)) : 0,
    umidade: marcadorReferencia ? Number(marcadorReferencia.umidadePct.toFixed(1)) : 0,
  };


  const mapStyles: Record<MapStyleKey, { url: string; attribution: string }> = {
    streets: {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    },
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: '&copy; Esri',
    },
    terrain: {
      url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
      attribution: '&copy; OpenTopoMap',
    },
    dark: {
      url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      attribution: '&copy; CartoDB',
    },
  };


  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = L.map(mapContainerRef.current, {
      maxBounds: minasGeraisBoundsExpanded,
      maxBoundsViscosity: 1.0,
      minZoom: 7,
      maxZoom: 12,
    });
    mapRef.current = map;

    // Tile layer
    L.tileLayer(mapStyles[mapStyle].url, {
      attribution: mapStyles[mapStyle].attribution,
      maxZoom: 12,
      minZoom: 7,
    }).addTo(map);

    // ✅ NOVO: Busca GeoJSON real de MG no IBGE → aplica borda + máscara
    fetch(
      'https://servicodados.ibge.gov.br/api/v3/malhas/estados/31?formato=application/vnd.geo+json'
    )
      .then((res) => res.json())
      .then((mgGeoJson) => {
        if (!mapRef.current) return;

        // 1. Borda laranja com glow — delimita o estado
        L.geoJSON(mgGeoJson, {
          style: {
            color: '#FF6B35',
            weight: 2.5,
            opacity: 1,
            fill: false,
          },
        }).addTo(map);

        // 2. Segunda borda mais suave para efeito de glow
        L.geoJSON(mgGeoJson, {
          style: {
            color: '#FF9500',
            weight: 6,
            opacity: 0.18,
            fill: false,
          },
        }).addTo(map);

        // 3. Máscara: escurece tudo FORA de MG (cor de fundo da página)
        L.geoJSON(buildInvertedMask(mgGeoJson), {
          style: {
            fillColor: '#0A1929',
            fillOpacity: 0.82,
            color: 'transparent',
            weight: 0,
          },
          interactive: false,
        }).addTo(map);

        // 4. Posiciona o mapa usando bounds reais do GeoJSON
        const mgLayer = L.geoJSON(mgGeoJson);
        map.fitBounds(mgLayer.getBounds(), { padding: [24, 24] });
      })
      .catch(() => {
        // Fallback: usa bounding box aproximado se IBGE estiver indisponível
        map.fitBounds(minasGeraisBounds, { padding: [30, 30] });
      });

    // Adicionar marcadores (após tile layer, antes do fitBounds assíncrono — ok)
    marcadores.forEach((marcador) => {
      const marker = L.marker([marcador.lat, marcador.lng], {
        icon: createCustomIcon(marcador.risco),
      }).addTo(map);

      const popupContent = `
        <div style="text-align: center; padding: 10px 6px; min-width: 220px; display: flex; flex-direction: column; align-items: center; gap: 8px;">
          <h3 style="font-weight: 700; font-size: 16px; margin: 0; line-height: 1.2;">Reporte ${marcador.id.slice(0, 8)}</h3>
          <p style="font-size: 12px; color: #666; margin: 0;">${marcador.localizacao}</p>
          <p style="font-size: 12px; color: #666; margin: 0;">Região: <strong>${marcador.regiaoMg}</strong></p>
          <div style="display: flex; flex-wrap: wrap; gap: 8px; font-size: 12px; justify-content: center; align-items: center;">
            <span style="color: #34C759; font-weight: 600;">Prob: ${(marcador.probIncendio * 100).toFixed(1)}%</span>
            <span style="color: #999;">•</span>
            <span style="color: #FF3B30; font-weight: 600;">FRP: ${marcador.frpPrevisto.toFixed(2)}</span>
          </div>
          <div style="display: flex; flex-direction: column; gap: 4px; align-items: center; font-size: 11px; color: #666;">
            <span>${new Date(marcador.createdAt).toLocaleString('pt-BR')}</span>
            <span>Origem: ${marcador.locationSource === 'manual' ? 'Manual' : 'GPS'}</span>
            <span>${marcador.locationConfirmed ? 'Posição confirmada' : 'Posição não confirmada'}</span>
            <span>${marcador.accuracyMeters != null ? `Precisão: ${Math.round(marcador.accuracyMeters)}m` : 'Precisão não informada'}</span>
            ${marcador.description ? `<span style="max-width: 220px; text-wrap: pretty;">Descrição: ${marcador.description}</span>` : ''}
          </div>
          <span style="display: inline-block; padding: 4px 12px; border-radius: 16px; font-size: 11px; font-weight: 600; margin-top: 2px; ${
            marcador.risco === 'alto'
              ? 'background: #ffebee; color: #c62828;'
              : marcador.risco === 'medio'
              ? 'background: #fff3e0; color: #ef6c00;'
              : 'background: #e8f5e9; color: #2e7d32;'
          }">
            ${
              marcador.risco === 'alto'
                ? '🔥 Alto Risco'
                : marcador.risco === 'medio'
                ? '⚠️ Médio Risco'
                : '✅ Controlado'
            }
          </span>
        </div>
      `;

      marker.bindPopup(popupContent);
    });

    return () => {
      map.remove();
    };
  }, [mapStyle, dataFiltro, regiaoFiltro, data?.ultimosReportes]);


  return (
    <div className="min-h-screen bg-[#0A1929]">
      <Header />

      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="flex items-center justify-end gap-3 mb-4">
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
                {regiaoOptions.map((nome) => (
                  <option key={nome} value={normalizeRegionKey(nome)}>
                    {nome}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {error && (
          <div className="mb-6 bg-[#FF3B30]/15 border border-[#FF3B30]/40 rounded-lg p-3 text-[#F2F2F7] text-sm">
            Não foi possível carregar os dados reais do mapa. Verifique a conexão com a API.
          </div>
        )}

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