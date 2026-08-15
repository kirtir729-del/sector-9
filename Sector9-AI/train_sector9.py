import os
import json
import random

import numpy as np
import torch
import librosa

from torch import nn
from torch.utils.data import Dataset, DataLoader

from transformers import (
    AutoFeatureExtractor,
    Wav2Vec2Model,
)


# ============================================================
# CONFIGURATION
# ============================================================

MODEL_ID = (
    "ehcalabres/"
    "wav2vec2-lg-xlsr-en-speech-emotion-recognition"
)

DATASET_DIR = "voice_samples"

OUTPUT_DIR = "sector9_trained_model"

SAMPLE_RATE = 16000

MAX_AUDIO_SECONDS = 10

BATCH_SIZE = 2

EPOCHS = 20

LEARNING_RATE = 1e-4

VALIDATION_PER_CLASS = 1

SEED = 42


# ============================================================
# REPRODUCIBILITY
# ============================================================

random.seed(SEED)

np.random.seed(SEED)

torch.manual_seed(SEED)


# ============================================================
# DEVICE
# ============================================================

DEVICE = torch.device(
    "cuda"
    if torch.cuda.is_available()
    else "cpu"
)

print()
print("=" * 70)
print("SECTOR 9 TRAINING")
print("=" * 70)

print("Device:", DEVICE)


# ============================================================
# SECTOR 9 LABELS
# ============================================================

LABELS = {
    0: "level1_calm",
    1: "level2_focused",
    2: "level3_stressed",
    3: "level4_angry",
    4: "level5_highrisk",
}

LABEL_TO_ID = {
    value: key
    for key, value in LABELS.items()
}


# ============================================================
# LOAD FEATURE EXTRACTOR
# ============================================================

print()
print("Loading feature extractor...")

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


# ============================================================
# FREEZE ENCODER
#
# With only 25 samples, we do NOT fine-tune the whole
# 24-layer Wav2Vec2 model.
# ============================================================

for parameter in wav2vec2.parameters():
    parameter.requires_grad = False


print("Wav2Vec2 encoder frozen.")

print(
    "Hidden size:",
    wav2vec2.config.hidden_size
)


# ============================================================
# DATASET DISCOVERY
# ============================================================

def find_files():

    samples = []

    for label_id, folder_name in LABELS.items():

        folder = os.path.join(
            DATASET_DIR,
            folder_name
        )

        if not os.path.isdir(folder):

            raise FileNotFoundError(
                f"Missing dataset folder: {folder}"
            )

        files = [
            os.path.join(folder, f)
            for f in os.listdir(folder)
            if f.lower().endswith(".wav")
        ]

        files.sort()

        print(
            f"{folder_name}: {len(files)} samples"
        )

        if len(files) < 2:

            raise RuntimeError(
                f"Need at least 2 WAV files in {folder}"
            )

        for file_path in files:

            samples.append(
                (
                    file_path,
                    label_id
                )
            )

    return samples


all_samples = find_files()


print()
print("TOTAL SAMPLES:", len(all_samples))


# ============================================================
# STRATIFIED TRAIN / VALIDATION SPLIT
#
# One sample per class goes to validation.
# Remaining samples go to training.
# ============================================================

train_samples = []

validation_samples = []


for label_id in LABELS:

    class_samples = [
        item
        for item in all_samples
        if item[1] == label_id
    ]

    random.shuffle(class_samples)

    validation = class_samples[
        :VALIDATION_PER_CLASS
    ]

    training = class_samples[
        VALIDATION_PER_CLASS:
    ]

    validation_samples.extend(
        validation
    )

    train_samples.extend(
        training
    )


random.shuffle(train_samples)

random.shuffle(validation_samples)


print()
print(
    "TRAINING SAMPLES:",
    len(train_samples)
)

print(
    "VALIDATION SAMPLES:",
    len(validation_samples)
)


# ============================================================
# AUDIO LOADING
# ============================================================

