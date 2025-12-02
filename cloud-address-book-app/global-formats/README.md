# 🌍 Global Formats / Schema Library / グローバルフォーマット・スキーマライブラリ

世界中の国・自治領・海外領の住所フォーム一覧と多言語対応、PID生成仕様を管理。

Manage address forms for countries, territories, and overseas regions worldwide, with multilingual support and PID generation specifications.

---

## 🎯 主要機能 / Key Features

### Country Formats（国・自治領・海外領の住所フォーム一覧）
- **全世界対応**: 200カ国以上の住所フォーマット
- **階層構造**: 国→州→市→区→町→番地までの階層管理
- **バリデーション**: 各国固有の住所ルールに基づく検証

### Multilingual（多言語フォーマット管理）
- **現地語**: 各国の公用語での住所表記
- **英語**: 国際配送用の英語表記
- **自動翻訳**: 住所の自動翻訳・音訳

### PID Generation（PID生成仕様）
- **ハッシュ空間**: 衝突を避けるハッシュアルゴリズム
- **階層識別設定**: 国・地域ごとの階層構造定義
- **一意性保証**: グローバルで一意なPID生成

---

## 📂 ディレクトリ構成 / Directory Structure

```
global-formats/
├── README.md                    # このファイル
├── country-formats/             # 国・自治領・海外領の住所フォーム
│   ├── asia.md                 # アジア
│   ├── europe.md               # ヨーロッパ
│   ├── americas.md             # アメリカ大陸
│   ├── africa.md               # アフリカ
│   ├── oceania.md              # オセアニア
│   └── antarctica.md           # 南極
├── multilingual/                # 多言語フォーマット管理
│   ├── local-language.md       # 現地語
│   └── english.md              # 英語
└── pid-generation/              # PID生成仕様
    ├── hash-space.md           # ハッシュ空間
    └── hierarchical-id.md      # 階層識別設定
```

---

## 🚀 使用方法 / Usage

### 国別住所フォーマットの取得

```typescript
import { getCountryFormat } from '@/cloud-address-book-app/global-formats';

// 日本の住所フォーマット
const jpFormat = await getCountryFormat('JP');

console.log(jpFormat);
// {
//   country: 'JP',
//   name: 'Japan',
//   localName: '日本',
//   format: {
//     order: ['postalCode', 'province', 'city', 'ward', 'streetAddress', 'building', 'room'],
//     requiredFields: ['postalCode', 'province', 'city', 'streetAddress'],
//     postalCodeFormat: '^[0-9]{3}-[0-9]{4}$',
//     hierarchy: {
//       level1: 'province',      // 都道府県
//       level2: 'city',          // 市区町村
//       level3: 'ward',          // 町・丁目
//       level4: 'streetAddress'  // 番地
//     }
//   }
// }
```

### 住所の正規化

```typescript
import { normalizeAddress } from '@/cloud-address-book-app/global-formats';

const normalized = await normalizeAddress({
  country: 'JP',
  rawAddress: '東京都渋谷区道玄坂1-2-3 タワーマンション1001号室'
});

console.log(normalized);
// {
//   country: 'JP',
//   postalCode: null,  // 郵便番号が含まれていない
//   province: '東京都',
//   city: '渋谷区',
//   streetAddress: '道玄坂1-2-3',
//   building: 'タワーマンション',
//   room: '1001号室'
// }
```

### 多言語対応

```typescript
import { translateAddress } from '@/cloud-address-book-app/global-formats';

// 日本語住所を英語に翻訳
const englishAddress = await translateAddress({
  country: 'JP',
  postalCode: '150-0043',
  province: '東京都',
  city: '渋谷区',
  streetAddress: '道玄坂1-2-3'
}, 'en');

console.log(englishAddress);
// {
//   country: 'JP',
//   postalCode: '150-0043',
//   province: 'Tokyo',
//   city: 'Shibuya-ku',
//   streetAddress: '1-2-3 Dogenzaka'
// }
```

### PID生成

```typescript
import { generatePID } from '@/cloud-address-book-app/global-formats/pid-generation';

const pid = await generatePID({
  country: 'JP',
  admin1: '13',          // 東京都
  admin2: '113',         // 渋谷区
  locality: '01',        // 道玄坂
  sublocality: 'T07',    // 1-2-3
  block: 'B12',          // 番地
  building: 'BN02',      // タワーマンション
  unit: 'R1001'          // 1001号室
});

console.log(pid);
// "JP-13-113-01-T07-B12-BN02-R1001"
```

---

## 🗺️ 対応国一覧 / Supported Countries

### アジア / Asia（54カ国）

