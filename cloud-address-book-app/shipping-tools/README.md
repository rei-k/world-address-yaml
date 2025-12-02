# 📦 Shipping & Parcel Tools / 配送ツール

送り状生成、配送キャリア統合、住所ルーティング、ZKP証明を含む包括的な配送管理ツール。

Comprehensive shipping management tools including waybill generation, carrier integration, address routing, and ZKP proofs.

---

## 🎯 主要機能 / Key Features

### Waybill Generation（送り状生成）
- **クラウド住所×相手住所**: 自分と相手の住所で自動生成
- **テンプレート管理**: よく使う送り状フォーマットを保存
- **一括生成**: 複数の送り状を一度に作成

### Carrier Integration（配送キャリア提出ログ）
- **業者にはフル公開**: 配送業者には完全な住所を提供
- **提出ログ**: どの業者に何を提供したか記録
- **キャリアリスト**: 対応配送業者の一覧管理

### Address Routing（住所ルーティング）
- **キャリア適合住所変換**: 各配送業者の形式に自動変換
- **最適ルート**: 配送効率を考慮した住所形式
- **国際配送対応**: 各国の住所フォーマットに対応

### ZKP Proofs（将来の匿名証明）
- **匿名証明のみ**: 住所を公開せずに配送可能性を証明
- **プライバシー保護**: ゼロ知識証明による配送
- **将来拡張**: 完全匿名配送への対応

---

## 📂 ディレクトリ構成 / Directory Structure

```
shipping-tools/
├── README.md                     # このファイル
├── waybill-generation/           # 送り状生成
│   ├── create-waybill.md        # 送り状作成
│   └── templates.md             # テンプレート管理
├── carrier-integration/          # 配送キャリア提出ログ
│   ├── carrier-list.md          # キャリア一覧
│   └── submission-log.md        # 提出ログ
├── address-routing/              # 住所ルーティング
│   └── carrier-adaptation.md    # キャリア適合住所変換
└── zkp-proofs/                   # ZKP Proofs（将来の匿名証明）
    └── anonymous-proof.md       # 匿名証明のみ
```

---

## 🚀 使用方法 / Usage

### 送り状の生成

```typescript
import { createWaybill } from '@/cloud-address-book-app/shipping-tools';

const waybill = await createWaybill({
  sender: {
    addressId: 'addr-123',        // 送り主の住所ID
    name: '山田太郎',
    phone: '090-1234-5678'
  },
  recipient: {
    contactId: 'contact-456',     // 友達の連絡先ID
    // または
    gapId: 'gap:user:xyz789',     // GAP ID
    // または
    addressId: 'addr-789'         // 直接住所ID
  },
  carrier: 'yamato',              // 配送業者
  items: [
    {
      name: '書籍',
      quantity: 3,
      weight: 500,               // グラム
      value: 3000                // 円
    }
  ],
  options: {
    insurance: true,             // 保険
    signature: true,             // 受取サイン
    timeSlot: '14-16'           // 配達時間帯
  }
});

// 送り状をダウンロード
downloadWaybill(waybill.id, 'pdf');
```

### テンプレートの保存と使用

```typescript
import { saveWaybillTemplate, useTemplate } from '@/cloud-address-book-app/shipping-tools';

// よく使う設定をテンプレートとして保存
await saveWaybillTemplate({
  name: '書籍配送テンプレート',
  carrier: 'yamato',
  defaultItems: [{
    name: '書籍',
    weight: 500
  }],
  defaultOptions: {
    insurance: false,
    signature: false
  }
});

// テンプレートを使って送り状作成
const waybill = await useTemplate('template-123', {
  recipientGapId: 'gap:user:abc123'
});
```

### 配送業者への住所提出

```typescript
import { submitToCarrier } from '@/cloud-address-book-app/shipping-tools';

// 配送業者に住所を提出（フル公開）
const submission = await submitToCarrier({
  waybillId: 'wb-123',
  carrier: 'yamato',
  senderAddress: fullSenderAddress,      // 完全な住所
  recipientAddress: fullRecipientAddress, // 完全な住所
  trackingNumber: 'TN-1234567890'
});

// 提出ログに記録
console.log(submission);
// {
//   id: 'sub-456',
//   carrier: 'yamato',
//   submittedAt: '2024-12-02T12:00:00Z',
//   trackingNumber: 'TN-1234567890',
//   status: 'submitted'
// }
```

