import React, { useEffect, useRef, useState, useMemo } from 'react';
import { 
  APIProvider, 
  Map, 
  AdvancedMarker, 
  Pin, 
  useMap, 
  useMapsLibrary, 
  useAdvancedMarkerRef, 
  InfoWindow 
} from '@vis.gl/react-google-maps';
import { 
  MapPin, 
  Search, 
  Navigation, 
  Activity, 
  Sparkles, 
  Hammer, 
  Leaf, 
  AlertTriangle, 
  Loader2, 
  Maximize, 
  Check, 
  Droplets,
  Layers,
  Zap
} from 'lucide-react';

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';

const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

// Default map configurations
const mapCenterParis = { lat: 48.8566, lng: 2.3522 };

const mapStyleJSON = [
  { "elementType": "geometry", "stylers": [{ "color": "#0a0a0a" }] },
  { "elementType": "labels.text.stroke", "stylers": [{ "color": "#0a0a0a" }, { "weight": 2 }] },
  { "elementType": "labels.text.fill", "stylers": [{ "color": "#ff00ff" }, { "lightness": 30 }] },
  { "featureType": "administrative", "elementType": "geometry", "stylers": [{ "color": "#1a1a1a" }] },
  { "featureType": "poi", "elementType": "geometry", "stylers": [{ "color": "#080808" }] },
  { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#00ff00" }, { "lightness": 40 }] },
  { "featureType": "poi.park", "elementType": "geometry", "stylers": [{ "color": "#031503" }] },
  { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#111111" }] },
  { "featureType": "road", "elementType": "geometry.stroke", "stylers": [{ "color": "#222222" }] },
  { "featureType": "road", "elementType": "labels.text.fill", "stylers": [{ "color": "#666666" }] },
  { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#200820" }] },
  { "featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [{ "color": "#300c30" }] },
  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#00061a" }] }
];

// Helper interface for local diagnostics points
interface DiagnosticAnomalie {
  id: string;
  type: 'fissure' | 'pelouse_morte' | 'poubelle_pleine';
  lat: number;
  lng: number;
  title: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
}

// Subcomponent: PlaceSearch
interface PlaceSearchProps {
  onPlaceSelected: (location: google.maps.LatLngLiteral, name: string) => void;
}

function PlaceSearchInput({ onPlaceSelected }: PlaceSearchProps) {
  const placesLib = useMapsLibrary('places');
  const map = useMap();
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!placesLib || !query.trim() || !map) return;

    setIsSearching(true);
    try {
      const results = await placesLib.Place.searchByText({
        textQuery: query,
        fields: ['displayName', 'location', 'formattedAddress'],
        locationBias: map.getCenter(),
        maxResultCount: 1,
      });

      if (results.places && results.places.length > 0) {
        const place = results.places[0];
        if (place.location) {
          const latLng = { lat: place.location.lat(), lng: place.location.lng() };
          map.setCenter(latLng);
          map.setZoom(15);
          onPlaceSelected(latLng, place.displayName || query);
        }
      }
    } catch (err) {
      console.error("Place search error", err);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <form onSubmit={handleSearch} className="relative flex items-center gap-2 w-full">
      <div className="relative flex-1">
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="RECHERCHER UNE ZONE OU ADRESSE..."
          className="w-full bg-[var(--bg-main)] border border-[var(--accent-pink)]/30 focus:border-[var(--accent-pink)] text-white text-xs px-3 py-2.5 font-mono tracking-wider focus:outline-none focus:shadow-[0_0_10px_rgba(255,0,255,0.15)] pr-8 uppercase"
        />
        <Search className="absolute right-3 top-2.5 w-4 h-4 text-[var(--accent-pink)] opacity-50" />
      </div>
      <button 
        type="submit" 
        disabled={isSearching}
        className="bg-zinc-900 border border-[var(--accent-pink)]/50 hover:bg-[var(--accent-pink)] hover:text-black hover:shadow-[0_0_15px_var(--accent-pink)] transition-all duration-300 text-xs font-bold font-mono px-4 py-2.5 flex items-center gap-2 cursor-pointer uppercase shrink-0"
      >
        {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'GO'}
      </button>
    </form>
  );
}

// Subcomponent: RouteDisplay
interface RouteDisplayProps {
  origin: string;
  destination: string;
  onRouteComputed?: (dist: string, dur: string) => void;
}

function RouteDisplay({ origin, destination, onRouteComputed }: RouteDisplayProps) {
  const map = useMap();
  const routesLib = useMapsLibrary('routes');
  const polylinesRef = useRef<google.maps.Polyline[]>([]);

  useEffect(() => {
    if (!routesLib || !map || !origin || !destination) return;

    // Clear previous routes
    polylinesRef.current.forEach(p => p.setMap(null));

    routesLib.Route.computeRoutes({
      origin,
      destination,
      travelMode: 'DRIVING',
      fields: ['path', 'distanceMeters', 'durationMillis', 'viewport'],
    }).then(({ routes }) => {
      if (routes?.[0]) {
        const newPolylines = routes[0].createPolylines();
        
        newPolylines.forEach(p => {
          p.setOptions({
            strokeColor: '#00ff00',
            strokeOpacity: 0.85,
            strokeWeight: 6
          });
          p.setMap(map);
        });
        polylinesRef.current = newPolylines;

        // Custom styling for secondary glow effect
        const glowPolylines = routes[0].createPolylines();
        glowPolylines.forEach(p => {
          p.setOptions({
            strokeColor: '#ff00ff',
            strokeOpacity: 0.25,
            strokeWeight: 12
          });
          p.setMap(map);
          polylinesRef.current.push(p);
        });

        if (routes[0].viewport) {
          map.fitBounds(routes[0].viewport);
        }

        // Compute info
        const distanceKm = ((routes[0].distanceMeters || 0) / 1000).toFixed(1) + ' km';
        const durationMs = routes[0].durationMillis;
        const parsedMs = typeof durationMs === 'number' ? durationMs : parseInt((durationMs as any) || '0', 10);
        const mins = Math.round(parsedMs / 1000 / 60) + ' mins';
        if (onRouteComputed) {
          onRouteComputed(distanceKm, mins);
        }
      }
    }).catch(err => {
      console.error('Route calculation failed', err);
    });

    return () => polylinesRef.current.forEach(p => p.setMap(null));
  }, [routesLib, map, origin, destination]);

  return null;
}

// Main Component: MapViewer
export const MapViewer: React.FC = () => {
  const [mapCenter, setMapCenter] = useState<google.maps.LatLngLiteral>(mapCenterParis);
  const [searchedPlaceName, setSearchedPlaceName] = useState<string>('Paris Centro (Base Alpha)');
  const [zoom, setZoom] = useState(13);
  
  // Routing settings
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [activeRoute, setActiveRoute] = useState<{ origin: string, dest: string } | null>(null);
  const [routeInfo, setRouteInfo] = useState<{ dist: string, dur: string } | null>(null);

  // Filter modes (for Asphalte / Pelouse / Mr Nette layers)
  const [activeLayers, setActiveLayers] = useState<Record<string, boolean>>({
    asphalt: true,
    lawn: true,
    hygiene: true
  });

  const toggleLayer = (layer: string) => {
    setActiveLayers(prev => ({ ...prev, [layer]: !prev[layer] }));
  };

  // State for active infowindow
  const [selectedAnomaly, setSelectedAnomaly] = useState<DiagnosticAnomalie | null>(null);

  // Generate mock diagnostics based on the current map center
  const anomaliesList = useMemo<DiagnosticAnomalie[]>(() => {
    return [
      {
        id: 'anom-1',
        type: 'fissure',
        lat: mapCenter.lat + 0.003,
        lng: mapCenter.lng - 0.004,
        title: 'Asphalte: Fissure Linéaire Majeure',
        severity: 'high',
        description: 'Fissure de type thermique s\'étendant sur 12 mètres. Risque d\'infiltration d\'eau élevé.'
      },
      {
        id: 'anom-2',
        type: 'pelouse_morte',
        lat: mapCenter.lat - 0.005,
        lng: mapCenter.lng + 0.007,
        title: 'Pelouse: Stress Hydrique Sévère',
        severity: 'medium',
        description: 'Nécroses jaunâtres détectées par satellite. Vérifier le système d\'arrosage automatique.'
      },
      {
        id: 'anom-3',
        type: 'poubelle_pleine',
        lat: mapCenter.lat + 0.006,
        lng: mapCenter.lng + 0.003,
        title: 'Hygiène: Encombrement et Déchets',
        severity: 'low',
        description: 'Point de collecte saturé. Une intervention de nettoyage rapide est requise.'
      },
      {
        id: 'anom-4',
        type: 'fissure',
        lat: mapCenter.lat - 0.002,
        lng: mapCenter.lng - 0.008,
        title: 'Asphalte: Nid de poule en formation',
        severity: 'medium',
        description: 'Usure prononcée de la couche superficielle. Risque de dégradation rapide.'
      },
      {
        id: 'anom-5',
        type: 'pelouse_morte',
        lat: mapCenter.lat + 0.008,
        lng: mapCenter.lng - 0.006,
        title: 'Pelouse: Zone d\'ombrage humide',
        severity: 'low',
        description: 'Prolifération de mousse et humidité stagnante. Aérer le sol rapidement.'
      }
    ];
  }, [mapCenter]);

  // Handle preset targets
  const handlePreset = (lat: number, lng: number, name: string) => {
    setMapCenter({ lat, lng });
    setSearchedPlaceName(name);
    setZoom(14);
    setActiveRoute(null);
    setRouteInfo(null);
  };

  const handlePlaceSelected = (location: google.maps.LatLngLiteral, name: string) => {
    setMapCenter(location);
    setSearchedPlaceName(name);
    setActiveRoute(null);
    setRouteInfo(null);
  };

  const handleRouteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (origin.trim() && destination.trim()) {
      setActiveRoute({ origin, dest: destination });
    }
  };

  if (!hasValidKey) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-6 bg-[var(--bg-main)]">
        <div className="bg-[var(--bg-alt)] border-2 border-[var(--accent-pink)] max-w-lg w-full p-8 relative shadow-[0_0_20px_rgba(255,0,255,0.15)] select-none">
          {/* Neon corners */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[var(--accent-pink)]"></div>
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[var(--accent-pink)]"></div>
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[var(--accent-pink)]"></div>
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[var(--accent-pink)]"></div>
          
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-[var(--accent-pink)]/10 border border-[var(--accent-pink)] flex items-center justify-center mb-6 animate-pulse">
              <AlertTriangle className="w-8 h-8 text-[var(--accent-pink)]" />
            </div>

            <h2 className="text-xl font-bold font-mono text-white tracking-widest uppercase mb-4">
              Google Maps API Key Required
            </h2>
            <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[var(--accent-pink)]/50 to-transparent mb-6" />

            <div className="space-y-4 text-left font-mono text-xs text-zinc-300 leading-relaxed mb-6">
              <p>
                <span className="text-[var(--accent-pink)] font-bold">Étape 1 :</span>{" "}
                <a 
                  href="https://console.cloud.google.com/google/maps-apis/start?utm_campaign=gmp-code-assist-ais" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[var(--accent-pink)] hover:underline font-bold"
                >
                  Obtenir une clé API Google Maps
                </a>
              </p>
              <p>
                <span className="text-[var(--accent-pink)] font-bold">Étape 2 :</span> Ajouter la clé comme secret dans AI Studio :
              </p>
              <ul className="list-disc pl-5 space-y-2 text-zinc-400">
                <li>Ouvrez le menu <strong className="text-white">Settings</strong> (icône d'engrenage ⚙️ en haut à droite)</li>
                <li>Sélectionnez <strong className="text-white">Secrets</strong></li>
                <li>Créez la clé nommée <code className="bg-zinc-900 border border-zinc-800 px-1 text-white text-[10px]">&quot;GOOGLE_MAPS_PLATFORM_KEY&quot;</code> et entrez votre clé en valeur.</li>
              </ul>
            </div>
            
            <div className="bg-zinc-900/40 border border-zinc-800 p-3.5 w-full text-left font-mono text-[10px] text-zinc-500 rounded">
              ⚠️ Le serveur d'aperçu se mettra à jour automatiquement à l'ajout du secret. Pas besoin de rafraîchir manuellement le navigateur.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-4rem)] border-t border-[var(--accent-pink)]/20 overflow-hidden bg-[var(--bg-main)]">
      
      {/* Search and control sidebar */}
      <div className="w-full lg:w-[420px] bg-[var(--bg-alt)] border-b lg:border-b-0 lg:border-r border-[var(--accent-pink)]/20 p-6 flex flex-col gap-6 overflow-y-auto shrink-0 custom-scrollbar">
        
        {/* Section 1: Search */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[var(--accent-pink)]" />
            <span className="text-[10px] font-mono tracking-widest text-[var(--accent-pink)] font-bold uppercase">SATELLITE INTÉGRÉ</span>
          </div>
          <h3 className="text-sm font-bold font-mono tracking-tight text-white uppercase">ANALYSEUR CARTOGRAPHIQUE</h3>
          <p className="text-[11px] font-mono text-zinc-500 leading-relaxed uppercase">Saisissez un emplacement géographique pour y projeter les analyses multispectrales des agents cybernétiques.</p>
          <PlaceSearchInput onPlaceSelected={handlePlaceSelected} />
        </div>

        <div className="h-[1px] bg-gradient-to-r from-transparent via-[var(--accent-pink)]/20 to-transparent" />

        {/* Section 2: Presets */}
        <div className="space-y-3">
          <span className="text-[10px] font-mono tracking-widest text-zinc-500 font-bold uppercase">BASES ALPHA PRIORITAIRES</span>
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => handlePreset(48.8566, 2.3522, 'Paris (Base Alpha)')}
              className={`bg-zinc-900/40 border text-[11px] font-mono font-bold py-2 px-3 hover:bg-[var(--accent-pink)]/10 transition-all cursor-pointer text-left uppercase ${searchedPlaceName.includes('Paris') ? 'border-[var(--accent-pink)] text-[var(--accent-pink)] shadow-[0_0_8px_rgba(255,0,255,0.15)]' : 'border-zinc-800 text-zinc-400'}`}
            >
              • PARIS, FR
            </button>
            <button 
              onClick={() => handlePreset(45.5017, -73.5673, 'Montreal (Secteur Nord)')}
              className={`bg-zinc-900/40 border text-[11px] font-mono font-bold py-2 px-3 hover:bg-[var(--accent-pink)]/10 transition-all cursor-pointer text-left uppercase ${searchedPlaceName.includes('Montreal') ? 'border-[var(--accent-pink)] text-[var(--accent-pink)] shadow-[0_0_8px_rgba(255,0,255,0.15)]' : 'border-zinc-800 text-zinc-400'}`}
            >
              • MONTRÉAL, CA
            </button>
            <button 
              onClick={() => handlePreset(35.6762, 139.6503, 'Tokyo (Néo Shinjuku)')}
              className={`bg-zinc-900/40 border text-[11px] font-mono font-bold py-2 px-3 hover:bg-[var(--accent-pink)]/10 transition-all cursor-pointer text-left uppercase ${searchedPlaceName.includes('Tokyo') ? 'border-[var(--accent-pink)] text-[var(--accent-pink)] shadow-[0_0_8px_rgba(255,0,255,0.15)]' : 'border-zinc-800 text-zinc-400'}`}
            >
              • TOKYO, JP
            </button>
            <button 
              onClick={() => handlePreset(37.7749, -122.4194, 'San Francisco (Bay Corridor)')}
              className={`bg-zinc-900/40 border text-[11px] font-mono font-bold py-2 px-3 hover:bg-[var(--accent-pink)]/10 transition-all cursor-pointer text-left uppercase ${searchedPlaceName.includes('San Francisco') ? 'border-[var(--accent-pink)] text-[var(--accent-pink)] shadow-[0_0_8px_rgba(255,0,255,0.15)]' : 'border-zinc-800 text-zinc-400'}`}
            >
              • SAN FRANCISCO, US
            </button>
          </div>
        </div>

        <div className="h-[1px] bg-gradient-to-r from-transparent via-[var(--accent-pink)]/20 to-transparent" />

        {/* Section 3: Agent Layers */}
        <div className="space-y-3">
          <span className="text-[10px] font-mono tracking-widest text-[#00ff00] font-bold uppercase">FILTRES GÉOSPATIAUX</span>
          <div className="space-y-2">
            
            {/* Asphalt layer */}
            <div 
              onClick={() => toggleLayer('asphalt')}
              className={`flex items-center justify-between p-2.5 border rounded cursor-pointer transition-all duration-300 ${activeLayers.asphalt ? 'bg-[var(--accent-pink)]/5 border-[var(--accent-pink)]/30 text-white' : 'bg-transparent border-zinc-800/60 text-zinc-500'}`}
            >
              <div className="flex items-center gap-3">
                <Hammer className={`w-4 h-4 ${activeLayers.asphalt ? 'text-[var(--accent-pink)]' : 'text-zinc-600'}`} />
                <div className="text-left font-mono">
                  <div className="text-[11px] font-bold uppercase">DIAGNOSTICS ASPHALTE</div>
                  <div className="text-[9px] text-zinc-500 uppercase">Agent: Asphalte Ing.</div>
                </div>
              </div>
              <div className={`w-4 h-4 rounded border flex items-center justify-center ${activeLayers.asphalt ? 'border-[var(--accent-pink)] bg-[var(--accent-pink)]/25' : 'border-zinc-700'}`}>
                {activeLayers.asphalt && <Check className="w-3 h-3 text-white" />}
              </div>
            </div>

            {/* Grass layer */}
            <div 
              onClick={() => toggleLayer('lawn')}
              className={`flex items-center justify-between p-2.5 border rounded cursor-pointer transition-all duration-300 ${activeLayers.lawn ? 'bg-[#00ff00]/5 border-[#00ff00]/30 text-white' : 'bg-transparent border-zinc-800/60 text-zinc-500'}`}
            >
              <div className="flex items-center gap-3">
                <Leaf className={`w-4 h-4 ${activeLayers.lawn ? 'text-[#00ff00]' : 'text-zinc-600'}`} />
                <div className="text-left font-mono">
                  <div className="text-[11px] font-bold uppercase">SANTÉ DE LA PELOUSE</div>
                  <div className="text-[9px] text-zinc-500 uppercase">Agent: Pelouse Opt.</div>
                </div>
              </div>
              <div className={`w-4 h-4 rounded border flex items-center justify-center ${activeLayers.lawn ? 'border-[#00ff00] bg-[#00ff00]/25' : 'border-zinc-700'}`}>
                {activeLayers.lawn && <Check className="w-3 h-3 text-white" />}
              </div>
            </div>

            {/* Hygiene layer */}
            <div 
              onClick={() => toggleLayer('hygiene')}
              className={`flex items-center justify-between p-2.5 border rounded cursor-pointer transition-all duration-300 ${activeLayers.hygiene ? 'bg-cyan-500/5 border-cyan-500/30 text-white' : 'bg-transparent border-zinc-800/60 text-zinc-500'}`}
            >
              <div className="flex items-center gap-3">
                <Droplets className={`w-4 h-4 ${activeLayers.hygiene ? 'text-cyan-400' : 'text-zinc-600'}`} />
                <div className="text-left font-mono">
                  <div className="text-[11px] font-bold uppercase">ENTRETIEN & PROPRETÉ</div>
                  <div className="text-[9px] text-zinc-500 uppercase">Agent: Monsieur Nette</div>
                </div>
              </div>
              <div className={`w-4 h-4 rounded border flex items-center justify-center ${activeLayers.hygiene ? 'border-cyan-400 bg-cyan-400/25' : 'border-zinc-700'}`}>
                {activeLayers.hygiene && <Check className="w-3 h-3 text-white" />}
              </div>
            </div>

          </div>
        </div>

        <div className="h-[1px] bg-gradient-to-r from-transparent via-[var(--accent-pink)]/20 to-transparent" />

        {/* Section 4: Routing (Compute Routes) */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[var(--accent-pink)] animate-pulse" />
            <span className="text-[10px] font-mono tracking-widest text-[var(--accent-pink)] font-bold uppercase">ROUTES API INTÉGRATEUR</span>
          </div>
          <h4 className="text-[11px] font-bold font-mono text-white uppercase">PILOTE DE CALCUL D&apos;ITINÉRAIRES</h4>
          
          <form onSubmit={handleRouteSubmit} className="space-y-2">
            <div>
              <label className="block text-[9px] font-mono text-zinc-500 uppercase mb-1">ORIGINE</label>
              <input 
                type="text" 
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                placeholder="Ex: Tour Eiffel, Paris"
                className="w-full bg-[var(--bg-main)] border border-zinc-800 focus:border-[var(--accent-pink)] text-white text-[10px] px-2.5 py-1.5 font-mono uppercase focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[9px] font-mono text-zinc-500 uppercase mb-1">DESTINATION</label>
              <input 
                type="text" 
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Ex: Louvre, Paris"
                className="w-full bg-[var(--bg-main)] border border-zinc-800 focus:border-[var(--accent-pink)] text-white text-[10px] px-2.5 py-1.5 font-mono uppercase focus:outline-none"
              />
            </div>
            <button 
              type="submit"
              className="w-full bg-zinc-900 border border-zinc-800 hover:border-[var(--accent-pink)] text-[10px] font-bold font-mono tracking-wider text-zinc-400 hover:text-[var(--accent-pink)] transition-all py-2 cursor-pointer uppercase"
            >
              CALCULER DUO NEON_TRAIL
            </button>
          </form>

          {routeInfo && (
            <div className="bg-zinc-950/80 border border-[var(--accent-pink)]/20 p-3 rounded font-mono text-left tracking-wide">
              <div className="text-[10px] text-[var(--accent-pink)] font-bold uppercase mb-1">// RÉSULTAT DU ROUTAGE :</div>
              <div className="flex justify-between text-[11px] text-zinc-300">
                <span>DISTANCE :</span>
                <span className="text-white font-bold">{routeInfo.dist}</span>
              </div>
              <div className="flex justify-between text-[11px] text-zinc-300">
                <span>DURÉE ESTIMÉE :</span>
                <span className="text-white font-bold">{routeInfo.dur}</span>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Main Map Stage */}
      <div className="flex-1 h-full relative bg-zinc-950">
        
        {/* Floating status badge */}
        <div className="absolute top-4 left-4 z-10 bg-[var(--bg-alt)]/90 border border-[var(--accent-pink)]/40 p-3 shadow-[0_0_15px_rgba(0,0,0,0.5)] pointer-events-none uppercase font-mono">
          <div className="text-[9px] text-zinc-500 font-bold tracking-widest">// COORDONNÉES PRINCIPALES :</div>
          <div className="text-[12px] text-white font-bold tracking-tight">{searchedPlaceName}</div>
          <div className="text-[9px] text-[var(--accent-pink)]">LAT: {mapCenter.lat.toFixed(5)} | LNG: {mapCenter.lng.toFixed(5)}</div>
        </div>

        <APIProvider apiKey={API_KEY} version="weekly">
          <div className="w-full h-full">
            <Map
              center={mapCenter}
              zoom={zoom}
              onCenterChanged={(e) => {
                if (e.detail?.center) {
                  // Only update if center genuinely shift to avoid re-renders
                  const newC = e.detail.center;
                  if (Math.abs(newC.lat - mapCenter.lat) > 0.001 || Math.abs(newC.lng - mapCenter.lng) > 0.001) {
                    setMapCenter(newC);
                  }
                }
              }}
              onZoomChanged={(e) => {
                if (typeof e.detail?.zoom === 'number') {
                  setZoom(e.detail.zoom);
                }
              }}
              mapId="cyber_grid_map_v1"
              options={{
                styles: mapStyleJSON,
                disableDefaultUI: false,
                backgroundColor: '#050505',
                gestureHandling: 'greedy'
              }}
              internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
              style={{ width: '100%', height: '100%' }}
            >
              
              {/* Selected center marker */}
              <AdvancedMarker position={mapCenter}>
                <Pin background="#ff00ff" borderColor="#ff00ff" glyphColor="#ffffff" scale={1.2} />
              </AdvancedMarker>

              {/* Display calculated route if exist */}
              {activeRoute && (
                <RouteDisplay 
                  origin={activeRoute.origin} 
                  destination={activeRoute.dest}
                  onRouteComputed={(dist, dur) => setRouteInfo({ dist, dur })}
                />
              )}

              {/* Anomaly markers rendered onto the map */}
              {anomaliesList.map(anomaly => {
                // Determine icon and colors
                const isVisible = 
                  (anomaly.type === 'fissure' && activeLayers.asphalt) ||
                  (anomaly.type === 'pelouse_morte' && activeLayers.lawn) ||
                  (anomaly.type === 'poubelle_pleine' && activeLayers.hygiene);

                if (!isVisible) return null;

                const pinColor = 
                  anomaly.type === 'fissure' ? '#ff00ff' :
                  anomaly.type === 'pelouse_morte' ? '#00ff00' : '#06b6d4';

                const markerLabel = 
                  anomaly.type === 'fissure' ? '🛠️' :
                  anomaly.type === 'pelouse_morte' ? '🌱' : '🧹';

                return (
                  <AdvancedMarker 
                    key={anomaly.id} 
                    position={{ lat: anomaly.lat, lng: anomaly.lng }}
                    onClick={() => setSelectedAnomaly(anomaly)}
                  >
                    <div 
                      className="cursor-pointer flex items-center justify-center rounded-sm bg-black border shadow-lg hover:scale-110 active:scale-95 transition-all duration-200"
                      style={{ 
                        width: '32px', 
                        height: '32px',
                        borderColor: pinColor,
                        boxShadow: `0 0 8px ${pinColor}`
                      }}
                    >
                      <span className="text-[12px]">{markerLabel}</span>
                    </div>
                  </AdvancedMarker>
                );
              })}

              {/* InfoWindow for active anomaly */}
              {selectedAnomaly && (
                <InfoWindow 
                  position={{ lat: selectedAnomaly.lat, lng: selectedAnomaly.lng }}
                  onCloseClick={() => setSelectedAnomaly(null)}
                >
                  <div className="font-mono text-[11px] p-2 bg-black text-white max-w-[240px] uppercase select-none">
                    <div className="flex items-center gap-1.5 font-bold mb-1" style={{ color: selectedAnomaly.type === 'fissure' ? '#ff00ff' : selectedAnomaly.type === 'pelouse_morte' ? '#00ff00' : '#22d3ee' }}>
                      <span>[ALERT_ANOMALY]</span>
                    </div>
                    <div className="font-extrabold text-white text-[12px] mb-1.5 border-b border-zinc-800 pb-1">{selectedAnomaly.title}</div>
                    <div className="text-zinc-400 leading-normal mb-2 normal-case">{selectedAnomaly.description}</div>
                    <div className="flex justify-between text-[10px]">
                      <span className="text-zinc-500">SEVERITY:</span>
                      <span className={`font-bold ${selectedAnomaly.severity === 'high' ? 'text-red-500 animate-pulse' : selectedAnomaly.severity === 'medium' ? 'text-yellow-500' : 'text-zinc-400'}`}>
                        {selectedAnomaly.severity.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </InfoWindow>
              )}

            </Map>
          </div>
        </APIProvider>

        {/* Diagnostic info panel overlay */}
        <div className="absolute bottom-4 right-4 z-10 bg-[var(--bg-alt)]/95 border border-[var(--accent-pink)]/30 max-w-sm p-4 shadow-[0_0_15px_rgba(0,0,0,0.6)] uppercase font-mono">
          <div className="flex items-center gap-1.5 text-xs text-[var(--accent-pink)] font-black mb-2">
            <Activity className="w-4 h-4" />
            <span>SPECTRE D&apos;ANALYSES CYBERNÉTIQUES</span>
          </div>
          <div className="space-y-1.5 text-[10px] text-zinc-400">
            <p>• CAPTEURS SATELLITES ACTIFS : <span className="text-white font-bold">OPTIMISÉS</span></p>
            <p>• BALISES ACTIVES : <span className="text-[var(--accent-pink)] font-bold">{anomaliesList.length} SPECTRES</span></p>
            <p className="text-[9px] text-zinc-500 leading-normal">CLIQUEZ SUR L&apos;UNE DES BALISES DU PLAN POUR INSPECTER LES SÉQUENCES D&apos;ACTIONS DES AGENTS NETTE ET ASPHALTE.</p>
          </div>
        </div>

      </div>

    </div>
  );
};