```typescript
const asiaCountries = [
  { code: 'JP', name: 'Japan', localName: '日本' },
  { code: 'CN', name: 'China', localName: '中国' },
  { code: 'KR', name: 'South Korea', localName: '대한민국' },
  { code: 'IN', name: 'India', localName: 'भारत' },
  { code: 'TH', name: 'Thailand', localName: 'ประเทศไทย' },
  // ... その他49カ国
];
```

### ヨーロッパ / Europe（73カ国・地域）

```typescript
const europeCountries = [
  { code: 'GB', name: 'United Kingdom', localName: 'United Kingdom' },
  { code: 'FR', name: 'France', localName: 'France' },
  { code: 'DE', name: 'Germany', localName: 'Deutschland' },
  { code: 'IT', name: 'Italy', localName: 'Italia' },
  { code: 'ES', name: 'Spain', localName: 'España' },
  // ... その他68カ国
];
```

### アメリカ大陸 / Americas（45カ国・地域）

```typescript
const americasCountries = [
  { code: 'US', name: 'United States', localName: 'United States' },
  { code: 'CA', name: 'Canada', localName: 'Canada' },
  { code: 'MX', name: 'Mexico', localName: 'México' },
  { code: 'BR', name: 'Brazil', localName: 'Brasil' },
  { code: 'AR', name: 'Argentina', localName: 'Argentina' },
  // ... その他40カ国
];
```

詳細は [World Address Data](../../data/README.md) を参照

---

## 📋 住所フォーマットスキーマ / Address Format Schema

```typescript
interface CountryAddressFormat {
  country: string;                 // ISO 3166-1 alpha-2
  name: string;                    // 英語名
  localName: string;               // 現地語名
  
  format: {
    order: AddressField[];         // 住所フィールドの順序
    requiredFields: AddressField[]; // 必須フィールド
    optionalFields: AddressField[]; // 任意フィールド
    
    // バリデーション
    postalCodeFormat?: string;     // 郵便番号の正規表現
    postalCodeExample?: string;    // 郵便番号の例
    
    // 階層構造
    hierarchy: {
      level1?: string;             // 第1階層（都道府県/州）
      level2?: string;             // 第2階層（市区町村）
      level3?: string;             // 第3階層（町・丁目）
      level4?: string;             // 第4階層（番地）
      level5?: string;             // 第5階層（建物）
      level6?: string;             // 第6階層（部屋番号）
    };
    
    // 表示形式
    displayFormat: {
      domestic: string;            // 国内表記
      international: string;       // 国際表記
      condensed: string;           // 簡略表記
    };
  };
  
  // 多言語対応
  languages: Language[];
  
  // PID設定
  pidConfig: {
    hierarchyDepth: number;        // 階層の深さ
    hashAlgorithm: 'sha256' | 'sha512';
    encoding: 'base64' | 'hex';
  };
}

type AddressField = 
  | 'country'
  | 'postalCode'
  | 'province'        // 都道府県/州
  | 'city'            // 市区町村
  | 'ward'            // 区/町
  | 'district'        // 地区
  | 'streetAddress'   // 番地
  | 'building'        // 建物名
  | 'room'            // 部屋番号
  | 'floor'           // 階数
  | 'landmark';       // ランドマーク

interface Language {
  code: string;                    // ISO 639-1
  name: string;                    // 言語名
  script: string;                  // 文字体系
  direction: 'ltr' | 'rtl';        // 書字方向
  role: 'official' | 'shipping_required' | 'optional';
}
```

---

## 🌐 多言語対応 / Multilingual Support

### 対応言語

| 言語 | コード | 対応状況 |
|------|--------|---------|
| 日本語 | ja | ✅ 完全対応 |
| 英語 | en | ✅ 完全対応 |
| 中国語（簡体字） | zh-CN | ✅ 完全対応 |
| 中国語（繁体字） | zh-TW | ✅ 完全対応 |
| 韓国語 | ko | ✅ 完全対応 |
| フランス語 | fr | ✅ 完全対応 |
| ドイツ語 | de | ✅ 完全対応 |
| スペイン語 | es | ✅ 完全対応 |
| イタリア語 | it | ✅ 完全対応 |
| ポルトガル語 | pt | ✅ 完全対応 |
| アラビア語 | ar | 🔄 対応中 |
| ヒンディー語 | hi | 🔄 対応中 |

### 住所翻訳API

```typescript
import { AddressTranslator } from '@/cloud-address-book-app/global-formats/multilingual';

const translator = new AddressTranslator();

// 日本語→英語
const en = await translator.translate(jpAddress, 'ja', 'en');

// 英語→中国語
const zh = await translator.translate(enAddress, 'en', 'zh-CN');

// 自動検出→英語
const auto = await translator.translate(someAddress, 'auto', 'en');
```

