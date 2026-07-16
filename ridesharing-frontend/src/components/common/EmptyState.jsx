import { Car } from 'lucide-react';

export default function EmptyState({
  title = 'Nothing here yet',
  description = 'Check back later or try a different search.',
  action,
}) {
  return (
    <div className="flex flex-col items-start gap-5 rounded-2xl border border-dashed border-border bg-surface px-8 py-12 sm:flex-row sm:items-center sm:gap-8">
      <div className="relative flex h-20 w-20 shrink-0 items-center justify-center">
        <div className="absolute inset-0 rounded-2xl bg-accent/5" />
        <div className="absolute -right-1 -top-1 h-8 w-8 rounded-lg bg-warning/10" />
        <Car className="relative h-9 w-9 text-accent" strokeWidth={1.5} aria-hidden="true" />
      </div>
      <div className="flex-1">
        <h3 className="font-display text-lg font-semibold text-text-primary">{title}</h3>
        <p className="mt-1.5 max-w-md text-sm leading-relaxed text-text-secondary">{description}</p>
        {action && <div className="mt-5">{action}</div>}
      </div>
    </div>
  );
}
