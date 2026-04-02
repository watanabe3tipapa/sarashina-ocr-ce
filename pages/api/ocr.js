import formidable from "formidable";
import fs from "fs";
import fetch from "node-fetch";

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const form = new formidable.IncomingForm();
  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: "parse error" });
    const file = files?.file;
    if (!file) return res.status(400).json({ error: "no file" });

    try {
      const data = fs.readFileSync(file.filepath);
      const hfRes = await fetch("https://api-inference.huggingface.co/models/sbintuitions/sarashina2.2-ocr", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_API_TOKEN}`,
          "Content-Type": "application/octet-stream"
        },
        body: data
      });

      if (!hfRes.ok) {
        const text = await hfRes.text();
        return res.status(502).json({ error: "hf_error", detail: text });
      }

      const json = await hfRes.json();
      return res.status(200).json({ result: json });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  });
}
