import type { SaleAdminDTO } from '@/types/interfaces/admin/SaleAdminDTO.interface';
import type { TimePeriod } from './dashboard.types';

export function getDateRange(
  period: TimePeriod,
  customFrom?: string,
  customTo?: string,
): { from: Date; to: Date } {
  const to = new Date();
  to.setHours(23, 59, 59, 999);

  if (period === '7days') {
    const from = new Date(to);
    from.setDate(from.getDate() - 6);
    from.setHours(0, 0, 0, 0);
    return { from, to };
  }

  if (period === '5weeks') {
    const from = new Date(to);
    from.setDate(from.getDate() - 34);
    from.setHours(0, 0, 0, 0);
    return { from, to };
  }

  const from = customFrom ? new Date(customFrom) : new Date(0);
  const toDate = customTo ? new Date(customTo) : to;
  toDate.setHours(23, 59, 59, 999);
  return { from, to: toDate };
}

export function getPreviousRange(from: Date, to: Date): { from: Date; to: Date } {
  const duration = to.getTime() - from.getTime();
  return {
    from: new Date(from.getTime() - duration - 1),
    to: new Date(from.getTime() - 1),
  };
}

export function filterByRange(sales: SaleAdminDTO[], from: Date, to: Date): SaleAdminDTO[] {
  return sales.filter((s) => {
    const d = new Date(s.date);
    return d >= from && d <= to;
  });
}

export function formatDay(d: Date): string {
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getFullYear()).slice(-2)}`;
}
