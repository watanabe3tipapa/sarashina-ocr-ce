# Sarashina OCR - Usage

## 環境準備

```bash
npm install
cd backend
pip install -r requirements.txt
```

## 起動方法

### 1. Pythonサーバー（バックエンド）

```bash
cd backend
python main.py
```

初回起動時にモデルがダウンロードされます。数GBの容量と数分かかる場合があります。

### 2. Next.js開発サーバー

```bash
npm run dev
```

ブラウザで http://localhost:3000 にアクセスしてください。

## 使用方法

1. 画像ファイルを選択（JPEG/PNG対応）
2. 「画像を送信してOCR実行」ボタンをクリック
3. 抽出されたテキストが画面に表示される
4. 「コピー」でクリップボードにコピー、「ダウンロード」でテキストファイルをダウンロード

## GPUについて

GPUがある場合は自動的にGPUを使用して高速に処理します。CPU onlyの環境でも動作しますが、处理時間が長くなります。

推奨VRAM: 4GB以上
