# 🏠 クラウド住所帳アプリケーション / Cloud Address Book Application

プライバシー保護型のクラウド住所帳専用アプリケーション。ソーシャルログインで住所フォーム採用サイトに自動入力できる次世代住所管理システム。

A privacy-preserving cloud address book application that enables automatic address form filling on any site with social login integration.

---

## 📱 概要 / Overview

クラウド住所帳を持っていれば、住所フォームを採用しているサイトでソーシャルログインするだけで住所入力を代行します。

With this cloud address book, simply log in with social authentication on any site with address forms, and your address will be automatically filled in.

### 主要機能 / Key Features

- 🔐 **完全なプライバシー保護**: ゼロ知識証明（ZKP）による住所の秘匿
- ✨ **ワンクリックチェックアウト**: デフォルト住所で高速決済
- 💳 **統合決済管理**: クレカ・デジタル決済IDを一元管理
- 👥 **友達・連絡先管理**: QR/NFCペアリングで簡単登録
- 📦 **配送ツール**: 送り状生成・配送追跡を一括管理
- 🌍 **グローバル対応**: 全世界の住所フォーマットに対応
- 🔒 **エンタープライズセキュリティ**: PQC/署名・監査ログ完備

---

## 🗂️ ディレクトリ構造 / Directory Structure

```
cloud-address-book-app/
├── README.md                          # このファイル / This file
│
├── dashboard/                         # 📍 Dashboard / Overview
│   ├── README.md                      # ダッシュボード概要
│   ├── status/                        # 住所ステータス
│   │   ├── normalization-status.md   # 正規化状況
│   │   ├── verification-status.md    # 照合状況
│   │   └── usage-stats.md            # 利用サイト数統計
│   └── recent-activities/             # 最近の利用
│       ├── checkout-history.md       # チェックアウト履歴
│       ├── nfc-checkin.md            # NFCチェックイン履歴
│       └── waybill-history.md        # 送り状生成履歴
│
├── my-addresses/                      # 🏠 My Addresses
│   ├── README.md                      # 住所管理概要
│   ├── default-address/               # デフォルト住所
│   │   ├── main-address.md           # メイン住所設定
│   │   └── quick-checkout.md         # 高速チェックアウト用
│   ├── additional-addresses/          # 追加住所
│   │   ├── home.md                   # 実家
│   │   ├── office.md                 # 事務所
│   │   ├── branch.md                 # 別拠点
│   │   ├── international.md          # 海外住所
│   │   └── relocation.md             # 移住先
│   └── address-history/               # 住所履歴
│       ├── timeline.md               # 引越タイムライン
│       └── lifelog.md                # 住所ライフログ
│
├── payment-methods/                   # 💳 Payment Methods（新規追加）
│   ├── README.md                      # 決済手段管理概要
│   ├── credit-cards/                  # クレジットカード
│   │   ├── visa.md                   # Visa
│   │   ├── mastercard.md             # Mastercard
│   │   ├── jcb.md                    # JCB
│   │   └── amex.md                   # American Express
│   ├── digital-payments/              # デジタル決済ID
│   │   ├── paypal.md                 # PayPal
│   │   ├── stripe-tokens.md          # Stripeトークン
│   │   ├── apple-pay.md              # Apple Pay
│   │   └── google-pay.md             # Google Pay
│   ├── bank-accounts/                 # 銀行口座リンク（将来拡張）
│   │   ├── iban.md                   # IBAN
│   │   └── routing-id.md             # Routing ID
│   └── payment-history/               # 支払い履歴
│       └── submission-log.md         # 提出ログのみ
│
├── contacts-friends/                  # 👥 Contacts / Friends
│   ├── README.md                      # 連絡先管理概要
│   ├── qr-pairing/                    # QRペアリング
│   │   ├── scan-qr.md                # QRコードスキャン
│   │   └── generate-qr.md            # QRコード生成
│   ├── gap-id/                        # GAP ID連絡先
│   │   └── gap-id-management.md      # GAP ID管理
│   ├── groups/                        # グループ管理
│   │   ├── company.md                # 会社
│   │   ├── school.md                 # 学校
│   │   ├── team.md                   # チーム
│   │   └── family.md                 # 家族
│   └── permissions/                   # 共有権限管理（任意拡張）
│       └── sharing-permissions.md    # 住所共有権限設定
│
├── shipping-tools/                    # 📦 Shipping & Parcel Tools
│   ├── README.md                      # 配送ツール概要
│   ├── waybill-generation/            # 送り状生成
│   │   ├── create-waybill.md         # 送り状作成
│   │   └── templates.md              # テンプレート管理
│   ├── carrier-integration/           # 配送キャリア提出ログ
│   │   ├── carrier-list.md           # キャリア一覧
│   │   └── submission-log.md         # 提出ログ
│   ├── address-routing/               # 住所ルーティング
│   │   └── carrier-adaptation.md     # キャリア適合住所変換
│   └── zkp-proofs/                    # ZKP Proofs（将来の匿名証明）
│       └── anonymous-proof.md        # 匿名証明のみ
│
├── sites-linked/                      # 🏢 Sites Linked
│   ├── README.md                      # 提携サイト管理概要
│   ├── ec-accounts/                   # 提携ECアカウント一覧
│   │   └── account-list.md           # アカウント一覧
│   ├── authorization-status/          # 住所提供ステータス
│   │   ├── authorized.md             # 権限付与済
│   │   └── unauthorized.md           # 未付与
│   └── revocation/                    # 提携解除
│       └── access-revocation.md      # 住所アクセス権削除
│
├── global-formats/                    # 🌍 Global Formats / Schema Library
│   ├── README.md                      # グローバルフォーマット概要
│   ├── country-formats/               # 国・自治領・海外領の住所フォーム
│   │   ├── asia.md                   # アジア
│   │   ├── europe.md                 # ヨーロッパ
│   │   ├── americas.md               # アメリカ大陸
│   │   ├── africa.md                 # アフリカ
│   │   ├── oceania.md                # オセアニア
│   │   └── antarctica.md             # 南極
│   ├── multilingual/                  # 多言語フォーマット管理
│   │   ├── local-language.md         # 現地語
│   │   └── english.md                # 英語
│   └── pid-generation/                # PID生成仕様
│       ├── hash-space.md             # ハッシュ空間
│       └── hierarchical-id.md        # 階層識別設定
│
├── security-privacy/                  # 🔐 Security & Privacy
│   ├── README.md                      # セキュリティ・プライバシー概要
│   ├── encryption-policy/             # 住所データ暗号ポリシー
│   │   ├── pqc.md                    # Post-Quantum Cryptography
│   │   └── signature.md              # 署名
│   ├── access-keys/                   # アクセスキー管理
│   │   ├── qr-keys.md                # QRキー
│   │   ├── nfc-keys.md               # NFCキー
│   │   └── token-keys.md             # トークンキー
│   ├── revocation/                    # 住所削除/失効管理
│   │   ├── address-deletion.md       # 住所削除
│   │   └── revocation-list.md        # 失効リスト
│   └── audit-logs/                    # 監査ログ
│       └── access-audit.md           # アクセス監査（誰がいつ住所を利用したか）
│
├── settings/                          # ⚙ Settings
│   ├── README.md                      # 設定概要
│   ├── locale/                        # デフォルト国/言語設定
│   │   ├── country.md                # 国設定
│   │   └── language.md               # 言語設定
│   ├── financial/                     # ベース通貨/税/ロケール
│   │   ├── currency.md               # 通貨設定
│   │   ├── tax.md                    # 税設定
│   │   └── locale.md                 # ロケール設定（金融・EC用）
│   ├── wallet-integration/            # Wallet連携（将来）
│   │   ├── google-wallet.md          # Google Wallet
│   │   └── apple-wallet.md           # Apple Wallet
│   └── developer/                     # Webhook/APIキー管理
│       ├── webhooks.md               # Webhook設定
│       └── api-keys.md               # APIキー管理
│
└── shared/                            # 🔧 Shared Components
    ├── components/                    # 共通コンポーネント
    ├── types/                         # 型定義
    ├── utils/                         # ユーティリティ
    └── constants/                     # 定数
```

