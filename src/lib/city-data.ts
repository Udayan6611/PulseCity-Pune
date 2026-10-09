// Comprehensive city data for Sheher (शहर) platform

export type PlaceCategory = 'attraction' | 'food' | 'hotel' | 'heritage' | 'unsafe' | 'accident' | 'hospital' | 'transit';

export interface Place {
  id: string;
  name: string;
  category: PlaceCategory;
  city: string;
  lat: number;
  lng: number;
  description: string;
  rating: number;
  priceLevel: 1 | 2 | 3 | 4; // 1 = budget, 4 = luxury
  safetyScore: number; // 0-100, 100 = safest
  cleanlinessScore: number;
  accessibilityScore: number;
  budget: number; // avg cost in INR
  bestTime: string;
  tags: string[];
  image: string;
  heritageEra?: string;
  heritageSignificance?: string;
}

export interface City {
  id: string;
  name: string;
  state: string;
  country: string;
  lat: number;
  lng: number;
  zoom: number;
  tagline: string;
  description: string;
  population: string;
  area: string;
  founded: string;
  weather: {
    temp: number;
    condition: string;
    humidity: number;
    wind: number;
    aqi: number;
    forecast: { day: string; temp: number; condition: string }[];
  };
  traffic: {
    congestion: number; // 0-100
    avgSpeed: number;
    hotspots: string[];
  };
  metrics: {
    safety: number;
    cleanliness: number;
    affordability: number;
    airQuality: number;
    transit: number;
    culture: number;
  };
}

