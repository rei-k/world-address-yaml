/**
 * VeyExpress Value-Added Services Screen
 * 付加価値サービス
 * 
 * Features:
 * - Shipping cost calculator
 * - Bulk delivery processing
 * - Shipping insurance management
 * - Logistics service purchasing
 * - Carbon offset tracking
 */

import React, { useState } from 'react';
import { ShippingQuote, InsurancePolicy, BulkShipment } from '../../../types';

interface ValueServicesScreenProps {
  apiKey: string;
}

export const ValueServicesScreen: React.FC<ValueServicesScreenProps> = ({ apiKey }) => {
  const [shippingQuote, setShippingQuote] = useState<ShippingQuote | null>(null);
  const [bulkUploadFile, setBulkUploadFile] = useState<File | null>(null);

  const calculateShippingCost = async (params: any) => {
    try {
      const response = await fetch('/api/services/calculate-shipping', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
      });
      const quote = await response.json();
      setShippingQuote(quote);
    } catch (error) {
      console.error('Failed to calculate shipping cost:', error);
    }
  };

  const handleBulkUpload = async () => {
    if (!bulkUploadFile) return;

    const formData = new FormData();
    formData.append('file', bulkUploadFile);

    try {
      const response = await fetch('/api/services/bulk-shipment', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`
        },
        body: formData
      });
      const result = await response.json();
      console.log('Bulk upload result:', result);
    } catch (error) {
      console.error('Failed to upload bulk shipments:', error);
    }
  };

  return (
    <div className="veyexpress-value-services">
      <header className="services-header">
        <h1>Value-Added Services</h1>
        <p className="subtitle">付加価値サービス</p>
      </header>

      {/* Shipping Cost Calculator */}
      <section className="shipping-calculator">
        <h2>配送料金計算 / Shipping Cost Calculator</h2>
        <div className="calculator-panel">
          <div className="calculator-form">
            <div className="form-row">
              <div className="form-group">
                <label>Origin Country</label>
                <select>
                  <option value="US">United States</option>
                  <option value="JP">Japan</option>
                  <option value="CN">China</option>
                </select>
              </div>
              <div className="form-group">
                <label>Destination Country</label>
                <select>
                  <option value="JP">Japan</option>
                  <option value="US">United States</option>
                  <option value="GB">United Kingdom</option>
                </select>
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Weight (kg)</label>
                <input type="number" placeholder="2.5" step="0.1" />
              </div>
              <div className="form-group">
                <label>Dimensions (cm)</label>
                <div className="dimensions-input">
                  <input type="number" placeholder="L" />
                  <span>×</span>
                  <input type="number" placeholder="W" />
                  <span>×</span>
                  <input type="number" placeholder="H" />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>Service Level</label>
              <select>
                <option value="express">Express (1-2 days)</option>
                <option value="standard">Standard (3-5 days)</option>
                <option value="economy">Economy (7-10 days)</option>
              </select>
            </div>

            <button onClick={() => calculateShippingCost({})}>Calculate Shipping Cost</button>
          </div>

          {shippingQuote && (
            <div className="quote-results">
              <h3>Shipping Quotes</h3>
              {shippingQuote.carriers.map(carrier => (
                <div key={carrier.carrierId} className="quote-card">
                  <div className="carrier-info">
                    <strong>{carrier.name}</strong>
                    <span className="service">{carrier.serviceLevel}</span>
                  </div>
                  <div className="quote-details">
                    <div className="price">${carrier.price.toFixed(2)}</div>
                    <div className="eta">{carrier.estimatedDays} days</div>
                  </div>
                  <button className="select-btn">Select</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Bulk Delivery Processing */}
      <section className="bulk-processing">
        <h2>大量配送一括処理 / Bulk Delivery Processing</h2>
        <div className="bulk-upload-panel">
          <div className="upload-area">
            <div className="upload-icon">📤</div>
            <p>Upload CSV or Excel file with shipment data</p>
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={(e) => setBulkUploadFile(e.target.files?.[0] || null)}
            />
            {bulkUploadFile && (
              <div className="file-info">
                Selected: {bulkUploadFile.name}
              </div>
            )}
          </div>
          <div className="bulk-features">
            <h4>Features:</h4>
            <ul>
              <li>✅ Process up to 10,000 shipments at once</li>
              <li>✅ Automatic address validation</li>
              <li>✅ Batch waybill generation</li>
              <li>✅ Carrier assignment optimization</li>
              <li>✅ Real-time progress tracking</li>
            </ul>
          </div>
          <button onClick={handleBulkUpload} disabled={!bulkUploadFile}>
            Upload and Process
          </button>
        </div>

        <div className="bulk-templates">
          <h4>Download Templates:</h4>
          <button>CSV Template</button>
          <button>Excel Template</button>
        </div>
      </section>

      {/* Shipping Insurance */}
      <section className="shipping-insurance">
        <h2>配送保険、保険管理 / Shipping Insurance Management</h2>
        <div className="insurance-panel">
          <div className="insurance-info">
            <h3>Protect Your Shipments</h3>
            <p>Comprehensive coverage for lost, damaged, or stolen packages</p>
            <ul>
              <li>Coverage up to $10,000 per shipment</li>
              <li>24/7 claims support</li>
              <li>Fast claim processing (48 hours)</li>
              <li>Competitive rates starting at 0.5%</li>
            </ul>
          </div>
          
          <div className="insurance-calculator">
            <h4>Calculate Insurance Cost</h4>
            <div className="form-group">
              <label>Shipment Value (USD)</label>
              <input type="number" placeholder="1000.00" />
            </div>
            <div className="form-group">
              <label>Coverage Type</label>
              <select>
                <option value="basic">Basic (Loss only)</option>
                <option value="standard">Standard (Loss + Damage)</option>
                <option value="premium">Premium (Full coverage)</option>
              </select>
            </div>
            <button>Get Insurance Quote</button>
          </div>
        </div>

        <div className="active-policies">
          <h3>Active Policies</h3>
          <table className="policies-table">
            <thead>
              <tr>
                <th>Policy ID</th>
                <th>Tracking Number</th>
                <th>Coverage</th>
                <th>Premium</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>POL-20241204-001</td>
                <td>TRACK123456</td>
                <td>$5,000</td>
                <td>$25.00</td>
                <td><span className="status active">Active</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Logistics Service Purchasing */}
      <section className="service-marketplace">
        <h2>物流付加価値サービスの購入 / Logistics Service Purchasing</h2>
        <div className="services-grid">
          <div className="service-card">
            <h3>White Glove Delivery</h3>
            <p>Premium delivery with installation</p>
            <div className="price">From $50</div>
            <button>Purchase</button>
          </div>
          <div className="service-card">
            <h3>Temperature Controlled</h3>
            <p>Cold chain logistics</p>
            <div className="price">From $30</div>
            <button>Purchase</button>
          </div>
          <div className="service-card">
            <h3>Same-Day Delivery</h3>
            <p>Ultra-fast local delivery</p>
            <div className="price">From $20</div>
            <button>Purchase</button>
          </div>
          <div className="service-card">
            <h3>Gift Wrapping</h3>
            <p>Professional gift packaging</p>
            <div className="price">From $5</div>
            <button>Purchase</button>
          </div>
        </div>
      </section>

      {/* Carbon Offset */}
      <section className="carbon-offset">
        <h2>カーボンオフセット / Carbon Offset Tracking</h2>
        <div className="carbon-info">
          <div className="carbon-stats">
            <div className="stat-card">
              <label>Total CO₂ Emissions (This Month)</label>
              <span className="value">1,234 kg</span>
            </div>
            <div className="stat-card">
              <label>Carbon Offset Purchased</label>
              <span className="value">800 kg</span>
            </div>
            <div className="stat-card">
              <label>Net Carbon Footprint</label>
              <span className="value warning">434 kg</span>
            </div>
          </div>
          <button className="offset-btn">Purchase Carbon Offset Credits</button>
        </div>
      </section>
    </div>
  );
};

export default ValueServicesScreen;
