/**
 * VeyExpress API Console Screen
 * APIコンソール - API Console
 * 
 * Features:
 * - 8 Core APIs interface
 * - API debugging tools
 * - API usage monitoring
 * - Documentation access
 */

import React, { useState } from 'react';
import { APIEndpoint, APIDebugRequest, APIUsageStats } from '../../../types';

interface APIConsoleScreenProps {
  apiKey: string;
}

const API_ENDPOINTS: APIEndpoint[] = [
  { id: 'tracking', name: 'Tracking API', description: '追跡API / Real-time package tracking' },
  { id: 'waybill', name: 'Waybill API', description: '電子運送状API / Electronic waybill' },
  { id: 'eta', name: 'ETA API', description: '到着予定時刻API / Delivery prediction' },
  { id: 'route', name: 'Route API', description: 'ルートAPI / Route optimization' },
  { id: 'vehicle', name: 'Vehicle Tracking API', description: '車両追跡API / Vehicle tracking' },
  { id: 'ship', name: 'Ship Tracking API', description: '商船追跡API / Ship tracking' },
  { id: 'returns', name: 'Returns API', description: '返品API / Returns management' },
  { id: 'comparison', name: 'Comparison API', description: '比較API / Carrier comparison' },
  { id: 'insurance', name: 'Insurance API', description: '保険API / Shipping insurance' },
];

export const APIConsoleScreen: React.FC<APIConsoleScreenProps> = ({ apiKey }) => {
  const [selectedAPI, setSelectedAPI] = useState<string>('tracking');
  const [debugRequest, setDebugRequest] = useState<string>('');
  const [debugResponse, setDebugResponse] = useState<string>('');
  const [usageStats, setUsageStats] = useState<APIUsageStats | null>(null);

  const handleAPISelect = (apiId: string) => {
    setSelectedAPI(apiId);
    loadAPIUsage(apiId);
  };

  const loadAPIUsage = async (apiId: string) => {
    try {
      const response = await fetch(`/api/console/usage/${apiId}`, {
        headers: { 'Authorization': `Bearer ${apiKey}` }
      });
      const stats = await response.json();
      setUsageStats(stats);
    } catch (error) {
      console.error('Failed to load API usage:', error);
    }
  };

  const handleDebugRequest = async () => {
    try {
      const request = JSON.parse(debugRequest);
      const response = await fetch(`/api/${selectedAPI}/debug`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      });
      const result = await response.json();
      setDebugResponse(JSON.stringify(result, null, 2));
    } catch (error: any) {
      setDebugResponse(`Error: ${error.message}`);
    }
  };

  return (
    <div className="veyexpress-api-console">
      <header className="console-header">
        <h1>API Console</h1>
        <p className="subtitle">APIコンソール</p>
      </header>

      <div className="console-layout">
        {/* API Selection Sidebar */}
        <aside className="api-sidebar">
          <h2>主要API / Core APIs</h2>
          <ul className="api-list">
            {API_ENDPOINTS.map(api => (
              <li
                key={api.id}
                className={selectedAPI === api.id ? 'active' : ''}
                onClick={() => handleAPISelect(api.id)}
              >
                <strong>{api.name}</strong>
                <p>{api.description}</p>
              </li>
            ))}
          </ul>
        </aside>

        {/* Main Console Area */}
        <main className="console-main">
          {/* API Debug Section */}
          <section className="debug-section">
            <h2>APIデバッグ / API Debug</h2>
            <div className="debug-panel">
              <div className="request-panel">
                <h3>Request</h3>
                <textarea
                  className="debug-input"
                  value={debugRequest}
                  onChange={(e) => setDebugRequest(e.target.value)}
                  placeholder='{"method": "GET", "endpoint": "/tracking/TRACK123"}'
                  rows={10}
                />
                <button onClick={handleDebugRequest}>Send Request</button>
              </div>
              <div className="response-panel">
                <h3>Response</h3>
                <pre className="debug-output">{debugResponse || 'No response yet'}</pre>
              </div>
            </div>
          </section>

          {/* API Usage Monitoring */}
          <section className="usage-section">
            <h2>API利用状況 / API Usage Monitor</h2>
            {usageStats && (
              <div className="usage-stats">
                <div className="stat-card">
                  <label>Total Requests (24h)</label>
                  <span className="stat-value">{usageStats.requests24h.toLocaleString()}</span>
                </div>
                <div className="stat-card">
                  <label>Success Rate</label>
                  <span className="stat-value">{(usageStats.successRate * 100).toFixed(2)}%</span>
                </div>
                <div className="stat-card">
                  <label>Avg Response Time</label>
                  <span className="stat-value">{usageStats.avgResponseTime}ms</span>
                </div>
                <div className="stat-card">
                  <label>Rate Limit Remaining</label>
                  <span className="stat-value">{usageStats.rateLimitRemaining}</span>
                </div>
              </div>
            )}
          </section>

          {/* API Documentation Link */}
          <section className="documentation-section">
            <h2>APIドキュメント / API Documentation</h2>
            <div className="doc-links">
              <a href={`/docs/api/${selectedAPI}`} target="_blank" rel="noopener noreferrer">
                View {selectedAPI} API Documentation →
              </a>
              <a href="/docs/api/reference" target="_blank" rel="noopener noreferrer">
                Complete API Reference →
              </a>
              <a href="/docs/api/quickstart" target="_blank" rel="noopener noreferrer">
                Quick Start Guide →
              </a>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default APIConsoleScreen;
