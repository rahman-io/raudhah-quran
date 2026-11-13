import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { BookOpen, CheckCircle2, GraduationCap, RotateCcw, Sparkles, XCircle } from 'lucide-react';
import { TAJWID_MARKS, TAJWID_PRIORITY, tajwidReason, type TajwidCode } from '../../data/tajwidMarks';
import { loadTajwidSurah, type TajwidMark } from '../../services/tajwidData';
import { loadKemenagSurah, loadReaderIndex, splitKemenagWords } from '../../services/quranReaderData';
import { useQuranGame } from '../../context/QuranGameContext';
import { useBackHandler } from '../../utils/backNavigation';
import { TajwidGuideModal } from './TajwidGuideModal';

/**
 * Tajwid langsung dari ayat: kata dengan huruf berwarna sesuai hukumnya, penjelasan, tautan ke
 * materi Belajar Tajwid, dan latihan "Tebak hukumnya" dengan contoh asli dari Al-Qur'an.
 */

const ARABIC_LETTER = /[ء-يٱ-ۓ]/;

/** Huruf dasar pertama di bagian kata yang ditandai (untuk penjelasan, mis. "Huruf ق ..."). */
const markedLetter = (text: string, mark: TajwidMark) => text.slice(mark.start, mark.end).match(ARABIC_LETTER)?.[0] ?? '';

/** Kata dengan huruf-huruf yang terkena hukum diwarnai (warna prioritas bila bertumpuk). */
export const ColoredWord: React.FC<{
  text: string;
  marks: TajwidMark[];
  /** Hanya warnai kode ini (mis. di latihan). */
  only?: TajwidMark;
  className?: string;
  style?: React.CSSProperties;
}> = ({ text, marks, only, className = '', style }) => {
  const segments = useMemo(() => {
    const colorAt: (TajwidCode | null)[] = Array.from({ length: text.length }, () => null);
    const list = only ? [only] : [...marks].sort((a, b) => TAJWID_PRIORITY.indexOf(b.code) - TAJWID_PRIORITY.indexOf(a.code));
    list.forEach((mark) => {
      for (let i = Math.max(0, mark.start); i < Math.min(text.length, mark.end); i += 1) colorAt[i] = mark.code;
    });
    const out: { text: string; code: TajwidCode | null }[] = [];
    for (let i = 0; i < text.length; i += 1) {
      const last = out[out.length - 1];
      if (last && last.code === colorAt[i]) last.text += text[i];
      else out.push({ text: text[i], code: colorAt[i] });
    }
    return out;
  }, [text, marks, only]);
  return (
    <span className={`font-mushaf-id ${className}`} style={style} dir="rtl">
      {segments.map((segment, i) =>
        segment.code ? (
          <span key={i} style={{ color: TAJWID_MARKS[segment.code].color }}>
            {segment.text}
          </span>
        ) : (
          <React.Fragment key={i}>{segment.text}</React.Fragment>
        )
      )}
    </span>
  );
};

/** Materi Belajar Tajwid di atas jendela lain (tombol back menutupnya lebih dulu). */
const LessonModal: React.FC<{ lesson: string; onClose: () => void }> = ({ lesson, onClose }) => {
  useBackHandler(true, onClose, 12);
  return createPortal(
    <div style={{ position: 'relative', zIndex: 95 }}>
      <TajwidGuideModal isOpen onClose={onClose} initialRuleId={lesson} />
    </div>,
    document.body
  );
};

