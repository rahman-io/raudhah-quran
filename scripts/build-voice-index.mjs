#!/usr/bin/env node
/**
 * Buat indeks pencarian ayat dengan suara dari teks Mushaf Standar Indonesia
 * (public/quran-kemenag/*.json, hasil scripts/import-quran-kemenag.mjs).
 *
 * Pemakaian:  node --import tsx scripts/build-voice-index.mjs
 * Keluaran:   public/quran-search/ar.json  { total, rows: [[surah, ayat, kerangka], ...] }
 *
 * Kerangka huruf dibuat dengan src/services/arabicSkeleton.ts, fungsi yang sama dengan
 * yang menormalkan hasil suara di aplikasi. Jalankan lagi bila teks Kemenag diimpor ulang
 * atau aturan kerangka diubah.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { arabicSkeleton } from '../src/services/arabicSkeleton.ts';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = path.join(ROOT, 'public', 'quran-kemenag');
const OUT_DIR = path.join(ROOT, 'public', 'quran-search');

const rows = [];
for (let surah = 1; surah <= 114; surah += 1) {
  const file = JSON.parse(await readFile(path.join(SOURCE, `${surah}.json`), 'utf8'));
  for (const [ayah, arabic] of file.ayahs) {
    const skeleton = arabicSkeleton(String(arabic ?? ''));
    if (!skeleton) throw new Error(`Teks Arab kosong: ${surah}:${ayah}`);
    rows.push([surah, ayah, skeleton]);
  }
}
if (rows.length !== 6236) throw new Error(`Jumlah ayat ${rows.length}, seharusnya 6236`);

await mkdir(OUT_DIR, { recursive: true });
await writeFile(path.join(OUT_DIR, 'ar.json'), `${JSON.stringify({ total: rows.length, rows })}\n`);
console.log(`Selesai: ${rows.length} ayat → ${path.relative(ROOT, path.join(OUT_DIR, 'ar.json'))}`);
