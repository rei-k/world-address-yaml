# ⚙ Settings / 設定

クラウド住所帳アプリケーションの設定管理。ロケール、金融設定、ウォレット統合、開発者ツールを一元管理。

Manage Cloud Address Book application settings including locale, financial settings, wallet integration, and developer tools.

---

## 🎯 主要機能 / Key Features

### Locale（デフォルト国/言語設定）
- **国設定**: デフォルトの国・地域
- **言語設定**: UI言語とタイムゾーン
- **地域フォーマット**: 日付・時刻・数値の表示形式

### Financial（ベース通貨/税/ロケール）
- **通貨設定**: デフォルトの通貨と為替レート
- **税設定**: 税率と計算方法
- **金融・EC用ロケール**: 決済・請求用の地域設定

### Wallet Integration（Wallet連携）※将来
- **Google Wallet**: Android Pay統合
- **Apple Wallet**: Apple Pay統合
- **NFC決済**: 非接触決済連携

### Developer（Webhook/APIキー管理）
- **Webhook設定**: イベント通知の設定
- **APIキー管理**: 開発者向けAPIアクセス
- **レート制限**: API使用量制限

---

## 📂 ディレクトリ構成 / Directory Structure

```
settings/
├── README.md                    # このファイル
├── locale/                      # デフォルト国/言語設定
│   ├── country.md              # 国設定
│   └── language.md             # 言語設定
├── financial/                   # ベース通貨/税/ロケール
│   ├── currency.md             # 通貨設定
│   ├── tax.md                  # 税設定
│   └── locale.md               # ロケール設定（金融・EC用）
├── wallet-integration/          # Wallet連携（将来）
│   ├── google-wallet.md        # Google Wallet
│   └── apple-wallet.md         # Apple Wallet
└── developer/                   # Webhook/APIキー管理
    ├── webhooks.md             # Webhook設定
    └── api-keys.md             # APIキー管理
```

---

## 🚀 使用方法 / Usage

### ロケール設定

```typescript
import { updateLocaleSettings } from '@/cloud-address-book-app/settings';

await updateLocaleSettings(userId, {
  country: 'JP',                  // デフォルト国
  language: 'ja',                 // UI言語
  timezone: 'Asia/Tokyo',         // タイムゾーン
  dateFormat: 'YYYY/MM/DD',       // 日付形式
  timeFormat: '24h',              // 時刻形式（12h/24h）
  firstDayOfWeek: 'sunday'        // 週の開始曜日
});
```

### 通貨設定

```typescript
import { updateCurrencySettings } from '@/cloud-address-book-app/settings/financial';

await updateCurrencySettings(userId, {
  baseCurrency: 'JPY',            // 基準通貨
  displayCurrency: 'JPY',         // 表示通貨
  exchangeRateSource: 'ecb',      // 為替レートソース
  autoConvert: true,              // 自動換算
  decimalPlaces: 0                // 小数点以下桁数
});
```

### 税設定

```typescript
import { updateTaxSettings } from '@/cloud-address-book-app/settings/financial';

await updateTaxSettings(userId, {
  country: 'JP',
  taxType: 'consumption',         // 消費税
  standardRate: 0.10,             // 標準税率 10%
  reducedRates: [
    { category: 'food', rate: 0.08 }  // 軽減税率 8%
  ],
  includedInPrice: true,          // 内税
  invoiceRequired: true           // インボイス制度対応
});
```

### Webhook設定

```typescript
import { createWebhook } from '@/cloud-address-book-app/settings/developer';

const webhook = await createWebhook(userId, {
  url: 'https://example.com/webhook',
  events: [
    'address.created',
    'address.updated',
    'address.deleted',
    'shipping.delivered'
  ],
  secret: 'webhook_secret_key',   // 署名検証用
  active: true
});
```

### APIキー生成

```typescript
import { generateAPIKey } from '@/cloud-address-book-app/settings/developer';

const apiKey = await generateAPIKey(userId, {
  name: 'Production API Key',
  scopes: [
    'addresses:read',
    'addresses:write',
    'shipping:create'
  ],
  rateLimit: {
    requestsPerMinute: 60,
    requestsPerDay: 10000
  },
  expiresIn: 365 * 24 * 60 * 60   // 1年
});

console.log(`APIキー: ${apiKey.key}`);
console.log(`シークレット: ${apiKey.secret}`);
```

---

## 📋 設定データモデル / Settings Data Model

