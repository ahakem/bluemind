'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  useMap,
} from '@vis.gl/react-google-maps';
import { DiveSite } from '@/types/admin';

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';

const SITE_COLOR: Record<DiveSite['waterType'], string> = {
  sea:        '#0062b1',
  lake:       '#1a7f72',
  deep_tank:  '#5c35a8',
};

function siteColor(site: DiveSite) {
  return SITE_COLOR[site.waterType] ?? SITE_COLOR.sea;
}

const MONTH_KEYS = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'] as const;

function currentMonthTemp(site: DiveSite): number | null {
  return site.waterTemp?.[MONTH_KEYS[new Date().getMonth()]] ?? null;
}

// Ocean-themed map tiles — applied via StyledMapType (works alongside mapId)
const MAP_STYLE: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry',                   stylers: [{ color: '#f0ece4' }] },
  { elementType: 'labels.text.stroke',          stylers: [{ color: '#f0ece4' }] },
  { elementType: 'labels.text.fill',            stylers: [{ color: '#8a7c6e' }] },
  { featureType: 'water', elementType: 'geometry',           stylers: [{ color: '#aacde0' }] },
  { featureType: 'water', elementType: 'labels.text.fill',   stylers: [{ color: '#4a8caa' }] },
  { featureType: 'water', elementType: 'labels.text.stroke', stylers: [{ color: '#aacde0' }] },
  { featureType: 'landscape.natural',  elementType: 'geometry', stylers: [{ color: '#e4ddd0' }] },
  { featureType: 'landscape.man_made', elementType: 'geometry', stylers: [{ color: '#f0ece4' }] },
  { featureType: 'poi.park', elementType: 'geometry.fill',    stylers: [{ color: '#c8d8aa' }] },
  { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#5a7840' }] },
  { featureType: 'poi',        elementType: 'labels',  stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.business',                       stylers: [{ visibility: 'off' }] },
  { featureType: 'road',         elementType: 'geometry',        stylers: [{ color: '#ffffff' }] },
  { featureType: 'road',         elementType: 'geometry.stroke', stylers: [{ color: '#e4ddd0' }] },
  { featureType: 'road.highway', elementType: 'geometry',        stylers: [{ color: '#f5e8b0' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#e8d888' }] },
  { featureType: 'road',         elementType: 'labels.text.fill',stylers: [{ color: '#9a8c7a' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative.country',    elementType: 'geometry.stroke', stylers: [{ color: '#c4b8a4' }] },
  { featureType: 'administrative.province',   elementType: 'geometry.stroke', stylers: [{ color: '#d0c8b8' }] },
  { featureType: 'administrative.land_parcel',elementType: 'labels',          stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative.locality',   elementType: 'labels.text.fill',stylers: [{ color: '#786a58' }] },
];

function ApplyOceanStyle() {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    const styledType = new google.maps.StyledMapType(MAP_STYLE, { name: 'BlueMind' });
    map.mapTypes.set('bluemind', styledType);
    map.setMapTypeId('bluemind');
  }, [map]);
  return null;
}

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

// Popup card rendered inside the AdvancedMarker — no Google InfoWindow chrome
function PopupCard({ site, onClose }: { site: DiveSite; onClose: () => void }) {
  const color = siteColor(site);
  const temp = currentMonthTemp(site);
  const tempColor = temp === null ? null : temp <= 8 ? '#1976d2' : temp <= 14 ? '#1a7f72' : '#e65100';
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${site.name} dive site details`}
      onClick={(e) => e.stopPropagation()}
      style={{
        position: 'absolute',
        bottom: 'calc(100% + 12px)',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 224,
        background: '#ffffff',
        borderRadius: 14,
        boxShadow: '0 4px 24px rgba(0,0,0,0.14), 0 1px 6px rgba(0,0,0,0.08)',
        overflow: 'hidden',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        zIndex: 50,
      }}
    >
      {/* Accent bar */}
      <div style={{ height: 4, background: `linear-gradient(90deg, ${color}, ${color}bb)` }} />

      {/* Body */}
      <div style={{ padding: '12px 14px 14px' }}>

        {/* Close */}
        <button
          ref={closeRef}
          onClick={onClose}
          aria-label="Close popup"
          style={{
            position: 'absolute', top: 10, right: 10,
            width: 22, height: 22, border: 'none', cursor: 'pointer',
            background: '#f0f0f0', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, color: '#666', lineHeight: 1, padding: 0,
          }}
        >
          ×
        </button>

        {/* Name */}
        <div id={`popup-title-${site.slug}`} style={{ fontWeight: 700, fontSize: 14, color: '#0d1b2a', lineHeight: 1.3, paddingRight: 24, marginBottom: 3 }}>
          {site.name}
        </div>

        {/* Location */}
        {site.location && (
          <div style={{ fontSize: 11.5, color: '#999', marginBottom: 11, lineHeight: 1.3 }}>
            {site.location}{site.country ? `, ${site.country}` : ''}
          </div>
        )}

        {/* Stats chips */}
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 13 }}>
          {site.maxDepth > 0 && (
            <Chip bg={`${color}14`} color={color}>↓ {site.maxDepth}m</Chip>
          )}
          <Chip bg={`${color}14`} color={color}>
            {site.waterType === 'deep_tank' ? 'Deep Tank' : site.waterType === 'sea' ? 'Sea' : 'Lake'}
          </Chip>
          {temp !== null && tempColor && (
            <Chip bg={`${tempColor}18`} color={tempColor}>{temp}°C</Chip>
          )}
        </div>

        {/* CTA */}
        <a
          href={`/dive-sites/${site.slug}`}
          style={{
            display: 'block', textAlign: 'center',
            background: color, color: 'white',
            padding: '8px', borderRadius: 8,
            fontSize: 12.5, fontWeight: 600, textDecoration: 'none',
            letterSpacing: '0.01em',
            outline: 'none',
          }}
          onFocus={(e) => { e.currentTarget.style.outline = '2px solid white'; e.currentTarget.style.outlineOffset = '2px'; }}
          onBlur={(e) => { e.currentTarget.style.outline = 'none'; }}
        >
          View site →
        </a>
      </div>

      {/* Tail arrow */}
      <div aria-hidden="true" style={{
        position: 'absolute', bottom: -7, left: '50%', transform: 'translateX(-50%)',
        width: 14, height: 7,
        background: 'white',
        clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
        filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.08))',
      }} />
    </div>
  );
}

function Chip({ bg, color, children }: { bg: string; color: string; children: React.ReactNode }) {
  return (
    <span style={{
      background: bg, color,
      borderRadius: 6, padding: '3px 8px',
      fontSize: 11, fontWeight: 600,
      fontFamily: 'system-ui, sans-serif',
      whiteSpace: 'nowrap',
    }}>
      {children}
    </span>
  );
}

// Depth-pill pin — shows max depth, colored by water type
function DepthPin({ site, isSelected }: { site: DiveSite; isSelected: boolean }) {
  const color = siteColor(site);
  const label = site.maxDepth > 0 ? `${site.maxDepth}m` : '·';
  const ariaLabel = [
    site.name,
    site.maxDepth > 0 ? `max depth ${site.maxDepth}m` : null,
    site.waterType === 'deep_tank' ? 'deep tank' : site.waterType,
  ].filter(Boolean).join(', ');

  return (
    <div
      role="button"
      aria-label={ariaLabel}
      aria-pressed={isSelected}
      style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
    >
      {/* Popup floats above the pin */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        cursor: 'pointer',
        transform: `scale(${isSelected ? 1.25 : 1})`,
        transformOrigin: 'bottom center',
        transition: 'transform 0.15s ease',
        filter: `drop-shadow(0 ${isSelected ? 4 : 2}px ${isSelected ? 10 : 4}px rgba(0,0,0,${isSelected ? 0.36 : 0.2}))`,
      }}>
        <div style={{
          background: color,
          color: 'white',
          border: `2px solid ${isSelected ? 'white' : 'rgba(255,255,255,0.5)'}`,
          borderRadius: 999,
          padding: '3px 9px',
          fontSize: 11,
          fontWeight: 700,
          fontFamily: 'system-ui, -apple-system, sans-serif',
          whiteSpace: 'nowrap',
          letterSpacing: '-0.01em',
          lineHeight: 1.4,
          minWidth: 28,
          textAlign: 'center',
        }}>
          {label}
        </div>
        <div style={{
          width: 0, height: 0,
          borderLeft: '4px solid transparent',
          borderRight: '4px solid transparent',
          borderTop: `5px solid ${color}`,
          marginTop: -1,
        }} />
      </div>
    </div>
  );
}

interface Props {
  sites: DiveSite[];
  onSelect?: (site: DiveSite) => void;
}

export default function DiveSiteMap({ sites, onSelect }: Props) {
  const mappable = sites.filter((s) => s.coordinates?.lat && s.coordinates?.lng);
  const [selected, setSelected] = useState<DiveSite | null>(null);

  const handleMarkerClick = useCallback((site: DiveSite) => {
    setSelected((prev) => prev?.slug === site.slug ? null : site);
    onSelect?.(site);
  }, [onSelect]);

  return (
    <APIProvider apiKey={API_KEY}>
      <div role="region" aria-label="Dive sites map" style={{ width: '100%', height: '100%' }}>
        <Map
          defaultCenter={{ lat: 20, lng: 10 }}
          defaultZoom={2}
          mapId="dive-sites-map"
          gestureHandling="greedy"
          disableDefaultUI={false}
          style={{ width: '100%', height: '100%' }}
          onClick={() => setSelected(null)}
        >
          <ApplyOceanStyle />
          <FitBounds sites={mappable} />

          {mappable.map((site) => {
            const isSelected = selected?.slug === site.slug;
            return (
              <AdvancedMarker
                key={site.slug}
                position={{ lat: site.coordinates.lat, lng: site.coordinates.lng }}
                onClick={() => handleMarkerClick(site)}
                zIndex={isSelected ? 100 : 1}
              >
                <div style={{ position: 'relative' }}>
                  {isSelected && (
                    <PopupCard site={site} onClose={() => setSelected(null)} />
                  )}
                  <DepthPin site={site} isSelected={isSelected} />
                </div>
              </AdvancedMarker>
            );
          })}
        </Map>
      </div>
    </APIProvider>
  );
}
