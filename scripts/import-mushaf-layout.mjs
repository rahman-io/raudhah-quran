#!/usr/bin/env node
/**
 * Impor susunan halaman mushaf (604 halaman, 15 baris) untuk "Mode Mushaf" di Baca & Tadabbur.
 * Data letak kata per baris diambil dari Quran.com API v4 (mushaf Madinah 15 baris). Pembagian
 * halamannya sama persis dengan mushaf Qur'an Kemenag (sudah dicek untuk ke-6.236 ayat).
 * Yang ditampilkan tetap teks Mushaf Standar Indonesia (public/quran-kemenag) dengan font LPMQ.
 *
 * Pemakaian (perlu Node 18+ dan koneksi internet):
 *   node scripts/import-mushaf-layout.mjs
 *
 * Keluaran: public/quran-mushaf/layout.json
 *   pages: 604 teks "jumlahToken,jumlahToken,…" per baris (kosong = baris judul surah/basmalah)
 *          token = kata atau tanda akhir ayat, berurutan dari Al-Fatihah sampai An-Nas
 *   words: jumlah kata per ayat untuk setiap surah (tanpa tanda akhir ayat)
 * Bila satu pemeriksaan gagal, berkas tidak diubah.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = path.join(ROOT, 'public', 'quran-mushaf');
const READER_DIR = path.join(ROOT, 'public', 'quran', 'surah');
const API = (process.env.QURAN_API_BASE || 'https://api.quran.com/api/v4').replace(/\/$/, '');
const CONCURRENCY = 4;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function getJson(url, attempt = 1) {
  try {
    const response = await fetch(url, { headers: { Accept: 'application/json' } });
    if ((response.status === 429 || response.status >= 500) && attempt < 5) {
      await sleep(1000 * 2 ** attempt);
      return getJson(url, attempt + 1);
    }
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  } catch (error) {
    if (attempt >= 5) throw new Error(`Gagal mengambil ${url}: ${error.message}`);
    await sleep(1000 * 2 ** attempt);
    return getJson(url, attempt + 1);
  }
}

/** Jumlah token per baris satu halaman; baris tanpa token (judul/basmalah) bernilai null. */
async function fetchPage(page) {
  const data = await getJson(`${API}/verses/by_page/${page}?words=true&word_fields=line_number&per_page=50`);
  const lines = new Map();
  for (const verse of data.verses) for (const word of verse.words) lines.set(word.line_number, (lines.get(word.line_number) ?? 0) + 1);
  const max = Math.max(...lines.keys(), page <= 2 ? 8 : 15);
  return Array.from({ length: max }, (_, i) => lines.get(i + 1) ?? null);
}

async function main() {
  // Jumlah kata per ayat dari data Baca & Tadabbur (hasil scripts/import-quran.mjs, sumber yang sama).
  const words = [];
  for (let surah = 1; surah <= 114; surah += 1) {
    const file = JSON.parse(await readFile(path.join(READER_DIR, `${surah}.json`), 'utf8'));
    words.push(file.ayahs.map((ayah) => ayah.w.length));
  }

  console.log(`Sumber: ${API}`);
  const pages = new Array(604);
  let next = 1;
  let done = 0;
  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      while (next <= 604) {
        const page = next++;
        pages[page - 1] = await fetchPage(page);
        done += 1;
        if (done % 50 === 0 || done === 604) console.log(`Mengambil halaman: ${done}/604`);
        await sleep(80);
      }
    })
  );

  // Pemeriksaan: jumlah token sama, dan setiap baris kosong tepat sebelum awal surah.
  const problems = [];
  const total = words.flat().reduce((sum, n) => sum + n + 1, 0);
  const layoutTotal = pages.flat().reduce((sum, n) => sum + (n ?? 0), 0);
  if (total !== layoutTotal) problems.push(`Jumlah token ${layoutTotal}, seharusnya ${total}`);
  const surahStart = new Map();
  let position = 0;
  words.forEach((ayahs, i) => {
    surahStart.set(position, i + 1);
    position += ayahs.reduce((sum, n) => sum + n + 1, 0);
  });
  let pointer = 0;
  let gap = 0;
  pages.forEach((lines, p) =>
    lines.forEach((count) => {
      if (count === null) return void (gap += 1);
      if (gap && !surahStart.has(pointer)) problems.push(`Halaman ${p + 1}: baris judul tidak tepat sebelum awal surah`);
      gap = 0;
      pointer += count;
    })
  );
  if (problems.length) {
    console.error(`\nImpor dibatalkan:\n  - ${problems.slice(0, 20).join('\n  - ')}`);
    process.exit(1);
  }

  await mkdir(OUT_DIR, { recursive: true });
  const output = {
    source: 'Quran.com API v4 (mushaf Madinah 15 baris, 604 halaman)',
    importedAt: new Date().toISOString(),
    pages: pages.map((lines) => lines.map((n) => n ?? '').join(',')),
    words
  };
  await writeFile(path.join(OUT_DIR, 'layout.json'), `${JSON.stringify(output)}\n`);
  console.log(`\nSelesai: 604 halaman → ${path.relative(ROOT, path.join(OUT_DIR, 'layout.json'))}`);
}

main().catch((error) => {
  console.error(`\nImpor gagal: ${error.message}`);
  process.exit(1);
});
