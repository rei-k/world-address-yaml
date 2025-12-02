# 🔐 Security & Privacy / セキュリティ・プライバシー

住所データの暗号化ポリシー、アクセスキー管理、失効管理、監査ログを含む包括的なセキュリティシステム。

Comprehensive security system including encryption policies, access key management, revocation management, and audit logs for address data.

---

## 🎯 主要機能 / Key Features

### Encryption Policy（住所データ暗号ポリシー）
- **PQC（Post-Quantum Cryptography）**: 量子コンピュータ耐性暗号
- **署名**: デジタル署名による改ざん防止
- **エンドツーエンド暗号化**: 送信から保存まで一貫した暗号化

### Access Keys（アクセスキー管理）
- **QRキー**: QRコードベースの認証
- **NFCキー**: NFC認証デバイス
- **トークンキー**: APIトークン・セッショントークン

### Revocation Management（住所削除/失効管理）
- **住所削除**: 完全な住所データ削除
- **失効リスト**: PID失効管理
- **Merkle Tree**: 効率的な失効リスト管理

### Audit Logs（監査ログ）
- **アクセス監査**: 誰がいつ住所を利用したか
- **変更履歴**: 住所データの変更記録
- **不正検知**: 異常なアクセスパターンの検出

---

## 📂 ディレクトリ構成 / Directory Structure

```
security-privacy/
├── README.md                    # このファイル
├── encryption-policy/           # 住所データ暗号ポリシー
│   ├── pqc.md                  # Post-Quantum Cryptography
│   └── signature.md            # 署名
├── access-keys/                 # アクセスキー管理
│   ├── qr-keys.md              # QRキー
│   ├── nfc-keys.md             # NFCキー
│   └── token-keys.md           # トークンキー
├── revocation/                  # 住所削除/失効管理
│   ├── address-deletion.md     # 住所削除
│   └── revocation-list.md      # 失効リスト
└── audit-logs/                  # 監査ログ
    └── access-audit.md         # アクセス監査
```

---

## 🚀 使用方法 / Usage

### 住所の暗号化

```typescript
import { encryptAddress } from '@/cloud-address-book-app/security-privacy';

// AES-256-GCMで暗号化
const encrypted = await encryptAddress(address, {
  algorithm: 'AES-256-GCM',
  key: userEncryptionKey,
  additionalData: userId
});

console.log(encrypted);
// {
//   ciphertext: '...',
//   iv: '...',
//   tag: '...',
//   algorithm: 'AES-256-GCM'
// }
```

### PQC対応暗号化

```typescript
import { encryptWithPQC } from '@/cloud-address-book-app/security-privacy/encryption-policy';

// 量子コンピュータ耐性暗号で暗号化
const pqcEncrypted = await encryptWithPQC(address, {
  algorithm: 'CRYSTALS-Kyber',  // NIST標準化候補
  securityLevel: 5,             // 最高セキュリティレベル
  publicKey: recipientPublicKey
});
```

### デジタル署名

```typescript
import { signAddress } from '@/cloud-address-book-app/security-privacy/encryption-policy';

// 住所データに署名
const signed = await signAddress(address, {
  algorithm: 'EdDSA',           // Edwards-curve Digital Signature Algorithm
  privateKey: userPrivateKey,
  includeTimestamp: true
});

// 署名の検証
const verified = await verifySignature(signed, {
  publicKey: userPublicKey
});

if (verified) {
  console.log('署名が有効です');
}
```

### アクセスキーの生成

```typescript
import { generateAccessKey } from '@/cloud-address-book-app/security-privacy/access-keys';

// QRコードキーの生成
const qrKey = await generateAccessKey({
  type: 'qr',
  addressId: 'addr-123',
  expiresIn: 3600,              // 1時間有効
  allowedActions: ['read'],
  oneTimeUse: true
});

// NFCキーの生成
const nfcKey = await generateAccessKey({
  type: 'nfc',
  addressId: 'addr-123',
  deviceId: 'device-456',
  biometric: true               // 生体認証必須
});

// APIトークンの生成
const apiToken = await generateAccessKey({
  type: 'token',
  scope: ['addresses:read', 'addresses:use'],
  expiresIn: 2592000           // 30日間有効
});
```

### 住所の失効

```typescript
import { revokeAddress } from '@/cloud-address-book-app/security-privacy/revocation';

// 住所PIDを失効
await revokeAddress('addr-123', {
  reason: 'moved',              // 理由: 引越し
  effectiveDate: new Date(),    // 即座に失効
  notifyLinkedSites: true       // 連携サイトに通知
});

// 失効リストの確認
const isRevoked = await checkRevocation('pid-xyz');
console.log(isRevoked);  // true
```

