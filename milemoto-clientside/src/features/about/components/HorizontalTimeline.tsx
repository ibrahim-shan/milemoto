// src/features/about/HorizontalTimeline.tsx
'use client';

type Item = { title: string; body: string };

export function HorizontalTimeline({ items }: { items: Item[] }) {
  return (
    // Add padding-top (pt-2) to make space for the dots
    // which are pulled up by -mt-1.5
    <div className="pt-2">
      <ol className="before:bg-border relative flex flex-col gap-10 before:absolute before:top-0 before:left-0 before:h-0.5 before:w-full md:flex-row md:gap-8">
        {items.map((it, i) => (
          // flex-1 makes all items take equal width on desktop
          <li
            key={i}
            className="relative -mt-1.5 flex-1"
          >
            {/* The Dot */}
            {/* This is the equivalent of your example's `size-3` */}
            <span className="bg-primary block h-3 w-3 rounded-full" />

            {/* The Content */}
            {/* This div provides the `mt-4` from your example */}
            <div className="mt-4">
              <h3 className="text-foreground text-lg font-semibold">{it.title}</h3>
              <p className="text-muted-foreground mt-1 text-sm">{it.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
