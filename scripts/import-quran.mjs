#!/usr/bin/env node
/**
 * Impor 114 surah Al-Qur'an dari Quran.com API (Quran Foundation) ke JSON statis
 * untuk menu "Baca & Tadabbur". Teks tidak diketik manual: semuanya berasal dari API,
 * lalu divalidasi sebelum ditulis.
 *
 * Pemakaian (perlu Node 18+ dan koneksi internet):
 *   node scripts/import-quran.mjs
 *
 * Opsi lingkungan:
 *   QURAN_TRANSLATION_ID  ID terjemahan Indonesia (bawaan 33 = Kementerian Agama RI)
 *   QURAN_API_BASE        URL dasar API (bawaan https://api.quran.com/api/v4)
 *   QF_CLIENT_ID + QF_CLIENT_SECRET  Kredensial Quran Foundation, bila API publik
 *                         meminta autentikasi (memakai apis.quran.foundation).
 *
 * Keluaran: public/quran/index.json dan public/quran/surah/{1..114}.json.
 * Bila satu pemeriksaan gagal, tidak ada berkas yang diubah.
 */
import { mkdir, rm, rename, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = path.join(ROOT, 'public', 'quran');
const TMP_DIR = path.join(ROOT, 'public', '.quran-import-tmp');

const TOTAL_SURAHS = 114;
const TOTAL_AYAHS = 6236;
const TRANSLITERATION_ID = 57; // Transliterasi latin per ayat (Quran.com)
const TRANSLATION_ID = Number(process.env.QURAN_TRANSLATION_ID || 33);
const AUDIO_BASE = 'https://cdn.islamic.network/quran/audio/128/ar.alafasy'; // sama dengan data bawaan aplikasi
const PER_PAGE = 50;
const CONCURRENCY = 3;

let apiBase = (process.env.QURAN_API_BASE || 'https://api.quran.com/api/v4').replace(/\/$/, '');
const headers = { Accept: 'application/json' };

async function authenticate() {
  const { QF_CLIENT_ID: id, QF_CLIENT_SECRET: secret } = process.env;
  if (!id || !secret) return;
  const response = await fetch('https://oauth2.quran.foundation/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString('base64')}`
    },
    body: 'grant_type=client_credentials&scope=content'
  });
  if (!response.ok) throw new Error(`Autentikasi Quran Foundation gagal: HTTP ${response.status}`);
  const { access_token: token } = await response.json();
  headers['x-auth-token'] = token;
  headers['x-client-id'] = id;
  if (!process.env.QURAN_API_BASE) apiBase = 'https://apis.quran.foundation/content/api/v4';
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function getJson(endpoint, attempt = 1) {
  const url = `${apiBase}${endpoint}`;
  let response;
  try {
    response = await fetch(url, { headers });
  } catch (error) {
    if (attempt >= 5) throw new Error(`Gagal menghubungi ${url}: ${error.message}`);
    await sleep(1000 * 2 ** attempt);
    return getJson(endpoint, attempt + 1);
  }
  if ((response.status === 429 || response.status >= 500) && attempt < 5) {
    const retryAfter = Number(response.headers.get('retry-after')) || 2 ** attempt;
    await sleep(retryAfter * 1000);
    return getJson(endpoint, attempt + 1);
  }
  if (!response.ok) {
    const hint = response.status === 401 || response.status === 403
      ? ' (API meminta autentikasi: isi QF_CLIENT_ID dan QF_CLIENT_SECRET)'
      : '';
    throw new Error(`HTTP ${response.status} untuk ${url}${hint}`);
  }
  return response.json();
}

