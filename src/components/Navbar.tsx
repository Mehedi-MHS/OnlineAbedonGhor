import { useEffect, useRef, useState } from 'react';
import { navLinks, site } from '@/data/site';
import {
  CloseIcon,
  FileCvIcon,
  FilePdfIcon,
  LogoMark,
  MailIcon,
  MenuIcon,
  MessengerIcon,
  WhatsAppIcon,
} from './icons';

interface NavbarProps {
  pathname?: string;
}

export default function Navbar({ pathname = '/' }: NavbarProps) {
  const [open, setOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const currentPath = pathname.replace(/\/$/, '') || '/';

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const isActive = (href: string) => {
    const clean = href.replace(/\/$/, '') || '/';
    return currentPath === clean || (clean !== '/' && currentPath.startsWith(`${clean}/`));
  };

  return (
    <>
      <header className="no-print sticky top-0 z-50 border-b border-ink-100/80 bg-white/85 backdrop-blur-xl">
      <div className="container-page">
        <div className="flex h-[72px] items-center justify-between gap-4">
          <a
            href="/"
            className="group flex shrink-0 items-center gap-3 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-500"
            aria-label={`${site.name} — হোমপেজ`}
          >
            <LogoMark className="h-11 w-11 shrink-0 rounded-xl shadow-sm transition-transform duration-300 group-hover:-rotate-3" />
            <span className="leading-tight">
              <span className="block text-[17px] font-bold tracking-tight text-ink-950 sm:text-lg">
                {site.name}
              </span>
              <span className="hidden text-[11px] font-medium text-ink-500 sm:block">
                {site.tagline}
              </span>
            </span>
          </a>

          <nav aria-label="প্রধান মেনু" className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                aria-current={isActive(link.href) ? 'page' : undefined}
                className={`relative rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                  isActive(link.href)
                    ? 'text-brand-600'
                    : 'text-ink-600 hover:bg-ink-50 hover:text-ink-950'
                }`}
              >
                {link.label}
                {isActive(link.href) && (
                  <span className="absolute inset-x-4 -bottom-[21px] h-0.5 rounded-full bg-brand-500" />
                )}
              </a>
            ))}
            <a href="/picture-to-pdf" className="btn-primary ml-3 !px-4 !py-2.5">
              <FilePdfIcon className="h-4 w-4" />
              ফ্রি শুরু করুন
            </a>
          </nav>

          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-ink-200 bg-white text-ink-900 transition hover:border-ink-300 hover:bg-ink-50 lg:hidden"
            aria-label="মেনু খুলুন"
            aria-expanded={open}
            aria-controls="mobile-menu"
          >
            <MenuIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>

      {/* Mobile side panel */}
      <div
        className={`no-print fixed inset-0 z-[60] lg:hidden ${open ? '' : 'pointer-events-none'}`}
        aria-hidden={!open}
      >
        <div
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-ink-950/55 backdrop-blur-sm transition-opacity duration-300 ${
            open ? 'opacity-100' : 'opacity-0'
          }`}
        />
        <aside
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="মোবাইল মেনু"
          inert={!open}
          className={`absolute top-0 right-0 flex h-full w-[min(88vw,22rem)] flex-col bg-white shadow-2xl transition-transform duration-300 ease-out ${
            open ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
            <a href="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
              <LogoMark className="h-10 w-10 rounded-xl" />
              <span className="text-base font-bold text-ink-950">{site.name}</span>
            </a>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-ink-200 text-ink-700 transition hover:bg-ink-50"
              aria-label="মেনু বন্ধ করুন"
            >
              <CloseIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-6">
            <p className="mb-3 px-2 text-xs font-semibold tracking-wider text-ink-400 uppercase">
              পেজগুলো
            </p>
            <nav aria-label="মোবাইল নেভিগেশন" className="flex flex-col gap-1.5">
              <a
                href="/"
                onClick={() => setOpen(false)}
                aria-current={currentPath === '/' ? 'page' : undefined}
                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-[15px] font-semibold transition ${
                  currentPath === '/'
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-ink-700 hover:bg-ink-50'
                }`}
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-ink-950 text-white">
                  <LogoMark className="h-5 w-5 rounded" />
                </span>
                হোমপেজ
              </a>
              {navLinks.map((link) => {
                const Icon =
                  link.href === '/picture-to-pdf'
                    ? FilePdfIcon
                    : link.href === '/cv-maker'
                      ? FileCvIcon
                      : MailIcon;
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    aria-current={isActive(link.href) ? 'page' : undefined}
                    className={`flex items-center gap-3 rounded-xl px-3 py-3 text-[15px] font-semibold transition ${
                      isActive(link.href)
                        ? 'bg-brand-50 text-brand-700'
                        : 'text-ink-700 hover:bg-ink-50'
                    }`}
                  >
                    <span
                      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${
                        isActive(link.href)
                          ? 'bg-brand-500 text-white'
                          : 'bg-ink-100 text-ink-700'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    {link.label}
                  </a>
                );
              })}
            </nav>

            <a
              href="/picture-to-pdf"
              onClick={() => setOpen(false)}
              className="btn-primary mt-6 w-full"
            >
              <FilePdfIcon className="h-4 w-4" />
              ফ্রি শুরু করুন
            </a>

            <div className="mt-8 rounded-2xl bg-ink-950 p-5 text-white">
              <p className="text-sm font-semibold">সরাসরি সাহায্য দরকার?</p>
              <p className="mt-1 text-xs leading-relaxed text-white/60">
                WhatsApp বা Messenger-এ মেসেজ করুন। আমরা দ্রুত উত্তর দেওয়ার চেষ্টা করি।
              </p>
              <div className="mt-4 flex gap-2">
                <a
                  href={site.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#25D366] px-3 py-2.5 text-xs font-bold text-ink-950 transition hover:brightness-105"
                >
                  <WhatsAppIcon className="h-4 w-4" />
                  WhatsApp
                </a>
                <a
                  href={site.messenger}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#0084FF] px-3 py-2.5 text-xs font-bold text-white transition hover:brightness-105"
                >
                  <MessengerIcon className="h-4 w-4" />
                  Messenger
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-ink-100 px-5 py-4 text-xs text-ink-400">
            © {new Date().getFullYear()} {site.name}
          </div>
        </aside>
      </div>
    </>
  );
}
