# AI機能 / AI Capabilities

このディレクトリには、World Address YAMLシステムのAI機能に関するドキュメントが含まれています。

This directory contains documentation about AI capabilities in the World Address YAML system.

## 📁 ドキュメント / Documents

| ファイル | 説明 |
|---------|------|
| [ai-capabilities.md](./ai-capabilities.md) | **AI機能強化戦略** - 検索精度・安全性・相互運用性を向上させる5つのAI機能 |
| [waybill-ai-capabilities.md](./waybill-ai-capabilities.md) | **送り状AI・アルゴリズム** - 送り状の生成・検索・管理における10のAI機能 |

## 🤖 概要 / Overview

### AI機能強化戦略

システム全体の以下5つのAI機能について解説しています：

1. **住所理解・構造化AI** - 住所をPID構造に正規化し一致検索
2. **住所検索UI最適化AI** - 利用タイプに合わせた最優先候補の抽出
3. **決済接続AI** - 住所ごとに適合する決済候補を優先判断
4. **提携インデックス管理AI** - 提携状態のインデックス最適化
5. **攻撃・異常検知AI** - セキュリティ監視と信頼性の確保

### 送り状AI・アルゴリズム

送り状の生成・検索・管理における以下10のAI・アルゴリズム機能について解説しています：

1. **Waybill Parse AI** - 送り状構造の解析・仕様理解
2. **Carrier Adapt AI** - 配送業者ごとの仕様・必須フィールド適合
3. **PID Embed AI** - 住所PIDの埋め込みとユニークID生成
4. **Field Align AI** - 国ごとの住所階層・並び順の整合性マッピング
5. **Error Prevent AI** - 生成時・提出時のエラー自動検出・補正
6. **FedEx-like Ranking Search** - 送り状生成・過去伝票の優先検索
7. **Fraud Block LSH** - 不正住所入力・スパム検出
8. **Waybill Nonce AI** - ワンタイムNonce IDによる改ざん防止
9. **Merklized Routing Hash** - 宛先一致の高速検証
10. **Wallet Waybill Restore AI** - ウォレットアプリからの送り状復元

## 🔗 関連ドキュメント / Related Documents

- [クラウド住所帳システム](../cloud-address-book.md) - システムの全体像
- [住所検索エンジン](../address-search-engine.md) - 検索UIの仕様
- [システムアーキテクチャ](../cloud-address-book-architecture.md) - 技術アーキテクチャ
