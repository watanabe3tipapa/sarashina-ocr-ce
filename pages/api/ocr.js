import formidable from "formidable";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false,
    responseLimit: "10mb",
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const form = formidable({
    maxFileSize: 10 * 1024 * 1024,
    keepExtensions: true,
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Form parse error:", err);
      return res.status(500).json({ error: "Parse error: " + err.message });
    }

    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    if (!file) {
      return res.status(400).json({ error: "No file provided" });
    }

    try {
      const formData = new FormData();
      const stream = fs.createReadStream(file.filepath);
      const buffer = await streamToBuffer(stream);
      
      formData.append("image", new Blob([buffer]));

      const localRes = await fetch("http://localhost:8000/ocr", {
        method: "POST",
        body: formData,
      });

      if (!localRes.ok) {
        const errorText = await localRes.text();
        return res.status(502).json({ error: "Local OCR error", detail: errorText });
      }

      const result = await localRes.json();
      return res.status(200).json({ result });
    } catch (e) {
      console.error("OCR error:", e);
      return res.status(500).json({ error: e.message });
    } finally {
      if (file?.filepath) {
        try {
          fs.unlinkSync(file.filepath);
        } catch {}
      }
    }
  });
}

function streamToBuffer(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", chunk => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
  });
}