def load_audio(path):

    audio, sr = librosa.load(
        path,
        sr=SAMPLE_RATE,
        mono=True
    )

    if len(audio) == 0:

        raise ValueError(
            f"Empty audio file: {path}"
        )

    max_samples = int(
        SAMPLE_RATE *
        MAX_AUDIO_SECONDS
    )

    if len(audio) > max_samples:

        audio = audio[
            :max_samples
        ]

    # Normalize
    peak = np.max(
        np.abs(audio)
    )

    if peak > 0:

        audio = audio / peak

    return audio.astype(
        np.float32
    )


# ============================================================
# DATASET
# ============================================================

class Sector9Dataset(Dataset):

    def __init__(
        self,
        samples
    ):

        self.samples = samples

    def __len__(self):

        return len(self.samples)

    def __getitem__(
        self,
        index
    ):

        path, label = self.samples[
            index
        ]

        audio = load_audio(
            path
        )

        inputs = feature_extractor(
            audio,
            sampling_rate=SAMPLE_RATE,
            return_tensors="pt",
            padding=True
        )

        input_values = (
            inputs.input_values.squeeze(0)
        )

        return (
            input_values,
            torch.tensor(
                label,
                dtype=torch.long
            ),
            os.path.basename(path)
        )


# ============================================================
# COLLATE FUNCTION
# ============================================================

def collate_fn(batch):

    input_values = [
        item[0]
        for item in batch
    ]

    labels = torch.stack(
        [
            item[1]
            for item in batch
        ]
    )

    names = [
        item[2]
        for item in batch
    ]

    max_length = max(
        x.shape[0]
        for x in input_values
    )

    padded = []

    attention_masks = []

    for x in input_values:

        length = x.shape[0]

        padding = max_length - length

        if padding > 0:

            x = torch.nn.functional.pad(
                x,
                (0, padding)
            )

        padded.append(x)

        mask = torch.zeros(
            max_length,
            dtype=torch.long
        )

        mask[
            :length
        ] = 1

        attention_masks.append(
            mask
        )

    input_values = torch.stack(
        padded
    )

    attention_masks = torch.stack(
        attention_masks
    )

    return (
        input_values,
        attention_masks,
        labels,
        names
    )


# ============================================================
# DATALOADERS
# ============================================================

train_dataset = Sector9Dataset(
    train_samples
)

validation_dataset = Sector9Dataset(
    validation_samples
)


train_loader = DataLoader(
    train_dataset,
    batch_size=BATCH_SIZE,
    shuffle=True,
    collate_fn=collate_fn
)


validation_loader = DataLoader(
    validation_dataset,
    batch_size=BATCH_SIZE,
    shuffle=False,
    collate_fn=collate_fn
)


# ============================================================
# SECTOR 9 CLASSIFIER
# ============================================================

class Sector9Classifier(
    nn.Module
):

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


    def forward(
        self,
        features
    ):

        return self.classifier(
            features
        )


classifier = Sector9Classifier(
    hidden_size=wav2vec2.config.hidden_size,
    num_classes=5
)


classifier.to(DEVICE)


# ============================================================
# LOSS
# ============================================================

criterion = nn.CrossEntropyLoss()


# ============================================================
# OPTIMIZER
# ============================================================

optimizer = torch.optim.AdamW(
    classifier.parameters(),
    lr=LEARNING_RATE,
    weight_decay=0.01
)


# ============================================================
# FEATURE EXTRACTION
# ============================================================

def extract_features(
    input_values,
    attention_mask
):

    with torch.no_grad():

        outputs = wav2vec2(
            input_values=input_values,
            attention_mask=attention_mask
        )

        hidden_states = (
            outputs.last_hidden_state
        )

        # Mean pooling
        features = hidden_states.mean(
            dim=1
        )

    return features


# ============================================================
# TRAINING
# ============================================================

print()
print("=" * 70)
print("STARTING TRAINING")
print("=" * 70)


best_validation_accuracy = 0.0


