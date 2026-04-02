# Sarashina OCR

日本語OCRアプリケーション。Hugging Faceの`sbintuitions/sarashina2.2-ocr`モデルを使用しています。

## 機能

- ドラッグ&ドロップまたはクリックで画像を選択（JPEG/PNG対応）
- Hugging Face APIを使用した日本語テキスト抽出
- 抽出結果のコピー・ダウンロード
- ダークテーマのモダンなUI

## クイックスタート

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

http://localhost:3000 にアクセスしてください。

## 環境変数

`.env.example`を`.env.local`にコピーし、Hugging Face APIトークンを設定します：

```
HF_API_TOKEN=your_hf_token_here
```

## デプロイ

[Vercel](https://vercel.com)へのデプロイを推奨します：

1. リポジトリをGitHubにプッシュ
2. Vercelでプロジェクトをインポート
3. `HF_API_TOKEN`環境変数を設定
4. Deploy

## 技術スタック

- Next.js 16
- React 18
- Bootstrap 5
- Hugging Face Inference API
