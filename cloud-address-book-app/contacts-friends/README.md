# 👥 Contacts / Friends / 連絡先管理

QR/NFCペアリングで友達を登録し、GAP IDで安全に連絡先を管理します。

Register friends via QR/NFC pairing and securely manage contacts with GAP ID.

---

## 🎯 主要機能 / Key Features

### QR Pairing（QRペアリング）
- **QRコードスキャン**: 友達のQRコードをスキャンして即座に登録
- **QRコード生成**: 自分のQRコードを生成して共有
- **セキュアペアリング**: エンドツーエンド暗号化

### GAP ID（Global Address Protocol ID）
- **一意識別**: 世界中で一意のアドレスID
- **プライバシー保護**: 生住所を見せずに配送先登録
- **簡単共有**: IDだけで配送先を指定

### Groups（グループ管理）
- **会社**: 同僚・取引先
- **学校**: 同級生・先生
- **チーム**: プロジェクトメンバー
- **家族**: 家族・親戚

### Sharing Permissions（共有権限管理）※任意拡張
- **公開範囲設定**: 誰にどこまで住所を見せるか
- **一時的共有**: 期限付きアクセス
- **配送専用**: 配送時のみアクセス可能

---

## 📂 ディレクトリ構成 / Directory Structure

```
contacts-friends/
├── README.md                    # このファイル
├── qr-pairing/                  # QRペアリング
│   ├── scan-qr.md              # QRコードスキャン
│   └── generate-qr.md          # QRコード生成
├── gap-id/                      # GAP ID連絡先
│   └── gap-id-management.md    # GAP ID管理
├── groups/                      # グループ管理
│   ├── company.md              # 会社
│   ├── school.md               # 学校
│   ├── team.md                 # チーム
│   └── family.md               # 家族
└── permissions/                 # 共有権限管理（任意拡張）
    └── sharing-permissions.md  # 住所共有権限設定
```

---

## 🚀 使用方法 / Usage

### QRコードで友達登録

```typescript
import { scanQRCode, addFriend } from '@/cloud-address-book-app/contacts-friends';

// QRコードをスキャン
const qrData = await scanQRCode();

// 友達として登録
const friend = await addFriend(userId, {
  gapId: qrData.gapId,
  name: qrData.name,
  group: 'family'
});

console.log(`${friend.name}を友達に追加しました`);
```

### 自分のQRコードを生成

```typescript
import { generateMyQRCode } from '@/cloud-address-book-app/contacts-friends';

const qr = await generateMyQRCode(userId, {
  addressId: 'addr-123',        // 共有する住所ID
  expiresIn: 3600,              // 有効期限（秒）
  oneTimeUse: false,            // 使い捨てQRコードか
  allowedActions: ['view', 'send']  // 許可するアクション
});

// QRコード画像を表示
displayQRCode(qr.imageData);
```

### GAP IDで友達を検索

```typescript
import { findByGAPID } from '@/cloud-address-book-app/contacts-friends';

const friend = await findByGAPID('gap:user:abc123xyz');
if (friend) {
  console.log(`見つかりました: ${friend.name}`);
  // 友達リクエストを送信
  await sendFriendRequest(userId, friend.gapId);
}
```

### グループの作成と管理

```typescript
import { createGroup, addToGroup } from '@/cloud-address-book-app/contacts-friends';

// グループ作成
const group = await createGroup(userId, {
  name: 'プロジェクトチーム',
  category: 'team',
  description: '新プロジェクトのメンバー'
});

// メンバーを追加
await addToGroup(group.id, [
  'friend-id-1',
  'friend-id-2',
  'friend-id-3'
]);
```

---

## 📋 連絡先データモデル / Contact Data Model

```typescript
interface Contact {
  id: string;                      // 連絡先ID
  userId: string;                  // ユーザーID（所有者）
  gapId: string;                   // GAP ID
  
  // プロフィール情報
  name: string;                    // 表示名
  nickname?: string;               // ニックネーム
  avatar?: string;                 // アバター画像URL
  
  // 連絡先情報
  email?: string;                  // メールアドレス
  phone?: string;                  // 電話番号
  
  // グループ
  groups: string[];                // 所属グループID
  
  // 共有設定
  sharedAddressIds: string[];      // 共有している住所ID
  permissions: Permission[];        // アクセス権限
  
  // メタデータ
  friendshipStatus: 'pending' | 'accepted' | 'blocked';
  addedAt: Date;                   // 追加日時
  lastInteractionAt?: Date;        // 最終やりとり日時
  
  // 統計
  deliveriesCount: number;         // 配送回数
  messagesCount: number;           // メッセージ数
}

interface Permission {
  addressId: string;               // 住所ID
  allowedActions: Action[];        // 許可アクション
  expiresAt?: Date;               // 有効期限
  isTemporary: boolean;            // 一時的か
}

type Action = 
  | 'view'           // 住所を見る
  | 'send'           // 荷物を送る
  | 'share'          // 他の人と共有
  | 'update_status'; // ステータス更新
```

