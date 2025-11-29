# 🌍 World Address YAML / JSON

世界各国の住所形式をYAML形式とJSON形式で構造化したオープンデータベースです。

## 📋 概要

このプロジェクトは、世界中の国・地域の住所体系を標準化されたYAML形式およびJSON形式で記述し、以下の用途に活用できるデータを提供します：

- 🚚 **配送実務**: 国際配送のためのフォーム設計や住所ラベル生成
- 📚 **研究・分析**: 各国の住所制度の比較研究や標準化

## 📂 データ形式

全てのデータはYAMLとJSONの両形式で提供されています：

- **YAML**: 人間が読みやすく編集しやすい形式
- **JSON**: プログラムからの利用に最適化された形式

各国・地域のデータは同じディレクトリ内に `.yaml` と `.json` の両方のファイルとして配置されています。

## 📁 ディレクトリ構造

```
world-address-yaml/
├── africa/                 # アフリカ
│   ├── central_africa/
│   ├── eastern_africa/
│   ├── northern_africa/
│   ├── southern_africa/
│   └── west_africa/
├── americas/               # アメリカ大陸
│   ├── caribbean/
│   ├── central_america/
│   ├── north_america/
│   └── south_america/
├── antarctica/             # 南極
│   ├── claims/             # 領有権主張地域
│   └── stations/           # 研究基地
├── asia/                   # アジア
│   ├── central_asia/
│   ├── east_asia/
│   ├── south_asia/
│   ├── southeast_asia/
│   └── west_asia/
├── europe/                 # ヨーロッパ
│   ├── caucasus/
│   ├── eastern_europe/
│   ├── northern_europe/
│   ├── southeastern_europe/
│   ├── southern_europe/
│   └── western_europe/
├── oceania/                # オセアニア
│   ├── australia_new_zealand/
│   ├── melanesia/
│   ├── micronesia/
│   └── polynesia/
├── 型/                     # スキーマ型定義
└── 例/                     # サンプルデータ
```

## 📝 データ形式

### ファイル命名規則

- 国ファイル: `{ISO 3166-1 alpha-2コード}.yaml` / `{ISO 3166-1 alpha-2コード}.json` (例: `JP.yaml`, `JP.json`, `US.yaml`, `US.json`)
- 地域ファイル: `{地域名}.yaml` / `{地域名}.json` (例: `Papua.yaml`, `Papua.json`)

### スキーマレベル

このプロジェクトでは2つのスキーマレベルを提供しています：

#### 🚚 配送実務レベル（届くレベル）

最小限の入力で確実に届くことを目指した、フォーム設計や配送ラベル生成向けのスキーマです。

```yaml
name:
  en: Japan                    # 英語名（必須）

iso_codes:
  alpha2: JP                   # ISO 3166-1 alpha-2（必須）

languages:
  - name: English
    script: Latin
    direction: ltr
    role: shipping_required

address_format:
  order: [recipient, street_address, city, province, postal_code, country]
  
  recipient:
    required: true
  street_address:
    required: true
  city:
    required: true
  province:
    required: true
    label_en: Prefecture
  postal_code:
    required: true
    regex: "^[0-9]{3}-[0-9]{4}$"
  country:
    required: true

examples:
  international: "..."
```

#### 📚 研究レベル（学術・比較用）

各国の住所制度を比較・分析・標準化する研究用途向けの詳細スキーマです。

