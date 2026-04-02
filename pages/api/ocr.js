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

  const token = process.env.HF_API_TOKEN;
  if (!token) {
    return res.status(500).json({ error: "HF_API_TOKEN not configured" });
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
      const data = fs.readFileSync(file.filepath);
      
      const hfRes = await fetch(
        "https://api-inference.huggingface.co/models/sbintuitions/sarashina2.2-ocr",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/octet-stream",
          },
          body: data,
        }
      );

      const text = await hfRes.text();

      if (!hfRes.ok) {
        return res.status(502).json({ error: "HF API error", detail: text });
      }

      let json;
      try {
        json = JSON.parse(text);
      } catch {
        return res.status(200).json({ result: text });
      }

      return res.status(200).json({ result: json });
    } catch (e) {
      console.error("Request error:", e);
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
