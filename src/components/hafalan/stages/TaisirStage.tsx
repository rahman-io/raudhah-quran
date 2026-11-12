import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { BookOpenCheck, Eye, KeyRound, ListOrdered, Shuffle } from 'lucide-react';
import { useQuranGame } from '../../../context/QuranGameContext';
import { sounds } from '../../../utils/soundEffects';
import { loadKemenagSurah, splitKemenagWords, type ReaderAyah } from '../../../services/quranReaderData';
import { cleanWord, getCompletedStages, shuffle, type HafalanContext } from '../hafalanPlan';
import { RoundDone, StageHeader, arabicSize } from '../StageParts';

/**
 * Game "Kunci Ayat", diadaptasi dari Metode At-Taisir (Ustadz Adi Hidayat):
 *  1. Pahami dulu: baca ayat bersama terjemahnya sambil mendengarkan murottal.
 *  2. Kata kunci: hanya kata pertama ayat (merah) yang tampil; sambung ayatnya, lalu cek sendiri.
 *  3. Urutan: kenali kata pertama ayat sesudah/sebelumnya.
 *  4. Kolom muraja'ah acak: kata kunci ayat lain yang pernah dilatih, sebutkan nomornya.
 */

type Phase = 'read' | 'recall' | 'order' | 'random' | 'finish';
type Rating = 'lancar' | 'ragu' | 'lupa';

const PHASES: { id: Exclude<Phase, 'finish'>; label: string; icon: React.ElementType }[] = [
  { id: 'read', label: 'Pahami', icon: BookOpenCheck },
  { id: 'recall', label: 'Kata Kunci', icon: KeyRound },
  { id: 'order', label: 'Urutan', icon: ListOrdered },
  { id: 'random', label: 'Acak', icon: Shuffle }
];

const KEY_COLOR = 'text-[#C0392B] dark:text-[#F87171]';
const RANDOM_COUNT = 3;

interface AyahText {
  words: string[];
  /** true bila teks Mushaf Standar Indonesia (Kemenag) yang dipakai. */
  msi: boolean;
}

