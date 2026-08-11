import json
from pathlib import Path

import numpy as np

BASELINE_FILE = Path("data/baseline/driver_baseline.json")


def build_baseline(feature_list):
    """
    Build a personal baseline from several calm recordings.
    """

    if not feature_list:
        raise ValueError("No feature samples supplied.")

    keys = [
        "average_pitch",
        "pitch_variation",
        "average_energy",
        "energy_variation",
        "pause_duration",
        "speech_rate"
    ]

    baseline = {}

    for key in keys:

        values = [
            sample[key]
            for sample in feature_list
            if key in sample
        ]

        if values:

            baseline[key] = {
                "mean": float(np.mean(values)),
                "std": float(np.std(values))
            }

    BASELINE_FILE.parent.mkdir(
        parents=True,
        exist_ok=True
    )

    with open(BASELINE_FILE, "w") as f:
        json.dump(
            baseline,
            f,
            indent=4
        )

    return baseline


if __name__ == "__main__":

    print("Baseline builder ready.")

    print(
        "Collect multiple Level 0 recordings "
        "before building the final baseline."
    )
    