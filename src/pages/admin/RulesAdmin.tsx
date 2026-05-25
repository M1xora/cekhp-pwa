import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabaseClient';
import DataTable, { ColumnDef } from '../../components/admin/DataTable';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Shape of a Rule row as returned by Supabase (snake_case). */
interface RuleRow {
  id: string;
  condition_id: string;
  symptom_ids: string[];
}

/** Internal representation using camelCase for form state and display. */
interface Rule {
  id: string;
  conditionId: string;
  symptomIds: string[];
}

// Map DB row → local Rule
function toRule(row: RuleRow): Rule {
  return {
    id: row.id,
    conditionId: row.condition_id,
    symptomIds: row.symptom_ids ?? [],
  };
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

interface FormErrors {
  id?: string;
  conditionId?: string;
  symptomIds?: string;
}

function validate(id: string, conditionId: string, symptomIdsStr: string): FormErrors {
  const errors: FormErrors = {};

  if (!id.trim()) {
    errors.id = 'ID is required.';
  } else if (id.trim().length > 255) {
    errors.id = 'ID must be 255 characters or fewer.';
  }

  if (!conditionId.trim()) {
    errors.conditionId = 'Condition ID is required.';
  } else if (conditionId.trim().length > 255) {
    errors.conditionId = 'Condition ID must be 255 characters or fewer.';
  }

  const parsed = symptomIdsStr
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  if (parsed.length === 0) {
    errors.symptomIds = 'At least one Symptom ID is required (comma-separated).';
  }

  return errors;
}

function parseSymptomIds(str: string): string[] {
  return str
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

// ---------------------------------------------------------------------------
// Modal form component
// ---------------------------------------------------------------------------

interface RuleFormProps {
  /** Populated when editing; null when creating. */
  initial: Rule | null;
  onClose: () => void;
  onSaved: () => void;
}

function RuleForm({ initial, onClose, onSaved }: RuleFormProps) {
  const isEdit = initial !== null;

  const [id, setId] = useState(initial?.id ?? '');
  const [conditionId, setConditionId] = useState(initial?.conditionId ?? '');
  const [symptomIdsStr, setSymptomIdsStr] = useState(
    initial ? initial.symptomIds.join(', ') : ''
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    const validationErrors = validate(id, conditionId, symptomIdsStr);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setSubmitting(true);

    const symptomIds = parseSymptomIds(symptomIdsStr);
    const payload = {
      id: id.trim(),
      condition_id: conditionId.trim(),
      symptom_ids: symptomIds,
    };

    try {
      if (isEdit) {
        const { error } = await supabase
          .from('rules')
          .update({ condition_id: payload.condition_id, symptom_ids: payload.symptom_ids })
          .eq('id', payload.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('rules').insert(payload);
        if (error) throw error;
      }

      onSaved();
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'An unexpected error occurred. Please try again.';
      setServerError(`${isEdit ? 'Update' : 'Create'} failed: ${message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    /* Overlay */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={isEdit ? 'Edit Rule' : 'Create Rule'}
    >
      <div className="w-full max-w-lg rounded-clay bg-white shadow-clay-lg p-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-gray-800 font-display">
            {isEdit ? 'Edit Rule' : 'Create Rule'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800 transition-colors p-1 rounded-clay-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-600"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Server error banner */}
        {serverError && (
          <div
            role="alert"
            className="mb-4 rounded-clay-sm bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700"
          >
            {serverError}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* ID field — read-only when editing */}
          <div>
            <label htmlFor="rule-id" className="block text-sm font-medium text-gray-700 mb-1">
              Rule ID <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <input
              id="rule-id"
              type="text"
              value={id}
              onChange={(e) => setId(e.target.value)}
              disabled={isEdit}
              placeholder="e.g. rule-battery-01"
              aria-required="true"
              aria-invalid={!!errors.id}
              aria-describedby={errors.id ? 'rule-id-error' : undefined}
              className={`w-full rounded-clay-sm border px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400 transition ${
                errors.id ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'
              } ${isEdit ? 'opacity-60 cursor-not-allowed bg-gray-100' : ''}`}
            />
            {errors.id && (
              <p id="rule-id-error" role="alert" className="mt-1 text-xs text-red-600">
                {errors.id}
              </p>
            )}
            {isEdit && (
              <p className="mt-1 text-xs text-gray-600">ID cannot be changed after creation.</p>
            )}
          </div>

          {/* Condition ID */}
          <div>
            <label htmlFor="rule-condition-id" className="block text-sm font-medium text-gray-700 mb-1">
              Condition ID <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <input
              id="rule-condition-id"
              type="text"
              value={conditionId}
              onChange={(e) => setConditionId(e.target.value)}
              placeholder="e.g. battery-degradation"
              aria-required="true"
              aria-invalid={!!errors.conditionId}
              aria-describedby={errors.conditionId ? 'rule-condition-id-error' : undefined}
              className={`w-full rounded-clay-sm border px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400 transition ${
                errors.conditionId ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'
              }`}
            />
            {errors.conditionId && (
              <p id="rule-condition-id-error" role="alert" className="mt-1 text-xs text-red-600">
                {errors.conditionId}
              </p>
            )}
          </div>

          {/* Symptom IDs (comma-separated) */}
          <div>
            <label htmlFor="rule-symptom-ids" className="block text-sm font-medium text-gray-700 mb-1">
              Symptom IDs <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <input
              id="rule-symptom-ids"
              type="text"
              value={symptomIdsStr}
              onChange={(e) => setSymptomIdsStr(e.target.value)}
              placeholder="e.g. battery-drain-fast, battery-overheating"
              aria-required="true"
              aria-invalid={!!errors.symptomIds}
              aria-describedby={
                errors.symptomIds
                  ? 'rule-symptom-ids-error'
                  : 'rule-symptom-ids-hint'
              }
              className={`w-full rounded-clay-sm border px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400 transition ${
                errors.symptomIds ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'
              }`}
            />
            {errors.symptomIds ? (
              <p id="rule-symptom-ids-error" role="alert" className="mt-1 text-xs text-red-600">
                {errors.symptomIds}
              </p>
            ) : (
              <p id="rule-symptom-ids-hint" className="mt-1 text-xs text-gray-600">
                Enter one or more Symptom IDs separated by commas.
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="clay-btn-secondary px-4 py-2 text-sm rounded-clay-sm disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="clay-btn-primary px-5 py-2 text-sm rounded-clay-sm font-semibold disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-500"
            >
              {submitting ? (isEdit ? 'Saving…' : 'Creating…') : isEdit ? 'Save Changes' : 'Create Rule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Delete confirmation dialog
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
      const message =
        err instanceof Error ? err.message : 'An unexpected error occurred.';
      setError(`Delete failed: ${message}`);
      setDeleting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Confirm delete rule"
    >
      <div className="w-full max-w-sm rounded-clay bg-white shadow-clay-lg p-6 animate-fade-in">
        <h2 className="text-lg font-bold text-gray-800 mb-2 font-display">Delete Rule?</h2>
        <p className="text-sm text-gray-600 mb-1">
          Are you sure you want to delete rule{' '}
          <span className="font-semibold text-gray-800">{rule.id}</span>?
        </p>
        <p className="text-xs text-gray-600 mb-4">This action cannot be undone.</p>

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
            className="clay-btn-secondary px-4 py-2 text-sm rounded-clay-sm disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-500"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="px-4 py-2 text-sm font-semibold rounded-clay-sm bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-500"
          >
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Toast notification (lightweight)
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
        aria-label="Dismiss notification"
      >
        ✕
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page component
// ---------------------------------------------------------------------------

/**
 * RulesAdmin — CRUD management view for the `rules` Supabase table.
 *
 * Columns displayed: id, conditionId, symptomIds (comma-separated).
 * Form fields: id (read-only on edit), conditionId, symptomIds (comma-separated input).
 *
 * Requirements: 10.2, 10.9
 */
export default function RulesAdmin() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  // Modal state
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<Rule | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Rule | null>(null);

  // ---------------------------------------------------------------------------
  // Data fetching
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
      const message =
        err instanceof Error ? err.message : 'Unknown error';
      setToast(`Fetch failed: ${message}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  // ---------------------------------------------------------------------------
  // Column definitions
  // ---------------------------------------------------------------------------

  const columns: ColumnDef<Rule>[] = [
    {
      key: 'id',
      header: 'ID',
      render: (row) => (
        <span className="font-mono text-xs text-gray-700 break-all">{row.id}</span>
      ),
    },
    {
      key: 'conditionId',
      header: 'Condition ID',
      render: (row) => (
        <span className="font-mono text-xs text-gray-700 break-all">{row.conditionId}</span>
      ),
    },
    {
      key: 'symptomIds',
      header: 'Symptom IDs',
      render: (row) => (
        <span className="text-xs text-gray-600 break-all">
          {row.symptomIds.join(', ') || <em className="text-gray-600">—</em>}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setEditTarget(row)}
            className="text-xs font-medium text-primary-600 hover:text-primary-800 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-500 rounded px-1"
            aria-label={`Edit rule ${row.id}`}
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => setDeleteTarget(row)}
            className="text-xs font-medium text-red-500 hover:text-red-700 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-500 rounded px-1"
            aria-label={`Delete rule ${row.id}`}
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

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
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 font-display">Rules</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage inference rules that link symptom combinations to conditions.
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
          Create Rule
        </button>
      </div>

      {/* ── DataTable ───────────────────────────────────────────────────── */}
      <DataTable<Rule>
        data={rules}
        columns={columns}
        pageSize={10}
        isLoading={isLoading}
      />

      {/* ── Create Modal ────────────────────────────────────────────────── */}
      {showCreate && (
        <RuleForm
          initial={null}
          onClose={() => setShowCreate(false)}
          onSaved={handleSaved}
        />
      )}

      {/* ── Edit Modal ──────────────────────────────────────────────────── */}
      {editTarget && (
        <RuleForm
          initial={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={handleSaved}
        />
      )}

      {/* ── Delete Confirmation ─────────────────────────────────────────── */}
      {deleteTarget && (
        <DeleteConfirm
          rule={deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onConfirmed={handleDeleted}
        />
      )}

      {/* ── Toast ───────────────────────────────────────────────────────── */}
      {toast && (
        <Toast message={toast} onDismiss={() => setToast(null)} />
      )}
    </div>
  );
}
