import os
import json

import numpy as np
import librosa
import torch

from torch import nn
from transformers import AutoFeatureExtractor, Wav2Vec2Model


# ============================================================
# CONFIGURATION
# ============================================================

MODEL_ID = (
    "ehcalabres/"
    "wav2vec2-lg-xlsr-en-speech-emotion-recognition"
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

TRAINED_MODEL_PATH = os.path.join(
    BASE_DIR,
    "sector9_trained_model",
    "sector9_classifier.pt"
)

LABELS_PATH = os.path.join(
    BASE_DIR,
    "sector9_trained_model",
    "labels.json"
)

SAMPLE_RATE = 16000
MAX_AUDIO_SECONDS = 10


# ============================================================
# DEVICE
# ============================================================

DEVICE = torch.device(
    "cuda" if torch.cuda.is_available() else "cpu"
)


# ============================================================
# LOAD LABELS
# ============================================================

with open(
    LABELS_PATH,
    "r",
    encoding="utf-8"
) as f:

    LABELS_RAW = json.load(f)


LABELS = {
    int(k): v
    for k, v in LABELS_RAW.items()
}


# ============================================================
# LOAD FEATURE EXTRACTOR
# ============================================================

print("Loading Sector 9 feature extractor...")

feature_extractor = AutoFeatureExtractor.from_pretrained(
    MODEL_ID
)


# ============================================================
# LOAD WAV2VEC2
# ============================================================

print("Loading Wav2Vec2 encoder...")

wav2vec2 = Wav2Vec2Model.from_pretrained(
    MODEL_ID
)

wav2vec2.to(DEVICE)

wav2vec2.eval()


# Freeze encoder
for parameter in wav2vec2.parameters():
    parameter.requires_grad = False


HIDDEN_SIZE = wav2vec2.config.hidden_size


print(
    "Wav2Vec2 hidden size:",
    HIDDEN_SIZE
)


# ============================================================
# SECTOR 9 CLASSIFIER
#
# EXACT architecture used during training:
#
# 1024 -> 256 -> 5
#
# Linear
# ReLU
# Dropout
# Linear
# ============================================================

class Sector9Classifier(nn.Module):

    def __init__(
        self,
        hidden_size=1024,
        num_classes=5
    ):

        super().__init__()

        self.classifier = nn.Sequential(

            nn.Linear(
                hidden_size,
                256
            ),

            nn.ReLU(),

            nn.Dropout(
                0.30
            ),

            nn.Linear(
                256,
                num_classes
            )
        )


    def forward(self, features):

        return self.classifier(
            features
        )


# ============================================================
# LOAD TRAINED CLASSIFIER
# ============================================================

print("Loading trained Sector 9 classifier...")

classifier = Sector9Classifier(
    hidden_size=HIDDEN_SIZE,
    num_classes=5
)

state_dict = torch.load(
    TRAINED_MODEL_PATH,
    map_location=DEVICE
)

classifier.load_state_dict(
    state_dict
)

classifier.to(DEVICE)

classifier.eval()


print(
    "Trained classifier loaded."
)

print(
    "Classifier: "
    f"{HIDDEN_SIZE} -> 256 -> 5"
)

print(
    "Sector 9 labels:",
    LABELS
)


# ============================================================
# AUDIO LOADING
# ============================================================

def load_audio(audio_path):

    if not os.path.isfile(audio_path):

        raise FileNotFoundError(
            f"Audio file not found: {audio_path}"
        )


    audio, sr = librosa.load(
        audio_path,
        sr=SAMPLE_RATE,
        mono=True
    )


    if len(audio) == 0:

        raise ValueError(
            f"Empty audio file: {audio_path}"
        )


    max_samples = int(
        SAMPLE_RATE *
        MAX_AUDIO_SECONDS
    )


    if len(audio) > max_samples:

        audio = audio[
            :max_samples
        ]


    # EXACT SAME NORMALIZATION
    # USED DURING TRAINING

    peak = np.max(
        np.abs(audio)
    )


    if peak > 0:

        audio = audio / peak


    return audio.astype(
        np.float32
    )


# ============================================================
# EXTRACT SECTOR 9 FEATURES
#
# MUST MATCH TRAINING CODE EXACTLY
# ============================================================

def extract_features(audio):

    inputs = feature_extractor(
        audio,
        sampling_rate=SAMPLE_RATE,
        return_tensors="pt",
        padding=True
    )


    input_values = (
        inputs.input_values
        .to(DEVICE)
    )


    # Feature extractor may provide an
    # attention mask.

    attention_mask = getattr(
        inputs,
        "attention_mask",
        None
    )


    if attention_mask is not None:

        attention_mask = (
            attention_mask.to(DEVICE)
        )


    with torch.no_grad():

        outputs = wav2vec2(
            input_values=input_values,
            attention_mask=attention_mask
        )


        hidden_states = (
            outputs.last_hidden_state
        )


        # EXACT SAME MEAN POOLING
        # USED DURING TRAINING

        features = hidden_states.mean(
            dim=1
        )


    return features


# ============================================================
# SECTOR 9 CLASSIFICATION
# ============================================================

def classify_sector9(audio_path):

    audio = load_audio(
        audio_path
    )


    features = extract_features(
        audio
    )


    with torch.no_grad():

        logits = classifier(
            features
        )


        probabilities = torch.softmax(
            logits,
            dim=1
        )[0]


    predicted_id = int(
        torch.argmax(
            probabilities
        ).item()
    )


    predictions = []


    for class_id in range(5):

        predictions.append(
            {
                "label": LABELS[class_id],
                "score": float(
                    probabilities[class_id]
                    .item()
                )
            }
        )


    predictions.sort(
        key=lambda x: x["score"],
        reverse=True
    )


    return predictions


# ============================================================
# SECTOR 9 LEVEL INFORMATION
# ============================================================

def level_information(level_id):

    if level_id == 0:

        return {
            "sector9_level": 1,
            "state": "CALM",
            "intervention": (
                "Continue driving normally."
            )
        }


    elif level_id == 1:

        return {
            "sector9_level": 2,
            "state": "FOCUSED",
            "intervention": (
                "Maintain attention and "
                "continue driving normally."
            )
        }


    elif level_id == 2:

        return {
            "sector9_level": 3,
            "state": "STRESSED",
            "intervention": (
                "Reduce distractions and "
                "remain attentive."
            )
        }


    elif level_id == 3:

        return {
            "sector9_level": 4,
            "state": "ANGRY",
            "intervention": (
                "Encourage calm driving and "
                "avoid aggressive responses."
            )
        }


    else:

        return {
            "sector9_level": 5,
            "state": "HIGH RISK",
            "intervention": (
                "Recommend stopping safely "
                "and taking a break."
            )
        }


# ============================================================
# MAIN SECTOR 9 ANALYSIS
# ============================================================

def analyze_sector9(audio_path):

    predictions = classify_sector9(
        audio_path
    )


    top_prediction = predictions[0]


    predicted_label = (
        top_prediction["label"]
    )


    # Convert:
    #
    # level1_calm
    # level2_focused
    # ...
    #
    # into class ID.

    predicted_id = None


    for class_id, label in LABELS.items():

        if label == predicted_label:

            predicted_id = class_id

            break


    if predicted_id is None:

        raise RuntimeError(
            "Predicted label does not "
            "match labels.json"
        )


    info = level_information(
        predicted_id
    )


    # Convert probabilities into
    # convenient emotion-style scores.

    scores = {
        prediction["label"]: round(
            prediction["score"],
            4
        )
        for prediction in predictions
    }


    result = {

        "sector9_level":
            info["sector9_level"],

        "state":
            info["state"],

        "confidence":
            round(
                top_prediction["score"],
                3
            ),

        "top_prediction":
            predicted_label,

        "intervention":
            info["intervention"],

        "sector9_probabilities":
            scores,

        "raw_predictions":
            predictions
    }


    return result


# ============================================================
# TEST
# ============================================================

if __name__ == "__main__":

    print()
    print("=" * 70)
    print("SECTOR 9 ENGINE")
    print("=" * 70)

    print(
        "Device:",
        DEVICE
    )

    print(
        "Model:",
        MODEL_ID
    )

    print(
        "Trained classifier:",
        TRAINED_MODEL_PATH
    )

    print(
        "Labels:",
        LABELS
    )

    print("=" * 70)

    print(
        "ENGINE READY"
    )