/** Buang catatan kaki (<sup>…</sup>) dan tag HTML lain dari teks terjemahan. */
function cleanText(html) {
  return String(html ?? '')
    .replace(/<sup[^>]*>.*?<\/sup>/gis, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

const problems = [];
function check(condition, message) {
  if (!condition) problems.push(message);
  return condition;
}

async function fetchChapterVerses(chapter) {
  const verses = [];
  for (let page = 1; ; page += 1) {
    const query = new URLSearchParams({
      language: 'id',
      words: 'true',
      word_fields: 'text_uthmani',
      translations: `${TRANSLATION_ID},${TRANSLITERATION_ID}`,
      fields: 'text_uthmani',
      per_page: String(PER_PAGE),
      page: String(page)
    });
    const data = await getJson(`/verses/by_chapter/${chapter.id}?${query}`);
    verses.push(...(data.verses || []));
    const next = data.pagination?.next_page;
    if (!next) break;
  }
  return verses;
}

function buildSurah(chapter, verses, stats) {
  const where = `Surah ${chapter.id}`;
  check(verses.length === chapter.verses_count,
    `${where}: jumlah ayat ${verses.length}, seharusnya ${chapter.verses_count}`);

  const ayahs = verses.map((verse, index) => {
    const key = `${chapter.id}:${index + 1}`;
    check(verse.verse_number === index + 1 && verse.verse_key === key,
      `${where}: urutan ayat salah pada ${verse.verse_key} (diharapkan ${key})`);

    const arabic = String(verse.text_uthmani || '').trim();
    check(arabic.length > 0, `${key}: teks Arab kosong`);

    const translation = verse.translations?.find((t) => t.resource_id === TRANSLATION_ID);
    const transliteration = verse.translations?.find((t) => t.resource_id === TRANSLITERATION_ID);
    const translationText = cleanText(translation?.text);
    check(translationText.length > 0, `${key}: terjemahan Indonesia kosong`);

    const words = (verse.words || [])
      .filter((word) => word.char_type_name === 'word')
      .sort((a, b) => a.position - b.position)
      .map((word) => {
        const text = String(word.text_uthmani || word.text || '').trim();
        const wordTranslation = cleanText(word.translation?.text);
        const wordTransliteration = cleanText(word.transliteration?.text);
        check(text.length > 0, `${key} kata ${word.position}: teks Arab kosong`);
        check(wordTranslation.length > 0, `${key} kata ${word.position}: arti kata kosong`);
        if (word.translation?.language_name && word.translation.language_name !== 'indonesian') {
          stats.nonIndonesianWords += 1;
        }
        return [text, wordTransliteration, wordTranslation];
      });
    check(words.length > 0, `${key}: tidak ada kata`);

    // Gabungan kata harus sama persis dengan teks ayat utuh dari API.
    const joined = words.map(([text]) => text).join(' ').replace(/\s+/g, ' ');
    if (joined !== arabic.replace(/\s+/g, ' ')) {
      stats.joinMismatches.push(key);
    }

    stats.expectedGlobal += 1;
    check(verse.id === stats.expectedGlobal,
      `${key}: nomor ayat global ${verse.id}, seharusnya ${stats.expectedGlobal}`);
    stats.words += words.length;

    return {
      n: index + 1,
      g: verse.id,
      ar: arabic,
      tl: transliteration ? cleanText(transliteration.text) : words.map(([, t]) => t).join(' '),
      id: translationText,
      w: words
    };
  });

  return {
    number: chapter.id,
    nameArabic: chapter.name_arabic,
    nameLatin: chapter.name_simple,
    translationLatin: chapter.translated_name?.name || '',
    numberOfAyahs: chapter.verses_count,
    revelationType: chapter.revelation_place === 'madinah' ? 'Madaniyah' : 'Makkiyah',
    bismillahPre: Boolean(chapter.bismillah_pre),
    audioBase: AUDIO_BASE,
    ayahs
  };
}

async function main() {
  await authenticate();
  console.log(`Sumber: ${apiBase}`);

  const { translations = [] } = await getJson('/resources/translations?language=id');
  const resource = translations.find((t) => t.id === TRANSLATION_ID);
  if (!resource || String(resource.language_name).toLowerCase() !== 'indonesian') {
    throw new Error(`Terjemahan ${TRANSLATION_ID} bukan terjemahan bahasa Indonesia. Pilihan: ${
      translations.filter((t) => String(t.language_name).toLowerCase() === 'indonesian')
        .map((t) => `${t.id} (${t.name})`).join(', ') || '-'}`);
  }
  console.log(`Terjemahan: ${resource.name} [${resource.id}]`);

  const { chapters = [] } = await getJson('/chapters?language=id');
  chapters.sort((a, b) => a.id - b.id);
  if (chapters.length !== TOTAL_SURAHS || chapters.some((c, i) => c.id !== i + 1)) {
    throw new Error(`Daftar surah tidak lengkap: ${chapters.length} dari ${TOTAL_SURAHS}`);
  }

  // Ambil ayat (paralel terbatas), lalu susun berurutan agar nomor global bisa dicek.
  const versesByChapter = new Array(TOTAL_SURAHS);
  let cursor = 0;
  let done = 0;
  await Promise.all(Array.from({ length: CONCURRENCY }, async () => {
    while (cursor < chapters.length) {
      const chapter = chapters[cursor++];
      versesByChapter[chapter.id - 1] = await fetchChapterVerses(chapter);
      done += 1;
      if (process.stdout.isTTY) process.stdout.write(`\rMengambil ayat: ${done}/${TOTAL_SURAHS} surah`);
      else if (done % 20 === 0 || done === TOTAL_SURAHS) console.log(`Mengambil ayat: ${done}/${TOTAL_SURAHS} surah`);
    }
  }));
  if (process.stdout.isTTY) process.stdout.write('\n');

  const stats = { expectedGlobal: 0, words: 0, nonIndonesianWords: 0, joinMismatches: [] };
  const surahs = chapters.map((chapter, i) => buildSurah(chapter, versesByChapter[i], stats));
  check(stats.expectedGlobal === TOTAL_AYAHS, `Total ayat ${stats.expectedGlobal}, seharusnya ${TOTAL_AYAHS}`);

  console.log(`Total: ${surahs.length} surah, ${stats.expectedGlobal} ayat, ${stats.words} kata`);
  if (stats.nonIndonesianWords) {
    console.log(`Catatan: ${stats.nonIndonesianWords} arti kata tidak tersedia dalam bahasa Indonesia (API memakai bahasa lain).`);
  }
  if (stats.joinMismatches.length) {
    console.log(`Catatan: ${stats.joinMismatches.length} ayat berbeda antara gabungan kata dan teks ayat utuh, contoh: ${
      stats.joinMismatches.slice(0, 5).join(', ')}`);
  }

  if (problems.length) {
    console.error(`\nImpor dibatalkan, ${problems.length} masalah ditemukan:`);
    problems.slice(0, 30).forEach((p) => console.error(`  - ${p}`));
    process.exit(1);
  }

  const index = {
    source: {
      api: apiBase.includes('quran.foundation') ? 'Quran Foundation Content API v4' : 'Quran.com API v4',
      translation: { id: resource.id, name: resource.name, author: resource.author_name || '' },
      transliteration: TRANSLITERATION_ID,
      wordByWordLanguage: 'id',
      audio: 'Mishary Rashid Alafasy (cdn.islamic.network)',
      importedAt: new Date().toISOString(),
      totals: { surahs: surahs.length, ayahs: stats.expectedGlobal, words: stats.words }
    },
    surahs: surahs.map(({ ayahs, audioBase, ...meta }) => meta)
  };

  await rm(TMP_DIR, { recursive: true, force: true });
  await mkdir(path.join(TMP_DIR, 'surah'), { recursive: true });
  await writeFile(path.join(TMP_DIR, 'index.json'), `${JSON.stringify(index, null, 1)}\n`);
  for (const surah of surahs) {
    await writeFile(path.join(TMP_DIR, 'surah', `${surah.number}.json`), `${JSON.stringify(surah)}\n`);
  }
  if (existsSync(OUT_DIR)) await rm(OUT_DIR, { recursive: true, force: true });
  await rename(TMP_DIR, OUT_DIR);
  console.log(`Selesai. Data tersimpan di ${path.relative(ROOT, OUT_DIR)}/`);
}

main().catch(async (error) => {
  await rm(TMP_DIR, { recursive: true, force: true }).catch(() => {});
  console.error(`\nImpor gagal: ${error.message}`);
  process.exit(1);
});
