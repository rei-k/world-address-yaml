# 🏢 Sites Linked / 提携サイト管理

クラウド住所帳と連携しているECサイト・サービスの管理。住所提供ステータスと提携解除を一元管理。

Manage EC sites and services linked with Cloud Address Book. Control authorization status and revocation centrally.

---

## 🎯 主要機能 / Key Features

### EC Accounts（提携ECアカウント一覧）
- **連携サイト一覧**: クラウド住所帳を使用しているECサイト
- **アカウント情報**: 各サイトでのアカウントステータス
- **利用統計**: サイトごとの購入回数・配送回数

### Authorization Status（住所提供ステータス）
- **権限付与済み**: 住所アクセスを許可しているサイト
- **未付与**: まだ許可していないサイト
- **一時的許可**: 期限付きアクセス権限

### Revocation（提携解除）
- **住所アクセス権削除**: サイトの住所アクセスを取り消し
- **EC側管理**: 各ECサイトでのアカウント管理
- **完全削除**: アカウントと住所情報の完全削除

---

## 📂 ディレクトリ構成 / Directory Structure

```
sites-linked/
├── README.md                    # このファイル
├── ec-accounts/                 # 提携ECアカウント一覧
│   └── account-list.md         # アカウント一覧
├── authorization-status/        # 住所提供ステータス
│   ├── authorized.md           # 権限付与済
│   └── unauthorized.md         # 未付与
└── revocation/                  # 提携解除
    └── access-revocation.md    # 住所アクセス権削除
```

---

## 🚀 使用方法 / Usage

### 連携サイトの一覧取得

```typescript
import { getLinkedSites } from '@/cloud-address-book-app/sites-linked';

const sites = await getLinkedSites(userId);

sites.forEach(site => {
  console.log(`${site.name}: ${site.authorizationStatus}`);
  console.log(`  購入回数: ${site.purchaseCount}`);
  console.log(`  最終利用: ${site.lastUsedAt}`);
});
```

### 新しいサイトの連携

```typescript
import { linkNewSite } from '@/cloud-address-book-app/sites-linked';

const site = await linkNewSite(userId, {
  siteId: 'amazon-jp',
  siteName: 'Amazon Japan',
  siteUrl: 'https://www.amazon.co.jp',
  authorizeAddress: true,          // 住所アクセスを許可
  authorizePayment: false,         // 決済情報は許可しない
  expiresAt: null                  // 無期限
});
```

### 住所アクセス権限の管理

```typescript
import { 
  authorizeAddressAccess, 
  revokeAddressAccess 
} from '@/cloud-address-book-app/sites-linked';

// 住所アクセスを許可
await authorizeAddressAccess(userId, 'amazon-jp', {
  addressIds: ['addr-123'],        // 特定の住所のみ
  allowedActions: ['read', 'use'], // 読み取りと使用のみ
  expiresAt: null                  // 無期限
});

// 住所アクセスを取り消し
await revokeAddressAccess(userId, 'amazon-jp', {
  addressIds: ['addr-123'],
  reason: 'no_longer_needed'
});
```

### サイトとの完全な提携解除

```typescript
import { unlinkSite } from '@/cloud-address-book-app/sites-linked';

await unlinkSite(userId, 'amazon-jp', {
  deleteAccount: false,            // ECサイトのアカウントは削除しない
  revokeAllAccess: true,          // すべてのアクセス権を取り消し
  deleteHistory: false            // 履歴は保持
});
```

---

## 📋 連携サイトデータモデル / Linked Site Data Model

```typescript
interface LinkedSite {
  id: string;                      // 連携ID
  userId: string;                  // ユーザーID
  
  // サイト情報
  siteId: string;                  // サイトID（一意）
  siteName: string;                // サイト名
  siteUrl: string;                 // サイトURL
  siteCategory: SiteCategory;      // カテゴリ
  logo?: string;                   // ロゴURL
  
  // 連携情報
  accountEmail?: string;           // サイトでのメールアドレス
  accountId?: string;              // サイトでのアカウントID
  linkedAt: Date;                  // 連携日時
  
  // 権限情報
  authorizationStatus: AuthStatus; // 認可ステータス
  authorizedAddressIds: string[];  // 許可した住所ID
  authorizedPaymentIds: string[];  // 許可した決済手段ID
  allowedActions: Action[];        // 許可アクション
  expiresAt?: Date;               // 権限の有効期限
  
  // 統計
  purchaseCount: number;           // 購入回数
  deliveryCount: number;           // 配送回数
  lastUsedAt?: Date;              // 最終利用日時
  totalSpent?: number;            // 総購入金額
  
  // 設定
  enableNotifications: boolean;    // 通知の有効/無効
  autoRenew: boolean;             // 自動更新
  
  // メタデータ
  status: 'active' | 'suspended' | 'revoked';
  createdAt: Date;
  updatedAt: Date;
}

type SiteCategory = 
  | 'ecommerce'        // ECサイト
  | 'food_delivery'    // フードデリバリー
  | 'ride_sharing'     // ライドシェア
  | 'hotel'            // ホテル
  | 'finance'          // 金融サービス
  | 'healthcare'       // ヘルスケア
  | 'government'       // 行政サービス
  | 'other';           // その他

type AuthStatus = 
  | 'authorized'       // 権限付与済み
  | 'pending'          // 承認待ち
  | 'denied'           // 拒否
  | 'expired'          // 期限切れ
  | 'revoked';         // 取り消し済み

type Action = 
  | 'read'             // 住所を読む
  | 'use'              // 住所を使用（配送先として）
  | 'update'           // 住所を更新
  | 'share'            // 住所を共有
  | 'payment';         // 決済情報へのアクセス
```

