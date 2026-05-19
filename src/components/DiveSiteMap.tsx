'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { DiveSite } from '@/types/admin';
import { Box } from '@mui/material';

// Fix Leaflet's default marker icon path issue in Next.js
// (Leaflet tries to load images relative to a path that doesn't exist in Next.js)
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const DIFFICULTY_COLORS: Record<DiveSite['difficulty'], string> = {
  beginner: '#4caf50',
  intermediate: '#ff9800',
  advanced: '#f44336',
};

const WATER_TYPE_LABELS: Record<DiveSite['waterType'], string> = {
  lake: 'Lake',
  sea: 'Sea',
  quarry: 'Quarry',
  river: 'River',
  pool: 'Pool',
};

const MONTH_KEYS = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'] as const;

function currentMonthTemp(site: DiveSite): number | null {
  const key = MONTH_KEYS[new Date().getMonth()];
  return site.waterTemp[key] ?? null;
}

function makePinIcon(color: string): L.DivIcon {
  return L.divIcon({
    className: '',
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -30],
    html: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 36" width="28" height="36">
        <filter id="shadow">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.35)"/>
        </filter>
        <g filter="url(#shadow)">
          <path d="M14 0C8.477 0 4 4.477 4 10c0 7 10 18 10 18s10-11 10-18c0-5.523-4.477-10-10-10z"
            fill="${color}" stroke="white" stroke-width="1.5"/>
          <circle cx="14" cy="10" r="4" fill="white" opacity="0.9"/>
        </g>
      </svg>`,
  });
}

function makeHoverIcon(color: string): L.DivIcon {
  return L.divIcon({
    className: '',
    iconSize: [36, 44],
    iconAnchor: [18, 44],
    popupAnchor: [0, -46],
    html: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 48" width="36" height="48">
        <filter id="shadow2">
          <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="rgba(0,0,0,0.4)"/>
        </filter>
        <g filter="url(#shadow2)">
          <path d="M18 0C10.82 0 5 5.82 5 13c0 9 13 23 13 23s13-14 13-23c0-7.18-5.82-13-13-13z"
            fill="${color}" stroke="white" stroke-width="2"/>
          <circle cx="18" cy="13" r="5.5" fill="white" opacity="0.95"/>
        </g>
      </svg>`,
  });
}

function SiteMarkers({ sites, onSelect }: { sites: DiveSite[]; onSelect: (site: DiveSite) => void }) {
  const map = useMap();

  useEffect(() => {
    const markers: L.Marker[] = [];

    sites.forEach((site) => {
      const color = DIFFICULTY_COLORS[site.difficulty];
      const marker = L.marker([site.coordinates.lat, site.coordinates.lng], {
        icon: makePinIcon(color),
      });

      const temp = currentMonthTemp(site);
      const tempStr = temp !== null ? `<span style="background:${temp <= 8 ? '#1e88e5' : temp <= 14 ? '#26a69a' : '#ef6c00'};color:white;padding:2px 7px;border-radius:4px;font-size:11px;font-weight:700;">${temp}°C</span>` : '';

      const diffLabel = site.difficulty.charAt(0).toUpperCase() + site.difficulty.slice(1);

      const popupContent = `
        <div style="min-width:200px;font-family:system-ui,sans-serif;padding:4px 2px;">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px;gap:8px;">
            <strong style="font-size:14px;color:#001f3f;line-height:1.3;">${site.name}</strong>
            <span style="background:${color};color:white;padding:2px 8px;border-radius:12px;font-size:11px;font-weight:600;white-space:nowrap;flex-shrink:0;">${diffLabel}</span>
          </div>
          <div style="color:#666;font-size:12px;margin-bottom:8px;">📍 ${site.location}, ${site.country}</div>
          <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px;">
            <span style="background:#f0f4f8;color:#334;padding:2px 8px;border-radius:4px;font-size:11px;">${WATER_TYPE_LABELS[site.waterType]}</span>
            <span style="background:#f0f4f8;color:#334;padding:2px 8px;border-radius:4px;font-size:11px;">↓ ${site.maxDepth}m</span>
            <span style="background:#f0f4f8;color:#334;padding:2px 8px;border-radius:4px;font-size:11px;">👁 ${site.visibility.min}–${site.visibility.max}m</span>
            ${tempStr}
          </div>
          <a href="/dive-sites/${site.slug}" style="display:block;text-align:center;background:#0077be;color:white;padding:7px;border-radius:6px;font-size:12px;font-weight:600;text-decoration:none;">
            View Details →
          </a>
        </div>`;

      marker.bindPopup(popupContent, {
        maxWidth: 260,
        className: 'dive-site-popup',
      });

      marker.on('mouseover', () => {
        marker.setIcon(makeHoverIcon(color));
        marker.openPopup();
      });

      marker.on('mouseout', (e) => {
        const related = (e.originalEvent as MouseEvent).relatedTarget as Element | null;
        const popup = document.querySelector('.dive-site-popup');
        if (popup && related && popup.contains(related)) return;
        marker.setIcon(makePinIcon(color));
      });

      marker.on('click', () => {
        marker.setIcon(makeHoverIcon(color));
        marker.openPopup();
        onSelect(site);
      });

      marker.on('popupclose', () => {
        marker.setIcon(makePinIcon(color));
      });

      marker.addTo(map);
      markers.push(marker);
    });

    return () => {
      markers.forEach((m) => m.remove());
    };
  }, [sites, map, onSelect]);

  return null;
}

interface Props {
  sites: DiveSite[];
  onSelect?: (site: DiveSite) => void;
}

export default function DiveSiteMap({ sites, onSelect }: Props) {
  const center: [number, number] = sites.length > 0
    ? [
        sites.reduce((s, x) => s + x.coordinates.lat, 0) / sites.length,
        sites.reduce((s, x) => s + x.coordinates.lng, 0) / sites.length,
      ]
    : [52.0, 5.0];

  return (
    <>
      <style>{`
        .dive-site-popup .leaflet-popup-content-wrapper {
          border-radius: 10px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.18);
          padding: 0;
          border: 1px solid #e0e7ef;
        }
        .dive-site-popup .leaflet-popup-content {
          margin: 14px 16px;
        }
        .dive-site-popup .leaflet-popup-tip-container {
          margin-top: -1px;
        }
        .leaflet-container {
          font-family: system-ui, sans-serif;
        }
      `}</style>
      <Box sx={{ width: '100%', height: '100%', '& .leaflet-container': { height: '100%', width: '100%' } }}>
        <MapContainer
          center={center}
          zoom={sites.length === 1 ? 12 : 7}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
          zoomControl={true}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            maxZoom={19}
          />
          <SiteMarkers sites={sites} onSelect={onSelect ?? (() => {})} />
        </MapContainer>
      </Box>
    </>
  );
}
