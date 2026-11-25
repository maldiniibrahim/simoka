import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  CircleDashed,
  XCircle,
} from 'lucide-react';
import { ExpiryState, FollowUpStatus } from '../types/simoka';

export function ExpiryStatusLabel({
  state,
  compact = false,
}: {
  state: ExpiryState;
  compact?: boolean;
}) {
  if (state === 'Aktif') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 whitespace-nowrap">
        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        <span>Aktif</span>
      </span>
    );
  }
  if (state === 'Segera Berakhir') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 whitespace-nowrap">
        <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        <span>{compact ? 'Segera Habis' : 'Segera Berakhir'}</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-700 whitespace-nowrap">
      <XCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      <span>Kedaluwarsa</span>
    </span>
  );
}

export function FollowUpStatusLabel({ status }: { status: FollowUpStatus }) {
  switch (status) {
    case 'Selesai':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 whitespace-nowrap">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>Selesai</span>
        </span>
      );
    case 'Dalam Proses':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#13315C] whitespace-nowrap">
          <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>Dalam Proses</span>
        </span>
      );
    case 'Perlu Eskalasi':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-700 whitespace-nowrap">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>Perlu Eskalasi</span>
        </span>
      );
    case 'Belum Dimulai':
    default:
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 whitespace-nowrap">
          <CircleDashed className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>Belum Dimulai</span>
        </span>
      );
  }
}
