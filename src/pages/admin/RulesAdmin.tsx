import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { fetchSymptoms } from '../../services/symptomService';
import { fetchConditions } from '../../services/conditionService';
import DataTable, { ColumnDef } from '../../components/admin/DataTable';
import type { Symptom, Condition } from '../../types/knowledge-base';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface RuleRow {
  id: string;
  code: string;
  condition_id: string;
  symptom_ids: string[];
}

interface Rule {
  id: string;
  code: string;
  conditionId: string;
  symptomIds: string[];
}

function toRule(row: RuleRow): Rule {
  return {
    id: row.id,
    code: row.code ?? '',
    conditionId: row.condition_id,
    symptomIds: row.symptom_ids ?? [],
  };
}

// ---------------------------------------------------------------------------
// Catatan: Kode G/K/R sekarang berasal dari field `code` yang tersimpan di DB.
// Helper buildSymptomCodeMap dan buildConditionCodeMap yang berbasis index
// sudah dihapus. Seluruh lookup kode menggunakan Symptom.code dan Condition.code
// langsung dari data yang di-fetch.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

interface FormErrors {
  id?: string;
  conditionId?: string;
  symptomIds?: string;
  duplicate?: string;
}

function validateForm(
  id: string,
  conditionId: string,
  selectedSymptomIds: string[],
  existingRules: Rule[],
  isEdit: boolean,
): FormErrors {
  const errors: FormErrors = {};

  if (!id.trim()) {
    errors.id = 'Kode rule wajib diisi.';
  } else if (id.trim().length > 255) {
    errors.id = 'Kode rule maksimal 255 karakter.';
  } else if (!isEdit) {
    // Cek duplikat ID hanya saat create
    const isDuplicate = existingRules.some((r) => r.id === id.trim());
    if (isDuplicate) errors.id = 'Kode rule sudah digunakan.';
  }

  if (!conditionId) {
    errors.conditionId = 'Pilih jenis kerusakan.';
  }

  if (selectedSymptomIds.length === 0) {
    errors.symptomIds = 'Pilih minimal satu gejala.';
  }

  // Cek rule duplikat persis (conditionId + symptomIds sama)
  if (conditionId && selectedSymptomIds.length > 0) {
    const sorted = [...selectedSymptomIds].sort().join('|');
    const isDupRule = existingRules.some((r) => {
      if (isEdit && r.id === id.trim()) return false; // abaikan rule sendiri saat edit
      return (
        r.conditionId === conditionId &&
        [...r.symptomIds].sort().join('|') === sorted
      );
    });
    if (isDupRule) errors.duplicate = 'Rule yang sama sudah ada.';
  }

  return errors;
}

// ---------------------------------------------------------------------------
// SymptomMultiSelect — pilih beberapa gejala dengan tag pill
// ---------------------------------------------------------------------------

interface SymptomMultiSelectProps {
  allSymptoms: Symptom[];
  selected: string[];
  onChange: (ids: string[]) => void;
  error?: string;
  isLoadingSymptoms: boolean;
}

