/**
 * VeyExpress Hardware Integration Screen
 * Hardware 連動 / 現場連携
 * 
 * Features:
 * - Smart hardware integration (Sorting/OCR/Terminals)
 * - QR/NFC code generation (Enterprise/Store/Branch/Facility/Personal)
 * - GDPR/CCPA compliance
 * - Recipient UX (delivery time/place change)
 * - Multi-language address support (254 countries)
 * - Multi-channel notifications
 */

import React, { useState } from 'react';
import { QRCodeType, HardwareDevice, NotificationChannel } from '../../../types';

interface HardwareScreenProps {
  apiKey: string;
}

export const HardwareScreen: React.FC<HardwareScreenProps> = ({ apiKey }) => {
  const [selectedQRType, setSelectedQRType] = useState<QRCodeType>('ENTERPRISE');
  const [qrCodeData, setQRCodeData] = useState<string>('');
  const [devices, setDevices] = useState<HardwareDevice[]>([]);

  const qrTypes = [
    { id: 'ENTERPRISE', name: '企業QR / Enterprise QR', icon: '🏢', description: 'Company-wide QR codes' },
    { id: 'STORE', name: '店舗QR / Store QR', icon: '🏪', description: 'Store-specific codes' },
    { id: 'BRANCH', name: '分岐QR / Branch QR', icon: '🏬', description: 'Branch location codes' },
    { id: 'FACILITY', name: '施設QR / Facility QR', icon: '🏭', description: 'Facility codes' },
    { id: 'PERSONAL', name: '個人QR / Personal QR', icon: '👤', description: 'Personal delivery codes' },
  ];

  const hardwareTypes = [
    { id: 'SORTING', name: 'Sorting Machine', icon: '📦', description: 'Automated package sorting' },
    { id: 'OCR', name: 'OCR Scanner', icon: '🔍', description: 'Optical character recognition' },
    { id: 'TERMINAL', name: 'Smart Terminal', icon: '💻', description: 'Delivery confirmation terminals' },
    { id: 'LOCKER', name: 'Smart Locker', icon: '🔐', description: 'Automated pickup lockers' },
  ];

  const generateQRCode = async (type: QRCodeType, data: any) => {
    try {
      const response = await fetch('/api/hardware/qr/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ type, data })
      });
      const result = await response.json();
      setQRCodeData(result.qrCode);
    } catch (error) {
      console.error('Failed to generate QR code:', error);
    }
  };

  return (
    <div className="veyexpress-hardware">
      <header className="hardware-header">
        <h1>Hardware Integration</h1>
        <p className="subtitle">Hardware 連動 / 現場連携</p>
      </header>

      {/* Smart Hardware */}
      <section className="smart-hardware">
        <h2>スマートハードウェア / Smart Hardware</h2>
        <div className="hardware-grid">
          {hardwareTypes.map(hw => (
            <div key={hw.id} className="hardware-card">
              <div className="hw-icon">{hw.icon}</div>
              <h3>{hw.name}</h3>
              <p>{hw.description}</p>
              <div className="hw-status">
                <span className="status-indicator connected"></span>
                <span>Connected</span>
              </div>
              <button>Configure</button>
            </div>
          ))}
        </div>

        <div className="hardware-features">
          <h3>Features:</h3>
          <ul>
            <li>✅ Real-time device monitoring</li>
            <li>✅ Automated package processing</li>
            <li>✅ OCR address recognition</li>
            <li>✅ Terminal integration for delivery confirmation</li>
            <li>✅ Smart locker management</li>
          </ul>
        </div>
      </section>

      {/* QR/NFC Code Generation */}
      <section className="qr-nfc-generation">
        <h2>QR/NFC 発行 / QR/NFC Code Generation</h2>
        
        <div className="qr-type-selector">
          <h3>Select QR Code Type:</h3>
          <div className="qr-types-grid">
            {qrTypes.map(type => (
              <div
                key={type.id}
                className={`qr-type-card ${selectedQRType === type.id ? 'active' : ''}`}
                onClick={() => setSelectedQRType(type.id as QRCodeType)}
              >
                <div className="qr-icon">{type.icon}</div>
                <strong>{type.name}</strong>
                <p>{type.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="qr-generator-panel">
          <div className="generator-form">
            <h3>Generate {selectedQRType} QR Code</h3>
            <div className="form-group">
              <label>Code ID</label>
              <input type="text" placeholder="Enter unique identifier" />
            </div>
            <div className="form-group">
              <label>Display Name</label>
              <input type="text" placeholder="Enter display name" />
            </div>
            <div className="form-group">
              <label>Delivery Address (PID)</label>
              <input type="text" placeholder="JP-13-113-01-T07-B12" />
            </div>
            <div className="form-group">
              <label>NFC Enabled</label>
              <input type="checkbox" /> Enable NFC tag
            </div>
            <button onClick={() => generateQRCode(selectedQRType, {})}>
              Generate Code
            </button>
          </div>

          {qrCodeData && (
            <div className="qr-code-preview">
              <h3>Generated QR Code</h3>
              <div className="qr-code-image">
                <img src={qrCodeData} alt="QR Code" />
              </div>
              <div className="qr-actions">
                <button>Download PNG</button>
                <button>Download SVG</button>
                <button>Print</button>
              </div>
            </div>
          )}
        </div>

        <div className="qr-templates">
          <h3>QRテンプレート販売 / QR Template Marketplace</h3>
          <p>Purchase pre-designed QR code templates for various use cases</p>
          <div className="template-grid">
            <div className="template-card">
              <h4>Enterprise Package</h4>
              <p>100 customized QR codes</p>
              <div className="price">$99/month</div>
              <button>Purchase</button>
            </div>
            <div className="template-card">
              <h4>Store Package</h4>
              <p>50 store QR codes</p>
              <div className="price">$49/month</div>
              <button>Purchase</button>
            </div>
            <div className="template-card">
              <h4>Facility Package</h4>
              <p>Unlimited facility codes</p>
              <div className="price">$149/month</div>
              <button>Purchase</button>
            </div>
          </div>
        </div>
      </section>

      {/* GDPR/CCPA Compliance */}
      <section className="compliance">
        <h2>コンプライアンス / Compliance</h2>
        <div className="compliance-panel">
          <h3>GDPR/CCPA 対応のデータアクセス制御</h3>
          <div className="compliance-features">
            <div className="compliance-card">
              <h4>Data Access Control</h4>
              <p>Granular access permissions based on GDPR/CCPA requirements</p>
              <ul>
                <li>✅ Right to access</li>
                <li>✅ Right to erasure</li>
                <li>✅ Right to rectification</li>
                <li>✅ Data portability</li>
              </ul>
            </div>
            <div className="compliance-card">
              <h4>Audit Logging</h4>
              <p>Complete audit trail of all data access and modifications</p>
              <ul>
                <li>✅ Encrypted audit logs</li>
                <li>✅ Tamper-proof records</li>
                <li>✅ Compliance reporting</li>
              </ul>
            </div>
            <div className="compliance-card">
              <h4>Consent Management</h4>
              <p>Track and manage user consent preferences</p>
              <ul>
                <li>✅ Consent tracking</li>
                <li>✅ Opt-in/opt-out management</li>
                <li>✅ Cookie policy enforcement</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Recipient UX */}
      <section className="recipient-ux">
        <h2>受取人UX / Recipient User Experience</h2>
        
        <div className="recipient-features">
          <div className="feature-card">
            <h3>配送時間・場所変更 / Delivery Time & Place Change</h3>
            <p>Recipients can modify delivery preferences up to 2 hours before delivery</p>
            <ul>
              <li>Change delivery time window</li>
              <li>Select alternative delivery location</li>
              <li>Choose locker pickup</li>
              <li>Authorize alternative recipient</li>
            </ul>
            <button>Configure UX</button>
          </div>

          <div className="feature-card">
            <h3>多言語住所補完 / Multi-language Address Autocomplete</h3>
            <p>254-country address autocomplete in local languages</p>
            <div className="language-support">
              <span>🌍 254 countries</span>
              <span>🗣️ 100+ languages</span>
              <span>✅ Local formats</span>
            </div>
            <button>View Supported Countries</button>
          </div>

          <div className="feature-card">
            <h3>Multi-channel通知センター / Multi-channel Notifications</h3>
            <p>Send delivery updates via multiple channels</p>
            <div className="notification-channels">
              <div className="channel">📧 Email</div>
              <div className="channel">📱 SMS</div>
              <div className="channel">🔔 Push Notification</div>
              <div className="channel">💬 WhatsApp</div>
              <div className="channel">📞 Voice Call</div>
            </div>
            <button>Configure Channels</button>
          </div>
        </div>
      </section>

      {/* Active Devices */}
      <section className="active-devices">
        <h2>接続デバイス / Connected Devices</h2>
        <table className="devices-table">
          <thead>
            <tr>
              <th>Device ID</th>
              <th>Type</th>
              <th>Location</th>
              <th>Status</th>
              <th>Last Sync</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>DEV-SORT-001</td>
              <td>Sorting Machine</td>
              <td>Warehouse A</td>
              <td><span className="status online">Online</span></td>
              <td>2 minutes ago</td>
              <td><button>Settings</button></td>
            </tr>
            <tr>
              <td>DEV-OCR-002</td>
              <td>OCR Scanner</td>
              <td>Distribution Center</td>
              <td><span className="status online">Online</span></td>
              <td>5 minutes ago</td>
              <td><button>Settings</button></td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default HardwareScreen;
