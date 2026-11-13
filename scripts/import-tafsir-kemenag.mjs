#!/usr/bin/env node
/**
 * Impor Tafsir Kemenag per ayat (Tafsir Ringkas/Wajiz dan Tafsir Tahlili) dari layanan
 * resmi Qur'an Kemenag (quran.kemenag.go.id). Teks diambil apa adanya.
 *
 * Pemakaian (perlu Node 18+ dan internet; ±6.236 permintaan, sekitar 10–20 menit):
 *   node scripts/import-tafsir-kemenag.mjs
 *
 * Bila terputus di tengah jalan, jalankan lagi: ayat yang sudah diunduh disimpan sementara
 * di .cache/kemenag-tafsir/ dan tidak diunduh ulang. Cache dihapus setelah impor berhasil.
 *
 * Keluaran:
 *   public/quran-tafsir/{1..114}.json  { number, ayahs: [[nomorAyat, tafsirRingkas, tafsirTahlili], ...] }
 *   public/quran-tafsir/index.json     sumber dan waktu impor
 * Bila satu pemeriksaan gagal, berkas lama tidak diubah.
 */
import { mkdir, readFile, rm, rename, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = path.join(ROOT, 'public', 'quran-tafsir');
const TMP_DIR = path.join(ROOT, 'public', '.quran-tafsir-import-tmp');
const CACHE_DIR = path.join(ROOT, '.cache', 'kemenag-tafsir');
const READER_INDEX = path.join(ROOT, 'public', 'quran', 'index.json');
const API = (process.env.KEMENAG_API_BASE || 'https://web-api.qurankemenag.net').replace(/\/$/, '');
const TOTAL = 6236;
const CONCURRENCY = 3;

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
    if (attempt >= 6) throw new Error(`Gagal menghubungi ${url}: ${error.message}`);
    await sleep(1000 * 2 ** attempt);
    return getJson(url, attempt + 1);
  }
  if ((response.status === 429 || response.status >= 500) && attempt < 6) {
    await sleep(1000 * 2 ** attempt);
    return getJson(url, attempt + 1);
  }
  if (!response.ok) throw new Error(`HTTP ${response.status} untuk ${url}`);
  return response.json();
}

const clean = (text) => String(text ?? '').replace(/\r\n?/g, '\n').replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();

async function fetchAyah(id) {
  const cacheFile = path.join(CACHE_DIR, `${id}.json`);
  if (existsSync(cacheFile)) return JSON.parse(await readFile(cacheFile, 'utf8'));
  const data = (await getJson(`${API}/quran-tafsir/${id}`))?.data;
  if (!data) throw new Error(`Data kosong untuk ayat ke-${id}`);
  const row = {
    id,
    surah: Number(data.surah_id),
    ayah: Number(data.ayah),
    ringkas: clean(data.tafsir?.wajiz),
    tahlili: clean(data.tafsir?.tahlili)
  };
  await writeFile(cacheFile, JSON.stringify(row));
  await sleep(120);
  return row;
}

async function main() {
  const index = JSON.parse(await readFile(READER_INDEX, 'utf8'));
  const counts = new Map(index.surahs.map((s) => [s.number, s.numberOfAyahs]));
  await mkdir(CACHE_DIR, { recursive: true });
  console.log(`Sumber: ${API}/quran-tafsir/{1..${TOTAL}} (Tafsir Kemenag)`);

  const rows = new Array(TOTAL);
  let next = 1;
  let done = 0;
  await Promise.all(Array.from({ length: CONCURRENCY }, async () => {
    while (next <= TOTAL) {
      const id = next++;
      rows[id - 1] = await fetchAyah(id);
      done += 1;
      if (done % 250 === 0 || done === TOTAL) console.log(`Mengambil tafsir: ${done}/${TOTAL}`);
    }
  }));

  const problems = [];
  const bySurah = new Map();
  rows.forEach((row) => {
    if (!row.ringkas && !row.tahlili) problems.push(`${row.surah}:${row.ayah} (ke-${row.id}): tafsir kosong`);
    if (/<[a-z/][^>]*>/i.test(row.ringkas + row.tahlili)) problems.push(`${row.surah}:${row.ayah}: memuat tag HTML`);
    if (!bySurah.has(row.surah)) bySurah.set(row.surah, []);
    bySurah.get(row.surah).push([row.ayah, row.ringkas, row.tahlili]);
  });
  for (const [surah, expected] of counts) {
    const list = bySurah.get(surah) ?? [];
    if (list.length !== expected) problems.push(`Surah ${surah}: ${list.length} ayat, seharusnya ${expected}`);
    list.sort((a, b) => a[0] - b[0]);
    list.forEach(([ayah], i) => ayah !== i + 1 && problems.push(`Surah ${surah}: urutan ayat tidak lengkap di ayat ${i + 1}`));
  }
  if (problems.length) {
    console.error(`\nImpor dibatalkan, ${problems.length} masalah ditemukan:`);
    problems.slice(0, 30).forEach((p) => console.error(`  - ${p}`));
    console.error('Cache tetap disimpan; jalankan lagi setelah masalahnya diperiksa.');
    process.exit(1);
  }

  await rm(TMP_DIR, { recursive: true, force: true });
  await mkdir(TMP_DIR, { recursive: true });
  for (const [number, ayahs] of [...bySurah].sort((a, b) => a[0] - b[0])) {
    await writeFile(path.join(TMP_DIR, `${number}.json`), `${JSON.stringify({ number, ayahs })}\n`);
  }
  await writeFile(path.join(TMP_DIR, 'index.json'), `${JSON.stringify({
    source: 'Tafsir Kemenag — Tafsir Ringkas (Wajiz) dan Tafsir Tahlili, Qur\'an Kemenag',
    url: 'https://quran.kemenag.go.id/',
    importedAt: new Date().toISOString(),
    totals: { surahs: bySurah.size, ayahs: TOTAL }
  }, null, 1)}\n`);
  if (existsSync(OUT_DIR)) await rm(OUT_DIR, { recursive: true, force: true });
  await rename(TMP_DIR, OUT_DIR);
  await rm(CACHE_DIR, { recursive: true, force: true });
  console.log(`\nSelesai. Tafsir ${TOTAL} ayat tersimpan di ${path.relative(ROOT, OUT_DIR)}/`);
}

main().catch(async (error) => {
  await rm(TMP_DIR, { recursive: true, force: true }).catch(() => {});
  console.error(`\nImpor gagal: ${error.message}`);
  console.error('Ayat yang sudah diunduh tersimpan di .cache/kemenag-tafsir/; jalankan lagi untuk melanjutkan.');
  process.exit(1);
});