/** Daftar hukum tajwid pada satu kata, lengkap dengan penjelasan dan tautan materi. */
export const TajwidRuleList: React.FC<{ text: string; marks: TajwidMark[] }> = ({ text, marks }) => {
  const [lesson, setLesson] = useState<string | null>(null);
  // Satu kartu per hukum; catatan baca (hamzah washal, huruf tak dibaca) di bawah.
  const unique = useMemo(() => {
    const seen = new Set<string>();
    return marks
      .filter((m) => (seen.has(m.code) ? false : (seen.add(m.code), true)))
      .sort((a, b) => Number(!!TAJWID_MARKS[a.code].note) - Number(!!TAJWID_MARKS[b.code].note));
  }, [marks]);

  if (!unique.length) {
    return <p className="text-[11px] text-slate-500 dark:text-slate-400">Kata ini dibaca biasa, tanpa hukum tajwid khusus.</p>;
  }
  return (
    <ul className="space-y-2">
      {unique.map((mark) => {
        const info = TAJWID_MARKS[mark.code];
        return (
          <li key={mark.code} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/60 p-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: info.color }} />
              <p className="flex-1 min-w-0 text-[13px] font-bold text-[#173B4E] dark:text-white">{info.nameLatin}</p>
              <span className="font-mushaf-id text-sm text-[#246579] dark:text-[#A7CDD3]" dir="rtl">
                {info.nameArabic}
              </span>
            </div>
            <div className="mt-1.5 flex items-start gap-2">
              <ColoredWord text={text} marks={marks} only={mark} className="text-xl leading-none shrink-0" />
              <div className="flex-1 min-w-0 space-y-1 text-[11.5px] leading-relaxed text-[#293640] dark:text-slate-200">
                <p>{tajwidReason(mark.code, markedLetter(text, mark), mark.trigger)}</p>
                <p className="text-[#246579] dark:text-[#A7CDD3]">
                  <b>Cara baca:</b> {info.howToRead}
                </p>
              </div>
            </div>
            {info.lesson && (
              <button
                type="button"
                onClick={() => setLesson(info.lesson!)}
                className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-[#246579] dark:text-[#A7CDD3] hover:underline"
              >
                <BookOpen className="w-3.5 h-3.5" /> Pelajari materi {info.nameLatin}
              </button>
            )}
          </li>
        );
      })}
      {lesson && <LessonModal lesson={lesson} onClose={() => setLesson(null)} />}
    </ul>
  );
};

/* ---------------- Latihan "Tebak hukumnya" ---------------- */
const QUIZ_CODES: TajwidCode[] = ['ih', 'ig', 'in', 'il', 'ik', 'is', 'ks', 'iz', 'gh', 'qa', 'ls', 'lq', 'mf', 'mt', 'm6', 'ma', 'm2'];
const QUESTIONS = 3;
const XP_PER_CORRECT = 5;

interface Question {
  text: string;
  mark: TajwidMark;
  ref: string;
  options: TajwidCode[];
}

const shuffle = <T,>(items: T[]) => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

