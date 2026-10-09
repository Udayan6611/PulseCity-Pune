# PulseCity Pune (पुणे स्पंदन)
### *The Living City Operating System — Explore Heritage, Navigate Chaos, Decode Truth*

[![Hackathon](https://img.shields.io/badge/PromptWars-BRAIN%20DYPCOEI-FF6B35.svg)](https://github.com/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.1-646CFF.svg)](https://vitejs.dev/)
[![Leaflet](https://img.shields.io/badge/Leaflet-1.9-199900.svg)](https://leafletjs.com/)
[![License](https://img.shields.io/badge/License-MIT-00F5D4.svg)](LICENSE)

---

## 🌆 Product Vision

Most city applications divide urban reality into false silos: tourism directories treat cities as pristine theme parks, navigation apps obsess over saving 90 seconds while routing travelers into waterlogged blind spots, and municipal complaint portals bury citizen concerns in bureaucratic tickets.

**PulseCity Pune** is a unified, real-time **Geospatial Intelligence and Urban Exploration HUD** that brings every dimension of city life together into one living canvas:
1. **Exploration & Hospitality:** Authentic wadas, legendary Irani cafes (Cafe Goodluck), iconic South Indian joints (Vaishali), and budget stays.
2. **History & Culture:** In-depth cultural dossiers covering Peshwa architecture (Shaniwar Wada 1732), Rashtrakuta rock-cut temples (Pataleshwar Caves), and British-era memorials (Aga Khan Palace).
3. **Safety & Security:** Transparent hazard overlays integrating documented accident blackspots (MoRTH / Maharashtra Highway Police reports 2021–2023) and monsoon waterlogging choke points (Alka Talkies underpass).
4. **Best vs. Worst Place Comparisons:** 5-Axis radar evaluations across Affordability, Cleanliness, Ratings, Transit Accessibility, and Safety Evidence with explicit formulas and missing-data flags.
5. **Living Smart City Context:** Real-time micro-weather (temperature, rain probability, wind) powered by Open-Meteo REST APIs.
6. **Citizen Reporting:** Civic report terminal supporting geo-tagged hazard submissions with photos, browser audio recording, and community validation.

---

## 🛡️ Zero-Fabrication Data Provenance Transparency

PulseCity adheres to strict evidence integrity. Every insight displays an explicit provenance badge:
- `[LIVE OPEN-METEO SENSOR]`: Direct REST fetch with timestamp under CC-BY 4.0.
- `[POLICE & MUNICIPAL ARCHIVE]`: Documented accident records from published government reports.
- `[VERIFIED PUNE REGISTRY]`: Verified cultural archives from municipal records.
- `[CITIZEN OBSERVATION: UNVERIFIED]`: Real-time user submissions pending community verification.
- **Safety Disclaimer:** Prominently states: *“Documented evidence only. No location or route is guaranteed safe.”*
- **Street Lighting Notice:** Discloses that municipal streetlight surveys are uncollected by open feeds, explicitly omitting the metric rather than inventing false ratings.

---

## 🗺️ Multi-City Architecture & Coverage Tiers

PulseCity is built around a configurable City Manifest engine with transparent coverage tiers:
* **Pune (पुणे):** `Tier 1: Full Coverage` — Complete demonstration coverage with verified places, heritage dossiers, accident blackspots, weather, citizen reports, and comparison radar.
* **Mumbai (मुंबई):** `Tier 2: Pilot City` — Basic places, live weather, and routing enabled. Safety and localized hazard layers currently under curation.
* **Bengaluru (ಬೆಂಗಳೂರು):** `Tier 2: Pilot City` — Basic places, live weather, and routing enabled.

---

## 🏗️ Architecture & Tech Stack

```
PulseCity/
├── client/              # React 18 + Vite + TypeScript + Vanilla CSS Glassmorphism
│   ├── src/
│   │   ├── components/  # Navbar, MapCanvas (Leaflet Dark Matter), CityTicker, Badges
│   │   ├── config/      # API configurations and resilient fallback manifests
│   │   └── types/       # TypeScript entity schemas
├── server/              # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── db/          # Persistent SQLite database via native node:sqlite
│   │   ├── routes/      # /api/health, /api/cities
│   │   └── data/        # cities.json manifest
└── vercel.json          # Vercel deployment configuration
```

* **Frontend:** React 18, Vite 6, TypeScript, Leaflet.js with CartoDB Dark Matter tiles, Lucide Icons, Vanilla CSS Glassmorphism design system.
* **Backend:** Node.js Express API, native `node:sqlite` database for persistent storage at `server/data/pulse.db`.
* **APIs:** Open-Meteo REST API (Weather & AQI), CartoDB / OpenStreetMap tile servers.

---

## 🚀 Getting Started

### Prerequisites
* Node.js v20+ (tested on Node v24.16.0)
* npm v10+

### Installation & Local Run
```bash
# 1. Clone the repository
git clone https://github.com/<your-username>/pulsecity-pune.git
cd pulsecity-pune

# 2. Start both server and client concurrently
npm run dev
```

* Frontend: `http://localhost:5173`
* Backend API: `http://localhost:5000`
* Backend Health Check: `http://localhost:5000/api/health`

### Building for Production
```bash
# Build the client production bundle
npm --prefix client run build
```

---

## 🌐 Deployment to Vercel

PulseCity includes pre-configured `vercel.json` files for zero-friction Vercel deployment:
1. Import the repository into [Vercel](https://vercel.com).
2. Set Build Command: `npm --prefix client run build` (or `npm run build` if root is `client`).
3. Set Output Directory: `client/dist` (or `dist` if root is `client`).
4. The client operates in dual mode: connects to the Express API when `VITE_API_BASE_URL` is set, or serves the resilient manifest when deployed standalone.

---

## ⚖️ License
Built for **PromptWars × BRAIN DYPCOEI**. MIT License.
