import joblib
from pathlib import Path

from sklearn.ensemble import RandomForestClassifier


MODEL_FILE = Path(
    "data/models/stress_model.joblib"
)


def train_stress_model(features, labels):
    """
    Train a basic stress classification model.

    features:
        List of feature dictionaries.

    labels:
        Stress level for each sample.
    """

    if not features:
        raise ValueError(
            "No training features supplied."
        )

    if len(features) != len(labels):
        raise ValueError(
            "Features and labels must have "
            "the same length."
        )

    feature_names = [
        "average_pitch",
        "pitch_variation",
        "average_energy",
        "energy_variation",
        "pause_duration",
        "speech_rate"
    ]

    X = [
        [
            sample.get(name, 0.0)
            for name in feature_names
        ]
        for sample in features
    ]

    model = RandomForestClassifier(
        n_estimators=100,
        random_state=42
    )

    model.fit(X, labels)

    MODEL_FILE.parent.mkdir(
        parents=True,
        exist_ok=True
    )

    joblib.dump(
        {
            "model": model,
            "feature_names": feature_names
        },
        MODEL_FILE
    )

    return model


def load_stress_model():
    """
    Load the trained stress model.
    """

    if not MODEL_FILE.exists():
        raise FileNotFoundError(
            "Stress model has not been trained yet."
        )

    return joblib.load(MODEL_FILE)


def predict_stress(features):
    """
    Predict the stress level for a single
    feature sample.
    """

    data = load_stress_model()

    model = data["model"]
    feature_names = data["feature_names"]

    values = [
        features.get(name, 0.0)
        for name in feature_names
    ]

    prediction = model.predict(
        [values]
    )[0]

    return prediction


if __name__ == "__main__":

    print("Silent Co-Driver Stress Model")
    print("Training module ready.")