```typescript
interface UserSettings {
  userId: string;
  
  // ロケール設定
  locale: {
    country: string;              // ISO 3166-1 alpha-2
    language: string;             // ISO 639-1
    timezone: string;             // IANA timezone
    dateFormat: string;           // 日付形式
    timeFormat: '12h' | '24h';    // 時刻形式
    firstDayOfWeek: 'sunday' | 'monday';
    numberFormat: {
      decimalSeparator: string;   // 小数点記号
      thousandsSeparator: string; // 千区切り記号
    };
  };
  
  // 金融設定
  financial: {
    baseCurrency: string;         // ISO 4217
    displayCurrency: string;
    exchangeRateSource: 'ecb' | 'fixer' | 'openexchange';
    autoConvert: boolean;
    tax: {
      country: string;
      taxType: string;
      standardRate: number;
      reducedRates: TaxRate[];
      includedInPrice: boolean;
      invoiceRequired: boolean;
    };
  };
  
  // 通知設定
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    channels: {
      email?: string;
      phone?: string;
    };
    frequency: 'realtime' | 'daily' | 'weekly';
  };
  
  // プライバシー設定
  privacy: {
    shareAnalytics: boolean;
    allowCookies: boolean;
    dataRetention: number;        // 日数
    autoDeleteOldData: boolean;
  };
  
  // 表示設定
  appearance: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    fontSize: 'small' | 'medium' | 'large';
    colorScheme: string;
  };
  
  // 開発者設定
  developer?: {
    apiKeysEnabled: boolean;
    webhooksEnabled: boolean;
    testMode: boolean;
  };
  
  updatedAt: Date;
}

interface TaxRate {
  category: string;               // カテゴリ
  rate: number;                   // 税率
  description?: string;           // 説明
}

interface Webhook {
  id: string;
  userId: string;
  url: string;
  events: WebhookEvent[];
  secret: string;                 // 署名検証用シークレット
  active: boolean;
  createdAt: Date;
  lastTriggeredAt?: Date;
  failureCount: number;
  status: 'active' | 'paused' | 'failed';
}

type WebhookEvent = 
  | 'address.created'
  | 'address.updated'
  | 'address.deleted'
  | 'payment.created'
  | 'payment.updated'
  | 'shipping.created'
  | 'shipping.delivered'
  | 'contact.added'
  | 'contact.removed'
  | 'security.alert';

interface APIKey {
  id: string;
  userId: string;
  key: string;                    // 公開キー
  secret: string;                 // シークレットキー（ハッシュ化）
  name: string;
  scopes: string[];
  rateLimit: {
    requestsPerMinute: number;
    requestsPerDay: number;
  };
  usage: {
    totalRequests: number;
    lastRequestAt?: Date;
  };
  active: boolean;
  createdAt: Date;
  expiresAt?: Date;
  revokedAt?: Date;
}
```

---

## 🌍 ロケール設定 / Locale Settings

### 対応言語

| 言語 | コード | UI翻訳 | 住所フォーマット |
|------|--------|--------|----------------|
| 日本語 | ja | ✅ | ✅ |
| English | en | ✅ | ✅ |
| 中文（简体） | zh-CN | ✅ | ✅ |
| 中文（繁體） | zh-TW | ✅ | ✅ |
| 한국어 | ko | ✅ | ✅ |
| Français | fr | ✅ | ✅ |
| Deutsch | de | ✅ | ✅ |
| Español | es | ✅ | ✅ |

### タイムゾーン

```typescript
import { setTimezone } from '@/cloud-address-book-app/settings/locale';

// タイムゾーンを設定
await setTimezone(userId, 'Asia/Tokyo');

// 現在時刻をユーザーのタイムゾーンで表示
const localTime = formatInUserTimezone(new Date(), userId);
console.log(localTime);  // "2024-12-02 21:30:00 JST"
```

---

## 💰 金融設定 / Financial Settings

### 対応通貨

| 通貨 | コード | 記号 | 小数点 |
|------|--------|------|--------|
| 日本円 | JPY | ¥ | 0 |
| 米ドル | USD | $ | 2 |
| ユーロ | EUR | € | 2 |
| 英ポンド | GBP | £ | 2 |
| 人民元 | CNY | ¥ | 2 |

### 為替レート

```typescript
import { getExchangeRate } from '@/cloud-address-book-app/settings/financial';

// 為替レートを取得
const rate = await getExchangeRate('JPY', 'USD');
console.log(`1 JPY = ${rate} USD`);

// 通貨を換算
const converted = await convertCurrency(1000, 'JPY', 'USD');
console.log(`¥1,000 = $${converted.toFixed(2)}`);
```

### 税率設定

