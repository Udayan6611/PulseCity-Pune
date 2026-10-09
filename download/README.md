# 🏙️ Sheher — Smart City Exploration Platform

> Turning urban chaos into a smarter, safer, more enjoyable city experience.

**Sheher** is an AI-powered smart city OS built for the **PromptWars Hackathon**. It transforms scattered real-world city data — attractions, heritage, food, hotels, safety, traffic, weather, and citizen reports — into verified, actionable insights.

Built with Next.js 16, TypeScript, Leaflet maps, Prisma, and the **z-ai-web-dev-sdk** for AI capabilities.

## ✨ Features

### 🗺️ Interactive City Map
- Real OpenStreetMap tiles rendered with Leaflet
- Custom category-colored markers (attractions, food, hotels, heritage, unsafe zones, accident hotspots)
- Click any marker to see full details (rating, budget, safety, cleanliness, accessibility scores)
- Live category filter + budget slider
- Geolocation "Find my location" button
- Animated pulse on safety-critical markers

### 🧭 Explore Tab
- Sorted cards (highest rated, lowest budget, safest)
- Rating, price level, safety badges
- Budget in INR, best visiting time
- Filter by category and max spend

### 🏛️ Heritage & Culture Tab
- Vertical historical timeline of heritage sites
- Era badges (Mughal, British, Kachwaha, etc.)
- Significance notes for each site
- Cultural score cards

### 🛡️ Safety Tab
- AI-analyzed citizen reports (clustering, trends, recommendations)
- Unsafe zones + accident hotspots list with safety scores
- 4-metric safety dashboard (overall, cleanliness, air quality, transit)
- Submit your own report (category, severity, GPS, description)
- Photo & voice note support

### 📊 Compare Tab
- Side-by-side city comparison
- 6 winner cards (safety, cleanliness, affordability, AQI, traffic, culture)
- Radar chart (quality of life)
- Bar chart (operational metrics: congestion, avg speed, AQI)

### 🤖 AI Insights Tab
- Live weather card (temp, humidity, wind, AQI, 5-day forecast)
- Live traffic status with hotspots
- AI-generated contextual insights (3 priority insights + recommendation)
- Smart data sources panel

### 💬 AI Assistant (Floating)
- Trained on city data (places, safety, heritage)
- Voice input via Web Speech API
- Conversational context (last 6 messages)
- Suggests safer routes, hidden gems, budget tips
- Streaming-style loading indicator

### 📱 Polish
- Light + dark mode
- Mobile-first responsive (single page, tabs collapse)
- Framer Motion animations
- Toast notifications (Sonner)
- Sticky header with city selector
- Sticky footer
- Custom color palette (warm sand + sunset orange + heritage terracotta)

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 + shadcn/ui (New York) |
| Maps | Leaflet + OpenStreetMap |
| AI | z-ai-web-dev-sdk (chat, insights, safer routing) |
| Database | Prisma ORM + SQLite |
| Charts | Recharts (radar, bar) |
| Animations | Framer Motion |
| Icons | Lucide React |
| Fonts | Inter + Plus Jakarta Sans |

## 🚀 Quick Start

```bash
# Install deps
bun install

# Push DB schema
bun run db:push

# Start dev server
bun run dev

# Open
open http://localhost:3000
```

## 📁 Project Structure

```
.
├── prisma/schema.prisma             # CitizenReport, PlaceReview, ChatHistory models
├── src/
│   ├── app/
│   │   ├── page.tsx                 # Single-page app, all sections
│   │   ├── layout.tsx               # Root layout, fonts, metadata
│   │   ├── globals.css              # Custom theme, Leaflet styling
│   │   └── api/
│   │       ├── chat/route.ts        # AI assistant endpoint
│   │       ├── insights/route.ts    # AI-generated city insights
│   │       ├── reports/route.ts     # Citizen reports CRUD + AI analysis
│   │       ├── safer-route/route.ts # AI safer route suggestion
│   │       └── cities/route.ts      # City + place data
│   ├── components/
│   │   ├── ui/                      # shadcn/ui components
│   │   └── city/CityMap.tsx         # Leaflet map component
│   └── lib/
│       ├── ai.ts                    # z-ai-web-dev-sdk wrapper
│       ├── city-data.ts             # 5 cities, 30+ places dataset
│       └── db.ts                    # Prisma client
└── package.json
```

