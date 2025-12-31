import { useState, useCallback } from 'react';

export interface PoliceStation {
  id: number;
  name: string;
  lat: number;
  lng: number;
  phone?: string;
  type: string;
}

export const usePoliceStations = () => {
  const [stations, setStations] = useState<PoliceStation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStations = useCallback(async (lat: number, lng: number, radiusKm: number = 20) => {
    setLoading(true);
    setError(null);

    const radiusMeters = radiusKm * 1000;
    
    // Overpass API query for police stations with increased timeout
    const query = `
      [out:json][timeout:90];
      (
        node["amenity"="police"](around:${radiusMeters},${lat},${lng});
        way["amenity"="police"](around:${radiusMeters},${lat},${lng});
        relation["amenity"="police"](around:${radiusMeters},${lat},${lng});
      );
      out center;
    `;

    // List of Overpass API mirrors for fallback
    const apiMirrors = [
      'https://overpass.kumi.systems/api/interpreter',
      'https://overpass-api.de/api/interpreter',
      'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
    ];

    let lastError: Error | null = null;

    for (const apiUrl of apiMirrors) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: `data=${encodeURIComponent(query)}`,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Servidor retornou resposta inválida');
        }

        const data = await response.json();
        
        const parsedStations: PoliceStation[] = data.elements
          .filter((el: any) => {
            // Get coordinates - for ways/relations, use center
            const elLat = el.lat ?? el.center?.lat;
            const elLng = el.lon ?? el.center?.lon;
            return elLat && elLng;
          })
          .map((el: any) => {
            const elLat = el.lat ?? el.center?.lat;
            const elLng = el.lon ?? el.center?.lon;
            const tags = el.tags || {};
            
            return {
              id: el.id,
              name: tags.name || tags['name:pt'] || getStationType(tags),
              lat: elLat,
              lng: elLng,
              phone: tags.phone || tags['contact:phone'],
              type: getStationType(tags),
            };
          });

        setStations(parsedStations);
        setLoading(false);
        return; // Success - exit the loop
      } catch (err) {
        lastError = err instanceof Error ? err : new Error('Erro desconhecido');
        console.warn(`Falha no servidor ${apiUrl}:`, lastError.message);
        // Continue to next mirror
      }
    }

    // All mirrors failed
    setError(lastError?.message || 'Não foi possível carregar as delegacias. Tente novamente.');
    setStations([]);
    setLoading(false);
  }, []);

  return { stations, loading, error, fetchStations };
};

function getStationType(tags: Record<string, string>): string {
  const policeType = tags['police'];
  
  if (policeType === 'station') return 'Delegacia de Polícia';
  if (policeType === 'office') return 'Posto Policial';
  if (policeType === 'checkpoint') return 'Posto de Controle';
  
  const name = (tags.name || '').toLowerCase();
  
  if (name.includes('delegacia')) return 'Delegacia de Polícia';
  if (name.includes('guarda municipal')) return 'Guarda Municipal';
  if (name.includes('polícia militar') || name.includes('pm')) return 'Polícia Militar';
  if (name.includes('polícia civil')) return 'Polícia Civil';
  if (name.includes('polícia federal')) return 'Polícia Federal';
  
  return 'Posto Policial';
}