### 住所ルーティング（キャリア適合変換）

```typescript
import { adaptAddressForCarrier } from '@/cloud-address-book-app/shipping-tools';

// 住所を各配送業者の形式に変換
const adaptedAddress = await adaptAddressForCarrier(
  addressId,
  'yamato'  // ヤマト運輸の形式に変換
);

console.log(adaptedAddress);
// {
//   formatted: '東京都渋谷区道玄坂1-2-3 タワーマンション1001',
//   postalCode: '150-0043',
//   carrierZone: '13-渋谷',
//   deliveryArea: 'A-1'
// }
```

---

## 📋 送り状データモデル / Waybill Data Model

```typescript
interface Waybill {
  id: string;                      // 送り状ID
  userId: string;                  // ユーザーID（作成者）
  
  // 送り主情報
  sender: {
    addressId: string;             // 送り主の住所ID
    name: string;                  // 名前
    phone: string;                 // 電話番号
    email?: string;                // メールアドレス
  };
  
  // 受取人情報
  recipient: {
    contactId?: string;            // 連絡先ID
    gapId?: string;                // GAP ID
    addressId?: string;            // 住所ID（直接指定）
    name: string;                  // 名前
    phone: string;                 // 電話番号
  };
  
  // 配送情報
  carrier: string;                 // 配送業者
  trackingNumber?: string;         // 追跡番号
  items: WaybillItem[];           // 荷物リスト
  
  // オプション
  options: {
    insurance: boolean;            // 保険
    insuranceValue?: number;       // 保険金額
    signature: boolean;            // 受取サイン
    timeSlot?: string;             // 配達時間帯
    cashOnDelivery?: number;       // 代金引換額
    fragile: boolean;              // ワレモノ
    refrigerated: boolean;         // 冷蔵/冷凍
  };
  
  // メタデータ
  status: WaybillStatus;          // ステータス
  createdAt: Date;                // 作成日時
  submittedAt?: Date;             // 提出日時
  deliveredAt?: Date;             // 配達完了日時
  
  // ZKP（将来拡張）
  zkProof?: string;               // ゼロ知識証明
}

interface WaybillItem {
  name: string;                    // 品名
  quantity: number;                // 数量
  weight: number;                  // 重量（グラム）
  value: number;                   // 価値（円）
  dangerous: boolean;              // 危険物
}

type WaybillStatus = 
  | 'draft'           // 下書き
  | 'submitted'       // 提出済み
  | 'picked_up'       // 集荷完了
  | 'in_transit'      // 輸送中
  | 'out_for_delivery' // 配達中
  | 'delivered'       // 配達完了
  | 'failed'          // 配達失敗
  | 'returned';       // 返送
```

---

## 🚚 対応配送業者 / Supported Carriers

### 日本国内

| 業者 | コード | 特徴 |
|------|--------|------|
| ヤマト運輸 | `yamato` | 全国配送、時間指定 |
| 佐川急便 | `sagawa` | 大型荷物対応 |
| 日本郵便 | `japanpost` | 郵便番号配送 |
| 西濃運輸 | `seino` | 法人向け |
| 福山通運 | `fukutsu` | 西日本特化 |

### 国際配送

| 業者 | コード | 対応地域 |
|------|--------|---------|
| DHL | `dhl` | 世界220カ国 |
| FedEx | `fedex` | 世界220カ国 |
| UPS | `ups` | 世界220カ国 |
| EMS | `ems` | 日本郵便国際便 |

---

## 🗺️ 住所ルーティング / Address Routing

### キャリア別住所形式

各配送業者は独自の住所形式を要求します。住所ルーティング機能は自動的に変換します。

