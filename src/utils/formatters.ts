import { OrderStatus } from '../types';

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(isoString: string): string {
  if (!isoString) return '-';
  try {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return isoString;
  }
}

export function getOrderStatusConfig(status: OrderStatus): {
  label: string;
  badgeClass: string;
  stepIndex: number;
} {
  switch (status) {
    case 'pending_payment':
      return {
        label: 'Menunggu Pembayaran',
        badgeClass: 'bg-amber-500/10 text-amber-400 border border-amber-500/30',
        stepIndex: 1,
      };
    case 'awaiting_approval':
      return {
        label: 'Menunggu Verifikasi Bukti',
        badgeClass: 'bg-blue-500/10 text-blue-400 border border-blue-500/30 animate-pulse',
        stepIndex: 2,
      };
    case 'processing':
      return {
        label: 'Diproses & Dikemas',
        badgeClass: 'bg-purple-500/10 text-purple-400 border border-purple-500/30',
        stepIndex: 3,
      };
    case 'shipped':
      return {
        label: 'Sedang Dikirim',
        badgeClass: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30',
        stepIndex: 4,
      };
    case 'delivered':
      return {
        label: 'Pesanan Selesai',
        badgeClass: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
        stepIndex: 5,
      };
    case 'rejected':
      return {
        label: 'Bukti Ditolak',
        badgeClass: 'bg-rose-500/10 text-rose-400 border border-rose-500/30',
        stepIndex: 1,
      };
    case 'cancelled':
      return {
        label: 'Dibatalkan',
        badgeClass: 'bg-gray-500/10 text-gray-400 border border-gray-500/30',
        stepIndex: 0,
      };
    default:
      return {
        label: status,
        badgeClass: 'bg-gray-500/10 text-gray-400 border border-gray-500/30',
        stepIndex: 1,
      };
  }
}