export const cities: City[] = [
  {
    id: 'mumbai',
    name: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    lat: 19.076,
    lng: 72.8777,
    zoom: 12,
    tagline: 'The City of Dreams',
    description: 'A pulsating metropolis where heritage architecture meets Bollywood glamour, street food paradises coexist with luxury hotels, and 22 million people chase their dreams every day.',
    population: '20.7 million',
    area: '603 km²',
    founded: '1507',
    weather: {
      temp: 31,
      condition: 'Partly Cloudy',
      humidity: 78,
      wind: 14,
      aqi: 142,
      forecast: [
        { day: 'Today', temp: 31, condition: 'Partly Cloudy' },
        { day: 'Tomorrow', temp: 30, condition: 'Light Rain' },
        { day: 'Thu', temp: 29, condition: 'Thunderstorm' },
        { day: 'Fri', temp: 30, condition: 'Cloudy' },
        { day: 'Sat', temp: 32, condition: 'Sunny' },
      ],
    },
    traffic: {
      congestion: 78,
      avgSpeed: 18,
      hotspots: ['Bandra-Worli Sea Link', 'Andheri-Goregaon', 'Sion-Panvel Highway', 'JVLR'],
    },
    metrics: { safety: 68, cleanliness: 55, affordability: 42, airQuality: 38, transit: 72, culture: 92 },
  },
  {
    id: 'delhi',
    name: 'Delhi',
    state: 'NCR',
    country: 'India',
    lat: 28.6139,
    lng: 77.209,
    zoom: 12,
    tagline: 'Dil Walon Ki Dilli',
    description: 'A capital where seven cities were built, demolished, and rebuilt — Mughal forts, British-era avenues, and modern metros form a layered tapestry of Indian history.',
    population: '32.9 million',
    area: '1,484 km²',
    founded: '1450 BC',
    weather: {
      temp: 28,
      condition: 'Hazy',
      humidity: 62,
      wind: 8,
      aqi: 218,
      forecast: [
        { day: 'Today', temp: 28, condition: 'Hazy' },
        { day: 'Tomorrow', temp: 27, condition: 'Smoke' },
        { day: 'Thu', temp: 29, condition: 'Sunny' },
        { day: 'Fri', temp: 30, condition: 'Sunny' },
        { day: 'Sat', temp: 28, condition: 'Cloudy' },
      ],
    },
    traffic: {
      congestion: 82,
      avgSpeed: 22,
      hotspots: ['Anand Vihar', 'AIIMS Crossing', 'Dhaula Kuan', 'Najafgarh'],
    },
    metrics: { safety: 64, cleanliness: 58, affordability: 58, airQuality: 22, transit: 80, culture: 95 },
  },
  {
    id: 'bangalore',
    name: 'Bengaluru',
    state: 'Karnataka',
    country: 'India',
    lat: 12.9716,
    lng: 77.5946,
    zoom: 12,
    tagline: 'The Garden City & Silicon Valley',
    description: 'India\'s tech capital where craft breweries meet centuries-old temples, where startups bloom in converted warehouses, and the weather stays eternally perfect.',
    population: '13.6 million',
    area: '741 km²',
    founded: '1537',
    weather: {
      temp: 24,
      condition: 'Pleasant',
      humidity: 68,
      wind: 11,
      aqi: 88,
      forecast: [
        { day: 'Today', temp: 24, condition: 'Pleasant' },
        { day: 'Tomorrow', temp: 23, condition: 'Light Rain' },
        { day: 'Thu', temp: 22, condition: 'Rain' },
        { day: 'Fri', temp: 24, condition: 'Cloudy' },
        { day: 'Sat', temp: 25, condition: 'Sunny' },
      ],
    },
    traffic: {
      congestion: 85,
      avgSpeed: 15,
      hotspots: ['Silk Board', 'Marathahalli', 'Hebbal Flyover', 'Outer Ring Road'],
    },
    metrics: { safety: 75, cleanliness: 70, affordability: 55, airQuality: 65, transit: 68, culture: 82 },
  },
  {
    id: 'jaipur',
    name: 'Jaipur',
    state: 'Rajasthan',
    country: 'India',
    lat: 26.9124,
    lng: 75.7873,
    zoom: 12,
    tagline: 'The Pink City',
    description: 'A UNESCO World Heritage city of palaces, havelis, and pink sandstone — where Rajput valor, Mughal artistry, and desert commerce meet in a riot of color.',
    population: '4.0 million',
    area: '467 km²',
    founded: '1727',
    weather: {
      temp: 33,
      condition: 'Sunny',
      humidity: 32,
      wind: 16,
      aqi: 96,
      forecast: [
        { day: 'Today', temp: 33, condition: 'Sunny' },
        { day: 'Tomorrow', temp: 34, condition: 'Sunny' },
        { day: 'Thu', temp: 32, condition: 'Clear' },
        { day: 'Fri', temp: 31, condition: 'Cloudy' },
        { day: 'Sat', temp: 30, condition: 'Light Rain' },
      ],
    },
    traffic: {
      congestion: 52,
      avgSpeed: 32,
      hotspots: ['Hawa Mahal Junction', 'Ajmer Road', 'Tonk Road'],
    },
    metrics: { safety: 78, cleanliness: 72, affordability: 70, airQuality: 72, transit: 55, culture: 98 },
  },
  {
    id: 'kolkata',
    name: 'Kolkata',
    state: 'West Bengal',
    country: 'India',
    lat: 22.5726,
    lng: 88.3639,
    zoom: 12,
    tagline: 'The City of Joy',
    description: 'Where trams still rattle past colonial mansions, where poets are revered like cricketers, and where every cup of cha comes with a side of revolution.',
    population: '15.3 million',
    area: '205 km²',
    founded: '1690',
    weather: {
      temp: 30,
      condition: 'Humid',
      humidity: 84,
      wind: 9,
      aqi: 132,
      forecast: [
        { day: 'Today', temp: 30, condition: 'Humid' },
        { day: 'Tomorrow', temp: 29, condition: 'Thunderstorm' },
        { day: 'Thu', temp: 28, condition: 'Rain' },
        { day: 'Fri', temp: 30, condition: 'Cloudy' },
        { day: 'Sat', temp: 31, condition: 'Sunny' },
      ],
    },
    traffic: {
      congestion: 68,
      avgSpeed: 20,
      hotspots: ['Howrah Bridge', 'Park Street', 'Gariahat', 'Esplanade'],
    },
    metrics: { safety: 70, cleanliness: 50, affordability: 72, airQuality: 48, transit: 76, culture: 96 },
  },
];

