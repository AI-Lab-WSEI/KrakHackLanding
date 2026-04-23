/**
 * PanelTable — cienki `<table>` wrapper zgodny z resztą stylu panelu.
 *
 * Użycie:
 *   <PanelTable
 *     columns={[{ key: 'name', label: 'Nazwa' }, { key: 'role', label: 'Rola' }]}
 *     rows={users}
 *     renderCell={(row, col) => col.key === 'role' ? <Badge>{row.role}</Badge> : row[col.key]}
 *   />
 *
 * Styl: nagłówki `text-gray-400 text-xs uppercase tracking-wider`,
 *       wiersze z hover `bg-white/5`, separatory `border-white/10`.
 */
import type { ReactNode } from 'react';

export interface PanelTableColumn<Row> {
  key: string;
  label: string;
  className?: string;
  align?: 'left' | 'right' | 'center';
  render?: (row: Row) => ReactNode;
}

interface PanelTableProps<Row> {
  columns: PanelTableColumn<Row>[];
  rows: Row[];
  rowKey?: (row: Row, idx: number) => string | number;
  emptyLabel?: string;
  loading?: boolean;
  onRowClick?: (row: Row) => void;
}

export function PanelTable<Row extends Record<string, unknown>>({
  columns,
  rows,
  rowKey,
  emptyLabel = 'Brak danych',
  loading = false,
  onRowClick,
}: PanelTableProps<Row>) {
  const alignCls = (a?: 'left' | 'right' | 'center') =>
    a === 'right' ? 'text-right' : a === 'center' ? 'text-center' : 'text-left';

  if (loading) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center text-sm text-gray-400">
        Ładowanie…
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center text-sm text-gray-500">
        {emptyLabel}
      </div>
    );
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.02]">
              {columns.map(c => (
                <th
                  key={c.key}
                  className={`px-4 py-3 font-medium text-xs text-gray-400 uppercase tracking-wider ${alignCls(c.align)} ${c.className ?? ''}`}
                >
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const k = rowKey ? rowKey(row, i) : i;
              return (
                <tr
                  key={k}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={`border-b border-white/5 last:border-b-0 transition-colors ${
                    onRowClick ? 'cursor-pointer hover:bg-white/5' : 'hover:bg-white/[0.03]'
                  }`}
                >
                  {columns.map(c => (
                    <td
                      key={c.key}
                      className={`px-4 py-3 text-white ${alignCls(c.align)} ${c.className ?? ''}`}
                    >
                      {c.render ? c.render(row) : String(row[c.key] ?? '—')}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
