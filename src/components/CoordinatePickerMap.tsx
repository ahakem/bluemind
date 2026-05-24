'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  APIProvider, Map, AdvancedMarker,
  useMap, useMapsLibrary,
} from '@vis.gl/react-google-maps';

interface LatLng { lat: number; lng: number }

interface Props {
  position: LatLng;
  onChange: (pos: LatLng) => void;
}

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';

// Search box using the new Places API (PlaceAutocompleteElement web component)
function PlacesSearch({ onChange }: { onChange: (pos: LatLng) => void }) {
  const map = useMap();
  const containerRef = useRef<HTMLDivElement>(null);
  const placesLib = useMapsLibrary('places');

  useEffect(() => {
    if (!placesLib || !containerRef.current) return;

    const el = new (placesLib as any).PlaceAutocompleteElement();
    el.style.cssText = 'width:100%;';

    const handleSelect = async (e: any) => {
      const place = e.placePrediction?.toPlace();
      if (!place) return;
      await place.fetchFields({ fields: ['location'] });
      const loc = place.location;
      if (loc && map) {
        const pos = { lat: loc.lat(), lng: loc.lng() };
        map.panTo(pos);
        map.setZoom(14);
        onChange(pos);
      }
    };

    el.addEventListener('gmp-select', handleSelect);
    containerRef.current.appendChild(el);

    return () => {
      el.removeEventListener('gmp-select', handleSelect);
      if (containerRef.current?.contains(el)) containerRef.current.removeChild(el);
    };
  }, [placesLib, map, onChange]);

  return <div ref={containerRef} style={{ width: '100%' }} />;
}

function MapContent({ position, onChange }: Props) {
  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('satellite');

  const center = { lat: position.lat || 20, lng: position.lng || 10 };

  const handleDragEnd = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) onChange({ lat: e.latLng.lat(), lng: e.latLng.lng() });
  }, [onChange]);

  const handleMapClick = useCallback((e: any) => {
    const ll = e.detail?.latLng;
    if (ll) onChange({ lat: ll.lat, lng: ll.lng });
  }, [onChange]);

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* Search box */}
      <PlacesSearch onChange={onChange} />

      {/* Map container */}
      <div style={{ flex: 1, position: 'relative' }}>
        {/* Layer toggle */}
        <div style={{
          position: 'absolute', top: 10, right: 10, zIndex: 10,
          background: '#fff', borderRadius: 6, overflow: 'hidden',
          boxShadow: '0 2px 6px rgba(0,0,0,0.3)', display: 'flex',
        }}>
          {(['satellite', 'roadmap'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setMapType(type)}
              style={{
                padding: '6px 12px', border: 'none', cursor: 'pointer', fontSize: 12,
                background: mapType === type ? '#1976d2' : '#fff',
                color: mapType === type ? '#fff' : '#333',
                fontWeight: mapType === type ? 600 : 400,
              }}
            >
              {type === 'satellite' ? 'Satellite' : 'Street'}
            </button>
          ))}
        </div>

        <Map
          center={center}
          defaultZoom={position.lat ? 14 : 3}
          mapTypeId={mapType}
          disableDefaultUI={false}
          mapId="coordinate-picker"
          style={{ width: '100%', height: '100%' }}
          gestureHandling="greedy"
          onClick={handleMapClick}
          clickableIcons={false}
        >
          <AdvancedMarker
            position={{ lat: position.lat, lng: position.lng }}
            draggable
            onDragEnd={handleDragEnd}
          />
        </Map>
      </div>
    </div>
  );
}

export default function CoordinatePickerMap({ position, onChange }: Props) {
  return (
    <APIProvider apiKey={API_KEY} libraries={['places']}>
      <div style={{ width: '100%', height: '100%' }}>
        <MapContent position={position} onChange={onChange} />
      </div>
    </APIProvider>
  );
}
