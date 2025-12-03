# Contributing Guide / 貢献ガイド

## Code Standards / コード標準

### Platform API Differences / プラットフォームAPI差異

このドキュメントは、WeChatとAlipayの実装における既知の差異を記録しています。

#### HTTP Request Headers

**WeChat:**
```typescript
wx.request({
  header: { 'content-type': 'application/json' } // singular
})
```

**Alipay:**
```typescript
my.request({
  headers: { 'content-type': 'application/json' } // plural
})
```

**理由:** これはプラットフォームAPIの仕様差異です。統一は不可能なため、それぞれのプラットフォームに従っています。

#### HTTP Status Code

**WeChat:**
```typescript
res.statusCode // 200, 404, etc.
```

**Alipay:**
```typescript
res.status // 200, 404, etc.
```

**理由:** プラットフォームAPIの仕様差異です。

### Error Handling Pattern / エラーハンドリングパターン

#### 推奨パターン

```typescript
// Good ✅: エラーをresolveで返す（一貫性のため）
protected async request<T>(...): Promise<ApiResponse<T>> {
  return new Promise((resolve) => {
    api.request({
      success: (res) => {
        resolve({
          success: res.statusCode === 200,
          data: res.data as T,
          error: res.statusCode !== 200 ? {
            code: `HTTP_${res.statusCode}`,
            message: res.data?.message || 'Request failed',
          } : undefined,
        });
      },
      fail: (err) => {
        resolve({
          success: false,
          error: {
            code: 'NETWORK_ERROR',
            message: err.errMsg || 'Network error',
          },
        });
      },
    });
  });
}
```

**理由:** 
- ネットワークエラーとビジネスロジックエラーを区別
- 呼び出し側で常に `.then()` を使用可能
- try-catchの必要性を減らす

### Security Notes / セキュリティノート

#### XOR Encryption

```typescript
// common/src/utils/encryption.ts
export function xorEncrypt(text: string, key: string): string {
  // ⚠️ DEMO ONLY - DO NOT USE IN PRODUCTION
  // For production, use:
  // - WeChat: wx.crypto or cloud functions
  // - Alipay: my.crypto or cloud functions
  // - Common: AES-256-GCM with proper key management
}
```

**プロダクション推奨:**
- WeChat: `wx.getRandomValues()` + Cloud Functions
- Alipay: `my.encrypt()` + Cloud Functions
- 共通: 専用の暗号化ライブラリ（crypto-js, tweetnacl等）

### Internationalization / 国際化

#### Error Codes vs Messages

```typescript
// Bad ❌
throw new Error('ユーザーが見つかりません');

// Good ✅
throw new Error('ERR_USER_NOT_FOUND');

// Better ✅✅
const errorMessages = {
  'ERR_USER_NOT_FOUND': {
    'ja': 'ユーザーが見つかりません',
    'zh': '用户未找到',
    'en': 'User not found',
  }
};
```

詳細は [I18N.md](./I18N.md) を参照。

### TODO Comments / TODOコメント

#### ガイドライン

```typescript
// Bad ❌: 追跡不可能
// TODO: Implement QR code generation

// Good ✅: GitHub Issue参照
// TODO(#123): Implement QR code generation using wx.cloud.callFunction
// See: https://github.com/rei-k/world-address-yaml/issues/123

// Best ✅✅: 実装例付き
/**
 * TODO(#123): Implement QR code generation
 * For production, use:
 * ```typescript
 * const result = await wx.cloud.callFunction({
 *   name: 'generateQR',
 *   data: { content: qrData }
 * });
 * return result.result.qrCodeUrl;
 * ```
 */
```

## Production Checklist / プロダクションチェックリスト

リリース前に以下を確認：

### Security / セキュリティ

- [ ] XOR暗号化を本番用暗号化に置き換え
- [ ] APIキーを環境変数に移動
- [ ] センシティブデータのログ出力を削除
- [ ] HTTPS通信を強制

### QR Code / QRコード

- [ ] WeChat: Cloud Function実装
- [ ] Alipay: Cloud Function実装
- [ ] エラーハンドリング追加
- [ ] キャッシュ戦略実装

### Internationalization / 国際化

- [ ] エラーメッセージを翻訳
- [ ] UIテキストを翻訳
- [ ] ロケール検出実装
- [ ] フォールバック言語設定

### Testing / テスト

- [ ] ユニットテスト実装
- [ ] E2Eテスト実装
- [ ] WeChat開発者ツールで検証
- [ ] Alipay開発者ツールで検証

### Performance / パフォーマンス

- [ ] 画像最適化
- [ ] API呼び出し最小化
- [ ] ローカルキャッシュ実装
- [ ] ローディング状態管理

## Known Issues / 既知の問題

### Phone Number Validation

現在の実装は寛容すぎる可能性があります：

```typescript
// Current
const phoneRegex = /^[\d\s\-+()]{8,20}$/;

// Recommended for production
import { parsePhoneNumber } from 'libphonenumber-js';
export function isValidPhoneNumber(phone: string, countryCode: string): boolean {
  try {
    const phoneNumber = parsePhoneNumber(phone, countryCode);
    return phoneNumber?.isValid() ?? false;
  } catch {
    return false;
  }
}
```

### Promise Patterns

現在、一部のserviceでPromiseパターンが異なります。これは意図的な設計です：

- **`(resolve)` only**: 常にsuccessまたはerrorをresolve
- **`(resolve, reject)`: 使用していない** - 一貫性のため

## Code Review Process / コードレビュープロセス

1. **自己レビュー**
   - TypeScriptエラーゼロ
   - ESLintエラーゼロ
   - テストパス

2. **プルリクエスト**
   - 明確なタイトルと説明
   - スクリーンショット（UI変更時）
   - 関連Issue番号

3. **レビュー観点**
   - セキュリティ
   - パフォーマンス
   - コード品質
   - ドキュメント

## Questions? / 質問？

- GitHub Issues: プロジェクトの問題・提案
- Discussions: 一般的な議論
- Email: vey-team@example.com

---

**Last Updated:** 2024-12-03
**Version:** 1.0.0
