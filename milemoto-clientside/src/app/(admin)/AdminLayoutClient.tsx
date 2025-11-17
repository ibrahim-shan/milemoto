'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { AdminHeader } from '@/features/admin/components/AdminHeader';
import { AdminSidebar } from '@/features/admin/components/AdminSidebar';
import { useAuth } from '@/hooks/useAuth';

/**
 * A simple full-page loader.
 */
function FullPageLoader() {
  return (
    <div className="bg-background grid min-h-dvh place-items-center">
      <div className="border-muted-foreground/20 border-t-primary h-12 w-12 animate-spin rounded-full border-4" />
    </div>
  );
}

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (loading) {
      return; // Wait for auth state to load
    }

    if (!isAuthenticated) {
      router.replace('/signin?next=/admin/dashboard');
    } else if (!isAdmin) {
      // Not an admin, send to their regular account page
      router.replace('/account');
    }
  }, [isAuthenticated, isAdmin, loading, router]);

  // Show loader while checking auth or if user is not an admin
  if (loading || !isAuthenticated || !isAdmin) {
    return <FullPageLoader />;
  }

  // Admin is authenticated, render the layout
  return (
    <div className="bg-muted/40 min-h-screen">
      {/* Sidebar */}
      <AdminSidebar
        open={sidebarOpen}
        onOpenChange={setSidebarOpen}
      />

      <div className="flex flex-col md:pl-64">
        {/* Header */}
        <AdminHeader onToggleSidebar={() => setSidebarOpen(true)} />

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
