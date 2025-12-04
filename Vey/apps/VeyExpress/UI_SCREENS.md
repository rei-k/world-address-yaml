# VeyExpress UI Screens Documentation

## Overview

VeyExpress provides 7 comprehensive UI screen categories to support complete logistics operations.

## Screen Categories

### 1. Dashboard Screen (総合ダッシュボード)

**Location:** `src/ui/screens/dashboard/DashboardScreen.tsx`

**Features:**
- Delivery number search (配達番号検索)
- Delivery summary with active, delayed, returns, and insured counts
- Integration status visualization (EC/ERP/OMS/WMS/TMS/DMS)
- World map delivery visualization

**Usage:**
```typescript
import { DashboardScreen } from '@vey/veyexpress/ui';

<DashboardScreen apiKey="your-api-key" onSearch={(query) => console.log(query)} />
```

### 2. API Console Screen (APIコンソール)

**Location:** `src/ui/screens/api-console/APIConsoleScreen.tsx`

**Features:**
- 8 Core APIs interface (Tracking, Waybill, ETA, Route, Vehicle, Ship, Returns, Comparison, Insurance)
- API debugging tools with request/response panels
- API usage monitoring (requests, success rate, response time)
- Documentation access

**Usage:**
```typescript
import { APIConsoleScreen } from '@vey/veyexpress/ui';

<APIConsoleScreen apiKey="your-api-key" />
```

### 3. Logistics Management Screen (物流管理)

**Location:** `src/ui/screens/logistics/LogisticsScreen.tsx`

**Features:**
- DMS (Distribution Management System)
- OMS (Order Management System)
- IMS (Inventory Management System)
- WMS (Warehouse Management System)
- TMS (Transportation Management System)
- Cloud Warehouse Operations
- Supply Chain Analytics

**Usage:**
```typescript
import { LogisticsScreen } from '@vey/veyexpress/ui';

<LogisticsScreen apiKey="your-api-key" />
```

### 4. EC/Store Integration Screen (EC/店舗連携)

**Location:** `src/ui/screens/ec-integration/ECIntegrationScreen.tsx`

**Features:**
- EC Platform integration (Shopify, WooCommerce, Magento, BigCommerce)
- Auto-plugin generation
- Order/Return/Exchange processing
- Store delivery and POS integration
- O2O (Online to Offline) support

**Usage:**
```typescript
import { ECIntegrationScreen } from '@vey/veyexpress/ui';

<ECIntegrationScreen apiKey="your-api-key" />
```

### 5. Cross-Border Delivery Screen (越境配送)

**Location:** `src/ui/screens/cross-border/CrossBorderScreen.tsx`

**Features:**
- Multi-modal transport (Parcel, 3PL, 4PL, Sea, Rail, Air)
- International tracking
- Customs & tax calculator
- HS code support
- Multi-language documentation
- International order management

**Usage:**
```typescript
import { CrossBorderScreen } from '@vey/veyexpress/ui';

<CrossBorderScreen apiKey="your-api-key" />
```

### 6. Value-Added Services Screen (付加価値サービス)

**Location:** `src/ui/screens/value-services/ValueServicesScreen.tsx`

**Features:**
- Shipping cost calculator
- Bulk delivery processing (up to 10,000 shipments)
- Shipping insurance management
- Logistics service marketplace
- Carbon offset tracking

**Usage:**
```typescript
import { ValueServicesScreen } from '@vey/veyexpress/ui';

<ValueServicesScreen apiKey="your-api-key" />
```

### 7. Hardware Integration Screen (Hardware連動)

**Location:** `src/ui/screens/hardware/HardwareScreen.tsx`

**Features:**
- Smart hardware integration (Sorting machines, OCR scanners, Smart terminals, Smart lockers)
- QR/NFC code generation (Enterprise, Store, Branch, Facility, Personal)
- QR template marketplace
- GDPR/CCPA compliance controls
- Recipient UX (delivery time/place change, multi-language address, multi-channel notifications)

**Usage:**
```typescript
import { HardwareScreen } from '@vey/veyexpress/ui';

<HardwareScreen apiKey="your-api-key" />
```

## Common Components

### SearchBar
Reusable search component for all screens.

### SummaryCards
Display summary metrics in card format.

### IntegrationStatusPanel
Show integration status for EC/ERP/OMS/WMS/TMS/DMS systems.

### WorldMap
Map visualization for delivery tracking.

## Styling

All components use BEM-style CSS classes for easy customization:

```css
.veyexpress-dashboard { }
.veyexpress-api-console { }
.veyexpress-logistics { }
.veyexpress-ec-integration { }
.veyexpress-cross-border { }
.veyexpress-value-services { }
.veyexpress-hardware { }
```

## Internationalization

All screens support bilingual display (English/Japanese) by default, with multi-language support for 254 countries.

## Responsive Design

All screens are responsive and work on:
- Desktop (1920x1080 and above)
- Tablet (768x1024)
- Mobile (375x667)

## Accessibility

All components follow WCAG 2.1 Level AA guidelines:
- Proper heading hierarchy
- ARIA labels
- Keyboard navigation
- Screen reader support

---

**Last Updated:** 2025-12-04
**Version:** 1.0.0
