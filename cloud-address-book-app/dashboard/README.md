# 📍 Dashboard / Overview

ダッシュボードはクラウド住所帳システムの中央管理画面です。住所のステータス、最近の利用状況を一目で確認できます。

The Dashboard is the central control panel of the Cloud Address Book System, providing an at-a-glance view of address status and recent activities.

---

## 🎯 主要機能 / Key Features

### 住所ステータス / Address Status
- **正規化状況**: AMFによる住所正規化の完了状態
- **照合状況**: PID生成と検証状態
- **利用サイト数**: クラウド住所帳を利用しているECサイト・サービス数

### 最近の利用 / Recent Activities
- **チェックアウト履歴**: ECサイトでの購入・配送履歴
- **NFCチェックイン履歴**: ホテル・施設でのNFC住所証明履歴
- **送り状生成履歴**: 個人間配送での送り状作成履歴

---

## 📊 ディレクトリ構成 / Directory Structure

```
dashboard/
├── README.md                    # このファイル
├── status/                      # 住所ステータス
│   ├── normalization-status.md # 正規化状況
│   ├── verification-status.md  # 照合状況
│   └── usage-stats.md          # 利用サイト数統計
└── recent-activities/           # 最近の利用
    ├── checkout-history.md     # チェックアウト履歴
    ├── nfc-checkin.md          # NFCチェックイン履歴
    └── waybill-history.md      # 送り状生成履歴
```

---

## 🚀 使用方法 / Usage

### ダッシュボード表示

```typescript
import { DashboardView } from '@/cloud-address-book-app/dashboard';

// ダッシュボードコンポーネントの表示
<DashboardView userId="user-123" />
```

### 住所ステータスの取得

```typescript
import { getAddressStatus } from '@/cloud-address-book-app/dashboard/status';

const status = await getAddressStatus(userId);
console.log({
  normalized: status.normalizedCount,     // 正規化済み住所数
  verified: status.verifiedCount,         // 検証済み住所数
  linkedSites: status.linkedSitesCount    // 連携サイト数
});
```

### 最近の利用履歴取得

```typescript
import { 
  getCheckoutHistory,
  getNFCCheckinHistory,
  getWaybillHistory 
} from '@/cloud-address-book-app/dashboard/recent-activities';

// チェックアウト履歴（直近10件）
const checkouts = await getCheckoutHistory(userId, { limit: 10 });

// NFCチェックイン履歴（直近7日間）
const nfcCheckins = await getNFCCheckinHistory(userId, { 
  since: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) 
});

// 送り状生成履歴（直近30日間）
const waybills = await getWaybillHistory(userId, { 
  since: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) 
});
```

---

## 📈 表示されるメトリクス / Displayed Metrics

### 住所ステータスメトリクス

| メトリクス | 説明 | 表示形式 |
|-----------|------|---------|
| 登録住所数 | 登録されている全住所の数 | 数値 + グラフ |
| 正規化済み | AMFで正規化された住所の割合 | パーセンテージ + プログレスバー |
| 検証済み | PID生成・VC発行済みの住所数 | 数値 + ステータスバッジ |
| 利用中サイト | 現在連携しているECサイト数 | 数値 + サイトアイコン一覧 |
| アクティブPID | 失効していないPIDの数 | 数値 + 有効期限表示 |

### 最近の利用メトリクス

| メトリクス | 説明 | 表示形式 |
|-----------|------|---------|
| 今週のチェックアウト | 過去7日間の購入回数 | 数値 + トレンド矢印 |
| NFCチェックイン | 過去30日間のNFC利用回数 | 数値 + 場所リスト |
| 送り状生成 | 過去30日間の送り状作成数 | 数値 + 配送先分布 |
| 住所アクセス | 第三者による住所アクセス回数 | 数値 + アクセスログリンク |

---

## 🎨 UI/UXデザイン指針 / UI/UX Design Guidelines

### レイアウト
- **カード型レイアウト**: 各メトリクスをカードで表示
- **グリッドシステム**: レスポンシブ対応（モバイル: 1列、タブレット: 2列、デスクトップ: 3-4列）
- **優先順位**: 最も重要な情報を上部に配置