for epoch in range(
    1,
    EPOCHS + 1
):

    classifier.train()

    total_loss = 0.0

    correct = 0

    total = 0


    for (
        input_values,
        attention_masks,
        labels,
        names
    ) in train_loader:

        input_values = (
            input_values.to(DEVICE)
        )

        attention_masks = (
            attention_masks.to(DEVICE)
        )

        labels = labels.to(
            DEVICE
        )


        # Extract frozen Wav2Vec2 features
        features = extract_features(
            input_values,
            attention_masks
        )


        # Classifier
        logits = classifier(
            features
        )


        loss = criterion(
            logits,
            labels
        )


        optimizer.zero_grad()

        loss.backward()

        optimizer.step()


        total_loss += (
            loss.item()
            *
            labels.size(0)
        )


        predictions = torch.argmax(
            logits,
            dim=1
        )


        correct += (
            predictions == labels
        ).sum().item()

        total += labels.size(0)


    train_loss = (
        total_loss / total
    )

    train_accuracy = (
        correct / total
    )


    # ========================================================
    # VALIDATION
    # ========================================================

    classifier.eval()

    validation_correct = 0

    validation_total = 0

    validation_loss = 0.0


    with torch.no_grad():

        for (
            input_values,
            attention_masks,
            labels,
            names
        ) in validation_loader:

            input_values = (
                input_values.to(DEVICE)
            )

            attention_masks = (
                attention_masks.to(DEVICE)
            )

            labels = labels.to(
                DEVICE
            )


            features = extract_features(
                input_values,
                attention_masks
            )


            logits = classifier(
                features
            )


            loss = criterion(
                logits,
                labels
            )


            validation_loss += (
                loss.item()
                *
                labels.size(0)
            )


            predictions = torch.argmax(
                logits,
                dim=1
            )


            validation_correct += (
                predictions == labels
            ).sum().item()

            validation_total += (
                labels.size(0)
            )


    validation_loss /= (
        validation_total
    )

    validation_accuracy = (
        validation_correct
        /
        validation_total
    )


    print(
        f"Epoch {epoch:02d}/{EPOCHS} | "
        f"Train Loss: {train_loss:.4f} | "
        f"Train Acc: {train_accuracy:.3f} | "
        f"Val Loss: {validation_loss:.4f} | "
        f"Val Acc: {validation_accuracy:.3f}"
    )


    # ========================================================
    # SAVE BEST MODEL
    # ========================================================

    if (
        validation_accuracy
        >=
        best_validation_accuracy
    ):

        best_validation_accuracy = (
            validation_accuracy
        )

        os.makedirs(
            OUTPUT_DIR,
            exist_ok=True
        )


        torch.save(
            classifier.state_dict(),
            os.path.join(
                OUTPUT_DIR,
                "sector9_classifier.pt"
            )
        )


# ============================================================
# SAVE LABEL CONFIGURATION
# ============================================================

os.makedirs(
    OUTPUT_DIR,
    exist_ok=True
)


with open(
    os.path.join(
        OUTPUT_DIR,
        "labels.json"
    ),
    "w",
    encoding="utf-8"
) as f:

    json.dump(
        LABELS,
        f,
        indent=2
    )


# ============================================================
# TRAINING COMPLETE
# ============================================================

print()
print("=" * 70)
print("TRAINING COMPLETE")
print("=" * 70)

print(
    "Best validation accuracy:",
    round(
        best_validation_accuracy,
        3
    )
)

print()
print(
    "Saved model:"
)

print(
    os.path.join(
        OUTPUT_DIR,
        "sector9_classifier.pt"
    )
)

print()
print(
    "Saved labels:"
)

print(
    os.path.join(
        OUTPUT_DIR,
        "labels.json"
    )
)

print()
print(
    "IMPORTANT:"
)

print(
    "The validation set contains only "
    f"{VALIDATION_PER_CLASS} sample per class."
)

print(
    "High validation accuracy on 25 samples "
    "does NOT mean production-level accuracy."
)

print()
print(
    "Next step: integrate the trained classifier "
    "into sector9_ai.py and test unseen recordings."
)

print("=" * 70)