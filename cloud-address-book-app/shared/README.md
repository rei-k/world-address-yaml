# 🔧 Shared Components / 共通コンポーネント

クラウド住所帳アプリケーション全体で使用される共通コンポーネント、型定義、ユーティリティ、定数を管理。

Manage common components, type definitions, utilities, and constants used across the Cloud Address Book application.

---

## 📂 ディレクトリ構成 / Directory Structure

```
shared/
├── README.md                    # このファイル
├── components/                  # 共通コンポーネント
│   ├── AddressCard.tsx         # 住所カード
│   ├── AddressForm.tsx         # 住所入力フォーム
│   ├── QRCodeGenerator.tsx     # QRコード生成
│   ├── QRCodeScanner.tsx       # QRコードスキャナー
│   ├── PaymentMethodCard.tsx   # 決済手段カード
│   ├── ContactCard.tsx         # 連絡先カード
│   ├── Modal.tsx               # モーダルダイアログ
│   ├── Toast.tsx               # トースト通知
│   └── LoadingSpinner.tsx      # ローディング表示
├── types/                       # 型定義
│   ├── address.ts              # 住所関連の型
│   ├── payment.ts              # 決済関連の型
│   ├── contact.ts              # 連絡先関連の型
│   ├── shipping.ts             # 配送関連の型
│   ├── security.ts             # セキュリティ関連の型
│   └── api.ts                  # API関連の型
├── utils/                       # ユーティリティ
│   ├── validation.ts           # バリデーション関数
│   ├── formatting.ts           # フォーマット関数
│   ├── encryption.ts           # 暗号化関数
│   ├── pid.ts                  # PID生成・検証
│   ├── qr.ts                   # QRコード処理
│   └── date.ts                 # 日付処理
└── constants/                   # 定数
    ├── countries.ts            # 国コード一覧
    ├── currencies.ts           # 通貨コード一覧
    ├── carriers.ts             # 配送業者一覧
    ├── api-endpoints.ts        # APIエンドポイント
    └── error-messages.ts       # エラーメッセージ
```

---

## 🧩 共通コンポーネント / Common Components

### AddressCard

住所情報を表示するカードコンポーネント

```tsx
import { AddressCard } from '@/shared/components/AddressCard';

<AddressCard
  address={{
    id: 'addr-123',
    label: '自宅',
    country: 'JP',
    postalCode: '150-0043',
    province: '東京都',
    city: '渋谷区',
    streetAddress: '道玄坂1-2-3',
    building: 'タワーマンション',
    room: '1001'
  }}
  isDefault={true}
  onEdit={() => handleEdit()}
  onDelete={() => handleDelete()}
  onSetDefault={() => handleSetDefault()}
/>
```

### AddressForm

住所入力フォームコンポーネント

```tsx
import { AddressForm } from '@/shared/components/AddressForm';

<AddressForm
  country="JP"
  initialValues={address}
  onSubmit={(values) => handleSubmit(values)}
  onCancel={() => handleCancel()}
  validateOnChange={true}
/>
```

### QRCodeGenerator

QRコード生成コンポーネント

```tsx
import { QRCodeGenerator } from '@/shared/components/QRCodeGenerator';

<QRCodeGenerator
  data={{
    type: 'address',
    addressId: 'addr-123',
    gapId: 'gap:user:abc123'
  }}
  size={256}
  errorCorrectionLevel="H"
  onGenerated={(imageData) => console.log('QR生成完了')}
/>
```

---

## 📝 型定義 / Type Definitions

### address.ts

```typescript
export interface Address {
  id: string;
  userId: string;
  label: string;
  isDefault: boolean;
  
  // 住所情報
  country: string;
  postalCode: string;
  province: string;
  city: string;
  streetAddress: string;
  building?: string;
  room?: string;
  
  // メタデータ
  pid: string;
  normalized: boolean;
  verified: boolean;
  
  // タイムスタンプ
  createdAt: Date;
  updatedAt: Date;
}

export interface AddressInput {
  country: string;
  postalCode?: string;
  province: string;
  city: string;
  streetAddress: string;
  building?: string;
  room?: string;
}

export interface AddressValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: string[];
  suggestions: string[];
  normalizedAddress?: Address;
}
```

### payment.ts

```typescript
export interface PaymentMethod {
  id: string;
  userId: string;
  type: PaymentType;
  isDefault: boolean;
  
  // カード情報（トークン化）
  token: string;
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  
  // タイムスタンプ
  createdAt: Date;
  expiresAt?: Date;
}

export type PaymentType = 
  | 'credit_card'
  | 'debit_card'
  | 'paypal'
  | 'apple_pay'
  | 'google_pay';
```

---

## 🛠️ ユーティリティ / Utilities

### validation.ts

```typescript
import { validateAddress } from '@/shared/utils/validation';

// 住所のバリデーション
const result = validateAddress(address, 'JP');

if (result.valid) {
  console.log('有効な住所です');
} else {
  console.log('エラー:', result.errors);
}

// 郵便番号のバリデーション
export function validatePostalCode(
  postalCode: string,
  country: string
): boolean {
  const patterns = {
    JP: /^[0-9]{3}-[0-9]{4}$/,
    US: /^[0-9]{5}(-[0-9]{4})?$/,
    GB: /^[A-Z]{1,2}[0-9]{1,2}[A-Z]?\s?[0-9][A-Z]{2}$/
  };
  
  const pattern = patterns[country];
  return pattern ? pattern.test(postalCode) : true;
}
```

### formatting.ts

