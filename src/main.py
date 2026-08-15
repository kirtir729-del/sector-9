from pathlib import Path

from flask import Flask, jsonify, request

from feature_pipeline import run_feature_pipeline
from baseline_manager import baseline_exists, load_baseline
from risk_engine import analyze_driver_state
from outlier_detector import detect_outliers
from trend_detector import TrendDetector
from alert_manager import generate_alert


app = Flask(__name__)

trend_detector = TrendDetector(3)

UPLOAD_DIR = Path("data/uploads")
UPLOAD_DIR.mkdir(
    parents=True,
    exist_ok=True
)


@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "service": "Silent Co-Driver"
    })


@app.route("/audio/analyze", methods=["POST"])
def analyze_audio():

    if "audio" not in request.files:
        return jsonify({
            "error": "No audio file supplied."
        }), 400

    audio_file = request.files["audio"]

    if not audio_file.filename:
        return jsonify({
            "error": "No filename supplied."
        }), 400

    audio_path = UPLOAD_DIR / audio_file.filename

    audio_file.save(audio_path)

    try:

        # Audio → Feature Extraction
        features = run_feature_pipeline(
            audio_path
        )

        # Check personal baseline
        if not baseline_exists():

            return jsonify({
                "status": "baseline_required",
                "message": (
                    "Personal baseline has not been "
                    "created yet."
                ),
                "features": features
            })

        # Load personal baseline
        baseline = load_baseline()

        # Features → Risk Engine → Driver State
        driver_state = analyze_driver_state(
            current_features=features,
            baseline=baseline
        )

        # Driver State → Issue Detection
        deviations = driver_state["deviations"]

        outliers = detect_outliers(
            deviations
        )

        # Track risk trend
        trend_detector.add_level(
            driver_state["level"]
        )

        trend = trend_detector.get_trend()

        # Issue Detection → Alert Manager
        alert = generate_alert(
            driver_state,
            outliers,
            trend
        )

        # Final JSON response
        return jsonify({
            "status": "success",
            "features": features,
            "driver_state": driver_state,
            "issues": {
                "outliers": outliers,
                "trend": trend
            },
            "alert": alert
        })

    except Exception as error:

        return jsonify({
            "status": "error",
            "message": str(error)
        }), 500

    finally:

        if audio_path.exists():
            audio_path.unlink()


if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=5001,
        debug=True
    )