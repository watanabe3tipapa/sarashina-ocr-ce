# Sarashina OCR

Hugging Face の `sbintuitions/sarashina2.2-ocr` モデル用于日本語 OCR の Next.js アプリケーションです。

## 環境準備

```bash
npm install
```

## 開発環境での起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 にアクセスしてください。

## Vercel へのデプロイ

1. このリポジトリを GitHub にプッシュ
2. Vercel でプロジェクトをインポート
3. Environment Variables に以下を設定:
   - `HF_API_TOKEN`: Hugging Face の API トークン
4. Deploy

## 使用方法

1. 画像ファイルを選択（JPEG/PNG）
2. 「Upload & OCR」ボタンをクリック
3. 抽出されたテキストが画面に表示される
4. 「Copy」でクリップボードにコピー、「Download」でテキストファイルをダウンロード

## 環境変数

| 変数名 | 説明 |
|--------|------|
| `HF_API_TOKEN` | Hugging Face API トークン（必須） |

`.env.example` を `.env.local` にコピーして開発環境で利用してください。

## 技術スタック

- Next.js 14
- React 18
- Bootstrap 5
- Hugging Face Inference API
