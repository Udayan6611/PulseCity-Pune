// AI SDK wrapper for Sheher (शहर)
import ZAI from 'z-ai-web-dev-sdk';
import { getCities, getCity, getPlacesByCity } from '@/lib/city-data';

let zaiInstance: any = null;

async function getZAI() {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create();
  }
  return zaiInstance;
}

const SYSTEM_PROMPT = `You are Sheher AI (शहर), a smart city exploration assistant for Indian cities.
You help users discover tourist attractions, local food, hotels, heritage sites, and provide safety guidance.

Capabilities:
- Recommend places based on user interests (history, food, budget, adventure)
- Suggest safer routes and identify unsafe zones
- Compare cities/places by safety, cleanliness, affordability, ratings
- Provide real-time-style insights on weather, traffic, best visiting times
- Translate, summarize, and explain cultural context

Available cities: Mumbai, Delhi, Bengaluru, Jaipur, Kolkata.
For each city, you have access to attractions, heritage sites, food spots, hotels, and safety data including accident hotspots and unsafe zones.

Be concise but warm. Use bullet points when listing. Always mention safety tips for night/unknown areas.
When suggesting routes, mention specific landmarks to navigate via.
When discussing heritage, mention the era and significance briefly.
When budget is discussed, use INR (₹) amounts.

If user asks about a city not in your database, politely inform them and suggest the nearest alternative.
Always prioritize user safety — if asked about a place at night, mention if it's safe.`;

export async function chatWithCityAssistant(
  userMessage: string,
  cityId?: string,
  history: { role: string; content: string }[] = []
) {
  try {
    const zai = await getZAI();

    const cityContext = cityId
      ? `Current city context: ${getCity(cityId).name}. Places available: ${getPlacesByCity(cityId)
          .map((p) => `${p.name} (${p.category})`)
          .join(', ')}.`
      : '';

    const messages: any[] = [
      { role: 'assistant', content: SYSTEM_PROMPT },
      ...(cityContext ? [{ role: 'assistant', content: cityContext }] : []),
      ...history.slice(-6).map((m) => ({ role: m.role, content: m.content })),
      { role: 'user', content: userMessage },
    ];

    const completion = await zai.chat.completions.create({
      messages,
      thinking: { type: 'disabled' },
    });

    return {
      success: true,
      content: completion.choices[0]?.message?.content || 'I apologize, I could not generate a response.',
    };
  } catch (error: any) {
    console.error('AI chat error:', error);
    return {
      success: false,
      content:
        "I'm having trouble connecting to the AI service right now. In the meantime, you can explore the map and tabs above — every place has detailed info on safety, budget, and best time to visit.",
    };
  }
}

export async function generateCityInsights(cityId: string) {
  try {
    const zai = await getZAI();
    const city = getCity(cityId);
    const places = getPlacesByCity(cityId);

    const prompt = `Generate 3 actionable city insights for ${city.name} (${city.state}).
Current weather: ${city.weather.temp}°C, ${city.weather.condition}, AQI ${city.weather.aqi}.
Traffic congestion: ${city.weather ? city.traffic.congestion : 'N/A'}%, hotspots: ${city.traffic.hotspots.join(', ')}.
City metrics: safety ${city.metrics.safety}/100, cleanliness ${city.metrics.cleanliness}/100, affordability ${city.metrics.affordability}/100.

Places available: ${places.map((p) => `${p.name} (rating ${p.rating}, safety ${p.safetyScore})`).join('; ')}.

Respond in JSON only with this structure:
{
  "insights": [
    {"type": "weather|traffic|safety|culture|food", "title": "...", "description": "...", "priority": "high|medium|low"},
    ...3 items
  ],
  "recommendation": "One-line overall recommendation for visitors today"
}
No extra text.`;

    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'assistant', content: 'You are a city data analyst AI. Respond ONLY with valid JSON.' },
        { role: 'user', content: prompt },
      ],
      thinking: { type: 'disabled' },
    });

    const raw = completion.choices[0]?.message?.content || '{}';
    try {
      const parsed = JSON.parse(raw);
      return { success: true, data: parsed };
    } catch {
      return { success: true, data: { insights: [], recommendation: raw.slice(0, 200) } };
    }
  } catch (error: any) {
    console.error('Insights error:', error);
    return {
      success: false,
      data: {
        insights: [
          {
            type: 'safety',
            title: 'Stay Alert at Night',
            description: 'Avoid dimly-lit lanes after 11pm. Use app cabs and share live location with trusted contacts.',
            priority: 'high',
          },
        ],
        recommendation: 'Explore during daytime, carry water, and download offline maps.',
      },
    };
  }
}

