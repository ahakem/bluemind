'use client';

import { useCallback, useEffect, useRef } from 'react';
import {
  APIProvider, Map, AdvancedMarker,
  useMap, useMapsLibrary,
} from '@vis.gl/react-google-maps';
import type { MapMouseEvent } from '@vis.gl/react-google-maps';
import { Box, Typography, Paper } from '@mui/material';
import MyLocationIcon from '@mui/icons-material/MyLocation';

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';

interface LatLng { lat: number; lng: number }
interface Props { position: LatLng; onChange: (pos: LatLng) => void }

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
  const hasPin = position.lat !== 0 || position.lng !== 0;

  const handleMapClick = useCallback((e: MapMouseEvent) => {
    const ll = e.detail?.latLng;
    if (ll) onChange({ lat: ll.lat, lng: ll.lng });
  }, [onChange]);

  const handleDragEnd = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) onChange({ lat: e.latLng.lat(), lng: e.latLng.lng() });
  }, [onChange]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, height: '100%' }}>
      {/* Places search — new API */}
      <PlacesSearch onChange={onChange} />

      {/* Map */}
      <Box sx={{ flex: 1, borderRadius: 1, overflow: 'hidden', minHeight: 320, position: 'relative' }}>
        <Map
          defaultCenter={hasPin ? position : { lat: 20, lng: 10 }}
          defaultZoom={hasPin ? 13 : 3}
          mapTypeId="hybrid"
          mapId="site-submission-picker"
          style={{ width: '100%', height: '100%' }}
          gestureHandling="greedy"
          onClick={handleMapClick}
          clickableIcons={false}
        >
          {hasPin && (
            <AdvancedMarker
              position={position}
              draggable
              onDragEnd={handleDragEnd}
            />
          )}
        </Map>

        {!hasPin && (
          <Box sx={{
            position: 'absolute', inset: 0, display: 'flex',
            alignItems: 'center', justifyContent: 'center', pointerEvents: 'none',
          }}>
            <Paper sx={{ px: 2, py: 1, opacity: 0.92, display: 'flex', alignItems: 'center', gap: 1 }}>
              <MyLocationIcon sx={{ fontSize: 18, color: '#0077be' }} />
              <Typography variant="caption">Search above or click the map to place a pin</Typography>
            </Paper>
          </Box>
        )}
      </Box>

      {/* Coordinates readout */}
      <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
        {hasPin
          ? `📍 ${position.lat.toFixed(5)}, ${position.lng.toFixed(5)} — drag the pin to refine`
          : 'Click the map or use search to place your pin'}
      </Typography>
    </Box>
  );
}

export default function LocationPickerStep({ position, onChange }: Props) {
  return (
    <APIProvider apiKey={API_KEY} libraries={['places']}>
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <MapContent position={position} onChange={onChange} />
      </Box>
    </APIProvider>
  );
}
