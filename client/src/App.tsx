import React, { useState, useEffect } from 'react';
import { CityConfig } from './types/city';
import { fetchCities, FALLBACK_CITIES } from './config/api';
import { Navbar } from './components/Navbar';
import { CityTicker } from './components/CityTicker';
import { MapCanvas } from './components/MapCanvas';
import { ProvenanceBadge } from './components/ProvenanceBadge';
import { Compass, ShieldAlert, SlidersHorizontal, CheckCircle2 } from 'lucide-react';

export const App: React.FC = () => {
  const [cities, setCities] = useState<CityConfig[]>(FALLBACK_CITIES);
  const [selectedCity, setSelectedCity] = useState<CityConfig>(FALLBACK_CITIES[0]);
  const [isLiveBackend, setIsLiveBackend] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'explore' | 'hazards' | 'compare'>('explore');
  const [selectedPlaceInfo, setSelectedPlaceInfo] = useState<{ title: string; type: string } | null>(null);
  const [isPlannerOpen, setIsPlannerOpen] = useState<boolean>(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);

  // Initial load: test backend connection and load cities manifest
  useEffect(() => {
    let isMounted = true;
    const loadCities = async () => {
      const result = await fetchCities();
      if (isMounted) {
        setCities(result.cities);
        setIsLiveBackend(result.isLiveBackend);
        const pune = result.cities.find(c => c.id === 'pune') || result.cities[0];
        setSelectedCity(pune);
      }
    };
    loadCities();
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="app-container">
      {/* Top Application Navbar */}
      <Navbar
        cities={cities}
        selectedCity={selectedCity}
        onSelectCity={(city) => setSelectedCity(city)}
        isLiveBackend={isLiveBackend}
        onOpenPlannerModal={() => setIsPlannerOpen(true)}
        onOpenReportModal={() => setIsReportModalOpen(true)}
      />

      {/* Living City Context Bar */}
      <CityTicker city={selectedCity} />

      {/* Main Exploration Stage */}
      <main className="main-stage">
        {/* Left Exploration Dock */}
        <aside className="glass-panel" style={{
          width: '360px',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 500,
          borderRight: '1px solid var(--border-glass)',
          background: 'rgba(11, 15, 25, 0.88)',
        }}>
          {/* Dock Tabs */}
          <div style={{
            display: 'flex',
            borderBottom: '1px solid var(--border-glass)',
            padding: '4px',
            gap: '4px',
          }}>
            <button
              className={`btn-secondary ${activeTab === 'explore' ? 'active-tab' : ''}`}
              style={{
                flex: 1,
                justifyContent: 'center',
                padding: '8px 4px',
                fontSize: '12px',
                borderColor: activeTab === 'explore' ? 'var(--accent-saffron)' : 'transparent',
                color: activeTab === 'explore' ? 'var(--accent-saffron)' : 'var(--text-secondary)',
              }}
              onClick={() => setActiveTab('explore')}
            >
              <Compass size={14} />
              <span>Heritage & Food</span>
            </button>

            <button
              className={`btn-secondary ${activeTab === 'hazards' ? 'active-tab' : ''}`}
              style={{
                flex: 1,
                justifyContent: 'center',
                padding: '8px 4px',
                fontSize: '12px',
                borderColor: activeTab === 'hazards' ? 'var(--accent-crimson)' : 'transparent',
                color: activeTab === 'hazards' ? 'var(--accent-crimson)' : 'var(--text-secondary)',
              }}
              onClick={() => setActiveTab('hazards')}
            >
              <ShieldAlert size={14} />
              <span>Hazards & Safety</span>
            </button>

            <button
              className={`btn-secondary ${activeTab === 'compare' ? 'active-tab' : ''}`}
              style={{
                flex: 1,
                justifyContent: 'center',
                padding: '8px 4px',
                fontSize: '12px',
                borderColor: activeTab === 'compare' ? 'var(--accent-teal)' : 'transparent',
                color: activeTab === 'compare' ? 'var(--accent-teal)' : 'var(--text-secondary)',
              }}
              onClick={() => setActiveTab('compare')}
            >
              <SlidersHorizontal size={14} />
              <span>Compare</span>
            </button>
          </div>

          {/* Tab Content Panels */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}>
            {activeTab === 'explore' && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h3 style={{ fontSize: '14px', color: 'var(--text-primary)' }}>
                    Featured Exploration Spots
                  </h3>
                  <ProvenanceBadge type="curated" label="VERIFIED PUNE REGISTRY" source="PMC Cultural Archives" />
                </div>

                {/* Shaniwar Wada Card */}
                <div className="glass-panel" style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-saffron)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h4 style={{ fontSize: '14px', color: 'var(--accent-saffron)' }}>
                      Shaniwar Wada (शनिवार वाडा)
                    </h4>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>1732 CE</span>
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: '1.4' }}>
                    Historical seat of the Peshwa rulers of the Maratha Empire. Known for Delhi Darwaja, Maratha wooden brackets, and musical fountain.
                  </p>
                  <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                    <span style={{ fontSize: '10px', background: 'rgba(255,107,53,0.1)', color: 'var(--accent-saffron)', padding: '2px 6px', borderRadius: '4px' }}>
                      Peshwa Era
                    </span>
                    <span style={{ fontSize: '10px', background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)', padding: '2px 6px', borderRadius: '4px' }}>
                      ₹25 Entry (Indian)
                    </span>
                  </div>
                </div>

                {/* Cafe Goodluck Card */}
                <div className="glass-panel" style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-active)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h4 style={{ fontSize: '14px', color: 'var(--accent-teal)' }}>
                      Cafe Goodluck (कॅफे गडलक)
                    </h4>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Est. 1935</span>
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: '1.4' }}>
                    One of Pune's oldest Irani restaurants situated on Fergusson College Road. Celebrated for Bun Maska, Irani Chai, and Keema Pav.
                  </p>
                  <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                    <span style={{ fontSize: '10px', background: 'rgba(0,245,212,0.1)', color: 'var(--accent-teal)', padding: '2px 6px', borderRadius: '4px' }}>
                      FC Road Culinary
                    </span>
                    <span style={{ fontSize: '10px', background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)', padding: '2px 6px', borderRadius: '4px' }}>
                      ₹ (Under ₹150)
                    </span>
                  </div>
                </div>

                {/* Pataleshwar Cave Temple */}
                <div className="glass-panel" style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h4 style={{ fontSize: '14px', color: 'var(--text-primary)' }}>
                      Pataleshwar Cave Temple (पाताळेश्वर)
                    </h4>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>8th Century</span>
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: '1.4' }}>
                    Monolithic rock-cut cave temple dedicated to Lord Shiva, carved from single basalt rock during the Rashtrakuta period on JM Road.
                  </p>
                </div>
              </>
            )}

            {activeTab === 'hazards' && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h3 style={{ fontSize: '14px', color: 'var(--accent-crimson)' }}>
                    Documented Hazard Zones
                  </h3>
                  <ProvenanceBadge type="archive" label="POLICE & MUNICIPAL ARCHIVE" source="MoRTH 2021-2023" />
                </div>

                <div className="glass-panel" style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(239, 71, 111, 0.3)',
                }}>
                  <h4 style={{ fontSize: '13px', color: 'var(--accent-crimson)' }}>
                    Navale Bridge Corridor (NH-48)
                  </h4>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Documented collision blackspot due to a 4.5km steep downward gradient from Katraj tunnel.
                  </p>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '6px' }}>
                    Evidence: Maharashtra Highway Police 2021-2023 Report
                  </div>
                </div>

                <div className="glass-panel" style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(255, 183, 3, 0.3)',
                }}>
                  <h4 style={{ fontSize: '13px', color: 'var(--accent-amber)' }}>
                    Alka Talkies Chowk / Riverside Underpass
                  </h4>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    High-risk monsoon waterlogging zone during heavy Mutha river discharge from Khadakwasla dam.
                  </p>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '6px' }}>
                    Evidence: PMC Flood Vulnerability Action Map
                  </div>
                </div>

                <div style={{
                  fontSize: '11px',
                  color: 'var(--text-muted)',
                  background: 'rgba(255,255,255,0.03)',
                  padding: '8px',
                  borderRadius: 'var(--radius-sm)',
                  marginTop: '8px',
                }}>
                  ℹ️ Street lighting surveys are currently uncollected by open municipal feeds. Lighting metrics are explicitly omitted to prevent false ratings.
                </div>
              </>
            )}

            {activeTab === 'compare' && (
              <>
                <h3 style={{ fontSize: '14px', color: 'var(--accent-teal)' }}>
                  5-Axis Place Comparison
                </h3>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                  Evaluating Cafe Goodluck vs. Vaishali based on transparent evidence:
                </p>

                <div className="glass-panel" style={{ padding: '12px', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#FFFFFF', marginBottom: '8px' }}>
                    Transparent Dimension Breakdown
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Affordability:</span>
                      <strong style={{ color: 'var(--accent-teal)' }}>Goodluck (₹) &gt; Vaishali (₹₹)</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Cleanliness Audit:</span>
                      <span style={{ color: 'var(--accent-amber)' }}>[Unsurveyed: Ward survey pending]</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Public Rating:</span>
                      <strong>Goodluck (4.4★) | Vaishali (4.5★)</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Transit Proximity:</span>
                      <strong>&lt;50m from FC Road Bus Stop</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Safety Proximity:</span>
                      <strong style={{ color: 'var(--accent-teal)' }}>0 Active Hazards in 250m</strong>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </aside>

        {/* Center: Full-Bleed Interactive Map Canvas */}
        <section style={{ flex: 1, position: 'relative', height: '100%' }}>
          <MapCanvas
            city={selectedCity}
            onSelectMarker={(title, type) => setSelectedPlaceInfo({ title, type })}
          />

          {/* Floating Marker Inspection HUD */}
          {selectedPlaceInfo && (
            <div className="glass-panel" style={{
              position: 'absolute',
              bottom: '24px',
              left: '24px',
              zIndex: 1000,
              padding: '12px 18px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-active)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}>
              <CheckCircle2 size={18} color="var(--accent-teal)" />
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF' }}>
                  {selectedPlaceInfo.title}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                  Selected on Map Engine — Category: {selectedPlaceInfo.type.toUpperCase()}
                </div>
              </div>
              <button
                className="btn-icon"
                onClick={() => setSelectedPlaceInfo(null)}
                style={{ marginLeft: '12px', width: '24px', height: '24px' }}
              >
                ✕
              </button>
            </div>
          )}
        </section>
      </main>

      {/* Outing Planner Modal */}
      {isPlannerOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
        }}>
          <div className="glass-panel" style={{
            width: '480px',
            padding: '24px',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-saffron)',
          }}>
            <h3 style={{ fontSize: '18px', color: 'var(--accent-saffron)', marginBottom: '8px' }}>
              Signature Feature: Pune Outing Orchestrator
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.5' }}>
              Connects historical heritage exploration, street food, current rain probability (60%), and route hazard avoidance in a single verified journey.
            </p>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: 'var(--radius-md)', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div>📍 <strong>Leg 1 (Heritage):</strong> Shaniwar Wada (Peshwa History)</div>
              <div>☕ <strong>Leg 2 (Culinary):</strong> Cafe Goodluck via Shivaji Road</div>
              <div>🛡️ <strong>Safety Routing:</strong> Evaluates route geometry against Alka Talkies flood zone and Navale corridor.</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
              <button className="btn-secondary" onClick={() => setIsPlannerOpen(false)}>Close</button>
              <button className="btn-primary" onClick={() => setIsPlannerOpen(false)}>Launch Journey</button>
            </div>
          </div>
        </div>
      )}

      {/* Citizen Report Modal */}
      {isReportModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
        }}>
          <div className="glass-panel" style={{
            width: '460px',
            padding: '24px',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-active)',
          }}>
            <h3 style={{ fontSize: '18px', color: 'var(--accent-teal)', marginBottom: '8px' }}>
              Submit Citizen Hazard Report
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Report a road hazard, waterlogging, or safety concern with photo and voice note.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input
                type="text"
                placeholder="Incident Title (e.g. Water accumulation near Deccan Gymkhana)"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--border-glass)',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  color: '#FFFFFF',
                  fontSize: '12px',
                }}
              />
              <textarea
                placeholder="Description of conditions observed..."
                rows={3}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--border-glass)',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  color: '#FFFFFF',
                  fontSize: '12px',
                }}
              />
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                📍 Coordinates will be captured from map location. Audio recording and photo drops enabled.
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
              <button className="btn-secondary" onClick={() => setIsReportModalOpen(false)}>Cancel</button>
              <button className="btn-primary" onClick={() => setIsReportModalOpen(false)}>Submit Report</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
