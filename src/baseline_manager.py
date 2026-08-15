import json
from pathlib import Path


BASELINE_FILE = Path(
    "data/baseline/driver_baseline.json"
)


def baseline_exists():
    """
    Check whether a personal baseline exists.
    """

    return BASELINE_FILE.exists()


def load_baseline():
    """
    Load the driver's personal baseline.
    """

    if not BASELINE_FILE.exists():
        raise FileNotFoundError(
            "Driver baseline not found. "
            "Build a baseline first."
        )

    with open(BASELINE_FILE, "r") as f:
        return json.load(f)


def save_baseline(baseline):
    """
    Save a personal baseline.
    """

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


if __name__ == "__main__":

    print("Silent Co-Driver Baseline Manager")

    if baseline_exists():
        print("Driver baseline found.")
    else:
        print("No driver baseline found yet.")