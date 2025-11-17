// src/features/about/ui.tsx
import type { PropsWithChildren, ReactNode } from 'react';

export function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-border bg-card rounded-2xl border p-5 text-center shadow-sm shadow-black/5">
      <dd className="text-2xl font-semibold tabular-nums">{value}</dd>
      <dt className="text-muted-foreground mt-1 text-sm">{label}</dt>
    </div>
  );
}

export function InfoCard({
  icon,
  title,
  children,
}: PropsWithChildren<{ icon: ReactNode; title: string }>) {
  return (
    <article className="border-border bg-card rounded-2xl border p-5 shadow-sm ring-1 ring-black/5">
      <div className="flex items-center gap-3">
        <span className="bg-primary/10 inline-flex h-10 w-10 items-center justify-center rounded-xl">
          {icon}
        </span>
        <h3 className="font-medium">{title}</h3>
      </div>
      <p className="text-muted-foreground mt-3 text-sm">{children}</p>
    </article>
  );
}

export function ValueItem({ icon, title, body }: { icon: ReactNode; title: string; body: string }) {
  return (
    <li className="border-border bg-card rounded-2xl border p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="font-medium">{title}</h3>
      </div>
      <p className="text-muted-foreground mt-2 text-sm">{body}</p>
    </li>
  );
}

export function TimelineItem({
  year,
  title,
  children,
}: PropsWithChildren<{ year: string; title: string }>) {
  return (
    <li className="relative pl-6">
      <span
        className="bg-primary absolute top-1.5 -left-1 h-2.5 w-2.5 rounded-full"
        aria-hidden
      />
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="text-primary text-sm font-semibold tabular-nums">{year}</span>
        <h3 className="font-medium">{title}</h3>
      </div>
      <p className="text-muted-foreground mt-1 text-sm">{children}</p>
    </li>
  );
}
