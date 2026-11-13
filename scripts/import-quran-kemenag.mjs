#!/usr/bin/env node
/**
 * Impor teks Arab Mushaf Standar Indonesia (MSI) dan transliterasi latinnya dari layanan resmi Qur'an Kemenag
 * (quran.kemenag.go.id, disusun Lajnah Pentashihan Mushaf Al-Qur'an) untuk 114 surah.
 * Teks diambil apa adanya, tidak ada yang diketik manual.
 *
 * Pemakaian (perlu Node 18+ dan koneksi internet):
 *   node scripts/import-quran-kemenag.mjs
 *
 * Jumlah ayat setiap surah dicocokkan dengan public/quran/index.json
 * (hasil scripts/import-quran.mjs), jadi impor itu harus sudah ada.
 *
 * Keluaran:
 *   public/quran-kemenag/{1..114}.json  { number, ayahs: [[nomorAyat, teksArab, teksLatin], ...] }
 *   public/quran-kemenag/index.json     sumber, waktu impor, dan ringkasan pemeriksaan
 * Bila satu pemeriksaan gagal, tidak ada berkas yang diubah.
 */
import { mkdir, readFile, rm, rename, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = path.join(ROOT, 'public', 'quran-kemenag');
const TMP_DIR = path.join(ROOT, 'public', '.quran-kemenag-import-tmp');
const READER_DIR = path.join(ROOT, 'public', 'quran');
const API = (process.env.KEMENAG_API_BASE || 'https://web-api.qurankemenag.net').replace(/\/$/, '');
const PAGE_SIZE = 50;
const CONCURRENCY = 2;

// Layanan ini dipakai oleh situs resmi quran.kemenag.go.id.
const headers = {
  Accept: 'application/json',
  Origin: 'https://quran.kemenag.go.id',
  Referer: 'https://quran.kemenag.go.id/'
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function getJson(url, attempt = 1) {
  let response;
  try {
    response = await fetch(url, { headers });
  } catch (error) {
    if (attempt >= 5) throw new Error(`Gagal menghubungi ${url}: ${error.message}`);
    await sleep(1000 * 2 ** attempt);
    return getJson(url, attempt + 1);
  }
  if ((response.status === 429 || response.status >= 500) && attempt < 5) {
    await sleep(1000 * 2 ** attempt);
    return getJson(url, attempt + 1);
  }
  if (!response.ok) throw new Error(`HTTP ${response.status} untuk ${url}`);
  return response.json();
}

async function fetchSurah(number, expected) {
  const byAyah = new Map();
  let start = 0;
  while (byAyah.size < expected) {
    const url = `${API}/quran-ayah?surah=${number}&start=${start}&limit=${PAGE_SIZE}`;
    const page = (await getJson(url))?.data;
    if (!Array.isArray(page) || page.length === 0) break;
    for (const row of page) {
      if (Number(row.surah_id ?? number) !== number) {
        throw new Error(`Surah ${number}: API mengembalikan ayat dari surah ${row.surah_id}`);
      }
      byAyah.set(Number(row.ayah), {
        arabic: String(row.arabic ?? '').trim(),
        latin: String(row.latin ?? '').replace(/\s+/g, ' ').trim()
      });
    }
    start += page.length;
  }
  return byAyah;
}

// U+06D5 tidak dihitung huruf: di teks MSI ia dipakai sebagai tanda (mis. "ەۙ").
const ARABIC_LETTER = /[\u0621-\u064A\u0671-\u06D3\u06EE\u06EF\u06FA-\u06FC]/;
/** Jumlah kata: tanda yang berdiri sendiri (tanda waqaf, dll.) ikut kata sebelumnya. */
const wordCount = (text) => text.split(/\s+/).filter((token) => ARABIC_LETTER.test(token)).length;

async function main() {
  const index = JSON.parse(await readFile(path.join(READER_DIR, 'index.json'), 'utf8'));
  if (!Array.isArray(index.surahs) || index.surahs.length !== 114) {
    throw new Error('public/quran/index.json tidak lengkap. Jalankan dulu scripts/import-quran.mjs');
  }
  console.log(`Sumber: ${API} (Qur'an Kemenag, Mushaf Standar Indonesia)`);

  const results = new Array(114);
  let cursor = 0;
  let done = 0;
  await Promise.all(Array.from({ length: CONCURRENCY }, async () => {
    while (cursor < index.surahs.length) {
      const meta = index.surahs[cursor++];
      results[meta.number - 1] = { meta, ayahs: await fetchSurah(meta.number, meta.numberOfAyahs) };
      done += 1;
      if (done % 10 === 0 || done === 114) console.log(`Mengambil surah: ${done}/114`);
      await sleep(150);
    }
  }));

  const problems = [];
  let totalAyahs = 0;
  let sameWordCount = 0;
  const differentWordCount = [];
  const surahs = [];
  for (const { meta, ayahs } of results) {
    const { number, numberOfAyahs } = meta;
    if (ayahs.size !== numberOfAyahs) {
      problems.push(`Surah ${number}: ${ayahs.size} ayat dari Kemenag, seharusnya ${numberOfAyahs}`);
      continue;
    }
    const reader = JSON.parse(await readFile(path.join(READER_DIR, 'surah', `${number}.json`), 'utf8'));
    const rows = [];
    for (let n = 1; n <= numberOfAyahs; n += 1) {
      const text = ayahs.get(n)?.arabic;
      const latin = ayahs.get(n)?.latin ?? '';
      if (!text || !ARABIC_LETTER.test(text)) {
        problems.push(`Surah ${number} ayat ${n}: teks Arab kosong`);
        continue;
      }
      if (/[<>]/.test(text)) problems.push(`Surah ${number} ayat ${n}: teks memuat tag HTML`);
      if (!latin) problems.push(`Surah ${number} ayat ${n}: teks latin kosong`);
      if (/[<>]/.test(latin)) problems.push(`Surah ${number} ayat ${n}: teks latin memuat tag HTML`);
      rows.push([n, text, latin]);
      const words = reader.ayahs[n - 1]?.w?.length ?? 0;
      if (wordCount(text) === words) sameWordCount += 1;
      else differentWordCount.push(`${number}:${n}`);
    }
    totalAyahs += rows.length;
    surahs.push({ number, ayahs: rows });
  }

  if (totalAyahs !== 6236) problems.push(`Total ayat ${totalAyahs}, seharusnya 6236`);
  if (problems.length) {
    console.error(`\nImpor dibatalkan, ${problems.length} masalah ditemukan:`);
    problems.slice(0, 30).forEach((p) => console.error(`  - ${p}`));
    process.exit(1);
  }

  await rm(TMP_DIR, { recursive: true, force: true });
  await mkdir(TMP_DIR, { recursive: true });
  const summary = {
    source: "Qur'an Kemenag — Mushaf Standar Indonesia (Lajnah Pentashihan Mushaf Al-Qur'an)",
    url: 'https://quran.kemenag.go.id/',
    font: 'LPMQ Isep Misbah (Lajnah Pentashihan Mushaf Al-Qur\'an)',
    importedAt: new Date().toISOString(),
    totals: { surahs: surahs.length, ayahs: totalAyahs, sameWordCount, differentWordCount: differentWordCount.length }
  };
  await writeFile(path.join(TMP_DIR, 'index.json'), `${JSON.stringify(summary, null, 1)}\n`);
  for (const surah of surahs) {
    await writeFile(path.join(TMP_DIR, `${surah.number}.json`), `${JSON.stringify(surah)}\n`);
  }
  if (existsSync(OUT_DIR)) await rm(OUT_DIR, { recursive: true, force: true });
  await rename(TMP_DIR, OUT_DIR);

  console.log(`\nSelesai. ${totalAyahs} ayat tersimpan di ${path.relative(ROOT, OUT_DIR)}/`);
  console.log(`Pembagian kata sama dengan data per kata: ${sameWordCount} ayat; berbeda: ${differentWordCount.length} ayat`);
  if (differentWordCount.length) console.log(`Contoh ayat berbeda: ${differentWordCount.slice(0, 15).join(', ')}`);
}

main().catch(async (error) => {
  await rm(TMP_DIR, { recursive: true, force: true }).catch(() => {});
  console.error(`\nImpor gagal: ${error.message}`);
  process.exit(1);
});
