// src/features/about/Milestones.tsx
import { HorizontalTimeline } from '@/features/about/components/HorizontalTimeline';

export function Milestones() {
  const items = [
    {
      title: 'Kickoff',
      body: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Fuga officiis tempora ipsum adipisci tenetur.',
    },
    {
      title: 'First Milestone',
      body: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Exercitationem sed pariatur porro.',
    },
    {
      title: 'Launch',
      body: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Tenetur sunt quae.',
    },
  ];

  return (
    <section
      aria-labelledby="timeline"
      className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8"
    >
      <h2
        id="timeline"
        className="text-2xl font-semibold tracking-tight"
      >
        Milestones
      </h2>
      <div className="mt-6">
        <HorizontalTimeline items={items} />
      </div>
    </section>
  );
}
