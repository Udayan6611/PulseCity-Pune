import { CityConfig } from '../types/city';

// Use environment variable if provided, otherwise empty string allows Vite proxy / relative URLs
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// Fallback verified cities manifest for static deployment / zero-network resilience
export const FALLBACK_CITIES: CityConfig[] = [
  {
    id: 'pune',
    name: 'Pune',
    nativeName: 'पुणे',
    state: 'Maharashtra',
    country: 'India',
    center: [18.5204, 73.8567],
    zoom: 13,
    boundingBox: [
      [18.4200, 73.7400],
      [18.6300, 73.9800]
    ],
    coverageTier: 1,
    tierLabel: 'Tier 1: Full Coverage',
    tierDescription: 'Complete demonstration coverage with verified places, heritage dossiers, accident blackspots, weather, citizen reports, and social NLP.',
    capabilities: {
      exploration: true,
      heritage: true,
      safetyHazards: true,
      routeEvaluation: true,
      comparisons: true,
      weatherAlerts: true,
      citizenReporting: true,
      socialIntelligence: true
    },
    weatherCoordinates: {
      lat: 18.5204,
      lon: 73.8567
    },
    neighborhoods: [
      'Shivajinagar',
      'Deccan Gymkhana',
      'Kothrud',
      'Koregaon Park',
      'Camp',
      'Viman Nagar',
      'Hinjawadi',
      'Swargate',
      'Baner',
      'Aundh'
    ]
  },
  {
    id: 'mumbai',
    name: 'Mumbai',
    nativeName: 'मुंबई',
    state: 'Maharashtra',
    country: 'India',
    center: [18.9220, 72.8347],
    zoom: 12,
    boundingBox: [
      [18.8900, 72.7700],
      [19.2800, 73.0100]
    ],
    coverageTier: 2,
    tierLabel: 'Tier 2: Pilot City',
    tierDescription: 'Demonstration pilot: Basic places, live weather, and routing enabled. Safety hazard layers and localized citizen reports are currently under curation.',
    capabilities: {
      exploration: true,
      heritage: true,
      safetyHazards: false,
      routeEvaluation: false,
      comparisons: true,
      weatherAlerts: true,
      citizenReporting: false,
      socialIntelligence: false
    },
    weatherCoordinates: {
      lat: 18.9220,
      lon: 72.8347
    },
    neighborhoods: [
      'Colaba',
      'Fort',
      'Marine Lines',
      'Bandra West',
      'Juhu',
      'Andheri'
    ]
  },
  {
    id: 'bengaluru',
    name: 'Bengaluru',
    nativeName: 'ಬೆಂಗಳೂರು',
    state: 'Karnataka',
    country: 'India',
    center: [12.9716, 77.5946],
    zoom: 12,
    boundingBox: [
      [12.8300, 77.4800],
      [13.1200, 77.7500]
    ],
    coverageTier: 2,
    tierLabel: 'Tier 2: Pilot City',
    tierDescription: 'Demonstration pilot: Basic places, live weather, and routing enabled. Safety hazard layers and localized citizen reports are currently under curation.',
    capabilities: {
      exploration: true,
      heritage: true,
      safetyHazards: false,
      routeEvaluation: false,
      comparisons: true,
      weatherAlerts: true,
      citizenReporting: false,
      socialIntelligence: false
    },
    weatherCoordinates: {
      lat: 12.9716,
      lon: 77.5946
    },
    neighborhoods: [
      'MG Road',
      'Indiranagar',
      'Koramangala',
      'Whitefield',
      'Malleshwaram',
      'Jayanagar'
    ]
  }
];

export async function fetchCities(): Promise<{ cities: CityConfig[]; isLiveBackend: boolean }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/cities`, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return { cities: data.cities || FALLBACK_CITIES, isLiveBackend: true };
  } catch (err) {
    console.warn('[PulseCity API] Backend unreachable, using verified fallback manifest:', err);
    return { cities: FALLBACK_CITIES, isLiveBackend: false };
  }
}