```typescript
// 元の住所
const originalAddress = {
  postalCode: '150-0043',
  province: '東京都',
  city: '渋谷区',
  streetAddress: '道玄坂1-2-3',
  building: 'タワーマンション',
  room: '1001'
};

// ヤマト運輸形式
const yamatoFormat = adaptAddressForCarrier(originalAddress, 'yamato');
// "〒150-0043 東京都渋谷区道玄坂1-2-3 タワーマンション1001"

// 佐川急便形式
const sagawaFormat = adaptAddressForCarrier(originalAddress, 'sagawa');
// "150-0043 東京都渋谷区道玄坂1丁目2番3号 タワーマンション1001号室"

// 国際配送形式（DHL）
const dhlFormat = adaptAddressForCarrier(originalAddress, 'dhl');
// "1001 Tower Mansion, 1-2-3 Dogenzaka, Shibuya-ku, Tokyo 150-0043, JAPAN"
```

---

## 📊 配送統計 / Shipping Statistics

### 表示される統計情報

| メトリクス | 説明 |
|-----------|------|
| 送り状作成数 | 累計作成した送り状の数 |
| 配送完了率 | 無事配達された割合 |
| よく使う業者 | 最も利用している配送業者 |
| 配送コスト | 月間の配送費用 |
| 平均配送日数 | 発送から配達までの平均日数 |

---

## 🔐 プライバシーとセキュリティ / Privacy & Security

### 住所の公開範囲

| 相手 | 公開情報 | 理由 |
|------|---------|------|
| 送り主（自分） | 完全な住所 | 本人の情報 |
| 受取人（友達） | PIDまたはGAP ID | プライバシー保護 |
| 配送業者 | 完全な住所 | 配送実行に必要 |
| ECサイト | ZK証明のみ | プライバシー保護 |

### アクセスログ

すべての住所アクセスは記録されます：

```typescript
interface AddressAccessLog {
  id: string;
  addressId: string;
  accessor: string;              // 誰が
  purpose: string;               // 何のために
  accessedAt: Date;              // いつ
  ipAddress: string;             // どこから
  userAgent: string;             // どのデバイスで
}
```

---

## 🔮 ZKP配送（将来機能） / ZKP Shipping (Future)

### ゼロ知識証明による配送

```typescript
import { createZKPWaybill } from '@/cloud-address-book-app/shipping-tools/zkp-proofs';

// 住所を公開せずに配送可能性を証明
const zkWaybill = await createZKPWaybill({
  senderPID: 'JP-13-113-01',
  recipientPID: 'JP-27-128-02',
  proof: {
    senderInJapan: true,         // 送り主は日本にいる
    recipientInJapan: true,      // 受取人も日本にいる
    withinDeliveryRange: true,   // 配送範囲内
    addressesValid: true         // 両方の住所が有効
  }
});

// 配送業者はZK証明を検証するだけ（住所は見ない）
const verified = await verifyZKProof(zkWaybill.proof);
if (verified) {
  // 配送可能と判断
  // ラストワンマイルでのみ実住所を開示
}
```

---

## 📱 モバイル機能 / Mobile Features

### QRコードスキャン
- カメラで送り状QRをスキャン
- 追跡番号を自動入力
- 配送状況をリアルタイム表示

### プッシュ通知
- 集荷完了通知
- 配送中通知
- 配達完了通知
- 不在票通知

---

## 🔗 関連ページ / Related Pages

- [My Addresses](../my-addresses/README.md) - 送り主住所管理
- [Contacts & Friends](../contacts-friends/README.md) - 受取人管理
- [Sites Linked](../sites-linked/README.md) - EC連携配送
- [Security & Privacy](../security-privacy/README.md) - アクセスログ

---

## 💡 使用例 / Use Cases

### 個人間配送
友達に荷物を送る際、GAP IDだけで送り状を作成

### EC購入時
ECサイトでの購入時、クラウド住所帳から自動で配送先を設定

### ビジネス配送
取引先への定期配送をテンプレート化して効率化

### 国際配送
海外の友達への配送も、住所形式を自動変換して簡単に

---

**🌐 World Address YAML / JSON** - Shipping & Parcel Tools
