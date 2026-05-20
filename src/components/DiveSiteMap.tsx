'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow,
  useMap,
} from '@vis.gl/react-google-maps';
import { DiveSite } from '@/types/admin';

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';

const WATER_TYPE_COLORS: Record<DiveSite['waterType'], string> = {
  sea: '#0077be',
  lake: '#26a69a',
};

const WATER_TYPE_LABELS: Record<DiveSite['waterType'], string> = {
  lake: 'Lake',
  sea: 'Sea',
};

const MONTH_KEYS = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'] as const;

function currentMonthTemp(site: DiveSite): number | null {
  const key = MONTH_KEYS[new Date().getMonth()];
  return site.waterTemp?.[key] ?? null;
}

function PinSvg({ color, size = 28 }: { color: string; size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 36" width={size} height={size * 1.3}
      style={{ display: 'block', filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.35))', cursor: 'pointer' }}>
      <path d="M14 0C8.477 0 4 4.477 4 10c0 7 10 18 10 18s10-11 10-18c0-5.523-4.477-10-10-10z"
        fill={color} stroke="white" strokeWidth="1.5" />
      <circle cx="14" cy="10" r="4" fill="white" opacity="0.9" />
    </svg>
  );
}

// Fits the map to the visible sites whenever they change
function FitBounds({ sites }: { sites: DiveSite[] }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !sites.length) return;
    if (sites.length === 1) {
      map.setCenter({ lat: sites[0].coordinates.lat, lng: sites[0].coordinates.lng });
      map.setZoom(10);
      return;
    }
    const bounds = new google.maps.LatLngBounds();
    sites.forEach((s) => bounds.extend({ lat: s.coordinates.lat, lng: s.coordinates.lng }));
    map.fitBounds(bounds, 60);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sites]);

  return null;
}

interface Props {
  sites: DiveSite[];
  onSelect?: (site: DiveSite) => void;
}

export default function DiveSiteMap({ sites, onSelect }: Props) {
  const mappable = sites.filter((s) => s.coordinates?.lat && s.coordinates?.lng);
  const [selected, setSelected] = useState<DiveSite | null>(null);

  const handleMarkerClick = useCallback((site: DiveSite) => {
    setSelected(site);
    onSelect?.(site);
  }, [onSelect]);

  return (
    <APIProvider apiKey={API_KEY}>
      <div style={{ width: '100%', height: '100%' }}>
        <Map
          defaultCenter={{ lat: 20, lng: 10 }}
          defaultZoom={2}
          mapId="dive-sites-map"
          gestureHandling="greedy"
          disableDefaultUI={false}
          style={{ width: '100%', height: '100%' }}
          onClick={() => setSelected(null)}
        >
          <FitBounds sites={mappable} />

          {mappable.map((site) => {
            const color = WATER_TYPE_COLORS[site.waterType] ?? '#0077be';
            const isSelected = selected?.slug === site.slug;
            return (
              <AdvancedMarker
                key={site.slug}
                position={{ lat: site.coordinates.lat, lng: site.coordinates.lng }}
                onClick={() => handleMarkerClick(site)}
                zIndex={isSelected ? 10 : 1}
              >
                <PinSvg color={color} size={isSelected ? 36 : 28} />
              </AdvancedMarker>
            );
          })}

          {selected && (
            <InfoWindow
              position={{ lat: selected.coordinates.lat, lng: selected.coordinates.lng }}
              onCloseClick={() => setSelected(null)}
              pixelOffset={[0, -36]}
            >
              <div style={{ minWidth: 200, maxWidth: 260, fontFamily: 'system-ui, sans-serif', padding: '2px 0' }}>
                <div style={{ marginBottom: 6 }}>
                  <strong style={{ fontSize: 14, color: '#001f3f', lineHeight: 1.3 }}>{selected.name}</strong>
                </div>
                <div style={{ color: '#666', fontSize: 12, marginBottom: 8 }}>
                  📍 {selected.location}, {selected.country}
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                  <span style={{ background: '#f0f4f8', color: '#334', padding: '2px 8px', borderRadius: 4, fontSize: 11 }}>
                    {WATER_TYPE_LABELS[selected.waterType]}
                  </span>
                  <span style={{ background: '#f0f4f8', color: '#334', padding: '2px 8px', borderRadius: 4, fontSize: 11 }}>
                    ↓ {selected.maxDepth}m
                  </span>
                  {selected.visibility && (
                    <span style={{ background: '#f0f4f8', color: '#334', padding: '2px 8px', borderRadius: 4, fontSize: 11 }}>
                      👁 {selected.visibility.min}–{selected.visibility.max}m
                    </span>
                  )}
                  {currentMonthTemp(selected) !== null && (() => {
                    const temp = currentMonthTemp(selected)!;
                    const bg = temp <= 8 ? '#1e88e5' : temp <= 14 ? '#26a69a' : '#ef6c00';
                    return (
                      <span style={{ background: bg, color: 'white', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700 }}>
                        {temp}°C
                      </span>
                    );
                  })()}
                </div>
                <a
                  href={`/dive-sites/${selected.slug}`}
                  style={{
                    display: 'block', textAlign: 'center', background: '#0077be',
                    color: 'white', padding: '7px', borderRadius: 6,
                    fontSize: 12, fontWeight: 600, textDecoration: 'none',
                  }}
                >
                  View Details →
                </a>
              </div>
            </InfoWindow>
          )}
        </Map>
      </div>
    </APIProvider>
  );
}
