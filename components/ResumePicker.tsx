'use client';

import { useState } from 'react';
import { api, ApiError } from '@/lib/api';
import type { ResumeSummary } from '@/lib/types';
import { Spinner } from './Spinner';
import { FileText, Plus, Upload, Check } from 'lucide-react';

interface Props {
  resumes: ResumeSummary[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAdded: (resume: ResumeSummary) => void;
}

export function ResumePicker({ resumes, selectedId, onSelect, onAdded }: Props) {
  const [adding, setAdding] = useState(resumes.length === 0);
  const [tab, setTab] = useState<'paste' | 'upload'>('paste');
  const [text, setText] = useState('');
  const [label, setLabel] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submitPaste = async () => {
    setError('');
    setLoading(true);
    try {
      const { resume } = await api.createResumeText({ label: label || undefined, text });
      onAdded(resume);
      setText('');
      setLabel('');
      setAdding(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save resume.');
    } finally {
      setLoading(false);
    }
  };

  const submitUpload = async (file: File) => {
    setError('');
    setLoading(true);
    try {
      const { resume } = await api.uploadResume(file);
      onAdded(resume);
      setAdding(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not upload resume.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {resumes.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {resumes.map((r) => {
            const active = r.id === selectedId;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => onSelect(r.id)}
                className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-all duration-200 ${
                  active
                    ? 'border-brand-400 bg-brand-50/60 ring-2 ring-brand-100'
                    : 'border-line bg-surface hover:border-ink/20'
                }`}
              >
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ink/5 text-ink-soft">
                  <FileText className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium text-ink">{r.label}</span>
                    {active && <Check className="h-4 w-4 shrink-0 text-brand-600" />}
                  </span>
                  <span className="mt-0.5 line-clamp-2 block text-xs text-ink-muted">{r.excerpt}</span>
                </span>
              </button>
            );
          })}
        </div>
      )}

      {adding ? (
        <div className="card p-4">
          <div className="mb-3 inline-flex rounded-lg border border-line p-0.5">
            {(['paste', 'upload'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
                  tab === t ? 'bg-ink text-white' : 'text-ink-soft hover:text-ink'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {tab === 'paste' ? (
            <div className="space-y-3">
              <input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Label (optional) — e.g. Software Engineer resume"
                className="input"
              />
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste your full resume text here…"
                rows={8}
                className="input resize-y"
              />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={submitPaste}
                  disabled={loading || text.trim().length < 30}
                  className="btn-brand"
                >
                  {loading ? <Spinner /> : 'Save resume'}
                </button>
                {resumes.length > 0 && (
                  <button type="button" onClick={() => setAdding(false)} className="btn-ghost">
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ) : (
            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-line bg-canvas px-4 py-10 text-center transition-colors hover:border-brand-300">
              <Upload className="h-6 w-6 text-ink-muted" />
              <span className="text-sm font-medium text-ink">Click to upload PDF, DOCX, or TXT</span>
              <span className="text-xs text-ink-muted">Max 5 MB</span>
              <input
                type="file"
                accept=".pdf,.docx,.txt"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void submitUpload(file);
                }}
              />
              {loading && <Spinner className="mt-2 h-5 w-5" />}
            </label>
          )}

          {error && <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          <Plus className="h-4 w-4" />
          Add another resume
        </button>
      )}
    </div>
  );
}
