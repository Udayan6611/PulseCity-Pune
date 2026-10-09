import { Router } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const citiesRouter = Router();

// Load cities manifest
const citiesFilePath = path.resolve(__dirname, '../data/cities.json');
let citiesData: any[] = [];

try {
  const raw = fs.readFileSync(citiesFilePath, 'utf-8');
  citiesData = JSON.parse(raw);
} catch (err) {
  console.error('[Cities Router] Failed to load cities.json:', err);
}

// GET /api/cities - List all supported cities with coverage tiers
citiesRouter.get('/', (req, res) => {
  res.json({
    provenance: 'CURATED_MANIFEST',
    provenanceBadge: 'VERIFIED CITY MANIFEST',
    totalCities: citiesData.length,
    cities: citiesData
  });
});

// GET /api/cities/:cityId - Get specific city configuration
citiesRouter.get('/:cityId', (req, res) => {
  const city = citiesData.find(c => c.id.toLowerCase() === req.params.cityId.toLowerCase());
  if (!city) {
    return res.status(404).json({
      error: 'City not found',
      requestedCityId: req.params.cityId,
      availableCities: citiesData.map(c => c.id)
    });
  }

  res.json({
    provenance: 'CURATED_MANIFEST',
    provenanceBadge: 'VERIFIED CITY MANIFEST',
    city
  });
});