---

## 🔐 権限管理 / Permission Management

### 段階的な権限設定

```typescript
// レベル1: 基本情報のみ
await authorizeAddressAccess(userId, siteId, {
  allowedActions: ['read'],
  addressFields: ['country', 'province', 'city']  // 都道府県レベルまで
});

// レベル2: 配送用
await authorizeAddressAccess(userId, siteId, {
  allowedActions: ['read', 'use'],
  addressFields: ['all'],                         // すべてのフィールド
  purpose: 'shipping'
});

// レベル3: 完全アクセス
await authorizeAddressAccess(userId, siteId, {
  allowedActions: ['read', 'use', 'update'],
  addressFields: ['all'],
  purpose: 'full_access'
});
```

### 一時的な権限

```typescript
// 24時間限定のアクセス
await authorizeAddressAccess(userId, siteId, {
  allowedActions: ['read', 'use'],
  expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  autoRevoke: true  // 期限後自動取り消し
});
```

---

## 📊 サイト別統計 / Site Statistics

### ダッシュボード表示

```
┌─────────────────────────────────────────┐
│ 🏢 Amazon Japan                         │
│                                         │
│ ✅ 住所アクセス: 許可済み                 │
│ 💳 決済情報: 未許可                      │
│                                         │
│ 📦 配送回数: 42回                        │
│ 💰 総購入額: ¥156,800                   │
│ 🕒 最終利用: 3日前                       │
│                                         │
│ [権限設定] [履歴表示] [提携解除]          │
└─────────────────────────────────────────┘
```

### 統計情報

| メトリクス | 説明 |
|-----------|------|
| 連携サイト数 | 現在連携しているサイトの総数 |
| アクティブサイト | 過去30日以内に利用したサイト |
| 総購入回数 | すべてのサイトでの購入合計 |
| よく使うサイト | 利用頻度が高いサイトTop5 |
| 総配送回数 | すべてのサイトからの配送合計 |

---

## 🔔 通知機能 / Notifications

### サイト関連の通知

1. **新しいサイトからのアクセス要求**
   - 初めてのサイトが住所アクセスを要求
   - 許可/拒否を選択

2. **権限更新リクエスト**
   - サイトが追加の権限を要求
   - 変更内容を確認

3. **権限の期限切れ**
   - 一時的な権限が期限切れ間近
   - 更新するか確認

4. **不審なアクセス**
   - 通常と異なるアクセスパターン
   - セキュリティ警告

---

## 🛡️ セキュリティ機能 / Security Features

### アクセスログ

すべてのサイトアクセスは記録されます：

```typescript
interface SiteAccessLog {
  id: string;
  siteId: string;
  userId: string;
  action: Action;
  addressId?: string;
  paymentId?: string;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  purpose: string;
}
```

### セキュリティアラート

```typescript
// 不審なアクセスを検知
const alerts = await getSecurityAlerts(userId);

alerts.forEach(alert => {
  console.log(`⚠️ ${alert.siteName}`);
  console.log(`   ${alert.message}`);
  console.log(`   アクション: ${alert.suggestedAction}`);
});

// 例:
// ⚠️ Amazon Japan
//    通常と異なる場所からのアクセスが検出されました
//    アクション: アカウントの確認をお願いします
```

---

## 🌐 主要連携サイト / Major Linked Sites

### ECサイト
- 🛒 Amazon
- 🛍️ 楽天市場
- 📦 Yahoo!ショッピング
- 🏪 メルカリ

### フードデリバリー
- 🍕 Uber Eats
- 🍱 出前館
- 🍔 menu

### ライドシェア
- 🚗 Uber
- 🚕 DiDi

### ホテル
- 🏨 楽天トラベル
- 🏩 Booking.com
- 🏨 Expedia

### その他
- 🏦 銀行サービス
- 🏥 医療サービス
- 🏛️ 行政サービス

---

## 📱 モバイル対応 / Mobile Support

### ワンタップ認証
```typescript
// モバイルアプリでのワンタップ認証
await authenticateWithCloudAddress({
  siteId: 'amazon-jp',
  action: 'authorize_address',
  biometric: true  // 生体認証を使用
});
```

### QRコード認証
```typescript
// QRコードでサイト連携
const qr = await generateSiteLinkQR(userId, siteId);
// サイト側でQRコードをスキャンして即座に連携
```

---

## 🔗 関連ページ / Related Pages

- [My Addresses](../my-addresses/README.md) - 提供する住所の管理
- [Payment Methods](../payment-methods/README.md) - 提供する決済情報
- [Dashboard](../dashboard/README.md) - サイト別利用統計
- [Security & Privacy](../security-privacy/README.md) - アクセスログとセキュリティ

---

## 💡 ベストプラクティス / Best Practices

### 権限管理
- ✅ 必要最小限の権限のみ付与
- ✅ 定期的に権限を見直し
- ✅ 使用していないサイトは提携解除

### セキュリティ
- ✅ アクセスログを定期的に確認
- ✅ 不審なアクセスは即座に報告
- ✅ 強力なパスワードを使用

### プライバシー
- ✅ 個人情報の共有範囲を確認
- ✅ 一時的な権限を活用
- ✅ 不要になった連携は削除

---

**🌐 World Address YAML / JSON** - Sites Linked Management