export const places: Place[] = [
  // MUMBAI
  {
    id: 'mum-gateway', name: 'Gateway of India', category: 'attraction', city: 'mumbai',
    lat: 18.922, lng: 72.8347, description: 'Iconic 26m basalt arch overlooking the Arabian Sea, built to commemorate King George V\'s 1911 visit. The departure point for Elephanta ferries.',
    rating: 4.6, priceLevel: 1, safetyScore: 82, cleanlinessScore: 75, accessibilityScore: 88,
    budget: 0, bestTime: 'Nov-Feb, 6pm sunset', tags: ['iconic', 'seaside', 'colonial', 'photography'],
    image: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/c9dab76c3ec7.jpg', heritageEra: 'British Raj (1924)', heritageSignificance: 'Symbol of colonial-era Mumbai, designed by George Wittet in Indo-Saracenic style.',
  },
  {
    id: 'mum-elephanta', name: 'Elephanta Caves', category: 'heritage', city: 'mumbai',
    lat: 18.9635, lng: 72.9297, description: 'UNESCO World Heritage 7th-century rock-cut Shiva temples on Elephanta Island. Hourly ferries from Gateway of India.',
    rating: 4.5, priceLevel: 2, safetyScore: 85, cleanlinessScore: 70, accessibilityScore: 50,
    budget: 600, bestTime: 'Nov-Mar, mornings', tags: ['unesco', 'caves', 'shiv-temple', 'ferry'],
    image: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/e43080d66580.jpg', heritageEra: '6th-7th century CE', heritageSignificance: 'Pashupata sect Shaivite rock-cut architecture, Trimurti sculpture is iconic.',
  },
  {
    id: 'mum-cst', name: 'Chhatrapati Shivaji Terminus', category: 'heritage', city: 'mumbai',
    lat: 18.9398, lng: 72.8355, description: 'UNESCO World Heritage Victorian Gothic railway station, still operational, designed by F.W. Stevens. The busiest station in India.',
    rating: 4.7, priceLevel: 1, safetyScore: 75, cleanlinessScore: 65, accessibilityScore: 90,
    budget: 0, bestTime: 'Year-round, dawn for photos', tags: ['unesco', 'gothic', 'railway', 'architecture'],
    image: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/31a7ca19479a.jpg', heritageEra: '1887', heritageSignificance: 'Symbol of Mumbai\'s role as India\'s commercial hub, blending Victorian Gothic with Indian motifs.',
  },
  {
    id: 'mum-marine', name: 'Marine Drive', category: 'attraction', city: 'mumbai',
    lat: 18.9436, lng: 72.8231, description: '3.6km curved promenade along Back Bay — the "Queen\'s Necklace" glitters at night. Perfect for sunset walks and monsoon waves.',
    rating: 4.7, priceLevel: 1, safetyScore: 80, cleanlinessScore: 68, accessibilityScore: 92,
    budget: 0, bestTime: 'Sunset, year-round', tags: ['promenade', 'sunset', 'iconic', 'free'],
    image: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/57c27f0863e5.jpg', 
  },
  {
    id: 'mum-mohammedali', name: 'Mohammed Ali Road', category: 'food', city: 'mumbai',
    lat: 19.0144, lng: 72.8303, description: 'Iftar food paradise during Ramadan — kebabs, malpua, phirni. Year-round street food capital.',
    rating: 4.5, priceLevel: 1, safetyScore: 70, cleanlinessScore: 50, accessibilityScore: 65,
    budget: 250, bestTime: 'Ramadan evenings, year-round nights', tags: ['street-food', 'kebab', 'iftar', 'ramadan'],
    image: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/deaf6875f9f6.jpeg',
  },
  {
    id: 'mum-leopold', name: 'Leopold Cafe', category: 'food', city: 'mumbai',
    lat: 18.922, lng: 72.8328, description: 'Colaba institution since 1871. Beer, biryani, and bullet holes from 2008 attacks — a living piece of Mumbai history.',
    rating: 4.2, priceLevel: 3, safetyScore: 78, cleanlinessScore: 72, accessibilityScore: 80,
    budget: 800, bestTime: 'Lunch & dinner daily', tags: ['historic', 'cafe', 'colaba', 'beer'],
    image: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/a42565df563f.jpg', heritageEra: '1871', heritageSignificance: 'One of Mumbai\'s oldest surviving cafes, mentioned in "Shantaram".',
  },
  {
    id: 'mum-taj', name: 'Taj Mahal Palace Hotel', category: 'hotel', city: 'mumbai',
    lat: 18.9217, lng: 72.8330, description: 'Iconic luxury hotel since 1903 — onion dome, sea-facing suites, and a story behind every corridor.',
    rating: 4.8, priceLevel: 4, safetyScore: 95, cleanlinessScore: 95, accessibilityScore: 88,
    budget: 35000, bestTime: 'Year-round', tags: ['luxury', 'historic', 'sea-view', 'iconic'],
    image: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/20a1b98231cd.jpg', heritageEra: '1903', heritageSignificance: 'India\'s first luxury hotel, Tata\'s reply to colonial exclusion.',
  },
  {
    id: 'mum-bandra', name: 'Bandra West', category: 'attraction', city: 'mumbai',
    lat: 19.0596, lng: 72.8295, description: 'Hip suburb with Mount Mary Basilica, Bandstand Promenade (Shah Rukh Khan\'s Mannat), and Bandra Fort.',
    rating: 4.4, priceLevel: 2, safetyScore: 82, cleanlinessScore: 70, accessibilityScore: 75,
    budget: 500, bestTime: 'Evenings', tags: ['celebrity', 'promenade', 'cafe', 'church'],
    image: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/83da94b550fe.jpeg',
  },
  // Safety - Mumbai
  {
    id: 'mum-unsafe-kamathipura', name: 'Kamathipura (Late Night)', category: 'unsafe', city: 'mumbai',
    lat: 18.9579, lng: 72.8260, description: 'Historic red-light district. Not recommended after 10 PM. Stay on main roads, use registered cabs, avoid unlit lanes.',
    rating: 2.1, priceLevel: 1, safetyScore: 28, cleanlinessScore: 35, accessibilityScore: 60,
    budget: 0, bestTime: 'Avoid 10pm-6am', tags: ['caution', 'night', 'solo-travelers'],
    image: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/8eb55d9c67e7.jpg',
  },
  {
    id: 'mum-accident-jvlr', name: 'JVLR Accident Hotspot', category: 'accident', city: 'mumbai',
    lat: 19.1256, lng: 72.8580, description: 'Jogeshwari-Vikhroli Link Road — 312 accidents in 2024. Heavy truck traffic, blind curves. Avoid during peak hours.',
    rating: 1.8, priceLevel: 1, safetyScore: 22, cleanlinessScore: 45, accessibilityScore: 50,
    budget: 0, bestTime: 'Avoid 8-10am, 6-9pm', tags: ['accident', 'traffic', 'trucks', 'caution'],
    image: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/2cac4316332f.jpg',
  },
  // DELHI
  {
    id: 'del-redfort', name: 'Red Fort', category: 'heritage', city: 'delhi',
    lat: 28.6562, lng: 77.2410, description: 'UNESCO World Heritage Mughal fort — Shah Jahan\'s capital symbol. Independence Day flag hoisted here annually.',
    rating: 4.6, priceLevel: 1, safetyScore: 85, cleanlinessScore: 78, accessibilityScore: 82,
    budget: 500, bestTime: 'Nov-Feb, sound & light show 7pm', tags: ['unesco', 'mughal', 'fort', 'shah-jahan'],
    image: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/598f16cc80b3.jpg', heritageEra: '1648 (Mughal)', heritageSignificance: 'Capital seat of Mughal Empire, symbol of Indian independence.',
  },
  {
    id: 'del-qutub', name: 'Qutub Minar', category: 'heritage', city: 'delhi',
    lat: 28.5245, lng: 77.1855, description: '72.5m tall UNESCO World Heritage minaret (1199 CE). Tallest brick minaret in the world. Iron Pillar (4th CE) nearby never rusts.',
    rating: 4.7, priceLevel: 1, safetyScore: 88, cleanlinessScore: 80, accessibilityScore: 75,
    budget: 600, bestTime: 'Oct-Mar, sunrise', tags: ['unesco', 'minaret', 'delhi-sultanate', 'iron-pillar'],
    image: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/0bacd253fd82.jpg', heritageEra: '1199 (Delhi Sultanate)', heritageSignificance: 'Marks the dawn of Muslim rule in India, started by Qutb-ud-din Aibak.',
  },
  {
    id: 'del-indiagate', name: 'India Gate', category: 'attraction', city: 'delhi',
    lat: 28.6129, lng: 77.2295, description: '42m war memorial arch designed by Lutyens. Eternal flame (Amar Jawan Jyoti). Evening crowds, ice cream vendors, boat rides.',
    rating: 4.7, priceLevel: 1, safetyScore: 86, cleanlinessScore: 75, accessibilityScore: 90,
    budget: 0, bestTime: 'Evenings, year-round', tags: ['memorial', 'lutyens', 'free', 'evening'],
    image: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/a318394af5a8.jpg', heritageEra: '1931 (British)', heritageSignificance: 'Memorial for 70,000 Indian soldiers who died in WWI.',
  },
  {
    id: 'del-lodhi', name: 'Lodhi Gardens', category: 'attraction', city: 'delhi',
    lat: 28.5918, lng: 77.2207, description: '90-acre park dotted with 15th-century Sayyid & Lodhi tombs. Morning yoga, evening strolls, parrots.',
    rating: 4.6, priceLevel: 1, safetyScore: 90, cleanlinessScore: 88, accessibilityScore: 85,
    budget: 0, bestTime: 'Oct-Mar, 6am & 5pm', tags: ['garden', 'tombs', 'free', 'yoga'],
    image: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/d28f642c9a06.jpg', heritageEra: '15th century (Sayyid-Lodhi)', heritageSignificance: 'Preserves tombs of Mohammad Shah & Sikandar Lodhi.',
  },
  {
    id: 'del-chandni', name: 'Chandni Chowk', category: 'food', city: 'delhi',
    lat: 28.6562, lng: 77.2410, description: 'Mughal-era market — parathas at Gali Paranthe Wali, karim\'s kebabs, jalebis at Old Famous. Cycle rickshaw essential.',
    rating: 4.5, priceLevel: 1, safetyScore: 70, cleanlinessScore: 50, accessibilityScore: 55,
    budget: 350, bestTime: 'Mornings for parathas, evenings for kebabs', tags: ['street-food', 'mughal', 'market', 'rickshaw'],
    image: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/dd120d49c19d.jpg', heritageEra: '1650 (Mughal)', heritageSignificance: 'Designed by Jahanara Begum, Shah Jahan\'s daughter.',
  },
  {
    id: 'del-hauz', name: 'Hauz Khas Village', category: 'food', city: 'delhi',
    lat: 28.5494, lng: 77.1938, description: 'Trendy cafes环绕 medieval ruins & a deer park. Cocktails at sunset overlooking Hauz Khas lake.',
    rating: 4.4, priceLevel: 3, safetyScore: 80, cleanlinessScore: 70, accessibilityScore: 70,
    budget: 1200, bestTime: 'Evenings, year-round', tags: ['cafe', 'nightlife', 'ruins', 'lake'],
    image: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/0a024732364a.jpg',
  },
  {
    id: 'del-taj', name: 'The Imperial Hotel', category: 'hotel', city: 'delhi',
    lat: 28.6280, lng: 77.2189, description: 'Art Deco colonial luxury since 1936. Afternoon tea, colonial artifacts, the best heritage hotel in Delhi.',
    rating: 4.8, priceLevel: 4, safetyScore: 96, cleanlinessScore: 95, accessibilityScore: 88,
    budget: 28000, bestTime: 'Year-round', tags: ['luxury', 'colonial', 'art-deco', 'heritage'],
    image: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/dc012118f589.jpg', heritageEra: '1936 (British)', heritageSignificance: 'Built by Blomfield, finest colonial-era hotel in India.',
  },
  {
    id: 'del-accident-anand', name: 'Anand Vihar Crossing', category: 'accident', city: 'delhi',
    lat: 28.6469, lng: 77.3155, description: 'High accident zone near ISBT Anand Vihar. Heavy truck + bus traffic. Use Foot Over Bridge, avoid jaywalking.',
    rating: 1.7, priceLevel: 1, safetyScore: 25, cleanlinessScore: 35, accessibilityScore: 40,
    budget: 0, bestTime: 'Avoid peak hours', tags: ['accident', 'truck', 'bus-stand', 'caution'],
    image: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/78dc3aa5c380.jpg',
  },
  {
    id: 'del-unsafe-late', name: 'Outer Ring Road (Midnight)', category: 'unsafe', city: 'delhi',
    lat: 28.6448, lng: 77.1170, description: 'Reports of carjacking and chain snatching post-midnight. Use GPS, share live location, prefer app cabs.',
    rating: 2.3, priceLevel: 1, safetyScore: 32, cleanlinessScore: 50, accessibilityScore: 60,
    budget: 0, bestTime: 'Avoid 12-5am solo', tags: ['caution', 'midnight', 'solo'],
    image: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/8eb55d9c67e7.jpg',
  },
  // BANGALORE
  {
    id: 'blr-palace', name: 'Bangalore Palace', category: 'heritage', city: 'bangalore',
    lat: 12.9986, lng: 77.5920, description: 'Tudor-style palace built 1878 — inspired by Windsor Castle. Wooden interiors, Gothic windows, royal memorabilia.',
    rating: 4.4, priceLevel: 2, safetyScore: 88, cleanlinessScore: 80, accessibilityScore: 75,
    budget: 460, bestTime: 'Oct-Mar, mornings', tags: ['palace', 'tudor', 'wodeyar', 'royal'],
    image: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/3eaedcc5fc8b.jpg', heritageEra: '1878 (Wodeyar)', heritageSignificance: 'Principal seat of the Wodeyar Maharajas of Mysore.',
  },
  {
    id: 'blr-lalbagh', name: 'Lalbagh Botanical Garden', category: 'attraction', city: 'bangalore',
    lat: 12.9507, lng: 77.5848, description: '240-acre garden with 1,800+ species. 3,000-million-year-old rock outcrop. Annual flower show on Independence Day.',
    rating: 4.7, priceLevel: 1, safetyScore: 92, cleanlinessScore: 90, accessibilityScore: 85,
    budget: 30, bestTime: 'Year-round, 6am & 4pm walks', tags: ['garden', 'flowers', 'birding', 'morning-walk'],
    image: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/1a7f2f544357.jpg', heritageEra: '1760 (Hyder Ali)', heritageSignificance: 'Started by Hyder Ali, expanded by Tipu Sultan — Indo-Islamic garden design.',
  },
  {
    id: 'blr-vidhana', name: 'Vidhana Soudha', category: 'attraction', city: 'bangalore',
    lat: 12.9794, lng: 77.5907, description: 'Neo-Dravidian legislative building. "Government\'s Work is God\'s Work" inscribed on front. Stunning Sunday illumination.',
    rating: 4.5, priceLevel: 1, safetyScore: 90, cleanlinessScore: 85, accessibilityScore: 70,
    budget: 0, bestTime: 'Sunday 7pm lighting', tags: ['architecture', 'neo-dravidian', 'government', 'free'],
    image: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/3d7e43c9bbaa.jpg', heritageEra: '1956 (post-independence)', heritageSignificance: 'Symbol of Karnataka\'s democratic legislature.',
  },
  {
    id: 'blr-indiranagar', name: '100ft Road, Indiranagar', category: 'food', city: 'bangalore',
    lat: 12.9719, lng: 77.6412, description: 'Brewery mile — Toit, Windmills, Arbor. Craft beer, wood-fired pizza, indie music. The heart of Bangalore nightlife.',
    rating: 4.6, priceLevel: 3, safetyScore: 85, cleanlinessScore: 78, accessibilityScore: 80,
    budget: 1500, bestTime: 'Wed-Sun evenings', tags: ['brewery', 'craft-beer', 'nightlife', 'cafe'],
    image: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/1111a061395c.jpg',
  },
  {
    id: 'blr-vv', name: 'VV Puram Food Street', category: 'food', city: 'bangalore',
    lat: 12.9516, lng: 77.5800, description: 'Thindi Beedi — 200m of food stalls serving dosa, obbattu, paddu, and 100+ Karnataka snacks. Pure veg, evening-only.',
    rating: 4.5, priceLevel: 1, safetyScore: 85, cleanlinessScore: 70, accessibilityScore: 70,
    budget: 200, bestTime: 'Tue-Sun 7pm onwards', tags: ['street-food', 'veg', 'karnataka', 'snacks'],
    image: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/286139a1591e.jpg',
  },
  {
    id: 'blr-oberoi', name: 'The Oberoi Bangalore', category: 'hotel', city: 'bangalore',
    lat: 12.9756, lng: 77.6263, description: 'Tree-lined luxury on MG Road. The legendary Sunday brunch, Raj-like service, orchid-filled lobby.',
    rating: 4.8, priceLevel: 4, safetyScore: 95, cleanlinessScore: 95, accessibilityScore: 88,
    budget: 25000, bestTime: 'Sunday brunch', tags: ['luxury', 'brunch', 'mg-road', 'garden'],
    image: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/cc8bea82ddf0.jpg',
  },
  {
    id: 'blr-accident-silkboard', name: 'Silk Board Junction', category: 'accident', city: 'bangalore',
    lat: 12.9170, lng: 77.6224, description: 'Infamous Bangalore bottleneck — 1.2 million vehicles/day. Helmet mandatory, avoid 9-11am & 6-9pm. Use ORR metro.',
    rating: 1.5, priceLevel: 1, safetyScore: 18, cleanlinessScore: 40, accessibilityScore: 35,
    budget: 0, bestTime: 'Avoid peak hours', tags: ['traffic', 'accident', 'bottleneck', 'helmet'],
    image: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/1294e1d9c3e1.jpg',
  },
  {
    id: 'blr-unsafe-ejipura', name: 'Ejipura Lanes (Night)', category: 'unsafe', city: 'bangalore',
    lat: 12.9530, lng: 77.6270, description: 'Dimly lit interior lanes reported for late-night incidents. Use main roads, prefer rapido/Uber post 11pm.',
    rating: 2.4, priceLevel: 1, safetyScore: 35, cleanlinessScore: 50, accessibilityScore: 55,
    budget: 0, bestTime: 'Avoid 11pm-5am', tags: ['caution', 'night', 'dim-lit'],
    image: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/22365f44697a.jpg',
  },
  // JAIPUR
  {
    id: 'jai-hawa', name: 'Hawa Mahal', category: 'heritage', city: 'jaipur',
    lat: 26.9239, lng: 75.8267, description: '1799 five-story pink sandstone facade with 953 jharokha windows. Royal women watched processions unseen.',
    rating: 4.7, priceLevel: 1, safetyScore: 88, cleanlinessScore: 80, accessibilityScore: 78,
    budget: 200, bestTime: 'Sunrise & sunset', tags: ['iconic', 'pink-city', 'jharokha', 'photography'],
    image: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/100c40ec0ada.jpg', heritageEra: '1799 (Kachwaha)', heritageSignificance: 'Designed by Lal Chand Ustad for Maharaja Pratap Singh.',
  },
  {
    id: 'jai-amber', name: 'Amber Fort', category: 'heritage', city: 'jaipur',
    lat: 26.9855, lng: 75.8513, description: 'UNESCO Hilltop fort-palace — Sheesh Mahal (mirror hall), Ganesh Gate, evening sound & light show.',
    rating: 4.8, priceLevel: 1, safetyScore: 88, cleanlinessScore: 82, accessibilityScore: 60,
    budget: 500, bestTime: 'Oct-Mar, 9am', tags: ['unesco', 'fort', 'mirror-hall', 'hilltop'],
    image: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/99d17d1fb01c.jpg', heritageEra: '1592 (Kachwaha)', heritageSignificance: 'Capital of Kachwaha Rajputs before Jaipur was founded.',
  },
  {
    id: 'jai-city', name: 'City Palace', category: 'heritage', city: 'jaipur',
    lat: 26.9255, lng: 75.8245, description: 'Still-royal residence blending Rajput & Mughal architecture. Peacock Gate, Chandra Mahal, museum.',
    rating: 4.6, priceLevel: 2, safetyScore: 92, cleanlinessScore: 88, accessibilityScore: 78,
    budget: 700, bestTime: 'Year-round mornings', tags: ['palace', 'rajput', 'mughal', 'royal'],
    image: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/663c2dfa7e7c.jpg', heritageEra: '1732 (Kachwaha)', heritageSignificance: 'Seat of Jaipur\'s royal family to this day.',
  },
  {
    id: 'jai-chowki', name: 'Chokhi Dhani', category: 'food', city: 'jaipur',
    lat: 26.7955, lng: 75.8870, description: 'Rajasthani village-themed resort. Thali, camel rides, folk dance, magic shows. Evening immersive experience.',
    rating: 4.5, priceLevel: 2, safetyScore: 92, cleanlinessScore: 85, accessibilityScore: 80,
    budget: 1200, bestTime: 'Evenings 6-11pm', tags: ['thali', 'rajasthani', 'village', 'cultural'],
    image: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/deaf6875f9f6.jpeg',
  },
  {
    id: 'jai-rawat', name: 'Rawat Mishthan Bhandar', category: 'food', city: 'jaipur',
    lat: 26.9494, lng: 75.7900, description: 'Famous for Pyaaz Kachori & Mawa Kachori since 1965. Stop on way to/from Amber Fort.',
    rating: 4.6, priceLevel: 1, safetyScore: 88, cleanlinessScore: 75, accessibilityScore: 80,
    budget: 100, bestTime: 'Mornings & evenings', tags: ['snack', 'kachori', 'sweet', 'iconic'],
    image: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/ebc93061cb8e.jpg',
  },
  {
    id: 'jai-rambagh', name: 'Rambagh Palace Hotel', category: 'hotel', city: 'jaipur',
    lat: 26.8980, lng: 75.8052, description: 'Taj-managed former royal residence — 78 luxury rooms, polo bar, peacock gardens. India\'s most opulent heritage hotel.',
    rating: 4.9, priceLevel: 4, safetyScore: 98, cleanlinessScore: 96, accessibilityScore: 85,
    budget: 45000, bestTime: 'Oct-Mar', tags: ['luxury', 'royal', 'taj', 'heritage'],
    image: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/fec75133402a.jpg', heritageEra: '1835 (Kachwaha)', heritageSignificance: 'Former residence of Maharaja Man Singh II.',
  },
  {
    id: 'jai-unsafe-bani', name: 'Bani Park (Late Night)', category: 'unsafe', city: 'jaipur',
    lat: 26.9290, lng: 75.7830, description: 'Quiet residential area with sporadic late-night chain-snatching incidents. Use main roads, well-lit routes only.',
    rating: 2.6, priceLevel: 1, safetyScore: 38, cleanlinessScore: 60, accessibilityScore: 70,
    budget: 0, bestTime: 'Avoid 11pm-5am', tags: ['caution', 'residential', 'night'],
    image: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/11f4f053eebe.jpg',
  },
  // KOLKATA
  {
    id: 'kol-victoria', name: 'Victoria Memorial', category: 'heritage', city: 'kolkata',
    lat: 22.5448, lng: 88.3426, description: 'Marble memorial to Queen Victoria (1921). Indo-Saracenic with Mughal influences. Sound & light show evenings.',
    rating: 4.7, priceLevel: 1, safetyScore: 88, cleanlinessScore: 82, accessibilityScore: 85,
    budget: 500, bestTime: 'Oct-Mar, 5pm sunset', tags: ['marble', 'colonial', 'museum', 'gardens'],
    image: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/853aaf2c977a.jpg', heritageEra: '1921 (British)', heritageSignificance: 'Designed by William Emerson, funded by Indian princes & British Raj.',
  },
  {
    id: 'kol-howrah', name: 'Howrah Bridge', category: 'heritage', city: 'kolkata',
    lat: 22.5851, lng: 88.3469, description: 'Iconic 1943 cantilever bridge over Hooghly — 100,000+ vehicles & 500,000+ pedestrians daily. Symbol of Kolkata.',
    rating: 4.5, priceLevel: 1, safetyScore: 75, cleanlinessScore: 60, accessibilityScore: 70,
    budget: 0, bestTime: 'Sunrise from Howrah side', tags: ['iconic', 'bridge', 'cantilever', 'river'],
    image: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/1d42468b0e9a.jpg', heritageEra: '1943 (British)', heritageSignificance: 'World\'s busiest cantilever bridge, no pillars in river.',
  },
  {
    id: 'kol-dakshineswar', name: 'Dakshineswar Kali Temple', category: 'heritage', city: 'kolkata',
    lat: 22.6597, lng: 88.3569, description: '1855 Bhavatarini Kali temple on Hooghly. Where Ramakrishna Paramahamsa served. 12 Shiva shrines along river.',
    rating: 4.6, priceLevel: 1, safetyScore: 85, cleanlinessScore: 72, accessibilityScore: 70,
    budget: 0, bestTime: 'Year-round, dawn', tags: ['temple', 'kali', 'ramakrishna', 'river'],
    image: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/8e3e1c7140ad.jpg', heritageEra: '1855 (Bengali)', heritageSignificance: 'Site of Ramakrishna\'s spiritual sadhana, key to Bengal Renaissance.',
  },
  {
    id: 'kol-newmarket', name: 'New Market', category: 'food', city: 'kolkata',
    lat: 22.5626, lng: 88.3517, description: '1874 colonial market. Flury\'s pastries, Nahoum\'s baklava, Karam Chand chaat. Christmas lights spectacular.',
    rating: 4.5, priceLevel: 2, safetyScore: 75, cleanlinessScore: 55, accessibilityScore: 65,
    budget: 400, bestTime: 'Mornings, Christmas season', tags: ['market', 'colonial', 'christmas', 'bakery'],
    image: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/60454ef4bc3f.jpg', heritageEra: '1874 (British)', heritageSignificance: 'Calcutta\'s first municipal market.',
  },
  {
    id: 'kol-parkst', name: 'Park Street', category: 'food', city: 'kolkata',
    lat: 22.5535, lng: 88.3520, description: 'Food street since British era — Peter Cat, Mocambo, Trincas. Christmas lights, jazz history, chelo kebab.',
    rating: 4.6, priceLevel: 3, safetyScore: 80, cleanlinessScore: 70, accessibilityScore: 80,
    budget: 1000, bestTime: 'Evenings, December', tags: ['restaurant', 'colonial', 'nightlife', 'christmas'],
    image: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/e10c2b8ec6a4.jpg', heritageEra: 'British era', heritageSignificance: 'Heart of Kolkata\'s nightlife since 1940s.',
  },
  {
    id: 'kol-oberoi', name: 'The Oberoi Grand', category: 'hotel', city: 'kolkata',
    lat: 22.5618, lng: 88.3514, description: '"Grande Dame of the East" — 1880s colonial-era heritage hotel. Courtyard rooms, legendary Christmas gala.',
    rating: 4.8, priceLevel: 4, safetyScore: 95, cleanlinessScore: 95, accessibilityScore: 85,
    budget: 22000, bestTime: 'Year-round', tags: ['luxury', 'colonial', 'heritage', 'christmas'],
    image: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/19c2e7219950.jpg', heritageEra: '1880s (British)', heritageSignificance: 'Calcutta\'s premier heritage hotel, HQ of Oberoi chain.',
  },
  {
    id: 'kol-accident-gariahat', name: 'Gariahat Crossing', category: 'accident', city: 'kolkata',
    lat: 22.5180, lng: 88.3640, description: 'South Kolkata\'s busiest crossing. Tram, bus, cycle, auto all converge. Stay on crossings, mind trams.',
    rating: 2.0, priceLevel: 1, safetyScore: 30, cleanlinessScore: 50, accessibilityScore: 55,
    budget: 0, bestTime: 'Avoid 6-9pm', tags: ['crossing', 'tram', 'accident', 'caution'],
    image: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/969c78c1f009.jpeg',
  },
];

export const getCities = () => cities;
export const getCity = (id: string) => cities.find(c => c.id === id) || cities[0];
export const getPlacesByCity = (cityId: string) => places.filter(p => p.city === cityId);
export const getPlacesByCityCategory = (cityId: string, category: PlaceCategory) =>
  places.filter(p => p.city === cityId && p.category === category);

export const categoryConfig: Record<PlaceCategory, { label: string; color: string; icon: string }> = {
  attraction: { label: 'Attraction', color: '#10b981', icon: 'camera' },
  food: { label: 'Food', color: '#f59e0b', icon: 'utensils' },
  hotel: { label: 'Hotel', color: '#8b5cf6', icon: 'bed' },
  heritage: { label: 'Heritage', color: '#dc2626', icon: 'landmark' },
  unsafe: { label: 'Unsafe Zone', color: '#7c3aed', icon: 'alert-triangle' },
  accident: { label: 'Accident Hotspot', color: '#ef4444', icon: 'alert-octagon' },
  hospital: { label: 'Hospital', color: '#06b6d4', icon: 'cross' },
  transit: { label: 'Transit', color: '#0ea5e9', icon: 'train' },
};
