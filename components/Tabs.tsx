'use client';

export type TabKey = 'groups' | 'schedule' | 'gold' | 'silver' | 'bronze' | 'rules';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'groups', label: 'Groups' },
  { key: 'schedule', label: 'Schedule' },
  { key: 'gold', label: 'Gold Cup' },
  { key: 'silver', label: 'Silver Cup' },
  { key: 'bronze', label: 'Bronze Cup' },
  { key: 'rules', label: 'Rules' },
];

type Props = {
  active: TabKey;
  onChange: (key: TabKey) => void;
};

export function Tabs({ active, onChange }: Props) {
  return (
    <nav className="sticky top-0 z-20 border-b border-border/60 bg-bg/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl overflow-x-auto">
        {TABS.map((t) => {
          const isActive = t.key === active;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => onChange(t.key)}
              className={`min-w-[96px] flex-1 whitespace-nowrap px-4 py-3.5 text-xs font-semibold uppercase tracking-wider transition-colors sm:text-sm ${
                isActive
                  ? 'border-b-2 border-primary-bright text-white'
                  : 'border-b-2 border-transparent text-text-dim hover:bg-surface/70 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
