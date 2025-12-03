# VeyExpress データベース設計 (ERD)

VeyExpressプラットフォームのエンティティ関係図とデータベーススキーマ設計。

---

## 目次

1. [全体アーキテクチャ](#全体アーキテクチャ)
2. [コアエンティティ](#コアエンティティ)
3. [配送管理](#配送管理)
4. [ユーザー・認証](#ユーザー認証)
5. [キャリア統合](#キャリア統合)
6. [支払い・請求](#支払い請求)
7. [分析・監査](#分析監査)
8. [インデックス戦略](#インデックス戦略)

---

## 全体アーキテクチャ

```
┌─────────────────────────────────────────────────────────────────┐
│                     VeyExpress Database Schema                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐     │
│  │   Users &    │    │   Shipping   │    │   Carriers   │     │
│  │     Auth     │───►│  Management  │◄───│ Integration  │     │
│  └──────────────┘    └──────────────┘    └──────────────┘     │
│         │                    │                    │             │
│         │                    │                    │             │
│         ▼                    ▼                    ▼             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐     │
│  │  Addresses & │    │  Waybills &  │    │  Payments &  │     │
│  │     PIDs     │    │   Tracking   │    │   Billing    │     │
│  └──────────────┘    └──────────────┘    └──────────────┘     │
│         │                    │                    │             │
│         │                    │                    │             │
│         └────────────────────┴────────────────────┘             │
│                              │                                  │
│                              ▼                                  │
│                    ┌──────────────────┐                        │
│                    │  Analytics &     │                        │
│                    │  Audit Logs      │                        │
│                    └──────────────────┘                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## コアエンティティ

### Users（ユーザー）

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    phone VARCHAR(50),
    phone_verified BOOLEAN DEFAULT FALSE,
    
    -- Profile
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    display_name VARCHAR(200),
    language VARCHAR(10) DEFAULT 'en',
    timezone VARCHAR(50) DEFAULT 'UTC',
    
    -- DID (Decentralized Identifier)
    did VARCHAR(500) UNIQUE,
    did_method VARCHAR(50), -- 'key', 'web', 'ethr', etc.
    
    -- Privacy
    zkp_enabled BOOLEAN DEFAULT FALSE,
    privacy_level VARCHAR(20) DEFAULT 'STANDARD', -- STANDARD, ENHANCED, MAXIMUM
    
    -- OAuth
    oauth_provider VARCHAR(50), -- google, apple, wechat, alipay
    oauth_id VARCHAR(255),
    
    -- Status
    status VARCHAR(20) DEFAULT 'ACTIVE', -- ACTIVE, SUSPENDED, DELETED
    role VARCHAR(20) DEFAULT 'CUSTOMER', -- CUSTOMER, MERCHANT, COURIER, ADMIN
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login_at TIMESTAMPTZ,
    
    -- Indexes
    INDEX idx_users_email (email),
    INDEX idx_users_did (did),
    INDEX idx_users_oauth (oauth_provider, oauth_id),
    INDEX idx_users_status (status)
);
```

### Addresses（住所）

```sql
CREATE TABLE addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- PID (Place ID)
    pid VARCHAR(200) UNIQUE NOT NULL,
    pid_hash VARCHAR(64) NOT NULL, -- SHA-256 hash for fast lookup
    
    -- Country & Region
    country VARCHAR(2) NOT NULL, -- ISO 3166-1 alpha-2
    admin1 VARCHAR(10), -- Prefecture/State/Province code
    admin2 VARCHAR(10), -- City/District code
    admin3 VARCHAR(10), -- Optional: Sub-district
    
    -- Address Components
    postal_code VARCHAR(20),
    locality VARCHAR(100),
    sublocality VARCHAR(100),
    street_address TEXT,
    building VARCHAR(200),
    floor VARCHAR(20),
    unit VARCHAR(50),
    
    -- Formatted Addresses
    formatted_local TEXT, -- Local language format
    formatted_international TEXT, -- International format
    
    -- Geocoding
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    geo_accuracy INTEGER, -- meters
    geo_source VARCHAR(50), -- 'user', 'geocoder', 'verified'
    
    -- Metadata
    label VARCHAR(100), -- 'Home', 'Office', 'Friend's house', etc.
    is_default BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_method VARCHAR(50), -- 'phone', 'email', 'delivery', 'government_id'
    
    -- ZKP
    zkp_commitment VARCHAR(500), -- Zero-knowledge proof commitment
    encrypted_data TEXT, -- Encrypted full address (for ZKP mode)
    encryption_key_id VARCHAR(100),
    
    -- Status
    status VARCHAR(20) DEFAULT 'ACTIVE', -- ACTIVE, ARCHIVED, INVALID
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    verified_at TIMESTAMPTZ,
    last_used_at TIMESTAMPTZ,
    
    -- Indexes
    INDEX idx_addresses_user (user_id),
    INDEX idx_addresses_pid (pid),
    INDEX idx_addresses_pid_hash (pid_hash),
    INDEX idx_addresses_country (country),
    INDEX idx_addresses_geo (latitude, longitude),
    INDEX idx_addresses_default (user_id, is_default) WHERE is_default = TRUE
);
```

---

## 配送管理

### Shipments（配送）

```sql
CREATE TABLE shipments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Reference
    order_id VARCHAR(100) NOT NULL, -- EC site's order ID
    external_order_id VARCHAR(200), -- Original order ID from platform
    platform VARCHAR(50), -- 'shopify', 'woocommerce', 'magento', etc.
    platform_shop_id VARCHAR(200),
    
    -- Tracking
    tracking_number VARCHAR(100) UNIQUE NOT NULL,
    carrier_id UUID REFERENCES carriers(id),
    carrier_service VARCHAR(100), -- 'EXPRESS', 'STANDARD', 'ECONOMY'
    
    -- Sender
    sender_user_id UUID REFERENCES users(id),
    sender_address_id UUID REFERENCES addresses(id),
    sender_name VARCHAR(200),
    sender_phone VARCHAR(50),
    sender_company VARCHAR(200),
    
    -- Recipient
    recipient_user_id UUID REFERENCES users(id),
    recipient_address_id UUID REFERENCES addresses(id),
    recipient_pid VARCHAR(200), -- For ZKP mode
    recipient_name VARCHAR(200),
    recipient_phone VARCHAR(50),
    recipient_email VARCHAR(255),
    
    -- Dynamic Pickup
    pickup_location_type VARCHAR(50), -- 'ADDRESS', 'PACKSTATION', 'LOCKER', 'STORE'
    pickup_location_id UUID REFERENCES pickup_locations(id),
    pickup_deadline TIMESTAMPTZ,
    pickup_selected_at TIMESTAMPTZ,
    
    -- Shipping Details
    package_count INTEGER DEFAULT 1,
    total_weight DECIMAL(10, 2), -- kg
    total_value DECIMAL(12, 2),
    value_currency VARCHAR(3),
    
    -- Insurance
    insurance_enabled BOOLEAN DEFAULT FALSE,
    insurance_value DECIMAL(12, 2),
    insurance_premium DECIMAL(10, 2),
    insurance_provider VARCHAR(100),
    insurance_policy_number VARCHAR(100),
    
    -- Status
    status VARCHAR(50) DEFAULT 'CREATED',
    -- CREATED, LABEL_GENERATED, PICKED_UP, IN_TRANSIT, CUSTOMS_CLEARED,
    -- OUT_FOR_DELIVERY, DELIVERED, EXCEPTION, CANCELLED, RETURNED
    
    current_location TEXT,
    current_location_lat DECIMAL(10, 7),
    current_location_lng DECIMAL(10, 7),
    
    -- Estimates & Actuals
    estimated_pickup_at TIMESTAMPTZ,
    estimated_delivery_at TIMESTAMPTZ,
    actual_pickup_at TIMESTAMPTZ,
    actual_delivery_at TIMESTAMPTZ,
    
    -- Cost
    shipping_cost DECIMAL(10, 2),
    customs_duties DECIMAL(10, 2),
    taxes DECIMAL(10, 2),
    total_cost DECIMAL(10, 2),
    cost_currency VARCHAR(3),
    
    -- ZKP
    zkp_proof TEXT, -- Zero-knowledge proof
    zkp_verified BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    special_instructions TEXT,
    signature_required BOOLEAN DEFAULT FALSE,
    fragile BOOLEAN DEFAULT FALSE,
    requires_refrigeration BOOLEAN DEFAULT FALSE,
    
    -- Notifications
    notification_channels TEXT[], -- ['email', 'sms', 'wechat', 'push']
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    cancelled_at TIMESTAMPTZ,
    
    -- Indexes
    INDEX idx_shipments_tracking (tracking_number),
    INDEX idx_shipments_order (order_id),
    INDEX idx_shipments_platform (platform, platform_shop_id),
    INDEX idx_shipments_sender (sender_user_id),
    INDEX idx_shipments_recipient (recipient_user_id),
    INDEX idx_shipments_carrier (carrier_id),
    INDEX idx_shipments_status (status),
    INDEX idx_shipments_created (created_at DESC)
);
```

### Shipment Items（配送アイテム）

```sql
CREATE TABLE shipment_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_id UUID REFERENCES shipments(id) ON DELETE CASCADE,
    
    -- Product Info
    sku VARCHAR(100),
    name VARCHAR(500) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    
    -- Physical
    quantity INTEGER NOT NULL DEFAULT 1,
    weight DECIMAL(10, 2), -- kg per unit
    length DECIMAL(10, 2), -- cm
    width DECIMAL(10, 2), -- cm
    height DECIMAL(10, 2), -- cm
    
    -- Value
    unit_price DECIMAL(12, 2),
    total_price DECIMAL(12, 2),
    currency VARCHAR(3),
    
    -- Customs
    hs_code VARCHAR(20), -- Harmonized System code
    country_of_origin VARCHAR(2),
    
    -- Restrictions
    is_hazardous BOOLEAN DEFAULT FALSE,
    hazard_class VARCHAR(20),
    is_prohibited BOOLEAN DEFAULT FALSE,
    prohibition_reason TEXT,
    
    -- Metadata
    image_url TEXT,
    product_url TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Indexes
    INDEX idx_shipment_items_shipment (shipment_id),
    INDEX idx_shipment_items_sku (sku)
);
```

### Tracking Events（追跡イベント）

```sql
CREATE TABLE tracking_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_id UUID REFERENCES shipments(id) ON DELETE CASCADE,
    
    -- Event
    event_type VARCHAR(50) NOT NULL,
    -- LABEL_CREATED, PICKED_UP, DEPARTED_FACILITY, ARRIVED_FACILITY,
    -- IN_TRANSIT, CUSTOMS_CLEARANCE, OUT_FOR_DELIVERY, DELIVERED,
    -- DELIVERY_ATTEMPTED, EXCEPTION, RETURNED
    
    event_code VARCHAR(20), -- Carrier-specific event code
    description TEXT NOT NULL,
    description_local TEXT, -- Localized description
    
    -- Location
    location TEXT,
    location_type VARCHAR(50), -- 'FACILITY', 'HUB', 'CUSTOMS', 'DESTINATION'
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    country VARCHAR(2),
    city VARCHAR(100),
    
    -- Timing
    occurred_at TIMESTAMPTZ NOT NULL,
    
    -- Metadata
    courier_name VARCHAR(200),
    courier_id VARCHAR(100),
    signature_image_url TEXT,
    photo_url TEXT,
    
    -- Exception Details (if applicable)
    exception_type VARCHAR(50), -- 'DELAY', 'DAMAGE', 'LOST', 'ADDRESS_ISSUE'
    exception_description TEXT,
    exception_resolution TEXT,
    
    -- Source
    source VARCHAR(50), -- 'CARRIER_API', 'WEBHOOK', 'MANUAL', 'SYSTEM'
    raw_data JSONB, -- Raw data from carrier
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Indexes
    INDEX idx_tracking_events_shipment (shipment_id, occurred_at DESC),
    INDEX idx_tracking_events_type (event_type),
    INDEX idx_tracking_events_occurred (occurred_at DESC)
);
```

### Waybills（送り状）

```sql
CREATE TABLE waybills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_id UUID REFERENCES shipments(id) ON DELETE CASCADE,
    
    -- Waybill Number
    waybill_number VARCHAR(100) UNIQUE NOT NULL,
    barcode_format VARCHAR(20), -- 'CODE128', 'QR', 'DATAMATRIX'
    barcode_data TEXT,
    
    -- Label
    label_format VARCHAR(20), -- 'PDF', 'ZPL', 'PNG'
    label_size VARCHAR(20), -- '4x6', 'A4', 'LETTER'
    label_url TEXT,
    label_data TEXT, -- Base64 encoded
    
    -- QR Code for Wallet
    qr_code_data TEXT,
    qr_code_url TEXT,
    wallet_pass_url TEXT, -- Google/Apple Wallet URL
    
    -- Verification
    verification_code VARCHAR(20), -- For pickup verification
    verification_pin VARCHAR(10),
    digital_signature TEXT,
    
    -- Status
    status VARCHAR(20) DEFAULT 'GENERATED',
    -- GENERATED, PRINTED, VOIDED, EXPIRED
    
    printed_at TIMESTAMPTZ,
    voided_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Indexes
    INDEX idx_waybills_shipment (shipment_id),
    INDEX idx_waybills_number (waybill_number),
    INDEX idx_waybills_verification (verification_code)
);
```

---

## ユーザー・認証

### User Sessions（ユーザーセッション）

```sql
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Session
    session_token VARCHAR(500) UNIQUE NOT NULL,
    refresh_token VARCHAR(500) UNIQUE,
    
    -- Device
    device_type VARCHAR(50), -- 'WEB', 'IOS', 'ANDROID', 'MINI_PROGRAM'
    device_id VARCHAR(200),
    device_name VARCHAR(200),
    user_agent TEXT,
    
    -- Location
    ip_address INET,
    country VARCHAR(2),
    city VARCHAR(100),
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_activity_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    
    -- Indexes
    INDEX idx_sessions_user (user_id),
    INDEX idx_sessions_token (session_token),
    INDEX idx_sessions_active (is_active, expires_at)
);
```

### API Keys（APIキー）

```sql
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Key
    key_hash VARCHAR(64) UNIQUE NOT NULL, -- SHA-256 hash
    key_prefix VARCHAR(20) NOT NULL, -- First few chars for identification
    
    -- Permissions
    name VARCHAR(200),
    scopes TEXT[], -- ['read:shipments', 'write:shipments', 'read:addresses']
    rate_limit INTEGER DEFAULT 1000, -- requests per hour
    
    -- Environment
    environment VARCHAR(20) DEFAULT 'production', -- 'sandbox', 'production'
    
    -- Platform Integration
    platform VARCHAR(50), -- 'shopify', 'woocommerce', 'custom'
    platform_shop_id VARCHAR(200),
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Usage
    last_used_at TIMESTAMPTZ,
    request_count BIGINT DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    
    -- Indexes
    INDEX idx_api_keys_user (user_id),
    INDEX idx_api_keys_hash (key_hash),
    INDEX idx_api_keys_active (is_active, expires_at)
);
```

---

## キャリア統合

### Carriers（キャリア）

```sql
CREATE TABLE carriers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Identity
    code VARCHAR(50) UNIQUE NOT NULL, -- 'DHL', 'FEDEX', 'UPS', 'JAPANPOST'
    name VARCHAR(200) NOT NULL,
    name_local VARCHAR(200),
    
    -- Company Info
    company_name VARCHAR(200),
    website TEXT,
    logo_url TEXT,
    
    -- Coverage
    coverage_countries VARCHAR(2)[], -- Array of ISO country codes
    coverage_type VARCHAR(20), -- 'GLOBAL', 'REGIONAL', 'DOMESTIC'
    
    -- Services
    services JSONB, -- { "EXPRESS": {...}, "STANDARD": {...} }
    
    -- API Configuration
    api_enabled BOOLEAN DEFAULT FALSE,
    api_endpoint TEXT,
    api_version VARCHAR(20),
    api_auth_type VARCHAR(50), -- 'BASIC', 'OAUTH', 'API_KEY', 'CUSTOM'
    api_credentials_encrypted TEXT,
    
    -- Webhook
    webhook_supported BOOLEAN DEFAULT FALSE,
    webhook_endpoint TEXT,
    webhook_secret_encrypted TEXT,
    
    -- Features
    supports_tracking BOOLEAN DEFAULT TRUE,
    supports_pickup BOOLEAN DEFAULT TRUE,
    supports_insurance BOOLEAN DEFAULT FALSE,
    supports_cod BOOLEAN DEFAULT FALSE, -- Cash on Delivery
    supports_signature BOOLEAN DEFAULT TRUE,
    
    -- Pricing
    base_currency VARCHAR(3),
    pricing_model VARCHAR(50), -- 'WEIGHT_BASED', 'ZONE_BASED', 'CUSTOM'
    
    -- Status
    status VARCHAR(20) DEFAULT 'ACTIVE', -- ACTIVE, MAINTENANCE, DEPRECATED
    
    -- Reliability Score (calculated)
    reliability_score DECIMAL(3, 2) DEFAULT 0.00, -- 0.00 to 1.00
    average_delay_hours DECIMAL(6, 2),
    lost_rate DECIMAL(5, 4), -- Percentage
    damage_rate DECIMAL(5, 4), -- Percentage
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_sync_at TIMESTAMPTZ,
    
    -- Indexes
    INDEX idx_carriers_code (code),
    INDEX idx_carriers_status (status),
    INDEX idx_carriers_reliability (reliability_score DESC)
);
```

### Carrier Rate Cards（キャリア料金表）

```sql
CREATE TABLE carrier_rate_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    carrier_id UUID REFERENCES carriers(id) ON DELETE CASCADE,
    
    -- Service
    service_type VARCHAR(100), -- 'EXPRESS', 'STANDARD', 'ECONOMY'
    service_name VARCHAR(200),
    
    -- Route
    from_country VARCHAR(2),
    from_zone VARCHAR(50),
    to_country VARCHAR(2),
    to_zone VARCHAR(50),
    
    -- Weight Tiers
    min_weight DECIMAL(10, 2), -- kg
    max_weight DECIMAL(10, 2), -- kg
    
    -- Pricing
    base_rate DECIMAL(10, 2),
    per_kg_rate DECIMAL(10, 2),
    fuel_surcharge_percent DECIMAL(5, 2),
    currency VARCHAR(3),
    
    -- Transit Time
    min_transit_days INTEGER,
    max_transit_days INTEGER,
    
    -- Validity
    valid_from DATE,
    valid_until DATE,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Indexes
    INDEX idx_rate_cards_carrier (carrier_id),
    INDEX idx_rate_cards_route (from_country, to_country),
    INDEX idx_rate_cards_validity (valid_from, valid_until)
);
```

---

## 支払い・請求

### Payments（支払い）

```sql
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_id UUID REFERENCES shipments(id),
    user_id UUID REFERENCES users(id),
    
    -- Payment Details
    payment_intent_id VARCHAR(200) UNIQUE, -- Stripe/PayPal/etc.
    payment_method VARCHAR(50), -- 'CREDIT_CARD', 'DEBIT_CARD', 'WECHAT_PAY', 'ALIPAY'
    payment_provider VARCHAR(50), -- 'STRIPE', 'PAYPAL', 'WECHAT', 'ALIPAY'
    
    -- Amount
    amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    
    -- Breakdown
    shipping_fee DECIMAL(10, 2),
    insurance_fee DECIMAL(10, 2),
    customs_duties DECIMAL(10, 2),
    taxes DECIMAL(10, 2),
    discount DECIMAL(10, 2),
    
    -- Status
    status VARCHAR(20) DEFAULT 'PENDING',
    -- PENDING, PROCESSING, SUCCEEDED, FAILED, REFUNDED, CANCELLED
    
    -- Refund
    refund_amount DECIMAL(12, 2),
    refund_reason TEXT,
    refunded_at TIMESTAMPTZ,
    
    -- Metadata
    description TEXT,
    metadata JSONB,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    paid_at TIMESTAMPTZ,
    failed_at TIMESTAMPTZ,
    
    -- Indexes
    INDEX idx_payments_shipment (shipment_id),
    INDEX idx_payments_user (user_id),
    INDEX idx_payments_status (status),
    INDEX idx_payments_created (created_at DESC)
);
```

### Invoices（請求書）

```sql
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    
    -- Invoice Number
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    
    -- Billing Period
    period_start DATE,
    period_end DATE,
    
    -- Amounts
    subtotal DECIMAL(12, 2),
    tax DECIMAL(12, 2),
    total DECIMAL(12, 2),
    currency VARCHAR(3),
    
    -- Status
    status VARCHAR(20) DEFAULT 'DRAFT',
    -- DRAFT, SENT, PAID, OVERDUE, CANCELLED
    
    -- PDF
    pdf_url TEXT,
    
    -- Due Date
    due_date DATE,
    paid_at TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    sent_at TIMESTAMPTZ,
    
    -- Indexes
    INDEX idx_invoices_user (user_id),
    INDEX idx_invoices_number (invoice_number),
    INDEX idx_invoices_status (status),
    INDEX idx_invoices_period (period_start, period_end)
);
```

---

## 分析・監査

### Analytics Events（分析イベント）

```sql
CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Event
    event_name VARCHAR(100) NOT NULL,
    event_category VARCHAR(50),
    
    -- User
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    session_id UUID,
    
    -- Context
    platform VARCHAR(50),
    device_type VARCHAR(50),
    country VARCHAR(2),
    
    -- Data
    properties JSONB,
    
    -- Timestamp
    occurred_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Indexes
    INDEX idx_analytics_event_name (event_name, occurred_at DESC),
    INDEX idx_analytics_user (user_id, occurred_at DESC),
    INDEX idx_analytics_occurred (occurred_at DESC)
);
```

### Audit Logs（監査ログ）

```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Actor
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    api_key_id UUID,
    actor_type VARCHAR(50), -- 'USER', 'API_KEY', 'SYSTEM', 'CARRIER'
    
    -- Action
    action VARCHAR(100) NOT NULL,
    -- 'ADDRESS_ACCESSED', 'SHIPMENT_CREATED', 'PAYMENT_PROCESSED', etc.
    
    resource_type VARCHAR(50), -- 'ADDRESS', 'SHIPMENT', 'PAYMENT'
    resource_id UUID,
    
    -- Changes
    old_values JSONB,
    new_values JSONB,
    
    -- Context
    ip_address INET,
    user_agent TEXT,
    request_id VARCHAR(100),
    
    -- Security
    security_level VARCHAR(20), -- 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    encrypted BOOLEAN DEFAULT FALSE,
    encryption_key_id VARCHAR(100),
    
    -- Timestamp
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Indexes
    INDEX idx_audit_logs_user (user_id, created_at DESC),
    INDEX idx_audit_logs_action (action, created_at DESC),
    INDEX idx_audit_logs_resource (resource_type, resource_id),
    INDEX idx_audit_logs_created (created_at DESC),
    INDEX idx_audit_logs_security (security_level, created_at DESC)
);
```

---

## インデックス戦略

### パフォーマンス最適化

```sql
-- 複合インデックス: よく使われるクエリパターン用
CREATE INDEX idx_shipments_user_status ON shipments(sender_user_id, status, created_at DESC);
CREATE INDEX idx_shipments_carrier_status ON shipments(carrier_id, status, created_at DESC);
CREATE INDEX idx_addresses_user_default ON addresses(user_id, is_default) WHERE is_default = TRUE;

-- 部分インデックス: 特定条件のみ
CREATE INDEX idx_shipments_active ON shipments(status, created_at DESC) WHERE status IN ('CREATED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY');
CREATE INDEX idx_payments_pending ON payments(created_at DESC) WHERE status = 'PENDING';

-- GIN インデックス: JSONB検索用
CREATE INDEX idx_shipment_items_metadata ON shipment_items USING GIN(metadata);
CREATE INDEX idx_tracking_events_raw ON tracking_events USING GIN(raw_data);

-- BRIN インデックス: タイムスタンプ列用（大きなテーブル向け）
CREATE INDEX idx_analytics_events_occurred_brin ON analytics_events USING BRIN(occurred_at);
CREATE INDEX idx_audit_logs_created_brin ON audit_logs USING BRIN(created_at);

-- GiST インデックス: 地理空間検索用
CREATE INDEX idx_addresses_location ON addresses USING GIST(ll_to_earth(latitude, longitude));
CREATE INDEX idx_tracking_events_location ON tracking_events USING GIST(ll_to_earth(latitude, longitude));
```

---

## ER図（メインエンティティ）

```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│    Users     │────────►│  Addresses   │◄────────│  Shipments   │
│              │         │              │         │              │
│ - id         │         │ - id         │         │ - id         │
│ - email      │         │ - user_id    │         │ - order_id   │
│ - did        │         │ - pid        │         │ - tracking   │
│ - zkp_enabled│         │ - country    │         │ - status     │
└──────────────┘         │ - formatted  │         └──────────────┘
       │                 │ - latitude   │                │
       │                 │ - longitude  │                │
       │                 └──────────────┘                │
       │                                                 │
       │                                                 ▼
       │                 ┌──────────────┐         ┌──────────────┐
       │                 │   Carriers   │◄────────│   Waybills   │
       │                 │              │         │              │
       │                 │ - id         │         │ - id         │
       │                 │ - code       │         │ - shipment_id│
       │                 │ - api_config │         │ - qr_code    │
       │                 └──────────────┘         │ - wallet_url │
       │                        │                 └──────────────┘
       │                        │
       ▼                        ▼
┌──────────────┐         ┌──────────────┐
│   Payments   │         │ Rate Cards   │
│              │         │              │
│ - id         │         │ - carrier_id │
│ - shipment_id│         │ - from/to    │
│ - amount     │         │ - base_rate  │
│ - status     │         │ - transit    │
└──────────────┘         └──────────────┘
       │
       │
       ▼
┌──────────────┐         ┌──────────────┐
│   Invoices   │         │ Audit Logs   │
│              │         │              │
│ - user_id    │         │ - user_id    │
│ - period     │         │ - action     │
│ - total      │         │ - resource   │
└──────────────┘         └──────────────┘
```

---

このERDは、VeyExpressプラットフォームの完全なデータベース設計を示しています。ZKPプライバシー保護、マルチキャリア統合、グローバル配送、分析・監査まで、すべての要件をカバーしています。
