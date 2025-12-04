/**
 * VeyExpress EC/Store Integration Screen
 * EC / 店舗連携画面
 * 
 * Features:
 * - EC Platform Integration (Shopify, WooCommerce, Magento)
 * - Order/Return/Exchange processing
 * - Shipping tracking
 * - Store delivery & POS integration
 * - O2O (Online to Offline) support
 */

import React, { useState } from 'react';
import { ECPlatform, StoreIntegration } from '../../../types';

interface ECIntegrationScreenProps {
  apiKey: string;
}

type IntegrationType = 'EC' | 'STORE';

export const ECIntegrationScreen: React.FC<ECIntegrationScreenProps> = ({ apiKey }) => {
  const [integrationType, setIntegrationType] = useState<IntegrationType>('EC');
  const [connectedPlatforms, setConnectedPlatforms] = useState<ECPlatform[]>([]);
  const [storeIntegrations, setStoreIntegrations] = useState<StoreIntegration[]>([]);

  const ecPlatforms = [
    { id: 'shopify', name: 'Shopify', icon: '🛍️', status: 'connected' },
    { id: 'woocommerce', name: 'WooCommerce', icon: '🛒', status: 'available' },
    { id: 'magento', name: 'Magento', icon: '🏪', status: 'available' },
    { id: 'bigcommerce', name: 'BigCommerce', icon: '🏬', status: 'available' },
    { id: 'custom', name: 'Custom Integration', icon: '⚙️', status: 'available' },
  ];

  const handleConnectPlatform = async (platformId: string) => {
    try {
      const response = await fetch(`/api/integration/ec/connect/${platformId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ platformId })
      });
      const result = await response.json();
      console.log('Platform connected:', result);
      // Reload connected platforms
      loadConnectedPlatforms();
    } catch (error) {
      console.error('Failed to connect platform:', error);
    }
  };

  const loadConnectedPlatforms = async () => {
    try {
      const response = await fetch('/api/integration/ec/connected', {
        headers: { 'Authorization': `Bearer ${apiKey}` }
      });
      const platforms = await response.json();
      setConnectedPlatforms(platforms);
    } catch (error) {
      console.error('Failed to load connected platforms:', error);
    }
  };

  const generatePlugin = async (platformId: string) => {
    try {
      const response = await fetch(`/api/integration/ec/generate-plugin/${platformId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      const result = await response.json();
      
      // Download plugin file
      const blob = new Blob([result.pluginCode], { type: 'application/zip' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `veyexpress-${platformId}-plugin.zip`;
      a.click();
    } catch (error) {
      console.error('Failed to generate plugin:', error);
    }
  };

  return (
    <div className="veyexpress-ec-integration">
      <header className="integration-header">
        <h1>EC / Store Integration</h1>
        <p className="subtitle">EC / 店舗連携画面</p>
      </header>

      <div className="integration-tabs">
        <button
          className={integrationType === 'EC' ? 'active' : ''}
          onClick={() => setIntegrationType('EC')}
        >
          EC連携 / EC Integration
        </button>
        <button
          className={integrationType === 'STORE' ? 'active' : ''}
          onClick={() => setIntegrationType('STORE')}
        >
          店舗連携 / Store Integration
        </button>
      </div>

      {integrationType === 'EC' && (
        <div className="ec-integration-content">
          <section className="platforms-section">
            <h2>利用可能なプラットフォーム / Available Platforms</h2>
            <div className="platforms-grid">
              {ecPlatforms.map(platform => (
                <div key={platform.id} className="platform-card">
                  <div className="platform-icon">{platform.icon}</div>
                  <h3>{platform.name}</h3>
                  <p className={`status ${platform.status}`}>{platform.status}</p>
                  <div className="platform-actions">
                    {platform.status === 'available' && (
                      <button onClick={() => handleConnectPlatform(platform.id)}>
                        Connect
                      </button>
                    )}
                    {platform.status === 'connected' && (
                      <>
                        <button className="secondary">Settings</button>
                        <button onClick={() => generatePlugin(platform.id)}>
                          Generate Plugin
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="auto-plugin-section">
            <h2>自動プラグイン生成 / Auto Plugin Generation</h2>
            <div className="plugin-info">
              <p>
                VeyExpressの1コードSDKから、各ECプラットフォーム向けのプラグインを自動生成できます。
              </p>
              <p>
                Generate plugins automatically from VeyExpress 1-code SDK for each EC platform.
              </p>
              <ul>
                <li>✅ Shopify App Store ready</li>
                <li>✅ WooCommerce Plugin</li>
                <li>✅ Magento Extension</li>
                <li>✅ Custom CMS adapters</li>
              </ul>
            </div>
          </section>

          <section className="order-management-section">
            <h2>注文/返品/交換処理 / Order/Return/Exchange Processing</h2>
            <div className="process-flow">
              <div className="flow-step">
                <h4>1. Order Sync</h4>
                <p>Automatic order synchronization</p>
              </div>
              <div className="flow-step">
                <h4>2. Shipping Label</h4>
                <p>Waybill generation</p>
              </div>
              <div className="flow-step">
                <h4>3. Tracking</h4>
                <p>Real-time tracking updates</p>
              </div>
              <div className="flow-step">
                <h4>4. Delivery</h4>
                <p>Delivery confirmation</p>
              </div>
            </div>
          </section>
        </div>
      )}

      {integrationType === 'STORE' && (
        <div className="store-integration-content">
          <section className="store-features">
            <h2>店舗機能 / Store Features</h2>
            <div className="features-grid">
              <div className="feature-card">
                <h3>店舗配送 / Store Delivery</h3>
                <p>Direct-to-store delivery management</p>
              </div>
              <div className="feature-card">
                <h3>注文 / Orders</h3>
                <p>Store order processing</p>
              </div>
              <div className="feature-card">
                <h3>移転 / Transfer</h3>
                <p>Inter-store inventory transfer</p>
              </div>
              <div className="feature-card">
                <h3>レジ/ERP連携 / POS/ERP Integration</h3>
                <p>Integration with POS and ERP systems</p>
              </div>
            </div>
          </section>

          <section className="o2o-section">
            <h2>O2O対応 / Online to Offline Support</h2>
            <div className="o2o-features">
              <div className="o2o-card">
                <h4>Click & Collect</h4>
                <p>Buy online, pick up in store</p>
              </div>
              <div className="o2o-card">
                <h4>Store Inventory</h4>
                <p>Real-time store inventory visibility</p>
              </div>
              <div className="o2o-card">
                <h4>Return to Store</h4>
                <p>Online order returns at physical stores</p>
              </div>
            </div>
          </section>

          <section className="private-mall-section">
            <h2>Private Mall対応 / Private Mall Support</h2>
            <p>Support for private e-commerce platforms and enterprise marketplaces</p>
          </section>
        </div>
      )}
    </div>
  );
};

export default ECIntegrationScreen;
