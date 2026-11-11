import { readdir, stat } from 'node:fs/promises';
import { join, relative } from 'node:path';

// Run with `node --import tsx scripts/firebase-export.mjs` to inspect first.
import { SURAHS_DATA, INITIAL_BADGES, INITIAL_PLANTS_CATALOG } from '../src/data/quranData.ts';
import { IQRO_LEVELS } from '../src/data/iqroData.ts';
import { iqro1PagesFromBook } from '../src/data/iqro1PdfContent.ts';
import { iqro2PagesFromBook } from '../src/data/iqro2PdfContent.ts';
import { TAJWID_RULES } from '../src/data/tajwidData.ts';

const apply = process.argv.includes('--apply');
const withMedia = process.argv.includes('--with-media');
const entries = [];

for (const surah of SURAHS_DATA) entries.push([`surahs/${surah.number}`, surah]);
for (const level of IQRO_LEVELS) {
  const { pages, ...metadata } = level;
  entries.push([`iqroLevels/${level.level}`, metadata]);
  const bookPages = level.level === 1 ? iqro1PagesFromBook(pages)
    : level.level === 2 ? iqro2PagesFromBook(pages) : pages;
  for (const page of bookPages) entries.push([`iqroLevels/${level.level}/pages/${page.pageNumber}`, page]);
}
for (const rule of TAJWID_RULES) entries.push([`tajwidRules/${rule.id}`, rule]);
for (const badge of INITIAL_BADGES) entries.push([`badges/${badge.id}`, badge]);
for (const plant of INITIAL_PLANTS_CATALOG) entries.push([`plants/${plant.type}`, plant]);

const assets = [];
const publicDir = new URL('../public/', import.meta.url).pathname;
async function discover(dir) {
  for (const item of await readdir(dir, { withFileTypes: true })) {
    const file = join(dir, item.name);
    if (item.isDirectory()) await discover(file);
    else if (/\.(mp3|m4a|ogg|wav|png|jpe?g|webp|gif|svg)$/i.test(item.name)) {
      const path = relative(publicDir, file).split('\\').join('/');
      assets.push({ file, path, bytes: (await stat(file)).size });
    }
  }
}
await discover(publicDir);
for (const { path, bytes } of assets) {
  const id = Buffer.from(path).toString('base64url');
  entries.push([`media/${id}`, { path, storagePath: `public/${path}`, bytes }]);
}

const oversized = entries.filter(([path, document]) => {
  const bytes = Buffer.byteLength(JSON.stringify(document));
  if (bytes > 900_000) {
    console.error(`${path}: ${bytes} bytes exceeds safe Firestore document size`);
    return true;
  }
  return false;
});
if (oversized.length) process.exit(1);

console.log(JSON.stringify({
  mode: apply ? 'UPLOAD' : 'DRY RUN — no cloud writes',
  projectId: process.env.FIREBASE_PROJECT_ID || '(not set)',
  documents: entries.length,
  surahs: SURAHS_DATA.length,
  iqroPages: entries.filter(([path]) => path.includes('/pages/')).length,
  tajwidRules: TAJWID_RULES.length,
  mediaFiles: assets.length,
  mediaBytes: assets.reduce((sum, asset) => sum + asset.bytes, 0),
  uploadMedia: withMedia
}, null, 2));

if (!apply) process.exit(0);

const projectId = process.env.FIREBASE_PROJECT_ID;
if (!projectId) throw new Error('Set FIREBASE_PROJECT_ID sebelum --apply.');
if (withMedia && !process.env.FIREBASE_STORAGE_BUCKET) {
  throw new Error('Set FIREBASE_STORAGE_BUCKET untuk --with-media.');
}

const { initializeApp, applicationDefault, getApps } = await import('firebase-admin/app');
const { getFirestore } = await import('firebase-admin/firestore');
const { getStorage } = await import('firebase-admin/storage');
const app = getApps()[0] || initializeApp({
  credential: applicationDefault(),
  projectId,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET
});
const database = getFirestore(app);

// Small batches make retrying a failed import safe; each document has a stable ID.
for (let index = 0; index < entries.length; index += 200) {
  const batch = database.batch();
  for (const [path, data] of entries.slice(index, index + 200)) batch.set(database.doc(path), data);
  await batch.commit();
  console.log(`Dokumen ${Math.min(index + 200, entries.length)}/${entries.length}`);
}

if (withMedia) {
  const bucket = getStorage(app).bucket();
  for (const [index, asset] of assets.entries()) {
    const remote = bucket.file(`public/${asset.path}`);
    const [exists] = await remote.exists();
    if (!exists) await bucket.upload(asset.file, { destination: remote.name, resumable: asset.bytes > 5_000_000 });
    if ((index + 1) % 25 === 0 || index + 1 === assets.length) {
      console.log(`Media ${index + 1}/${assets.length}`);
    }
  }
}
