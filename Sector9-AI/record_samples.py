import sounddevice as sd
from scipy.io.wavfile import write
from pathlib import Path
import time

RATE = 16000
SECONDS = 5

samples = [
    ("level1_calm", "calm", [
        "I am driving normally and everything feels under control.",
        "The road is clear and I feel comfortable driving.",
        "Everything is calm and I am focused on the road.",
        "Traffic is light and there is nothing unusual happening.",
        "I feel relaxed and comfortable while driving."
    ]),

    ("level2_focused", "focused", [
        "I am paying close attention to the road ahead.",
        "I am focused on the traffic around me.",
        "I am watching the road carefully.",
        "I am concentrating on my driving.",
        "I am alert and paying attention to my surroundings."
    ]),

    ("level3_stressed", "stressed", [
        "Traffic is becoming stressful and I need to concentrate.",
        "I am getting tense because traffic is getting heavier.",
        "There is a lot happening around me and I feel stressed.",
        "I am finding it harder to stay relaxed in this traffic.",
        "This situation is making me increasingly uncomfortable."
    ]),

    ("level4_angry", "angry", [
        "That driver just cut me off and it is really frustrating.",
        "I cannot believe that driver just did that.",
        "These drivers are making me extremely angry.",
        "This traffic is seriously frustrating me.",
        "I am getting angry with what is happening on the road."
    ]),

    ("level5_highrisk", "highrisk", [
        "I am extremely overwhelmed and struggling to focus.",
        "Everything is happening too quickly and I feel out of control.",
        "I am panicking and cannot concentrate properly.",
        "I am extremely distressed and having trouble staying focused.",
        "I feel overwhelmed and I need help staying safe."
    ])
]

print("\n===== SECTOR 9 VOICE RECORDER =====")

for folder, prefix, sentences in samples:

    directory = Path("voice_samples") / folder
    directory.mkdir(parents=True, exist_ok=True)

    print(f"\n===== {folder.upper()} =====")

    for number, sentence in enumerate(sentences, 1):

        filename = directory / f"{prefix}_{number:02d}.wav"

        print(f"\nSample {number}/5")
        print(f'Say: "{sentence}"')
        input("Press ENTER, then speak...")

        print("RECORDING...")

        audio = sd.rec(
            int(SECONDS * RATE),
            samplerate=RATE,
            channels=1,
            dtype="int16"
        )

        sd.wait()

        write(filename, RATE, audio)

        print(f"SAVED: {filename}")
        print(f"SIZE: {filename.stat().st_size:,} bytes")

        time.sleep(1)

print("\n===== ALL 25 RECORDINGS COMPLETE =====")