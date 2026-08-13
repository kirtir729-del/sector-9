from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import math
import random
import wave
import io
import time

app = Flask(__name__)

CORS(app)


# =========================================================
# DRIVER DATABASE
# =========================================================

DRIVERS = {
    "driver_1": {
        "number": "01",
        "name": "TEST DRIVER",
        "short": "VER",
        "team": "SILENT RACING",
        "car": "SC-01"
    },

    "driver_2": {
        "number": "44",
        "name": "TEST DRIVER 44",
        "short": "HAM",
        "team": "SILENT RACING",
        "car": "SC-44"
    },

    "driver_3": {
        "number": "16",
        "name": "TEST DRIVER 16",
        "short": "LEC",
        "team": "SILENT RACING",
        "car": "SC-16"
    }
}


# =========================================================
# HEALTH CHECK
# =========================================================

@app.get("/api/health")
def health():

    return jsonify({
        "status": "online",
        "service": "Silent Co-Driver",
        "version": "1.0.0"
    })


# =========================================================
# DRIVER PROFILE
# =========================================================

@app.get("/api/drivers")
def get_drivers():

    return jsonify({
        "drivers": list(DRIVERS.values())
    })


@app.get("/api/drivers/<driver_id>")
def get_driver(driver_id):

    driver = DRIVERS.get(driver_id)

    if not driver:
        return jsonify({
            "error": "Driver not found"
        }), 404

    return jsonify(driver)


# =========================================================
# LIVE AUDIO ANALYSIS
# =========================================================

@app.post("/api/audio/live")
def live_audio():

    data = request.get_json(silent=True) or {}

    level = float(
        data.get("level", 0)
    )

    # Prototype driver-state calculation.
    # Replace this with trained model inference later.

    stress = min(
        100,
        max(
            0,
            int(
                25 +
                level * 0.65 +
                random.uniform(-5, 5)
            )
        )
    )

    fatigue = min(
        100,
        max(
            0,
            int(stress * 0.65)
        )
    )

    instability = min(
        100,
        max(
            0,
            int(stress * 0.85)
        )
    )

    cognitive_load = min(
        100,
        max(
            0,
            int(
                stress * 0.75
            )
        )
    )

    risk = min(
        100,
        max(
            0,
            int(
                (
                    stress +
                    fatigue +
                    instability +
                    cognitive_load
                ) / 4
            )
        )
    )

    return jsonify({

        "mode": "live",

        "timestamp": time.time(),

        "stress": stress,

        "fatigue": fatigue,

        "voice_instability": instability,

        "cognitive_load": cognitive_load,

        "performance_risk": risk,

        "signal_quality":
            max(
                0,
                min(
                    100,
                    int(100 - level * 0.15)
                )
            )

    })


# =========================================================
# DEMO AUDIO ANALYSIS
# =========================================================

@app.post("/api/audio/demo")
def demo_audio():

    if "audio" not in request.files:

        return jsonify({
            "error": "No audio file uploaded"
        }), 400


    audio = request.files["audio"]

    filename = audio.filename or "audio"

    file_bytes = audio.read()

    if not file_bytes:

        return jsonify({
            "error": "Empty audio file"
        }), 400


    # -----------------------------------------------------
    # Basic audio information
    # -----------------------------------------------------

    duration = 0

    sample_rate = 0

    channels = 0

    try:

        wav = wave.open(
            io.BytesIO(file_bytes),
            "rb"
        )

        frames = wav.getnframes()

        sample_rate = wav.getframerate()

        channels = wav.getnchannels()

        if sample_rate > 0:

            duration = frames / sample_rate

        wav.close()

    except Exception:

        # MP3 or unsupported format.
        # Browser-side metadata can still be used.
        duration = 0


    # -----------------------------------------------------
    # Prototype inference
    # -----------------------------------------------------

    stress = random.randint(40, 80)

    fatigue = random.randint(25, 65)

    instability = random.randint(30, 75)

    cognitive_load = random.randint(35, 70)

    risk = int(
        (
            stress +
            fatigue +
            instability +
            cognitive_load
        ) / 4
    )


    if stress < 35:

        label = "CALM"

    elif stress < 65:

        label = "MODERATE"

    else:

        label = "HIGH STRESS"


    return jsonify({

        "success": True,

        "mode": "demo",

        "filename": filename,

        "duration": round(
            duration,
            2
        ),

        "sample_rate":
            sample_rate,

        "channels":
            channels,

        "stress":
            stress,

        "fatigue":
            fatigue,

        "voice_instability":
            instability,

        "cognitive_load":
            cognitive_load,

        "performance_risk":
            risk,

        "label":
            label,

        "signal_quality":
            random.randint(
                88,
                98
            ),

        "issue":
            "Driver radio stress signal detected",

        "recommendation":
            "Monitor driver workload and correlate with current race conditions."

    })


# =========================================================
# RANKING
# =========================================================

@app.get("/api/ranking")
def ranking():

    return jsonify({

        "ranking": [

            {
                "position": 1,
                "driver": "VER",
                "number": "01",
                "stress": 78,
                "status": "HIGH"
            },

            {
                "position": 2,
                "driver": "HAM",
                "number": "44",
                "stress": 56,
                "status": "MODERATE"
            },

            {
                "position": 3,
                "driver": "LEC",
                "number": "16",
                "stress": 34,
                "status": "STABLE"
            }

        ]

    })


# =========================================================
# DEBRIEF
# =========================================================

@app.post("/api/debrief")
def debrief():

    return jsonify({

        "summary":
            "Driver radio analysis indicates moderate workload with elevated vocal stress.",

        "key_finding":
            "Stress increased during the analysed radio segment.",

        "recommendation":
            "Continue monitoring driver workload and compare against lap pace and race conditions."

    })


# =========================================================
# LOCAL DEVELOPMENT
# =========================================================

if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )