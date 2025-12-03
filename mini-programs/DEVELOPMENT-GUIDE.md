# Development Guide / 開発ガイド

このガイドでは、WeChat・Alipayミニプログラムの効率的な開発方法を説明します。

---

## 🛠️ 環境セットアップ / Environment Setup

### 必要なツール / Required Tools

1. **Node.js** (v16以降)
2. **npm** or **yarn**
3. **TypeScript** (v5.0以降)
4. **WeChat Developer Tools** (WeChat開発用)
5. **Alipay Developer Tools** (Alipay開発用)

### インストール / Installation

```bash
# リポジトリのクローン
git clone https://github.com/rei-k/world-address-yaml.git
cd world-address-yaml/mini-programs

# 共通モジュールのセットアップ
cd common
npm install
npm run build

# WeChatモジュールのセットアップ
cd ../wechat
npm install
npm run build

# Alipayモジュールのセットアップ
cd ../alipay
npm install
npm run build
```

---

## 📁 プロジェクト構造 / Project Structure

```
mini-programs/
├── common/                    # 共通コードベース
│   ├── src/
│   │   ├── types.ts          # 共通型定義
│   │   ├── utils/            # ユーティリティ関数
│   │   └── services/         # サービス基底クラス
│   ├── package.json
│   └── docs/
│
├── wechat/                    # WeChat固有実装
│   ├── src/
│   │   ├── services/         # WeChat API実装
│   │   ├── utils/            # WeChat ユーティリティ
│   │   └── components/       # WeChat コンポーネント
│   ├── package.json
│   └── docs/
│
└── alipay/                    # Alipay固有実装
    ├── src/
    │   ├── services/         # Alipay API実装
    │   ├── utils/            # Alipay ユーティリティ
    │   └── components/       # Alipay コンポーネント
    ├── package.json
    └── docs/
```

---

## 🔄 開発ワークフロー / Development Workflow

### 1. 共通機能の開発

新しい共通機能を追加する場合：

```bash
cd mini-programs/common/src

# 新しいユーティリティを追加
# utils/new-utility.ts を作成

# types.ts に必要な型を追加

# index.ts でエクスポート
```

**例: 新しいバリデーション関数の追加**

```typescript
// common/src/utils/validation.ts

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
```

```typescript
// common/src/index.ts
export * from './utils/validation';
```

### 2. プラットフォーム固有機能の開発

#### WeChat固有機能

```typescript
// wechat/src/utils/wechat-custom.ts

import { showToast } from './wechat-ui';

export async function customWeChatFeature() {
  // WeChat固有のロジック
  wx.showModal({
    title: 'WeChat固有機能',
    content: 'これはWeChatでのみ動作します',
  });
}
```

#### Alipay固有機能

```typescript
// alipay/src/utils/alipay-custom.ts

import { showToast } from './alipay-ui';

export async function customAlipayFeature() {
  // Alipay固有のロジック
  my.alert({
    title: 'Alipay固有機能',
    content: 'これはAlipayでのみ動作します',
  });
}
```

---

## 🧪 テスト / Testing

### ユニットテストの書き方

```typescript
// common/src/utils/__tests__/validation.test.ts

import { validateEmail } from '../validation';

describe('validateEmail', () => {
  test('有効なメールアドレス', () => {
    expect(validateEmail('test@example.com')).toBe(true);
  });
  
  test('無効なメールアドレス', () => {
    expect(validateEmail('invalid-email')).toBe(false);
  });
});
```

### テストの実行

```bash
# 共通モジュールのテスト
cd common
npm test

# WeChatモジュールのテスト
cd ../wechat
npm test

# Alipayモジュールのテスト
cd ../alipay
npm test
```

---

## 🎯 ベストプラクティス / Best Practices

### 1. 共通コードの原則

**DO ✅**
- ビジネスロジックは共通モジュールに
- プラットフォーム非依存の関数を作成
- 型定義を活用して型安全性を確保

**DON'T ❌**
- プラットフォーム固有のAPIを直接使用しない
- ハードコードされた値を避ける
- グローバル変数を使用しない

### 2. プラットフォーム固有コードの原則

**DO ✅**
- 共通の基底クラスを継承
- プラットフォームのUI/UXガイドラインに従う
- エラーハンドリングを適切に実装

**DON'T ❌**
- ビジネスロジックを重複させない
- プラットフォーム間でコードをコピペしない

### 3. コードスタイル

```typescript
// 良い例 ✅
export async function fetchUserData(userId: string): Promise<User> {
  try {
    const response = await request('/api/users/' + userId);
    return response.data;
  } catch (error) {
    console.error('ユーザーデータ取得エラー:', error);
    throw new Error('ユーザーデータの取得に失敗しました');
  }
}

// 悪い例 ❌
export function fetchUserData(userId) {
  return request('/api/users/' + userId).data;
}
```

---

## 🔧 共通タスク / Common Tasks

### 新しいサービスの追加

```typescript
// 1. 共通の抽象クラスを作成
// common/src/services/payment.ts

export abstract class PaymentService {
  protected abstract request(url: string, data: any): Promise<any>;
  
  async processPayment(amount: number): Promise<boolean> {
    const response = await this.request('/api/payment', { amount });
    return response.success;
  }
}
```

```typescript
// 2. WeChat実装
// wechat/src/services/wechat-payment.ts

import { PaymentService } from '@vey/mini-common';

export class WeChatPaymentService extends PaymentService {
  protected async request(url: string, data: any) {
    return new Promise((resolve) => {
      wx.request({ url, data, success: resolve });
    });
  }
}
```

```typescript
// 3. Alipay実装
// alipay/src/services/alipay-payment.ts

import { PaymentService } from '@vey/mini-common';

export class AlipayPaymentService extends PaymentService {
  protected async request(url: string, data: any) {
    return new Promise((resolve) => {
      my.request({ url, data, success: resolve });
    });
  }
}
```

---

## 🐛 デバッグ / Debugging

### WeChat開発者ツール

1. **コンソールログ**
```typescript
console.log('デバッグ情報:', data);
console.error('エラー:', error);
```

2. **ブレークポイント**
- 開発者ツールでソースコードを開く
- 行番号をクリックしてブレークポイント設定

3. **ネットワーク監視**
- 開発者ツールの「Network」タブ
- API呼び出しを確認

### Alipay開発者ツール

1. **コンソールログ**
```typescript
console.log('调试信息:', data);
console.error('错误:', error);
```

2. **デバッグモード**
- 開発者ツールで「调试」を有効化
- リアルタイムでコードを監視

---

## 📦 ビルドとデプロイ / Build and Deploy

### ビルド

```bash
# すべてのモジュールをビルド
npm run build:all

# または個別に
cd common && npm run build
cd ../wechat && npm run build
cd ../alipay && npm run build
```

### WeChat ミニプログラムのデプロイ

1. WeChat開発者ツールでプロジェクトを開く
2. 「上传」ボタンをクリック
3. バージョン情報を入力
4. WeChat管理画面で審査申請

### Alipay ミニプログラムのデプロイ

1. Alipay開発者ツールでプロジェクトを開く
2. 「上传」ボタンをクリック
3. バージョン情報を入力
4. Alipay管理画面で審査申請

---

## 🔍 トラブルシューティング / Troubleshooting

### よくある問題

#### 1. TypeScriptコンパイルエラー

```bash
# node_modulesを削除して再インストール
rm -rf node_modules
npm install

# TypeScriptを最新版に更新
npm install typescript@latest --save-dev
```

#### 2. 共通モジュールが見つからない

```bash
# 共通モジュールを先にビルド
cd common
npm run build
npm link

# 他のモジュールでリンク
cd ../wechat
npm link @vey/mini-common
```

#### 3. API呼び出しが失敗

```typescript
// リクエストURLを確認
console.log('API URL:', url);

// レスポンスを確認
console.log('API Response:', response);

// エラーハンドリングを追加
try {
  const result = await apiCall();
} catch (error) {
  console.error('API Error:', error);
  showError(error.message);
}
```

---

## 📚 参考資料 / References

### 公式ドキュメント

- [WeChat Mini-Program開発ドキュメント](https://developers.weixin.qq.com/miniprogram/dev/framework/)
- [Alipay Mini-Program開発ドキュメント](https://opendocs.alipay.com/mini/developer)
- [TypeScript公式ドキュメント](https://www.typescriptlang.org/)

### コミュニティリソース

- [WeChat開発者コミュニティ](https://developers.weixin.qq.com/community/develop)
- [Alipay開発者フォーラム](https://forum.alipay.com/)

---

## 🤝 コントリビューション / Contributing

1. フォークする
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

---

## 📝 ライセンス / License

MIT License

---

**最終更新:** 2024-12-03