### 監査ログの取得

```typescript
import { getAuditLogs } from '@/cloud-address-book-app/security-privacy/audit-logs';

// 特定期間のアクセスログを取得
const logs = await getAuditLogs(userId, {
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-12-31'),
  action: 'address_access',
  includeIP: true
});

logs.forEach(log => {
  console.log(`${log.timestamp}: ${log.accessor} が ${log.action} を実行`);
  console.log(`  IPアドレス: ${log.ipAddress}`);
  console.log(`  デバイス: ${log.userAgent}`);
});
```

---

## 📋 セキュリティデータモデル / Security Data Model

```typescript
interface EncryptedAddress {
  id: string;
  userId: string;
  ciphertext: string;             // 暗号化されたデータ
  algorithm: EncryptionAlgorithm; // 暗号化アルゴリズム
  iv: string;                     // 初期化ベクトル
  tag?: string;                   // 認証タグ（AEAD）
  keyId: string;                  // 暗号鍵ID
  version: number;                // 暗号化バージョン
  createdAt: Date;
  expiresAt?: Date;
}

type EncryptionAlgorithm = 
  | 'AES-256-GCM'                 // 現在の標準
  | 'AES-256-CBC'
  | 'ChaCha20-Poly1305'
  | 'CRYSTALS-Kyber'              // PQC
  | 'SPHINCS+';                   // PQC署名

interface AccessKey {
  id: string;
  userId: string;
  type: 'qr' | 'nfc' | 'token';
  key: string;                    // 暗号化されたキー
  addressId?: string;             // 特定の住所へのアクセス
  allowedActions: Action[];
  scope?: string[];               // APIスコープ
  deviceId?: string;              // NFCデバイスID
  biometricRequired: boolean;     // 生体認証必須
  oneTimeUse: boolean;            // 使い捨て
  usageCount: number;             // 使用回数
  maxUsageCount?: number;         // 最大使用回数
  createdAt: Date;
  expiresAt?: Date;
  lastUsedAt?: Date;
  revokedAt?: Date;
}

interface AuditLog {
  id: string;
  userId: string;
  action: AuditAction;
  resourceType: 'address' | 'payment' | 'contact' | 'key';
  resourceId: string;
  accessor: string;               // アクセス者（user, site, carrier）
  accessorId: string;
  purpose: string;                // アクセス目的
  ipAddress: string;
  userAgent: string;
  location?: {
    country: string;
    city: string;
    latitude: number;
    longitude: number;
  };
  result: 'success' | 'failure' | 'blocked';
  errorMessage?: string;
  timestamp: Date;
}

type AuditAction = 
  | 'address_read'
  | 'address_write'
  | 'address_delete'
  | 'address_share'
  | 'key_generate'
  | 'key_revoke'
  | 'login'
  | 'logout'
  | 'permission_grant'
  | 'permission_revoke';

interface RevocationEntry {
  id: string;
  type: 'address' | 'pid' | 'key' | 'credential';
  resourceId: string;
  userId: string;
  reason: RevocationReason;
  effectiveDate: Date;
  merkleProof?: string;           // Merkle Tree証明
  revokedBy: string;
  notifiedParties: string[];
  createdAt: Date;
}

type RevocationReason = 
  | 'moved'                       // 引越し
  | 'security_breach'             // セキュリティ侵害
  | 'user_request'                // ユーザー要求
  | 'expired'                     // 期限切れ
  | 'compromised';                // 漏洩
```

---

## 🔐 暗号化ポリシー / Encryption Policy

### 暗号化レイヤー

1. **転送時暗号化 (TLS 1.3)**
   - すべてのHTTP通信を暗号化
   - Perfect Forward Secrecy対応

2. **保存時暗号化 (AES-256-GCM)**
   - データベース内のすべての住所データを暗号化
   - 鍵はHSM（Hardware Security Module）で管理

3. **エンドツーエンド暗号化**
   - ユーザーデバイス→サーバー→配送業者の全経路で暗号化
   - サーバーでも復号できない（ユーザーの鍵のみ）

### PQC移行計画

```typescript
// ハイブリッド暗号化（従来+PQC）
const hybridEncryption = await encryptAddress(address, {
  traditional: {
    algorithm: 'AES-256-GCM',
    key: aesKey
  },
  pqc: {
    algorithm: 'CRYSTALS-Kyber',
    publicKey: kyberPublicKey
  },
  mode: 'hybrid'  // 両方を使用
});
```

