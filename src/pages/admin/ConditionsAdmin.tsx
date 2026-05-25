import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { DataTable, ColumnDef } from '../../components/admin/DataTable';

// ── Types ─────────────────────────────────────────────────────────────────────

/**
 * Condition row as stored in / returned from Supabase.
 * Note: Supabase column is `recommended_action`; we map it to `recommendedAction`
 * for consistency with the TypeScript `Condition` interface.
 */
interface ConditionRow {
  id: string;
  name: string;
  description: string;
  recommendedAction: string;
}

// ── Validation ────────────────────────────────────────────────────────────────

const MAX_LEN = 255;

interface FormErrors {
  id?: string;
  name?: string;
  description?: string;
  recommendedAction?: string;
}

function validateForm(form: ConditionRow): FormErrors {
  const errors: FormErrors = {};

  if (!form.id.trim()) {
    errors.id = 'ID is required.';
  } else if (form.id.length > MAX_LEN) {
    errors.id = `ID must not exceed ${MAX_LEN} characters.`;
  }

  if (!form.name.trim()) {
    errors.name = 'Name is required.';
  } else if (form.name.length > MAX_LEN) {
    errors.name = `Name must not exceed ${MAX_LEN} characters.`;
  }

  if (!form.description.trim()) {
    errors.description = 'Description is required.';
  } else if (form.description.length > MAX_LEN) {
    errors.description = `Description must not exceed ${MAX_LEN} characters.`;
  }

  if (!form.recommendedAction.trim()) {
    errors.recommendedAction = 'Recommended Action is required.';
  } else if (form.recommendedAction.length > MAX_LEN) {
    errors.recommendedAction = `Recommended Action must not exceed ${MAX_LEN} characters.`;
  }

  return errors;
}

function hasErrors(errors: FormErrors): boolean {
  return Object.keys(errors).length > 0;
}

// ── Toast ─────────────────────────────────────────────────────────────────────

interface ToastMessage {
  id: number;
  type: 'error' | 'success';
  text: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const EMPTY_FORM: ConditionRow = {
  id: '',
  name: '',
  description: '',
  recommendedAction: '',
};

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * ConditionsAdmin — CRUD view for the `conditions` Supabase table.
 *
 * Follows the same pattern as SymptomsAdmin:
 *   - Fetch all conditions on mount and display in DataTable
 *   - Create / Edit via modal form
 *   - Delete with confirmation dialog
 *   - All fields validated (non-empty AND ≤ 255 chars) before any Supabase call
 *   - Toast notifications on failure; DataTable unchanged on error
 *
 * Requirements: 10.2, 10.9
 */
export default function ConditionsAdmin() {
  // ── Data state ──────────────────────────────────────────────────────────────
  const [conditions, setConditions] = useState<ConditionRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ── Modal state ─────────────────────────────────────────────────────────────
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [form, setForm] = useState<ConditionRow>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Delete confirmation state ────────────────────────────────────────────────
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ── Toast state ─────────────────────────────────────────────────────────────
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [toastCounter, setToastCounter] = useState(0);

  // ── Helpers ─────────────────────────────────────────────────────────────────

  const showToast = useCallback(
    (type: ToastMessage['type'], text: string) => {
      const id = toastCounter + 1;
      setToastCounter(id);
      setToasts((prev) => [...prev, { id, type, text }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 5000);
    },
    [toastCounter],
  );

  const dismissToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // ── Fetch ────────────────────────────────────────────────────────────────────

  const fetchConditions = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('conditions')
      .select('id, name, description, recommended_action')
      .order('id', { ascending: true });

    if (error) {
      showToast('error', `Failed to fetch conditions: ${error.message}`);
      setIsLoading(false);
      return;
    }

    // Map snake_case DB column to camelCase TS field
    const mapped: ConditionRow[] = (data ?? []).map((row) => ({
      id: row.id as string,
      name: row.name as string,
      description: row.description as string,
      recommendedAction: row.recommended_action as string,
    }));

    setConditions(mapped);
    setIsLoading(false);
  }, [showToast]);

