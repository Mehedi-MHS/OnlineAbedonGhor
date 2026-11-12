import { useState } from 'react';
import { site } from '@/data/site';
import {
  CheckIcon,
  InfoIcon,
  MailIcon,
  WhatsAppIcon,
} from './icons';

interface FormState {
  name: string;
  contact: string;
  subject: string;
  message: string;
}

const initialForm: FormState = {
  name: '',
  contact: '',
  subject: 'সাধারণ প্রশ্ন',
  message: '',
};

const subjects = [
  'সাধারণ প্রশ্ন',
  'ছবি থেকে পিডিএফ সহায়তা',
  'সিভি মেকার সহায়তা',
  'পরামর্শ / মতামত',
  'অন্যান্য',
];

export default function ContactForm() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [sentVia, setSentVia] = useState<'whatsapp' | 'email' | null>(null);
  const [fallbackUrl, setFallbackUrl] = useState('');

  const update = (key: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    setSentVia(null);
  };

  const validate = () => {
    const nextErrors: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) nextErrors.name = 'আপনার নাম লিখুন।';
    if (!form.contact.trim()) {
      nextErrors.contact = 'মোবাইল নম্বর বা ইমেইল দিন।';
    }
    if (!form.message.trim()) {
      nextErrors.message = 'আপনার মেসেজ লিখুন।';
    } else if (form.message.trim().length < 10) {
      nextErrors.message = 'অন্তত ১০ অক্ষরের একটি মেসেজ লিখুন।';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const send = (method: 'whatsapp' | 'email') => {
    if (!validate()) return;

    const subject = form.subject || 'সাধারণ প্রশ্ন';
    const body = [
      `নাম: ${form.name.trim()}`,
      `যোগাযোগ: ${form.contact.trim()}`,
      `বিষয়: ${subject}`,
      '',
      form.message.trim(),
    ].join('\n');

    let url = '';
    if (method === 'whatsapp') {
      const base = site.whatsapp.split('?')[0];
      url = `${base}?text=${encodeURIComponent(body)}`;
    } else {
      url = `mailto:${site.email}?subject=${encodeURIComponent(
        `[${subject}] ${form.name.trim()}`,
      )}&body=${encodeURIComponent(body)}`;
    }

    setFallbackUrl(url);
    setSentVia(method);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="card overflow-hidden">
      <div className="border-b border-ink-100 px-5 py-5 sm:px-6">
        <h2 className="text-lg font-bold text-ink-950">মেসেজ পাঠান</h2>
        <p className="mt-0.5 text-sm text-ink-500">
          নিচের ফর্মটি পূরণ করে WhatsApp বা ইমেইলে সরাসরি মেসেজ পাঠান।
        </p>
      </div>

      <form
        className="p-5 sm:p-6"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          send('whatsapp');
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="contact-name" className="field-label">
              আপনার নাম <span className="text-brand-600">*</span>
            </label>
            <input
              id="contact-name"
              type="text"
              value={form.name}
              onChange={(event) => update('name', event.target.value)}
              className={`field ${errors.name ? '!border-red-400 !ring-red-100' : ''}`}
              placeholder="পুরো নাম"
              autoComplete="name"
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? 'contact-name-error' : undefined}
            />
            {errors.name && (
              <p id="contact-name-error" className="mt-1.5 text-xs font-medium text-red-600">
                {errors.name}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="contact-info" className="field-label">
              মোবাইল / ইমেইল <span className="text-brand-600">*</span>
            </label>
            <input
              id="contact-info"
              type="text"
              value={form.contact}
              onChange={(event) => update('contact', event.target.value)}
              className={`field ${errors.contact ? '!border-red-400 !ring-red-100' : ''}`}
              placeholder="+880 17XX-XXXXXX বা you@example.com"
              autoComplete="email"
              aria-invalid={Boolean(errors.contact)}
              aria-describedby={errors.contact ? 'contact-info-error' : undefined}
            />
            {errors.contact && (
              <p id="contact-info-error" className="mt-1.5 text-xs font-medium text-red-600">
                {errors.contact}
              </p>
            )}
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="contact-subject" className="field-label">
              বিষয়
            </label>
            <select
              id="contact-subject"
              value={form.subject}
              onChange={(event) => update('subject', event.target.value)}
              className="field"
            >
              {subjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="contact-message" className="field-label">
              আপনার মেসেজ <span className="text-brand-600">*</span>
            </label>
            <textarea
              id="contact-message"
              value={form.message}
              onChange={(event) => update('message', event.target.value)}
              rows={6}
              maxLength={1000}
              className={`field resize-y ${errors.message ? '!border-red-400 !ring-red-100' : ''}`}
              placeholder="আপনার সমস্যা বা প্রশ্ন বিস্তারিতভাবে লিখুন..."
              aria-invalid={Boolean(errors.message)}
              aria-describedby={errors.message ? 'contact-message-error' : undefined}
            />
            <div className="mt-1.5 flex items-start justify-between gap-3">
              {errors.message ? (
                <p id="contact-message-error" className="text-xs font-medium text-red-600">
                  {errors.message}
                </p>
              ) : (
                <span className="text-xs text-ink-400">যত বিস্তারিত লিখবেন, তত ভালো।</span>
              )}
              <span className="shrink-0 text-xs text-ink-400">{form.message.length}/১০০০</span>
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
          <button type="submit" className="btn-primary flex-1 !py-3">
            <WhatsAppIcon className="h-4 w-4" />
            WhatsApp-এ পাঠান
          </button>
          <button
            type="button"
            onClick={() => send('email')}
            className="btn-outline flex-1 !py-3"
          >
            <MailIcon className="h-4 w-4" />
            ইমেইলে পাঠান
          </button>
        </div>

        <p className="mt-3 flex items-start gap-1.5 text-xs leading-relaxed text-ink-400">
          <InfoIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>
            ফর্মটি সাবমিট করলে আপনার মেসেজসহ WhatsApp বা ইমেইল অ্যাপ খুলবে। আমরা সাধারণত
            কয়েক ঘণ্টার মধ্যে উত্তর দেওয়ার চেষ্টা করি।
          </span>
        </p>

        {sentVia && (
          <div
            role="status"
            className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
          >
            <div className="flex items-start gap-2.5">
              <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                <CheckIcon className="h-3.5 w-3.5" />
              </span>
              <div>
                <p className="font-bold">
                  {sentVia === 'whatsapp' ? 'WhatsApp খোলা হচ্ছে…' : 'ইমেইল অ্যাপ খোলা হচ্ছে…'}
                </p>
                <p className="mt-1 text-xs text-emerald-700">
                  না খুললে{' '}
                  <a
                    href={fallbackUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold underline underline-offset-2"
                  >
                    এখানে ক্লিক করুন
                  </a>
                  ।
                </p>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
