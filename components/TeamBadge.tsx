import { getTeam } from '@/lib/data';

type Props = {
  id: number;
  align?: 'left' | 'right';
  emphasis?: 'normal' | 'winner' | 'loser';
  seed?: number;
};

export function TeamBadge({ id, align = 'left', emphasis = 'normal', seed }: Props) {
  const t = getTeam(id);
  const baseCls =
    emphasis === 'winner'
      ? 'text-white'
      : emphasis === 'loser'
        ? 'text-text-dim'
        : 'text-white';

  const numberCls =
    emphasis === 'winner'
      ? 'bg-primary text-white'
      : 'bg-surface-2 text-text-dim';

  return (
    <div
      className={`flex items-center gap-2 ${
        align === 'right' ? 'flex-row-reverse text-right' : ''
      }`}
    >
      <span
        className={`inline-flex h-6 min-w-[24px] items-center justify-center rounded-md px-1.5 font-mono text-[11px] font-bold ${numberCls}`}
      >
        {seed ? `#${seed}` : `#${t.id}`}
      </span>
      <div className={align === 'right' ? 'text-right' : ''}>
        <div className={`text-sm font-semibold leading-tight ${baseCls}`}>
          {t.short}
        </div>
        <div className="text-[10px] uppercase tracking-wider text-text-dim">
          {t.school}
        </div>
      </div>
    </div>
  );
}

export function TeamNameInline({ id }: { id: number }) {
  const t = getTeam(id);
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded bg-surface-2 px-1 font-mono text-[10px] font-bold text-text-dim">
        #{t.id}
      </span>
      <span>{t.short}</span>
    </span>
  );
}
