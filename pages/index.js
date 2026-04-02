import { useState, useCallback } from "react";

export default function Home() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [isDragging, setIsDragging] = useState(false);

  const showToast = (text, type = "error") => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: "", text: "" }), 4000);
  };

  const onFile = (f) => {
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setText("");
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith("image/")) onFile(f);
    else showToast("画像ファイルを選択してください", "warning");
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const upload = async () => {
    if (!file) { showToast("ファイルを選択してください", "warning"); return; }
    setLoading(true); setText("");
    const fd = new FormData();
    fd.append("file", file);

    try {
      const res = await fetch("/api/ocr", { method: "POST", body: fd });
      const j = await res.json();
      if (!res.ok) {
        showToast("エラー: " + (j.error || res.status), "error");
      } else {
        console.log("HF result:", j.result);
        if (Array.isArray(j.result) && j.result.length > 0) {
          setText(j.result[0].generated_text || j.result[0].text || JSON.stringify(j.result[0]));
        } else if (typeof j.result === "object") {
          setText(j.result.generated_text || j.result.text || JSON.stringify(j.result));
        } else {
          setText(String(j.result));
        }
      }
    } catch {
      showToast("ネットワークエラー", "error");
    } finally {
      setLoading(false);
    }
  };

  const copyText = async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      showToast("コピーしました", "success");
    } catch {
      showToast("コピーに失敗しました", "error");
    }
  };

  const downloadText = () => {
    if (!text) return;
    const blob = new Blob([text], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "ocr_result.txt";
    a.click();
  };

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Segoe+UI:wght@400;500;600&display=swap');
        
        * { 
          font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif; 
          box-sizing: border-box;
        }
        
        body {
          background: #1e1e1e;
          min-height: 100vh;
          margin: 0;
        }
        
        .main-container {
          max-width: 1100px;
          margin: 0 auto;
          padding: 60px 20px;
        }
        
        .header {
          text-align: center;
          margin-bottom: 40px;
        }
        
        .header h1 {
          color: #d4d4d4;
          font-size: 2.5rem;
          font-weight: 600;
          margin-bottom: 8px;
          font-family: 'Segoe UI', sans-serif;
        }
        
        .header p {
          color: #808080;
          font-size: 1rem;
        }
        
        .model-badge {
          color: #4ec9b0;
          font-weight: 500;
        }
        
        .card {
          background: #252526;
          border-radius: 8px;
          border: 1px solid #3c3c3c;
          overflow: hidden;
        }
        
        .card-body { 
          padding: 32px; 
          background: #252526;
        }
        
        .upload-zone {
          border: 2px dashed #3c3c3c;
          border-radius: 6px;
          padding: 40px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s;
          background: #1e1e1e;
          min-height: 200px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }
        
        .upload-zone:hover, .upload-zone.dragging {
          border-color: #0078d4;
          background: #2d2d2d;
        }
        
        .upload-icon {
          width: 48px;
          height: 48px;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .upload-icon svg {
          width: 48px;
          height: 48px;
          fill: #4ec9b0;
        }
        
        .upload-text {
          color: #d4d4d4;
          font-size: 0.95rem;
          margin-bottom: 4px;
        }
        
        .upload-hint {
          color: #808080;
          font-size: 0.8rem;
        }
        
        .preview-img {
          max-width: 100%;
          max-height: 250px;
          border-radius: 6px;
          object-fit: contain;
          margin-top: 16px;
          border: 1px solid #3c3c3c;
        }
        
        .result-section {
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        
        .result-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        
        .result-title {
          font-size: 0.9rem;
          font-weight: 600;
          color: #d4d4d4;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .action-buttons {
          display: flex;
          gap: 8px;
        }
        
        .btn-primary-custom {
          background: #0e639c;
          border: 1px solid #0e639c;
          padding: 10px 20px;
          border-radius: 4px;
          font-weight: 500;
          font-size: 0.9rem;
          color: #ffffff;
          cursor: pointer;
          transition: background 0.2s;
          width: 100%;
          margin-bottom: 16px;
        }
        
        .btn-primary-custom:hover:not(:disabled) {
          background: #1177bb;
        }
        
        .btn-primary-custom:disabled {
          background: #3c3c3c;
          border-color: #3c3c3c;
          cursor: not-allowed;
        }
        
        .btn-secondary {
          background: #3c3c3c;
          border: 1px solid #3c3c3c;
          padding: 6px 14px;
          border-radius: 4px;
          font-size: 0.85rem;
          font-weight: 500;
          color: #cccccc;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .btn-secondary:hover:not(:disabled) {
          background: #4c4c4c;
          border-color: #4c4c4c;
        }
        
        .btn-secondary:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        
        .result-text {
          flex: 1;
          background: #1e1e1e;
          border: 1px solid #3c3c3c;
          border-radius: 6px;
          padding: 16px;
          min-height: 280px;
          max-height: 380px;
          overflow-y: auto;
          white-space: pre-wrap;
          word-break: break-word;
          font-size: 0.9rem;
          font-family: 'JetBrains Mono', 'Consolas', monospace;
          line-height: 1.6;
          color: #d4d4d4;
        }
        
        .result-text::-webkit-scrollbar {
          width: 10px;
        }
        
        .result-text::-webkit-scrollbar-track {
          background: #1e1e1e;
        }
        
        .result-text::-webkit-scrollbar-thumb {
          background: #424242;
          border-radius: 5px;
        }
        
        .result-text::-webkit-scrollbar-thumb:hover {
          background: #4f4f4f;
        }
        
        .spinner {
          display: inline-block;
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin-right: 8px;
          vertical-align: middle;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .toast {
          position: fixed;
          bottom: 30px;
          left: 50%;
          transform: translateX(-50%);
          padding: 12px 24px;
          border-radius: 6px;
          font-weight: 500;
          font-size: 0.9rem;
          color: white;
          z-index: 1000;
          animation: slideUp 0.2s ease;
        }
        
        .toast.error { background: #f14c4c; border: 1px solid #ca4242; }
        .toast.success { background: #4ec9b0; color: #1e1e1e; }
        .toast.warning { background: #cca700; color: #1e1e1e; }
        
        @keyframes slideUp {
          from { opacity: 0; transform: translate(-50%, 20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        
        .file-info {
          color: #808080;
          font-size: 0.8rem;
          margin-top: 8px;
        }
        
        @media (max-width: 768px) {
          .main-container { padding: 30px 16px; }
          .card-body { padding: 20px; }
          .header h1 { font-size: 1.6rem; }
        }
      `}</style>

      <div className="main-container">
        <div className="header">
          <h1>Sarashina OCR</h1>
          <p>Hugging Face 日本語OCR | <span className="model-badge">sarashina2.2-ocr</span></p>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="row g-4">
              <div className="col-lg-5">
                <div
                  className={`upload-zone ${isDragging ? 'dragging' : ''}`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => document.getElementById('fileInput').click()}
                >
                  <input
                    id="fileInput"
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => onFile(e.target.files[0])}
                  />
                  <div className="upload-icon">
                    <svg viewBox="0 0 24 24"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/></svg>
                  </div>
                  <p className="upload-text">画像をドラッグ&ドロップ</p>
                  <p className="upload-hint">またはクリックして選択 (JPEG, PNG)</p>
                </div>
                {preview && (
                  <>
                    <img src={preview} alt="preview" className="preview-img" />
                    {file && <p className="file-info">{file.name}</p>}
                  </>
                )}
              </div>

              <div className="col-lg-7">
                <div className="result-section">
                  <div className="result-header">
                    <span className="result-title">抽出テキスト</span>
                    <div className="action-buttons">
                      <button className="btn-secondary" onClick={copyText} disabled={!text}>
                        コピー
                      </button>
                      <button className="btn-secondary" onClick={downloadText} disabled={!text}>
                        ダウンロード
                      </button>
                    </div>
                  </div>

                  <button
                    className="btn-primary-custom"
                    onClick={upload}
                    disabled={loading || !file}
                  >
                    {loading ? <><span className="spinner"></span>処理中...</> : "画像を送信してOCR実行"}
                  </button>

                  <div className="result-text">
                    {loading ? "OCR実行中..." : text || "ここに抽出結果がここに表示されます"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {msg.text && (
        <div className={`toast ${msg.type}`}>{msg.text}</div>
      )}
    </>
  );
}