---

## 🚀 クイックスタート / Quick Start

### 前提条件 / Prerequisites

```bash
# Node.js 18以上
node --version

# パッケージマネージャー（npm, yarn, pnpmのいずれか）
npm --version
```

### インストール / Installation

```bash
# リポジトリをクローン
git clone https://github.com/rei-k/world-address-yaml.git
cd world-address-yaml/cloud-address-book-app

# 依存関係のインストール
npm install

# 環境変数の設定
cp .env.example .env
# .envファイルを編集してAPIキーなどを設定
```

### 開発サーバーの起動 / Development Server

```bash
# 開発サーバーを起動
npm run dev

# ブラウザで http://localhost:3000 を開く
```

---

## 📱 サイドメニュー構成 / Side Menu Structure

### 📍 Dashboard / Overview
住所のステータス（正規化・照合状況・利用サイト数）と最近の利用履歴（チェックアウト・NFCチェックイン・送り状生成）を一覧表示

View address status (normalization, verification, site usage) and recent activities (checkout, NFC check-in, waybill generation)

### 🏠 My Addresses
- **Default Address**: 高速チェックアウト用のメイン住所
- **Additional Addresses**: 別拠点・実家・事務所・海外住所・移住先
- **Address History**: 引越タイムライン・住所ライフログ

### 💳 Payment Methods（今回の要件で追加）
- **Credit Cards**: Visa / Mastercard / JCB / Amex
- **Digital Payment IDs**: PayPal / Stripe Tokens / Apple Pay / Google Pay
- **Bank Account Links**: IBAN / Routing ID（将来拡張）
- **Payment History**: 住所とは分離、提出ログのみ

