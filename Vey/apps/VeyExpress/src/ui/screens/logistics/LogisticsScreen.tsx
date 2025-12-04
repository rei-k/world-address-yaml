/**
 * VeyExpress Logistics Management Screen
 * 物流管理（SaaS）/プラットフォーム
 * 
 * Features:
 * - DMS (Distribution Management System)
 * - OMS (Order Management System)
 * - IMS (Inventory Management System)
 * - WMS (Warehouse Management System)
 * - TMS (Transportation Management System)
 * - Cloud Warehouse Operations
 * - Supply Chain Analytics
 */

import React, { useState } from 'react';
import { WarehouseOperation, OrderManagement, InventoryStatus } from '../../../types';

interface LogisticsScreenProps {
  apiKey: string;
}

type LogisticsModule = 'DMS' | 'OMS' | 'IMS' | 'WMS' | 'TMS' | 'CLOUD_WAREHOUSE' | 'ANALYTICS';

export const LogisticsScreen: React.FC<LogisticsScreenProps> = ({ apiKey }) => {
  const [selectedModule, setSelectedModule] = useState<LogisticsModule>('DMS');
  const [warehouseOps, setWarehouseOps] = useState<WarehouseOperation[]>([]);
  const [orders, setOrders] = useState<OrderManagement[]>([]);
  const [inventory, setInventory] = useState<InventoryStatus | null>(null);

  const modules = [
    { id: 'DMS', name: 'DMS', description: '物流配送管理 / Distribution Management' },
    { id: 'OMS', name: 'OMS', description: '注文管理 / Order Management' },
    { id: 'IMS', name: 'IMS', description: '在庫管理 / Inventory Management' },
    { id: 'WMS', name: 'WMS', description: '倉庫管理 / Warehouse Management' },
    { id: 'TMS', name: 'TMS', description: '輸送管理 / Transportation Management' },
    { id: 'CLOUD_WAREHOUSE', name: 'Cloud Warehouse', description: 'クラウド倉庫 / Cloud Operations' },
    { id: 'ANALYTICS', name: 'Analytics', description: 'サプライチェーン分析 / Supply Chain Analytics' },
  ];

  const loadModuleData = async (module: LogisticsModule) => {
    try {
      const response = await fetch(`/api/logistics/${module.toLowerCase()}`, {
        headers: { 'Authorization': `Bearer ${apiKey}` }
      });
      const data = await response.json();
      
      switch (module) {
        case 'WMS':
          setWarehouseOps(data.operations || []);
          break;
        case 'OMS':
          setOrders(data.orders || []);
          break;
        case 'IMS':
          setInventory(data.inventory || null);
          break;
      }
    } catch (error) {
      console.error(`Failed to load ${module} data:`, error);
    }
  };

  const handleModuleChange = (module: LogisticsModule) => {
    setSelectedModule(module);
    loadModuleData(module);
  };

  const renderModuleContent = () => {
    switch (selectedModule) {
      case 'DMS':
        return (
          <div className="dms-content">
            <h3>物流配送管理 / Distribution Management</h3>
            <div className="dms-dashboard">
              <div className="metric-card">
                <label>Active Routes</label>
                <span className="value">127</span>
              </div>
              <div className="metric-card">
                <label>On-Time Delivery</label>
                <span className="value">94.5%</span>
              </div>
              <div className="metric-card">
                <label>Avg Delivery Time</label>
                <span className="value">2.3 days</span>
              </div>
            </div>
          </div>
        );
      
      case 'OMS':
        return (
          <div className="oms-content">
            <h3>注文管理 / Order Management</h3>
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Status</th>
                  <th>Amount</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.orderId}>
                    <td>{order.orderId}</td>
                    <td>{order.customerName}</td>
                    <td><span className={`status ${order.status}`}>{order.status}</span></td>
                    <td>${order.totalAmount.toFixed(2)}</td>
                    <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'IMS':
        return (
          <div className="ims-content">
            <h3>在庫管理 / Inventory Management</h3>
            {inventory && (
              <div className="inventory-summary">
                <div className="metric-card">
                  <label>Total SKUs</label>
                  <span className="value">{inventory.totalSKUs.toLocaleString()}</span>
                </div>
                <div className="metric-card">
                  <label>Total Units</label>
                  <span className="value">{inventory.totalUnits.toLocaleString()}</span>
                </div>
                <div className="metric-card">
                  <label>Stock Value</label>
                  <span className="value">${inventory.totalValue.toLocaleString()}</span>
                </div>
                <div className="metric-card">
                  <label>Low Stock Items</label>
                  <span className="value warning">{inventory.lowStockItems}</span>
                </div>
              </div>
            )}
          </div>
        );

      case 'WMS':
        return (
          <div className="wms-content">
            <h3>倉庫管理 / Warehouse Management</h3>
            <div className="warehouse-operations">
              {warehouseOps.map(op => (
                <div key={op.operationId} className="operation-card">
                  <h4>{op.operationType}</h4>
                  <p>Zone: {op.zone}</p>
                  <p>Status: {op.status}</p>
                  <p>Items: {op.itemCount}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'TMS':
        return (
          <div className="tms-content">
            <h3>輸送管理 / Transportation Management</h3>
            <div className="transport-metrics">
              <div className="metric-card">
                <label>Active Shipments</label>
                <span className="value">432</span>
              </div>
              <div className="metric-card">
                <label>Vehicles in Transit</label>
                <span className="value">78</span>
              </div>
              <div className="metric-card">
                <label>Fuel Efficiency</label>
                <span className="value">8.2 km/L</span>
              </div>
            </div>
          </div>
        );

      case 'CLOUD_WAREHOUSE':
        return (
          <div className="cloud-warehouse-content">
            <h3>クラウド倉庫 / Cloud Warehouse Operations</h3>
            <div className="cloud-warehouse-features">
              <div className="feature-card">
                <h4>配送 / Delivery</h4>
                <p>Cloud-based delivery management</p>
              </div>
              <div className="feature-card">
                <h4>転送 / Transfer</h4>
                <p>Inter-warehouse transfers</p>
              </div>
              <div className="feature-card">
                <h4>レポート / Reports</h4>
                <p>Real-time reporting</p>
              </div>
            </div>
          </div>
        );

      case 'ANALYTICS':
        return (
          <div className="analytics-content">
            <h3>サプライチェーン分析 / Supply Chain Analytics</h3>
            <div className="analytics-dashboard">
              <div className="chart-container">
                <h4>Order Trends</h4>
                <div className="chart-placeholder">📊 Chart visualization here</div>
              </div>
              <div className="chart-container">
                <h4>Inventory Turnover</h4>
                <div className="chart-placeholder">📈 Chart visualization here</div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="veyexpress-logistics">
      <header className="logistics-header">
        <h1>Logistics Management</h1>
        <p className="subtitle">物流管理（SaaS）/プラットフォーム</p>
      </header>

      <div className="logistics-layout">
        {/* Module Selection */}
        <aside className="module-sidebar">
          <h2>Modules</h2>
          <ul className="module-list">
            {modules.map(module => (
              <li
                key={module.id}
                className={selectedModule === module.id ? 'active' : ''}
                onClick={() => handleModuleChange(module.id as LogisticsModule)}
              >
                <strong>{module.name}</strong>
                <p>{module.description}</p>
              </li>
            ))}
          </ul>
        </aside>

        {/* Module Content */}
        <main className="module-content">
          {renderModuleContent()}
        </main>
      </div>
    </div>
  );
};

export default LogisticsScreen;
