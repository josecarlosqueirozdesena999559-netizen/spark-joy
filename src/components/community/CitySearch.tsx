import React, { useState, useCallback } from 'react';
import { Search, Loader2, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const MAPBOX_TOKEN = 'pk.eyJ1Ijoiam9zZWNhcmxvc3FqZGZuZiIsImEiOiJjbWp2dnZzNjI1bHYyM2VwczV2eXFiZzNzIn0.tkqBfgDN54sp53HwuM6gGw';

interface CitySearchProps {
  onCitySelect: (lng: number, lat: number, cityName: string) => void;
}

interface SearchResult {
  id: string;
  place_name: string;
  center: [number, number];
}

const CitySearch: React.FC<CitySearchProps> = ({ onCitySelect }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const searchCities = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?country=br&types=place,locality&language=pt&access_token=${MAPBOX_TOKEN}`
      );
      const data = await response.json();
      
      if (data.features) {
        setResults(data.features.map((feature: any) => ({
          id: feature.id,
          place_name: feature.place_name,
          center: feature.center,
        })));
        setShowResults(true);
      }
    } catch (error) {
      console.error('Error searching cities:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = () => {
    searchCities(query);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSelectCity = (result: SearchResult) => {
    onCitySelect(result.center[0], result.center[1], result.place_name);
    setQuery(result.place_name.split(',')[0]);
    setShowResults(false);
  };

  return (
    <div className="px-4 relative">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar cidade..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => results.length > 0 && setShowResults(true)}
            className="pl-9 bg-card border-border/50"
          />
        </div>
        <Button 
          onClick={handleSearch} 
          disabled={loading || !query.trim()}
          size="icon"
          className="shrink-0"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Search Results Dropdown */}
      {showResults && results.length > 0 && (
        <div className="absolute left-4 right-4 top-full mt-1 bg-card border border-border rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
          {results.map((result) => (
            <button
              key={result.id}
              onClick={() => handleSelectCity(result)}
              className="w-full px-3 py-2 text-left hover:bg-muted flex items-center gap-2 text-sm"
            >
              <MapPin className="w-4 h-4 text-primary shrink-0" />
              <span className="truncate text-foreground">{result.place_name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Click outside to close */}
      {showResults && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowResults(false)}
        />
      )}
    </div>
  );
};

export default CitySearch;
