# 💳 Payment Methods / 決済手段管理

クラウド住所帳と統合された決済手段管理機能。住所と決済情報を分離して安全に管理します。

Integrated payment method management with Cloud Address Book. Securely manage payment information separately from addresses.

---

## 🎯 主要機能 / Key Features

### Credit Cards（クレジットカード）
- **Visa / Mastercard / JCB / Amex**: 主要カードブランド対応
- **トークン化**: カード情報を安全に保存
- **有効期限管理**: 期限切れアラート

### Digital Payment IDs（デジタル決済ID）
- **PayPal**: PayPalアカウント連携
- **Stripe Tokens**: Stripe決済トークン
- **Apple Pay**: Apple Pay統合
- **Google Pay**: Google Pay統合

### Bank Account Links（銀行口座リンク）※将来拡張
- **IBAN**: 国際銀行口座番号
- **Routing ID**: アメリカの銀行ルーティング番号
- **口座振替**: 定期支払い用

### Payment History（支払い履歴）
- **住所とは分離**: 決済情報のみ記録
- **提出ログ**: どのECサイトに提供したか
- **監査可能**: すべての決済アクセスを記録

---

## 📂 ディレクトリ構成 / Directory Structure

```
payment-methods/
├── README.md                   # このファイル
├── credit-cards/               # クレジットカード
│   ├── visa.md                # Visa
│   ├── mastercard.md          # Mastercard
│   ├── jcb.md                 # JCB
│   └── amex.md                # American Express
├── digital-payments/           # デジタル決済ID
│   ├── paypal.md              # PayPal
│   ├── stripe-tokens.md       # Stripeトークン
│   ├── apple-pay.md           # Apple Pay
│   └── google-pay.md          # Google Pay
├── bank-accounts/              # 銀行口座リンク（将来拡張）
│   ├── iban.md                # IBAN
│   └── routing-id.md          # Routing ID
└── payment-history/            # 支払い履歴
    └── submission-log.md      # 提出ログのみ
```

---

## 🚀 使用方法 / Usage

### クレジットカードの登録

```typescript
import { addCreditCard } from '@/cloud-address-book-app/payment-methods';

const card = await addCreditCard(userId, {
  cardNumber: '4111111111111111',  // トークン化される
  cardholderName: '山田 太郎',
  expiryMonth: 12,
  expiryYear: 2026,
  cvv: '123',                      // 保存されない
  brand: 'visa',
  billingAddressId: 'addr-123'     // 請求先住所ID
});

// 返されるのはトークン化されたカード情報のみ
console.log(card.token);  // tok_visa_XXXXXX
console.log(card.last4);  // 1111
```

### デジタル決済の連携

```typescript
import { linkDigitalPayment } from '@/cloud-address-book-app/payment-methods';

// PayPal連携
const paypal = await linkDigitalPayment(userId, {
  provider: 'paypal',
  email: 'user@example.com',
  authToken: 'paypal_auth_token'
});

// Apple Pay連携
const applePay = await linkDigitalPayment(userId, {
  provider: 'apple_pay',
  deviceId: 'device-123',
  appleToken: 'apple_pay_token'
});
```

### 決済手段の取得

```typescript
import { 
  getDefaultPaymentMethod,
  getAllPaymentMethods,
  getPaymentHistory 
} from '@/cloud-address-book-app/payment-methods';

// デフォルト決済手段を取得
const defaultPayment = await getDefaultPaymentMethod(userId);

// 全決済手段を取得
const payments = await getAllPaymentMethods(userId);

// 決済履歴を取得（提出ログのみ）
const history = await getPaymentHistory(userId, {
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-12-31')
});
```

---

## 📋 決済データモデル / Payment Data Model

```typescript
interface PaymentMethod {
  id: string;                      // 決済手段ID
  userId: string;                  // ユーザーID
  type: PaymentType;               // 決済タイプ
  isDefault: boolean;              // デフォルト決済手段フラグ
  
  // カード情報（トークン化）
  token: string;                   // トークン
  last4?: string;                  // 下4桁
  brand?: string;                  // ブランド（visa, mastercard, etc.）
  expiryMonth?: number;            // 有効期限（月）
  expiryYear?: number;             // 有効期限（年）
  
  // デジタル決済情報
  provider?: string;               // プロバイダー（paypal, stripe, etc.）
  email?: string;                  // メールアドレス
  
  // 請求先住所
  billingAddressId?: string;       // 請求先住所ID
  
  // メタデータ
  verified: boolean;               // 検証済みフラグ
  verificationDate?: Date;         // 検証日時
  
  // タイムスタンプ
  createdAt: Date;                 // 作成日時
  updatedAt: Date;                 // 更新日時
  lastUsedAt?: Date;               // 最終利用日時
  expiresAt?: Date;                // 有効期限（カードの場合）
}

type PaymentType = 
  | 'credit_card' 
  | 'debit_card'
  | 'paypal'
  | 'stripe'
  | 'apple_pay'
  | 'google_pay'
  | 'bank_account';
```

