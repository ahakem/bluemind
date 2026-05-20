'use client';

import { useCallback, useEffect, useRef } from 'react';
import {
  APIProvider, Map, AdvancedMarker,
  useMap, useMapsLibrary,
} from '@vis.gl/react-google-maps';
import type { MapMouseEvent } from '@vis.gl/react-google-maps';
import { Box, Typography, TextField, InputAdornment, Paper } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MyLocationIcon from '@mui/icons-material/MyLocation';

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';

interface LatLng { lat: number; lng: number }
interface Props { position: LatLng; onChange: (pos: LatLng) => void }

// Must be a child of APIProvider to use useMap / useMapsLibrary
function MapContent({ position, onChange }: Props) {
  const map = useMap();
  const placesLib = useMapsLibrary('places');
  const inputRef = useRef<HTMLInputElement>(null);
  const acRef = useRef<google.maps.places.Autocomplete | null>(null);

  const hasPin = position.lat !== 0 || position.lng !== 0;

  // Boot autocomplete as soon as the Places library is ready
  useEffect(() => {
    if (!placesLib || !inputRef.current || acRef.current) return;

    acRef.current = new placesLib.Autocomplete(inputRef.current, {
      fields: ['geometry.location', 'name'],
    });

    const listener = acRef.current.addListener('place_changed', () => {
      const place = acRef.current!.getPlace();
      const loc = place.geometry?.location;
      if (loc && map) {
        const pos = { lat: loc.lat(), lng: loc.lng() };
        map.panTo(pos);
        map.setZoom(14);
        onChange(pos);
      }
    });

    return () => google.maps.event.removeListener(listener);
  }, [placesLib, map, onChange]);

  // Click anywhere on the map to place / move the pin
  const handleMapClick = useCallback((e: MapMouseEvent) => {
    const ll = e.detail?.latLng;
    if (ll) onChange({ lat: ll.lat, lng: ll.lng });
  }, [onChange]);

  // Drag existing pin to refine position
  const handleDragEnd = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) onChange({ lat: e.latLng.lat(), lng: e.latLng.lng() });
  }, [onChange]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, height: '100%' }}>

      {/* Places search — autocomplete dropdown needs high z-index inside Dialog */}
      <TextField
        inputRef={inputRef}
        placeholder="Search location, city, or country…"
        size="small"
        fullWidth
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
              </InputAdornment>
            ),
          },
        }}
        sx={{ bgcolor: 'white', borderRadius: 1 }}
      />

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
          // Show pointer cursor so users know they can click
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

        {/* Hint overlay before pin is placed */}
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
      {hasPin ? (
        <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
          📍 {position.lat.toFixed(5)}, {position.lng.toFixed(5)} — drag the pin to refine the exact spot
        </Typography>
      ) : (
        <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
          Click the map or use search to place your pin
        </Typography>
      )}
    </Box>
  );
}

export default function LocationPickerStep({ position, onChange }: Props) {
  return (
    <>
      {/* Fix autocomplete dropdown z-index inside MUI Dialog */}
      <style>{`.pac-container { z-index: 9999 !important; }`}</style>
      <APIProvider apiKey={API_KEY} libraries={['places']}>
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <MapContent position={position} onChange={onChange} />
        </Box>
      </APIProvider>
    </>
  );
}
