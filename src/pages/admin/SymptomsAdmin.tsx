import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { DataTable, ColumnDef } from '../../components/admin/DataTable';
import { Symptom } from '../../types/knowledge-base';

// ── Types ─────────────────────────────────────────────────────────────────────

interface FormValues {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
}

interface FormErrors {
  id?: string;
  code?: string;
  name?: string;
  description?: string;
  category?: string;
}

type ModalMode = 'create' | 'edit';

// ── Validation ────────────────────────────────────────────────────────────────

const MAX_LEN = 255;

function validateForm(values: FormValues): FormErrors {
  const errors: FormErrors = {};

  if (!values.id.trim()) {
    errors.id = 'ID tidak boleh kosong.';
  } else if (values.id.length > MAX_LEN) {
    errors.id = `ID maksimal ${MAX_LEN} karakter.`;
  }

  if (!values.code.trim()) {
    errors.code = 'Kode gejala wajib diisi.';
  } else if (!/^G\d+$/.test(values.code.trim())) {
    errors.code = 'Format kode harus G01, G02, dst.';
  } else if (values.code.length > 10) {
    errors.code = 'Kode maksimal 10 karakter.';
  }

  if (!values.name.trim()) {
    errors.name = 'Nama tidak boleh kosong.';
  } else if (values.name.length > MAX_LEN) {
    errors.name = `Nama maksimal ${MAX_LEN} karakter.`;
  }

  if (!values.description.trim()) {
    errors.description = 'Deskripsi tidak boleh kosong.';
  } else if (values.description.length > MAX_LEN) {
    errors.description = `Deskripsi maksimal ${MAX_LEN} karakter.`;
  }

  if (!values.category.trim()) {
    errors.category = 'Kategori tidak boleh kosong.';
  } else if (values.category.length > MAX_LEN) {
    errors.category = `Kategori maksimal ${MAX_LEN} karakter.`;
  }

  return errors;
}

const EMPTY_FORM: FormValues = { id: '', code: '', name: '', description: '', category: '' };

// ── Toast ─────────────────────────────────────────────────────────────────────

interface ToastProps {
  message: string;
  onClose: () => void;
}

function Toast({ message, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-red-600 text-white px-5 py-3 rounded-clay shadow-clay-lg animate-fade-in"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5 shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      </svg>
      <span className="text-sm font-medium">{message}</span>
      <button
        onClick={onClose}
        className="ml-2 text-white/80 hover:text-white transition-colors"
        aria-label="Dismiss notification"
      >
        ✕
      </button>
    </div>
  );
}

// ── Confirm Dialog ────────────────────────────────────────────────────────────