export const TaisirStage: React.FC<{ ctx: HafalanContext; onPass: () => void }> = ({ ctx, onPass }) => {
  const { fontSize, memorizedAyahIds } = useQuranGame();
  const { surah, ayah, ayahIndex, segments } = ctx;

  // Teks Kemenag (bila sudah diimpor) agar sama dengan tampilan Baca & Tadabbur.
  const [msiText, setMsiText] = useState<Map<number, string> | null>(null);
  useEffect(() => {
    let cancelled = false;
    loadKemenagSurah(surah.number).then((text) => {
      if (!cancelled) setMsiText(text);
    });
    return () => {
      cancelled = true;
    };
  }, [surah.number]);

  /** Kata-kata satu ayat; teks Kemenag dipakai bila pembagian katanya sama. */
  const textOf = (target: ReaderAyah): AyahText => {
    const msi = msiText?.get(target.ayahNumber);
    const msiWords = msi ? splitKemenagWords(msi) : null;
    if (msiWords && msiWords.length === target.words.length) return { words: msiWords, msi: true };
    return { words: target.words.map((w) => w.arabic), msi: false };
  };
  const fontClass = (text: AyahText) => (text.msi ? 'font-mushaf-id' : 'font-arabic');
  const keyOf = (target: ReaderAyah) => textOf(target).words[0] ?? '';

  const current = textOf(ayah);
  // Potongan ayat panjang (indeks kata) untuk dibuka bertahap.
  const segmentRanges = useMemo(() => {
    let start = 0;
    return segments.map((segment) => {
      const range = [start, start + segment.length] as const;
      start += segment.length;
      return range;
    });
  }, [segments]);

  const [phase, setPhase] = useState<Phase>('read');
  const [note, setNote] = useState<string | null>(null);

  /* ---------------- Langkah 2: kata kunci ---------------- */
  const [revealed, setRevealed] = useState(0); // jumlah potongan yang sudah dibuka

  const rateRecall = (rating: Rating) => {
    if (rating === 'lancar') {
      sounds.playAyahComplete();
      setNote(null);
      setPhase(orderQuestion ? 'order' : 'random');
      return;
    }
    sounds.playGentleRetry();
    setRevealed(0);
    if (rating === 'ragu') {
      setNote('Ulangi sekali lagi dari kata kunci sampai lancar.');
    } else {
      setNote('Tidak apa-apa. Baca dan dengarkan lagi bersama terjemahnya, lalu coba lagi.');
      setPhase('read');
    }
  };

  /* ---------------- Langkah 3: urutan ayat ---------------- */
  const orderQuestion = useMemo(() => {
    const hasNext = ayahIndex < surah.ayahs.length - 1;
    const target = surah.ayahs[hasNext ? ayahIndex + 1 : ayahIndex - 1];
    if (!target) return null;
    const answer = keyOf(target);
    const seen = new Set([cleanWord(answer), cleanWord(keyOf(ayah))]);
    const distractors: string[] = [];
    shuffle(surah.ayahs.filter((a) => a.id !== target.id && a.id !== ayah.id)).forEach((a) => {
      const key = keyOf(a);
      if (distractors.length < 3 && key && !seen.has(cleanWord(key))) {
        seen.add(cleanWord(key));
        distractors.push(key);
      }
    });
    if (!distractors.length) return null;
    return {
      direction: hasNext ? 'sesudah' : 'sebelum',
      target,
      answer,
      msi: textOf(target).msi,
      options: shuffle([answer, ...distractors])
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [surah, ayah, ayahIndex, msiText]);
  const [orderPick, setOrderPick] = useState<string | null>(null);
  const orderSolved = !!orderQuestion && orderPick === orderQuestion.answer;

  const pickOrder = (option: string) => {
    if (orderSolved) return;
    setOrderPick(option);
    if (option === orderQuestion?.answer) sounds.playCorrectDing();
    else sounds.playGentleRetry();
  };

  /* ---------------- Langkah 4: kolom muraja'ah acak ---------------- */
  const randomAyahs = useMemo(() => {
    const practised = surah.ayahs.filter((a) =>
      a.id !== ayah.id && (memorizedAyahIds.includes(a.id) || getCompletedStages(a.id).length > 0));
    return shuffle(practised).slice(0, RANDOM_COUNT).map((target) => {
      const total = surah.ayahs.length;
      const numbers = new Set<number>([target.ayahNumber]);
      const near = shuffle([-3, -2, -1, 1, 2, 3, 4, -4]).map((d) => target.ayahNumber + d).filter((n) => n >= 1 && n <= total);
      near.forEach((n) => numbers.size < 4 && numbers.add(n));
      return { target, options: [...numbers].sort((a, b) => a - b) };
    });
    // Daftar ditetapkan sekali saat game dibuka.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [randomIndex, setRandomIndex] = useState(0);
  const [numberPick, setNumberPick] = useState<number | null>(null);
  const [randomRevealed, setRandomRevealed] = useState(false);
  const [randomRatings, setRandomRatings] = useState<Rating[]>([]);
  const randomItem = randomAyahs[randomIndex];
  const numberSolved = !!randomItem && numberPick === randomItem.target.ayahNumber;

  const pickNumber = (n: number) => {
    if (numberSolved) return;
    setNumberPick(n);
    if (n === randomItem?.target.ayahNumber) sounds.playCorrectDing();
    else sounds.playGentleRetry();
  };

  const rateRandom = (rating: Rating) => {
    sounds.playWordClick();
    const ratings = [...randomRatings, rating];
    setRandomRatings(ratings);
    setNumberPick(null);
    setRandomRevealed(false);
    if (randomIndex + 1 < randomAyahs.length) setRandomIndex(randomIndex + 1);
    else setPhase('finish');
  };

  const goToRandom = () => {
    sounds.playWordClick();
    setPhase(randomAyahs.length ? 'random' : 'finish');
  };

  /* ---------------- Tampilan ---------------- */
  const phaseIndex = phase === 'finish' ? PHASES.length : PHASES.findIndex((p) => p.id === phase);
  const sizeMain = arabicSize(fontSize, 1, 26);
  const allRevealed = revealed >= segmentRanges.length;
  const toReview = randomRatings.filter((r) => r !== 'lancar').length;

  return (
    <div className="space-y-5">
      <StageHeader
        title="Kunci Ayat (Metode At-Taisir)"
        description="Pahami dulu, lalu ingat ayat hanya dari kata pertamanya, seperti kolom muraja'ah At-Taisir."
        listenAyah={ayah}
      />

      {/* Penanda langkah */}
      <ol className="grid grid-cols-4 gap-1.5" aria-label="Langkah game">
        {PHASES.map((p, i) => {
          const Icon = p.icon;
          const state = i < phaseIndex ? 'done' : i === phaseIndex ? 'active' : 'todo';
          return (
            <li
              key={p.id}
              aria-current={state === 'active' ? 'step' : undefined}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1 px-1.5 py-2 rounded-xl text-[10px] sm:text-[11px] font-semibold text-center ${
                state === 'active'
                  ? 'bg-[#246579] text-white'
                  : state === 'done'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                    : 'bg-white/70 dark:bg-slate-800/60 text-slate-400 dark:text-slate-500'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{i + 1}. {p.label}</span>
            </li>
          );
        })}
      </ol>

      {note && <p className="text-center text-xs text-amber-700 dark:text-amber-300">{note}</p>}

      {/* 1. Pahami dulu */}
      {phase === 'read' && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="bg-gradient-to-b from-[#F8F6F1] to-[#F1EDE6] dark:from-[#102731] dark:to-[#152E38] rounded-3xl p-5 sm:p-7 border border-[#BE9452]/40 grid sm:grid-cols-[1fr_1.1fr] gap-4 sm:gap-6 items-center">
            <p className="order-2 sm:order-1 text-sm leading-relaxed text-[#293640] dark:text-[#CBD5E1]">
              <span className="block text-[11px] font-semibold uppercase tracking-wider text-[#477F8D] mb-1">Terjemah</span>
              "{ayah.translationId}"
            </p>
            <p dir="rtl" className={`order-1 sm:order-2 text-right leading-[2.2] text-[#173B4E] dark:text-[#E9CF99] ${fontClass(current)}`} style={{ fontSize: sizeMain }}>
              {current.words.map((word, i) => (
                <span key={i} className={i === 0 ? KEY_COLOR : undefined}>{word}{' '}</span>
              ))}
            </p>
          </div>
          <div className="bg-white/70 dark:bg-slate-800/60 p-4 rounded-3xl border border-slate-200 dark:border-slate-700 text-center space-y-3">
            <p className="text-xs text-[#246579] dark:text-[#94A3B8]">
              Tekan <b>Dengar</b> dan baca ayat bersama terjemahnya beberapa kali. Perhatikan <b className={KEY_COLOR}>kata pertama</b>: itulah kunci ayat ini.
            </p>
            <button
              type="button"
              onClick={() => {
                sounds.playWordClick();
                setNote(null);
                setRevealed(0);
                setPhase('recall');
              }}
              className="px-5 py-2 bg-[#246579] hover:bg-[#174C60] text-white rounded-xl text-xs font-semibold"
            >
              Sudah paham, uji dengan kata kunci
            </button>
          </div>
        </motion.div>
      )}

      {/* 2. Kata kunci */}
      {phase === 'recall' && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="bg-gradient-to-b from-[#F8F6F1] to-[#F1EDE6] dark:from-[#102731] dark:to-[#152E38] rounded-3xl p-5 sm:p-7 border border-[#BE9452]/40 text-center">
            <p className="text-xs text-[#477F8D] mb-2">
              {revealed === 0 ? 'Sambung ayat ini dari ingatan, dalam hati atau dengan suara.' : 'Cocokkan dengan bacaanmu.'}
            </p>
            <p dir="rtl" className={`leading-[2.2] text-[#173B4E] dark:text-[#E9CF99] ${fontClass(current)}`} style={{ fontSize: sizeMain }}>
              {current.words.slice(0, revealed > 0 ? segmentRanges[revealed - 1][1] : 1).map((word, i) => (
                <span key={i} className={i === 0 ? KEY_COLOR : undefined}>{word}{' '}</span>
              ))}
              {!allRevealed && (
                <span dir="ltr" className="inline-block align-middle mx-1 px-3 rounded-lg bg-slate-300/40 dark:bg-slate-700/50 text-slate-400 select-none font-sans text-sm" aria-label="bagian yang belum dibuka">
                  •••{segmentRanges.length > 1 && ` ${segmentRanges.length - revealed} bagian lagi`}
                </span>
              )}
            </p>
          </div>

          <div className="bg-white/70 dark:bg-slate-800/60 p-4 rounded-3xl border border-slate-200 dark:border-slate-700 text-center space-y-3">
            {!allRevealed ? (
              <button
                type="button"
                onClick={() => {
                  sounds.playWordClick();
                  setRevealed(revealed + 1);
                }}
                className="inline-flex items-center gap-1.5 px-5 py-2 bg-[#246579] hover:bg-[#174C60] text-white rounded-xl text-xs font-semibold"
              >
                <Eye className="w-4 h-4" />
                {segmentRanges.length > 1 ? `Buka bagian ${revealed + 1} dari ${segmentRanges.length}` : 'Buka ayat untuk memeriksa'}
              </button>
            ) : (
              <>
                <p className="text-xs font-semibold text-[#293640] dark:text-[#CBD5E1]">Bagaimana bacaanmu tadi?</p>
                <div className="flex flex-wrap justify-center gap-2">
                  <button type="button" onClick={() => rateRecall('lupa')} className="px-4 py-2 text-xs font-semibold rounded-xl border border-red-300 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/40">
                    🔴 Lupa
                  </button>
                  <button type="button" onClick={() => rateRecall('ragu')} className="px-4 py-2 text-xs font-semibold rounded-xl border border-amber-300 text-amber-800 dark:text-amber-200 hover:bg-amber-50 dark:hover:bg-amber-950/40">
                    🟡 Ragu
                  </button>
                  <button type="button" onClick={() => rateRecall('lancar')} className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#246579] hover:bg-[#174C60] text-white">
                    🟢 Lancar
                  </button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      )}

      {/* 3. Urutan ayat */}
      {phase === 'order' && orderQuestion && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="bg-white/70 dark:bg-slate-800/60 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 text-center space-y-4">
            <p className="text-sm font-semibold text-[#173B4E] dark:text-white">
              Ayat {orderQuestion.direction === 'sesudah' ? 'sesudahnya' : 'sebelumnya'} (ayat {orderQuestion.target.ayahNumber}) dimulai dengan kata apa?
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              {orderQuestion.options.map((option) => {
                const picked = orderPick === option;
                const correct = option === orderQuestion.answer;
                return (
                  <button
                    key={option}
                    type="button"
                    dir="rtl"
                    onClick={() => pickOrder(option)}
                    className={`py-2 px-3 rounded-2xl border transition-colors ${orderQuestion.msi ? 'font-mushaf-id' : 'font-arabic'} ${
                      picked && correct
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 text-emerald-800 dark:text-emerald-200'
                        : picked
                          ? 'bg-red-50 dark:bg-red-950/30 border-red-300 text-red-700 dark:text-red-300'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-[#173B4E] dark:text-[#E9CF99] hover:border-[#477F8D]'
                    }`}
                    style={{ fontSize: arabicSize(fontSize, 0.8, 22) }}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
            {orderPick && !orderSolved && <p className="text-xs text-amber-700 dark:text-amber-300">Belum tepat, coba ingat lagi urutan ayatnya.</p>}
          </div>
          {orderSolved && (
            <RoundDone
              title="Tepat! Urutan ayatnya sudah kamu kuasai."
              note={randomAyahs.length ? 'Terakhir: kolom muraja\'ah acak dari ayat lain yang pernah kamu latih.' : undefined}
              actionLabel={randomAyahs.length ? 'Lanjut ke kolom acak' : 'Selesai'}
              onContinue={goToRandom}
            />
          )}
        </motion.div>
      )}

      {/* 4. Kolom muraja'ah acak */}
      {phase === 'random' && randomItem && (
        <motion.div key={randomItem.target.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="bg-gradient-to-b from-[#F8F6F1] to-[#F1EDE6] dark:from-[#102731] dark:to-[#152E38] rounded-3xl p-5 sm:p-7 border border-[#BE9452]/40 text-center space-y-4">
            <p className="text-xs text-[#477F8D]">
              Kolom muraja'ah {randomIndex + 1} / {randomAyahs.length} · ayat lain di QS. {surah.nameLatin} yang pernah kamu latih
            </p>
            {(() => {
              const text = textOf(randomItem.target);
              return (
                <p dir="rtl" className={`leading-[2.2] text-[#173B4E] dark:text-[#E9CF99] ${fontClass(text)}`} style={{ fontSize: sizeMain }}>
                  {randomRevealed
                    ? text.words.map((word, i) => <span key={i} className={i === 0 ? KEY_COLOR : undefined}>{word}{' '}</span>)
                    : <><span className={KEY_COLOR}>{text.words[0]}</span>{' '}<span className="inline-block align-middle mx-1 px-3 rounded-lg bg-slate-300/40 dark:bg-slate-700/50 text-slate-400 select-none font-sans text-base">•••</span></>}
                </p>
              );
            })()}

            {!numberSolved ? (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-[#173B4E] dark:text-white">Ini ayat nomor berapa?</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {randomItem.options.map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => pickNumber(n)}
                      className={`w-12 h-12 rounded-2xl border text-sm font-bold transition-colors ${
                        numberPick === n
                          ? 'bg-red-50 dark:bg-red-950/30 border-red-300 text-red-700 dark:text-red-300'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-[#173B4E] dark:text-white hover:border-[#477F8D]'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
                {numberPick !== null && <p className="text-xs text-amber-700 dark:text-amber-300">Belum tepat, coba lagi.</p>}
              </div>
            ) : !randomRevealed ? (
              <div className="space-y-2">
                <p className="text-xs text-emerald-700 dark:text-emerald-300 font-semibold">Tepat, ayat {randomItem.target.ayahNumber}. Sekarang sambung ayatnya dari ingatan.</p>
                <button
                  type="button"
                  onClick={() => {
                    sounds.playWordClick();
                    setRandomRevealed(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-5 py-2 bg-[#246579] hover:bg-[#174C60] text-white rounded-xl text-xs font-semibold"
                >
                  <Eye className="w-4 h-4" /> Buka ayat untuk memeriksa
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-[#293640] dark:text-[#CBD5E1]">Bagaimana bacaanmu?</p>
                <div className="flex flex-wrap justify-center gap-2">
                  <button type="button" onClick={() => rateRandom('lupa')} className="px-4 py-2 text-xs font-semibold rounded-xl border border-red-300 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/40">🔴 Lupa</button>
                  <button type="button" onClick={() => rateRandom('ragu')} className="px-4 py-2 text-xs font-semibold rounded-xl border border-amber-300 text-amber-800 dark:text-amber-200 hover:bg-amber-50 dark:hover:bg-amber-950/40">🟡 Ragu</button>
                  <button type="button" onClick={() => rateRandom('lancar')} className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#246579] hover:bg-[#174C60] text-white">🟢 Lancar</button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {phase === 'finish' && (
        <RoundDone
          title="Masya Allah, kunci ayat ini sudah kamu pegang!"
          note={
            randomAyahs.length === 0
              ? 'Kolom muraja\'ah acak akan muncul setelah kamu melatih ayat lain di surah ini.'
              : toReview > 0
                ? `${toReview} ayat di kolom acak masih perlu diulang. Muraja'ah lagi setelah shalat berikutnya.`
                : 'Semua ayat di kolom acak lancar. Pertahankan dengan muraja\'ah setiap selesai shalat.'
          }
          actionLabel="Selesai"
          onContinue={onPass}
        />
      )}
    </div>
  );
};
