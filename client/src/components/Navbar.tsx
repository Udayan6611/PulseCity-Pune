import React from 'react';
import { CityConfig } from '../types/city';
import { ProvenanceBadge } from './ProvenanceBadge';
import { MapPin, ShieldAlert, Sparkles, Activity } from 'lucide-react';

interface NavbarProps {
  cities: CityConfig[];
  selectedCity: CityConfig;
  onSelectCity: (city: CityConfig) => void;
  isLiveBackend: boolean;
  onOpenReportModal: () => void;
  onOpenPlannerModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cities,
  selectedCity,
  onSelectCity,
  isLiveBackend,
  onOpenReportModal,
  onOpenPlannerModal,
}) => {
  return (
    <header className="glass-panel" style={{
      height: '64px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px',
      zIndex: 1000,
      position: 'relative',
      borderBottom: '1px solid var(--border-glass)',
    }}>
      {/* Brand Identity */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '38px',
          height: '38px',
          borderRadius: 'var(--radius-md)',
          background: 'linear-gradient(135deg, var(--accent-saffron), #9E2A2B)',
          boxShadow: '0 0 16px var(--accent-saffron-glow)',
        }}>
          <Activity size={22} color="#FFFFFF" />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '19px',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              background: 'linear-gradient(90deg, #FFFFFF, var(--text-saffron))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              PulseCity
            </span>
            <span style={{
              fontSize: '13px',
              color: 'var(--accent-saffron)',
              fontWeight: 600,
              fontFamily: 'var(--font-heading)',
            }}>
              {selectedCity.nativeName}
            </span>
          </div>
          <span style={{
            fontSize: '10px',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}>
            Living City Operating System
          </span>
        </div>
      </div>

      {/* Center: City Switcher & Tier Indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid var(--border-glass)',
          borderRadius: 'var(--radius-md)',
          padding: '4px 10px',
          gap: '8px',
        }}>
          <MapPin size={16} color="var(--accent-teal)" />
          <select
            id="city-selector"
            value={selectedCity.id}
            onChange={(e) => {
              const target = cities.find(c => c.id === e.target.value);
              if (target) onSelectCity(target);
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-heading)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            {cities.map((city) => (
              <option key={city.id} value={city.id} style={{ background: '#0F172A', color: '#F8FAFC' }}>
                {city.name} ({city.nativeName}) — {city.coverageTier === 1 ? 'Tier 1' : 'Tier 2'}
              </option>
            ))}
          </select>

          <ProvenanceBadge
            type={selectedCity.coverageTier === 1 ? 'tier1' : 'tier2'}
            label={selectedCity.tierLabel}
            source="City Manifest Engine"
          />
        </div>

        {/* Backend Connectivity Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {isLiveBackend ? (
            <ProvenanceBadge
              type="live"
              label="API: ONLINE (Port 5000)"
              source="Native node:sqlite Database"
            />
          ) : (
            <ProvenanceBadge
              type="archive"
              label="MODE: STANDALONE CLIENT"
              source="Local Resilient Manifest"
            />
          )}
        </div>
      </div>

      {/* Right Action Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button
          id="btn-outing-planner"
          className="btn-secondary"
          onClick={onOpenPlannerModal}
          title="Signature Feature: Pune Outing & Safe Return Orchestrator"
        >
          <Sparkles size={15} color="var(--accent-amber)" />
          <span>Outing Planner</span>
        </button>

        <button
          id="btn-report-hazard"
          className="btn-primary"
          onClick={onOpenReportModal}
          title="Submit a verified or unverified civic report with photo & voice note"
        >
          <ShieldAlert size={16} />
          <span>Report Hazard</span>
        </button>
      </div>
    </header>
  );
};
