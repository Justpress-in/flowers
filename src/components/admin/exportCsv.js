// Minimal CSV export helper. Opens in Excel cleanly because we prefix with a BOM
// so Excel detects UTF-8, and we quote every field so commas/newlines in values
// (addresses, notes) don't break columns.

function escapeCell(value) {
  if (value === null || value === undefined) return '';
  const s = typeof value === 'string' ? value : String(value);
  return `"${s.replace(/"/g, '""')}"`;
}

export function exportToCsv(filename, rows) {
  if (!rows || rows.length === 0) {
    alert('Nothing to export.');
    return;
  }
  const headers = Object.keys(rows[0]);
  const lines = [
    headers.map(escapeCell).join(','),
    ...rows.map((row) => headers.map((h) => escapeCell(row[h])).join(',')),
  ];
  const csv = '﻿' + lines.join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
