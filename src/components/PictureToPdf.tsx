import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { DragEvent } from 'react';
import type { jsPDF } from 'jspdf';
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  DownloadIcon,
  FilePdfIcon,
  GripIcon,
  ImageIcon,
  InfoIcon,
  LoaderIcon,
  ShieldIcon,
  TrashIcon,
  UploadIcon,
} from './icons';

type PageSize = 'a4' | 'letter';
type Orientation = 'portrait' | 'landscape' | 'auto';
type Quality = 'high' | 'standard' | 'small';

interface PhotoItem {
  id: string;
  file: File;
  url: string;
}

interface Options {
  pageSize: PageSize;
  orientation: Orientation;
  margin: number;
  quality: Quality;
}

const MAX_FILES = 50;
const MAX_FILE_SIZE = 25 * 1024 * 1024;

const qualitySettings: Record<Quality, { maxDim: number; jpeg: number }> = {
  high: { maxDim: 2400, jpeg: 0.92 },
  standard: { maxDim: 1800, jpeg: 0.85 },
  small: { maxDim: 1400, jpeg: 0.78 },
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function makeId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function defaultFileName() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `abedon-ghor-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`;
}

async function imageFileToJpeg(
  file: File,
  maxDim: number,
  quality: number,
): Promise<{ dataUrl: string; width: number; height: number }> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('ছবিটি পড়া যায়নি।'));
      img.src = objectUrl;
    });

    const sourceWidth = image.naturalWidth || image.width;
    const sourceHeight = image.naturalHeight || image.height;
    if (!sourceWidth || !sourceHeight) throw new Error('ছবির সাইজ শনাক্ত করা যায়নি।');

    const scale = Math.min(1, maxDim / Math.max(sourceWidth, sourceHeight));
    const width = Math.max(1, Math.round(sourceWidth * scale));
    const height = Math.max(1, Math.round(sourceHeight * scale));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('আপনার ব্রাউজারে ছবি প্রসেস করা যাচ্ছে না।');

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(image, 0, 0, width, height);

    return {
      dataUrl: canvas.toDataURL('image/jpeg', quality),
      width,
      height,
    };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export default function PictureToPdf() {
  const [items, setItems] = useState<PhotoItem[]>([]);
  const [options, setOptions] = useState<Options>({
    pageSize: 'a4',
    orientation: 'auto',
    margin: 8,
    quality: 'standard',
  });
  const [fileName, setFileName] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<{ url: string; name: string; size: number } | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const itemsRef = useRef<PhotoItem[]>([]);
  const successUrlRef = useRef<string | null>(null);

  itemsRef.current = items;

  useEffect(() => {
    return () => {
      itemsRef.current.forEach((item) => URL.revokeObjectURL(item.url));
      if (successUrlRef.current) URL.revokeObjectURL(successUrlRef.current);
    };
  }, []);

  useEffect(() => {
    setFileName((current) => current || defaultFileName());
  }, []);

  const totalSize = useMemo(
    () => items.reduce((sum, item) => sum + item.file.size, 0),
    [items],
  );

  const addFiles = useCallback((fileList: FileList | File[]) => {
    const files = Array.from(fileList);
    if (!files.length) return;

    const accepted: PhotoItem[] = [];
    let rejectedType = 0;
    let rejectedSize = 0;

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        rejectedType += 1;
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        rejectedSize += 1;
        continue;
      }
      accepted.push({ id: makeId(), file, url: URL.createObjectURL(file) });
    }

    if (accepted.length) {
      setItems((current) => {
        const room = Math.max(0, MAX_FILES - current.length);
        const next = [...current, ...accepted.slice(0, room)];
        accepted.slice(room).forEach((item) => URL.revokeObjectURL(item.url));
        return next;
      });
      setSuccess(null);
      setError('');
    }

    const messages: string[] = [];
    if (rejectedType) messages.push(`${rejectedType}টি ফাইল ছবি নয়`);
    if (rejectedSize) messages.push(`${rejectedSize}টি ছবি ২৫ MB-এর বেশি`);
    if (items.length + accepted.length > MAX_FILES) {
      messages.push(`সর্বোচ্চ ${MAX_FILES}টি ছবি যোগ করা যাবে`);
    }
    if (messages.length) setError(`${messages.join('। ')}।`);
  }, [items.length]);

  const removeItem = (id: string) => {
    setItems((current) => {
      const target = current.find((item) => item.id === id);
      if (target) URL.revokeObjectURL(target.url);
      return current.filter((item) => item.id !== id);
    });
    setSuccess(null);
  };

  const moveItem = (index: number, direction: -1 | 1) => {
    setItems((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
    setSuccess(null);
  };

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);
    if (event.dataTransfer.files?.length) addFiles(event.dataTransfer.files);
  };

  const handleListDrop = (event: DragEvent<HTMLLIElement>, targetIndex: number) => {
    event.preventDefault();
    if (dragIndex === null || dragIndex === targetIndex) return;
    setItems((current) => {
      const next = [...current];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
    setDragIndex(null);
    setSuccess(null);
  };

  const convert = async () => {
    if (!items.length || isConverting) return;
    setIsConverting(true);
    setError('');
    setSuccess(null);
    setProgress({ done: 0, total: items.length });

    try {
      const { jsPDF: JsPDF } = await import('jspdf');
      const settings = qualitySettings[options.quality];
      let pdf: jsPDF | null = null;

      for (let index = 0; index < items.length; index += 1) {
        const item = items[index];
        const image = await imageFileToJpeg(item.file, settings.maxDim, settings.jpeg);

        const isLandscape = image.width > image.height;
        const orientation: 'portrait' | 'landscape' =
          options.orientation === 'auto'
            ? isLandscape
              ? 'landscape'
              : 'portrait'
            : options.orientation;

        if (!pdf) {
          pdf = new JsPDF({
            unit: 'mm',
            format: options.pageSize,
            orientation,
            compress: true,
          });
        } else {
          pdf.addPage(options.pageSize, orientation);
        }

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = Math.min(options.margin, Math.min(pageWidth, pageHeight) / 4);
        const availableWidth = pageWidth - margin * 2;
        const availableHeight = pageHeight - margin * 2;

        const scale = Math.min(
          availableWidth / image.width,
          availableHeight / image.height,
        );
        const drawWidth = image.width * scale;
        const drawHeight = image.height * scale;
        const x = (pageWidth - drawWidth) / 2;
        const y = (pageHeight - drawHeight) / 2;

        pdf.addImage(image.dataUrl, 'JPEG', x, y, drawWidth, drawHeight, undefined, 'FAST');
        setProgress({ done: index + 1, total: items.length });
        // Give the browser a frame to paint progress updates.
        await new Promise((resolve) => setTimeout(resolve, 0));
      }

      if (!pdf) throw new Error('কোনো ছবি পাওয়া যায়নি।');

      const blob = pdf.output('blob');
      const safeName =
        (fileName.trim() || defaultFileName())
          .replace(/[\\/:*?"<>|]+/g, '-')
          .replace(/\.pdf$/i, '')
          .trim()
          .slice(0, 80) || 'abedon-ghor';
      const downloadName = `${safeName}.pdf`;

      if (successUrlRef.current) URL.revokeObjectURL(successUrlRef.current);
      const url = URL.createObjectURL(blob);
      successUrlRef.current = url;
      setSuccess({ url, name: downloadName, size: blob.size });

      const link = document.createElement('a');
      link.href = url;
      link.download = downloadName;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : 'PDF তৈরি করা যায়নি। আবার চেষ্টা করুন অথবা ছোট ছবি ব্যবহার করুন।',
      );
    } finally {
      setIsConverting(false);
      setProgress({ done: 0, total: 0 });
    }
  };

  const downloadAgain = () => {
    if (!success) return;
    const link = document.createElement('a');
    link.href = success.url;
    link.download = success.name;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.45fr_1fr] lg:items-start">
      {/* Left: upload + list */}
      <div className="card overflow-hidden">
        <div className="border-b border-ink-100 px-5 py-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold text-ink-950">আপনার ছবিগুলো যোগ করুন</h2>
              <p className="mt-0.5 text-sm text-ink-500">
                JPG, PNG, WebP — একসাথে সর্বোচ্চ {MAX_FILES}টি ছবি।
              </p>
            </div>
            {items.length > 0 && (
              <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
                {items.length}টি ছবি • {formatBytes(totalSize)}
              </span>
            )}
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <label
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 text-center transition ${
              isDragging
                ? 'border-brand-500 bg-brand-50'
                : 'border-ink-200 bg-ink-50/60 hover:border-brand-300 hover:bg-brand-50/50'
            } ${items.length ? 'py-7' : 'py-14 sm:py-20'}`}
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              onChange={(event) => {
                if (event.target.files?.length) addFiles(event.target.files);
                event.target.value = '';
              }}
            />
            <span
              className={`inline-flex items-center justify-center rounded-2xl transition ${
                items.length ? 'h-11 w-11' : 'h-16 w-16'
              } ${
                isDragging
                  ? 'bg-brand-500 text-white'
                  : 'bg-white text-brand-600 shadow-sm group-hover:scale-105'
              }`}
            >
              <UploadIcon className={items.length ? 'h-5 w-5' : 'h-7 w-7'} />
            </span>
            <span className={`font-bold text-ink-950 ${items.length ? 'mt-3 text-sm' : 'mt-4 text-lg'}`}>
              ছবি টেনে এনে ছাড়ুন অথবা ক্লিক করুন
            </span>
            <span className="mt-1.5 max-w-sm text-sm leading-relaxed text-ink-500">
              {items.length
                ? 'আরও ছবি যোগ করতে ক্লিক করুন বা ড্র্যাগ করুন।'
                : 'মোবাইল গ্যালারি বা কম্পিউটার থেকে একাধিক ছবি নির্বাচন করতে পারবেন।'}
            </span>
            <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-ink-600 shadow-sm">
              <ImageIcon className="h-3.5 w-3.5 text-brand-600" />
              ছবি নির্বাচন করুন
            </span>
          </label>

          {error && (
            <div
              role="alert"
              className="mt-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              <InfoIcon className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {items.length > 0 && (
            <ul className="mt-5 space-y-2.5" aria-label="নির্বাচিত ছবির তালিকা">
              {items.map((item, index) => (
                <li
                  key={item.id}
                  draggable
                  onDragStart={() => setDragIndex(index)}
                  onDragEnd={() => setDragIndex(null)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => handleListDrop(event, index)}
                  className={`flex items-center gap-3 rounded-xl border bg-white p-2.5 transition ${
                    dragIndex === index
                      ? 'border-brand-400 opacity-60'
                      : 'border-ink-100 hover:border-ink-200'
                  }`}
                >
                  <span className="hidden cursor-grab text-ink-300 active:cursor-grabbing sm:block" aria-hidden="true">
                    <GripIcon className="h-5 w-5" />
                  </span>
                  <img
                    src={item.url}
                    alt=""
                    className="h-14 w-14 shrink-0 rounded-lg bg-ink-100 object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink-900">{item.file.name}</p>
                    <p className="mt-0.5 text-xs text-ink-400">
                      {formatBytes(item.file.size)} • পৃষ্ঠা {index + 1}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => moveItem(index, -1)}
                      disabled={index === 0}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 transition hover:bg-ink-100 hover:text-ink-900 disabled:cursor-not-allowed disabled:opacity-30"
                      aria-label={`${item.file.name} উপরে সরান`}
                    >
                      <ChevronUpIcon className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveItem(index, 1)}
                      disabled={index === items.length - 1}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 transition hover:bg-ink-100 hover:text-ink-900 disabled:cursor-not-allowed disabled:opacity-30"
                      aria-label={`${item.file.name} নিচে সরান`}
                    >
                      <ChevronDownIcon className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 transition hover:bg-red-50 hover:text-red-600"
                      aria-label={`${item.file.name} সরিয়ে ফেলুন`}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-5 flex items-start gap-2.5 rounded-xl bg-ink-50 px-4 py-3 text-xs leading-relaxed text-ink-500">
            <ShieldIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
            <p>
              আপনার ছবি কোনো সার্ভারে আপলোড হয় না। সম্পূর্ণ প্রক্রিয়াটি আপনার ব্রাউজারেই
              সম্পন্ন হয়, তাই ফাইল থাকবে সম্পূর্ণ নিরাপদ।
            </p>
          </div>
        </div>
      </div>

      {/* Right: settings */}
      <aside className="lg:sticky lg:top-24">
        <div className="card p-5 sm:p-6">
          <h2 className="text-lg font-bold text-ink-950">PDF সেটিংস</h2>
          <p className="mt-0.5 text-sm text-ink-500">প্রয়োজন অনুযায়ী সেটিংস ঠিক করুন।</p>

          <div className="mt-5 space-y-4">
            <div>
              <label htmlFor="page-size" className="field-label">
                পৃষ্ঠার সাইজ
              </label>
              <select
                id="page-size"
                value={options.pageSize}
                onChange={(event) =>
                  setOptions((current) => ({ ...current, pageSize: event.target.value as PageSize }))
                }
                className="field"
              >
                <option value="a4">A4 (সবচেয়ে বেশি ব্যবহৃত)</option>
                <option value="letter">Letter</option>
              </select>
            </div>

            <div>
              <span className="field-label">ওরিয়েন্টেশন</span>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { value: 'auto', label: 'অটো' },
                    { value: 'portrait', label: 'পোর্ট্রেট' },
                    { value: 'landscape', label: 'ল্যান্ডস্কেপ' },
                  ] as const
                ).map((choice) => (
                  <button
                    key={choice.value}
                    type="button"
                    onClick={() => setOptions((current) => ({ ...current, orientation: choice.value }))}
                    className={`rounded-lg border px-2 py-2 text-xs font-semibold transition ${
                      options.orientation === choice.value
                        ? 'border-brand-500 bg-brand-50 text-brand-700'
                        : 'border-ink-200 text-ink-600 hover:border-ink-300 hover:bg-ink-50'
                    }`}
                  >
                    {choice.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="margin" className="field-label">
                মার্জিন
              </label>
              <select
                id="margin"
                value={options.margin}
                onChange={(event) =>
                  setOptions((current) => ({ ...current, margin: Number(event.target.value) }))
                }
                className="field"
              >
                <option value={0}>মার্জিন ছাড়া</option>
                <option value={8}>ছোট মার্জিন</option>
                <option value={15}>স্বাভাবিক মার্জিন</option>
                <option value={25}>বড় মার্জিন</option>
              </select>
            </div>

            <div>
              <label htmlFor="quality" className="field-label">
                ছবির কোয়ালিটি
              </label>
              <select
                id="quality"
                value={options.quality}
                onChange={(event) =>
                  setOptions((current) => ({ ...current, quality: event.target.value as Quality }))
                }
                className="field"
              >
                <option value="high">উচ্চ কোয়ালিটি (বড় ফাইল)</option>
                <option value="standard">সাধারণ (সুপারিশকৃত)</option>
                <option value="small">ছোট ফাইল (ইমেইলের জন্য)</option>
              </select>
            </div>

            <div>
              <label htmlFor="file-name" className="field-label">
                ফাইলের নাম
              </label>
              <div className="flex items-center rounded-xl border border-ink-200 bg-white shadow-sm transition focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/10">
                <input
                  id="file-name"
                  type="text"
                  value={fileName}
                  onChange={(event) => setFileName(event.target.value)}
                  className="min-w-0 flex-1 rounded-l-xl border-0 bg-transparent px-4 py-3 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none"
                  placeholder="আমার-পিডিএফ"
                />
                <span className="shrink-0 pr-4 text-sm font-medium text-ink-400">.pdf</span>
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-ink-100 bg-ink-50/70 px-4 py-3 text-sm">
            <div className="flex items-center justify-between text-ink-600">
              <span>মোট ছবি</span>
              <span className="font-bold text-ink-900">{items.length}টি</span>
            </div>
            <div className="mt-1.5 flex items-center justify-between text-ink-600">
              <span>আনুমানিক পৃষ্ঠা</span>
              <span className="font-bold text-ink-900">{items.length}টি</span>
            </div>
          </div>

          <button
            type="button"
            onClick={convert}
            disabled={!items.length || isConverting}
            className="btn-primary mt-5 w-full !py-3.5 text-base disabled:!bg-ink-200 disabled:!text-ink-500 disabled:!shadow-none disabled:opacity-100"
          >
            {isConverting ? (
              <>
                <LoaderIcon className="h-5 w-5 animate-spin" />
                তৈরি হচ্ছে {progress.done}/{progress.total}
              </>
            ) : (
              <>
                <FilePdfIcon className="h-5 w-5" />
                PDF তৈরি ও ডাউনলোড
              </>
            )}
          </button>

          {isConverting && progress.total > 0 && (
            <div className="mt-3">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink-100">
                <div
                  className="h-full rounded-full bg-brand-500 transition-all duration-300"
                  style={{ width: `${(progress.done / progress.total) * 100}%` }}
                />
              </div>
            </div>
          )}

          {success && (
            <div
              role="status"
              className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
            >
              <div className="flex items-start gap-2.5">
                <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                  <CheckIcon className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0">
                  <p className="font-bold">PDF তৈরি হয়েছে!</p>
                  <p className="mt-1 truncate text-xs text-emerald-700">
                    {success.name} • {formatBytes(success.size)}
                  </p>
                  <button
                    type="button"
                    onClick={downloadAgain}
                    className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700"
                  >
                    <DownloadIcon className="h-3.5 w-3.5" />
                    আবার ডাউনলোড করুন
                  </button>
                </div>
              </div>
            </div>
          )}

          {!items.length && (
            <p className="mt-3 text-center text-xs text-ink-400">
              শুরু করতে অন্তত একটি ছবি যোগ করুন।
            </p>
          )}
        </div>

        <div className="mt-4 rounded-2xl border border-brand-100 bg-brand-50/60 p-4 text-xs leading-relaxed text-ink-600">
          <p className="font-bold text-ink-900">ছোট টিপস</p>
          <p className="mt-1">
            একাধিক পৃষ্ঠার নথির ছবি তুললে ক্রমানুসারে যোগ করুন। তালিকায় উপরে-নিচে সাজিয়ে
            পৃষ্ঠার ক্রম ঠিক করতে পারবেন।
          </p>
        </div>
      </aside>
    </div>
  );
}
