/**
 * Common UI Components for VeyExpress
 */

import React from 'react';

// Search Bar Component
export interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ placeholder, onSearch }) => {
  const [query, setQuery] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder || 'Search...'}
        className="search-input"
      />
      <button type="submit" className="search-button">🔍</button>
    </form>
  );
};

// Summary Cards Component
export interface SummaryCardsProps {
  summary: {
    activeDeliveries: number;
    delayedDeliveries: number;
    returns: number;
    insuredDeliveries: number;
  };
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ summary }) => {
  return (
    <div className="summary-cards">
      <div className="card">
        <h3>Active Deliveries</h3>
        <div className="value">{summary.activeDeliveries}</div>
      </div>
      <div className="card warning">
        <h3>Delayed</h3>
        <div className="value">{summary.delayedDeliveries}</div>
      </div>
      <div className="card">
        <h3>Returns</h3>
        <div className="value">{summary.returns}</div>
      </div>
      <div className="card success">
        <h3>Insured</h3>
        <div className="value">{summary.insuredDeliveries}</div>
      </div>
    </div>
  );
};

// Integration Status Panel
export interface IntegrationStatusPanelProps {
  integrations: Array<{
    id: string;
    name: string;
    status: 'connected' | 'disconnected' | 'error';
    lastSync?: string;
  }>;
}

export const IntegrationStatusPanel: React.FC<IntegrationStatusPanelProps> = ({ integrations }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return '✅';
      case 'disconnected': return '⚠️';
      case 'error': return '❌';
      default: return '⚪';
    }
  };

  return (
    <div className="integration-status-panel">
      <div className="integrations-grid">
        {integrations.map(integration => (
          <div key={integration.id} className={`integration-card ${integration.status}`}>
            <div className="status-icon">{getStatusIcon(integration.status)}</div>
            <h4>{integration.name}</h4>
            <p className="status">{integration.status}</p>
            {integration.lastSync && (
              <p className="last-sync">Last sync: {integration.lastSync}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// World Map Component (placeholder - would use real map library)
export interface WorldMapProps {
  deliveries: any[];
  apiKey: string;
}

export const WorldMap: React.FC<WorldMapProps> = ({ deliveries, apiKey }) => {
  return (
    <div className="world-map">
      <div className="map-container">
        <div className="map-placeholder">
          🗺️ World Map Visualization
          <p>{deliveries.length} active deliveries</p>
        </div>
      </div>
      <div className="map-legend">
        <div className="legend-item">
          <span className="dot in-transit"></span> In Transit
        </div>
        <div className="legend-item">
          <span className="dot delivered"></span> Delivered
        </div>
        <div className="legend-item">
          <span className="dot delayed"></span> Delayed
        </div>
      </div>
    </div>
  );
};

export default {
  SearchBar,
  SummaryCards,
  IntegrationStatusPanel,
  WorldMap,
};
