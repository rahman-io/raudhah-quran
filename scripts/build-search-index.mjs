#!/usr/bin/env node
/**
 * Buat indeks pencarian arti ayat untuk menu Baca & Tadabbur dari data
 * public/quran/surah/*.json (hasil scripts/import-quran.mjs).
 *
 * Pemakaian:  node scripts/build-search-index.mjs
 * Keluaran:   public/quran-search/id.json  { total, rows: [[surah, ayat, terjemah], ...] }
 *
 * Disimpan di folder tersendiri karena import-quran.mjs menghapus public/quran saat impor ulang.
 * Jalankan lagi setiap kali data terjemahan diimpor ulang.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = path.join(ROOT, 'public', 'quran', 'surah');
const OUT_DIR = path.join(ROOT, 'public', 'quran-search');

const rows = [];
for (let surah = 1; surah <= 114; surah += 1) {
  const file = JSON.parse(await readFile(path.join(SOURCE, `${surah}.json`), 'utf8'));
  for (const ayah of file.ayahs) {
    const text = String(ayah.id ?? '').replace(/\s+/g, ' ').trim();
    if (!text) throw new Error(`Terjemah kosong: ${surah}:${ayah.n}`);
    rows.push([surah, ayah.n, text]);
  }
}
if (rows.length !== 6236) throw new Error(`Jumlah ayat ${rows.length}, seharusnya 6236`);

await mkdir(OUT_DIR, { recursive: true });
await writeFile(path.join(OUT_DIR, 'id.json'), `${JSON.stringify({ total: rows.length, rows })}\n`);
console.log(`Selesai: ${rows.length} ayat → ${path.relative(ROOT, path.join(OUT_DIR, 'id.json'))}`);
