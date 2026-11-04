"""Extract the short fathah syllables from Qamar's Nooraniya lesson 4.

Requires mpg123 and lame. The APK is treated as a ZIP and is never executed.
The REL IDs below were matched to the letter cells in book/Html/005.html and
book/Html/006.html, then the short final utterance of the first (fathah) phrase
was selected from each three-vowel group.
"""

from array import array
import subprocess
import sys
import tempfile
import wave
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "public/audio/iqro/qamar"

# (letter, REL audio ID, start seconds, end seconds). Arabic names distinguish
# ح from ه and ط from ت; timestamps select the first, fathah reading only.
CLIPS = [
    ("أ", "04003", 1.08, 1.50),
    ("ه", "04004", 1.56, 2.25),
    ("ع", "04005", 1.20, 1.95),
    ("غ", "04006", 1.54, 2.26),
    ("ح", "04007", 1.40, 1.72),
    ("خ", "04008", 2.12, 2.57),
    ("ق", "04009", 1.40, 1.80),
    ("ك", "04010", 1.57, 2.02),
    ("ج", "04011", 2.70, 3.15),
    ("ش", "04012", 1.64, 2.36),
    ("ي", "04013", 1.00, 1.76),
    ("ض", "04014", 2.64, 3.08),
    ("ل", "04015", 2.00, 2.67),
    ("ن", "04016", 1.98, 2.64),
    ("ر", "04017", 1.52, 1.91),
    ("ط", "04018", 1.37, 1.79),
    ("د", "04019", 2.34, 2.77),
    ("ت", "04020", 1.52, 1.98),
    ("ص", "04021", 1.26, 1.78),
    ("س", "04022", 2.50, 2.96),
    ("ز", "04023", 1.39, 1.84),
    ("ظ", "04024", 1.31, 1.80),
    ("ذ", "04025", 1.36, 1.74),
    ("ث", "04026", 2.47, 2.90),
    ("ف", "04027", 2.34, 2.82),
    ("و", "04028", 1.42, 2.12),
    ("ب", "04029", 3.11, 3.57),
    ("م", "04030", 1.46, 2.16),
]


def extract(apk: Path, only: str | None = None) -> None:
    if not zipfile.is_zipfile(apk):
        raise SystemExit(f"Bukan APK/ZIP valid: {apk}")
    if only and only not in {audio_id for _, audio_id, _, _ in CLIPS}:
        raise SystemExit(f"Tidak ada rekaman huruf dengan ID {only}")
    OUTPUT.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(apk) as archive, tempfile.TemporaryDirectory() as scratch:
        scratch = Path(scratch)
        for letter, audio_id, start, end in CLIPS:
            if only and audio_id != only:
                continue
            name = f"assets/www/book/Audio/default/{audio_id}.mp3"
            mp3 = scratch / "source.mp3"
            mp3.write_bytes(archive.read(name))
            decoded = scratch / "source.wav"
            subprocess.run(["mpg123", "-q", "-w", str(decoded), str(mp3)], check=True)
            with wave.open(str(decoded), "rb") as wav:
                rate = wav.getframerate()
                if end >= wav.getnframes() / rate:
                    raise ValueError(f"Invalid cut for {letter}: {audio_id}")
                wav.setpos(round(start * rate))
                frames = wav.readframes(round((end - start) * rate))
                params = wav.getparams()
            if audio_id == "04007":
                # Fade the end of HA before the next sound in this recording.
                samples = array("h")
                samples.frombytes(frames)
                fade_samples = round(0.03 * rate) * params.nchannels
                for i in range(fade_samples):
                    index = len(samples) - fade_samples + i
                    samples[index] = round(samples[index] * (1 - (i + 1) / fade_samples))
                frames = samples.tobytes()
            if audio_id == "04025":
                # Fade in DZA after the preceding "ha" in the source recording.
                samples = array("h")
                samples.frombytes(frames)
                fade_samples = round(0.02 * rate) * params.nchannels
                for i in range(fade_samples):
                    samples[i] = round(samples[i] * (i + 1) / fade_samples)
                frames = samples.tobytes()
            if audio_id == "04017":
                # Fade in RO after the preceding "ha" in the source recording.
                samples = array("h")
                samples.frombytes(frames)
                fade_samples = round(0.02 * rate) * params.nchannels
                for i in range(fade_samples):
                    samples[i] = round(samples[i] * (i + 1) / fade_samples)
                frames = samples.tobytes()
            if audio_id == "04023":
                # Fade in ZA after the preceding "ha" in the source recording.
                samples = array("h")
                samples.frombytes(frames)
                fade_samples = round(0.02 * rate) * params.nchannels
                for i in range(fade_samples):
                    samples[i] = round(samples[i] * (i + 1) / fade_samples)
                frames = samples.tobytes()
            cut = scratch / "cut.wav"
            with wave.open(str(cut), "wb") as wav:
                wav.setparams(params)
                wav.writeframes(frames)
            subprocess.run(
                ["lame", "--silent", "-V", "6", str(cut), str(OUTPUT / f"{audio_id}.mp3")],
                check=True,
            )
            print(f"{letter}َ: {audio_id}.mp3 ({end-start:.2f}s)")


if __name__ == "__main__":
    extract(
        Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "qamar-nooraniya.apk",
        sys.argv[2] if len(sys.argv) > 2 else None,
    )