```yaml
name:
  en: Japan
  local:
    - lang: ja
      value: 日本
      script: Kanji
      direction: ltr

iso_codes:
  alpha2: JP
  alpha3: JPN
  numeric: "392"

continent: Asia
subregion: East Asia

languages:
  - name: Japanese
    script: Kanji
    direction: ltr
    role: official
    country_name: 日本

administrative_divisions:
  level1:
    type: Prefecture
    label_local: 都道府県
    label_en: Prefecture
    count: 47

address_format:
  order_variants:
    - context: domestic
      order: [recipient, prefecture, city, ward, street_address, ...]
    - context: international
      order: [recipient, room, floor, building, street_address, ...]

validation:
  allow_latin_transliteration: true
  rules:
    - "Prefecture name must never be omitted"

examples:
  domestic_raw: "〒100-0001 東京都千代田区千代田1-1 皇居"
  domestic_normalized: "東京都 千代田区 千代田1-1 皇居 100-0001"
  international: "Imperial Palace, 1-1 Chiyoda, Chiyoda-ku, Tokyo 100-0001, Japan"

status:
  un_member: true
  recognized: true
  disputed: false
```

## 🛠️ SDK（開発者向けツール）

本プロジェクトでは、様々なフレームワークやプラットフォームで利用可能なSDKを提供しています。

### 📦 利用可能なパッケージ

| パッケージ | 説明 | インストール |
|-----------|------|-------------|
| `@vey/core` | コアSDK（バリデーション・フォーマット） | `npm install @vey/core` |
| `@vey/react` | React用フック・コンポーネント | `npm install @vey/react` |
| `@vey/vue` | Vue用コンポーザブル | `npm install @vey/vue` |
| `@vey/widget` | Universal Shadow Widget（フレームワーク非依存） | `npm install @vey/widget` |
| `@vey/webhooks` | Webhookユーティリティ | `npm install @vey/webhooks` |
| `@vey/qr-nfc` | QRコード・NFC統合 | `npm install @vey/qr-nfc` |
| `@vey/graphql` | GraphQLスキーマ | `npm install @vey/graphql` |
| `@vey/grpc` | gRPCプロトコル定義 | `npm install @vey/grpc` |
| `veyform-sdk` | CLIツール | `npx veyform-sdk init` |

### 🚀 クイックスタート

```bash
# プロジェクト初期化
npx veyform-sdk init

# 依存関係インストール（React）
npm install @vey/core @vey/react
```

### React での使用例

```tsx
import { VeyProvider, AddressForm } from '@vey/react';

function App() {
  return (
    <VeyProvider config={{ apiKey: 'your-api-key' }}>
      <AddressForm
        countryCode="JP"
        onSubmit={(address, validation) => {
          if (validation.valid) {
            console.log('Valid address:', address);
          }
        }}
      />
    </VeyProvider>
  );
}
```

### Universal Widget の使用例

```html
<script src="https://unpkg.com/@vey/widget"></script>
<vey-address-widget country-code="JP" theme="light"></vey-address-widget>
```

### CLI コマンド

```bash
# GraphQLスキーマ生成
npx veyform-sdk graphql --output schema.graphql

# gRPC protoファイル生成
npx veyform-sdk proto --output vey.proto

# 住所バリデーション
npx veyform-sdk validate --country JP --postal-code 100-0001

# 対応国一覧
npx veyform-sdk countries --region asia
```

詳細は [SDK README](./sdk/README.md) をご覧ください。

## 🔧 使用方法

### データの読み込み

任意のYAML/JSONパーサーを使用してデータを読み込むことができます。

**Python (YAML):**
```python
import yaml

with open('asia/east_asia/JP.yaml', 'r', encoding='utf-8') as f:
    japan_data = yaml.safe_load(f)

print(japan_data['name']['en'])  # Japan
print(japan_data['address_format']['postal_code']['regex'])  # ^[0-9]{3}-[0-9]{4}$
```

**Python (JSON):**
```python
import json

with open('asia/east_asia/JP.json', 'r', encoding='utf-8') as f:
    japan_data = json.load(f)

print(japan_data['name']['en'])  # Japan
print(japan_data['address_format']['postal_code']['regex'])  # ^[0-9]{3}-[0-9]{4}$
```

**JavaScript/Node.js (YAML):**
```javascript
const yaml = require('js-yaml');
const fs = require('fs');

const japanData = yaml.load(fs.readFileSync('asia/east_asia/JP.yaml', 'utf8'));
console.log(japanData.name.en);  // Japan
```