---

## 🔑 アクセスキー管理 / Access Key Management

### キーの種類

| キータイプ | 用途 | 有効期限 | 特徴 |
|-----------|------|---------|------|
| **QRキー** | 一時的な住所共有 | 短期（数時間〜1日） | 使い捨て、スキャンで即認証 |
| **NFCキー** | デバイス認証 | 中期（数ヶ月） | 生体認証併用、物理デバイス必須 |
| **APIトークン** | プログラマティックアクセス | 長期（数ヶ月〜1年） | スコープ制限、回数制限 |

### キーローテーション

```typescript
import { rotateKeys } from '@/cloud-address-book-app/security-privacy/access-keys';

// 定期的な鍵ローテーション（90日ごと推奨）
await rotateKeys(userId, {
  rotateEncryptionKeys: true,
  rotateSigningKeys: true,
  notifyUser: true
});
```

---

## 🗑️ 住所削除 / Address Deletion

### 削除の種類

1. **論理削除（ソフトデリート）**
   - データは残すが非アクティブ化
   - 監査目的で保持
   - 復元可能

2. **物理削除（ハードデリート）**
   - データベースから完全削除
   - 暗号化鍵も削除
   - 復元不可能

```typescript
import { deleteAddress } from '@/cloud-address-book-app/security-privacy/revocation';

// 論理削除
await deleteAddress('addr-123', {
  type: 'soft',
  retentionPeriod: 365  // 365日後に物理削除
});

// 物理削除（即座に）
await deleteAddress('addr-123', {
  type: 'hard',
  confirmDeletion: true,
  deleteBackups: true
});
```

---

## 📊 監査ログ / Audit Logs

### ログの保持期間

| ログタイプ | 保持期間 | 理由 |
|-----------|---------|------|
| アクセスログ | 7年 | 法的要件（監査） |
| 変更履歴 | 5年 | トラブルシューティング |
| セキュリティイベント | 10年 | インシデント調査 |

### ログ分析

```typescript
import { analyzeAuditLogs } from '@/cloud-address-book-app/security-privacy/audit-logs';

// 不審なアクセスパターンを検出
const analysis = await analyzeAuditLogs(userId, {
  detectAnomalies: true,
  timeWindow: '30d'
});

if (analysis.anomalies.length > 0) {
  console.log('⚠️ 不審なアクセスが検出されました');
  analysis.anomalies.forEach(anomaly => {
    console.log(`  ${anomaly.description}`);
    console.log(`  リスクレベル: ${anomaly.riskLevel}`);
  });
}
```

---

## 🛡️ セキュリティベストプラクティス / Security Best Practices

### ユーザー向け

- ✅ 強力なパスワードを使用
- ✅ 二要素認証（2FA）を有効化
- ✅ 定期的にアクセスログを確認
- ✅ 不審なアクティビティを即座に報告
- ✅ 公共Wi-Fiでの利用時は VPN使用

### 開発者向け

- ✅ すべての入力をバリデーション
- ✅ SQL インジェクション対策
- ✅ XSS対策
- ✅ CSRF トークン使用
- ✅ レート制限の実装
- ✅ 定期的なセキュリティ監査

---

## 🔔 セキュリティアラート / Security Alerts

### アラート条件

1. **不正ログイン試行**
   - 5回連続のログイン失敗
   - アカウントを一時ロック

2. **不審なアクセス**
   - 通常と異なる国からのアクセス
   - 通常と異なる時間帯のアクセス
   - 大量のデータダウンロード

3. **権限の異常な変更**
   - 住所の大量削除
   - 権限の大量付与

```typescript
import { subscribeToSecurityAlerts } from '@/cloud-address-book-app/security-privacy';

// セキュリティアラートを購読
subscribeToSecurityAlerts(userId, {
  channels: ['email', 'push', 'sms'],
  severity: ['high', 'critical'],
  immediateNotification: true
});
```

---

## 🔗 関連ページ / Related Pages

- [My Addresses](../my-addresses/README.md) - 住所データ管理
- [Settings](../settings/README.md) - セキュリティ設定
- [Dashboard](../dashboard/README.md) - セキュリティ統計
- [Sites Linked](../sites-linked/README.md) - サイトアクセス管理

---

## 📚 参考資料 / References

- [NIST Post-Quantum Cryptography](https://csrc.nist.gov/projects/post-quantum-cryptography)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [GDPR Compliance](https://gdpr.eu/)
- [ISO 27001](https://www.iso.org/isoiec-27001-information-security.html)

---

**🌐 World Address YAML / JSON** - Security & Privacy Management
