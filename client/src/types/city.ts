export interface CityCapabilities {
  exploration: boolean;
  heritage: boolean;
  safetyHazards: boolean;
  routeEvaluation: boolean;
  comparisons: boolean;
  weatherAlerts: boolean;
  citizenReporting: boolean;
  socialIntelligence: boolean;
}

export interface CityConfig {
  id: string;
  name: string;
  nativeName: string;
  state: string;
  country: string;
  center: [number, number];
  zoom: number;
  boundingBox: [[number, number], [number, number]];
  coverageTier: 1 | 2 | 3;
  tierLabel: string;
  tierDescription: string;
  capabilities: CityCapabilities;
  weatherCoordinates: {
    lat: number;
    lon: number;
  };
  neighborhoods: string[];
}

export interface Place {
  id: string;
  cityId: string;
  name: string;
  nativeName?: string;
  category: 'restaurant' | 'street_food' | 'cafe' | 'budget_hotel' | 'luxury_hotel' | 'heritage' | 'landmark';
  tags: string[];
  coordinates: [number, number];
  address: string;
  neighborhood: string;
  priceLevel: 1 | 2 | 3 | 4; // ₹ to ₹₹₹₹
  rating: number; // 1.0 - 5.0
  reviewCount: number;
  cleanlinessScore?: number; // 1 - 10
  accessibilityScore?: number; // 1 - 10
  photos: string[];
  historicalDossier?: {
    era: string;
    architecturalStyle: string;
    significance: string;
    culturalTraditions: string[];
    marathiNote: string;
  };
  dataSource: 'curated' | 'osm' | 'user_suggested';
  lastUpdated: string;
}

export interface HazardZone {
  id: string;
  cityId: string;
  title: string;
  category: 'accident_prone' | 'waterlogging' | 'poor_lighting' | 'traffic_bottleneck';
  severity: 'low' | 'moderate' | 'high';
  coordinates: [number, number];
  radiusMeters: number;
  description: string;
  evidenceSource: string;
  disclaimer: string;
  lastReportedDate: string;
}

export interface CitizenReport {
  id: string;
  cityId: string;
  category: 'road_hazard' | 'cleanliness' | 'accessibility' | 'traffic_disruption' | 'safety_concern';
  title: string;
  description: string;
  coordinates: [number, number];
  addressApprox?: string;
  timestamp: string;
  photoData?: string;
  audioData?: string;
  audioTranscript?: string;
  moderationStatus: 'unverified' | 'community_endorsed' | 'official_verified' | 'flagged';
  upvotes: number;
  downvotes: number;
}
