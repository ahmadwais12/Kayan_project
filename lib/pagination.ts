export const ROWS_OPTIONS = [5, 10, 25, 50, 100] as const;

export type RowsOption = (typeof ROWS_OPTIONS)[number];

export function parseRows(value: string | undefined, fallback: RowsOption): RowsOption {
  const rows = Number(value);
  return (ROWS_OPTIONS as readonly number[]).includes(rows) ? (rows as RowsOption) : fallback;
}
