import { useEffect, useRef, useState } from 'react';
import {
  CheckIcon,
  DownloadIcon,
  FileCvIcon,
  InfoIcon,
  PlusIcon,
  PrinterIcon,
  SparklesIcon,
  TrashIcon,
} from './icons';

interface Experience {
  id: string;
  role: string;
  company: string;
  period: string;
  description: string;
}

interface Education {
  id: string;
  degree: string;
  institution: string;
  year: string;
  result: string;
}

interface CvData {
  name: string;
  title: string;
  phone: string;
  email: string;
  address: string;
  website: string;
  summary: string;
  skills: string;
  experiences: Experience[];
  educations: Education[];
  languages: string;
  references: string;
}

const STORAGE_KEY = 'abedon-ghor-cv-v1';

const emptyData: CvData = {
  name: '',
  title: '',
  phone: '',
  email: '',
  address: '',
  website: '',
  summary: '',
  skills: '',
  experiences: [
    { id: 'exp-1', role: '', company: '', period: '', description: '' },
  ],
  educations: [{ id: 'edu-1', degree: '', institution: '', year: '', result: '' }],
  languages: '',
  references: '',
};

const demoData: CvData = {
  name: 'মোঃ রাকিব হাসান',
  title: 'সফটওয়্যার ইঞ্জিনিয়ার',
  phone: '+880 1712-345678',
  email: 'rakib.hasan@example.com',
  address: 'মিরপুর-১০, ঢাকা-১২১৬',
  website: 'linkedin.com/in/rakibhasan',
  summary:
    '৩ বছরের অভিজ্ঞতাসম্পন্ন সফটওয়্যার ইঞ্জিনিয়ার। React ও Node.js দিয়ে ওয়েব অ্যাপ্লিকেশন ডেভেলপমেন্টে দক্ষ। দলগত কাজ, সমস্যা সমাধান এবং সময়ের মধ্যে প্রকল্প ডেলিভারিতে অভ্যস্ত।',
  skills: 'JavaScript, TypeScript, React, Node.js, Tailwind CSS, Git, REST API, টিমওয়ার্ক',
  experiences: [
    {
      id: 'exp-1',
      role: 'ফ্রন্টএন্ড ডেভেলপার',
      company: 'টেক সলিউশনস লিমিটেড, ঢাকা',
      period: '২০২৩ – বর্তমান',
      description:
        'React ও TypeScript দিয়ে ক্লায়েন্ট ড্যাশবোর্ড তৈরি করেছি।\nপেজ লোড টাইম ৪০% কমিয়েছি।\nজুনিয়র ডেভেলপারদের মেন্টরিং করেছি।',
    },
    {
      id: 'exp-2',
      role: 'জুনিয়র ওয়েব ডেভেলপার',
      company: 'ডিজিটাল বাংলা, ঢাকা',
      period: '২০২১ – ২০২২',
      description:
        'কোম্পানির ওয়েবসাইট ও ই-কমার্স ফ্রন্টএন্ড তৈরি করেছি।\nREST API ইন্টিগ্রেশন ও বাগ ফিক্সিং করেছি।',
    },
  ],
  educations: [
    {
      id: 'edu-1',
      degree: 'বিএসসি ইন কম্পিউটার সায়েন্স অ্যান্ড ইঞ্জিনিয়ারিং',
      institution: 'ঢাকা বিশ্ববিদ্যালয়',
      year: '২০২১',
      result: 'CGPA ৩.৬৫ / ৪.০০',
    },
    {
      id: 'edu-2',
      degree: 'উচ্চ মাধ্যমিক সার্টিফিকেট (HSC)',
      institution: 'নটর ডেম কলেজ, ঢাকা',
      year: '২০১৬',
      result: 'GPA ৫.০০',
    },
  ],
  languages: 'বাংলা (মাতৃভাষা), ইংরেজি (দক্ষ), হিন্দি (প্রাথমিক)',
  references: 'প্রয়োজনে উপলব্ধ।',
};

