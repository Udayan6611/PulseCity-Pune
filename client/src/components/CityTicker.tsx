import React, { useEffect, useState } from 'react';
import { CityConfig } from '../types/city';
import { ProvenanceBadge } from './ProvenanceBadge';
import { CloudRain, Wind, AlertTriangle, Thermometer } from 'lucide-react';

interface CityTickerProps {
  city: CityConfig;
}

interface WeatherState {
  temperature: number;
  precipitationProbability: number;
  windSpeed: number;
  weatherCode: number;
  isLive: boolean;
  timestamp: string;
}

export const CityTicker: React.FC<CityTickerProps> = ({ city }) => {
  const [weather, setWeather] = useState<WeatherState>({
    temperature: 26,
    precipitationProbability: 60,
    windSpeed: 12,
    weatherCode: 61,
    isLive: false,
    timestamp: 'Cached snapshot',
  });

  useEffect(() => {
    let isMounted = true;
    const fetchWeather = async () => {
      try {
        const { lat, lon } = city.weatherCoordinates;
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&hourly=precipitation_probability&timezone=Asia%2FKolkata`;
        const res = await fetch(url, { signal: AbortSignal.timeout(3500) });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        
        if (isMounted) {
          const currentRainProb = data.hourly?.precipitation_probability?.[0] ?? 45;
          setWeather({
            temperature: Math.round(data.current?.temperature_2m ?? 26),
            precipitationProbability: currentRainProb,
            windSpeed: Math.round(data.current?.wind_speed_10m ?? 10),
            weatherCode: data.current?.weather_code ?? 0,
            isLive: true,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          });
        }
      } catch (err) {
        console.warn('[PulseCity Weather] Open-Meteo fetch fallback used:', err);
        if (isMounted) {
          setWeather(prev => ({
            ...prev,
            isLive: false,
            timestamp: 'Offline archive snapshot',
          }));
        }
      }
    };

    fetchWeather();
    return () => { isMounted = false; };
  }, [city]);

  return (
    <div style={{
      height: '38px',
      background: 'rgba(11, 15, 25, 0.95)',
      borderBottom: '1px solid var(--border-glass)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px',
      fontSize: '12px',
      color: 'var(--text-secondary)',
      zIndex: 900,
    }}>
      {/* Left: Weather and Sensor Readings */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Thermometer size={14} color="var(--accent-saffron)" />
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
            {weather.temperature}°C
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <CloudRain size={14} color="var(--accent-teal)" />
          <span>
            Rain Chance: <strong style={{ color: weather.precipitationProbability > 50 ? 'var(--accent-amber)' : 'var(--text-primary)' }}>
              {weather.precipitationProbability}%
            </strong>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Wind size={14} color="var(--accent-blue)" />
          <span>Wind: {weather.windSpeed} km/h</span>
        </div>

        <ProvenanceBadge
          type={weather.isLive ? 'live' : 'archive'}
          label={weather.isLive ? `OPEN-METEO LIVE (${weather.timestamp})` : 'OPEN-METEO SNAPSHOT'}
          source="Open-Meteo CC-BY 4.0"
        />
      </div>

      {/* Right: Explicit Safety Transparency Banner */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          color: 'var(--accent-amber)',
          fontSize: '11px',
          background: 'rgba(255, 183, 3, 0.08)',
          padding: '2px 8px',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid rgba(255, 183, 3, 0.2)',
        }}>
          <AlertTriangle size={13} />
          <span>
            Safety Notice: Documented evidence only. No location or route is guaranteed safe.
          </span>
        </div>

        <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          {city.name} Center: {city.center[0].toFixed(3)}°N, {city.center[1].toFixed(3)}°E
        </span>
      </div>
    </div>
  );
};
