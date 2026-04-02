# Sarashina OCR

日本語OCRアプリケーション。Hugging Faceの`sbintuitions/sarashina2.2-ocr`モデルを使用したローカル推論です。

## 機能

- ドラッグ&ドロップまたはクリックで画像を選択（JPEG/PNG対応）
- ローカル推論による日本語テキスト抽出（GPU対応）
- 抽出結果のコピー・ダウンロード
- ダークテーマのモダンなUI

## 必要環境

- Python 3.9+
- Node.js 18+
- GPU（推奨、CPUでも動作可能）

## クイックスタート

```bash
# 1. 依存関係のインストール
npm install

# 2. Python環境のセットアップ
cd backend
pip install -r requirements.txt

# 3. Pythonサーバー起動（別のターミナルで）
python main.py

# 4. Next.js開発サーバー起動
npm run dev
```

http://localhost:3000 にアクセスしてください。

## 技術スタック

- Next.js 16
- React 18
- Bootstrap 5
- FastAPI
- Transformers (Hugging Face)
