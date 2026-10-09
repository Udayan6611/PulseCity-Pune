import React from 'react';

export type ProvenanceType = 'live' | 'archive' | 'unverified' | 'curated' | 'tier1' | 'tier2';

interface ProvenanceBadgeProps {
  type: ProvenanceType;
  label: string;
  source?: string;
  timestamp?: string;
}

export const ProvenanceBadge: React.FC<ProvenanceBadgeProps> = ({
  type,
  label,
  source,
  timestamp,
}) => {
  const getBadgeClass = () => {
    switch (type) {
      case 'live':
        return 'badge-provenance badge-live';
      case 'archive':
        return 'badge-provenance badge-archive';
      case 'unverified':
        return 'badge-provenance badge-unverified';
      case 'curated':
        return 'badge-provenance badge-curated';
      case 'tier1':
        return 'badge-provenance badge-tier1';
      case 'tier2':
        return 'badge-provenance badge-tier2';
      default:
        return 'badge-provenance badge-curated';
    }
  };

  return (
    <span
      className={getBadgeClass()}
      title={source ? `Source: ${source}${timestamp ? ` (${timestamp})` : ''}` : undefined}
    >
      <span style={{ fontSize: '7px' }}>●</span>
      {label}
    </span>
  );
};
