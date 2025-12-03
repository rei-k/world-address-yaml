# POSレベルデータ / POS Level Data

このディレクトリには、POS（販売時点情報管理）システム向けの住所・地域データが含まれています。

## 📋 概要

POSレベルのスキーマは、POSシステムでの決済・レシート発行・税務処理に必要な情報を提供します。小売店・飲食店などの実店舗での利用を想定した、実務的なデータセットです。

## 🎯 対象ユーザー

- POSシステム開発者
- 小売・飲食店向けソフトウェア開発者
- 決済システム統合担当者
- 税務処理システム開発者

## 📦 含まれるデータ

POSレベルのデータには以下の情報が含まれます：

### 通貨情報
- ISO 4217 通貨コード
- 通貨記号と表示位置
- 小数点以下桁数
- 区切り記号（小数点・千区切り）

### 税務情報
- 税の種類（消費税、付加価値税など）
- 標準税率・軽減税率
- 内税/外税の区別
- インボイス制度の有無

### レシート要件
- 法的必須項目
- 標準レシート幅
- 電子レシート対応
- 保存義務期間

### 事業運営情報
- 財務デバイス要件
- 事業者登録要件
- 申告頻度
- 主要決済手段

### ローカライズ情報
- 日付・時刻形式
- タイムゾーン
- 週の開始曜日
- 標準営業時間

## 📝 データ形式

各国・地域のPOSデータは `.yaml` と `.json` の両方の形式で提供されています。

### ディレクトリ構造

```
data/pos/
├── {国コード}/
│   ├── {国コード}.yaml         # 国のPOSデータ（YAML形式）
│   ├── {国コード}.json         # 国のPOSデータ（JSON形式）
│   └── regions/                # 特別地域（該当する国のみ）
│       ├── {地域名}.yaml
│       └── {地域名}.json
└── README.md
```

### データ例（YAML）

```yaml
pos:
  currency:
    code: JPY
    symbol: "¥"
    symbol_position: before
    decimal_places: 0
    decimal_separator: "."
    thousands_separator: ","

  tax:
    type: Consumption Tax
    rate:
      standard: 0.10
      reduced:
        - rate: 0.08
          category: food_beverages
    included_in_price: true
    invoice_requirement: required

  receipt:
    required_fields:
      - business_name
      - registration_number
      - date
      - items
      - tax_breakdown
      - total
    paper_width: "80mm"
    electronic_allowed: true
    retention_period: "7 years"

  fiscal:
    fiscal_device_required: false
    registration_required: true
    reporting_frequency: annually

  payment_methods:
    - type: cash
      name: 現金
      prevalence: high
    - type: mobile
      name: Suica/PASMO
      prevalence: high

  locale:
    date_format: "YYYY/MM/DD"
    time_format: "24h"
    timezone: "Asia/Tokyo"
    week_start: sunday

  business_hours:
    typical_open: "10:00"
    typical_close: "20:00"
    sunday_trading: true
    public_holidays_trading: true
```

## 🔧 使用方法

### データの読み込み

**Python (YAML):**
```python
import yaml

with open('data/pos/JP/JP.yaml', 'r', encoding='utf-8') as f:
    pos_data = yaml.safe_load(f)

print(pos_data['pos']['currency']['code'])  # JPY
print(pos_data['pos']['tax']['rate']['standard'])  # 0.10
```

**JavaScript/Node.js (JSON):**
```javascript
const fs = require('fs');

const posData = JSON.parse(fs.readFileSync('data/pos/JP/JP.json', 'utf8'));
console.log(posData.pos.currency.code);  // JPY
console.log(posData.pos.tax.rate.standard);  // 0.10
```

## 🤝 貢献方法

新しい国・地域のPOSデータを追加する場合：

1. 適切な国コードのディレクトリを作成
2. `{国コード}.yaml` ファイルを作成し、POSスキーマに従ってデータを記述
3. 対応する `.json` ファイルも作成
4. Pull Requestを作成

## 🔗 関連リンク

- [メインREADME](../../README.md#-posレベル販売時点情報管理用) - POSレベルスキーマの詳細説明
- [スキーマ定義](../../docs/schema/) - データスキーマの型定義
- [SDK](../../sdk/) - 開発者向けツール
