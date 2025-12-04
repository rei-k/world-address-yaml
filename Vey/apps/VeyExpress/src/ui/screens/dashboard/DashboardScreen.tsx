/**
 * VeyExpress Dashboard Screen
 * 総合ダッシュボード - Comprehensive Dashboard
 * 
 * Features:
 * - Delivery number search (配達番号検索)
 * - Delivery summary (配送サマリー)
 * - Integration status (接続状態)
 * - World map visualization
 */

import React, { useState, useEffect } from 'react';
import { DashboardSummary, IntegrationStatus, DeliverySearchResult } from '../../../types';
import { SearchBar } from '../../components/SearchBar';
import { SummaryCards } from '../../components/SummaryCards';
import { IntegrationStatusPanel } from '../../components/IntegrationStatusPanel';
import { WorldMap } from '../../components/WorldMap';

interface DashboardScreenProps {
  onSearch?: (query: string) => void;
  apiKey: string;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ onSearch, apiKey }) => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [integrations, setIntegrations] = useState<IntegrationStatus[]>([]);
  const [searchResults, setSearchResults] = useState<DeliverySearchResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Load dashboard summary
      const summaryResponse = await fetch('/api/dashboard/summary', {
        headers: { 'Authorization': `Bearer ${apiKey}` }
      });
      const summaryData = await summaryResponse.json();
      setSummary(summaryData);

      // Load integration status
      const integrationsResponse = await fetch('/api/dashboard/integrations', {
        headers: { 'Authorization': `Bearer ${apiKey}` }
      });
      const integrationsData = await integrationsResponse.json();
      setIntegrations(integrationsData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    if (onSearch) {
      onSearch(query);
    }

    try {
      const response = await fetch(`/api/dashboard/search?q=${encodeURIComponent(query)}`, {
        headers: { 'Authorization': `Bearer ${apiKey}` }
      });
      const results = await response.json();
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="veyexpress-dashboard">
      <header className="dashboard-header">
        <h1>VeyExpress Dashboard</h1>
        <p className="subtitle">総合ダッシュボード</p>
      </header>

      {/* Delivery Number Search */}
      <section className="search-section">
        <SearchBar
          placeholder="配達番号で検索 / Search by delivery number..."
          onSearch={handleSearch}
        />
        {searchResults.length > 0 && (
          <div className="search-results">
            {searchResults.map(result => (
              <div key={result.trackingNumber} className="search-result-item">
                <span className="tracking-number">{result.trackingNumber}</span>
                <span className="status">{result.status}</span>
                <span className="carrier">{result.carrier}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Delivery Summary Cards */}
      {summary && (
        <section className="summary-section">
          <h2>配送サマリー / Delivery Summary</h2>
          <SummaryCards summary={summary} />
        </section>
      )}

      {/* Integration Status */}
      <section className="integration-section">
        <h2>接続状態 / Integration Status</h2>
        <IntegrationStatusPanel integrations={integrations} />
      </section>

      {/* World Map */}
      <section className="map-section">
        <h2>配送状況 / Delivery Status Map</h2>
        <WorldMap 
          deliveries={summary?.activeDeliveries || []}
          apiKey={apiKey}
        />
      </section>
    </div>
  );
};

export default DashboardScreen;
