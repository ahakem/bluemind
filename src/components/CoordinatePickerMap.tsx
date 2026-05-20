'use client';

import { useState, useCallback } from 'react';
import { APIProvider, Map, AdvancedMarker, MapCameraChangedEvent } from '@vis.gl/react-google-maps';

interface LatLng { lat: number; lng: number }

interface Props {
  position: LatLng;
  onChange: (pos: LatLng) => void;
}

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';

export default function CoordinatePickerMap({ position, onChange }: Props) {
  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('satellite');

  const center = { lat: position.lat || 20, lng: position.lng || 10 };

  const handleDragEnd = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      onChange({ lat: e.latLng.lat(), lng: e.latLng.lng() });
    }
  }, [onChange]);

  return (
    <APIProvider apiKey={API_KEY}>
      <div style={{ width: '100%', height: '100%', position: 'relative' }}>
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
        >
          <AdvancedMarker
            position={{ lat: position.lat, lng: position.lng }}
            draggable
            onDragEnd={handleDragEnd}
          />
        </Map>
      </div>
    </APIProvider>
  );
}