interface ConfirmDialogProps {
  symptomName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmDialog({ symptomName, onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <div className="bg-white rounded-clay shadow-clay-lg p-6 w-full max-w-sm mx-4 animate-spring-in">
        <h2 id="confirm-dialog-title" className="text-lg font-semibold text-gray-800 mb-2">
          Hapus Gejala
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Yakin ingin menghapus gejala{' '}
          <span className="font-medium text-gray-800">"{symptomName}"</span>?
          Tindakan ini tidak dapat dibatalkan.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm rounded-clay-sm border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-500"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm rounded-clay-sm bg-red-600 text-white hover:bg-red-700 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-500"
          >
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Form Modal ────────────────────────────────────────────────────────────────

interface SymptomFormModalProps {
  mode: ModalMode;
  initialValues: FormValues;
  onSubmit: (values: FormValues) => void;
  onClose: () => void;
  isSubmitting: boolean;
}

function SymptomFormModal({
  mode,
  initialValues,
  onSubmit,
  onClose,
  isSubmitting,
}: SymptomFormModalProps) {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});

  // Keep values in sync when initialValues change (edit mode)
  useEffect(() => {
    setValues(initialValues);
    setErrors({});
  }, [initialValues]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    // Clear that field's error on change
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationErrors = validateForm(values);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    onSubmit(values);
  }

  const title = mode === 'create' ? 'Tambah Gejala' : 'Ubah Gejala';

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="symptom-form-title"
    >
      <div className="bg-white rounded-clay shadow-clay-lg p-6 w-full max-w-lg mx-4 animate-spring-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 id="symptom-form-title" className="text-xl font-semibold text-gray-800 font-display">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-600 rounded"
            aria-label="Tutup dialog"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          {/* ID */}
          <div className="mb-4">
            <label htmlFor="symptom-id" className="block text-sm font-medium text-gray-700 mb-1">
              ID <span aria-hidden="true" className="text-red-500">*</span>
            </label>
            <input
              id="symptom-id"
              name="id"
              type="text"
              value={values.id}
              onChange={handleChange}
              disabled={mode === 'edit'}
              maxLength={MAX_LEN + 1}
              aria-required="true"
              aria-invalid={!!errors.id}
              aria-describedby={errors.id ? 'symptom-id-error' : undefined}
              className={`w-full px-3 py-2 text-sm border rounded-clay-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition ${
                mode === 'edit' ? 'bg-gray-100 text-gray-600 cursor-not-allowed' : 'bg-white'
              } ${errors.id ? 'border-red-400' : 'border-gray-200'}`}
              placeholder="contoh: battery-drain-fast"
            />
            {errors.id && (
              <p id="symptom-id-error" role="alert" className="mt-1 text-xs text-red-600">
                {errors.id}
              </p>
            )}
          </div>

          {/* Kode Gejala */}
          <div className="mb-4">
            <label htmlFor="symptom-code" className="block text-sm font-medium text-gray-700 mb-1">
              Kode Gejala <span aria-hidden="true" className="text-red-500">*</span>
            </label>
            <input
              id="symptom-code"
              name="code"
              type="text"
              value={values.code}
              onChange={handleChange}
              maxLength={10}
              aria-required="true"
              aria-invalid={!!errors.code}
              aria-describedby={errors.code ? 'symptom-code-error' : 'symptom-code-hint'}
              className={`w-full px-3 py-2 text-sm border rounded-clay-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition bg-white font-mono ${
                errors.code ? 'border-red-400' : 'border-gray-200'
              }`}
              placeholder="contoh: G01"
            />
            {errors.code ? (
              <p id="symptom-code-error" role="alert" className="mt-1 text-xs text-red-600">
                {errors.code}
              </p>
            ) : (
              <p id="symptom-code-hint" className="mt-1 text-xs text-gray-500">
                Kode akademik unik untuk gejala ini. Format: G01, G02, dst.
              </p>
            )}
          </div>

          {/* Name */}
          <div className="mb-4">
            <label htmlFor="symptom-name" className="block text-sm font-medium text-gray-700 mb-1">
              Nama <span aria-hidden="true" className="text-red-500">*</span>
            </label>
            <input
              id="symptom-name"
              name="name"
              type="text"
              value={values.name}
              onChange={handleChange}
              maxLength={MAX_LEN + 1}
              aria-required="true"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'symptom-name-error' : undefined}
              className={`w-full px-3 py-2 text-sm border rounded-clay-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition bg-white ${
                errors.name ? 'border-red-400' : 'border-gray-200'
              }`}
              placeholder="contoh: Baterai cepat habis"
            />
            {errors.name && (
              <p id="symptom-name-error" role="alert" className="mt-1 text-xs text-red-600">
                {errors.name}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="mb-4">
            <label htmlFor="symptom-description" className="block text-sm font-medium text-gray-700 mb-1">
              Deskripsi <span aria-hidden="true" className="text-red-500">*</span>
            </label>
            <textarea
              id="symptom-description"
              name="description"
              value={values.description}
              onChange={handleChange}
              rows={3}
              maxLength={MAX_LEN + 1}
              aria-required="true"
              aria-invalid={!!errors.description}
              aria-describedby={errors.description ? 'symptom-description-error' : undefined}
              className={`w-full px-3 py-2 text-sm border rounded-clay-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition bg-white resize-none ${
                errors.description ? 'border-red-400' : 'border-gray-200'
              }`}
              placeholder="Penjelasan singkat tentang gejala ini"
            />
            {errors.description && (
              <p id="symptom-description-error" role="alert" className="mt-1 text-xs text-red-600">
                {errors.description}
              </p>
            )}
          </div>

          {/* Category */}
          <div className="mb-6">
            <label htmlFor="symptom-category" className="block text-sm font-medium text-gray-700 mb-1">
              Kategori <span aria-hidden="true" className="text-red-500">*</span>
            </label>
            <input
              id="symptom-category"
              name="category"
              type="text"
              value={values.category}
              onChange={handleChange}
              maxLength={MAX_LEN + 1}
              aria-required="true"
              aria-invalid={!!errors.category}
              aria-describedby={errors.category ? 'symptom-category-error' : undefined}
              className={`w-full px-3 py-2 text-sm border rounded-clay-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition bg-white ${
                errors.category ? 'border-red-400' : 'border-gray-200'
              }`}
              placeholder="contoh: Battery, Screen, Performance"
            />
            {errors.category && (
              <p id="symptom-category-error" role="alert" className="mt-1 text-xs text-red-600">
                {errors.category}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm rounded-clay-sm border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-500"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm rounded-clay-sm bg-primary-600 text-white hover:bg-primary-700 transition-colors disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-500"
            >
              {isSubmitting ? 'Menyimpan…' : mode === 'create' ? 'Tambah' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

/**
 * SymptomsAdmin — CRUD management page for the `symptoms` table in Supabase.
 *
 * - Fetches all symptoms on mount and renders them in a DataTable (Req 10.2, 10.3)
 * - "Create Symptom" button opens a modal form (Req 10.4)
 * - Edit and Delete actions per row (Req 10.5, 10.6)
 * - Validates required fields non-empty and ≤ 255 chars before any write (Req 10.7)
 * - Confirmation dialog before delete; reflects change within 2 s (Req 10.8)
 * - On Supabase error: toast with operation name; DataTable left unchanged (Req 10.8)
 *
 * Requirements: 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8
 */
export default function SymptomsAdmin() {
  // ── State ──────────────────────────────────────────────────────────────────
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>('create');
  const [editingSymptom, setEditingSymptom] = useState<Symptom | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingSymptom, setDeletingSymptom] = useState<Symptom | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // ── Helpers ────────────────────────────────────────────────────────────────

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
  }, []);

  const dismissToast = useCallback(() => {
    setToastMessage(null);
  }, []);

  // ── Fetch on mount ─────────────────────────────────────────────────────────

  useEffect(() => {
    let cancelled = false;

    async function fetchSymptoms() {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.from('symptoms').select('*');
        if (cancelled) return;
        if (error) {
          showToast('Gagal memuat data: ' + error.message);
        } else {
          setSymptoms((data as Symptom[]) ?? []);
        }
      } catch {
        if (!cancelled) showToast('Gagal memuat data: terjadi kesalahan.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchSymptoms();
    return () => {
      cancelled = true;
    };
  }, [showToast]);

  // ── Open / close modal ─────────────────────────────────────────────────────

  function openCreateModal() {
    setModalMode('create');
    setEditingSymptom(null);
    setModalOpen(true);
  }

  function openEditModal(symptom: Symptom) {
    setModalMode('edit');
    setEditingSymptom(symptom);
    setModalOpen(true);
  }

  function closeModal() {
    if (isSubmitting) return;
    setModalOpen(false);
    setEditingSymptom(null);
  }

  // ── Create ─────────────────────────────────────────────────────────────────

  async function handleCreate(values: FormValues) {
    setIsSubmitting(true);
    try {
      const record: Symptom = {
        id: values.id.trim(),
        code: values.code.trim().toUpperCase(),
        name: values.name.trim(),
        description: values.description.trim(),
        category: values.category.trim(),
      };
      const { error } = await supabase.from('symptoms').insert(record);
      if (error) {
        showToast('Gagal menambah: ' + error.message);
      } else {
        setSymptoms((prev) => [...prev, record]);
        setModalOpen(false);
      }
    } catch {
      showToast('Gagal menambah: terjadi kesalahan.');
    } finally {
      setIsSubmitting(false);
    }
  }

  // ── Edit ───────────────────────────────────────────────────────────────────

  async function handleEdit(values: FormValues) {
    if (!editingSymptom) return;
    setIsSubmitting(true);
    try {
      const updates = {
        code: values.code.trim().toUpperCase(),
        name: values.name.trim(),
        description: values.description.trim(),
        category: values.category.trim(),
      };
      const { error } = await supabase
        .from('symptoms')
        .update(updates)
        .eq('id', editingSymptom.id);
      if (error) {
        showToast('Gagal memperbarui: ' + error.message);
      } else {
        setSymptoms((prev) =>
          prev.map((s) =>
            s.id === editingSymptom.id ? { ...s, ...updates } : s
          )
        );
        setModalOpen(false);
        setEditingSymptom(null);
      }
    } catch {
      showToast('Gagal memperbarui: terjadi kesalahan.');
    } finally {
      setIsSubmitting(false);
    }
  }

  // ── Delete ─────────────────────────────────────────────────────────────────

  function requestDelete(symptom: Symptom) {
    setDeletingSymptom(symptom);
  }

  function cancelDelete() {
    setDeletingSymptom(null);
  }

  async function confirmDelete() {
    if (!deletingSymptom) return;
    const target = deletingSymptom;
    setDeletingSymptom(null);
    try {
      const { error } = await supabase
        .from('symptoms')
        .delete()
        .eq('id', target.id);
      if (error) {
        showToast('Gagal menghapus: ' + error.message);
      } else {
        setSymptoms((prev) => prev.filter((s) => s.id !== target.id));
      }
    } catch {
      showToast('Gagal menghapus: terjadi kesalahan.');
    }
  }

  // ── Column definitions ─────────────────────────────────────────────────────

  const columns: ColumnDef<Symptom>[] = [
    {
      key: 'code',
      header: 'Kode',
      render: (row) => (
        <span className="font-mono font-semibold text-primary-700 text-xs">{row.code || '—'}</span>
      ),
    },
    { key: 'id', header: 'ID' },
    { key: 'name', header: 'Nama' },
    {
      key: 'description',
      header: 'Deskripsi',
      render: (row) => (
        <span className="block max-w-xs truncate" title={row.description}>
          {row.description}
        </span>
      ),
    },
    { key: 'category', header: 'Kategori' },
    {
      key: 'actions',
      header: 'Aksi',
      render: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => openEditModal(row)}
            className="px-3 py-1 text-xs rounded-clay-sm bg-primary-100 text-primary-700 hover:bg-primary-200 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-500"
            aria-label={`Ubah gejala ${row.name}`}
          >
            Ubah
          </button>
          <button
            onClick={() => requestDelete(row)}
            className="px-3 py-1 text-xs rounded-clay-sm bg-red-100 text-red-700 hover:bg-red-200 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-500"
            aria-label={`Hapus gejala ${row.name}`}
          >
            Hapus
          </button>
        </div>
      ),
    },
  ];

  // ── Derived form initial values ────────────────────────────────────────────

  const formInitialValues: FormValues =
    editingSymptom
      ? {
          id: editingSymptom.id,
          code: editingSymptom.code ?? '',
          name: editingSymptom.name,
          description: editingSymptom.description,
          category: editingSymptom.category,
        }
      : EMPTY_FORM;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="p-8">
      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 font-display">Gejala</h1>
          <p className="mt-1 text-sm text-gray-600">
            Kelola daftar gejala dalam basis pengetahuan.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-clay-sm hover:bg-primary-700 transition-colors shadow-clay focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-500"
          aria-label="Tambah gejala baru"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Tambah Gejala
        </button>
      </div>

      {/* ── DataTable ───────────────────────────────────────────────────── */}
      <DataTable<Symptom>
        data={symptoms}
        columns={columns}
        isLoading={isLoading}
        pageSize={10}
      />

      {/* ── Create / Edit Modal ──────────────────────────────────────────── */}
      {modalOpen && (
        <SymptomFormModal
          mode={modalMode}
          initialValues={formInitialValues}
          onSubmit={modalMode === 'create' ? handleCreate : handleEdit}
          onClose={closeModal}
          isSubmitting={isSubmitting}
        />
      )}

      {/* ── Delete Confirmation Dialog ───────────────────────────────────── */}
      {deletingSymptom && (
        <ConfirmDialog
          symptomName={deletingSymptom.name}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}

      {/* ── Toast Notification ───────────────────────────────────────────── */}
      {toastMessage && (
        <Toast message={toastMessage} onClose={dismissToast} />
      )}
    </div>
  );
}