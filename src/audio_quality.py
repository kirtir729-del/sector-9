import librosa
import numpy as np


def analyze_audio_quality(audio_path):
    """
    Analyze basic radio-audio quality.

    This is not a laboratory-grade SNR measurement.
    It provides useful prototype indicators for:
    - loudness
    - clipping
    - silence
    - estimated noise floor
    """

    y, sr = librosa.load(audio_path, sr=None, mono=True)

    duration = len(y) / sr

    rms = librosa.feature.rms(y=y)[0]

    average_rms = float(np.mean(rms))
    rms_variation = float(np.std(rms))

    peak = float(np.max(np.abs(y)))

    clipping_ratio = float(
        np.mean(np.abs(y) >= 0.99)
    )

    silence_threshold = max(average_rms * 0.1, 0.001)

    silent_frames = rms < silence_threshold

    silence_ratio = float(np.mean(silent_frames))

    # Estimate noise floor from the quietest 10% of frames.
    sorted_rms = np.sort(rms)

    n_noise = max(1, int(len(sorted_rms) * 0.10))

    noise_floor = float(
        np.mean(sorted_rms[:n_noise])
    )

    estimated_snr = float(
        20 * np.log10(
            (average_rms + 1e-8) /
            (noise_floor + 1e-8)
        )
    )

    quality_score = 100.0

    if estimated_snr < 10:
        quality_score -= 35
    elif estimated_snr < 15:
        quality_score -= 20
    elif estimated_snr < 20:
        quality_score -= 10

    if clipping_ratio > 0.01:
        quality_score -= 20

    if silence_ratio > 0.5:
        quality_score -= 15

    quality_score = max(0, min(100, quality_score))

    return {
        "duration": duration,
        "sample_rate": sr,
        "average_rms": average_rms,
        "rms_variation": rms_variation,
        "peak": peak,
        "clipping_ratio": clipping_ratio,
        "silence_ratio": silence_ratio,
        "noise_floor": noise_floor,
        "estimated_snr_db": estimated_snr,
        "quality_score": quality_score
    }


if __name__ == "__main__":

    AUDIO_PATH = "audio/level_0/calm_01.ogg"

    print("Analyzing audio quality...")

    result = analyze_audio_quality(AUDIO_PATH)

    print("\nAUDIO QUALITY")
    print("==============================")

    for key, value in result.items():
        print(f"{key}: {value}")
        