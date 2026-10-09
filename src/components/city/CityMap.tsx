'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Place, PlaceCategory, City, categoryConfig } from '@/lib/city-data';
import { MapPin, AlertTriangle, AlertOctagon, Compass, Utensils, Hotel, Landmark } from 'lucide-react';

interface CityMapProps {
  city: City;
  places: Place[];
  selectedPlace: Place | null;
  onSelectPlace: (p: Place | null) => void;
}

export default function CityMap({ city, places, selectedPlace, onSelectPlace }: CityMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const userLocRef = useRef<L.Circle | null>(null);

  // Init map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, {
      center: [city.lat, city.lng],
      zoom: city.zoom,
      zoomControl: true,
      attributionControl: true,
      scrollWheelZoom: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    // Fix for dynamic import - invalidate size after mount
    setTimeout(() => {
      map.invalidateSize();
    }, 100);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Re-center when city changes
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setView([city.lat, city.lng], city.zoom, { animate: true });
    }
  }, [city.id, city.lat, city.lng, city.zoom]);

  // Render markers
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    // Clear existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    places.forEach((place) => {
      const cfg = categoryConfig[place.category];
      const markerIcon = L.divIcon({
        className: 'sheher-marker',
        html: `
          <div style="
            width: 36px; height: 36px;
            border-radius: 50% 50% 50% 0;
            background: ${cfg.color};
            transform: rotate(-45deg);
            display: flex; align-items: center; justify-content: center;
            box-shadow: 0 4px 12px rgba(0,0,0,0.25);
            border: 2px solid white;
            ${place.category === 'unsafe' || place.category === 'accident' ? 'animation: markerPulse 1.5s ease-in-out infinite;' : ''}
          ">
            <div style="transform: rotate(45deg); color: white; font-size: 14px; font-weight: bold;">
              ${getEmojiFor(place.category)}
            </div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -32],
      });

      const marker = L.marker([place.lat, place.lng], { icon: markerIcon })
        .addTo(map)
        .bindPopup(
          `<div style="min-width: 200px;">
            <div style="font-weight: 600; font-size: 14px; margin-bottom: 4px;">${place.name}</div>
            <div style="font-size: 11px; color: ${cfg.color}; margin-bottom: 6px; font-weight: 500;">
              ${cfg.label} · ⭐ ${place.rating} · ${place.budget === 0 ? 'Free' : '₹' + place.budget}
            </div>
            <div style="font-size: 11px; color: #6b7280; margin-bottom: 8px; line-height: 1.4;">
              ${place.description.slice(0, 120)}${place.description.length > 120 ? '…' : ''}
            </div>
            <div style="font-size: 10px; color: ${cfg.color}; font-weight: 500; cursor: pointer;">
              View details →
            </div>
          </div>`,
          { className: 'sheher-popup' }
        );

      marker.on('click', () => {
        onSelectPlace(place);
      });

      markersRef.current.push(marker);
    });
  }, [places, onSelectPlace]);

  // Show user location option
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    const handleLocate = () => {
      map.locate({ setView: false, enableHighAccuracy: true });
    };

    map.on('locationfound', (e: any) => {
      if (userLocRef.current) userLocRef.current.remove();
      const radius = e.accuracy / 2;
      userLocRef.current = L.circle(e.latlng, {
        radius,
        color: '#10b981',
        fillColor: '#10b981',
        fillOpacity: 0.15,
        weight: 1,
      }).addTo(map);

      L.marker(e.latlng, {
        icon: L.divIcon({
          className: 'sheher-marker',
          html: `<div style="width: 16px; height: 16px; border-radius: 50%; background: #10b981; border: 3px solid white; box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.2);"></div>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        }),
      })
        .addTo(map)
        .bindPopup('You are here');
    });

    // Don't auto-locate — let user trigger
    return () => {
      map.off('locationfound');
    };
  }, []);

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />

      {/* Locate button */}
      <button
        onClick={() => mapRef.current?.locate({ setView: true, enableHighAccuracy: true })}
        className="absolute top-3 right-3 z-[400] bg-white text-foreground p-2 rounded-lg shadow-md hover:bg-gray-50 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors"
        aria-label="Find my location"
        title="Find my location"
      >
        <CrosshairIcon />
      </button>

      {/* Legend */}
      <div className="absolute bottom-3 left-3 z-[400] bg-white/90 dark:bg-zinc-900/90 backdrop-blur p-2.5 rounded-lg shadow-md text-xs max-w-[180px]">
        <div className="font-semibold mb-1.5 text-foreground">Map Legend</div>
        <div className="space-y-1">
          {(['attraction', 'food', 'hotel', 'heritage', 'unsafe', 'accident'] as PlaceCategory[]).map((cat) => {
            const cfg = categoryConfig[cat];
            return (
              <div key={cat} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full border border-white"
                  style={{ background: cfg.color }}
                />
                <span className="text-foreground">{cfg.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function getEmojiFor(category: PlaceCategory): string {
  const map: Record<PlaceCategory, string> = {
    attraction: '🎯',
    food: '🍽️',
    hotel: '🏨',
    heritage: '🏛️',
    unsafe: '⚠️',
    accident: '🚨',
    hospital: '🏥',
    transit: '🚇',
  };
  return map[category] || '📍';
}

function CrosshairIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="22" y1="12" x2="18" y2="12" />
      <line x1="6" y1="12" x2="2" y2="12" />
      <line x1="12" y1="6" x2="12" y2="2" />
      <line x1="12" y1="22" x2="12" y2="18" />
    </svg>
  );
}
