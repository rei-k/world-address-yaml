'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Customer, CustomerListFilter } from '@/src/types';
import {
  getCustomerList,
  exportCustomersToCSV,
  downloadCSV,
} from '@/src/services/customer.service';
import { generateCustomerListHTML, openPrintPreview } from '@/src/services/pdf.service';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'name' | 'lastDelivery' | 'totalDeliveries' | 'createdAt'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedCustomers, setSelectedCustomers] = useState<Set<string>>(new Set());

  // Available tags (in production, this would come from the backend)
  const availableTags = ['regular', 'business', 'vip', 'international'];

  useEffect(() => {
    loadCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, selectedTags, sortBy, sortOrder]);

  async function loadCustomers() {
    try {
      setLoading(true);
      const userId = 'current-user-id'; // TODO: Get from auth context
      
      const filter: CustomerListFilter = {
        search: searchTerm || undefined,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
        sortBy,
        sortOrder,
      };

      const result = await getCustomerList(userId, filter);
      setCustomers(result);
    } catch (error) {
      console.error('Failed to load customers:', error);
    } finally {
      setLoading(false);
    }
  }

  function toggleCustomerSelection(customerId: string) {
    const newSelection = new Set(selectedCustomers);
    if (newSelection.has(customerId)) {
      newSelection.delete(customerId);
    } else {
      newSelection.add(customerId);
    }
    setSelectedCustomers(newSelection);
  }

  function toggleAllCustomers() {
    if (selectedCustomers.size === customers.length) {
      setSelectedCustomers(new Set());
    } else {
      setSelectedCustomers(new Set(customers.map((c) => c.id)));
    }
  }

  function handleExportCSV() {
    const customersToExport = selectedCustomers.size > 0
      ? customers.filter((c) => selectedCustomers.has(c.id))
      : customers;

    const csvContent = exportCustomersToCSV(customersToExport);
    const filename = `customers-${new Date().toISOString().split('T')[0]}.csv`;
    downloadCSV(csvContent, filename);
  }

  function handlePrintList() {
    const customersToPrint = selectedCustomers.size > 0
      ? customers.filter((c) => selectedCustomers.has(c.id))
      : customers;

    const html = generateCustomerListHTML({
      customers: customersToPrint,
      title: '顧客リスト / Customer List',
      generatedAt: new Date(),
      generatedBy: 'current-user-name', // TODO: Get from auth context
    });

    openPrintPreview(html);
  }

  function toggleTag(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  return (
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>
            👥 顧客リスト / Customer List
          </h1>
          <p style={{ color: '#6b7280' }}>
            配送先顧客の管理 - Manage delivery recipients
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleExportCSV}
            className="btn btn-secondary"
            disabled={loading}
          >
            📥 CSV出力
          </button>
          <button
            onClick={handlePrintList}
            className="btn btn-secondary"
            disabled={loading}
          >
            🖨️ 印刷
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '24px', padding: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Search */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              🔍 検索 / Search
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="名前、メール、会社名で検索..."
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '14px',
              }}
            />
          </div>

          {/* Tags */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              🏷️ タグフィルター / Filter by Tags
            </label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {availableTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`btn ${selectedTags.includes(tag) ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '6px 12px', fontSize: '13px' }}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Sort */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                並び替え / Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '14px',
                }}
              >
                <option value="name">名前 / Name</option>
                <option value="totalDeliveries">配送回数 / Deliveries</option>
                <option value="lastDelivery">最終配送日 / Last Delivery</option>
                <option value="createdAt">登録日 / Created Date</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                順序 / Order
              </label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as any)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '14px',
                }}
              >
                <option value="asc">昇順 / Ascending</option>
                <option value="desc">降順 / Descending</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Results Info */}
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ color: '#6b7280', fontSize: '14px' }}>
          {customers.length}件の顧客 / {customers.length} customers
          {selectedCustomers.size > 0 && ` (${selectedCustomers.size}件選択中)`}
        </p>
        {customers.length > 0 && (
          <button
            onClick={toggleAllCustomers}
            className="btn btn-secondary"
            style={{ padding: '6px 12px', fontSize: '13px' }}
          >
            {selectedCustomers.size === customers.length ? '選択解除' : '全選択'}
          </button>
        )}
      </div>

      {/* Customer List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ color: '#6b7280' }}>読み込み中... / Loading...</p>
        </div>
      ) : customers.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <p style={{ fontSize: '48px', marginBottom: '16px' }}>👥</p>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
            顧客が見つかりません / No customers found
          </h3>
          <p style={{ color: '#6b7280', marginBottom: '24px' }}>
            検索条件を変更してください
          </p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ padding: '12px', textAlign: 'left', width: '40px' }}>
                  <input
                    type="checkbox"
                    checked={selectedCustomers.size === customers.length}
                    onChange={toggleAllCustomers}
                  />
                </th>
                <th style={{ padding: '12px', textAlign: 'left' }}>名前 / Name</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>メール / Email</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>電話 / Phone</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>会社 / Company</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>タグ / Tags</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>配送回数</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>最終配送</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr
                  key={customer.id}
                  style={{
                    borderBottom: '1px solid #e5e7eb',
                    backgroundColor: selectedCustomers.has(customer.id) ? '#eff6ff' : 'white',
                  }}
                >
                  <td style={{ padding: '12px' }}>
                    <input
                      type="checkbox"
                      checked={selectedCustomers.has(customer.id)}
                      onChange={() => toggleCustomerSelection(customer.id)}
                    />
                  </td>
                  <td style={{ padding: '12px', fontWeight: '500' }}>
                    {customer.name}
                  </td>
                  <td style={{ padding: '12px', fontSize: '14px', color: '#6b7280' }}>
                    {customer.email || '-'}
                  </td>
                  <td style={{ padding: '12px', fontSize: '14px', color: '#6b7280' }}>
                    {customer.phone || '-'}
                  </td>
                  <td style={{ padding: '12px', fontSize: '14px', color: '#6b7280' }}>
                    {customer.companyName || '-'}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {customer.tags?.map((tag) => (
                        <span
                          key={tag}
                          style={{
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            backgroundColor: '#e0e7ff',
                            color: '#3730a3',
                          }}
                        >
                          {tag}
                        </span>
                      )) || '-'}
                    </div>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center', fontWeight: '500' }}>
                    {customer.totalDeliveries || 0}
                  </td>
                  <td style={{ padding: '12px', fontSize: '14px', color: '#6b7280' }}>
                    {customer.lastDeliveryDate
                      ? new Date(customer.lastDeliveryDate).toLocaleDateString('ja-JP')
                      : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
