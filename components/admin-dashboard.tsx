"use client";

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, CheckCircle2, QrCode, ShieldAlert, UserRound } from 'lucide-react';

export default function KioskScreen() {
  const [manualMode, setManualMode] = useState(false);
  const [staffId, setStaffId] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);
  const readerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    const initScanner = async () => {
      if (typeof window === 'undefined') return;

      const scanner = new Html5Qrcode('reader');
      readerRef.current = scanner;

      try {
        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          async (decodedText) => {
            await handleCheckIn({ method: 'qr', qrToken: decodedText });
            await scanner.stop();
          },
          () => undefined,
        );
      } catch {
        // Camera access is optional; users can move to manual fallback.
      }
    };

    initScanner();

    return () => {
      if (readerRef.current) {
        readerRef.current.stop().catch(() => undefined);
      }
    };
  }, []);

  const handleCheckIn = async (payload: { method: 'qr' | 'manual'; qrToken?: string; staffId?: string; email?: string }) => {
    setStatus(null);

    const response = await fetch('/api/checkin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      setStatus({ kind: 'error', text: data.error || 'Unable to verify staff check-in.' });
      return;
    }

    setStatus({
      kind: 'success',
      text: data.message || 'Check-in recorded successfully.',
    });
    setStaffId('');
    setEmail('');
  };

  const handleManualSubmit = async () => {
    if (!staffId.trim() && !email.trim()) {
      setStatus({ kind: 'error', text: 'Enter a staff ID or registered email.' });
      return;
    }

    await handleCheckIn({
      method: 'manual',
      staffId: staffId.trim() || undefined,
      email: email.trim() || undefined,
    });
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex max-w-6xl flex-col px-6 py-8">
        <header className="mb-8 flex items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 backdrop-blur">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-emerald-400">FAGE Kiosk</p>
            <h1 className="mt-1 text-2xl font-bold text-white">Daily attendance check-in</h1>
          </div>
          <Link href="/admin/login" className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-200 transition hover:border-slate-500 hover:bg-slate-800">
            Admin
          </Link>
        </header>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-slate-950/30">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400">
                  <Camera className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">QR Scanner</p>
                  <h2 className="text-xl font-bold text-white">Scan staff badge</h2>
                </div>
              </div>
              <div className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
                Kiosk mode ready
              </div>
            </div>

            <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-950 p-4">
              <div id="reader" className="min-h-[320px] w-full overflow-hidden rounded-2xl bg-slate-950" />
            </div>
          </section>

          <aside className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl shadow-slate-950/20">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/15 text-sky-400">
                  <UserRound className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Manual entry</p>
                  <h2 className="text-xl font-bold text-white">Fallback check-in</h2>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setManualMode((current) => !current)}
                className="rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-xs font-medium text-slate-200 transition hover:border-slate-600"
              >
                {manualMode ? 'Hide' : 'Show'}
              </button>
            </div>

            {manualMode && (
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">Staff ID</label>
                  <input
                    value={staffId}
                    onChange={(event) => setStaffId(event.target.value)}
                    placeholder="e.g. STF-0001"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-white outline-none transition focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">Registered email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="name@fage.com"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-white outline-none transition focus:border-emerald-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleManualSubmit}
                  className="w-full rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
                >
                  Verify and check in
                </button>
              </div>
            )}

            {status && (
              <div
                className={`mt-6 rounded-2xl border p-4 text-sm ${
                  status.kind === 'success'
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
                    : 'border-rose-500/30 bg-rose-500/10 text-rose-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  {status.kind === 'success' ? (
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-400" />
                  ) : (
                    <ShieldAlert className="mt-0.5 h-5 w-5 text-rose-400" />
                  )}
                  <p>{status.text}</p>
                </div>
              </div>
            )}

            <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-sm text-slate-300">
              <div className="mb-2 flex items-center gap-2 text-slate-100">
                <QrCode className="h-4 w-4 text-emerald-400" />
                Secure check-in note
              </div>
              QR payloads are signed with a backend HMAC secret, so only verified staff badges are accepted.
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
