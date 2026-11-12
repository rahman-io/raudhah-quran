import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Music2, Volume2 } from 'lucide-react';
import { useQuranGame } from '../../../context/QuranGameContext';
import type { Ayah } from '../../../types/quran';
import { sounds } from '../../../utils/soundEffects';
import type { ReaderAyah } from '../../../services/quranReaderData';
import { cleanWord, shuffle, splitIntoSegments, type HafalanContext } from '../hafalanPlan';
import { RoundDone, StageHeader, arabicSize } from '../StageParts';

interface Option { key: string; text: string; correct: boolean }
interface AudioRound { kind: 'audio' | 'segment'; promptAyah?: ReaderAyah; promptText?: string; title: string; options: Option[] }

const textOf = (words: { arabic: string }[]) => words.map((w) => w.arabic).join(' ');
const normalized = (text: string) => cleanWord(text);

/** Potong teks pilihan seperlunya sampai semua pilihan bisa dibedakan. */
function distinctPrefixes(texts: string[]): string[] {
  const split = texts.map((t) => t.split(' '));
  const longest = Math.max(...split.map((s) => s.length));
  for (let n = Math.min(8, longest); n <= longest; n++) {
    const prefixes = split.map((s) => normalized(s.slice(0, n).join(' ')));
    if (new Set(prefixes).size === texts.length) {
      return split.map((s) => (s.length > n ? `${s.slice(0, n).join(' ')} …` : s.join(' ')));
    }
  }
  return texts;
}

function buildRounds(ctx: HafalanContext): AudioRound[] {
  const { surah, ayah, ayahIndex, segments } = ctx;
  const current = textOf(ayah.words);
  const prompt = ayahIndex > 0 ? surah.ayahs[ayahIndex - 1] : ayah;
  const others = shuffle(surah.ayahs.filter((a) =>
    a.id !== ayah.id && a.id !== prompt.id && normalized(textOf(a.words)) !== normalized(current)));
  const picks: ReaderAyah[] = [];
  for (const other of others) {
    if (!picks.some((p) => normalized(textOf(p.words)) === normalized(textOf(other.words)))) picks.push(other);
    if (picks.length === 2) break;
  }
  const audioTexts = [current, ...picks.map((p) => textOf(p.words))];
  const shown = distinctPrefixes(audioTexts);
  const rounds: AudioRound[] = [{
    kind: 'audio',
    promptAyah: prompt,
    title: ayahIndex > 0
      ? `Dengarkan ayat ${prompt.ayahNumber}, lalu pilih ayat yang menyambungnya.`
      : 'Dengarkan ayat ini, lalu pilih teks yang sesuai dengan bacaan.',
    options: shuffle(shown.map((text, i) => ({ key: `a${i}`, text, correct: i === 0 })))
  }];

  // Ayat panjang: sambungkan tiap bagian dengan bagian sesudahnya.
  if (segments.length > 1) {
    const foreign = surah.ayahs
      .filter((a) => a.id !== ayah.id)
      .flatMap((a) => splitIntoSegments(a.words).map(textOf));
    segments.slice(0, -1).forEach((segment, i) => {
      const answer = textOf(segments[i + 1]);
      const candidates = [
        ...shuffle(segments.filter((_, j) => j !== i && j !== i + 1).map(textOf)),
        ...shuffle(foreign)
      ];
      const distractors: string[] = [];
      for (const text of candidates) {
        const n = normalized(text);
        if (n !== normalized(answer) && !distractors.some((d) => normalized(d) === n)) distractors.push(text);
        if (distractors.length === 2) break;
      }
      rounds.push({
        kind: 'segment',
        promptText: textOf(segment),
        title: 'Apa lanjutan dari potongan ayat ini?',
        options: shuffle([answer, ...distractors].map((text, k) => ({ key: `s${i}_${k}`, text, correct: k === 0 })))
      });
    });
  }
  return rounds;
}

