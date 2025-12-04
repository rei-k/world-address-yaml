/**
 * VeyExpress Cross-Border Delivery Screen
 * 越境配送 / マルチモーダル
 * 
 * Features:
 * - Multi-modal transport (Parcel/3PL/4PL/Sea/Rail/Air)
 * - International tracking
 * - Customs calculation
 * - Tax calculator
 * - HS code support
 * - Multi-language documentation
 */

import React, { useState } from 'react';
import { CrossBorderShipment, CustomsInfo, TransportMode } from '../../../types';

interface CrossBorderScreenProps {
  apiKey: string;
}

export const CrossBorderScreen: React.FC<CrossBorderScreenProps> = ({ apiKey }) => {
  const [selectedMode, setSelectedMode] = useState<TransportMode>('PARCEL');
  const [customsCalculation, setCustomsCalculation] = useState<any>(null);

  const transportModes = [
    { id: 'PARCEL', name: '小包 / Parcel', icon: '📦', description: 'Standard parcel delivery' },
    { id: '3PL', name: '3PL', icon: '🚚', description: 'Third-party logistics' },
    { id: '4PL', name: '4PL', icon: '🏢', description: 'Fourth-party logistics' },
    { id: 'SEA', name: '海上 / Sea', icon: '🚢', description: 'Ocean freight' },
    { id: 'RAIL', name: '鉄道 / Rail', icon: '🚄', description: 'Rail transport' },
    { id: 'AIR', name: '航空 / Air', icon: '✈️', description: 'Air freight' },
  ];

  const calculateCustoms = async (shipment: CrossBorderShipment) => {
    try {
      const response = await fetch('/api/cross-border/customs/calculate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(shipment)
      });
      const result = await response.json();
      setCustomsCalculation(result);
    } catch (error) {
      console.error('Failed to calculate customs:', error);
    }
  };

  return (
    <div className="veyexpress-cross-border">
      <header className="cross-border-header">
        <h1>Cross-Border Delivery</h1>
        <p className="subtitle">越境配送 / マルチモーダル</p>
      </header>

      {/* Transport Mode Selection */}
      <section className="transport-modes">
        <h2>配送手段 / Transport Modes</h2>
        <div className="modes-grid">
          {transportModes.map(mode => (
            <div
              key={mode.id}
              className={`mode-card ${selectedMode === mode.id ? 'active' : ''}`}
              onClick={() => setSelectedMode(mode.id as TransportMode)}
            >
              <div className="mode-icon">{mode.icon}</div>
              <h3>{mode.name}</h3>
              <p>{mode.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* International Tracking */}
      <section className="international-tracking">
        <h2>国際追跡 / International Tracking</h2>
        <div className="tracking-features">
          <div className="feature-item">
            <h4>Multi-carrier Integration</h4>
            <p>Track across 100+ international carriers</p>
          </div>
          <div className="feature-item">
            <h4>Real-time Updates</h4>
            <p>Live tracking updates from origin to destination</p>
          </div>
          <div className="feature-item">
            <h4>Customs Clearance Tracking</h4>
            <p>Monitor customs clearance progress</p>
          </div>
          <div className="feature-item">
            <h4>Multi-language Support</h4>
            <p>254 countries with local language support</p>
          </div>
        </div>
      </section>

      {/* Customs & Tax Calculator */}
      <section className="customs-calculator">
        <h2>関税/税金 計算機 / Customs & Tax Calculator</h2>
        <div className="calculator-panel">
          <div className="calculator-form">
            <div className="form-group">
              <label>Origin Country</label>
              <select>
                <option value="US">United States</option>
                <option value="JP">Japan</option>
                <option value="CN">China</option>
                {/* Add more countries */}
              </select>
            </div>
            <div className="form-group">
              <label>Destination Country</label>
              <select>
                <option value="JP">Japan</option>
                <option value="US">United States</option>
                <option value="GB">United Kingdom</option>
                {/* Add more countries */}
              </select>
            </div>
            <div className="form-group">
              <label>Item Value (USD)</label>
              <input type="number" placeholder="100.00" />
            </div>
            <div className="form-group">
              <label>HS Code</label>
              <input type="text" placeholder="8471.30.0100" />
            </div>
            <button className="calculate-btn">Calculate Duties & Taxes</button>
          </div>
          
          {customsCalculation && (
            <div className="calculation-result">
              <h3>Calculation Result</h3>
              <div className="result-row">
                <label>Item Value:</label>
                <span>${customsCalculation.itemValue}</span>
              </div>
              <div className="result-row">
                <label>Import Duty:</label>
                <span>${customsCalculation.importDuty}</span>
              </div>
              <div className="result-row">
                <label>VAT/GST:</label>
                <span>${customsCalculation.vat}</span>
              </div>
              <div className="result-row total">
                <label>Total Landed Cost:</label>
                <span>${customsCalculation.totalCost}</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* HS Code Support */}
      <section className="hs-code-section">
        <h2>HS Code Support</h2>
        <div className="hs-code-info">
          <p>
            Harmonized System (HS) codes are used to classify goods for international trade.
            VeyExpress provides automatic HS code lookup and validation.
          </p>
          <div className="hs-code-features">
            <div className="feature">✅ 21,000+ HS codes database</div>
            <div className="feature">✅ AI-powered HS code suggestions</div>
            <div className="feature">✅ Country-specific tariff rates</div>
            <div className="feature">✅ Compliance validation</div>
          </div>
        </div>
      </section>

      {/* International Order Management */}
      <section className="international-orders">
        <h2>国際オーダー管理 / International Order Management</h2>
        <div className="order-features">
          <div className="feature-card">
            <h4>Multi-currency Support</h4>
            <p>Handle 150+ currencies automatically</p>
          </div>
          <div className="feature-card">
            <h4>Documentation</h4>
            <p>Auto-generate commercial invoices, packing lists</p>
          </div>
          <div className="feature-card">
            <h4>Compliance</h4>
            <p>Export control and sanctions screening</p>
          </div>
          <div className="feature-card">
            <h4>Local Regulations</h4>
            <p>Country-specific shipping requirements</p>
          </div>
        </div>
      </section>

      {/* Multi-language Documentation */}
      <section className="documentation-section">
        <h2>多言語ドキュメント / Multi-language Documentation</h2>
        <div className="documentation-grid">
          <div className="doc-card">
            <h4>Commercial Invoice</h4>
            <p>Available in 50+ languages</p>
            <button>Generate</button>
          </div>
          <div className="doc-card">
            <h4>Customs Declaration</h4>
            <p>Country-specific formats</p>
            <button>Generate</button>
          </div>
          <div className="doc-card">
            <h4>Certificate of Origin</h4>
            <p>Automated generation</p>
            <button>Generate</button>
          </div>
          <div className="doc-card">
            <h4>Packing List</h4>
            <p>Multi-language support</p>
            <button>Generate</button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CrossBorderScreen;
