import React, { useState, useEffect } from 'react';
import { Users, Filter, RefreshCw, Loader2, ChevronDown, ChevronUp, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useUserLocation } from '@/hooks/useUserLocation';

interface StateCount {
  state: string;
  count: number;
}

interface StateData {
  abbr: string;
  name: string;
  region: 'norte' | 'nordeste' | 'centro-oeste' | 'sudeste' | 'sul';
  path: string;
  labelX: number;
  labelY: number;
}

// Light region colors (base)
const REGION_COLORS = {
  norte: '#A5D6A7',      // Light Green
  nordeste: '#FFCDD2',   // Light Red/Pink
  'centro-oeste': '#FFE0B2', // Light Orange
  sudeste: '#FFF9C4',    // Light Yellow
  sul: '#E1BEE7',        // Light Purple
};

// Heat colors based on user density (from cold to hot)
const HEAT_COLORS = [
  '#E8F5E9', // Very cold - almost no users
  '#C8E6C9', // Cold
  '#A5D6A7', // Cool
  '#81C784', // Mild
  '#66BB6A', // Warm
  '#FFA726', // Warmer
  '#FF7043', // Hot
  '#F44336', // Very Hot
  '#D32F2F', // Intense
  '#B71C1C', // Maximum heat
];

// SVG paths for Brazilian states (simplified)
const BRAZIL_STATES: StateData[] = [
  // Norte
  { abbr: 'AC', name: 'Acre', region: 'norte', path: 'M45,195 L65,180 L85,185 L90,210 L70,225 L45,215 Z', labelX: 65, labelY: 200 },
  { abbr: 'AM', name: 'Amazonas', region: 'norte', path: 'M85,120 L170,100 L210,120 L220,180 L190,210 L130,220 L90,210 L85,185 L65,180 L70,145 Z', labelX: 140, labelY: 160 },
  { abbr: 'RR', name: 'Roraima', region: 'norte', path: 'M145,50 L190,45 L200,75 L180,100 L145,95 L130,70 Z', labelX: 165, labelY: 75 },
  { abbr: 'AP', name: 'Amapá', region: 'norte', path: 'M280,45 L310,40 L325,70 L310,100 L275,95 L265,65 Z', labelX: 295, labelY: 70 },
  { abbr: 'PA', name: 'Pará', region: 'norte', path: 'M210,100 L280,95 L310,100 L320,140 L340,170 L310,200 L250,210 L220,180 Z', labelX: 270, labelY: 150 },
  { abbr: 'RO', name: 'Rondônia', region: 'norte', path: 'M130,220 L170,210 L185,240 L165,270 L125,265 L115,235 Z', labelX: 150, labelY: 245 },
  { abbr: 'TO', name: 'Tocantins', region: 'norte', path: 'M310,200 L335,195 L350,250 L340,310 L305,305 L295,250 Z', labelX: 320, labelY: 255 },
  
  // Nordeste
  { abbr: 'MA', name: 'Maranhão', region: 'nordeste', path: 'M340,170 L385,140 L420,150 L425,200 L390,230 L350,225 L340,195 Z', labelX: 380, labelY: 185 },
  { abbr: 'PI', name: 'Piauí', region: 'nordeste', path: 'M390,230 L420,215 L445,230 L450,290 L415,310 L385,290 L380,250 Z', labelX: 415, labelY: 265 },
  { abbr: 'CE', name: 'Ceará', region: 'nordeste', path: 'M445,180 L490,175 L505,210 L485,245 L450,240 L445,210 Z', labelX: 475, labelY: 210 },
  { abbr: 'RN', name: 'Rio Grande do Norte', region: 'nordeste', path: 'M505,195 L535,185 L545,210 L520,225 L505,215 Z', labelX: 525, labelY: 205 },
  { abbr: 'PB', name: 'Paraíba', region: 'nordeste', path: 'M500,225 L545,220 L550,245 L505,250 Z', labelX: 525, labelY: 238 },
  { abbr: 'PE', name: 'Pernambuco', region: 'nordeste', path: 'M450,250 L550,245 L555,275 L450,285 Z', labelX: 500, labelY: 265 },
  { abbr: 'AL', name: 'Alagoas', region: 'nordeste', path: 'M520,285 L555,280 L560,305 L525,310 Z', labelX: 540, labelY: 295 },
  { abbr: 'SE', name: 'Sergipe', region: 'nordeste', path: 'M510,310 L540,305 L545,330 L515,335 Z', labelX: 528, labelY: 320 },
  { abbr: 'BA', name: 'Bahia', region: 'nordeste', path: 'M415,310 L510,300 L540,340 L500,420 L420,430 L380,380 L395,330 Z', labelX: 455, labelY: 365 },
  
  // Centro-Oeste
  { abbr: 'MT', name: 'Mato Grosso', region: 'centro-oeste', path: 'M165,270 L250,260 L295,305 L285,380 L220,400 L170,370 L155,310 Z', labelX: 220, labelY: 330 },
  { abbr: 'GO', name: 'Goiás', region: 'centro-oeste', path: 'M295,340 L380,330 L395,380 L380,430 L320,445 L290,410 L285,370 Z', labelX: 335, labelY: 385 },
  { abbr: 'DF', name: 'Distrito Federal', region: 'centro-oeste', path: 'M365,365 L385,360 L390,380 L370,385 Z', labelX: 377, labelY: 372 },
  { abbr: 'MS', name: 'Mato Grosso do Sul', region: 'centro-oeste', path: 'M220,400 L285,395 L300,445 L280,510 L210,505 L195,450 Z', labelX: 245, labelY: 455 },
  
  // Sudeste
  { abbr: 'MG', name: 'Minas Gerais', region: 'sudeste', path: 'M380,380 L500,420 L510,480 L450,520 L380,510 L340,455 L355,410 Z', labelX: 425, labelY: 455 },
  { abbr: 'ES', name: 'Espírito Santo', region: 'sudeste', path: 'M510,420 L540,425 L545,480 L515,485 Z', labelX: 527, labelY: 450 },
  { abbr: 'RJ', name: 'Rio de Janeiro', region: 'sudeste', path: 'M470,520 L530,505 L545,535 L490,555 Z', labelX: 510, labelY: 530 },
  { abbr: 'SP', name: 'São Paulo', region: 'sudeste', path: 'M340,455 L450,520 L445,575 L365,590 L310,540 L305,480 Z', labelX: 375, labelY: 525 },
  
  // Sul
  { abbr: 'PR', name: 'Paraná', region: 'sul', path: 'M305,545 L365,590 L355,640 L290,650 L265,600 Z', labelX: 315, labelY: 595 },
  { abbr: 'SC', name: 'Santa Catarina', region: 'sul', path: 'M290,650 L355,645 L360,695 L300,705 Z', labelX: 325, labelY: 675 },
  { abbr: 'RS', name: 'Rio Grande do Sul', region: 'sul', path: 'M260,710 L360,700 L365,770 L310,810 L245,780 Z', labelX: 305, labelY: 750 },
];