/** Latihan singkat dengan contoh kata asli dari surah yang sedang dibaca. */
export const TajwidPractice: React.FC<{ surah: number; surahName: string; onDone?: () => void }> = ({ surah, surahName, onDone }) => {
  const { addXP } = useQuranGame();
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<TajwidCode | null>(null);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);

  useEffect(() => {
    let cancelled = false;
    Promise.all([loadTajwidSurah(surah), loadKemenagSurah(surah)]).then(([marks, texts]) => {
      if (cancelled || !marks || !texts) return setQuestions([]);
      const pool: { mark: TajwidMark; ayah: number }[] = [];
      marks.forEach((list, ayah) => list.forEach((mark) => QUIZ_CODES.includes(mark.code) && pool.push({ mark, ayah })));
      // Utamakan hukum yang berbeda-beda agar latihannya beragam.
      const chosen: { mark: TajwidMark; ayah: number }[] = [];
      for (const item of shuffle(pool)) {
        if (chosen.length >= QUESTIONS) break;
        if (!chosen.some((c) => c.mark.code === item.mark.code)) chosen.push(item);
      }
      setQuestions(
        chosen.map(({ mark, ayah }) => {
          const text = splitKemenagWords(texts.get(ayah) ?? '')[mark.word] ?? '';
          const others = shuffle(QUIZ_CODES.filter((c) => c !== mark.code)).slice(0, 3);
          return { text, mark, ref: `${surahName} : ${ayah}`, options: shuffle([mark.code, ...others]) };
        })
      );
      setIndex(0);
      setPicked(null);
      setScore(0);
    });
    return () => {
      cancelled = true;
    };
  }, [surah, surahName, round]);

  if (!questions) return <p className="text-xs text-slate-500">Menyiapkan latihan…</p>;
  if (!questions.length) return <p className="text-xs text-slate-500">Latihan belum tersedia untuk surah ini.</p>;

  if (index >= questions.length) {
    return (
      <div className="text-center space-y-2 py-2">
        <Sparkles className="w-8 h-8 mx-auto text-[#D3A253]" />
        <p className="text-sm font-bold text-[#173B4E] dark:text-white">
          Benar {score} dari {questions.length}
        </p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">+{score * XP_PER_CORRECT} XP. Terus berlatih, sedikit demi sedikit.</p>
        <div className="flex justify-center gap-2 pt-1">
          <button type="button" onClick={() => setRound((r) => r + 1)} className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-[#246579] text-white text-xs font-semibold">
            <RotateCcw className="w-3.5 h-3.5" /> Latihan lagi
          </button>
          {onDone && (
            <button type="button" onClick={onDone} className="px-3 py-2 rounded-xl border border-[#246579]/30 text-[#246579] dark:text-[#A7CDD3] text-xs font-semibold">
              Selesai
            </button>
          )}
        </div>
      </div>
    );
  }

  const q = questions[index];
  const correct = picked === q.mark.code;
  const choose = (code: TajwidCode) => {
    if (picked) return;
    setPicked(code);
    if (code === q.mark.code) {
      setScore((s) => s + 1);
      addXP(XP_PER_CORRECT, 'Latihan tajwid');
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-[11px] text-[#477F8D]">
        <span className="font-semibold">Tebak hukumnya · {index + 1}/{questions.length}</span>
        <span>QS. {q.ref}</span>
      </div>
      <div className="rounded-2xl bg-[#F1EDE6] dark:bg-[#102731] py-4 text-center">
        <ColoredWord text={q.text} marks={[q.mark]} only={q.mark} className="text-4xl leading-[1.6] text-[#173B4E] dark:text-[#EEF4F5]" />
        <p className="mt-1 text-[11px] text-[#477F8D]">Hukum tajwid pada huruf berwarna adalah…</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {q.options.map((code) => {
          const isAnswer = code === q.mark.code;
          const state = !picked ? '' : isAnswer ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30' : code === picked ? 'border-rose-400 bg-rose-50 dark:bg-rose-900/30' : 'opacity-60';
          return (
            <button
              key={code}
              type="button"
              onClick={() => choose(code)}
              className={`px-2 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[12px] font-semibold text-[#173B4E] dark:text-white ${state}`}
            >
              {TAJWID_MARKS[code].nameLatin}
            </button>
          );
        })}
      </div>
      {picked && (
        <div className={`rounded-xl p-3 text-[11.5px] leading-relaxed ${correct ? 'bg-emerald-50 dark:bg-emerald-900/30' : 'bg-rose-50 dark:bg-rose-900/30'}`}>
          <p className="flex items-center gap-1 font-bold">
            {correct ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-rose-500" />}
            {correct ? 'Benar!' : `Jawabannya: ${TAJWID_MARKS[q.mark.code].nameLatin}`}
          </p>
          <p className="mt-1 text-[#293640] dark:text-slate-200">{tajwidReason(q.mark.code, markedLetter(q.text, q.mark), q.mark.trigger)}</p>
          <button
            type="button"
            onClick={() => {
              setIndex((i) => i + 1);
              setPicked(null);
            }}
            className="mt-2 px-3 py-1.5 rounded-lg bg-[#246579] text-white text-[11px] font-semibold"
          >
            {index + 1 < questions.length ? 'Soal berikutnya' : 'Lihat hasil'}
          </button>
        </div>
      )}
    </div>
  );
};

/** Bagian "Tajwid" untuk satu kata (dipakai di jendela arti per kata). */
export const TajwidWordSection: React.FC<{ surah: number; ayah: number; word: number; surahName?: string }> = ({ surah, ayah, word, surahName }) => {
  const [data, setData] = useState<{ text: string; marks: TajwidMark[] } | null | undefined>(undefined);
  const [practice, setPractice] = useState(false);
  const [name, setName] = useState(surahName);
  useEffect(() => {
    if (!surahName) loadReaderIndex().then((index) => setName(index.surahs.find((s) => s.number === surah)?.nameLatin));
  }, [surah, surahName]);
  useEffect(() => {
    let cancelled = false;
    Promise.all([loadTajwidSurah(surah), loadKemenagSurah(surah)]).then(([marks, texts]) => {
      if (cancelled) return;
      const text = texts ? splitKemenagWords(texts.get(ayah) ?? '')[word] : undefined;
      setData(marks && text ? { text, marks: (marks.get(ayah) ?? []).filter((m) => m.word === word) } : null);
    });
    return () => {
      cancelled = true;
    };
  }, [surah, ayah, word]);

  if (data === undefined) return null;
  if (data === null) return null;
  return (
    <div className="mt-3 rounded-2xl border border-[#D3A253]/40 bg-[#FFFBF1] dark:bg-[#2A2416]/40 p-3 space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-[12px] font-bold text-[#8A6420] dark:text-[#E9CF99]">
          <GraduationCap className="w-4 h-4" /> Tajwid kata ini
        </p>
        <button
          type="button"
          onClick={() => setPractice((p) => !p)}
          className="px-2.5 py-1 rounded-lg bg-[#D3A253]/15 text-[11px] font-semibold text-[#8A6420] dark:text-[#E9CF99]"
        >
          {practice ? 'Kembali' : 'Latihan tebak hukum'}
        </button>
      </div>
      {practice ? (
        <TajwidPractice surah={surah} surahName={name ?? `Surah ${surah}`} onDone={() => setPractice(false)} />
      ) : (
        <>
          <div className="text-center">
            <ColoredWord text={data.text} marks={data.marks} className="text-4xl leading-[1.7] text-[#173B4E] dark:text-[#EEF4F5]" />
          </div>
          <TajwidRuleList text={data.text} marks={data.marks} />
        </>
      )}
      <p className="text-[10px] text-slate-500 dark:text-slate-400">Hukum ditandai otomatis menurut riwayat Hafs. Bila ragu, tanyakan kepada guru mengaji.</p>
    </div>
  );
};

/** Tajwid satu ayat: kata-kata yang memiliki hukum; ketuk kata untuk penjelasannya. */
export const TajwidAyahPanel: React.FC<{ surah: number; ayah: number; surahName: string }> = ({ surah, ayah, surahName }) => {
  const [data, setData] = useState<{ words: string[]; marks: TajwidMark[] } | null | undefined>(undefined);
  const [selected, setSelected] = useState<number | null>(null);
  const [practice, setPractice] = useState(false);
  useEffect(() => {
    let cancelled = false;
    setSelected(null);
    Promise.all([loadTajwidSurah(surah), loadKemenagSurah(surah)]).then(([marks, texts]) => {
      if (cancelled) return;
      const words = texts ? splitKemenagWords(texts.get(ayah) ?? '') : null;
      setData(marks && words ? { words, marks: marks.get(ayah) ?? [] } : null);
    });
    return () => {
      cancelled = true;
    };
  }, [surah, ayah]);

  if (data === undefined) return <p className="text-xs text-slate-500">Memuat tajwid…</p>;
  if (data === null) return <p className="text-xs text-slate-500">Data tajwid belum tersedia.</p>;
  if (practice) return <TajwidPractice surah={surah} surahName={surahName} onDone={() => setPractice(false)} />;

  const wordMarks = (i: number) => data.marks.filter((m) => m.word === i);
  return (
    <div className="space-y-3">
      <p className="text-[11px] text-[#477F8D]">Ketuk kata untuk melihat hukum tajwid dan cara membacanya.</p>
      <div className="flex flex-wrap gap-1.5 justify-start" dir="rtl">
        {data.words.map((text, i) => {
          const marks = wordMarks(i);
          const hasRule = marks.some((m) => !TAJWID_MARKS[m.code].note);
          return (
            <button
              key={i}
              type="button"
              onClick={() => setSelected(i === selected ? null : i)}
              className={`px-2.5 py-1 rounded-xl border text-2xl leading-[1.7] transition-colors ${
                selected === i
                  ? 'border-[#246579] bg-[#246579]/10'
                  : hasRule
                    ? 'border-[#D3A253]/50 bg-white dark:bg-slate-800'
                    : 'border-transparent bg-white/50 dark:bg-slate-800/40'
              }`}
            >
              <ColoredWord text={text} marks={marks} className="text-[#173B4E] dark:text-[#EEF4F5]" />
            </button>
          );
        })}
      </div>
      {selected !== null && <TajwidRuleList text={data.words[selected]} marks={wordMarks(selected)} />}
      <button
        type="button"
        onClick={() => setPractice(true)}
        className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#D3A253]/15 text-[12px] font-semibold text-[#8A6420] dark:text-[#E9CF99]"
      >
        <GraduationCap className="w-4 h-4" /> Latihan tebak hukum tajwid
      </button>
      <p className="text-[10px] text-slate-500 dark:text-slate-400">Hukum ditandai otomatis menurut riwayat Hafs. Bila ragu, tanyakan kepada guru mengaji.</p>
    </div>
  );
};