```typescript
// 国別の税設定を取得
const taxConfig = await getTaxConfiguration('JP');

console.log(taxConfig);
// {
//   country: 'JP',
//   taxType: 'consumption',
//   standardRate: 0.10,
//   reducedRates: [
//     { category: 'food', rate: 0.08 },
//     { category: 'newspaper', rate: 0.08 }
//   ],
//   includedInPrice: true
// }
```

---

## 📱 ウォレット統合 / Wallet Integration

### Google Wallet（将来機能）

```typescript
import { linkGoogleWallet } from '@/cloud-address-book-app/settings/wallet-integration';

// Google Walletと連携
const wallet = await linkGoogleWallet(userId, {
  deviceId: 'device-123',
  accountEmail: 'user@gmail.com',
  syncAddresses: true,            // 住所を同期
  syncPayments: true              // 決済情報を同期
});
```

### Apple Wallet（将来機能）

```typescript
import { linkAppleWallet } from '@/cloud-address-book-app/settings/wallet-integration';

// Apple Walletと連携
const wallet = await linkAppleWallet(userId, {
  deviceId: 'device-456',
  appleId: 'user@icloud.com',
  enablePassbook: true,           // パス追加を有効化
  enableApplePay: true            // Apple Pay連携
});
```

---

## 🔧 開発者設定 / Developer Settings

### Webhook

```typescript
// Webhookペイロード例
interface WebhookPayload {
  event: string;                  // イベント名
  timestamp: string;              // ISO 8601
  data: any;                      // イベントデータ
  signature: string;              // HMAC-SHA256署名
}

// Webhook署名検証
import { verifyWebhookSignature } from '@/cloud-address-book-app/settings/developer';

const isValid = verifyWebhookSignature(
  payload,
  signature,
  webhookSecret
);

if (isValid) {
  // Webhookを処理
}
```

### APIレート制限

| プラン | 分あたり | 日あたり | 月あたり |
|--------|---------|---------|---------|
| Free | 10 | 1,000 | 10,000 |
| Basic | 60 | 10,000 | 100,000 |
| Pro | 300 | 50,000 | 500,000 |
| Enterprise | カスタム | カスタム | カスタム |

---

## 🔔 通知設定 / Notification Settings

### 通知チャネル

```typescript
import { updateNotificationSettings } from '@/cloud-address-book-app/settings';

await updateNotificationSettings(userId, {
  email: {
    enabled: true,
    address: 'user@example.com',
    frequency: 'realtime'         // realtime, daily, weekly
  },
  push: {
    enabled: true,
    devices: ['device-1', 'device-2']
  },
  sms: {
    enabled: false,
    phone: '+81-90-1234-5678'
  }
});
```

### 通知の種類

| カテゴリ | 説明 | デフォルト |
|---------|------|-----------|
| セキュリティ | ログイン、権限変更 | ON |
| 配送 | 発送、配達完了 | ON |
| 決済 | 支払い完了、失敗 | ON |
| 友達 | 友達リクエスト | ON |
| システム | メンテナンス通知 | ON |
| マーケティング | お知らせ、プロモーション | OFF |

---

## 🎨 表示設定 / Appearance Settings

### テーマ

```typescript
import { setTheme } from '@/cloud-address-book-app/settings';

// テーマを設定
await setTheme(userId, {
  mode: 'dark',                   // light, dark, auto
  colorScheme: 'blue',            // blue, green, purple, etc.
  fontSize: 'medium',             // small, medium, large
  fontFamily: 'system'            // system, serif, sans-serif
});
```

### カラースキーム

- 🔵 Blue（デフォルト）
- 🟢 Green
- 🟣 Purple
- 🔴 Red
- 🟡 Yellow

---

## 🔗 関連ページ / Related Pages

- [Dashboard](../dashboard/README.md) - 設定の概要表示
- [Security & Privacy](../security-privacy/README.md) - セキュリティ設定
- [My Addresses](../my-addresses/README.md) - 住所設定
- [Payment Methods](../payment-methods/README.md) - 決済設定

---

## 💡 推奨設定 / Recommended Settings

### 個人ユーザー向け
- ✅ 2要素認証を有効化
- ✅ セキュリティ通知をON
- ✅ 自動バックアップを有効化
- ✅ データ保持期間: 3年

### ビジネスユーザー向け
- ✅ Webhook連携
- ✅ API統合
- ✅ 監査ログを有効化
- ✅ データ保持期間: 7年（法的要件）

### 開発者向け
- ✅ テストモードを使用
- ✅ レート制限を設定
- ✅ Webhook署名を検証
- ✅ APIキーを定期的にローテーション

---

**🌐 World Address YAML / JSON** - Settings Management
