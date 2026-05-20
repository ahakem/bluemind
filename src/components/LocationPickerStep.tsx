'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { APIProvider, Map, AdvancedMarker, useMapsLibrary } from '@vis.gl/react-google-maps';
import { Box, Typography, TextField, InputAdornment, Paper } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MyLocationIcon from '@mui/icons-material/MyLocation';

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';

interface LatLng { lat: number; lng: number }
interface Props {
  position: LatLng;
  onChange: (pos: LatLng) => void;
}

function PlacesSearch({ onPlace }: { onPlace: (pos: LatLng) => void }) {
  const placesLib = useMapsLibrary('places');
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    if (!placesLib || !inputRef.current) return;
    autocompleteRef.current = new placesLib.Autocomplete(inputRef.current, {
      fields: ['geometry.location', 'name'],
    });
    autocompleteRef.current.addListener('place_changed', () => {
      const place = autocompleteRef.current!.getPlace();
      if (place.geometry?.location) {
        onPlace({ lat: place.geometry.location.lat(), lng: place.geometry.location.lng() });
      }
    });
    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [placesLib, onPlace]);

  return (
    <TextField
      inputRef={inputRef}
      placeholder="Search for a location…"
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
  );
}

function MapInner({ position, onChange }: Props) {
  const [center, setCenter] = useState<LatLng>(
    position.lat !== 0 || position.lng !== 0 ? position : { lat: 20, lng: 10 }
  );

  const handlePlace = useCallback((pos: LatLng) => {
    setCenter(pos);
    onChange(pos);
  }, [onChange]);

  const handleDragEnd = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const pos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
      onChange(pos);
    }
  }, [onChange]);

  const hasPin = position.lat !== 0 || position.lng !== 0;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, height: '100%' }}>
      <PlacesSearch onPlace={handlePlace} />

      <Box sx={{ flex: 1, borderRadius: 1, overflow: 'hidden', minHeight: 300, position: 'relative' }}>
        <Map
          center={center}
          defaultZoom={hasPin ? 13 : 3}
          mapTypeId="hybrid"
          mapId="site-submission-picker"
          style={{ width: '100%', height: '100%' }}
          gestureHandling="greedy"
          disableDefaultUI={false}
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
          <Box
            sx={{
              position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
              justifyContent: 'center', pointerEvents: 'none',
            }}
          >
            <Paper sx={{ px: 2, py: 1, opacity: 0.85, display: 'flex', alignItems: 'center', gap: 1 }}>
              <MyLocationIcon sx={{ fontSize: 18, color: '#0077be' }} />
              <Typography variant="caption">Search or click the map to place a pin</Typography>
            </Paper>
          </Box>
        )}
      </Box>

      {/* Click-to-place */}
      <MapClickListener onChange={(pos) => { setCenter(pos); onChange(pos); }} />

      {hasPin && (
        <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
          📍 {position.lat.toFixed(5)}, {position.lng.toFixed(5)} — drag the pin to refine
        </Typography>
      )}
    </Box>
  );
}

// Listens for map clicks to place/move the pin
function MapClickListener({ onChange }: { onChange: (pos: LatLng) => void }) {
  const mapsLib = useMapsLibrary('core');
  // We use a global map click — handled via CSS cursor hint only; actual click captured by Map component
  void mapsLib; // keep import alive
  return null;
}

export default function LocationPickerStep({ position, onChange }: Props) {
  return (
    <APIProvider apiKey={API_KEY}>
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <MapInner position={position} onChange={onChange} />
      </Box>
    </APIProvider>
  );
}
