import Link from 'next/link';
import { ArrowRight, Building2, CheckCircle2, ShieldCheck } from 'lucide-react';
import { defaultLandingCards } from '@/lib/landing';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,116,144,0.12),_transparent_25%),linear-gradient(135deg,_#f8fafc_0%,_#edf6ff_100%)] text-slate-900">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <header className="mb-10 flex items-center justify-between gap-4 rounded-full border border-slate-200 bg-white/80 px-5 py-3 shadow-sm backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0f172a] text-sm font-bold text-white">F</div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Federation of Associations</p>
              <p className="text-lg font-bold text-slate-900">FAGE</p>
            </div>
          </div>
          <nav className="flex items-center gap-3">
            <Link href="/kiosk" className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-500">
              Kiosk View
            </Link>
            <Link href="/admin/login" className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:border-slate-300 hover:bg-slate-100">
              Admin Login
            </Link>
          </nav>
        </header>

        <section className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
              <CheckCircle2 className="h-3.5 w-3.5" /> Secure daily attendance
            </div>
            <h1 className="max-w-xl text-4xl font-black tracking-tight text-slate-900 md:text-6xl">
              Staff check-ins built for a busy front desk.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-slate-600">
              FAGE attendance management for QR scans, manual fallback, admin controls, daily audit logs, and Excel email reports in a single secure, local-first application.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/kiosk" className="inline-flex items-center gap-2 rounded-full bg-[#0f172a] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-200 transition hover:bg-slate-800">
                Launch kiosk <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/admin/login" className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-100">
                Open admin portal
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-2xl bg-[#0f172a] p-2 text-white">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">System controls</p>
                <p className="text-lg font-bold text-slate-900">Protected and audited</p>
              </div>
            </div>
            <ul className="space-y-4 text-sm text-slate-600">
              <li className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" />
                HMAC-signed QR tokens with verification on the backend.
              </li>
              <li className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" />
                Local JSON storage with validation for staff, logs, and settings.
              </li>
              <li className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" />
                Admin-only access to attendance, correction, and email reporting.
              </li>
            </ul>
          </div>
        </section>

        <section className="mt-14 grid gap-6 md:grid-cols-3">
          {defaultLandingCards.map((card) => (
            <div key={card.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-100">
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0f172a] text-white">
                <Building2 className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">{card.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{card.description}</p>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
