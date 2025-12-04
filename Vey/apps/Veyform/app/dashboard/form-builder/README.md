# Form Builder / 開発画面

## Overview / 概要

The Form Builder is a development screen that allows you to:
- Select languages and preview address forms
- Choose default country and additional countries
- View live preview of sign-up and sign-in forms
- Generate integration code

開発画面では以下ができます：
- 言語を選んで住所フォームをプレビュー
- デフォルトの国や他に含める国を選択
- サインアップとサインインフォームのライブプレビュー
- 統合コードの生成

## Features / 機能

### Language Selection / 言語選択
- Countries with multiple languages show language tabs
- All countries except English-only ones have language options
- Address form labels and placeholders update based on selected language

英語だけの国以外は全ての国が言語タブがあります。
選択した言語に基づいて、住所フォームのラベルとプレースホルダーが更新されます。

### Form Types / フォームタイプ

#### Sign Up / サインアップ
- Email and password fields
- Address form below with organized fields
- Country dropdown (only shown when multiple countries selected)
- Labels and placeholders in selected language

sign upはnew member下にメールとパスワード設定の下に住所フォームがあります。
プルダウンで国を選べます（複数の国が選択されている場合のみ）。
デフォルトの国だけの設定はプルダウン用意しません。

#### Sign In / サインイン
- Social login button at top for quick address registration
- Email and password input fields
- Forgot password link

sign inはボタンを押すとソーシャルログインで住所すぐ登録できます。
その下にメールパスワード入力とパスワード忘れがあります。

## Usage / 使い方

1. Navigate to `/dashboard/form-builder` in the Veyform dashboard
2. Select your default country
3. Optionally select additional countries
4. Choose a language (if multiple available)
5. Switch between Sign Up and Sign In form types
6. View the live preview
7. Copy the generated code

1. Veyformダッシュボードで `/dashboard/form-builder` に移動
2. デフォルトの国を選択
3. 必要に応じて追加の国を選択
4. 言語を選択（複数ある場合）
5. サインアップとサインインのフォームタイプを切り替え
6. ライブプレビューを確認
7. 生成されたコードをコピー

## Technical Details / 技術詳細

### Data Source
The form builder uses `countries-index.json` generated from the world-address data.

### Generation Script
Run `npm run generate-countries` to regenerate the countries index from the latest data.

### Language Detection
- Countries with only English language: No language tabs shown
- Countries with multiple languages: Language tabs displayed
- Field labels automatically use the selected language's `field_labels` from the country data

## Examples / 例

### Japan (Multiple Languages)
- Japanese and English tabs available
- Japanese labels: 郵便番号, 都道府県, 市町村, etc.
- English labels: Postal Code, Prefecture, City, etc.

### United States (English Only)
- No language tabs
- English labels only
- State dropdown instead of prefecture

## File Structure / ファイル構造

```
Vey/apps/Veyform/
├── app/dashboard/form-builder/
│   └── page.tsx              # Main form builder page
├── scripts/
│   └── generate-countries-index.js  # Countries data generator
└── public/
    └── countries-index.json  # Generated countries data
```