## 🗄️ Database Schema

- **CitizenReport** — city, category, title, description, lat/lng, severity, status, upvotes, image/voice note
- **PlaceReview** — place, rating, comment
- **ChatHistory** — sessionId, role, content, city

## 🌆 Cities Covered

| City | State | Tagline |
|---|---|---|
| Mumbai | Maharashtra | City of Dreams |
| Delhi | NCR | Dil Walon Ki Dilli |
| Bengaluru | Karnataka | Garden City & Silicon Valley |
| Jaipur | Rajasthan | The Pink City |
| Kolkata | West Bengal | City of Joy |

Each city includes 6-10 hand-curated places spanning attractions, food, hotels, heritage sites, unsafe zones, and accident hotspots.

## 🤖 AI Capabilities

Powered by `z-ai-web-dev-sdk`:

1. **Conversational Assistant** — context-aware chat with city-specific knowledge
2. **Smart Insights** — generates 3 actionable insights (weather/traffic/safety/culture/food) per city
3. **Safer Route Suggestion** — analyzes unsafe zones along a route and recommends waypoints + safety tips
4. **Citizen Report Analysis** — clusters reports by area/issue, detects trends, recommends action

All AI calls happen server-side (per the SDK requirement). Client → Next.js API route → z-ai-web-dev-sdk.

## 🎯 Problem Statement Coverage

| Requirement | Implementation |
|---|---|
| Exploration & Hospitality | Explore tab with attractions, food, hotels, budget filter |
| History & Culture | Heritage tab with timeline, era badges, significance notes |
| Safety & Security | Safety tab with unsafe zones, accident hotspots, AI report analysis |
| Best vs. Worst Places | Compare tab with 6 metric winner cards + radar + bar charts |
| Smart City Insights | Insights tab with weather, traffic, AI insights, data sources |
| AI/ML, NLP | z-ai-web-dev-sdk chat, insights, safer routing, report analysis |
| Geolocation | Leaflet + OSM, "find my location", GPS-tagged reports |
| Interactive Maps | Leaflet with custom markers, popups, filters |
| APIs | /api/chat, /api/insights, /api/reports, /api/safer-route, /api/cities |
| Data Analytics | Radar charts, bar charts, trend detection, clustering |
| Citizen Reports | Submit form with category/severity/GPS, upvotes, verification |
| Voice Notes | Web Speech API for assistant input (foundation for voice reports) |
| Social Media Data | Data sources panel shows Twitter/News NLP integration points |

## 🔑 Free API Keys Setup (All Have Free Tiers)

This project works out-of-the-box with mock data. To enable real-time data, sign up for these **free** APIs (no credit card needed):

### 🌦️ OpenWeatherMap (Free — 1,000 calls/day)
1. Sign up at **https://home.openweathermap.org/users/sign_up**
2. After verifying email, go to **https://home.openweathermap.org/api_keys**
3. Create a key, copy it into `.env.local` as `OPENWEATHER_API_KEY="your_key"`
4. **Note**: New keys take ~10 minutes to activate after creation

### 🗺️ Mapbox (Free — 50,000 loads/month, includes traffic tiles)
1. Sign up at **https://account.mapbox.com/auth/signup/**
2. Go to **https://account.mapbox.com/access-tokens/**
3. Copy your default public token into `.env.local` as `MAPBOX_ACCESS_TOKEN="your_token"`
4. **Bonus**: Mapbox traffic tiles give you real-time congestion overlays for free

### 🚗 TomTom Traffic API (Free — 2,500 calls/day)
1. Sign up at **https://developer.tomtom.com/user/sign-up**
2. Get a key at **https://developer.tomtom.com/how-to-get-tomtom-api-key**
3. Add to `.env.local` as `TOMTOM_API_KEY="your_key"`
4. **Use this for**: Real-time traffic flow, incident reports, congestion heatmaps

### 🛣️ OpenRouteService (Free — 2,000 calls/day, open source)
1. Sign up at **https://openrouteservice.org/dev/#/signup**
2. Get a key at **https://openrouteservice.org/dev/#/api-keys**
3. Add to `.env.local` as `ORS_API_KEY="your_key"`
4. **Use this for**: Free turn-by-turn routing, isochrones, distance matrices