```typescript
import { formatAddress, formatCurrency } from '@/shared/utils/formatting';

// 住所のフォーマット
const formatted = formatAddress(address, {
  style: 'domestic',  // domestic, international, condensed
  country: 'JP'
});
// "〒150-0043 東京都渋谷区道玄坂1-2-3 タワーマンション1001"

// 通貨のフォーマット
const price = formatCurrency(5000, 'JPY', 'ja-JP');
// "¥5,000"
```

### encryption.ts

```typescript
import { encrypt, decrypt } from '@/shared/utils/encryption';

// データの暗号化
const encrypted = await encrypt(data, {
  algorithm: 'AES-256-GCM',
  key: encryptionKey
});

// データの復号化
const decrypted = await decrypt(encrypted, {
  algorithm: 'AES-256-GCM',
  key: encryptionKey
});
```

### pid.ts

```typescript
import { generatePID, validatePID, decodePID } from '@/shared/utils/pid';

// PIDの生成
const pid = await generatePID({
  country: 'JP',
  admin1: '13',
  admin2: '113',
  locality: '01'
});
// "JP-13-113-01"

// PIDの検証
const isValid = validatePID(pid);

// PIDのデコード
const components = decodePID(pid);
// { country: 'JP', admin1: '13', admin2: '113', locality: '01' }
```

---

## 📊 定数 / Constants

### countries.ts

```typescript
export const COUNTRIES = {
  JP: {
    code: 'JP',
    name: 'Japan',
    localName: '日本',
    continent: 'Asia',
    postalCodeFormat: '^[0-9]{3}-[0-9]{4}$',
    phonePrefix: '+81'
  },
  US: {
    code: 'US',
    name: 'United States',
    localName: 'United States',
    continent: 'Americas',
    postalCodeFormat: '^[0-9]{5}(-[0-9]{4})?$',
    phonePrefix: '+1'
  },
  // ... その他の国
};

export const COUNTRY_CODES = Object.keys(COUNTRIES);
```

### currencies.ts

```typescript
export const CURRENCIES = {
  JPY: {
    code: 'JPY',
    symbol: '¥',
    name: 'Japanese Yen',
    decimalPlaces: 0
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    decimalPlaces: 2
  },
  // ... その他の通貨
};
```

### carriers.ts

```typescript
export const CARRIERS = {
  yamato: {
    id: 'yamato',
    name: 'ヤマト運輸',
    nameEn: 'Yamato Transport',
    country: 'JP',
    trackingUrl: 'https://toi.kuronekoyamato.co.jp/cgi-bin/tneko'
  },
  sagawa: {
    id: 'sagawa',
    name: '佐川急便',
    nameEn: 'Sagawa Express',
    country: 'JP',
    trackingUrl: 'https://k2k.sagawa-exp.co.jp/p/sagawa/web/okurijoinput.jsp'
  },
  // ... その他の配送業者
};
```

### api-endpoints.ts

```typescript
export const API_ENDPOINTS = {
  // 住所API
  addresses: {
    list: '/v1/addresses',
    create: '/v1/addresses',
    get: (id: string) => `/v1/addresses/${id}`,
    update: (id: string) => `/v1/addresses/${id}`,
    delete: (id: string) => `/v1/addresses/${id}`
  },
  
  // 決済API
  payments: {
    list: '/v1/payments',
    create: '/v1/payments',
    get: (id: string) => `/v1/payments/${id}`
  },
  
  // 配送API
  shipping: {
    create: '/v1/shipping/waybill',
    track: (trackingNumber: string) => `/v1/shipping/track/${trackingNumber}`
  }
};
```

---

## 🎨 スタイリング / Styling

### Tailwind CSS設定

```typescript
// tailwind.config.js
export default {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        }
      }
    }
  }
};
```

### カラーパレット

| 用途 | カラー | Hex |
|------|--------|-----|
| Primary | Blue | #3B82F6 |
| Success | Green | #10B981 |
| Warning | Yellow | #F59E0B |
| Error | Red | #EF4444 |
| Info | Cyan | #06B6D4 |

---

## 🧪 テスト / Testing

### ユニットテスト

```typescript
import { validatePostalCode } from '@/shared/utils/validation';

describe('validatePostalCode', () => {
  it('should validate Japanese postal codes', () => {
    expect(validatePostalCode('150-0043', 'JP')).toBe(true);
    expect(validatePostalCode('1500043', 'JP')).toBe(false);
  });
  
  it('should validate US ZIP codes', () => {
    expect(validatePostalCode('12345', 'US')).toBe(true);
    expect(validatePostalCode('12345-6789', 'US')).toBe(true);
    expect(validatePostalCode('ABCDE', 'US')).toBe(false);
  });
});
```

---

## 📚 使用例 / Usage Examples

### フル機能の住所入力フォーム

```tsx
import { AddressForm } from '@/shared/components/AddressForm';
import { validateAddress } from '@/shared/utils/validation';
import { formatAddress } from '@/shared/utils/formatting';

function AddressPage() {
  const handleSubmit = async (values) => {
    // バリデーション
    const validation = await validateAddress(values, values.country);
    
    if (!validation.valid) {
      showErrors(validation.errors);
      return;
    }
    
    // フォーマット
    const formatted = formatAddress(validation.normalizedAddress, {
      style: 'domestic',
      country: values.country
    });
    
    // 保存
    await saveAddress(validation.normalizedAddress);
  };
  
  return (
    <AddressForm
      country="JP"
      onSubmit={handleSubmit}
      validateOnChange={true}
    />
  );
}
```

---

## 🔗 関連ページ / Related Pages

- [Dashboard](../dashboard/README.md)
- [My Addresses](../my-addresses/README.md)
- [Payment Methods](../payment-methods/README.md)
- [All Sections](../README.md)

---

**🌐 World Address YAML / JSON** - Shared Components & Utilities