  useEffect(() => {
    fetchConditions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Modal helpers ────────────────────────────────────────────────────────────

  const openCreateModal = () => {
    setIsEditMode(false);
    setForm(EMPTY_FORM);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (row: ConditionRow) => {
    setIsEditMode(true);
    setForm({ ...row });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormErrors({});
  };

  // ── Form submit ──────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate — Requirements 10.7
    const errors = validateForm(form);
    if (hasErrors(errors)) {
      setFormErrors(errors);
      return; // Block Supabase call
    }

    setIsSubmitting(true);

    const payload = {
      id: form.id.trim(),
      name: form.name.trim(),
      description: form.description.trim(),
      recommended_action: form.recommendedAction.trim(),
    };

    if (isEditMode) {
      // ── Update ───────────────────────────────────────────────────────────────
      const { error } = await supabase
        .from('conditions')
        .update({
          name: payload.name,
          description: payload.description,
          recommended_action: payload.recommended_action,
        })
        .eq('id', payload.id);

      if (error) {
        showToast('error', `Failed to update condition: ${error.message}`);
        setIsSubmitting(false);
        return;
      }

      // Reflect change in DataTable — Requirements 10.5
      setConditions((prev) =>
        prev.map((c) =>
          c.id === payload.id
            ? {
                id: payload.id,
                name: payload.name,
                description: payload.description,
                recommendedAction: payload.recommended_action,
              }
            : c,
        ),
      );
    } else {
      // ── Insert ───────────────────────────────────────────────────────────────
      const { error } = await supabase.from('conditions').insert([payload]);

      if (error) {
        showToast('error', `Failed to create condition: ${error.message}`);
        setIsSubmitting(false);
        return;
      }

      // Reflect new record in DataTable — Requirements 10.4
      setConditions((prev) => [
        ...prev,
        {
          id: payload.id,
          name: payload.name,
          description: payload.description,
          recommendedAction: payload.recommended_action,
        },
      ]);
    }

    setIsSubmitting(false);
    closeModal();
  };

  // ── Delete ───────────────────────────────────────────────────────────────────

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;
    setIsDeleting(true);

    const { error } = await supabase
      .from('conditions')
      .delete()
      .eq('id', deleteTargetId);

    if (error) {
      showToast('error', `Failed to delete condition: ${error.message}`);
      setIsDeleting(false);
      setDeleteTargetId(null);
      return;
    }

    // Reflect deletion in DataTable — Requirements 10.6
    setConditions((prev) => prev.filter((c) => c.id !== deleteTargetId));
    setIsDeleting(false);
    setDeleteTargetId(null);
  };

  // ── Column definitions ───────────────────────────────────────────────────────

  const columns: ColumnDef<ConditionRow>[] = [
    { key: 'id', header: 'ID' },
    { key: 'name', header: 'Name' },
    {
      key: 'description',
      header: 'Description',
      render: (row) => (
        <span className="line-clamp-2 max-w-xs block">{row.description}</span>
      ),
    },
    {
      key: 'recommendedAction',
      header: 'Recommended Action',
      render: (row) => (
        <span className="line-clamp-2 max-w-xs block">{row.recommendedAction}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => openEditModal(row)}
            className="px-3 py-1 text-xs font-medium text-primary-700 bg-primary-100 rounded-clay-sm hover:bg-primary-200 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-500"
            aria-label={`Edit condition ${row.name}`}
          >
            Edit
          </button>
          <button
            onClick={() => setDeleteTargetId(row.id)}
            className="px-3 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-clay-sm hover:bg-red-200 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-500"
            aria-label={`Delete condition ${row.name}`}
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="p-8">
      {/* ── Toast notifications ──────────────────────────────────────── */}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-80"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="alert"
            className={`flex items-start gap-3 rounded-clay-sm px-4 py-3 shadow-clay text-sm font-medium ${
              toast.type === 'error'
                ? 'bg-red-50 text-red-800 border border-red-200'
                : 'bg-success-50 text-success-800 border border-success-200'
            }`}
          >
            <span className="flex-1">{toast.text}</span>
            <button
              onClick={() => dismissToast(toast.id)}
              aria-label="Dismiss notification"
              className="ml-auto shrink-0 text-current opacity-60 hover:opacity-100 focus-visible:outline focus-visible:outline-2"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* ── Page header ──────────────────────────────────────────────── */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 font-display">
            Conditions
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage diagnostic conditions and recommended actions.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="clay-btn-primary px-5 py-2.5 text-sm font-semibold rounded-clay-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-500"
          aria-label="Create new condition"
        >
          + Create Condition
        </button>
      </div>

      {/* ── DataTable ────────────────────────────────────────────────── */}
      <DataTable<ConditionRow>
        data={conditions}
        columns={columns}
        pageSize={10}
        isLoading={isLoading}
      />

      {/* ── Create / Edit Modal ───────────────────────────────────────── */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          className="fixed inset-0 z-40 flex items-center justify-center"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={closeModal}
            aria-hidden="true"
          />

          {/* Panel */}
          <div className="relative z-50 w-full max-w-lg rounded-clay bg-white shadow-clay-lg p-6 mx-4 overflow-y-auto max-h-[90vh]">
            <h2
              id="modal-title"
              className="text-xl font-bold text-gray-800 font-display mb-5"
            >
              {isEditMode ? 'Edit Condition' : 'Create Condition'}
            </h2>

            <form onSubmit={handleSubmit} noValidate>
              {/* ID field */}
              <div className="mb-4">
                <label
                  htmlFor="condition-id"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  ID <span className="text-red-500" aria-hidden="true">*</span>
                </label>
                <input
                  id="condition-id"
                  type="text"
                  value={form.id}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, id: e.target.value }));
                    setFormErrors((err) => ({ ...err, id: undefined }));
                  }}
                  disabled={isEditMode}
                  maxLength={MAX_LEN + 1}
                  aria-required="true"
                  aria-invalid={!!formErrors.id}
                  aria-describedby={formErrors.id ? 'condition-id-error' : undefined}
                  className={`w-full rounded-clay-sm border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 transition ${
                    formErrors.id ? 'border-red-400' : 'border-gray-300'
                  } ${isEditMode ? 'bg-gray-100 cursor-not-allowed text-gray-600' : ''}`}
                  placeholder="e.g. battery-degradation"
                />
                {formErrors.id && (
                  <p
                    id="condition-id-error"
                    role="alert"
                    className="mt-1 text-xs text-red-600"
                  >
                    {formErrors.id}
                  </p>
                )}
              </div>

              {/* Name field */}
              <div className="mb-4">
                <label
                  htmlFor="condition-name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Name <span className="text-red-500" aria-hidden="true">*</span>
                </label>
                <input
                  id="condition-name"
                  type="text"
                  value={form.name}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, name: e.target.value }));
                    setFormErrors((err) => ({ ...err, name: undefined }));
                  }}
                  maxLength={MAX_LEN + 1}
                  aria-required="true"
                  aria-invalid={!!formErrors.name}
                  aria-describedby={formErrors.name ? 'condition-name-error' : undefined}
                  className={`w-full rounded-clay-sm border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 transition ${
                    formErrors.name ? 'border-red-400' : 'border-gray-300'
                  }`}
                  placeholder="e.g. Battery Degradation"
                />
                {formErrors.name && (
                  <p
                    id="condition-name-error"
                    role="alert"
                    className="mt-1 text-xs text-red-600"
                  >
                    {formErrors.name}
                  </p>
                )}
              </div>

              {/* Description field */}
              <div className="mb-4">
                <label
                  htmlFor="condition-description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Description <span className="text-red-500" aria-hidden="true">*</span>
                </label>
                <textarea
                  id="condition-description"
                  value={form.description}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, description: e.target.value }));
                    setFormErrors((err) => ({ ...err, description: undefined }));
                  }}
                  maxLength={MAX_LEN + 1}
                  rows={3}
                  aria-required="true"
                  aria-invalid={!!formErrors.description}
                  aria-describedby={
                    formErrors.description ? 'condition-description-error' : undefined
                  }
                  className={`w-full rounded-clay-sm border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 transition resize-none ${
                    formErrors.description ? 'border-red-400' : 'border-gray-300'
                  }`}
                  placeholder="Brief explanation of the condition…"
                />
                {formErrors.description && (
                  <p
                    id="condition-description-error"
                    role="alert"
                    className="mt-1 text-xs text-red-600"
                  >
                    {formErrors.description}
                  </p>
                )}
              </div>

              {/* Recommended Action field */}
              <div className="mb-6">
                <label
                  htmlFor="condition-recommended-action"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Recommended Action{' '}
                  <span className="text-red-500" aria-hidden="true">*</span>
                </label>
                <textarea
                  id="condition-recommended-action"
                  value={form.recommendedAction}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, recommendedAction: e.target.value }));
                    setFormErrors((err) => ({
                      ...err,
                      recommendedAction: undefined,
                    }));
                  }}
                  maxLength={MAX_LEN + 1}
                  rows={3}
                  aria-required="true"
                  aria-invalid={!!formErrors.recommendedAction}
                  aria-describedby={
                    formErrors.recommendedAction
                      ? 'condition-recommended-action-error'
                      : undefined
                  }
                  className={`w-full rounded-clay-sm border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 transition resize-none ${
                    formErrors.recommendedAction ? 'border-red-400' : 'border-gray-300'
                  }`}
                  placeholder="e.g. Replace the battery at an authorized service center."
                />
                {formErrors.recommendedAction && (
                  <p
                    id="condition-recommended-action-error"
                    role="alert"
                    className="mt-1 text-xs text-red-600"
                  >
                    {formErrors.recommendedAction}
                  </p>
                )}
              </div>

              {/* Modal actions */}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-clay-sm hover:bg-gray-200 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-500 disabled:opacity-40"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-sm font-semibold text-white bg-primary-600 rounded-clay-sm hover:bg-primary-700 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-500 disabled:opacity-40"
                  aria-disabled={isSubmitting}
                >
                  {isSubmitting
                    ? isEditMode
                      ? 'Saving…'
                      : 'Creating…'
                    : isEditMode
                    ? 'Save Changes'
                    : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Dialog ────────────────────────────────── */}
      {deleteTargetId !== null && (
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
          aria-describedby="delete-dialog-description"
          className="fixed inset-0 z-40 flex items-center justify-center"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => !isDeleting && setDeleteTargetId(null)}
            aria-hidden="true"
          />

          {/* Panel */}
          <div className="relative z-50 w-full max-w-sm rounded-clay bg-white shadow-clay-lg p-6 mx-4">
            <h2
              id="delete-dialog-title"
              className="text-lg font-bold text-gray-800 font-display mb-2"
            >
              Delete Condition
            </h2>
            <p
              id="delete-dialog-description"
              className="text-sm text-gray-600 mb-6"
            >
              Are you sure you want to delete{' '}
              <span className="font-semibold text-gray-800">
                &ldquo;{deleteTargetId}&rdquo;
              </span>
              ? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteTargetId(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-clay-sm hover:bg-gray-200 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-500 disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-clay-sm hover:bg-red-700 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-500 disabled:opacity-40"
                aria-disabled={isDeleting}
              >
                {isDeleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
