import formidable from "formidable";
import fs from "fs";

export const config = { 
  api: { 
    bodyParser: false, 
    responseLimit: "10mb",
    externalResolver: true
  },
  maxDuration: 60
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const token = process.env.HF_API_TOKEN;
  if (!token) {
    console.error("HF_API_TOKEN is not set");
    return res.status(500).json({ error: "HF_API_TOKEN not configured" });
  }

  const form = new formidable.IncomingForm();
  
  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Form parse error:", err);
      return res.status(500).json({ error: "parse error: " + err.message });
    }
    
    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    if (!file) return res.status(400).json({ error: "no file" });

    try {
      const data = fs.readFileSync(file.filepath);
      console.log("Sending request to HuggingFace API...");
      
      const hfRes = await fetch(
        "https://api-inference.huggingface.co/models/sbintuitions/sarashina2.2-ocr",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/octet-stream"
          },
          body: data
        }
      );

      console.log("HF API response status:", hfRes.status);
      const text = await hfRes.text();
      console.log("HF API response:", text.substring(0, 500));
      
      if (!hfRes.ok) {
        return res.status(502).json({ error: "hf_error", detail: text });
      }

      let json;
      try {
        json = JSON.parse(text);
      } catch {
        return res.status(200).json({ result: text });
      }

      return res.status(200).json({ result: json });
    } catch (e) {
      console.error("Fetch error:", e);
      return res.status(500).json({ error: e.message });
    } finally {
      if (file?.filepath && fs.existsSync(file.filepath)) {
        try {
          fs.unlinkSync(file.filepath);
        } catch {}
      }
    }
  });
}
