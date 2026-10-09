'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Search, Moon, Sun, Compass, Utensils, Hotel, Landmark,
  ShieldAlert, BarChart3, Sparkles, MessageSquare, Mic, Send, Menu, X,
  AlertTriangle, AlertOctagon, TrendingUp, CloudRain, Car, Navigation,
  ThumbsUp, ChevronRight, Star, IndianRupee, Clock, Accessibility,
  ArrowLeftRight, Zap, MapPinned, Plus, Filter, Quote, Eye, Play, Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import {
  RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, BarChart, Bar,
  Radar, PolarRadiusAxis, Legend, XAxis, YAxis, CartesianGrid, Cell as RCell,
} from 'recharts';
import { cities, places, categoryConfig, getCity, getPlacesByCity, Place, PlaceCategory } from '@/lib/city-data';

// Dynamically import the map (Leaflet needs window)
const CityMap = dynamic(() => import('@/components/city/CityMap'), { ssr: false });

type TabKey = 'explore' | 'heritage' | 'safety' | 'compare' | 'insights';

export default function Home() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [selectedCityId, setSelectedCityId] = useState('mumbai');
  const [activeTab, setActiveTab] = useState<TabKey>('explore');
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [filterCategory, setFilterCategory] = useState<PlaceCategory | 'all'>('all');
  const [budgetFilter, setBudgetFilter] = useState(5000);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [showAssistant, setShowAssistant] = useState(false);

  const city = getCity(selectedCityId);
  const cityPlaces = useMemo(() => getPlacesByCity(selectedCityId), [selectedCityId]);

  // Apply theme
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const filteredPlaces = useMemo(() => {
    return cityPlaces.filter((p) => {
      const matchCat = filterCategory === 'all' || p.category === filterCategory;
      const matchBudget = p.budget <= budgetFilter;
      return matchCat && matchBudget;
    });
  }, [cityPlaces, filterCategory, budgetFilter]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <Header
        theme={theme}
        setTheme={setTheme}
        selectedCityId={selectedCityId}
        setSelectedCityId={setSelectedCityId}
        mobileMenu={mobileMenu}
        setMobileMenu={setMobileMenu}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        setShowAssistant={setShowAssistant}
      />

      <main className="flex-1">
        {/* Hero */}
        <Hero city={city} />

        {/* Quick stats */}
        <QuickStats city={city} places={cityPlaces} />

        {/* Map + filter bar */}
        <section className="px-4 md:px-8 -mt-6 relative z-10">
          <Card className="overflow-hidden shadow-xl border-border/60">
            <div className="grid lg:grid-cols-[1fr_360px] gap-0">
              {/* Map */}
              <div className="relative h-[480px] lg:h-[560px] bg-muted">
                <CityMap
                  city={city}
                  places={filteredPlaces}
                  selectedPlace={selectedPlace}
                  onSelectPlace={setSelectedPlace}
                />
              </div>
              {/* Filter sidebar */}
              <div className="border-l border-border/60 p-5 bg-card/40 backdrop-blur-sm">
                <FilterPanel
                  city={city}
                  filterCategory={filterCategory}
                  setFilterCategory={setFilterCategory}
                  budgetFilter={budgetFilter}
                  setBudgetFilter={setBudgetFilter}
                  placesCount={filteredPlaces.length}
                  selectedPlace={selectedPlace}
                  onClosePlace={() => setSelectedPlace(null)}
                />
              </div>
            </div>
          </Card>
        </section>

        {/* Main tabs */}
        <section className="px-4 md:px-8 py-8">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabKey)}>
            <div className="flex justify-center mb-6 overflow-x-auto">
              <TabsList className="grid grid-cols-2 md:grid-cols-5 gap-1 h-auto p-1 bg-card/60 backdrop-blur">
                <TabsTrigger value="explore" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Compass className="w-4 h-4 mr-2" /> Explore
                </TabsTrigger>
                <TabsTrigger value="heritage" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Landmark className="w-4 h-4 mr-2" /> Heritage
                </TabsTrigger>
                <TabsTrigger value="safety" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <ShieldAlert className="w-4 h-4 mr-2" /> Safety
                </TabsTrigger>
                <TabsTrigger value="compare" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <BarChart3 className="w-4 h-4 mr-2" /> Compare
                </TabsTrigger>
                <TabsTrigger value="insights" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Sparkles className="w-4 h-4 mr-2" /> AI Insights
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="explore">
              <ExploreSection city={city} places={cityPlaces} />
            </TabsContent>
            <TabsContent value="heritage">
              <HeritageSection city={city} places={cityPlaces} />
            </TabsContent>
            <TabsContent value="safety">
              <SafetySection city={city} places={cityPlaces} />
            </TabsContent>
            <TabsContent value="compare">
              <CompareSection />
            </TabsContent>
            <TabsContent value="insights">
              <InsightsSection city={city} />
            </TabsContent>
          </Tabs>
        </section>

        {/* Citizen Report CTA */}
        <CitizenReportCTA city={city} onGoToSafety={() => {
          setActiveTab('safety');
          if (typeof window !== 'undefined') {
            window.scrollTo({ top: 600, behavior: 'smooth' });
          }
        }} />
      </main>

      {/* Footer */}
      <Footer />

      {/* Floating AI Assistant */}
      <FloatingAssistant open={showAssistant} setOpen={setShowAssistant} cityId={selectedCityId} />
    </div>
  );
}