**JavaScript/Node.js (JSON):**
```javascript
const fs = require('fs');

const japanData = JSON.parse(fs.readFileSync('asia/east_asia/JP.json', 'utf8'));
console.log(japanData.name.en);  // Japan
```

## 🤝 貢献方法

### 新しい国・地域のデータを追加する

1. 適切な大陸・地域のディレクトリに移動
2. ISO 3166-1 alpha-2コードをファイル名として使用
3. `型/README.md` のスキーマに従ってYAMLファイルを作成
4. 対応するJSONファイルも作成（YAMLから自動変換可能）
5. Pull Requestを作成

### データの修正・改善

1. 誤りを発見した場合はIssueを作成
2. 修正がある場合はPull Requestで提案

### 注意事項

- 政治的に敏感な地域（係争地域、部分承認国など）については、`status` フィールドで状況を明記
- 海外領土は宗主国のディレクトリ内の `overseas/` サブディレクトリに配置
- 特殊な行政区画は `regions/` サブディレクトリに配置

## 📊 収録状況

- **総ファイル数**: 279件（YAML + JSON = 558ファイル）
- **大陸**: 6大陸（アフリカ、アメリカ、南極、アジア、ヨーロッパ、オセアニア）
- **特殊地域**: 海外領土、係争地域、研究基地なども収録
- **データ形式**: YAML および JSON

## 🌍 対応国・地域一覧

### アフリカ / Africa

#### 中央アフリカ / Central Africa
Angola (AO), Cameroon (CM), Central African Republic (CF), Chad (TD), Democratic Republic of the Congo (CD), Equatorial Guinea (GQ), Gabon (GA), Republic of the Congo (CG), São Tomé and Príncipe (ST)

#### 東アフリカ / Eastern Africa
Burundi (BI), Comoros (KM), Djibouti (DJ), Eritrea (ER), Ethiopia (ET), Kenya (KE), Madagascar (MG), Malawi (MW), Mauritius (MU), Mozambique (MZ), Rwanda (RW), Seychelles (SC), Somalia (SO), Tanzania (TZ), Uganda (UG), Zambia (ZM), Zimbabwe (ZW)

#### 北アフリカ / Northern Africa
Algeria (DZ), Egypt (EG), Libya (LY), Morocco (MA), South Sudan (SS), Sudan (SD), Tunisia (TN)

#### 南部アフリカ / Southern Africa
Botswana (BW), Eswatini (SZ), Lesotho (LS), Namibia (NA), South Africa (ZA)

#### 西アフリカ / West Africa
Benin (BJ), Burkina Faso (BF), Cape Verde (CV), Côte d'Ivoire (CI), Ghana (GH), Guinea (GN), Guinea-Bissau (GW), Liberia (LR), Mali (ML), Mauritania (MR), Niger (NE), Nigeria (NG), Senegal (SN), Sierra Leone (SL), The Gambia (GM), Togo (TG)

### アメリカ大陸 / Americas

#### カリブ海 / Caribbean
Antigua and Barbuda (AG), Barbados (BB), Cuba (CU), Dominica (DM), Dominican Republic (DO), Grenada (GD), Haiti (HT), Jamaica (JM), Saint Kitts and Nevis (KN), Saint Lucia (LC), Saint Vincent and the Grenadines (VC), The Bahamas (BS), Trinidad and Tobago (TT)

#### 中央アメリカ / Central America
Belize (BZ), Costa Rica (CR), El Salvador (SV), Guatemala (GT), Honduras (HN), Nicaragua (NI), Panama (PA)

#### 北アメリカ / North America
Canada (CA), Mexico (MX), United States (US)

#### 南アメリカ / South America
Argentina (AR), Bolivia (BO), Brazil (BR), Chile (CL), Colombia (CO), Ecuador (EC), Guyana (GY), Paraguay (PY), Peru (PE), Suriname (SR), Uruguay (UY), Venezuela (VE)

