import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { CityConfig } from '../types/city';

interface MapCanvasProps {
  city: CityConfig;
  onSelectMarker?: (title: string, type: string) => void;
}

// Sample verified Pune landmarks and documented hazard blackspots
const PUNE_SAMPLE_MARKERS = [
  {
    id: 'shaniwar-wada',
    title: 'Shaniwar Wada (शनिवार वाडा)',
    category: 'heritage',
    coords: [18.5195, 73.8553] as [number, number],
    desc: 'Historical seat of the Peshwa rulers (1732). Maratha Wada Architecture.',
    badge: 'HERITAGE ARCHIVE',
  },
  {
    id: 'cafe-goodluck',
    title: 'Cafe Goodluck (कॅफे गडलक)',
    category: 'food',
    coords: [18.5173, 73.8415] as [number, number],
    desc: 'Legendary Irani cafe established in 1935 on FC Road. Famous for Bun Maska and Chai.',
    badge: 'AUTHENTIC FOOD',
  },
  {
    id: 'vaishali',
    title: 'Vaishali Restaurant',
    category: 'food',
    coords: [18.5222, 73.8412] as [number, number],
    desc: 'Iconic FC Road institution since 1949. Legendary SPDP and South Indian delicacies.',
    badge: 'AUTHENTIC FOOD',
  },
  {
    id: 'pataleshwar',
    title: 'Pataleshwar Cave Temple (पाताळेश्वर)',
    category: 'heritage',
    coords: [18.5273, 73.8504] as [number, number],
    desc: '8th-century Rashtrakuta rock-cut monolithic temple dedicated to Lord Shiva.',
    badge: 'HERITAGE ARCHIVE',
  },
  {
    id: 'aga-khan-palace',
    title: 'Aga Khan Palace (आगा खान पॅलेस)',
    category: 'heritage',
    coords: [18.5524, 73.9015] as [number, number],
    desc: 'National monument built in 1892. Memorial to Kasturba Gandhi and Mahatma Gandhi.',
    badge: 'HERITAGE ARCHIVE',
  },
  {
    id: 'hazard-navale-bridge',
    title: 'Navale Bridge Corridor (नवले पूल)',
    category: 'hazard',
    coords: [18.4590, 73.8210] as [number, number],
    desc: 'Documented accident-prone zone (MoRTH / Maharashtra Highway Police 2021-2023). Steep gradient & high-speed curve.',
    badge: 'ACCIDENT BLACKSPOT',
  },
  {
    id: 'hazard-alka-talkies',
    title: 'Alka Talkies Chowk / Riverside',
    category: 'hazard',
    coords: [18.5140, 73.8480] as [number, number],
    desc: 'Documented monsoon waterlogging hotspot (PMC Disaster Management records). River surge vulnerability.',
    badge: 'MONSOON FLOOD RISK',
  },
];

export const MapCanvas: React.FC<MapCanvasProps> = ({ city, onSelectMarker }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: city.center,
        zoom: city.zoom,
        zoomControl: true,
        attributionControl: true,
      });

      // ESRI Dark Gray Base Layer (Clean dark canvas, zero watermarks, no API key required)
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
        maxZoom: 16,
      }).addTo(map);

      // ESRI Dark Gray Labels / Reference Overlay
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}', {
        attribution: '',
        maxZoom: 16,
      }).addTo(map);

      const markersLayer = L.layerGroup().addTo(map);
      markersLayerRef.current = markersLayer;
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update map viewport when city changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.setView(city.center, city.zoom);

    // Re-render markers for the city
    if (markersLayerRef.current) {
      markersLayerRef.current.clearLayers();

      if (city.id === 'pune') {
        PUNE_SAMPLE_MARKERS.forEach((m) => {
          let markerColor = '#FF6B35'; // Heritage Saffron
          let pulseClass = '';

          if (m.category === 'food') {
            markerColor = '#00F5D4'; // Teal
          } else if (m.category === 'hazard') {
            markerColor = '#EF476F'; // Crimson
            pulseClass = 'pulse-hazard';
          }

          const iconHtml = `
            <div style="
              width: 28px;
              height: 28px;
              border-radius: 50%;
              background: ${markerColor};
              border: 2px solid #FFFFFF;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 0 12px ${markerColor};
              cursor: pointer;
            ">
              <div style="width: 8px; height: 8px; border-radius: 50%; background: #0B0F19;"></div>
            </div>
          `;

          const customIcon = L.divIcon({
            html: iconHtml,
            className: pulseClass,
            iconSize: [28, 28],
            iconAnchor: [14, 14],
          });

          const marker = L.marker(m.coords, { icon: customIcon });

          const popupContent = `
            <div style="
              font-family: 'Inter', sans-serif;
              color: #F8FAFC;
              padding: 4px;
              min-width: 200px;
            ">
              <span style="
                display: inline-block;
                font-size: 9px;
                font-family: monospace;
                padding: 2px 6px;
                border-radius: 4px;
                background: rgba(255,255,255,0.1);
                color: ${markerColor};
                margin-bottom: 4px;
                border: 1px solid ${markerColor};
              ">
                ${m.badge}
              </span>
              <h4 style="font-size: 13px; font-weight: 700; margin: 4px 0 6px 0; color: #FFFFFF;">
                ${m.title}
              </h4>
              <p style="font-size: 11px; color: #94A3B8; line-height: 1.4; margin-bottom: 8px;">
                ${m.desc}
              </p>
              <div style="font-size: 10px; color: #64748B;">
                GPS: ${m.coords[0].toFixed(4)}°N, ${m.coords[1].toFixed(4)}°E
              </div>
            </div>
          `;

          marker.bindPopup(popupContent, {
            className: 'custom-dark-popup',
          });

          marker.on('click', () => {
            if (onSelectMarker) onSelectMarker(m.title, m.category);
          });

          marker.addTo(markersLayerRef.current!);
        });
      }
    }
  }, [city, onSelectMarker]);

  return (
    <div
      id="map-canvas"
      ref={mapContainerRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        zIndex: 1,
      }}
    />
  );
};
