#!/usr/bin/env node
/**
 * Impor "Info Surah" (latar belakang turunnya surah, makna nama, periode, dan tema)
 * dari Quran.com API (Quran Foundation, endpoint Chapter Info) untuk 114 surah.
 * Teks tidak ditulis manual: diambil apa adanya dari API, lalu tag HTML-nya disaring.
 *
 * Pemakaian (perlu Node 18+ dan koneksi internet):
 *   node scripts/import-surah-info.mjs
 *
 * Opsi lingkungan:
 *   SURAH_INFO_LANGUAGE   Bahasa yang diminta (bawaan: id). Bila tidak tersedia,
 *                         API memakai bahasa cadangan; skrip melaporkannya.
 *   QURAN_API_BASE        URL dasar API (bawaan https://api.quran.com/api/v4)
 *   QF_CLIENT_ID + QF_CLIENT_SECRET  Kredensial Quran Foundation bila diperlukan.
 *
 * Keluaran:
 *   public/surah-info/index.json  ringkasan singkat ke-114 surah (untuk daftar surah)
 *   public/surah-info/{1..114}.json  teks lengkap per surah
 * Bila satu pemeriksaan gagal, tidak ada berkas yang diubah.
 */
import { mkdir, rm, rename, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = path.join(ROOT, 'public', 'surah-info');
const TMP_DIR = path.join(ROOT, 'public', '.surah-info-import-tmp');
const LANGUAGE = process.env.SURAH_INFO_LANGUAGE || 'id';
const TOTAL_SURAHS = 114;
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

const ALLOWED_TAGS = new Set(['p', 'h2', 'h3', 'h4', 'strong', 'b', 'em', 'i', 'ul', 'ol', 'li', 'br', 'blockquote', 'sup', 'sub']);

/** Saring HTML: hanya tag dasar tanpa atribut; skrip/gaya/tautan dibuang. */
function sanitizeHtml(html) {
  return String(html ?? '')
    .replace(/<(script|style|iframe|object|embed)[^>]*>[\s\S]*?<\/\1>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<\/?([a-zA-Z0-9]+)(\s[^>]*)?>/g, (tag, name) => {
      const lower = name.toLowerCase();
      if (!ALLOWED_TAGS.has(lower)) return '';
      if (lower === 'h2' || lower === 'h3') return tag.startsWith('</') ? '</h4>' : '<h4>';
      return tag.startsWith('</') ? `</${lower}>` : `<${lower}>`;
    })
    .replace(/\s+/g, ' ')
    .replace(/<p>\s*<\/p>/g, '')
    .trim();
}

const plainText = (html) => String(html ?? '')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;/g, ' ')
  .replace(/&quot;/g, '"')
  .replace(/&#39;|&apos;/g, "'")
  .replace(/&amp;/g, '&')
  .replace(/\s+/g, ' ')
  .trim();

async function main() {
  await authenticate();
  console.log(`Sumber: ${apiBase} · bahasa diminta: ${LANGUAGE}`);

  const infos = new Array(TOTAL_SURAHS);
  let cursor = 1;
  let done = 0;
  await Promise.all(Array.from({ length: CONCURRENCY }, async () => {
    while (cursor <= TOTAL_SURAHS) {
      const number = cursor++;
      const data = await getJson(`/chapters/${number}/info?language=${encodeURIComponent(LANGUAGE)}`);
      infos[number - 1] = { number, info: data.chapter_info };
      done += 1;
      if (done % 20 === 0 || done === TOTAL_SURAHS) console.log(`Mengambil info surah: ${done}/${TOTAL_SURAHS}`);
    }
  }));

  const problems = [];
  const languages = new Map();
  const sources = new Map();
  const surahs = infos.map(({ number, info }) => {
    if (!info) {
      problems.push(`Surah ${number}: info tidak tersedia`);
      return null;
    }
    const html = sanitizeHtml(info.text);
    const summary = plainText(info.short_text) || plainText(html).split(/(?<=[.!?])\s/).slice(0, 2).join(' ');
    if (!plainText(html)) problems.push(`Surah ${number}: teks info kosong`);
    if (!summary) problems.push(`Surah ${number}: ringkasan kosong`);
    if (info.chapter_id !== undefined && Number(info.chapter_id) !== number) {
      problems.push(`Surah ${number}: API mengembalikan info surah ${info.chapter_id}`);
    }
    const language = String(info.language_name || '').toLowerCase() || 'unknown';
    const source = String(info.source || '').trim();
    if (!source) problems.push(`Surah ${number}: nama sumber kosong`);
    languages.set(language, (languages.get(language) ?? 0) + 1);
    sources.set(source, (sources.get(source) ?? 0) + 1);
    return { number, language, source, summary, html };
  });

  console.log('Bahasa yang diterima:', Object.fromEntries(languages));
  console.log('Sumber:', Object.fromEntries(sources));

  if (problems.length) {
    console.error(`\nImpor dibatalkan, ${problems.length} masalah ditemukan:`);
    problems.slice(0, 30).forEach((p) => console.error(`  - ${p}`));
    process.exit(1);
  }

  await rm(TMP_DIR, { recursive: true, force: true });
  await mkdir(TMP_DIR, { recursive: true });
  const index = {
    api: apiBase.includes('quran.foundation') ? 'Quran Foundation Content API v4' : 'Quran.com API v4',
    requestedLanguage: LANGUAGE,
    importedAt: new Date().toISOString(),
    surahs: surahs.map(({ number, language, source, summary }) => ({ number, language, source, summary }))
  };
  await writeFile(path.join(TMP_DIR, 'index.json'), `${JSON.stringify(index, null, 1)}\n`);
  for (const surah of surahs) {
    await writeFile(path.join(TMP_DIR, `${surah.number}.json`), `${JSON.stringify(surah)}\n`);
  }
  if (existsSync(OUT_DIR)) await rm(OUT_DIR, { recursive: true, force: true });
  await rename(TMP_DIR, OUT_DIR);
  console.log(`Selesai. Info 114 surah tersimpan di ${path.relative(ROOT, OUT_DIR)}/`);
  if (!languages.has('indonesian')) {
    console.log('Catatan: API tidak menyediakan info surah berbahasa Indonesia; yang tersimpan memakai bahasa di atas.');
  }
}

main().catch(async (error) => {
  await rm(TMP_DIR, { recursive: true, force: true }).catch(() => {});
  console.error(`\nImpor gagal: ${error.message}`);
  process.exit(1);
});