---

## 🔑 PID生成仕様 / PID Generation Specification

### PIDフォーマット

```
<Country>-<Admin1>-<Admin2>-<Locality>-<Sublocality>-<Block>-<Building>-<Unit>
```

### 階層レベル

| レベル | フィールド | 例（日本） | 例（アメリカ） |
|--------|-----------|-----------|---------------|
| 0 | Country | JP | US |
| 1 | Admin1 | 13 (東京都) | CA (California) |
| 2 | Admin2 | 113 (渋谷区) | SF (San Francisco) |
| 3 | Locality | 01 | 94102 |
| 4 | Sublocality | T07 (道玄坂1丁目) | SOMA |
| 5 | Block | B12 (12番地) | BLOCK-01 |
| 6 | Building | BN02 (タワーマンション) | BLDG-ABC |
| 7 | Unit | R1001 (1001号室) | UNIT-123 |

### ハッシュアルゴリズム

```typescript
import { hashPID } from '@/cloud-address-book-app/global-formats/pid-generation';

// SHA-256ベースのPIDハッシュ
const pidHash = hashPID({
  algorithm: 'sha256',
  input: normalizedAddress,
  salt: process.env.PID_SALT,  // サーバー側の秘密塩
  iterations: 100000
});

// PIDから逆算できないことを保証
const isSecure = verifyPIDSecurity(pidHash);
```

---

## 📊 スキーマライブラリ統計 / Schema Library Statistics

### 収録データ

| カテゴリ | 件数 |
|---------|-----|
| 国・地域 | 249 |
| 住所フォーマット | 249 |
| 多言語対応 | 50+ |
| PID階層定義 | 249 |
| バリデーションルール | 249 |

### データソース

- **libaddressinput**: Google提供の国際住所メタデータ
- **World Address YAML**: 独自の拡張住所データ
- **Universal Postal Union**: 万国郵便連合の標準
- **ISO 3166**: 国名コード
- **ISO 639**: 言語コード

---

## 🔍 住所検索・検証 / Address Search & Validation

### 住所検証

```typescript
import { validateAddress } from '@/cloud-address-book-app/global-formats';

const validation = await validateAddress({
  country: 'JP',
  postalCode: '150-0043',
  province: '東京都',
  city: '渋谷区',
  streetAddress: '道玄坂1-2-3'
});

console.log(validation);
// {
//   valid: true,
//   errors: [],
//   warnings: [],
//   suggestions: [],
//   normalizedAddress: { ... },
//   confidence: 0.95
// }
```

### 住所サジェスト

```typescript
import { suggestAddress } from '@/cloud-address-book-app/global-formats';

const suggestions = await suggestAddress({
  country: 'JP',
  postalCode: '150-0043',
  partialAddress: '道玄坂'
});

// [
//   '道玄坂1丁目',
//   '道玄坂2丁目',
//   '道玄坂3丁目'
// ]
```

---

## 🔗 関連ページ / Related Pages

- [My Addresses](../my-addresses/README.md) - 住所管理
- [Shipping Tools](../shipping-tools/README.md) - 配送ツール
- [Data Directory](../../data/README.md) - 住所データ
- [Schema Documentation](../../docs/schema/README.md) - スキーマ詳細

---

## 💡 開発者向け / For Developers

### スキーマの追加

新しい国のスキーマを追加する場合:

```typescript
import { addCountrySchema } from '@/cloud-address-book-app/global-formats';

await addCountrySchema({
  country: 'XX',
  name: 'New Country',
  localName: 'ニューカントリー',
  format: {
    order: ['postalCode', 'province', 'city', 'streetAddress'],
    requiredFields: ['province', 'city', 'streetAddress'],
    postalCodeFormat: '^[0-9]{5}$',
    hierarchy: {
      level1: 'province',
      level2: 'city',
      level3: 'streetAddress'
    }
  }
});
```

### カスタムバリデーション

```typescript
import { registerValidator } from '@/cloud-address-book-app/global-formats';

// カスタムバリデータの登録
registerValidator('JP', async (address) => {
  // 日本独自のバリデーションロジック
  if (!address.postalCode.match(/^[0-9]{3}-[0-9]{4}$/)) {
    return {
      valid: false,
      errors: ['郵便番号の形式が正しくありません']
    };
  }
  return { valid: true, errors: [] };
});
```

---

**🌐 World Address YAML / JSON** - Global Formats & Schema Library
