import json
from pathlib import Path


CONFIG_PATH = Path("config/risk_config.json")


def load_config():

    with open(CONFIG_PATH, "r") as f:
        return json.load(f)


def calculate_deviation(current, baseline):

    deviations = {}

    for key in baseline:

        if key not in current:
            continue

        mean = baseline[key]["mean"]
        std = baseline[key]["std"]

        # Prevent division by zero.
        std = max(std, abs(mean) * 0.05, 1e-6)

        z_score = abs(
            current[key] - mean
        ) / std

        deviations[key] = z_score

    return deviations


def calculate_risk_score(deviations):

    if not deviations:
        return 0.0

    weights = {
        "average_pitch": 1.0,
        "pitch_variation": 1.0,
        "average_energy": 0.8,
        "energy_variation": 0.8,
        "pause_duration": 1.0,
        "speech_rate": 1.0
    }

    total = 0
    weight_total = 0

    for feature, deviation in deviations.items():

        weight = weights.get(feature, 1.0)

        total += min(deviation, 5) * weight
        weight_total += weight

    normalized = total / weight_total

    score = normalized / 5 * 100

    return max(0, min(100, score))


def score_to_level(score, config):

    thresholds = config["thresholds"]

    if score >= thresholds["level_5"]:
        return 5

    if score >= thresholds["level_4"]:
        return 4

    if score >= thresholds["level_3"]:
        return 3

    if score >= thresholds["level_2"]:
        return 2

    if score >= thresholds["level_1"]:
        return 1

    return 0


def calculate_confidence(
    audio_quality_score,
    feature_count
):

    feature_factor = min(
        feature_count / 6,
        1.0
    )

    confidence = (
        0.7 * audio_quality_score +
        0.3 * (feature_factor * 100)
    )

    return round(
        max(0, min(100, confidence)),
        2
    )


def analyze_driver_state(
    current_features,
    baseline,
    audio_quality_score=100
):

    config = load_config()

    deviations = calculate_deviation(
        current_features,
        baseline
    )

    risk_score = calculate_risk_score(
        deviations
    )

    level = score_to_level(
        risk_score,
        config
    )

    confidence = calculate_confidence(
        audio_quality_score,
        len(deviations)
    )

    level_info = config["levels"][str(level)]

    return {
        "level": level,
        "state": level_info["name"],
        "description": level_info["description"],
        "risk_score": round(risk_score, 2),
        "confidence": confidence,
        "deviations": deviations,
        "alert": level >= config["alert_level"]
    }


if __name__ == "__main__":

    print("Silent Co-Driver Risk Engine")
    print("==============================")
    print("Level 0–5 state engine loaded.")