function newId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function splitList(value: string) {
  return value
    .split(/[,;\n]/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function splitLines(value: string) {
  return value
    .split('\n')
    .map((line) => line.replace(/^[-•*]\s*/, '').trim())
    .filter(Boolean);
}

export default function CvMaker() {
  const [data, setData] = useState<CvData>(emptyData);
  const [loaded, setLoaded] = useState(false);
  const [scale, setScale] = useState(1);
  const [wrapperHeight, setWrapperHeight] = useState(1123);

  const previewWrapperRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<CvData>;
        setData({
          ...emptyData,
          ...parsed,
          experiences:
            Array.isArray(parsed.experiences) && parsed.experiences.length
              ? parsed.experiences
              : emptyData.experiences,
          educations:
            Array.isArray(parsed.educations) && parsed.educations.length
              ? parsed.educations
              : emptyData.educations,
        });
      }
    } catch {
      // Ignore malformed saved data.
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Storage can be unavailable in private mode; editing still works.
    }
  }, [data, loaded]);

  useEffect(() => {
    const wrapper = previewWrapperRef.current;
    const page = pageRef.current;
    if (!wrapper || !page) return;

    const update = () => {
      const width = wrapper.clientWidth;
      const nextScale = Math.min(1, width / 794);
      setScale(nextScale);
      setWrapperHeight(page.offsetHeight * nextScale);
    };

    const observer = new ResizeObserver(update);
    observer.observe(wrapper);
    observer.observe(page);
    update();

    return () => observer.disconnect();
  }, []);

  const update = <K extends keyof CvData>(key: K, value: CvData[K]) => {
    setData((current) => ({ ...current, [key]: value }));
  };

  const updateExperience = (id: string, key: keyof Experience, value: string) => {
    setData((current) => ({
      ...current,
      experiences: current.experiences.map((item) =>
        item.id === id ? { ...item, [key]: value } : item,
      ),
    }));
  };

  const updateEducation = (id: string, key: keyof Education, value: string) => {
    setData((current) => ({
      ...current,
      educations: current.educations.map((item) =>
        item.id === id ? { ...item, [key]: value } : item,
      ),
    }));
  };

  const addExperience = () => {
    setData((current) => ({
      ...current,
      experiences: [
        ...current.experiences,
        { id: newId(), role: '', company: '', period: '', description: '' },
      ],
    }));
  };

  const addEducation = () => {
    setData((current) => ({
      ...current,
      educations: [
        ...current.educations,
        { id: newId(), degree: '', institution: '', year: '', result: '' },
      ],
    }));
  };

  const downloadPdf = () => {
    const previousTitle = document.title;
    const nextTitle = `${data.name.trim() || 'সিভি'} — CV`;
    document.title = nextTitle;

    const restore = () => {
      document.title = previousTitle;
      window.removeEventListener('afterprint', restore);
    };

    window.addEventListener('afterprint', restore);
    window.print();
    window.setTimeout(restore, 3000);
  };

  const skills = splitList(data.skills);
  const languages = splitList(data.languages);
  const references = splitLines(data.references);
  const experiences = data.experiences.filter(
    (item) => item.role || item.company || item.description,
  );
  const educations = data.educations.filter(
    (item) => item.degree || item.institution || item.year,
  );
  const summaryLines = splitLines(data.summary);
  const contactItems = [
    data.phone && { label: 'ফোন', value: data.phone },
    data.email && { label: 'ইমেইল', value: data.email },
    data.address && { label: 'ঠিকানা', value: data.address },
    data.website && { label: 'ওয়েবসাইট', value: data.website },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <div className="cv-layout grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-start">
      {/* Form */}
      <div className="cv-form-column card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-100 px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-lg font-bold text-ink-950">সিভির তথ্য দিন</h2>
            <p className="mt-0.5 text-sm text-ink-500">
              তথ্য লেখার সাথে সাথেই ডান পাশে সিভি তৈরি হবে।
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setData(demoData)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-xs font-semibold text-brand-700 transition hover:bg-brand-100"
            >
              <SparklesIcon className="h-3.5 w-3.5" />
              ডেমো ডেটা
            </button>
            <button
              type="button"
              onClick={() => setData(emptyData)}
              className="rounded-lg border border-ink-200 px-3 py-2 text-xs font-semibold text-ink-600 transition hover:bg-ink-50"
            >
              রিসেট
            </button>
          </div>
        </div>

        <div className="space-y-7 p-5 sm:p-6">
          <section aria-labelledby="cv-personal">
            <h3 id="cv-personal" className="text-sm font-bold tracking-wide text-ink-950">
              ০১. ব্যক্তিগত তথ্য
            </h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="cv-name" className="field-label">
                  পুরো নাম <span className="text-brand-600">*</span>
                </label>
                <input
                  id="cv-name"
                  type="text"
                  value={data.name}
                  onChange={(event) => update('name', event.target.value)}
                  className="field"
                  placeholder="যেমন: মোঃ রাকিব হাসান"
                  autoComplete="name"
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="cv-title" className="field-label">
                  পদবি / পেশা
                </label>
                <input
                  id="cv-title"
                  type="text"
                  value={data.title}
                  onChange={(event) => update('title', event.target.value)}
                  className="field"
                  placeholder="যেমন: সফটওয়্যার ইঞ্জিনিয়ার"
                />
              </div>
              <div>
                <label htmlFor="cv-phone" className="field-label">
                  মোবাইল নম্বর
                </label>
                <input
                  id="cv-phone"
                  type="tel"
                  value={data.phone}
                  onChange={(event) => update('phone', event.target.value)}
                  className="field"
                  placeholder="+880 17XX-XXXXXX"
                  autoComplete="tel"
                />
              </div>
              <div>
                <label htmlFor="cv-email" className="field-label">
                  ইমেইল
                </label>
                <input
                  id="cv-email"
                  type="email"
                  value={data.email}
                  onChange={(event) => update('email', event.target.value)}
                  className="field"
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>
              <div>
                <label htmlFor="cv-address" className="field-label">
                  ঠিকানা
                </label>
                <input
                  id="cv-address"
                  type="text"
                  value={data.address}
                  onChange={(event) => update('address', event.target.value)}
                  className="field"
                  placeholder="শহর, জেলা"
                  autoComplete="address-level2"
                />
              </div>
              <div>
                <label htmlFor="cv-website" className="field-label">
                  ওয়েবসাইট / LinkedIn
                </label>
                <input
                  id="cv-website"
                  type="text"
                  value={data.website}
                  onChange={(event) => update('website', event.target.value)}
                  className="field"
                  placeholder="linkedin.com/in/username"
                />
              </div>
            </div>
          </section>

          <section aria-labelledby="cv-summary">
            <h3 id="cv-summary" className="text-sm font-bold tracking-wide text-ink-950">
              ০২. ক্যারিয়ার সারসংক্ষেপ
            </h3>
            <textarea
              id="cv-summary"
              value={data.summary}
              onChange={(event) => update('summary', event.target.value)}
              rows={4}
              className="field mt-3 resize-y"
              placeholder="সংক্ষেপে নিজের অভিজ্ঞতা, দক্ষতা ও লক্ষ্য লিখুন (৩–৪ লাইন)।"
            />
          </section>

          <section aria-labelledby="cv-skills">
            <h3 id="cv-skills" className="text-sm font-bold tracking-wide text-ink-950">
              ০৩. দক্ষতা
            </h3>
            <textarea
              id="cv-skills"
              value={data.skills}
              onChange={(event) => update('skills', event.target.value)}
              rows={2}
              className="field mt-3 resize-y"
              placeholder="কমা দিয়ে আলাদা করুন: React, Excel, টিমওয়ার্ক"
            />
            <p className="mt-1.5 text-xs text-ink-400">
              প্রতিটি দক্ষতা কমা (,) দিয়ে আলাদা করুন। এগুলো সিভিতে আলাদা ব্যাজ হিসেবে দেখাবে।
            </p>
          </section>

          <section aria-labelledby="cv-experience">
            <div className="flex items-center justify-between gap-2">
              <h3 id="cv-experience" className="text-sm font-bold tracking-wide text-ink-950">
                ০৪. কর্ম অভিজ্ঞতা
              </h3>
              <button
                type="button"
                onClick={addExperience}
                className="inline-flex items-center gap-1 rounded-lg bg-ink-950 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-ink-800"
              >
                <PlusIcon className="h-3.5 w-3.5" />
                যোগ করুন
              </button>
            </div>

            <div className="mt-3 space-y-3">
              {data.experiences.map((item, index) => (
                <div key={item.id} className="rounded-xl border border-ink-100 bg-ink-50/50 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold text-ink-500">অভিজ্ঞতা {index + 1}</p>
                    {data.experiences.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          setData((current) => ({
                            ...current,
                            experiences: current.experiences.filter((exp) => exp.id !== item.id),
                          }))
                        }
                        className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-ink-400 transition hover:bg-red-50 hover:text-red-600"
                        aria-label={`অভিজ্ঞতা ${index + 1} মুছুন`}
                      >
                        <TrashIcon className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="mt-2.5 grid gap-3 sm:grid-cols-2">
                    <div>
                      <label htmlFor={`exp-role-${item.id}`} className="field-label">
                        পদবি
                      </label>
                      <input
                        id={`exp-role-${item.id}`}
                        type="text"
                        value={item.role}
                        onChange={(event) => updateExperience(item.id, 'role', event.target.value)}
                        className="field !bg-white"
                        placeholder="যেমন: অ্যাকাউন্ট্যান্ট"
                      />
                    </div>
                    <div>
                      <label htmlFor={`exp-company-${item.id}`} className="field-label">
                        প্রতিষ্ঠান
                      </label>
                      <input
                        id={`exp-company-${item.id}`}
                        type="text"
                        value={item.company}
                        onChange={(event) => updateExperience(item.id, 'company', event.target.value)}
                        className="field !bg-white"
                        placeholder="প্রতিষ্ঠানের নাম"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor={`exp-period-${item.id}`} className="field-label">
                        সময়কাল
                      </label>
                      <input
                        id={`exp-period-${item.id}`}
                        type="text"
                        value={item.period}
                        onChange={(event) => updateExperience(item.id, 'period', event.target.value)}
                        className="field !bg-white"
                        placeholder="যেমন: জানুয়ারি ২০২২ – বর্তমান"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor={`exp-desc-${item.id}`} className="field-label">
                        দায়িত্ব ও অর্জন
                      </label>
                      <textarea
                        id={`exp-desc-${item.id}`}
                        value={item.description}
                        onChange={(event) =>
                          updateExperience(item.id, 'description', event.target.value)
                        }
                        rows={3}
                        className="field resize-y !bg-white"
                        placeholder="প্রতিটি লাইনে একটি করে পয়েন্ট লিখুন।"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section aria-labelledby="cv-education">
            <div className="flex items-center justify-between gap-2">
              <h3 id="cv-education" className="text-sm font-bold tracking-wide text-ink-950">
                ০৫. শিক্ষা
              </h3>
              <button
                type="button"
                onClick={addEducation}
                className="inline-flex items-center gap-1 rounded-lg bg-ink-950 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-ink-800"
              >
                <PlusIcon className="h-3.5 w-3.5" />
                যোগ করুন
              </button>
            </div>

            <div className="mt-3 space-y-3">
              {data.educations.map((item, index) => (
                <div key={item.id} className="rounded-xl border border-ink-100 bg-ink-50/50 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold text-ink-500">শিক্ষা {index + 1}</p>
                    {data.educations.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          setData((current) => ({
                            ...current,
                            educations: current.educations.filter((edu) => edu.id !== item.id),
                          }))
                        }
                        className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-ink-400 transition hover:bg-red-50 hover:text-red-600"
                        aria-label={`শিক্ষা ${index + 1} মুছুন`}
                      >
                        <TrashIcon className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="mt-2.5 grid gap-3 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label htmlFor={`edu-degree-${item.id}`} className="field-label">
                        ডিগ্রি / কোর্স
                      </label>
                      <input
                        id={`edu-degree-${item.id}`}
                        type="text"
                        value={item.degree}
                        onChange={(event) => updateEducation(item.id, 'degree', event.target.value)}
                        className="field !bg-white"
                        placeholder="যেমন: বিএসসি ইন কম্পিউটার সায়েন্স"
                      />
                    </div>
                    <div>
                      <label htmlFor={`edu-inst-${item.id}`} className="field-label">
                        প্রতিষ্ঠান
                      </label>
                      <input
                        id={`edu-inst-${item.id}`}
                        type="text"
                        value={item.institution}
                        onChange={(event) =>
                          updateEducation(item.id, 'institution', event.target.value)
                        }
                        className="field !bg-white"
                        placeholder="বিশ্ববিদ্যালয় / কলেজ"
                      />
                    </div>
                    <div>
                      <label htmlFor={`edu-year-${item.id}`} className="field-label">
                        পাসের বছর
                      </label>
                      <input
                        id={`edu-year-${item.id}`}
                        type="text"
                        value={item.year}
                        onChange={(event) => updateEducation(item.id, 'year', event.target.value)}
                        className="field !bg-white"
                        placeholder="যেমন: ২০২১"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor={`edu-result-${item.id}`} className="field-label">
                        ফলাফল (ঐচ্ছিক)
                      </label>
                      <input
                        id={`edu-result-${item.id}`}
                        type="text"
                        value={item.result}
                        onChange={(event) => updateEducation(item.id, 'result', event.target.value)}
                        className="field !bg-white"
                        placeholder="যেমন: CGPA ৩.৬৫ / ৪.০০"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section aria-labelledby="cv-extra">
            <h3 id="cv-extra" className="text-sm font-bold tracking-wide text-ink-950">
              ০৬. ভাষা ও রেফারেন্স
            </h3>
            <div className="mt-3 space-y-3">
              <div>
                <label htmlFor="cv-languages" className="field-label">
                  ভাষা
                </label>
                <input
                  id="cv-languages"
                  type="text"
                  value={data.languages}
                  onChange={(event) => update('languages', event.target.value)}
                  className="field"
                  placeholder="বাংলা (মাতৃভাষা), ইংরেজি (দক্ষ)"
                />
              </div>
              <div>
                <label htmlFor="cv-references" className="field-label">
                  রেফারেন্স (ঐচ্ছিক)
                </label>
                <textarea
                  id="cv-references"
                  value={data.references}
                  onChange={(event) => update('references', event.target.value)}
                  rows={3}
                  className="field resize-y"
                  placeholder="রেফারেন্সের নাম, পদবি ও যোগাযোগের তথ্য। প্রযোজ্য না হলে ‘প্রয়োজনে উপলব্ধ’ লিখুন।"
                />
              </div>
            </div>
          </section>

          <div className="flex items-start gap-2.5 rounded-xl bg-brand-50/70 px-4 py-3 text-xs leading-relaxed text-ink-600">
            <InfoIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
            <p>
              আপনার তথ্য শুধু আপনার ব্রাউজারে সংরক্ষিত থাকে। পেজ রিফ্রেশ করলেও তথ্য
              হারাবে না, তবে অন্য ডিভাইসে দেখা যাবে না।
            </p>
          </div>
        </div>
      </div>

      {/* Preview */}
      <aside className="cv-preview-column lg:sticky lg:top-24">
        <div className="cv-preview-card card overflow-hidden">
          <div className="cv-preview-header flex flex-wrap items-center justify-between gap-3 border-b border-ink-100 px-5 py-4">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-bold text-ink-950">
                <FileCvIcon className="h-5 w-5 text-brand-600" />
                লাইভ প্রিভিউ
              </h2>
              <p className="mt-0.5 text-xs text-ink-500">A4 সাইজ • প্রিন্ট ও PDF-এর জন্য প্রস্তুত</p>
            </div>
            <button type="button" onClick={downloadPdf} className="btn-primary !px-4 !py-2.5 text-sm">
              <DownloadIcon className="h-4 w-4" />
              PDF ডাউনলোড
            </button>
          </div>

          <div className="cv-preview-bg bg-ink-100/70 p-3 sm:p-5">
            <div
              ref={previewWrapperRef}
              className="cv-print-area relative mx-auto w-full max-w-[794px] overflow-hidden"
              style={{ height: `${wrapperHeight}px` }}
            >
              <div
                ref={pageRef}
                className="cv-page absolute top-0 left-0 bg-white text-ink-900 shadow-xl"
                style={{
                  width: '794px',
                  minHeight: '1123px',
                  transform: `scale(${scale})`,
                  transformOrigin: 'top left',
                  padding: '48px 52px',
                }}
              >
                {/* CV header */}
                <header className="border-b-2 border-brand-500 pb-5">
                  <h1 className="text-[32px] leading-tight font-bold tracking-tight text-ink-950">
                    {data.name.trim() || 'আপনার নাম'}
                  </h1>
                  {data.title.trim() && (
                    <p className="mt-1 text-[15px] font-semibold text-brand-600">{data.title}</p>
                  )}
                  {contactItems.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[11.5px] text-ink-600">
                      {contactItems.map((item) => (
                        <span key={item.label}>
                          <span className="font-semibold text-ink-800">{item.label}:</span>{' '}
                          {item.value}
                        </span>
                      ))}
                    </div>
                  )}
                </header>

                <div className="mt-5 space-y-5">
                  {summaryLines.length > 0 && (
                    <section>
                      <h2 className="mb-2 flex items-center gap-2 text-[12px] font-bold tracking-[0.08em] text-ink-950">
                        <span className="inline-block h-3 w-1 rounded-full bg-brand-500"></span>
                        ক্যারিয়ার সারসংক্ষেপ
                      </h2>
                      <div className="space-y-1 text-[12px] leading-relaxed text-ink-600">
                        {summaryLines.map((line, index) => (
                          <p key={index}>{line}</p>
                        ))}
                      </div>
                    </section>
                  )}

                  {skills.length > 0 && (
                    <section>
                      <h2 className="mb-2 flex items-center gap-2 text-[12px] font-bold tracking-[0.08em] text-ink-950">
                        <span className="inline-block h-3 w-1 rounded-full bg-brand-500"></span>
                        দক্ষতা
                      </h2>
                      <div className="flex flex-wrap gap-1.5">
                        {skills.map((skill) => (
                          <span
                            key={skill}
                            className="rounded-md bg-brand-50 px-2 py-0.5 text-[11px] font-medium text-brand-800"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </section>
                  )}

                  {experiences.length > 0 && (
                    <section>
                      <h2 className="mb-2 flex items-center gap-2 text-[12px] font-bold tracking-[0.08em] text-ink-950">
                        <span className="inline-block h-3 w-1 rounded-full bg-brand-500"></span>
                        কর্ম অভিজ্ঞতা
                      </h2>
                      <div className="space-y-3">
                        {experiences.map((item) => (
                          <div key={item.id} className="break-inside-avoid">
                            <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                              <h3 className="text-[12.5px] font-bold text-ink-900">
                                {item.role || 'পদবি'}
                              </h3>
                              {item.period && (
                                <span className="text-[11px] font-medium text-ink-500">
                                  {item.period}
                                </span>
                              )}
                            </div>
                            {item.company && (
                              <p className="text-[11.5px] font-medium text-brand-700">{item.company}</p>
                            )}
                            {splitLines(item.description).length > 0 && (
                              <ul className="mt-1 space-y-0.5 pl-4">
                                {splitLines(item.description).map((line, index) => (
                                  <li
                                    key={index}
                                    className="list-disc text-[11.5px] leading-relaxed text-ink-600"
                                  >
                                    {line}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {educations.length > 0 && (
                    <section>
                      <h2 className="mb-2 flex items-center gap-2 text-[12px] font-bold tracking-[0.08em] text-ink-950">
                        <span className="inline-block h-3 w-1 rounded-full bg-brand-500"></span>
                        শিক্ষা
                      </h2>
                      <div className="space-y-2.5">
                        {educations.map((item) => (
                          <div
                            key={item.id}
                            className="flex flex-wrap items-baseline justify-between gap-x-3 break-inside-avoid"
                          >
                            <div>
                              <h3 className="text-[12.5px] font-bold text-ink-900">
                                {item.degree || 'ডিগ্রি / কোর্স'}
                              </h3>
                              <p className="text-[11.5px] text-ink-600">
                                {[item.institution, item.result].filter(Boolean).join(' • ')}
                              </p>
                            </div>
                            {item.year && (
                              <span className="text-[11px] font-medium text-ink-500">{item.year}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {languages.length > 0 && (
                    <section>
                      <h2 className="mb-2 flex items-center gap-2 text-[12px] font-bold tracking-[0.08em] text-ink-950">
                        <span className="inline-block h-3 w-1 rounded-full bg-brand-500"></span>
                        ভাষা
                      </h2>
                      <p className="text-[11.5px] leading-relaxed text-ink-600">
                        {languages.join(' • ')}
                      </p>
                    </section>
                  )}

                  {references.length > 0 && (
                    <section>
                      <h2 className="mb-2 flex items-center gap-2 text-[12px] font-bold tracking-[0.08em] text-ink-950">
                        <span className="inline-block h-3 w-1 rounded-full bg-brand-500"></span>
                        রেফারেন্স
                      </h2>
                      <div className="space-y-0.5 text-[11.5px] leading-relaxed text-ink-600">
                        {references.map((line, index) => (
                          <p key={index}>{line}</p>
                        ))}
                      </div>
                    </section>
                  )}
                </div>

                <footer className="mt-6 border-t border-ink-100 pt-2 text-right text-[9px] text-ink-300">
                  {data.name.trim() ? `${data.name.trim()} — সিভি` : 'সিভি'}
                </footer>
              </div>
            </div>
          </div>

          <div className="cv-preview-footer border-t border-ink-100 px-5 py-4">
            <button type="button" onClick={downloadPdf} className="btn-dark w-full">
              <PrinterIcon className="h-4 w-4" />
              প্রিন্ট ডায়ালগ খুলুন
            </button>
            <p className="mt-2.5 flex items-start gap-1.5 text-xs leading-relaxed text-ink-500">
              <InfoIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-600" />
              <span>
                ডাউনলোড বাটনে ক্লিক করে প্রিন্ট ডায়ালগ থেকে <strong>“Save as PDF”</strong>{' '}
                নির্বাচন করুন। মোবাইলে শেয়ার মেনু → Print → Save as PDF ব্যবহার করুন।
              </span>
            </p>
            <div className="mt-3 flex items-center gap-1.5 text-[11px] text-emerald-700">
              <CheckIcon className="h-3.5 w-3.5" />
              তথ্য স্বয়ংক্রিয়ভাবে এই ব্রাউজারে সেভ হচ্ছে
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
