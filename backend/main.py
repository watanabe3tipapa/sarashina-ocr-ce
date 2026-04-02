from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import torch
from transformers import AutoProcessor, AutoModelForVision2Seq
from PIL import Image
import io

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_NAME = "sbintuitions/sarashina2.2-ocr"
processor = None
model = None

def load_model():
    global processor, model
    if processor is None:
        print(f"Loading model: {MODEL_NAME}")
        processor = AutoProcessor.from_pretrained(MODEL_NAME)
        model = AutoModelForVision2Seq.from_pretrained(
            MODEL_NAME,
            torch_dtype=torch.float16,
            device_map="auto"
        )
        print("Model loaded successfully!")

@app.on_event("startup")
async def startup_event():
    load_model()

@app.post("/ocr")
async def ocr(image: UploadFile = File(...)):
    contents = await image.read()
    img = Image.open(io.BytesIO(contents)).convert("RGB")
    
    inputs = processor(text="", images=img, return_tensors="pt").to("cuda" if torch.cuda.is_available() else "cpu")
    
    with torch.no_grad():
        generated_ids = model.generate(
            **inputs,
            max_new_tokens=1024,
            do_sample=False
        )
    
    generated_text = processor.batch_decode(generated_ids, skip_special_tokens=True)[0]
    
    return {"text": generated_text}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
