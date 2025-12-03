# クラウド住所帳データ / Cloud Address Book Data

このディレクトリには、クラウド住所帳システム向けのデータが含まれています。

## 📋 概要

クラウド住所帳システムは、ゼロ知識証明（ZKP）を中心とした、プライバシー保護型のクラウド住所管理システムです。このディレクトリには、システム運用に必要な各種データとスキーマが格納されています。

## 🔐 主要機能

- **完全なプライバシー保護**: ECサイトや第三者は生住所を一切見ることができません
- **検証可能な配送**: ZK証明により、住所を公開せずに配送可能性を証明
- **完全な監査可能性**: すべてのアクセスを記録し、不正利用を防止
- **ユーザー主権**: ユーザーが自分の住所データを完全に管理
- **グローバル対応**: すべての国の住所形式に対応
- **モバイルウォレット統合**: Google Wallet/Apple Walletとシームレスに連携

## 📦 含まれるデータ

このディレクトリには以下のデータが含まれます：

### AMF（Address Mapping Framework）
- 住所正規化ルール
- 国別・地域別のマッピング定義
- 住所フィールドの標準化ルール

### PID（Place ID）定義
- 階層的な住所識別子の定義
- 国別・地域別のPIDフォーマット
- PIDエンコード・デコードルール

### ZKP回路定義
- ゼロ知識証明の回路定義
- 国別・地域別の検証条件
- プライバシー保護ポリシー

### VC（Verifiable Credential）テンプレート
- 住所クレデンシャルのテンプレート
- 発行者・検証者の定義
- 失効リスト

### 配送業者統合データ
- 配送業者別のアクセス制御ルール
- ラストワンマイル配送のポリシー
- 監査ログフォーマット

## 📝 データ形式

データは `.yaml` と `.json` の両方の形式で提供されています。

### ディレクトリ構造

```
data/cloud-address-book/
├── amf/                        # Address Mapping Framework
│   ├── {国コード}/
│   │   ├── mapping.yaml
│   │   └── mapping.json
│   └── global/
│       ├── rules.yaml
│       └── rules.json
├── pid/                        # Place ID定義
│   ├── {国コード}/
│   │   ├── format.yaml
│   │   └── format.json
│   └── encoding/
│       ├── rules.yaml
│       └── rules.json
├── zkp/                        # ZKP回路定義
│   ├── circuits/
│   │   ├── address-validation.yaml
│   │   └── region-proof.yaml
│   └── policies/
│       ├── {国コード}.yaml
│       └── {国コード}.json
├── vc/                         # Verifiable Credential
│   ├── templates/
│   │   ├── address-credential.yaml
│   │   └── address-credential.json
│   └── revocation/
│       └── lists.yaml
├── carriers/                   # 配送業者統合
│   ├── access-control/
│   │   ├── policies.yaml
│   │   └── policies.json
│   └── audit/
│       ├── log-format.yaml
│       └── log-format.json
└── README.md
```

## 🎯 対象ユーザー

- クラウド住所帳システム開発者
- ECサイト統合担当者
- 配送業者システム開発者
- プライバシー保護技術研究者
- ゼロ知識証明エンジニア

## 🔧 使用例

### PIDの生成

```typescript
import { encodePID, normalizeAddress } from '@vey/core';

// 住所の正規化
const normalized = await normalizeAddress(rawAddress, 'JP');

// PID生成
const pid = encodePID(normalized);
console.log(pid); // "JP-13-113-01-T07-B12-BN02-R342"
```

### ZK証明の検証

```typescript
import { validateShippingRequest } from '@vey/core';

// 配送条件を満たすかZK証明で検証
const response = await validateShippingRequest({
  pid: 'JP-13-113-01',
  conditions: {
    allowedCountries: ['JP'],
    allowedRegions: ['13', '14', '27']
  },
  requesterId: 'did:web:ec-site.example',
  timestamp: new Date().toISOString()
});

if (response.valid && response.zkProof) {
  console.log('配送可能です（生住所は公開されません）');
}
```

### 住所クレデンシャルの発行

```typescript
import { createAddressPIDCredential } from '@vey/core';

// Address PID Credentialを発行
const vc = createAddressPIDCredential(
  'did:key:user123',      // ユーザーDID
  'did:web:vey.example',  // プロバイダDID
  'JP-13-113-01',         // 住所PID
  'JP',                   // 国コード
  '13'                    // 都道府県コード
);
```

## 🚀 ロードマップ

- ✅ **v1 MVP**: AMF + PID + 暗号化保存のクラウド住所帳
- 🔄 **v2**: 国コード・地域レベルのZK証明
- 📋 **v3**: 配送業者統合と高度なアクセス制御
- 🎯 **v4**: DID/VC完全連携とマルチキャリア対応
- 🚀 **v5**: Google Wallet/Apple Wallet完全統合

## 🤝 貢献方法

新しいデータやスキーマを追加する場合：

1. 適切なサブディレクトリに移動
2. スキーマに従ってデータを記述（YAML形式）
3. 対応する `.json` ファイルを生成
4. Pull Requestを作成

## 🔗 関連リンク

- [クラウド住所帳システム概要](../../docs/cloud-address-book.md) - システムの全体像と主要フロー
- [システムアーキテクチャ](../../docs/cloud-address-book-architecture.md) - 技術アーキテクチャとデータフロー
- [実装ガイド](../../docs/cloud-address-book-implementation.md) - コード例とベストプラクティス
- [ZKPプロトコル](../../docs/zkp-protocol.md) - ゼロ知識証明プロトコルの詳細
- [API仕様](../../docs/zkp-api.md) - APIリファレンス
- [SDK](../../sdk/) - 開発者向けツール