export async function suggestSaferRoute(
  cityId: string,
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number
) {
  try {
    const zai = await getZAI();
    const city = getCity(cityId);
    const unsafeZones = getPlacesByCity(cityId).filter((p) => p.category === 'unsafe' || p.category === 'accident');

    const prompt = `User wants to travel in ${city.name} from (${fromLat.toFixed(4)}, ${fromLng.toFixed(4)}) to (${toLat.toFixed(4)}, ${toLng.toFixed(4)}).
Known unsafe zones / accident hotspots: ${unsafeZones.map((u) => `${u.name} at (${u.lat}, ${u.lng}) - ${u.description}`).join(' | ')}.

Suggest the safest route. Reply in JSON:
{
  "summary": "short summary of suggested route",
  "waypoints": ["landmark1", "landmark2", "..."],
  "avoidZones": ["names of unsafe zones to avoid"],
  "safetyTips": ["tip1", "tip2", "tip3"],
  "estimatedTime": "e.g. 25-30 min",
  "bestMode": "metro | cab | walk | auto"
}
Only JSON, no extra text.`;

    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'assistant', content: 'You are a city safety routing AI. Respond ONLY with valid JSON.' },
        { role: 'user', content: prompt },
      ],
      thinking: { type: 'disabled' },
    });

    const raw = completion.choices[0]?.message?.content || '{}';
    try {
      return { success: true, data: JSON.parse(raw) };
    } catch {
      return {
        success: true,
        data: {
          summary: raw.slice(0, 300),
          waypoints: [],
          avoidZones: unsafeZones.map((u) => u.name),
          safetyTips: ['Share live location', 'Use registered cab', 'Avoid shortcuts after 10pm'],
          estimatedTime: '20-30 min',
          bestMode: 'cab',
        },
      };
    }
  } catch (error: any) {
    return {
      success: false,
      data: {
        summary: 'Route suggestion service temporarily unavailable.',
        waypoints: [],
        avoidZones: [],
        safetyTips: ['Use registered transport', 'Share live location'],
        estimatedTime: '20-30 min',
        bestMode: 'cab',
      },
    };
  }
}

export async function analyzeCitizenReports(cityId: string, reports: any[]) {
  try {
    const zai = await getZAI();
    const city = getCity(cityId);

    if (reports.length === 0) {
      return {
        success: true,
        data: {
          summary: `No citizen reports for ${city.name} yet. Be the first to report an issue you've noticed.`,
          clusters: [],
          trend: 'insufficient data',
        },
      };
    }

    const prompt = `Analyze these citizen reports from ${city.name}:
${reports.map((r) => `- [${r.category}] ${r.title}: ${r.description} (severity: ${r.severity}, location: ${r.lat},${r.lng})`).join('\n')}

Reply in JSON:
{
  "summary": "2-sentence summary of patterns",
  "clusters": [{"area": "approx area name", "issue": "main issue", "count": N}],
  "trend": "rising | stable | falling | insufficient data",
  "recommendation": "One-line actionable advice"
}
Only JSON.`;

    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'assistant', content: 'You are a city data analyst AI. Respond ONLY with valid JSON.' },
        { role: 'user', content: prompt },
      ],
      thinking: { type: 'disabled' },
    });

    const raw = completion.choices[0]?.message?.content || '{}';
    try {
      return { success: true, data: JSON.parse(raw) };
    } catch {
      return {
        success: true,
        data: { summary: raw.slice(0, 300), clusters: [], trend: 'insufficient data', recommendation: '' },
      };
    }
  } catch (error: any) {
    return { success: false, data: { summary: 'Analysis unavailable', clusters: [], trend: 'unknown' } };
  }
}
