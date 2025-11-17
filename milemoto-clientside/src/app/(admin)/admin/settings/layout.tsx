import { SettingsSidebar } from '@/features/admin/components/SettingsSidebar';

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-[240px_1fr]">
      <aside className="sticky top-24 self-start">
        <SettingsSidebar />
      </aside>
      <section>{children}</section>
    </div>
  );
}
