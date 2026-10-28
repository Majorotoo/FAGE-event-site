import Link from 'next/link';
import { ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import EventRegistrationForm from '@/components/event-registration-form';
import { getDefaultEventConfig, readJson } from '@/lib/storage';

export default async function HomePage() {
  const config = await readJson('event-config.json', await getDefaultEventConfig());

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,116,144,0.12),_transparent_25%),linear-gradient(135deg,_#f8fafc_0%,_#edf6ff_100%)] text-slate-900">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <header className="mb-10 flex items-center justify-between gap-4 rounded-full border border-slate-200 bg-white/80 px-5 py-3 shadow-sm backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <img
              src={config.logoUrl || '/FAGE%20Logos-02.png'}
              alt={config.eventName}
              className="h-11 w-11 rounded-full border border-slate-200 bg-white object-cover"
            />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Federation of Associations</p>
              <p className="text-lg font-bold text-slate-900">{config.eventName}</p>
            </div>
          </div>
          <nav className="flex items-center gap-3">
            <Link href="/admin/login" className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:border-slate-300 hover:bg-slate-100">
              Admin Login
            </Link>
          </nav>
        </header>

        <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
              <CheckCircle2 className="h-3.5 w-3.5" /> {config.registrationOpen ? 'Registration open' : 'Registration closed'}
            </div>
            <h1 className="max-w-xl text-4xl font-black tracking-tight text-slate-900 md:text-6xl">
              {config.eventName}
            </h1>
            <p className="mt-5 max-w-xl text-lg text-slate-600">
              Register for this event and complete your attendance details securely. The admin can open or close the form at any time and manage the event branding from the admin dashboard.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="#registration" className="inline-flex items-center gap-2 rounded-full bg-[#0f172a] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-200 transition hover:bg-slate-800">
                Register now <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/admin/login" className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400">
                Open admin portal
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-2xl p-2 text-white" style={{ backgroundColor: config.themeColor }}>
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Event controls</p>
                <p className="text-lg font-bold text-slate-900">Secure and managed</p>
              </div>
            </div>
            <ul className="space-y-4 text-sm text-slate-600">
              <li className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" />
                Event forms open only when the admin enables them.
              </li>
              <li className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" />
                Registration branding is controlled from the admin dashboard.
              </li>
              <li className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" />
                Completed event data can be archived safely after closure.
              </li>
            </ul>
          </div>
        </section>

        <section id="registration" className="mt-14">
          <EventRegistrationForm config={config} />
        </section>
      </div>
    </main>
  );
}