export const AudioStage: React.FC<{ ctx: HafalanContext; onPass: () => void }> = ({ ctx, onPass }) => {
  const { fontSize, playMurottal, isPlayingAudio, currentPlayingAyahId } = useQuranGame();
  const rounds = useMemo(() => buildRounds(ctx), [ctx]);
  const [round, setRound] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [solved, setSolved] = useState(false);

  const r = rounds[round];
  const isLast = round === rounds.length - 1;

  useEffect(() => {
    setPicked(null);
    setSolved(false);
    if (r.kind === 'audio' && r.promptAyah) playMurottal(r.promptAyah as Ayah);
  }, [round]);

  const choose = (option: Option) => {
    if (solved) return;
    setPicked(option.key);
    if (option.correct) {
      setSolved(true);
      sounds.playCorrectDing();
    } else {
      sounds.playGentleRetry();
    }
  };

  const promptPlaying = r.promptAyah && isPlayingAudio && currentPlayingAyahId === r.promptAyah.id;

  return (
    <div className="space-y-5">
      <StageHeader
        title="Sambung Audio"
        description="Latih sambungan hafalan: dari ayat sebelumnya ke ayat ini, dan antar bagian ayat."
        round={round}
        rounds={rounds.length}
        roundLabel="Soal"
        listenAyah={r.kind === 'segment' ? ctx.ayah : undefined}
      />

      <div className="bg-gradient-to-b from-[#F8F6F1] to-[#F1EDE6] dark:from-[#102731] dark:to-[#152E38] rounded-3xl p-5 sm:p-7 border border-[#BE9452]/40 text-center space-y-4">
        <p className="text-sm font-semibold text-[#293640] dark:text-white">{r.title}</p>
        {r.kind === 'audio' && r.promptAyah && (
          <button
            type="button"
            onClick={() => playMurottal(r.promptAyah as Ayah)}
            className={`inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-semibold transition-colors ${
              promptPlaying ? 'bg-[#D3A253] text-[#173B4E]' : 'bg-[#246579] hover:bg-[#174C60] text-white'
            }`}
          >
            {promptPlaying ? <Music2 className="w-5 h-5 animate-pulse" /> : <Volume2 className="w-5 h-5" />}
            <span>{promptPlaying ? 'Sedang diputar…' : `Putar ayat ${r.promptAyah.ayahNumber}`}</span>
          </button>
        )}
        {r.kind === 'segment' && (
          <p dir="rtl" className="font-arabic text-[#173B4E] dark:text-[#D3A253]" style={{ fontSize: arabicSize(fontSize, 0.9, 24) }}>
            {r.promptText} …
          </p>
        )}
      </div>

      <div className="grid gap-3">
        {r.options.map((option) => {
          const chosen = picked === option.key;
          return (
            <button
              key={option.key}
              type="button"
              onClick={() => choose(option)}
              className={`p-4 rounded-2xl border text-right transition-colors ${
                solved && option.correct
                  ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/40'
                  : chosen
                  ? 'border-red-300 bg-red-50 dark:bg-red-950/40'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-[#477F8D]'
              }`}
            >
              <span dir="rtl" className="font-arabic block leading-loose text-[#173B4E] dark:text-[#F1F5F9]" style={{ fontSize: arabicSize(fontSize, 0.75, 22) }}>
                {option.text}
              </span>
              {solved && option.correct && <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-1" />}
            </button>
          );
        })}
      </div>
      {picked && !solved && <p className="text-center text-xs text-red-700 dark:text-red-300">Belum tepat, dengarkan dan coba lagi.</p>}

      {solved && (
        <RoundDone
          title={isLast ? 'Sambungan hafalanmu sudah kuat!' : 'Tepat!'}
          actionLabel={isLast ? 'Selesai' : 'Soal berikutnya'}
          onContinue={() => (isLast ? onPass() : setRound(round + 1))}
        />
      )}
    </div>
  );
};