### カラースキーム
- **正常状態**: 緑色（#10B981）
- **警告**: 黄色（#F59E0B）
- **エラー**: 赤色（#EF4444）
- **情報**: 青色（#3B82F6）
- **中立**: グレー（#6B7280）

### インタラクション
- **ホバー効果**: カードにホバーで詳細表示
- **クリック**: カードクリックで詳細ページへ遷移
- **リアルタイム更新**: WebSocketで自動更新

---

## 🔔 通知機能 / Notification Features

### アラート条件

1. **住所の正規化失敗**
   - ユーザーが入力した住所がAMFで正規化できない場合
   - アクション: 手動修正を促す

2. **PID失効期限が近い**
   - PIDの有効期限が30日以内の場合
   - アクション: 住所の再検証を促す

3. **不審なアクセス検出**
   - 通常と異なるパターンのアクセスが検出された場合
   - アクション: セキュリティログの確認を促す

4. **新しいサイト連携**
   - 新しいECサイトがクラウド住所帳と連携した場合
   - アクション: 権限設定の確認を促す

---

## 📊 データ可視化 / Data Visualization

### グラフ種類

1. **時系列グラフ**: チェックアウト履歴の推移
2. **円グラフ**: 住所の利用サイト別分布
3. **棒グラフ**: 月別の送り状生成数
4. **ヒートマップ**: NFCチェックインの時間帯別分布

### ダッシュボードウィジェット

```typescript
// ウィジェット設定例
const widgetConfig = {
  addressStatus: {
    enabled: true,
    position: { row: 1, col: 1 },
    size: { width: 2, height: 1 }
  },
  recentCheckouts: {
    enabled: true,
    position: { row: 1, col: 3 },
    size: { width: 2, height: 1 }
  },
  nfcActivity: {
    enabled: true,
    position: { row: 2, col: 1 },
    size: { width: 1, height: 1 }
  },
  linkedSites: {
    enabled: true,
    position: { row: 2, col: 2 },
    size: { width: 3, height: 1 }
  }
};
```

---

## 🔐 プライバシー設定 / Privacy Settings

### 表示制御

ユーザーは以下の情報の表示/非表示を設定できます：

- ✅ チェックアウト履歴の表示
- ✅ NFCチェックイン履歴の表示
- ✅ 送り状生成履歴の表示
- ✅ 利用サイトの一覧表示
- ✅ アクセスログの詳細表示

### データ保持期間

| データ種類 | デフォルト保持期間 | 最大保持期間 |
|-----------|------------------|-------------|
| チェックアウト履歴 | 1年 | 3年 |
| NFCチェックイン | 6ヶ月 | 2年 |
| 送り状生成履歴 | 2年 | 5年 |
| アクセスログ | 1年 | 7年（監査要件） |

---

## 🔗 関連ページ / Related Pages

- [My Addresses](../my-addresses/README.md) - 住所管理
- [Payment Methods](../payment-methods/README.md) - 決済手段管理
- [Sites Linked](../sites-linked/README.md) - 提携サイト管理
- [Security & Privacy](../security-privacy/README.md) - セキュリティ設定

---

## 📝 開発メモ / Development Notes

### 実装優先度

1. **P0 (必須)**
   - 住所ステータス表示
   - チェックアウト履歴表示
   - 基本的なメトリクス表示

2. **P1 (高優先度)**
   - リアルタイム更新
   - NFCチェックイン履歴
   - グラフ・チャート表示

3. **P2 (中優先度)**
   - 送り状生成履歴
   - カスタマイズ可能なウィジェット
   - 通知機能

4. **P3 (低優先度)**
   - 高度なフィルタリング
   - データエクスポート
   - AI推奨機能

### 技術スタック

- **フロントエンド**: React / Vue / Svelte
- **状態管理**: Redux / Zustand / Pinia
- **グラフライブラリ**: Chart.js / Recharts / D3.js
- **リアルタイム**: WebSocket / SSE
- **スタイリング**: Tailwind CSS / shadcn/ui

---

**🌐 World Address YAML / JSON** - クラウド住所帳ダッシュボード