### 🚫 Google Maps Platform (Optional — requires billing, but $200 free credit/month)
Only use this if you need Places API, Street View, or want official Google traffic:
1. Sign up at **https://console.cloud.google.com/**
2. Create a project, enable Maps JavaScript API + Directions API + Places API
3. Generate an API key under "Credentials"
4. Add to `.env.local` as `GOOGLE_MAPS_API_KEY="your_key"`
5. **⚠️ Requires credit card on file** — but the $200 free credit covers ~28,000 map loads / 14,000 directions calls

### ✅ Recommended Free Stack (No Credit Card)
| Need | Service | Free Tier |
|---|---|---|
| Weather | OpenWeatherMap | 1,000 calls/day |
| Map tiles + traffic | Mapbox | 50,000 loads/month |
| Routing/directions | OpenRouteService | 2,000 calls/day |
| Real-time traffic | TomTom | 2,500 calls/day |

That's **more than enough** for a hackathon demo, with zero cost.

### Wiring APIs into Sheher

The current code uses mock data stored in `src/lib/city-data.ts`. To wire in real APIs:

1. **Weather**: Replace the static `city.weather` object in `src/lib/city-data.ts` with a fetch to:
   ```
   https://api.openweathermap.org/data/2.5/weather?q={city}&units=metric&appid={OPENWEATHER_API_KEY}
   ```

2. **Traffic**: Add a TomTom fetch in `src/app/api/insights/route.ts`:
   ```
   https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json?key={TOMTOM_API_KEY}&point={lat},{lng}
   ```

3. **Map tiles**: Replace the OpenStreetMap tile URL in `src/components/city/CityMap.tsx` with Mapbox tiles for traffic overlays:
   ```
   https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/256/{z}/{x}/{y}?access_token={MAPBOX_ACCESS_TOKEN}
   ```

4. **Safer routing**: Use OpenRouteService in `src/lib/ai.ts` to get actual polyline routes between points:
   ```
   https://api.openrouteservice.org/v2/directions/driving?api_key={ORS_API_KEY}&start={lng},{lat}&end={lng},{lat}
   ```

## 📦 Source Code Download

A clean source zip (without node_modules / .next / database) is available at:
`/home/z/my-project/download/Sheher-source.zip` (2.8 MB)

Unzip and run:
```bash
unzip Sheher-source.zip -d my-city-app
cd my-city-app
bun install  # or npm install
cp .env.example .env.local  # Add your API keys here
bun run db:push
bun run dev
```

```bash
# 1. Push to GitHub first (see below)
# 2. Visit vercel.com → New Project → Import your GitHub repo
# 3. Vercel auto-detects Next.js — accept defaults
# 4. Add environment variable DATABASE_URL (use Vercel Postgres or Turso for SQLite-on-edge)
# 5. Deploy
```

> **Note on SQLite**: For Vercel deployment, replace the SQLite datasource with Vercel Postgres or Turso. The Prisma schema can be adapted in seconds.

## 📦 Push to GitHub

```bash
# Initialize (if not already)
git init
git add .
git commit -m "Sheher — Smart City Exploration Platform (PromptWars Hackathon)"

# Create repo on GitHub first (https://github.com/new), then:
git remote add origin https://github.com/<your-username>/sheher.git
git branch -M main
git push -u origin main
```

## 🔮 Future Roadmap

- [ ] Real-time Twitter/News NLP integration for social signals
- [ ] Voice notes playback in citizen reports (currently stored as base64)
- [ ] Multi-language support (Hindi, Marathi, Bengali, Tamil)
- [ ] PWA install with offline city data
- [ ] Real Google Maps traffic API integration
- [ ] Crowdsourced photo gallery per place
- [ ] AR mode for heritage sites (camera overlay)
- [ ] Trip planner with multi-stop routing
- [ ] Public transit integration (metro, bus, ferry schedules)

## 📜 License

MIT — built for the PromptWars Hackathon 2026.

## 🙏 Acknowledgments

- [OpenStreetMap](https://openstreetmap.org) — open map data
- [Leaflet](https://leafletjs.com) — mapping library
- [shadcn/ui](https://ui.shadcn.com) — component library
- [z-ai-web-dev-sdk](https://www.npmjs.com/package/z-ai-web-dev-sdk) — AI capabilities
- [Recharts](https://recharts.org) — charts
- [Framer Motion](https://www.framer.com/motion/) — animations

---

<p align="center">
  Built with ☕ + 🧠 for Indian cities, by Team Sheher.
</p>