---

## 🔐 セキュリティ機能 / Security Features

### PCI DSS準拠
- ✅ **カード情報の非保存**: トークン化により実カード番号は保存しない
- ✅ **CVV非保存**: セキュリティコードは決済時のみ使用
- ✅ **暗号化通信**: すべての通信をTLS 1.3で暗号化

### トークン化
```typescript
// カード情報をトークン化
const tokenized = await tokenizeCreditCard({
  cardNumber: '4111111111111111',
  expiryMonth: 12,
  expiryYear: 2026
});

// トークンのみ保存
console.log(tokenized);
// {
//   token: 'tok_visa_abc123',
//   last4: '1111',
//   brand: 'visa',
//   fingerprint: 'fp_xyz789'
// }
```

### 3Dセキュア対応
- **3DS 2.0**: 最新の3Dセキュア対応
- **生体認証**: 指紋・顔認証連携
- **チャレンジフロー**: 必要時のみ追加認証

---

## 💰 決済フロー / Payment Flow

### ECサイトでの決済

```typescript
import { processPayment } from '@/cloud-address-book-app/payment-methods';

// 1. 決済情報と配送先を一緒に送信
const payment = await processPayment({
  userId: 'user-123',
  paymentMethodId: 'pm-456',
  shippingAddressId: 'addr-789',
  amount: 5000,
  currency: 'JPY',
  orderId: 'order-001'
});

// 2. ZK証明と決済トークンを返す
console.log(payment);
// {
//   paymentToken: 'tok_payment_xyz',
//   shippingProof: { zkProof: '...' },  // 住所のZK証明
//   status: 'authorized'
// }
```

### ワンクリックチェックアウト

```typescript
import { quickCheckout } from '@/cloud-address-book-app/payment-methods';

// デフォルト決済手段とデフォルト住所で即座に決済
const result = await quickCheckout(userId, {
  amount: 5000,
  currency: 'JPY',
  merchantId: 'merchant-123'
});
```

---

## 📊 決済統計 / Payment Statistics

### 表示される統計情報

| メトリクス | 説明 |
|-----------|------|
| 登録済み決済手段 | 登録されている決済手段の総数 |
| デフォルト決済手段 | 現在のデフォルト決済 |
| 今月の利用回数 | 今月の決済回数 |
| 利用中のサイト | 決済情報を提供しているECサイト数 |
| 期限切れアラート | 有効期限が近いカードの数 |

---

## 🔔 通知機能 / Notifications

### 決済関連の通知

1. **有効期限アラート**
   - カードの有効期限が30日以内
   - 更新を促す通知

2. **不正利用検知**
   - 通常と異なる決済パターン
   - 即座にアラート

3. **新しいサイトでの利用**
   - 初めてのECサイトで決済情報が使用された
   - 承認確認

4. **決済失敗通知**
   - 決済が失敗した場合
   - 原因と対処法を表示

---

## 🌍 国際決済対応 / International Payment Support

### 対応通貨
- 🇯🇵 JPY (日本円)
- 🇺🇸 USD (米ドル)
- 🇪🇺 EUR (ユーロ)
- 🇬🇧 GBP (ポンド)
- 🇨🇳 CNY (人民元)
- その他150通貨以上

### 為替レート
- **リアルタイム為替**: 最新レートで自動換算
- **手数料明示**: 為替手数料を事前表示
- **通貨選択**: ユーザーが決済通貨を選択可能

---

## 📱 モバイルウォレット統合 / Mobile Wallet Integration

### Apple Pay
```typescript
import { setupApplePay } from '@/cloud-address-book-app/payment-methods';

const applePay = await setupApplePay({
  merchantId: 'merchant.com.example',
  supportedNetworks: ['visa', 'mastercard', 'amex'],
  merchantCapabilities: ['3DS', 'debit', 'credit']
});
```

### Google Pay
```typescript
import { setupGooglePay } from '@/cloud-address-book-app/payment-methods';

const googlePay = await setupGooglePay({
  merchantId: '12345678901234567890',
  environment: 'PRODUCTION',
  allowedCardNetworks: ['VISA', 'MASTERCARD', 'JCB']
});
```

---

## 🔗 関連ページ / Related Pages

- [My Addresses](../my-addresses/README.md) - 請求先住所管理
- [Dashboard](../dashboard/README.md) - 決済統計表示
- [Sites Linked](../sites-linked/README.md) - 決済情報を提供しているサイト
- [Security & Privacy](../security-privacy/README.md) - セキュリティ設定

---

## ⚠️ 重要事項 / Important Notes

### プライバシーポリシー
- 決済情報は住所情報とは**完全に分離**して管理
- 実カード番号は**一切保存しない**（トークン化）
- ECサイトには**トークンのみ**を提供

### 責任の範囲
- カード情報の保護: クラウド住所帳側で対応
- 決済処理: 各決済プロバイダー側で実行
- 不正利用の補償: カード会社の規約に準拠

---

**🌐 World Address YAML / JSON** - Payment Methods Management
