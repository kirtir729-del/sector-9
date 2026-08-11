import whisper
import librosa

print("Loading audio...")

audio, sample_rate = librosa.load(
    "audio/calm_01.ogg",
    sr=16000,
    mono=True
)

print("Audio loaded successfully!")
print("Sample rate:", sample_rate)
print("Duration:", len(audio) / sample_rate, "seconds")

print("\nLoading Whisper model...")

model = whisper.load_model("base")

print("Whisper model loaded!")

result = model.transcribe(audio)

print("\nTRANSCRIPT:")
print(result["text"])