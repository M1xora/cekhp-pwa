import React, { useState, useEffect } from 'react';

/**
 * Column definition for DataTable.
 * `key`    — unique identifier for the column (also used as React key).
 * `header` — text shown in the `<th>` cell.
 * `render` — optional custom renderer; receives the full row object and returns
 *            any renderable React node. Falls back to `String(row[key])` when absent.
 */
export interface ColumnDef<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
}

/**
 * DataTableProps — generic admin table with client-side pagination.
 *
 * @template T — the shape of a single data row.
 *
 * Requirements: 10.3
 */
export interface DataTableProps<T> {
  /** Array of row objects to display. */
  data: T[];
  /** Column definitions controlling headers and cell content. */
  columns: ColumnDef<T>[];
  /** Number of rows per page. Defaults to 10. */
  pageSize?: number;
  /** When true, replaces the table body with a skeleton loading indicator. */
  isLoading?: boolean;
}

/**
 * DataTable — a generic, accessible, paginated data table.
 *
 * Exported both as default and as named export so consuming modules can choose
 * whichever import style they prefer.
 *
 * Requirements: 10.3
 */
export function DataTable<T extends object>({
  data,
  columns,
  pageSize = 10,
  isLoading = false,
}: DataTableProps<T>): React.ReactElement {
  // Reset to page 1 whenever the data or pageSize changes.
  const [currentPage, setCurrentPage] = useState(1);
  useEffect(() => {
    setCurrentPage(1);
  }, [data, pageSize]);

  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
  // Clamp current page in case data shrinks after deletion.
  const safePage = Math.min(currentPage, totalPages);

  const startIndex = (safePage - 1) * pageSize;
  const pageRows = data.slice(startIndex, startIndex + pageSize);

  const handlePrev = () => setCurrentPage((p) => Math.max(1, p - 1));
  const handleNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1));

  // ── Loading state ──────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div
        className="w-full overflow-x-auto rounded-xl border"
        style={{ borderColor: 'rgba(45,27,105,0.10)' }}
        aria-busy="true"
        aria-label="Loading table data"
      >
        {/* Skeleton header */}
        <div
          className="px-4 py-3 flex gap-4 animate-pulse"
          style={{ background: 'rgba(45,27,105,0.04)' }}
        >
          {columns.map((col) => (
            <div key={col.key} className="h-4 rounded flex-1" style={{ background: 'rgba(45,27,105,0.12)' }} />
          ))}
        </div>
        {/* Skeleton rows */}
        {Array.from({ length: pageSize }).map((_, rowIdx) => (
          <div
            key={rowIdx}
            className="flex gap-4 px-4 py-3 border-t animate-pulse"
            style={{ borderColor: 'rgba(45,27,105,0.06)' }}
          >
            {columns.map((col) => (
              <div key={col.key} className="h-4 rounded flex-1" style={{ background: 'rgba(45,27,105,0.07)' }} />
            ))}
          </div>
        ))}
      </div>
    );
  }

  // ── Empty state ────────────────────────────────────────────────────────────
  if (data.length === 0) {
    return (
      <div
        className="w-full rounded-xl overflow-hidden border"
        style={{ borderColor: 'rgba(45,27,105,0.10)' }}
      >
        <table
          role="table"
          className="w-full text-sm text-left border-collapse"
          style={{ fontFamily: 'var(--font-body)', color: 'var(--text-dark)' }}
        >
          <thead style={{ background: 'rgba(45,27,105,0.04)', borderBottom: '1.5px solid rgba(45,27,105,0.10)' }}>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className="px-4 py-3 font-bold tracking-wide uppercase text-xs"
                  style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody style={{ background: 'var(--bg-surface)' }}>
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-12 text-center italic"
                style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}
              >
                No data found
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  // ── Normal table ───────────────────────────────────────────────────────────
  return (
    <div className="w-full">
      {/* Table */}
      <div
        className="w-full overflow-x-auto rounded-xl border"
        style={{ borderColor: 'rgba(45,27,105,0.10)' }}
      >
        <table
          role="table"
          className="w-full text-sm text-left border-collapse"
          style={{ fontFamily: 'var(--font-body)', color: 'var(--text-dark)' }}
        >
          <thead style={{ background: 'rgba(45,27,105,0.04)', borderBottom: '1.5px solid rgba(45,27,105,0.10)' }}>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className="px-4 py-3 font-bold tracking-wide uppercase text-xs"
                  style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody style={{ background: 'var(--bg-surface)' }}>
            {pageRows.map((row, rowIdx) => (
              <tr
                key={rowIdx}
                style={{ borderBottom: '1px solid rgba(45,27,105,0.06)' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = 'rgba(45,27,105,0.03)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = 'var(--bg-surface)'; }}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className="px-4 py-3 align-top"
                    style={{ fontFamily: 'var(--font-body)', color: 'var(--text-dark)' }}
                  >
                    {col.render
                      ? col.render(row)
                      : String((row as Record<string, unknown>)[col.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination controls — flat, brand-colored */}
      <div
        className="mt-4 flex items-center justify-between text-sm"
        style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}
        aria-label="Table pagination"
      >
        {/* Page info */}
        <span className="tabular-nums">
          Page{' '}
          <span className="font-bold" style={{ color: 'var(--text-dark)' }}>{safePage}</span>
          {' '}of{' '}
          <span className="font-bold" style={{ color: 'var(--text-dark)' }}>{totalPages}</span>
          {' '}
          <span>({data.length} {data.length === 1 ? 'record' : 'records'})</span>
        </span>

        {/* Flat Previous / Next buttons */}
        <div className="flex gap-2">
          <button
            onClick={handlePrev}
            disabled={safePage <= 1}
            className="px-4 py-2 text-sm font-bold rounded-lg border transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2"
            style={{
              border: '1.5px solid rgba(45,27,105,0.15)',
              background: 'var(--bg-surface)',
              color: 'var(--text-dark)',
              fontFamily: 'var(--font-body)',
            }}
            aria-label="Previous page"
          >
            ← Previous
          </button>
          <button
            onClick={handleNext}
            disabled={safePage >= totalPages}
            className="px-4 py-2 text-sm font-bold rounded-lg border transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2"
            style={{
              border: '1.5px solid rgba(45,27,105,0.15)',
              background: 'var(--bg-surface)',
              color: 'var(--text-dark)',
              fontFamily: 'var(--font-body)',
            }}
            aria-label="Next page"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}

// Also export as default for flexibility.
export default DataTable;
