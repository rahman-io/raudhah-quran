/** Generate local review candidates; never bundle this file into the browser. */
import { mkdir, readdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = resolve(root, 'preview/iqro-ai');
// Order matches Iqro 1 and the recorded syllable mapping.
const letters = Array.from('ابتثجحخدذرزسشصضطظعغفقكلمنوهي');
const vowels = [
  { number: 1, name: 'Fathah', mark: 'َ', madd: 'ا' },
  { number: 2, name: 'Kasrah', mark: 'ِ', madd: 'ي' },
  { number: 3, name: 'Dammah', mark: 'ُ', madd: 'و' },
];

function arabic(letter, vowel, long) {
  if (letter === 'ا') {
    return (long ? ['آ', 'إِي', 'أُو'] : ['أَ', 'إِ', 'أُ'])[vowel.number - 1];
  }
  return letter + vowel.mark + (long ? vowel.madd : '');
}

const samples = letters.flatMap((letter, index) => vowels.flatMap((vowel) =>
  [false, true].map((long) => ({
    letter, number: index + 1, vowel: vowel.name, vowelNumber: vowel.number,
    length: long ? 'panjang' : 'pendek', harakat: long ? 2 : 1,
    arabic: arabic(letter, vowel, long),
    file: `${String(index + 1).padStart(2, '0')}-${vowel.number}-${long ? 'long' : 'short'}.wav`,
  })),
));

function reviewHtml(existing) {
  const rows = samples.map((s) => `<tr><td>${s.number} · <b dir="rtl">${s.letter}</b></td>
<td>${s.vowelNumber} · ${s.vowel}</td><td>${s.length} · ${s.harakat} harakat</td>
<td class="arabic" dir="rtl">${s.arabic}</td>
<td>${existing.has(s.file) ? `<audio controls preload="none" src="./${s.file}"></audio>` : 'Belum dibuat'}</td>
<td><select aria-label="Nilai sampel"><option value="">Belum dinilai</option><option value="sesuai">Sesuai</option><option value="ulang">Ulangi</option></select></td>
<td class="file">${s.file}</td></tr>`).join('');
  return String.raw`<!doctype html><html lang="id"><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1"><title>Penilaian suara Iqro</title>
<style>body{font:16px system-ui,sans-serif;max-width:1200px;margin:2rem auto;padding:0 1rem;color:#243b53;background:#faf9f6}
h1{margin-bottom:.4rem}p{line-height:1.5}.toolbar{display:flex;flex-wrap:wrap;gap:1rem;margin:1.5rem 0}
label{display:flex;align-items:center;gap:.4rem}select,button{padding:.5rem;border:1px solid #acb9c0;border-radius:.4rem;background:white}
.table{overflow:auto}table{border-collapse:collapse;width:100%;background:white}th,td{padding:.5rem;border:1px solid #dce2e6;text-align:left;white-space:nowrap}
th{position:sticky;top:0;background:#eaf2ef}.arabic{font-size:2rem;text-align:center}audio{width:210px}.file{font:12px monospace}
</style><h1>Penilaian suara Iqro</h1>
<p>28 huruf × 3 harakat (1 Fathah, 2 Kasrah, 3 Dammah) × pendek (1 harakat) / panjang (2 harakat) = 168 kandidat.
Dengarkan makhraj dan panjangnya. Unduh CSV setelah menilai; pilihan nilai di halaman tidak disimpan otomatis.</p>
<div class="toolbar"><label>Harakat <select id="vowel"><option value="">Semua</option><option>Fathah</option><option>Kasrah</option><option>Dammah</option></select></label>
<label>Bacaan <select id="length"><option value="">Semua</option><option>pendek</option><option>panjang</option></select></label>
<button id="export" type="button">Unduh hasil penilaian CSV</button></div>
<div class="table"><table><thead><tr><th>Huruf</th><th>Harakat</th><th>Bacaan</th><th>Arab</th><th>Audio</th><th>Nilai</th><th>File</th></tr></thead><tbody>${rows}</tbody></table></div>
<script>
const rows=[...document.querySelectorAll('tbody tr')];
const vowel=document.getElementById('vowel'),length=document.getElementById('length');
function filter(){for(const row of rows)row.hidden=Boolean((vowel.value&&!row.cells[1].textContent.includes(vowel.value))||(length.value&&!row.cells[2].textContent.includes(length.value)))}
vowel.onchange=filter;length.onchange=filter;
document.getElementById('export').onclick=()=>{
 const quote=value=>'"'+String(value).replaceAll('"','""')+'"';
 const data=[['huruf','harakat','panjang','arab','file','nilai'],...rows.map(row=>[
 row.cells[0].textContent.trim(),row.cells[1].textContent.trim(),row.cells[2].textContent.trim(),
 row.cells[3].textContent.trim(),row.cells[6].textContent.trim(),row.querySelector('select').value])];
 const blob=new Blob(['\ufeff'+data.map(line=>line.map(quote).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8'});
 const link=document.createElement('a');link.href=URL.createObjectURL(blob);link.download='penilaian-iqro.csv';link.click();
 setTimeout(()=>URL.revokeObjectURL(link.href),5000);
};
</script></html>`;
}

const args = process.argv.slice(2);
const indexOnly = args.length === 1 && args[0] === '--index-only';
const limit = args.length === 0 ? 12 :
  args.length === 2 && args[0] === '--limit' && /^\d+$/.test(args[1]) ? Number(args[1]) : NaN;

if (!indexOnly && (!Number.isSafeInteger(limit) || limit < 1 || limit > 24)) {
  console.error('Gunakan --index-only atau --limit 1..24 (default 12).');
  process.exitCode = 1;
} else {
  dotenv.config({ path: resolve(root, '.env'), quiet: true });
  const key = process.env.GEMINI_API_KEY;
  if (!indexOnly && !key) {
    console.error('GEMINI_API_KEY belum tersedia. Lihat scripts/iqro_voice_preview.md.');
    process.exitCode = 1;
  } else {
    await mkdir(output, { recursive: true, mode: 0o700 });
    await writeFile(resolve(output, 'manifest.json'), JSON.stringify(samples, null, 2), { mode: 0o600 });
    const existing = new Set(await readdir(output));
    if (!indexOnly) {
      const client = new GoogleGenAI({ apiKey: key });
      let generated = 0;
      for (const sample of samples) {
        if (existing.has(sample.file) || generated >= limit) continue;
        try {
          const result = await client.interactions.create({
            model: 'gemini-3.8-flash-lite-tts',
            input: [{ type: 'user_input', content: [{
              type: 'text', text: sample.arabic,
              annotations: [{
                type: 'speech_metadata',
                style: sample.harakat === 2
                  ? 'Clear Arabic pronunciation, extend the vowel for two harakat, natural teaching pace'
                  : 'Clear Arabic pronunciation, short unextended vowel, natural teaching pace',
              }],
            }] }],
            response_format: { type: 'audio', mime_type: 'audio/wav' },
            generation_config: { speech_config: [{ voice: 'Orus' }] },
          });
          if (!result.output_audio?.data) throw new Error('empty audio');
          const wav = Buffer.from(result.output_audio.data, 'base64');
          if (wav.length < 44 || wav.toString('ascii', 0, 4) !== 'RIFF' ||
              wav.toString('ascii', 8, 12) !== 'WAVE') throw new Error('invalid WAV');
          await writeFile(resolve(output, sample.file), wav, { flag: 'wx', mode: 0o600 });
          existing.add(sample.file);
          generated++;
          console.log(`${samples.filter(({ file }) => existing.has(file)).length}/168 · ${sample.arabic} · ${sample.length}: ${sample.file}`);
          if (generated < limit) await new Promise((done) => setTimeout(done, 1500));
        } catch (error) {
          // SDK error bodies can contain request data. Print only the safe status.
          const status = typeof error?.status === 'number' ? ` (HTTP ${error.status})` : '';
          console.error(`Berhenti pada ${sample.file}${status}. Periksa kuota atau kunci; jalankan lagi untuk melanjutkan.`);
          process.exitCode = 1;
          break;
        }
      }
      console.log(`Tersedia ${samples.filter(({ file }) => existing.has(file)).length}/168 sampel. Jalankan lagi untuk melanjutkan.`);
    }
    await writeFile(resolve(output, 'index.html'), reviewHtml(existing), { mode: 0o600 });
    console.log('Buka preview/iqro-ai/index.html untuk mendengar dan menilai sampel.');
  }
}