const MAIN_STATES = ['SP', 'RJ', 'MG', 'BA', 'CE', 'RS'];

type FilterType = 'all' | string;

const BrazilStatesMap: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [totalUsers, setTotalUsers] = useState(0);
  const [showOtherStates, setShowOtherStates] = useState(false);
  const [stateCounts, setStateCounts] = useState<StateCount[]>([]);
  const [hoveredState, setHoveredState] = useState<string | null>(null);

  // Hook to save current user's location
  useUserLocation();

  // Extract state abbreviation from full state name
  const getStateAbbreviation = (stateName: string | null): string => {
    if (!stateName) return 'Desconhecido';
    
    const stateMap: Record<string, string> = {
      'Acre': 'AC', 'Alagoas': 'AL', 'Amapá': 'AP', 'Amazonas': 'AM',
      'Bahia': 'BA', 'Ceará': 'CE', 'Distrito Federal': 'DF', 'Espírito Santo': 'ES',
      'Goiás': 'GO', 'Maranhão': 'MA', 'Mato Grosso': 'MT', 'Mato Grosso do Sul': 'MS',
      'Minas Gerais': 'MG', 'Pará': 'PA', 'Paraíba': 'PB', 'Paraná': 'PR',
      'Pernambuco': 'PE', 'Piauí': 'PI', 'Rio de Janeiro': 'RJ', 'Rio Grande do Norte': 'RN',
      'Rio Grande do Sul': 'RS', 'Rondônia': 'RO', 'Roraima': 'RR', 'Santa Catarina': 'SC',
      'São Paulo': 'SP', 'Sao Paulo': 'SP', 'Sergipe': 'SE', 'Tocantins': 'TO'
    };

    for (const [fullName, abbr] of Object.entries(stateMap)) {
      if (stateName.includes(fullName)) return abbr;
    }
    return stateName.substring(0, 2).toUpperCase();
  };

  // Fetch user data
  const fetchData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('state')
        .is('deleted_at', null);

      if (error) {
        console.error('Error fetching locations:', error);
        return;
      }

      // Calculate state counts
      const counts: Record<string, number> = {};
      (data || []).forEach(profile => {
        const abbr = getStateAbbreviation(profile.state);
        if (abbr !== 'Desconhecido') {
          counts[abbr] = (counts[abbr] || 0) + 1;
        }
      });

      const sortedCounts = Object.entries(counts)
        .map(([state, count]) => ({ state, count }))
        .sort((a, b) => b.count - a.count);
      
      setStateCounts(sortedCounts);
      setTotalUsers(data?.length || 0);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel('profiles-location-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, fetchData)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getStateCount = (abbr: string): number => {
    return stateCounts.find(s => s.state === abbr)?.count || 0;
  };

  const maxCount = Math.max(...stateCounts.map(s => s.count), 1);

  const getHeatColor = (count: number): string => {
    if (count === 0) return HEAT_COLORS[0];
    const intensity = Math.min(Math.floor((count / maxCount) * 9), 9);
    return HEAT_COLORS[intensity];
  };

  const getStateColor = (state: StateData): string => {
    const count = getStateCount(state.abbr);
    const isSelected = filter === state.abbr;
    const isFiltered = filter !== 'all' && filter !== state.abbr;
    
    if (isFiltered) return '#F5F5F5';
    
    // Use heat color based on user count
    if (count > 0) {
      return getHeatColor(count);
    }
    
    // Default to light region color if no users
    return REGION_COLORS[state.region];
  };

  const getStateOpacity = (state: StateData): number => {
    if (filter !== 'all' && filter !== state.abbr) return 0.4;
    if (hoveredState === state.abbr) return 1;
    return 0.9;
  };

  const otherStates = stateCounts.filter(s => !MAIN_STATES.includes(s.state));

  return (
    <div className="flex-1 flex flex-col bg-background overflow-hidden relative">
      {/* Filter bar */}
      <div className="absolute top-4 left-4 right-4 z-10 flex flex-col gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="bg-card/95 backdrop-blur-md rounded-xl p-2 shadow-lg border border-border/50 flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <div className="flex gap-1 flex-wrap">
              <Button
                size="sm"
                variant={filter === 'all' ? 'default' : 'ghost'}
                className="h-7 text-xs"
                onClick={() => setFilter('all')}
              >
                Todos
              </Button>
              {MAIN_STATES.map((state) => {
                const count = getStateCount(state);
                return (
                  <Button
                    key={state}
                    size="sm"
                    variant={filter === state ? 'default' : 'ghost'}
                    className="h-7 text-xs gap-1"
                    onClick={() => setFilter(state)}
                  >
                    {state}
                    {count > 0 && <span className="text-[10px] opacity-70">({count})</span>}
                  </Button>
                );
              })}
              <Button
                size="sm"
                variant={showOtherStates ? 'secondary' : 'ghost'}
                className="h-7 text-xs gap-1"
                onClick={() => setShowOtherStates(!showOtherStates)}
              >
                Outros
                {showOtherStates ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </Button>
            </div>
          </div>
          
          <Badge variant="secondary" className="gap-1.5 py-1.5 px-3 whitespace-nowrap">
            <Users className="w-3.5 h-3.5" />
            {totalUsers} usuárias cadastradas
          </Badge>
        </div>

        {/* Other states dropdown */}
        {showOtherStates && otherStates.length > 0 && (
          <div className="bg-card/95 backdrop-blur-md rounded-xl p-3 shadow-lg border border-border/50 animate-fade-in">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">Outros estados</span>
            </div>
            <ScrollArea className="max-h-40">
              <div className="flex flex-wrap gap-1">
                {otherStates.map(({ state, count }) => (
                  <Button
                    key={state}
                    size="sm"
                    variant={filter === state ? 'default' : 'outline'}
                    className="h-7 text-xs gap-1"
                    onClick={() => {
                      setFilter(state);
                      setShowOtherStates(false);
                    }}
                  >
                    {state}
                    <span className="text-[10px] opacity-70">({count})</span>
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>

      {/* Heat Legend */}
      <div className="absolute bottom-24 left-4 z-10 bg-card/95 backdrop-blur-md rounded-xl p-3 shadow-lg border border-border/50">
        <span className="text-xs font-medium mb-2 block">Intensidade de usuárias</span>
        <div className="flex items-center gap-0.5 mb-1">
          {HEAT_COLORS.map((color, i) => (
            <div 
              key={i} 
              className="w-3 h-5 first:rounded-l last:rounded-r" 
              style={{ backgroundColor: color }} 
            />
          ))}
        </div>
        <div className="flex justify-between text-[9px] text-muted-foreground">
          <span>Poucos</span>
          <span>Muitos</span>
        </div>
      </div>

      {/* Refresh button */}
      <Button
        size="icon"
        variant="secondary"
        className="absolute bottom-24 right-4 z-10 shadow-lg"
        onClick={fetchData}
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <RefreshCw className="w-4 h-4" />
        )}
      </Button>

      {/* Brazil Map SVG */}
      <div className="flex-1 flex items-center justify-center p-2 pt-20 pb-16">
        <svg
          viewBox="30 30 560 800"
          className="w-full h-full max-w-md"
          style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }}
        >
          {/* States */}
          {BRAZIL_STATES.map((state) => {
            const count = getStateCount(state.abbr);
            const isSmallState = ['DF', 'SE', 'AL', 'RN', 'PB'].includes(state.abbr);
            
            return (
              <g key={state.abbr}>
                <path
                  d={state.path}
                  fill={getStateColor(state)}
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  opacity={getStateOpacity(state)}
                  className="transition-all duration-300 cursor-pointer"
                  onMouseEnter={() => setHoveredState(state.abbr)}
                  onMouseLeave={() => setHoveredState(null)}
                  onClick={() => setFilter(filter === state.abbr ? 'all' : state.abbr)}
                />
                {/* State label with count */}
                <text
                  x={state.labelX}
                  y={state.labelY - (count > 0 && !isSmallState ? 5 : 0)}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="pointer-events-none select-none"
                  style={{
                    fontSize: isSmallState ? '10px' : '14px',
                    fontWeight: '700',
                    fill: '#1a1a1a',
                    textShadow: '0 0 4px rgba(255,255,255,1), 0 0 8px rgba(255,255,255,0.8)',
                  }}
                >
                  {state.abbr}
                </text>
                {/* User count - larger and more visible */}
                {count > 0 && !isSmallState && (
                  <text
                    x={state.labelX}
                    y={state.labelY + 12}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="pointer-events-none select-none"
                    style={{
                      fontSize: '12px',
                      fontWeight: '700',
                      fill: '#E91E63',
                      textShadow: '0 0 4px rgba(255,255,255,1), 0 0 6px rgba(255,255,255,0.9)',
                    }}
                  >
                    {count}
                  </text>
                )}
                {/* Count badge for small states */}
                {count > 0 && isSmallState && (
                  <>
                    <circle
                      cx={state.labelX + 12}
                      cy={state.labelY - 8}
                      r="8"
                      fill="#E91E63"
                      className="pointer-events-none"
                    />
                    <text
                      x={state.labelX + 12}
                      y={state.labelY - 8}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="pointer-events-none select-none"
                      style={{
                        fontSize: '9px',
                        fontWeight: '700',
                        fill: '#FFFFFF',
                      }}
                    >
                      {count}
                    </text>
                  </>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Hovered state info */}
      {hoveredState && (
        <div className="absolute bottom-28 left-1/2 -translate-x-1/2 bg-card/95 backdrop-blur-md rounded-xl px-4 py-2 shadow-lg border border-border/50 animate-fade-in">
          <div className="text-center">
            <span className="font-bold text-foreground">
              {BRAZIL_STATES.find(s => s.abbr === hoveredState)?.name}
            </span>
            <span className="text-muted-foreground ml-2">
              ({getStateCount(hoveredState)} usuária{getStateCount(hoveredState) !== 1 ? 's' : ''})
            </span>
          </div>
        </div>
      )}

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-20">
          <div className="bg-card rounded-xl p-4 shadow-lg flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span className="text-sm">Carregando dados...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrazilStatesMap;