### 👥 Contacts / Friends
- **QR Pairing**: QRコードで友達登録
- **GAP ID**: GAP IDでの連絡先管理
- **Groups**: 会社・学校・チーム・家族
- **Sharing Permissions**: 誰にどこまで住所を見せるか（任意拡張）

### 📦 Shipping & Parcel Tools
- **Waybill Generation**: クラウド住所×相手住所で送り状作成
- **Carrier Integration**: 配送業者への提出ログ（業者にはフル公開）
- **Address Routing**: キャリア適合住所変換
- **ZKP Proofs**: 将来の匿名証明のみ

### 🏢 Sites Linked（住所採用EC/サービス）
- **EC Accounts**: 提携ECアカウント一覧
- **Authorization Status**: 住所提供ステータス（権限付与済/未付与）
- **Revocation**: 提携解除（住所アクセス権削除、EC側管理）

### 🌍 Global Formats / Schema Library
- **Country Formats**: 国・自治領・海外領の住所フォーム一覧
- **Multilingual**: 多言語フォーマット管理（現地語/英語）
- **PID Generation**: PID生成仕様（ハッシュ空間/階層識別設定）

### 🔐 Security & Privacy
- **Encryption Policy**: 住所データ暗号ポリシー（PQC/署名）
- **Access Keys**: アクセスキー管理（QR/NFC/Token）
- **Revocation Management**: 住所削除/失効管理
- **Audit Logs**: 監査ログ（誰がいつ住所を利用したか）

### ⚙ Settings
- **Locale**: デフォルト国/言語設定
- **Financial**: ベース通貨/税/ロケール（金融・EC用）
- **Wallet Integration**: Google Wallet / Apple Wallet連携（将来）
- **Developer**: Webhook/APIキー管理（開発者利用）

---

## 🔗 関連ドキュメント / Related Documentation

### システムアーキテクチャ
- [クラウド住所帳システム概要](../docs/cloud-address-book.md)
- [アーキテクチャ詳細](../docs/cloud-address-book-architecture.md)
- [実装ガイド](../docs/cloud-address-book-implementation.md)

### プロトコル
- [ZKPプロトコル](../docs/zkp-protocol.md)
- [API仕様](../docs/zkp-api.md)
- [デジタルハンドシェイク](../docs/digital-handshake-logistics.md)

### 統合
- [ウォレット統合](../docs/wallet-integration.md)
- [SDK Documentation](../sdk/README.md)

### データ
- [World Address Data](../data/README.md)
- [Schema Documentation](../docs/schema/README.md)

---

## 🛡️ セキュリティ機能 / Security Features

### プライバシー保護
- ✅ **ゼロ知識証明（ZKP）**: 住所を公開せずに検証
- ✅ **エンドツーエンド暗号化**: AES-256-GCM
- ✅ **PQC対応**: 量子コンピュータ耐性暗号

### アクセス制御
- ✅ **DID/VC認証**: 分散型ID・検証可能クレデンシャル
- ✅ **権限管理**: きめ細かいアクセス権限設定
- ✅ **監査ログ**: すべてのアクセスを記録

### データ管理
- ✅ **PID失効**: 住所変更時の安全な失効処理
- ✅ **Merkle Tree**: 効率的な失効リスト管理
- ✅ **バックアップ**: 暗号化バックアップ対応

---

## 🧪 テスト / Testing

```bash
# 全テスト実行
npm test

# ユニットテストのみ
npm run test:unit

# 統合テスト
npm run test:integration

# E2Eテスト
npm run test:e2e

# カバレッジレポート生成
npm run test:coverage
```

---

## 📦 デプロイ / Deployment

### プロダクションビルド

```bash
# ビルド
npm run build

# ビルド結果の確認
npm run preview
```

### Docker対応

```bash
# Dockerイメージのビルド
docker build -t cloud-address-book-app .

# コンテナの起動
docker run -p 3000:3000 cloud-address-book-app
```

### クラウドデプロイ

- **Vercel**: `vercel deploy`
- **Netlify**: `netlify deploy`
- **AWS**: CloudFormationテンプレート提供予定
- **Google Cloud**: App Engine設定ファイル提供予定

---

## 🤝 貢献 / Contributing

プルリクエストを歓迎します！貢献ガイドラインは [CONTRIBUTING.md](../CONTRIBUTING.md) をご覧ください。

Pull requests are welcome! Please see [CONTRIBUTING.md](../CONTRIBUTING.md) for contribution guidelines.

### 開発フロー

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチをプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

---

## 📝 ライセンス / License

MIT License - 詳細は [LICENSE](../LICENSE) ファイルをご覧ください

---

## 📞 サポート / Support

- 📧 Email: support@vey.example
- 💬 Discord: [Join our community](https://discord.gg/vey)
- 🐛 Issues: [GitHub Issues](https://github.com/rei-k/world-address-yaml/issues)
- 📚 Documentation: [Full Documentation](../docs/README.md)

---

**🌐 World Address YAML / JSON** - プライバシー保護型クラウド住所帳アプリケーション
