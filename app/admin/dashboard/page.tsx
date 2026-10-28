"use client";

import { useState } from 'react';
import { CheckCircle2, Loader2, ShieldAlert } from 'lucide-react';

type EventFormProps = {
  config: {
    eventName: string;
    logoUrl: string;
    themeColor: string;
    registrationOpen: boolean;
    lastUpdated: string;
  };
};

export default function EventRegistrationForm({ config }: EventFormProps) {
  const [form, setForm] = useState({
    firstName: '',
    surname: '',
    telephone: '',
    email: '',
    association: '',
  });
  const [status, setStatus] = useState<{ kind: 'success' | 'error'; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (key: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus(null);

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setStatus({
          kind: 'error',
          message: data?.message || data?.error || 'Unable to submit your registration right now.',
        });
        return;
      }

      setStatus({
        kind: 'success',
        message: data?.message || 'Registration submitted successfully.',
      });
      setForm({ firstName: '', surname: '', telephone: '', email: '', association: '' });
    } catch {
      setStatus({
        kind: 'error',
        message: 'Something went wrong while saving your registration. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!config.registrationOpen) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-center gap-3 text-slate-700">
          <ShieldAlert className="h-6 w-6 text-amber-600" />
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Registration is currently closed</h2>
            <p className="mt-2 text-slate-600">The admin has paused the event form. Please check back later.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 md:p-8">
      <div className="mb-6 flex items-center gap-4">
        <img src={config.logoUrl || '/FAGE%20Logos-02.png'} alt={config.eventName} className="h-16 w-16 rounded-2xl object-cover shadow-sm" />
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Register for the event</p>
          <h2 className="text-2xl font-black text-slate-900">{config.eventName}</h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">First name</label>
          <input
            value={form.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            required
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
            placeholder="First name"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">Surname</label>
          <input
            value={form.surname}
            onChange={(e) => handleChange('surname', e.target.value)}
            required
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
            placeholder="Surname"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">Telephone</label>
          <input
            value={form.telephone}
            onChange={(e) => handleChange('telephone', e.target.value)}
            required
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
            placeholder="+234 800 000 0000"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => handleChange('email', e.target.value)}
            required
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
            placeholder="name@email.com"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="block text-sm font-medium text-slate-700">Association / Organization</label>
          <input
            value={form.association}
            onChange={(e) => handleChange('association', e.target.value)}
            required
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
            placeholder="Association name"
          />
        </div>

        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-base font-semibold text-white shadow-lg transition disabled:cursor-not-allowed disabled:opacity-70"
            style={{ backgroundColor: config.themeColor }}
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            {isSubmitting ? 'Submitting...' : 'Submit registration'}
          </button>
        </div>
      </form>

      {status && (
        <div
          className={`mt-5 rounded-2xl border p-4 text-sm ${
            status.kind === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-rose-200 bg-rose-50 text-rose-700'
          }`}
        >
          {status.message}
        </div>
      )}
    </div>
  );
}
