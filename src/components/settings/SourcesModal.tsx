import React, { useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import { BookOpenText, ExternalLink, Headphones, Library, MoreHorizontal, ScrollText, Sparkles, X } from 'lucide-react';
import { APP_SOURCE_GROUPS, AUDIO_PROVIDERS, OTHER_SOURCES, type AppSource } from '../../data/appSources';
import { RECITERS } from '../../data/reciters';
import { useBackHandler } from '../../utils/backNavigation';

const GROUP_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  quran: BookOpenText,
  tafsir: ScrollText,
  hadits: Sparkles
};

const hostOf = (url: string) => {
  try {
    return new URL(url).hostname;
  } catch {
    return '';
  }
};

const SourceItem: React.FC<{ item: AppSource; extra?: React.ReactNode }> = ({ item, extra }) => (
  <li className="rounded-2xl bg-white dark:bg-slate-900/40 border border-[#246579]/10 p-3">
    <div className="flex items-start justify-between gap-2">
      <p className="text-[13px] font-semibold text-[#173B4E] dark:text-white">{item.title}</p>
      {item.url && (
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 inline-flex items-center gap-1 text-[11px] font-medium text-[#246579] dark:text-[#A7CDD3] hover:underline"
        >
          {hostOf(item.url).replace(/^www\./, '')}
          <ExternalLink className="w-3 h-3" />
        </a>
      )}
    </div>
    <p className="mt-0.5 text-xs leading-relaxed text-slate-600 dark:text-slate-300">{item.detail}</p>
    {extra}
  </li>
);

const Group: React.FC<{ title: string; Icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }> = ({ title, Icon, children }) => (
  <section className="space-y-2">
    <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[#8A6420] dark:text-[#E9CF99]">
      <Icon className="w-4 h-4" />
      {title}
    </h3>
    <ul className="space-y-2">{children}</ul>
  </section>
);

/** Jendela "Sumber & Rujukan": semua sumber konten aplikasi di satu tempat. */
export const SourcesModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  useBackHandler(true, onClose, 10);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Qari dikelompokkan per penyedia audio, langsung dari daftar qari di Pengaturan.
  const audioGroups = useMemo(() => {
    const groups = new Map<string, string[]>();
    RECITERS.forEach((reciter) => {
      const host = hostOf(reciter.url({ surahNumber: 1, ayahNumber: 1, globalAyahNumber: 1 }));
      groups.set(host, [...(groups.get(host) ?? []), reciter.name]);
    });
    return [...groups.entries()];
  }, []);

  return createPortal(
    <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center sm:p-6" role="dialog" aria-modal="true" aria-label="Sumber dan rujukan">
      <motion.div className="absolute inset-0 bg-[#0B1F27]/55 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="relative w-full sm:max-w-lg max-h-[88vh] flex flex-col bg-[#FBF8F2] dark:bg-[#152E38] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="flex items-center gap-3 px-5 pt-4 pb-3 border-b border-slate-100 dark:border-slate-700">
          <span className="w-9 h-9 shrink-0 rounded-xl bg-[#246579]/10 text-[#246579] dark:text-[#A7CDD3] flex items-center justify-center">
            <Library className="w-5 h-5" />
          </span>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold text-[#173B4E] dark:text-white">Sumber & Rujukan</h2>
            <p className="text-[11px] text-[#477F8D] dark:text-[#94A3B8]">Asal teks, terjemah, tafsir, hadits, dan audio di aplikasi ini</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-xl text-slate-500 hover:bg-white dark:hover:bg-slate-700" aria-label="Tutup">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] space-y-5">
          {APP_SOURCE_GROUPS.map((group) => (
            <Group key={group.id} title={group.title} Icon={GROUP_ICONS[group.id] ?? Library}>
              {group.items.map((item) => (
                <SourceItem key={item.title} item={item} />
              ))}
            </Group>
          ))}

          <Group title="Audio Murottal" Icon={Headphones}>
            {audioGroups.map(([host, names]) => {
              const provider = AUDIO_PROVIDERS[host] ?? { title: host, detail: 'Audio murottal per ayat.', url: `https://${host}/` };
              return (
                <SourceItem
                  key={host}
                  item={provider}
                  extra={<p className="mt-1.5 text-[11px] leading-relaxed text-[#246579] dark:text-[#A7CDD3]">{names.join(' · ')}</p>}
                />
              );
            })}
          </Group>

          <Group title="Lainnya" Icon={MoreHorizontal}>
            {OTHER_SOURCES.map((item) => (
              <SourceItem key={item.title} item={item} />
            ))}
          </Group>
        </div>
      </motion.div>
    </div>,
    document.body
  );
};
