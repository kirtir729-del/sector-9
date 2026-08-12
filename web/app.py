from flask import Flask, render_template, request, jsonify
from pathlib import Path
import uuid

app = Flask(__name__)

UPLOAD_FOLDER = Path("web/uploads")
UPLOAD_FOLDER.mkdir(parents=True, exist_ok=True)

ALLOWED_EXTENSIONS = {
    ".wav",
    ".ogg",
    ".mp3",
    ".m4a"
}


@app.route("/")
def dashboard():
    return render_template("dashboard.html")


@app.route("/analyze", methods=["POST"])
def analyze():

    if "audio" not in request.files:
        return jsonify({
            "success": False,
            "error": "No audio file uploaded."
        }), 400

    audio = request.files["audio"]

    if not audio.filename:
        return jsonify({
            "success": False,
            "error": "No filename provided."
        }), 400

    extension = Path(audio.filename).suffix.lower()

    if extension not in ALLOWED_EXTENSIONS:
        return jsonify({
            "success": False,
            "error": "Unsupported audio format."
        }), 400

    filename = f"{uuid.uuid4().hex}{extension}"

    save_path = UPLOAD_FOLDER / filename

    audio.save(save_path)

    return jsonify({
        "success": True,
        "message": "Audio uploaded successfully.",
        "filename": filename
    })


if __name__ == "__main__":
    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )