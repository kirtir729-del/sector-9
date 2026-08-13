from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)


@app.get("/api/health")
def health():
    return jsonify({
        "status": "online",
        "service": "Silent Co-Driver",
        "version": "1.0.0"
    })


@app.get("/api/drivers")
def drivers():
    return jsonify({
        "drivers": []
    })


@app.get("/api/ranking")
def ranking():
    return jsonify({
        "ranking": []
    })


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)