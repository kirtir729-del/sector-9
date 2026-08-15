import os
import glob

from sector9_ai import analyze_sector9


print()
print("=" * 100)
print("SECTOR 9 - TRAINED 25 SAMPLE TEST")
print("=" * 100)

print()

print(
    f"{'FILE':<20}"
    f"{'EXPECTED':<22}"
    f"{'PREDICTED':<22}"
    f"{'LEVEL':<8}"
    f"{'STATE':<15}"
    f"{'CONF':<8}"
)

print("-" * 100)


files = glob.glob(
    "voice_samples/**/*.wav",
    recursive=True
)

files.sort()

correct = 0
total = 0


for file_path in files:

    filename = os.path.basename(file_path)

    expected = os.path.basename(
        os.path.dirname(file_path)
    )

    try:

        result = analyze_sector9(
            file_path
        )

        predicted = result["top_prediction"]

        level = result["sector9_level"]

        state = result["state"]

        confidence = result["confidence"]

        if predicted == expected:
            correct += 1

        total += 1

        print(
            f"{filename:<20}"
            f"{expected:<22}"
            f"{predicted:<22}"
            f"{level:<8}"
            f"{state:<15}"
            f"{confidence:<8.3f}"
        )

    except Exception as e:

        total += 1

        print(
            f"{filename:<20}"
            f"ERROR: {e}"
        )


print()
print("=" * 100)

if total > 0:

    accuracy = correct / total

    print(
        f"CORRECT: {correct}/{total}"
    )

    print(
        f"TRAINING DATA ACCURACY: "
        f"{accuracy:.3f} "
        f"({accuracy * 100:.1f}%)"
    )

print("=" * 100)