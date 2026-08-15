from fastapi import FastAPI, UploadFile, File
import tempfile
import os

from sector9_ai import analyze_sector9

app = FastAPI(
    title="Sector 9 AI",
    description="Driver-state perception and intervention prototype",
    version="0.1"
)


@app.get("/")
def root():
    return {
        "system": "Sector 9 AI",
        "status": "online"
    }


@app.post("/analyze")
async def analyze_voice(file: UploadFile = File(...)):

    suffix = os.path.splitext(file.filename)[1] or ".wav"

    with tempfile.NamedTemporaryFile(
        delete=False,
        suffix=suffix
    ) as temp:

        contents = await file.read()
        temp.write(contents)
        temp_path = temp.name

    try:
        result = analyze_sector9(temp_path)
        return result

    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)