'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';

const NAV = [
  { icon: '🏠', label: 'Overzicht', href: '/dashboard-diy' },
  { icon: '📁', label: 'Mijn Projecten', href: '/dashboard-diy/projects' },
  { icon: '📦', label: 'Materialen', href: '/dashboard-diy/materials' },
  { icon: '🧱', label: 'Stappenplan', href: '/dashboard-diy/steps' },
  { icon: '🛠️', label: 'Tools & Checklists', href: '/dashboard-diy/tools' },
  { icon: '🤖', label: 'AI Assistent', href: '/dashboard-diy/ai' },
  { icon: '⚙️', label: 'Profiel Instellingen', href: '/dashboard-diy/profile' },
];

export default function DashboardDIY() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar (desktop) */}
      <aside className="hidden md:flex md:flex-col w-56 bg-white border-r border-gray-100 py-6 px-2 min-h-screen">
        <div className="mb-8 text-2xl font-bold text-black px-4">🛠️ Fixio</div>
        <nav className="flex-1 space-y-1">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 font-medium transition">
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="px-4">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 font-medium transition w-full"
          >
            <span className="text-xl">🚪</span>
            <span>Uitloggen</span>
          </button>
        </div>
      </aside>

      {/* Drawer (mobile) */}
      <div className="md:hidden">
        <input id="drawer-toggle" type="checkbox" className="drawer-toggle" checked={drawerOpen} onChange={() => setDrawerOpen(!drawerOpen)} />
        <div className="drawer-content flex flex-col">
          <div className="navbar bg-white border-b border-gray-100 px-4 py-2 flex items-center justify-between">
            <button onClick={() => setDrawerOpen(true)} className="btn btn-ghost btn-circle text-2xl">☰</button>
            <span className="font-bold text-lg">🛠️ Fixio</span>
          </div>
        </div>
        <div className={`drawer-side z-40 ${drawerOpen ? 'block' : 'hidden'}`}>
          <label htmlFor="drawer-toggle" className="drawer-overlay" onClick={() => setDrawerOpen(false)}></label>
          <aside className="menu p-4 w-64 min-h-full bg-white border-r border-gray-100">
            <div className="mb-8 text-2xl font-bold text-black">🛠️ Fixio</div>
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 font-medium transition" onClick={() => setDrawerOpen(false)}>
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
            <button
              onClick={() => {
                handleSignOut();
                setDrawerOpen(false);
              }}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 font-medium transition w-full"
            >
              <span className="text-xl">🚪</span>
              <span>Uitloggen</span>
            </button>
          </aside>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-start px-4 py-8 md:py-12 md:px-12">
        <div className="w-full max-w-2xl">
          <h1 className="text-2xl font-bold mb-2">Welkom terug, {user?.user_metadata?.name || 'Gebruiker'}</h1>
          <p className="text-gray-500 mb-8">Hier vind je een overzicht van je actieve projecten en taken.</p>

          {/* Actieve Project Card (placeholder) */}
          <div className="card bg-white shadow-md rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold text-lg">Actief Project</div>
              <span className="badge badge-success">Bezig</span>
            </div>
            <div className="text-gray-700 mb-2">Project: Badkamer verbouwen</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '60%' }}></div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">Volgende taak: Tegels zetten</div>
              <button className="btn btn-primary btn-sm">Direct doorgaan</button>
            </div>
          </div>

          {/* Materialenstatus (placeholder) */}
          <div className="flex items-center gap-3 mb-8">
            <span className="text-gray-700">📦 3 materialen nog nodig</span>
            <Link href="/dashboard-diy/materials" className="link link-primary text-sm">Bekijk materialen</Link>
          </div>

          {/* Placeholder voor meer content */}
          <div className="text-gray-400 text-sm">Meer dashboardfuncties volgen…</div>
        </div>
      </main>
    </div>
  );
} 