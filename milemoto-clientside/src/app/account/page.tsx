// src/app/account/page.tsx
import { redirect } from 'next/navigation';

export default function AccountPage() {
  // This page is now just a redirect to the default tab
  redirect('/account/orders');
}
