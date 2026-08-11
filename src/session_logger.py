import csv
from pathlib import Path
from datetime import datetime


SESSION_FILE = Path(
    "data/sessions/driver_sessions.csv"
)


FIELDS = [
    "timestamp",
    "audio_file",
    "level",
    "state",
    "risk_score",
    "confidence",
    "audio_quality",
    "trend",
    "alert"
]


def log_session(result):

    SESSION_FILE.parent.mkdir(
        parents=True,
        exist_ok=True
    )

    file_exists = SESSION_FILE.exists()

    with open(
        SESSION_FILE,
        "a",
        newline=""
    ) as f:

        writer = csv.DictWriter(
            f,
            fieldnames=FIELDS
        )

        if not file_exists:
            writer.writeheader()

        row = {
            "timestamp": datetime.now().isoformat(),
            **result
        }

        writer.writerow(row)


if __name__ == "__main__":

    print("Session logger ready.")