---

## 🔐 プライバシー機能 / Privacy Features

### 段階的な情報公開
1. **レベル1（基本）**: 名前とアバターのみ
2. **レベル2（友達）**: GAP ID、グループ情報
3. **レベル3（配送）**: 配送用の限定的な住所情報（PIDのみ）
4. **レベル4（親密）**: 完全な住所情報（本人の承認が必要）

### アクセス制御
```typescript
import { setPermission } from '@/cloud-address-book-app/contacts-friends';

// 配送専用の一時的アクセスを設定
await setPermission(userId, friendId, {
  addressId: 'addr-123',
  allowedActions: ['send'],
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7日後
  isTemporary: true
});
```

---

## 📱 QR/NFCペアリング / QR/NFC Pairing

### QRコードの種類

1. **パーソナルQR**
   - 永続的な友達追加用
   - 自分のGAP IDを含む
   - 公開プロフィール情報を含む

2. **配送専用QR**
   - 一時的な配送先登録用
   - PIDのみを含む
   - 期限付き（デフォルト24時間）

3. **イベントQR**
   - イベント参加者同士の交換用
   - グループ情報を含む
   - 有効期限あり

### NFCタップ
```typescript
import { handleNFCTap } from '@/cloud-address-book-app/contacts-friends/qr-pairing';

// NFCタップを処理
await handleNFCTap({
  onSuccess: (contact) => {
    console.log(`${contact.name}を追加しました`);
  },
  onError: (error) => {
    console.error('NFCエラー:', error);
  }
});
```

---

## 👪 グループ管理 / Group Management

### グループタイプ

| タイプ | 用途 | 例 |
|--------|------|-----|
| **Company** | ビジネス関係 | 同僚、取引先、パートナー |
| **School** | 学校関係 | 同級生、先生、OB/OG |
| **Team** | プロジェクト | チームメンバー、協力者 |
| **Family** | 家族・親戚 | 両親、兄弟、親戚 |
| **Custom** | カスタム | ユーザー定義グループ |

### グループ機能

```typescript
import { Group } from '@/cloud-address-book-app/contacts-friends';

class Group {
  // グループ一括送信
  async sendToAll(message: string) {
    // グループ全員にメッセージ送信
  }
  
  // グループQRコード生成
  async generateGroupQR() {
    // グループ招待用QRコード
  }
  
  // グループ権限設定
  async setGroupPermissions(permissions: Permission[]) {
    // グループメンバー全員に同じ権限を設定
  }
}
```

---

## 🔔 通知機能 / Notifications

### 友達関連の通知

1. **友達リクエスト**
   - 新しい友達リクエストを受信
   - リクエストの承認/拒否

2. **配送通知**
   - 友達から荷物が送られた
   - 配送状況の更新

3. **権限変更**
   - 友達がアクセス権限を変更した
   - 期限切れの通知

4. **グループ招待**
   - 新しいグループに招待された
   - グループメンバーの変更

---

## 📊 連絡先統計 / Contact Statistics

### 表示される統計情報

| メトリクス | 説明 |
|-----------|------|
| 友達数 | 登録されている友達の総数 |
| グループ数 | 作成したグループの数 |
| 配送回数 | 友達との間で行われた配送の総数 |
| 最近の追加 | 直近30日間に追加した友達 |
| アクティブな友達 | 過去90日間にやりとりした友達 |

---

## 🌐 GAP ID仕様 / GAP ID Specification

### GAP IDフォーマット

```
gap:user:<hash>
```

- **gap**: Global Address Protocolのプレフィックス
- **user**: エンティティタイプ（user, business, serviceなど）
- **hash**: 一意のハッシュ値（SHA-256ベース）

### 例
```
gap:user:a7b3c9d4e5f6g7h8i9j0k1l2m3n4o5p6
gap:business:x1y2z3a4b5c6d7e8f9g0h1i2j3k4l5m6
gap:service:q9w8e7r6t5y4u3i2o1p0a9s8d7f6g5h4
```

### GAP IDの生成
```typescript
import { generateGAPID } from '@/cloud-address-book-app/contacts-friends/gap-id';

const gapId = await generateGAPID({
  userId: 'user-123',
  type: 'user',
  entropy: randomBytes(32)  // 追加のランダム性
});

console.log(gapId);  // gap:user:a7b3c9d4e5f6g7h8i9j0k1l2m3n4o5p6
```

---

## 🔗 関連ページ / Related Pages

- [Shipping Tools](../shipping-tools/README.md) - 友達への送り状生成
- [Security & Privacy](../security-privacy/README.md) - 共有権限のセキュリティ
- [My Addresses](../my-addresses/README.md) - 共有する住所の管理
- [Dashboard](../dashboard/README.md) - 友達との活動履歴

---

**🌐 World Address YAML / JSON** - Contacts & Friends Management
