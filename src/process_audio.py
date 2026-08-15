from pathlib import Path

import librosa
import numpy as np


def load_audio(audio_path, target_sr=16000):
    """
    Load an audio file and convert it to mono
    with a standard sample rate.
    """

    audio_path = Path(audio_path)

    if not audio_path.exists():
        raise FileNotFoundError(
            f"Audio file not found: {audio_path}"
        )

    audio, sample_rate = librosa.load(
        audio_path,
        sr=target_sr,
        mono=True
    )

    if len(audio) == 0:
        raise ValueError("Audio file contains no samples.")

    return audio, sample_rate


def normalize_audio(audio):
    """
    Normalize audio amplitude.
    """

    audio = np.asarray(audio, dtype=np.float32)

    peak = np.max(np.abs(audio))

    if peak == 0:
        return audio

    return audio / peak


def preprocess_audio(audio):
    """
    Basic preprocessing before feature extraction.
    """

    audio = normalize_audio(audio)

    audio, _ = librosa.effects.trim(
        audio,
        top_db=30
    )

    return audio


def process_audio(audio_path, target_sr=16000):
    """
    Complete audio preprocessing pipeline.
    """

    audio, sample_rate = load_audio(
        audio_path,
        target_sr
    )

    processed_audio = preprocess_audio(audio)

    return processed_audio, sample_rate


if __name__ == "__main__":
    print("Silent Co-Driver Audio Processor")
    print("Audio preprocessing module ready.")