### 南極 / Antarctica
Antarctica (AQ)

※ 南極の領有権主張地域や研究基地の詳細は `antarctica/` ディレクトリを参照してください。

### アジア / Asia

#### 中央アジア / Central Asia
Kazakhstan (KZ), Kyrgyzstan (KG), Tajikistan (TJ), Turkmenistan (TM), Uzbekistan (UZ)

#### 東アジア / East Asia
China (CN), Hong Kong (HK), Japan (JP), Macao (MO), Mongolia (MN), North Korea (KP), South Korea (KR), Taiwan (TW)

#### 南アジア / South Asia
Afghanistan (AF), Bangladesh (BD), Bhutan (BT), India (IN), Maldives (MV), Nepal (NP), Pakistan (PK), Sri Lanka (LK)

#### 東南アジア / Southeast Asia
Brunei (BN), Cambodia (KH), Indonesia (ID), Laos (LA), Malaysia (MY), Myanmar (MM), Philippines (PH), Singapore (SG), Thailand (TH), Timor-Leste (TL), Vietnam (VN)

#### 西アジア / West Asia
Armenia (AM), Azerbaijan (AZ), Bahrain (BH), Georgia (GE), Iran (IR), Iraq (IQ), Israel (IL), Jordan (JO), Kuwait (KW), Lebanon (LB), Oman (OM), Palestine (PS), Qatar (QA), Saudi Arabia (SA), Syria (SY), Turkey (TR), United Arab Emirates (AE), Yemen (YE)

### ヨーロッパ / Europe

#### コーカサス / Caucasus
Armenia (AM), Azerbaijan (AZ), Georgia (GE)

#### 東ヨーロッパ / Eastern Europe
Belarus (BY), Bulgaria (BG), Czech Republic (CZ), Hungary (HU), Moldova (MD), Poland (PL), Romania (RO), Russia (RU), Slovakia (SK), Ukraine (UA)

#### 北ヨーロッパ / Northern Europe
Denmark (DK), Estonia (EE), Finland (FI), Iceland (IS), Ireland (IE), Latvia (LV), Lithuania (LT), Norway (NO), Sweden (SE), United Kingdom (GB)

#### 南東ヨーロッパ / Southeastern Europe
Albania (AL), Bosnia and Herzegovina (BA), Croatia (HR), Montenegro (ME), North Macedonia (MK), Serbia (RS)

#### 南ヨーロッパ / Southern Europe
Andorra (AD), Cyprus (CY), Greece (GR), Italy (IT), Malta (MT), Portugal (PT), San Marino (SM), Spain (ES), Vatican City (VA)

#### 西ヨーロッパ / Western Europe
Austria (AT), Belgium (BE), France (FR), Germany (DE), Liechtenstein (LI), Luxembourg (LU), Monaco (MC), Netherlands (NL), Switzerland (CH)

### オセアニア / Oceania

#### オーストラリア・ニュージーランド / Australia & New Zealand
Australia (AU), New Zealand (NZ)

#### メラネシア / Melanesia
Fiji (FJ), Papua New Guinea (PG), Solomon Islands (SB), Vanuatu (VU)

#### ミクロネシア / Micronesia
Federated States of Micronesia (FM), Kiribati (KI), Marshall Islands (MH), Nauru (NR), Palau (PW)

#### ポリネシア / Polynesia
Samoa (WS), Tonga (TO), Tuvalu (TV)

※ 各国の海外領土や特別地域については、該当国のディレクトリ内の `overseas/` または `regions/` サブディレクトリを参照してください。

## 📜 ライセンス

このプロジェクトのデータはオープンデータとして提供されています。

## 🔗 関連リンク

- [ISO 3166-1](https://www.iso.org/iso-3166-country-codes.html) - 国名コード規格
- [Universal Postal Union](https://www.upu.int/) - 万国郵便連合

---

🌐 **World Address YAML / JSON** - 世界の住所を、ひとつのフォーマットで
