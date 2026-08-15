import numpy as np
import librosa


def extract_pitch(audio, sample_rate):
    """
    Extract average pitch and pitch variation.
    """

    f0, _, _ = librosa.pyin(
        audio,
        fmin=librosa.note_to_hz("C2"),
        fmax=librosa.note_to_hz("C7"),
        sr=sample_rate
    )

    f0 = f0[~np.isnan(f0)]

    if len(f0) == 0:
        return 0.0, 0.0

    return (
        float(np.mean(f0)),
        float(np.std(f0))
    )


def extract_energy(audio):
    """
    Extract average energy and energy variation.
    """

    rms = librosa.feature.rms(
        y=audio
    )[0]

    return (
        float(np.mean(rms)),
        float(np.std(rms))
    )


def extract_pause_duration(audio, sample_rate):
    """
    Estimate average pause duration.
    """

    intervals = librosa.effects.split(
        audio,
        top_db=30
    )

    if len(intervals) <= 1:
        return 0.0

    pauses = []

    for i in range(1, len(intervals)):
        pause_samples = (
            intervals[i][0] -
            intervals[i - 1][1]
        )

        pauses.append(
            pause_samples / sample_rate
        )

    if not pauses:
        return 0.0

    return float(np.mean(pauses))


def extract_speech_rate(audio, sample_rate):
    """
    Estimate speech rate using detected speech segments.
    """

    intervals = librosa.effects.split(
        audio,
        top_db=30
    )

    duration = len(audio) / sample_rate

    if duration <= 0:
        return 0.0

    speech_duration = sum(
        end - start
        for start, end in intervals
    ) / sample_rate

    return float(
        speech_duration / duration
    )


def extract_features(audio, sample_rate):
    """
    Extract all features required by the
    Silent Co-Driver baseline and risk engine.
    """

    average_pitch, pitch_variation = extract_pitch(
        audio,
        sample_rate
    )

    average_energy, energy_variation = extract_energy(
        audio
    )

    pause_duration = extract_pause_duration(
        audio,
        sample_rate
    )

    speech_rate = extract_speech_rate(
        audio,
        sample_rate
    )

    return {
        "average_pitch": average_pitch,
        "pitch_variation": pitch_variation,
        "average_energy": average_energy,
        "energy_variation": energy_variation,
        "pause_duration": pause_duration,
        "speech_rate": speech_rate
    }


if __name__ == "__main__":
    print("Silent Co-Driver Feature Extractor")
    print("Feature extraction module ready.")