// ---------- Header ----------
function Header({
  theme, setTheme, selectedCityId, setSelectedCityId, mobileMenu, setMobileMenu,
  activeTab, setActiveTab, setShowAssistant,
}: any) {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary via-primary to-destructive flex items-center justify-center shadow-md">
            <MapPinned className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <div className="font-display font-bold text-lg leading-none">Sheher</div>
            <div className="text-[10px] text-muted-foreground leading-none mt-0.5">शहर · Smart City OS</div>
          </div>
        </div>

        {/* City selector - desktop */}
        <div className="hidden md:flex items-center gap-2">
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Select value={selectedCityId} onValueChange={setSelectedCityId}>
              <SelectTrigger className="w-[180px] pl-9 bg-card/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {cities.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    <span className="font-medium">{c.name}</span>
                    <span className="text-muted-foreground ml-2 text-xs">{c.state}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="hidden md:inline-flex"
            onClick={() => setShowAssistant(true)}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Ask AI
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenu(!mobileMenu)}
          >
            {mobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenu && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-border/60 overflow-hidden bg-background"
          >
            <div className="p-4 space-y-3">
              <Select value={selectedCityId} onValueChange={(v) => { setSelectedCityId(v); setMobileMenu(false); }}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}, {c.state}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button className="w-full" onClick={() => { setShowAssistant(true); setMobileMenu(false); }}>
                <MessageSquare className="w-4 h-4 mr-2" /> Ask AI Assistant
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