function SymptomMultiSelect({
  allSymptoms,
  selected,
  onChange,
  error,
  isLoadingSymptoms,
}: SymptomMultiSelectProps) {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);

  // Group by category untuk kemudahan navigasi
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return allSymptoms.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q),
    );
  }, [allSymptoms, search]);

  // Group hasil filter berdasarkan category
  const grouped = useMemo(() => {
    const map = new Map<string, Symptom[]>();
    for (const s of filtered) {
      if (!map.has(s.category)) map.set(s.category, []);
      map.get(s.category)!.push(s);
    }
    return map;
  }, [filtered]);

  const toggle = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((x) => x !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  const removeTag = (id: string) => {
    onChange(selected.filter((x) => x !== id));
  };

  const selectedSymptoms = allSymptoms.filter((s) => selected.includes(s.id));

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Gejala (IF){' '}
        <span className="text-red-500" aria-hidden="true">*</span>
      </label>

      {/* Loading skeleton */}
      {isLoadingSymptoms && (
        <div className="w-full rounded-clay-sm border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-500 animate-pulse">
          Memuat daftar gejala…
        </div>
      )}

      {!isLoadingSymptoms && (
        <>
          {/* Selected pills */}
          {selectedSymptoms.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {selectedSymptoms.map((s) => (
                <span
                  key={s.id}
                  className="inline-flex items-center gap-1 rounded-full bg-primary-100 text-primary-800 text-xs font-medium px-2.5 py-1"
                >
                  <span className="font-mono font-semibold">{s.code || s.id}</span>
                  <span className="mx-0.5 text-primary-400">—</span>
                  <span>{s.name}</span>
                  <button
                    type="button"
                    onClick={() => removeTag(s.id)}
                    className="ml-0.5 rounded-full hover:bg-primary-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-500 w-4 h-4 flex items-center justify-center"
                    aria-label={`Hapus gejala ${s.name}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Dropdown trigger + search */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className={`w-full text-left rounded-clay-sm border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 transition flex items-center justify-between ${
                error ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'
              }`}
              aria-haspopup="listbox"
              aria-expanded={open}
            >
              <span className="text-gray-500">
                {selectedSymptoms.length === 0
                  ? 'Klik untuk memilih gejala…'
                  : `${selectedSymptoms.length} gejala dipilih`}
              </span>
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {open && (
              <div className="absolute z-20 mt-1 w-full rounded-clay-sm border border-gray-200 bg-white shadow-lg max-h-64 overflow-hidden flex flex-col">
                {/* Search box */}
                <div className="p-2 border-b border-gray-100">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari gejala…"
                    className="w-full rounded border border-gray-200 px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary-400"
                    autoFocus
                  />
                </div>

                {/* Grouped options */}
                <div className="overflow-y-auto flex-1" role="listbox" aria-multiselectable="true">
                  {grouped.size === 0 ? (
                    <p className="px-3 py-4 text-xs text-gray-500 text-center">Tidak ada gejala ditemukan.</p>
                  ) : (
                    Array.from(grouped.entries()).map(([category, symptoms]) => (
                      <div key={category}>
                        <p className="px-3 py-1 text-xs font-semibold text-gray-500 bg-gray-50 sticky top-0">
                          {category}
                        </p>
                        {symptoms.map((s) => {
                          const isChecked = selected.includes(s.id);
                          return (
                            <button
                              key={s.id}
                              type="button"
                              role="option"
                              aria-selected={isChecked}
                              onClick={() => toggle(s.id)}
                              className={`w-full text-left flex items-start gap-2 px-3 py-2 text-xs hover:bg-gray-50 transition-colors ${
                                isChecked ? 'bg-primary-50' : ''
                              }`}
                            >
                              <span
                                className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center ${
                                  isChecked
                                    ? 'bg-primary-600 border-primary-600 text-white'
                                    : 'border-gray-300'
                                }`}
                                aria-hidden="true"
                              >
                                {isChecked && (
                                  <svg viewBox="0 0 12 12" fill="currentColor" className="w-2.5 h-2.5">
                                    <path d="M1 6l3.5 3.5L11 2" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                )}
                              </span>
                              <span>
                                <span className="font-mono font-semibold text-primary-700">{s.code || s.id}</span>
                                <span className="mx-1 text-gray-300">—</span>
                                <span className="text-gray-800">{s.name}</span>
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    ))
                  )}
                </div>

                {/* Footer: close */}
                <div className="p-2 border-t border-gray-100 flex justify-end">
                  <button
                    type="button"
                    onClick={() => { setOpen(false); setSearch(''); }}
                    className="text-xs text-primary-600 hover:text-primary-800 font-medium"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            )}
          </div>

          {error && (
            <p role="alert" className="mt-1 text-xs text-red-600">{error}</p>
          )}
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ConditionSelect — pilih satu jenis kerusakan dari dropdown
// ---------------------------------------------------------------------------

interface ConditionSelectProps {
  allConditions: Condition[];
  selected: string;
  onChange: (id: string) => void;
  error?: string;
  isLoadingConditions: boolean;
}

function ConditionSelect({
  allConditions,
  selected,
  onChange,
  error,
  isLoadingConditions,
}: ConditionSelectProps) {
  return (
    <div>
      <label htmlFor="rule-condition-select" className="block text-sm font-medium text-gray-700 mb-1">
        Jenis Kerusakan (THEN){' '}
        <span className="text-red-500" aria-hidden="true">*</span>
      </label>

      {isLoadingConditions ? (
        <div className="w-full rounded-clay-sm border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-500 animate-pulse">
          Memuat jenis kerusakan…
        </div>
      ) : (
        <select
          id="rule-condition-select"
          value={selected}
          onChange={(e) => onChange(e.target.value)}
          aria-required="true"
          aria-invalid={!!error}
          aria-describedby={error ? 'rule-condition-error' : undefined}
          className={`w-full rounded-clay-sm border px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-400 transition bg-white ${
            error ? 'border-red-400 bg-red-50' : 'border-gray-300'
          }`}
        >
          <option value="">— Pilih jenis kerusakan —</option>
          {allConditions.map((c) => (
            <option key={c.id} value={c.id}>
              {c.code || c.id} — {c.name}
            </option>
          ))}
        </select>
      )}

      {error && (
        <p id="rule-condition-error" role="alert" className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// RulePreview — preview IF-THEN yang terbaca manusia
// ---------------------------------------------------------------------------

interface RulePreviewProps {
  selectedSymptomIds: string[];
  selectedConditionId: string;
  allSymptoms: Symptom[];
  allConditions: Condition[];
}

function RulePreview({
  selectedSymptomIds,
  selectedConditionId,
  allSymptoms,
  allConditions,
}: RulePreviewProps) {
  const symptomEntries = selectedSymptomIds.map((id) => {
    const s = allSymptoms.find((x) => x.id === id);
    return { code: s?.code || id, name: s?.name ?? id };
  });
  const conditionEntry = selectedConditionId
    ? (() => {
        const c = allConditions.find((x) => x.id === selectedConditionId);
        return { code: c?.code || selectedConditionId, name: c?.name ?? selectedConditionId };
      })()
    : null;

  const hasSymptoms = selectedSymptomIds.length > 0;
  const hasCondition = !!selectedConditionId;
  const isComplete = hasSymptoms && hasCondition;

  return (
    <div className={`rounded-clay-sm border p-3 text-xs ${
      isComplete
        ? 'border-primary-200 bg-primary-50'
        : 'border-gray-200 bg-gray-50'
    }`}>
      <p className="font-semibold text-gray-600 mb-1.5">Preview Rule</p>

      {/* Format teknis IF-THEN dengan kode G/K */}
      <p className="font-mono text-gray-700 leading-relaxed">
        <span className="text-blue-700 font-semibold">IF </span>
        {hasSymptoms
          ? symptomEntries.map((e) => e.code).join(' AND ')
          : <span className="text-gray-400 italic not-italic font-sans">Pilih minimal satu gejala.</span>
        }
        <span className="text-blue-700 font-semibold"> THEN </span>
        {hasCondition && conditionEntry
          ? conditionEntry.code
          : <span className="text-gray-400 italic not-italic font-sans">Pilih jenis kerusakan.</span>
        }
      </p>

      {/* Kalimat natural dengan kode + nama */}
      {isComplete && conditionEntry && (
        <p className="mt-2 text-gray-600 leading-relaxed">
          Jika pengguna memilih{' '}
          <span className="font-medium">
            {symptomEntries.length === 1
              ? <>{symptomEntries[0].code} <em className="not-italic text-gray-500">({symptomEntries[0].name})</em></>
              : <>
                  {symptomEntries.slice(0, -1).map((e, i) => (
                    <React.Fragment key={e.code}>
                      {i > 0 && ', '}
                      {e.code} <em className="not-italic text-gray-500">({e.name})</em>
                    </React.Fragment>
                  ))}
                  {' '}dan{' '}
                  {symptomEntries[symptomEntries.length - 1].code}{' '}
                  <em className="not-italic text-gray-500">
                    ({symptomEntries[symptomEntries.length - 1].name})
                  </em>
                </>
            }
          </span>
          , maka sistem akan mengarah ke{' '}
          <span className="font-medium text-primary-700">
            {conditionEntry.code} {conditionEntry.name}
          </span>.
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// RuleForm — modal form dengan multi-select gejala + select kondisi
// ---------------------------------------------------------------------------

interface RuleFormProps {
  initial: Rule | null;
  existingRules: Rule[];
  allSymptoms: Symptom[];
  allConditions: Condition[];
  isLoadingKb: boolean;
  onClose: () => void;
  onSaved: () => void;
}

function RuleForm({
  initial,
  existingRules,
  allSymptoms,
  allConditions,
  isLoadingKb,
  onClose,
  onSaved,
}: RuleFormProps) {
  const isEdit = initial !== null;

  const [id, setId] = useState(initial?.id ?? '');
  const [selectedConditionId, setSelectedConditionId] = useState(initial?.conditionId ?? '');
  const [selectedSymptomIds, setSelectedSymptomIds] = useState<string[]>(
    initial?.symptomIds ?? [],
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    const validationErrors = validateForm(
      id,
      selectedConditionId,
      selectedSymptomIds,
      existingRules,
      isEdit,
    );
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setSubmitting(true);

    const payload = {
      id: id.trim(),
      condition_id: selectedConditionId,
      symptom_ids: selectedSymptomIds,
    };

    try {
      if (isEdit) {
        const { error } = await supabase
          .from('rules')
          .update({
            condition_id: payload.condition_id,
            symptom_ids: payload.symptom_ids,
          })
          .eq('id', payload.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('rules').insert(payload);
        if (error) throw error;
      }
      onSaved();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Terjadi kesalahan. Silakan coba lagi.';
      setServerError(`${isEdit ? 'Gagal memperbarui' : 'Gagal menambah'}: ${message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label={isEdit ? 'Ubah Rule Diagnosa' : 'Tambah Rule Diagnosa'}
    >
      <div className="w-full max-w-xl rounded-clay bg-white shadow-clay-lg p-6 animate-fade-in my-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-gray-800 font-display">
            {isEdit ? 'Ubah Rule Diagnosa' : 'Tambah Rule Diagnosa'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800 transition-colors p-1 rounded-clay-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-600"
            aria-label="Tutup modal"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Server error */}
        {serverError && (
          <div role="alert" className="mb-4 rounded-clay-sm bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {serverError}
          </div>
        )}

        {/* Duplicate rule error */}
        {errors.duplicate && (
          <div role="alert" className="mb-4 rounded-clay-sm bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-700">
            {errors.duplicate}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* ID Rule */}
          <div>
            <label htmlFor="rule-id" className="block text-sm font-medium text-gray-700 mb-1">
              Kode Rule <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <input
              id="rule-id"
              type="text"
              value={id}
              onChange={(e) => {
                setId(e.target.value);
                if (errors.id) setErrors((prev) => ({ ...prev, id: undefined }));
              }}
              disabled={isEdit}
              placeholder="contoh: rule-battery-01"
              aria-required="true"
              aria-invalid={!!errors.id}
              aria-describedby={errors.id ? 'rule-id-error' : undefined}
              className={`w-full rounded-clay-sm border px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400 transition ${
                errors.id ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'
              } ${isEdit ? 'opacity-60 cursor-not-allowed bg-gray-100' : ''}`}
            />
            {errors.id && (
              <p id="rule-id-error" role="alert" className="mt-1 text-xs text-red-600">{errors.id}</p>
            )}
            {isEdit && (
              <p className="mt-1 text-xs text-gray-500">Kode rule tidak dapat diubah setelah disimpan.</p>
            )}
          </div>

          {/* Multi-select Gejala */}
          <SymptomMultiSelect
            allSymptoms={allSymptoms}
            selected={selectedSymptomIds}
            onChange={(ids) => {
              setSelectedSymptomIds(ids);
              if (errors.symptomIds) setErrors((prev) => ({ ...prev, symptomIds: undefined, duplicate: undefined }));
            }}
            error={errors.symptomIds}
            isLoadingSymptoms={isLoadingKb}
          />

          {/* Select Jenis Kerusakan */}
          <ConditionSelect
            allConditions={allConditions}
            selected={selectedConditionId}
            onChange={(id) => {
              setSelectedConditionId(id);
              if (errors.conditionId) setErrors((prev) => ({ ...prev, conditionId: undefined, duplicate: undefined }));
            }}
            error={errors.conditionId}
            isLoadingConditions={isLoadingKb}
          />

          {/* Preview IF-THEN */}
          <RulePreview
            selectedSymptomIds={selectedSymptomIds}
            selectedConditionId={selectedConditionId}
            allSymptoms={allSymptoms}
            allConditions={allConditions}
          />

          {/* Action buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="clay-btn-secondary px-4 py-2 text-sm rounded-clay-sm disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-500"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="clay-btn-primary px-5 py-2 text-sm rounded-clay-sm font-semibold disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-500"
            >
              {submitting
                ? isEdit ? 'Menyimpan…' : 'Menambah…'
                : isEdit ? 'Simpan Perubahan' : 'Tambah Rule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// DeleteConfirm
// ---------------------------------------------------------------------------

interface DeleteConfirmProps {
  rule: Rule;
  onCancel: () => void;
  onConfirmed: () => void;
}

function DeleteConfirm({ rule, onCancel, onConfirmed }: DeleteConfirmProps) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setDeleting(true);
    setError(null);
    try {
      const { error: supaError } = await supabase
        .from('rules')
        .delete()
        .eq('id', rule.id);
      if (supaError) throw supaError;
      onConfirmed();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan.';
      setError(`Gagal menghapus: ${message}`);
      setDeleting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-rule-title"
    >
      <div className="w-full max-w-sm rounded-clay bg-white shadow-clay-lg p-6 animate-fade-in">
        <h2 id="delete-rule-title" className="text-lg font-bold text-gray-800 mb-2 font-display">
          Hapus Rule?
        </h2>
        <p className="text-sm text-gray-600 mb-1">
          Yakin ingin menghapus rule{' '}
          <span className="font-semibold text-gray-800">{rule.id}</span>?
        </p>
        <p className="text-xs text-gray-500 mb-4">Tindakan ini tidak dapat dibatalkan.</p>

        {error && (
          <div role="alert" className="mb-3 rounded-clay-sm bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={deleting}
            className="clay-btn-secondary px-4 py-2 text-sm rounded-clay-sm disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="px-4 py-2 text-sm font-semibold rounded-clay-sm bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50"
          >
            {deleting ? 'Menghapus…' : 'Hapus'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Toast
// ---------------------------------------------------------------------------

interface ToastProps {
  message: string;
  onDismiss: () => void;
}

function Toast({ message, onDismiss }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 5000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-clay-sm bg-red-600 px-4 py-3 text-sm text-white shadow-clay animate-fade-in"
    >
      <span>{message}</span>
      <button
        type="button"
        onClick={onDismiss}
        className="ml-2 text-white/80 hover:text-white transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
        aria-label="Tutup notifikasi"
      >
        ✕
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// RulesAdmin — main page
// ---------------------------------------------------------------------------

/**
 * RulesAdmin — halaman CRUD Rule Diagnosa.
 *
 * Fase 3:
 * - Input gejala: multi-select dengan dropdown pencarian, grouped by category
 * - Input jenis kerusakan: select dropdown dari data Supabase
 * - Preview IF-THEN otomatis update saat memilih
 * - Validasi: kode rule wajib, min 1 gejala, 1 jenis kerusakan, cek duplikat
 * - Data gejala dan kondisi diambil dari service layer (Supabase → fallback mock)
 * - Penyimpanan ke DB tetap kompatibel: symptom_ids (array), condition_id (string)
 *
 * Requirements: 10.2, 10.9
 */
export default function RulesAdmin() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  // Knowledge base untuk form
  const [allSymptoms, setAllSymptoms] = useState<Symptom[]>([]);
  const [allConditions, setAllConditions] = useState<Condition[]>([]);
  const [isLoadingKb, setIsLoadingKb] = useState(true);

  // Modal state
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<Rule | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Rule | null>(null);

  // ---------------------------------------------------------------------------
  // Fetch rules
  // ---------------------------------------------------------------------------
  const fetchRules = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('rules')
        .select('id, condition_id, symptom_ids')
        .order('id', { ascending: true });
      if (error) throw error;
      setRules((data as RuleRow[]).map(toRule));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Kesalahan tidak diketahui';
      setToast(`Gagal memuat data: ${message}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch symptoms + conditions untuk form (sekali saat mount)
  const fetchKb = useCallback(async () => {
    setIsLoadingKb(true);
    const [symptomsResult, conditionsResult] = await Promise.all([
      fetchSymptoms(),
      fetchConditions(),
    ]);
    setAllSymptoms(symptomsResult.data);
    setAllConditions(conditionsResult.data);
    setIsLoadingKb(false);
  }, []);

  useEffect(() => {
    fetchRules();
    fetchKb();
  }, [fetchRules, fetchKb]);

  // ---------------------------------------------------------------------------
  // Column definitions — tampilkan kode G/K dari field code, bukan index
  // ---------------------------------------------------------------------------
  const columns: ColumnDef<Rule>[] = useMemo(() => [
    {
      key: 'id',
      header: 'Kode Rule',
      render: (row) => (
        <span>
          <span className="font-mono font-semibold text-primary-700 text-xs mr-1">{row.code || '—'}</span>
          <span className="font-mono text-xs text-gray-400">{row.id}</span>
        </span>
      ),
    },
    {
      key: 'conditionId',
      header: 'Jenis Kerusakan (THEN)',
      render: (row) => {
        const c = allConditions.find((x) => x.id === row.conditionId);
        return (
          <span className="text-xs text-gray-800">
            {c
              ? <><span className="font-mono font-semibold text-primary-700">{c.code || c.id}</span> — {c.name}</>
              : <span className="font-mono text-gray-500">{row.conditionId}</span>
            }
          </span>
        );
      },
    },
    {
      key: 'symptomIds',
      header: 'Gejala (IF)',
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.symptomIds.length === 0
            ? <em className="text-xs text-gray-400">—</em>
            : row.symptomIds.map((sid) => {
                const s = allSymptoms.find((x) => x.id === sid);
                return (
                  <span
                    key={sid}
                    className="inline-block rounded-full bg-gray-100 text-gray-700 text-xs px-2 py-0.5"
                    title={`${sid}${s?.name ? ' — ' + s.name : ''}`}
                  >
                    {s
                      ? <><span className="font-mono font-semibold text-primary-700">{s.code || s.id}</span> — {s.name}</>
                      : sid
                    }
                  </span>
                );
              })
          }
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Aksi',
      render: (row) => (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setEditTarget(row)}
            className="text-xs font-medium text-primary-600 hover:text-primary-800 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-500 rounded px-1"
            aria-label={`Ubah rule ${row.id}`}
          >
            Ubah
          </button>
          <button
            type="button"
            onClick={() => setDeleteTarget(row)}
            className="text-xs font-medium text-red-500 hover:text-red-700 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-500 rounded px-1"
            aria-label={`Hapus rule ${row.id}`}
          >
            Hapus
          </button>
        </div>
      ),
    },
  ], [allConditions, allSymptoms]);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------
  const handleSaved = () => {
    setShowCreate(false);
    setEditTarget(null);
    fetchRules();
  };

  const handleDeleted = () => {
    setDeleteTarget(null);
    fetchRules();
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 font-display">Rule Diagnosa</h1>
          <p className="mt-1 text-sm text-gray-600">
            Kelola aturan inferensi yang menghubungkan gejala dengan jenis kerusakan.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="clay-btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-clay-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-500 self-start sm:self-auto"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tambah Rule
        </button>
      </div>

      {/* DataTable */}
      <DataTable<Rule>
        data={rules}
        columns={columns}
        pageSize={10}
        isLoading={isLoading}
      />

      {/* Create Modal */}
      {showCreate && (
        <RuleForm
          initial={null}
          existingRules={rules}
          allSymptoms={allSymptoms}
          allConditions={allConditions}
          isLoadingKb={isLoadingKb}
          onClose={() => setShowCreate(false)}
          onSaved={handleSaved}
        />
      )}

      {/* Edit Modal */}
      {editTarget && (
        <RuleForm
          initial={editTarget}
          existingRules={rules}
          allSymptoms={allSymptoms}
          allConditions={allConditions}
          isLoadingKb={isLoadingKb}
          onClose={() => setEditTarget(null)}
          onSaved={handleSaved}
        />
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <DeleteConfirm
          rule={deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onConfirmed={handleDeleted}
        />
      )}

      {/* Toast */}
      {toast && (
        <Toast message={toast} onDismiss={() => setToast(null)} />
      )}
    </div>
  );
}
