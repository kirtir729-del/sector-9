from process_audio import process_audio
from audio_features import extract_features


def run_feature_pipeline(audio_path):
    """
    Run the complete audio processing and
    feature extraction pipeline.
    """

    audio, sample_rate = process_audio(
        audio_path
    )

    features = extract_features(
        audio,
        sample_rate
    )

    return features


if __name__ == "__main__":
    print("Silent Co-Driver Feature Pipeline")
    print("Audio → Processing → Feature Extraction")
    print("Pipeline ready.")