// ---------- Hero ----------
function Hero({ city }: { city: any }) {
  return (
    <section className="relative hero-gradient overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-16 pb-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Badge variant="outline" className="mb-4 bg-background/60 backdrop-blur">
            <Sparkles className="w-3 h-3 mr-1" /> AI-Powered Smart City OS · शहर
          </Badge>
          <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight mb-4">
            <span className="text-gradient">Sheher</span>
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
            Discover attractions, find safer routes, explore heritage, and unlock AI-driven
            city insights — turning urban chaos into a smarter, safer, more enjoyable experience.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
            <Badge variant="secondary"><Compass className="w-3 h-3 mr-1" /> Explore</Badge>
            <Badge variant="secondary"><Landmark className="w-3 h-3 mr-1" /> Heritage</Badge>
            <Badge variant="secondary"><ShieldAlert className="w-3 h-3 mr-1" /> Safety</Badge>
            <Badge variant="secondary"><BarChart3 className="w-3 h-3 mr-1" /> Compare</Badge>
            <Badge variant="secondary"><Sparkles className="w-3 h-3 mr-1" /> AI Insights</Badge>
          </div>
        </motion.div>

        {/* Selected city */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="glass-card rounded-2xl p-6 md:p-8 max-w-3xl mx-auto shadow-xl"
        >
          <div className="flex items-start justify-between gap-4 text-left flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Currently exploring</div>
              <h2 className="font-display text-3xl font-bold">{city.name}</h2>
              <div className="text-sm text-muted-foreground">{city.tagline}</div>
              <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{city.description}</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <Badge variant="outline" className="bg-background/60">
                <CloudRain className="w-3 h-3 mr-1" />
                {city.weather.temp}°C · {city.weather.condition}
              </Badge>
              <Badge variant="outline" className="bg-background/60">
                <Car className="w-3 h-3 mr-1" />
                Traffic: {city.traffic.congestion}%
              </Badge>
              <Badge variant="outline" className="bg-background/60">
                <MapPin className="w-3 h-3 mr-1" />
                Pop: {city.population}
              </Badge>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ---------- Quick stats ----------
function QuickStats({ city, places }: { city: any; places: Place[] }) {
  const stats = [
    { label: 'Places Mapped', value: places.length, icon: MapPin, color: 'text-primary' },
    { label: 'Safety Score', value: `${city.metrics.safety}/100`, icon: ShieldAlert, color: city.metrics.safety >= 70 ? 'text-emerald-600' : 'text-amber-600' },
    { label: 'Air Quality', value: city.weather.aqi > 150 ? 'Poor' : city.weather.aqi > 100 ? 'Moderate' : 'Good', icon: CloudRain, color: city.weather.aqi > 150 ? 'text-destructive' : 'text-emerald-600' },
    { label: 'Heritage Sites', value: places.filter((p) => p.category === 'heritage').length, icon: Landmark, color: 'text-primary' },
  ];
  return (
    <section className="px-4 md:px-8 mb-6">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="bg-card/60 backdrop-blur border-border/60">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-muted-foreground">{s.label}</div>
                    <div className="font-display text-xl font-bold">{s.value}</div>
                  </div>
                  <s.icon className={`w-5 h-5 ${s.color}`} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ---------- Filter Panel ----------
function FilterPanel({
  city, filterCategory, setFilterCategory, budgetFilter, setBudgetFilter,
  placesCount, selectedPlace, onClosePlace,
}: any) {
  const categories: { key: PlaceCategory | 'all'; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'attraction', label: 'Attractions' },
    { key: 'food', label: 'Food' },
    { key: 'hotel', label: 'Hotels' },
    { key: 'heritage', label: 'Heritage' },
    { key: 'unsafe', label: 'Unsafe' },
    { key: 'accident', label: 'Accidents' },
  ];

  if (selectedPlace) {
    return <PlaceDetail place={selectedPlace} onClose={onClosePlace} />;
  }

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-display font-semibold text-sm flex items-center gap-1.5">
            <Filter className="w-4 h-4" /> Filters
          </h3>
          <Badge variant="secondary" className="text-xs">{placesCount} places</Badge>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {categories.map((c) => (
            <button
              key={c.key}
              onClick={() => setFilterCategory(c.key)}
              className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                filterCategory === c.key
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card/40 border-border hover:border-primary/50'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-xs flex items-center gap-1">
            <IndianRupee className="w-3 h-3" /> Max Budget
          </Label>
          <Badge variant="outline" className="text-xs">
            ₹{budgetFilter.toLocaleString('en-IN')}
          </Badge>
        </div>
        <Slider
          value={[budgetFilter]}
          onValueChange={(v) => setBudgetFilter(v[0])}
          min={0}
          max={5000}
          step={50}
          className="mt-2"
        />
        <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
          <span>Free</span>
          <span>₹5,000+</span>
        </div>
      </div>

      <Separator />

      <div className="flex-1 overflow-hidden">
        <div className="text-xs text-muted-foreground mb-2">Active filters</div>
        <div className="space-y-1.5">
          <Badge variant="outline" className="block text-left justify-start py-1.5">
            <MapPin className="w-3 h-3 inline mr-1" />
            {city.name}
          </Badge>
          <Badge variant="outline" className="block text-left justify-start py-1.5">
            <Compass className="w-3 h-3 inline mr-1" />
            {filterCategory === 'all' ? 'All categories' : categoryConfig[filterCategory as PlaceCategory].label}
          </Badge>
        </div>
      </div>

      <div className="text-[10px] text-muted-foreground border-t pt-3">
        Tip: Click any marker on the map for details.
      </div>
    </div>
  );
}

// ---------- Place Detail (in sidebar) ----------
function PlaceDetail({ place, onClose }: { place: Place; onClose: () => void }) {
  const cfg = categoryConfig[place.category];
  const metrics = [
    { label: 'Safety', value: place.safetyScore, icon: ShieldAlert },
    { label: 'Cleanliness', value: place.cleanlinessScore, icon: Sparkles },
    { label: 'Accessibility', value: place.accessibilityScore, icon: Accessibility },
  ];
  return (
    <div className="space-y-3 h-full flex flex-col animate-fade-in-up">
      <button onClick={onClose} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
        <ChevronRight className="w-3 h-3 rotate-180" /> Back to filters
      </button>
      <div className="flex items-start gap-2">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: `${cfg.color}20`, color: cfg.color }}
        >
          <PlaceIcon category={place.category} className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h3 className="font-display font-bold text-lg leading-tight">{place.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="text-[10px]">
              <Star className="w-3 h-3 mr-1 fill-amber-500 text-amber-500" />
              {place.rating}
            </Badge>
            <Badge variant="outline" className="text-[10px]" style={{ borderColor: cfg.color, color: cfg.color }}>
              {cfg.label}
            </Badge>
          </div>
        </div>
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed">{place.description}</p>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-muted/40 rounded-md p-2">
          <div className="text-muted-foreground flex items-center gap-1">
            <IndianRupee className="w-3 h-3" /> Budget
          </div>
          <div className="font-semibold">{place.budget === 0 ? 'Free' : `₹${place.budget}`}</div>
        </div>
        <div className="bg-muted/40 rounded-md p-2">
          <div className="text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3" /> Best Time
          </div>
          <div className="font-semibold text-[11px]">{place.bestTime}</div>
        </div>
      </div>

      {/* Metrics */}
      <div className="space-y-2">
        {metrics.map((m) => (
          <div key={m.label}>
            <div className="flex justify-between text-xs mb-0.5">
              <span className="flex items-center gap-1 text-muted-foreground">
                <m.icon className="w-3 h-3" /> {m.label}
              </span>
              <span className="font-semibold">{m.value}/100</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  m.value >= 75 ? 'bg-emerald-500' : m.value >= 50 ? 'bg-amber-500' : 'bg-destructive'
                }`}
                style={{ width: `${m.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {place.heritageEra && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-md p-2 text-xs">
          <div className="font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1">
            <Landmark className="w-3 h-3" /> Heritage
          </div>
          <div className="text-muted-foreground mt-0.5">{place.heritageEra}</div>
          {place.heritageSignificance && (
            <div className="text-muted-foreground mt-1 italic">{place.heritageSignificance}</div>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-1">
        {place.tags.map((t) => (
          <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>
        ))}
      </div>

      <div className="text-[10px] text-muted-foreground mt-auto border-t pt-2">
        📍 {place.lat.toFixed(4)}, {place.lng.toFixed(4)}
      </div>
    </div>
  );
}

function PlaceIcon({ category, className }: { category: PlaceCategory; className?: string }) {
  const map: Record<PlaceCategory, any> = {
    attraction: Compass, food: Utensils, hotel: Hotel, heritage: Landmark,
    unsafe: AlertTriangle, accident: AlertOctagon, hospital: ShieldAlert, transit: Car,
  };
  const Icon = map[category] || MapPin;
  return <Icon className={className} />;
}

// ---------- Explore Section ----------
function ExploreSection({ city, places }: { city: any; places: Place[] }) {
  const [sortBy, setSortBy] = useState<'rating' | 'budget' | 'safety'>('rating');
  const explorePlaces = places.filter((p) =>
    ['attraction', 'food', 'hotel'].includes(p.category)
  );

  const sorted = [...explorePlaces].sort((a, b) => {
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'budget') return a.budget - b.budget;
    return b.safetyScore - a.safetyScore;
  });

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold">Explore {city.name}</h2>
          <p className="text-sm text-muted-foreground">
            Attractions, food spots, and stays — sorted by what matters most to you.
          </p>
        </div>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="rating">Highest Rated</SelectItem>
            <SelectItem value="budget">Lowest Budget</SelectItem>
            <SelectItem value="safety">Safest</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sorted.map((p, i) => (
          <PlaceCard key={p.id} place={p} index={i} />
        ))}
      </div>
    </div>
  );
}

function PlaceCard({ place, index }: { place: Place; index: number }) {
  const cfg = categoryConfig[place.category];
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Check if image already loaded (cache case where onLoad fires too late)
  useEffect(() => {
    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      setImgLoaded(true);
    }
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.4) }}
    >
      <Card className="overflow-hidden hover:shadow-lg transition-shadow border-border/60 group">
        <div className="h-40 relative overflow-hidden bg-muted">
          {/* Real image */}
          {place.image && !imgError ? (
            <img
              ref={imgRef}
              src={place.image}
              alt={place.name}
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              style={{ opacity: imgLoaded ? 1 : 0 }}
            />
          ) : null}
          {/* Gradient fallback (visible behind image until loaded) */}
          {!imgLoaded && !imgError && (
            <div
              className="absolute inset-0"
              style={{ background: `linear-gradient(135deg, ${cfg.color}40, ${cfg.color}10)` }}
            />
          )}
          {/* Dark gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          {/* Category icon top-right */}
          <div
            className="absolute top-3 right-3 w-9 h-9 rounded-lg flex items-center justify-center backdrop-blur-sm"
            style={{ background: 'rgba(255,255,255,0.9)', color: cfg.color }}
          >
            <PlaceIcon category={place.category} className="w-5 h-5" />
          </div>
          {/* Rating badge bottom-left */}
          <div className="absolute bottom-3 left-3 flex items-center gap-2">
            <Badge className="bg-black/60 backdrop-blur text-white border-0">
              <Star className="w-3 h-3 mr-1 fill-amber-400 text-amber-400" />
              {place.rating}
            </Badge>
            <Badge className="bg-black/60 backdrop-blur text-white border-0" style={{ color: '#fff' }}>
              {place.budget === 0 ? 'Free' : `₹${place.budget}`}
            </Badge>
          </div>
        </div>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-display font-semibold leading-tight">{place.name}</h3>
          </div>
          <Badge variant="outline" className="text-[10px] mb-2" style={{ borderColor: cfg.color + '60', color: cfg.color }}>
            {cfg.label}
          </Badge>
          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{place.description}</p>
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1 font-medium">
              <Clock className="w-3 h-3" />
              {place.bestTime.split(',')[0]}
            </span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <ShieldAlert className="w-3 h-3" />
              {place.safetyScore}/100
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ---------- Heritage Section ----------
function HeritageSection({ city, places }: { city: any; places: Place[] }) {
  const heritagePlaces = places.filter((p) => p.category === 'heritage' || p.heritageEra);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold">Heritage & Culture of {city.name}</h2>
        <p className="text-sm text-muted-foreground">
          Walk through centuries of history — Mughal, British, Rajput, and modern eras layered across one city.
        </p>
      </div>

      {/* Timeline */}
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Landmark className="w-5 h-5 text-primary" /> Historical Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative space-y-4 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-primary before:via-primary/50 before:to-transparent">
            {heritagePlaces.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="relative pl-10"
              >
                <div className="absolute left-1.5 top-1.5 w-3 h-3 rounded-full bg-primary ring-4 ring-background" />
                <div className="bg-card/60 border border-border/60 rounded-lg p-3 hover:border-primary/40 transition-colors">
                  <div className="flex items-start justify-between gap-2 mb-1 flex-wrap">
                    <h4 className="font-semibold">{p.name}</h4>
                    <Badge variant="outline" className="text-[10px]">
                      {p.heritageEra || 'Heritage site'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{p.description}</p>
                  {p.heritageSignificance && (
                    <p className="text-xs italic text-muted-foreground/80 border-l-2 border-primary/40 pl-2">
                      {p.heritageSignificance}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> {p.rating}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {p.lat.toFixed(3)}, {p.lng.toFixed(3)}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Culture cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/30">
          <CardContent className="p-5">
            <Landmark className="w-8 h-8 text-primary mb-2" />
            <h3 className="font-semibold mb-1">Living Heritage</h3>
            <p className="text-xs text-muted-foreground">
              {city.name} preserves {heritagePlaces.length}+ active heritage sites, many still in daily use — temples, forts, and markets.
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-500/10 to-transparent border-amber-500/30">
          <CardContent className="p-5">
            <Utensils className="w-8 h-8 text-amber-600 mb-2" />
            <h3 className="font-semibold mb-1">Cuisine Legacy</h3>
            <p className="text-xs text-muted-foreground">
              {city.name}'s food traditions span {city.founded.includes('BC') ? '2,000+' : '300+'} years, blending royal kitchens and street innovations.
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-500/10 to-transparent border-emerald-500/30">
          <CardContent className="p-5">
            <Sparkles className="w-8 h-8 text-emerald-600 mb-2" />
            <h3 className="font-semibold mb-1">Cultural Score</h3>
            <p className="text-xs text-muted-foreground">
              Rated {city.metrics.culture}/100 for cultural vibrancy — festivals, art, music, and architectural preservation.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ---------- Safety Section ----------
function SafetySection({ city, places }: { city: any; places: Place[] }) {
  const unsafePlaces = places.filter((p) => p.category === 'unsafe' || p.category === 'accident');
  const [reports, setReports] = useState<any[]>([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [analysis, setAnalysis] = useState<any>(null);
  const [showReportForm, setShowReportForm] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      setLoadingReports(true);
      try {
        const res = await fetch(`/api/reports?cityId=${city.id}&analyze=true`, { signal: controller.signal });
        const data = await res.json();
        setReports(data.reports || []);
        setAnalysis(data.analysis);
      } catch (e) {
        if ((e as any).name !== 'AbortError') console.error(e);
      }
      setLoadingReports(false);
    })();
    return () => controller.abort();
  }, [city.id]);

  const refreshReports = () => {
    // Triggered by user action — calls the effect again by changing state
    setCityTrigger((t) => t + 1);
  };
  const [cityTrigger, setCityTrigger] = useState(0);
  useEffect(() => {
    if (cityTrigger === 0) return;
    const controller = new AbortController();
    (async () => {
      setLoadingReports(true);
      try {
        const res = await fetch(`/api/reports?cityId=${city.id}&analyze=true`, { signal: controller.signal });
        const data = await res.json();
        setReports(data.reports || []);
        setAnalysis(data.analysis);
      } catch (e) {
        if ((e as any).name !== 'AbortError') console.error(e);
      }
      setLoadingReports(false);
    })();
    return () => controller.abort();
  }, [cityTrigger, city.id]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-destructive" />
            Safety & Security in {city.name}
          </h2>
          <p className="text-sm text-muted-foreground">
            Reported unsafe zones, accident hotspots, and AI-analyzed citizen reports to help you stay safe.
          </p>
        </div>
        <Button onClick={() => setShowReportForm(!showReportForm)}>
          <Plus className="w-4 h-4 mr-1" /> Report Issue
        </Button>
      </div>

      {showReportForm && <ReportForm city={city} onSubmitted={refreshReports} onClose={() => setShowReportForm(false)} />}

      {/* Safety metrics */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <SafetyMetric label="Overall Safety" value={city.metrics.safety} max={100} />
        <SafetyMetric label="Cleanliness" value={city.metrics.cleanliness} max={100} />
        <SafetyMetric label="Air Quality" value={100 - Math.min(city.weather.aqi / 2, 100)} max={100} suffix="inverse" />
        <SafetyMetric label="Transit Safety" value={city.metrics.transit} max={100} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Unsafe zones */}
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-destructive">
              <AlertOctagon className="w-4 h-4" /> Unsafe Zones & Accident Hotspots
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-[460px] overflow-y-auto">
            {unsafePlaces.length === 0 && (
              <div className="text-sm text-muted-foreground text-center py-8">
                No known unsafe zones mapped yet.
              </div>
            )}
            {unsafePlaces.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="border-l-4 border-destructive/60 bg-destructive/5 rounded-r-md p-3"
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="font-semibold text-sm flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-destructive" />
                    {p.name}
                  </h4>
                  <Badge variant="destructive" className="text-[10px]">
                    {p.category === 'accident' ? 'Accident Zone' : 'Caution'}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-2">{p.description}</p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Safety: {p.safetyScore}/100</span>
                  <span className="text-muted-foreground">{p.bestTime}</span>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>

        {/* AI analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" /> AI Citizen Report Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingReports ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : analysis ? (
              <div className="space-y-3">
                <div className="bg-primary/10 border border-primary/30 rounded-md p-3">
                  <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <Quote className="w-3 h-3" /> Summary
                  </div>
                  <p className="text-sm">{analysis.summary}</p>
                </div>

                {analysis.clusters?.length > 0 && (
                  <div>
                    <div className="text-xs text-muted-foreground mb-1.5">Issue clusters</div>
                    <div className="space-y-1.5">
                      {analysis.clusters.map((c: any, i: number) => (
                        <div key={i} className="flex items-center justify-between bg-muted/40 rounded-md px-3 py-1.5 text-sm">
                          <span>{c.area} <span className="text-muted-foreground text-xs">— {c.issue}</span></span>
                          <Badge variant="secondary">{c.count}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Trend</span>
                  <Badge variant={analysis.trend === 'rising' ? 'destructive' : 'secondary'}>
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {analysis.trend}
                  </Badge>
                </div>
                {analysis.recommendation && (
                  <div className="text-xs italic text-muted-foreground border-l-2 border-primary/40 pl-2">
                    {analysis.recommendation}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-sm text-muted-foreground py-6">
                Analysis unavailable. Try refreshing.
              </div>
            )}

            <Separator className="my-3" />

            <div className="text-xs text-muted-foreground mb-2">
              {reports.length} citizen report{reports.length !== 1 ? 's' : ''} for {city.name}
            </div>
            <ScrollArea className="max-h-32">
              <div className="space-y-1.5">
                {reports.slice(0, 5).map((r) => (
                  <div key={r.id} className="text-xs bg-muted/30 rounded p-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{r.title}</span>
                      <Badge variant="outline" className="text-[10px]">{r.severity}</Badge>
                    </div>
                    <div className="text-muted-foreground">{r.description.slice(0, 80)}{r.description.length > 80 ? '…' : ''}</div>
                  </div>
                ))}
                {reports.length === 0 && (
                  <div className="text-xs text-muted-foreground text-center py-2">
                    No reports yet. Be the first to contribute!
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SafetyMetric({ label, value, max, suffix }: { label: string; value: number; max: number; suffix?: string }) {
  const pct = (value / max) * 100;
  const color = pct >= 75 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-destructive';
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="font-display text-xl font-bold">{Math.round(value)}<span className="text-sm text-muted-foreground">/{max}</span></div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden mt-2">
          <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
        </div>
        {suffix === 'inverse' && (
          <div className="text-[10px] text-muted-foreground mt-1">Higher is better (inverted AQI)</div>
        )}
      </CardContent>
    </Card>
  );
}

function ReportForm({ city, onSubmitted, onClose }: { city: any; onSubmitted: () => void; onClose: () => void }) {
  const { toast } = useToast();
  const [form, setForm] = useState({
    category: 'safety',
    title: '',
    description: '',
    severity: 'medium',
    lat: city.lat,
    lng: city.lng,
  });
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!form.title.trim()) {
      toast({ title: 'Title required', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, city: city.id }),
      });
      if (res.ok) {
        toast({ title: 'Report submitted', description: 'Thank you for helping keep the community informed!' });
        setForm({ ...form, title: '', description: '' });
        onSubmitted();
        onClose();
      } else {
        toast({ title: 'Submission failed', variant: 'destructive' });
      }
    } catch (e) {
      toast({ title: 'Network error', variant: 'destructive' });
    }
    setSubmitting(false);
  };

  return (
    <Card className="border-primary/40">
      <CardContent className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2">
            <Plus className="w-4 h-4" /> Submit a Citizen Report
          </h3>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="w-4 h-4" /></Button>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Category</Label>
            <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="safety">Safety Concern</SelectItem>
                <SelectItem value="traffic">Traffic Issue</SelectItem>
                <SelectItem value="weather">Weather Hazard</SelectItem>
                <SelectItem value="cleanliness">Cleanliness</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Severity</Label>
            <Select value={form.severity} onValueChange={(v) => setForm({ ...form, severity: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label className="text-xs">Title</Label>
          <Input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Broken streetlight at MG Road corner"
          />
        </div>
        <div>
          <Label className="text-xs">Description (optional)</Label>
          <Textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Add details — what happened, when, who's affected..."
            rows={3}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Latitude</Label>
            <Input
              type="number" step="0.0001"
              value={form.lat}
              onChange={(e) => setForm({ ...form, lat: parseFloat(e.target.value) })}
            />
          </div>
          <div>
            <Label className="text-xs">Longitude</Label>
            <Input
              type="number" step="0.0001"
              value={form.lng}
              onChange={(e) => setForm({ ...form, lng: parseFloat(e.target.value) })}
            />
          </div>
        </div>
        <Button onClick={submit} disabled={submitting} className="w-full">
          {submitting ? 'Submitting…' : 'Submit Report'}
        </Button>
      </CardContent>
    </Card>
  );
}

// ---------- Compare Section ----------
function CompareSection() {
  const [cityA, setCityA] = useState('mumbai');
  const [cityB, setCityB] = useState('delhi');

  const a = getCity(cityA);
  const b = getCity(cityB);

  const radarData = [
    { metric: 'Safety', a: a.metrics.safety, b: b.metrics.safety },
    { metric: 'Cleanliness', a: a.metrics.cleanliness, b: b.metrics.cleanliness },
    { metric: 'Affordability', a: a.metrics.affordability, b: b.metrics.affordability },
    { metric: 'Air Quality', a: 100 - Math.min(a.weather.aqi / 2, 100), b: 100 - Math.min(b.weather.aqi / 2, 100) },
    { metric: 'Transit', a: a.metrics.transit, b: b.metrics.transit },
    { metric: 'Culture', a: a.metrics.culture, b: b.metrics.culture },
  ];

  const barData = [
    { metric: 'Traffic %', a: a.traffic.congestion, b: b.traffic.congestion },
    { metric: 'Avg Speed', a: a.traffic.avgSpeed, b: b.traffic.avgSpeed },
    { metric: 'AQI', a: a.weather.aqi, b: b.weather.aqi },
  ];

  // Determine winners
  const winners: { metric: string; winner: 'a' | 'b' | 'tie'; aVal: number; bVal: number; betterIsHigher: boolean }[] = [
    { metric: 'Safety', winner: a.metrics.safety > b.metrics.safety ? 'a' : a.metrics.safety < b.metrics.safety ? 'b' : 'tie', aVal: a.metrics.safety, bVal: b.metrics.safety, betterIsHigher: true },
    { metric: 'Cleanliness', winner: a.metrics.cleanliness > b.metrics.cleanliness ? 'a' : a.metrics.cleanliness < b.metrics.cleanliness ? 'b' : 'tie', aVal: a.metrics.cleanliness, bVal: b.metrics.cleanliness, betterIsHigher: true },
    { metric: 'Affordability', winner: a.metrics.affordability > b.metrics.affordability ? 'a' : a.metrics.affordability < b.metrics.affordability ? 'b' : 'tie', aVal: a.metrics.affordability, bVal: b.metrics.affordability, betterIsHigher: true },
    { metric: 'Air Quality', winner: a.weather.aqi < b.weather.aqi ? 'a' : a.weather.aqi > b.weather.aqi ? 'b' : 'tie', aVal: a.weather.aqi, bVal: b.weather.aqi, betterIsHigher: false },
    { metric: 'Traffic (lower better)', winner: a.traffic.congestion < b.traffic.congestion ? 'a' : a.traffic.congestion > b.traffic.congestion ? 'b' : 'tie', aVal: a.traffic.congestion, bVal: b.traffic.congestion, betterIsHigher: false },
    { metric: 'Culture', winner: a.metrics.culture > b.metrics.culture ? 'a' : a.metrics.culture < b.metrics.culture ? 'b' : 'tie', aVal: a.metrics.culture, bVal: b.metrics.culture, betterIsHigher: true },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold flex items-center gap-2">
          <ArrowLeftRight className="w-6 h-6 text-primary" />
          Best vs. Worst: City Comparison
        </h2>
        <p className="text-sm text-muted-foreground">
          Compare cities side-by-side across safety, cleanliness, affordability, traffic, and more.
        </p>
      </div>

      <Card>
        <CardContent className="p-5">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs mb-1.5 block">City A</Label>
              <Select value={cityA} onValueChange={setCityA}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {cities.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}, {c.state}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs mb-1.5 block">City B</Label>
              <Select value={cityB} onValueChange={setCityB}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {cities.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}, {c.state}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Winners summary */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {winners.map((w) => (
          <Card key={w.metric} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground mb-2">{w.metric}</div>
              <div className="flex items-center justify-between gap-2">
                <div className={`flex-1 ${w.winner === 'a' ? 'font-bold text-primary' : ''}`}>
                  <div className="text-[10px] text-muted-foreground">{a.name}</div>
                  <div className="text-lg">{w.aVal}</div>
                </div>
                <div className="text-xs text-muted-foreground">vs</div>
                <div className={`flex-1 text-right ${w.winner === 'b' ? 'font-bold text-primary' : ''}`}>
                  <div className="text-[10px] text-muted-foreground">{b.name}</div>
                  <div className="text-lg">{w.bVal}</div>
                </div>
              </div>
              {w.winner !== 'tie' && (
                <div className="text-[10px] text-emerald-600 mt-1.5 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {w.winner === 'a' ? a.name : b.name} wins
                </div>
              )}
              {w.winner === 'tie' && (
                <div className="text-[10px] text-muted-foreground mt-1.5">Tied</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quality of Life Radar</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11 }} />
                <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 9 }} />
                <Radar dataKey="a" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.4} name={a.name} />
                <Radar dataKey="b" stroke="var(--chart-3)" fill="var(--chart-3)" fillOpacity={0.3} name={b.name} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </RadarChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 text-xs">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary" /> {a.name}</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-chart-3" /> {b.name}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Operational Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="metric" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Bar dataKey="a" fill="var(--primary)" radius={[4, 4, 0, 0]} name={a.name} />
                <Bar dataKey="b" fill="var(--chart-3)" radius={[4, 4, 0, 0]} name={b.name} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ---------- Insights Section ----------
function InsightsSection({ city }: { city: any }) {
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/insights?cityId=${city.id}`, { signal: controller.signal });
        const data = await res.json();
        if (!cancelled) setInsights(data.data);
      } catch (e) {
        if ((e as any).name !== 'AbortError') console.error(e);
      }
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [city.id]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary" />
          AI-Powered Smart Insights for {city.name}
        </h2>
        <p className="text-sm text-muted-foreground">
          Real-time-style weather, traffic, and AI-generated recommendations combining citizen reports, photos, and live data.
        </p>
      </div>

      {/* Weather card */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="bg-gradient-to-br from-sky-500/15 via-sky-500/5 to-transparent p-5">
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div>
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <CloudRain className="w-3 h-3" /> Live Weather
                </div>
                <div className="font-display text-4xl font-bold">{city.weather.temp}°C</div>
                <div className="text-sm text-muted-foreground">{city.weather.condition}</div>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <WeatherStat label="Humidity" value={`${city.weather.humidity}%`} />
                <WeatherStat label="Wind" value={`${city.weather.wind} km/h`} />
                <WeatherStat label="AQI" value={city.weather.aqi} highlight={city.weather.aqi > 150} />
              </div>
            </div>
            <div className="grid grid-cols-5 gap-2 mt-4">
              {city.weather.forecast.map((f: any, i: number) => (
                <div key={i} className="bg-card/60 backdrop-blur rounded-md p-2 text-center">
                  <div className="text-[10px] text-muted-foreground">{f.day}</div>
                  <CloudRain className="w-4 h-4 mx-auto my-1 text-muted-foreground" />
                  <div className="text-xs font-semibold">{f.temp}°</div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Traffic card */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Car className="w-4 h-4 text-primary" /> Traffic Live Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-xs text-muted-foreground">Congestion</div>
                <div className="font-display text-3xl font-bold">{city.traffic.congestion}%</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Avg Speed</div>
                <div className="font-display text-3xl font-bold">{city.traffic.avgSpeed}<span className="text-sm text-muted-foreground"> km/h</span></div>
              </div>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden mb-3">
              <div
                className={`h-full ${city.traffic.congestion > 75 ? 'bg-destructive' : city.traffic.congestion > 50 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                style={{ width: `${city.traffic.congestion}%` }}
              />
            </div>
            <div className="text-xs text-muted-foreground mb-1">Hotspots</div>
            <div className="flex flex-wrap gap-1.5">
              {city.traffic.hotspots.map((h: string) => (
                <Badge key={h} variant="outline" className="text-[10px] bg-destructive/5">
                  <AlertTriangle className="w-3 h-3 mr-1 text-destructive" /> {h}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI insights */}
        <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/30">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" /> AI Generated Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : insights?.insights?.length > 0 ? (
              <div className="space-y-2">
                {insights.insights.map((ins: any, i: number) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-card/60 backdrop-blur rounded-md p-3 border border-border/60"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="text-xs font-semibold flex items-center gap-1">
                        {ins.type === 'weather' && <CloudRain className="w-3 h-3" />}
                        {ins.type === 'traffic' && <Car className="w-3 h-3" />}
                        {ins.type === 'safety' && <ShieldAlert className="w-3 h-3" />}
                        {ins.type === 'culture' && <Landmark className="w-3 h-3" />}
                        {ins.type === 'food' && <Utensils className="w-3 h-3" />}
                        {ins.title}
                      </div>
                      <Badge variant={ins.priority === 'high' ? 'destructive' : ins.priority === 'medium' ? 'default' : 'secondary'} className="text-[10px]">
                        {ins.priority}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{ins.description}</p>
                  </motion.div>
                ))}
                {insights.recommendation && (
                  <div className="text-xs italic bg-primary/10 border-l-2 border-primary pl-2 py-1 mt-3">
                    {insights.recommendation}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                Insights unavailable. Try again later.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Smart city sources */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" /> Smart Data Sources
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Weather APIs', value: 'IMD / OpenWeather', icon: CloudRain },
              { label: 'Traffic Live', value: 'Google Maps API', icon: Car },
              { label: 'Citizen Reports', value: 'Crowdsourced + AI', icon: ThumbsUp },
              { label: 'Social Signals', value: 'Twitter / News NLP', icon: MessageSquare },
            ].map((s) => (
              <div key={s.label} className="bg-muted/40 rounded-md p-3">
                <s.icon className="w-5 h-5 text-primary mb-1.5" />
                <div className="text-[10px] text-muted-foreground">{s.label}</div>
                <div className="text-xs font-semibold">{s.value}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function WeatherStat({ label, value, highlight }: { label: string; value: any; highlight?: boolean }) {
  return (
    <div className={`rounded-md p-2 ${highlight ? 'bg-destructive/10' : 'bg-card/60'}`}>
      <div className="text-[10px] text-muted-foreground">{label}</div>
      <div className="text-sm font-semibold">{value}</div>
    </div>
  );
}

// ---------- Citizen Report CTA ----------
function CitizenReportCTA({ city, onGoToSafety }: { city: any; onGoToSafety: () => void }) {
  return (
    <section className="px-4 md:px-8 py-8">
      <div className="max-w-7xl mx-auto">
        <Card className="overflow-hidden border-primary/30">
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
            <CardContent className="p-6 flex items-center justify-between flex-wrap gap-4">
              <div>
                <h3 className="font-display text-xl font-bold mb-1">
                  Seen something in {city.name}? Report it.
                </h3>
                <p className="text-sm text-muted-foreground">
                  Help fellow citizens stay safe — submit traffic, safety, weather, or cleanliness reports with location, photos, and voice notes.
                </p>
              </div>
              <Button size="lg" onClick={onGoToSafety}>
                Report an Issue →
              </Button>
            </CardContent>
          </div>
        </Card>
      </div>
    </section>
  );
}

// ---------- Footer ----------
function Footer() {
  return (
    <footer className="border-t border-border/60 bg-card/40 mt-auto">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-destructive flex items-center justify-center">
                <MapPinned className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-display font-bold">Sheher <span className="text-muted-foreground font-normal text-sm">शहर</span></span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Smart city exploration for India. Discover attractions, find safer routes, explore heritage, and unlock AI-driven city insights.
            </p>
          </div>
          <div>
            <div className="text-sm font-semibold mb-2">Cities</div>
            <ul className="space-y-1 text-xs text-muted-foreground">
              {cities.map((c) => <li key={c.id}>{c.name}, {c.state}</li>)}
            </ul>
          </div>
          <div>
            <div className="text-sm font-semibold mb-2">Quick Tips</div>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li>Tap any map marker for place details</li>
              <li>Use budget slider to filter by spend</li>
              <li>Submit citizen reports to help others</li>
              <li>Ask Sheher AI for safer route advice</li>
            </ul>
          </div>
        </div>
        <Separator className="my-5" />
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-muted-foreground">
          <div>© {new Date().getFullYear()} Sheher · Smart City OS</div>
          <div>Made with care for Indian cities</div>
        </div>
      </div>
    </footer>
  );
}

// ---------- Floating AI Assistant ----------
function FloatingAssistant({ open, setOpen, cityId }: { open: boolean; setOpen: (v: boolean) => void; cityId: string }) {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    {
      role: 'assistant',
      content: "👋 Namaste! I'm Sheher AI — your smart city companion. Ask me anything about attractions, food, hotels, heritage, or safer routes in any Indian city.",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user' as const, content: input };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, cityId, sessionId: 'anon-' + cityId }),
      });
      const data = await res.json();
      setMessages((m) => [...m, { role: 'assistant', content: data.content }]);
    } catch (e) {
      setMessages((m) => [...m, { role: 'assistant', content: 'Sorry, connection error. Try again.' }]);
    }
    setLoading(false);
  };

  const startVoice = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      alert('Voice input not supported in this browser');
      return;
    }
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    const r = new SR();
    r.lang = 'en-IN';
    r.continuous = false;
    r.interimResults = false;
    r.onresult = (e: any) => {
      const text = e.results[0][0].transcript;
      setInput(text);
      setListening(false);
    };
    r.onerror = () => setListening(false);
    r.onend = () => setListening(false);
    r.start();
    recognitionRef.current = r;
    setListening(true);
  };

  return (
    <>
      {/* Floating button */}
      {!open && (
        <Button
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 rounded-full shadow-xl z-40 h-14 w-14 p-0 bg-primary hover:scale-105 transition-transform"
          size="icon"
        >
          <MessageSquare className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-background" />
        </Button>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-5 right-5 z-40 w-[calc(100vw-2.5rem)] max-w-md"
          >
            <Card className="shadow-2xl border-primary/40">
              <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0 bg-gradient-to-r from-primary/15 to-transparent">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-destructive flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Sheher AI</CardTitle>
                    <div className="text-[10px] text-muted-foreground">Online · {getCity(cityId).name}</div>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[300px] p-3">
                  <div className="space-y-3">
                    {messages.map((m, i) => (
                      <div
                        key={i}
                        className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                            m.role === 'user'
                              ? 'bg-primary text-primary-foreground rounded-br-sm'
                              : 'bg-muted rounded-bl-sm'
                          }`}
                        >
                          {m.content}
                        </div>
                      </div>
                    ))}
                    {loading && (
                      <div className="flex justify-start">
                        <div className="bg-muted rounded-2xl rounded-bl-sm px-3 py-2">
                          <div className="flex gap-1">
                            <span className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce" />
                            <span className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                            <span className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>

                <div className="border-t p-2 flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={startVoice}
                    className={listening ? 'bg-destructive/10 text-destructive' : ''}
                  >
                    <Mic className="w-4 h-4" />
                  </Button>
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && send()}
                    placeholder={listening ? 'Listening…' : 'Ask about places, routes, safety…'}
                    className="border-0 shadow-none focus-visible:ring-0"
                  />
                  <Button size="icon" onClick={send} disabled={loading || !input.trim()}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
