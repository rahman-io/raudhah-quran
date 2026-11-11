"""Extract Qamar audio for review, without executing the Android application."""
import hashlib
import html
import json
import sys
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "preview" / "qamar-audio"
EXTENSIONS = {".mp3", ".m4a", ".aac", ".ogg", ".wav", ".opus", ".flac", ".amr", ".3gp"}
MAX_AUDIO_BYTES = 500 * 1024 * 1024


def main():
    if len(sys.argv) != 2:
        raise SystemExit("Gunakan: python3 scripts/inspect_qamar_apk.py qamar-nooraniya.apk")
    source = Path(sys.argv[1])
    if not zipfile.is_zipfile(source):
        raise SystemExit("Arsip bukan APK/ZIP yang valid; tidak ada file yang dieksekusi.")

    with zipfile.ZipFile(source) as archive:
        files = [info for info in archive.infolist()
                 if not info.is_dir() and Path(info.filename).suffix.lower() in EXTENSIONS]
        if not files:
            raise SystemExit("Tidak ditemukan audio terpisah dalam APK. Jangan ubah pemetaan Iqro.")
        if sum(info.file_size for info in files) > MAX_AUDIO_BYTES:
            raise SystemExit("Ukuran audio terkompresi terlalu besar untuk diperiksa dengan aman.")

        OUTPUT.mkdir(parents=True, exist_ok=True, mode=0o700)
        manifest = []
        for index, info in enumerate(files, start=1):
            # Output filenames are generated here; no ZIP paths are extracted.
            filename = f"{index:05d}{Path(info.filename).suffix.lower()}"
            destination = OUTPUT / filename
            digest = hashlib.sha256()
            with archive.open(info) as stream, destination.open("wb") as target:
                while block := stream.read(65536):
                    target.write(block)
                    digest.update(block)
            destination.chmod(0o600)
            manifest.append({"file": filename, "source": info.filename,
                             "bytes": info.file_size, "sha256": digest.hexdigest()})

    (OUTPUT / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2))
    rows = "\n".join(
        f'<tr><td>{html.escape(item["source"])}</td><td><audio controls preload="none" '
        f'src="./{item["file"]}"></audio></td><td>{item["file"]}</td></tr>'
        for item in manifest
    )
    (OUTPUT / "index.html").write_text(
        '<!doctype html><html lang="id"><meta charset="utf-8"><title>Periksa audio Qamar</title>'
        '<style>body{font:16px system-ui;margin:2rem}td,th{padding:.5rem;border:1px solid #ccc}'
        'table{border-collapse:collapse}</style><h1>Audio dari arsip Qamar</h1>'
        '<p>Nama berkas dari APK hanya petunjuk. Dengarkan dan cocokan sebelum dipakai di Iqro 1.</p>'
        '<table><thead><tr><th>Lokasi di APK</th><th>Putar</th><th>File lokal</th></tr></thead>'
        f'<tbody>{rows}</tbody></table></html>'
    )
    print(f"{len(manifest)} audio diekstrak ke preview/qamar-audio/. Buka index.html untuk memeriksa.")


if __name__ == "__main__":
    main()
