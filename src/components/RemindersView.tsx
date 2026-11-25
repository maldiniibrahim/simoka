import { useState } from 'react';
import {
  AlertTriangle,
  BellRing,
  Check,
  ChevronRight,
  Clock,
} from 'lucide-react';
import { ReminderAlert } from '../types/simoka';
import { formatSisaHari, formatTanggalId } from '../utils/dateAndReminders';

interface RemindersViewProps {
  reminders: ReminderAlert[];
  expiryWindowDays: number;
  onChangeExpiryWindow: (days: number) => void;
  onToggleAcknowledge: (reminderId: string) => void;
  onOpenDocument: (docId: string) => void;
}

export function RemindersView({
  reminders,
  expiryWindowDays,
  onChangeExpiryWindow,
  onToggleAcknowledge,
  onOpenDocument,
}: RemindersViewProps) {
  const [categoryFilter, setCategoryFilter] = useState<
    'Semua' | 'Masa Berlaku Dokumen' | 'Tenggat Tindak Lanjut'
  >('Semua');

  const visibleReminders = reminders.filter((r) =>
    categoryFilter === 'Semua' ? true : r.kategori === categoryFilter
  );

  const pendingCount = visibleReminders.filter((r) => !r.sudahDitinjau).length;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Pengingat Otomatis Tenggat & Masa Berlaku
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Deteksi otomatis dokumen yang mendekati akhir masa berlaku serta
            tindak lanjut yang mendekati atau melewati tenggat.
          </p>
        </div>
        <div className="text-xs font-mono tabular-nums text-slate-600 shrink-0">
          {pendingCount} belum ditinjau
        </div>
      </div>

      {/* Configuration & Category Bar */}
      <section
        aria-label="Pengaturan Ambang Pengingat"
        className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div className="flex flex-wrap items-center gap-1.5">
          {(
            [
              'Semua',
              'Masa Berlaku Dokumen',
              'Tenggat Tindak Lanjut',
            ] as const
          ).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`min-h-[40px] px-3.5 py-2 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap shrink-0 ${
                categoryFilter === cat
                  ? 'bg-[#0B2545] text-white border-[#0B2545]'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <span className="text-xs font-medium text-slate-600 whitespace-nowrap">
            Ambang Peringatan Berakhir:
          </span>
          <div className="inline-flex items-center p-1 bg-slate-100 rounded-lg">
            {[30, 60, 90].map((days) => (
              <button
                key={days}
                type="button"
                onClick={() => onChangeExpiryWindow(days)}
                className={`min-h-[34px] px-2.5 py-1 text-xs font-mono tabular-nums font-semibold rounded-md transition-colors whitespace-nowrap ${
                  expiryWindowDays === days
                    ? 'bg-white text-[#0B2545] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                H-{days}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Reminders Feed */}
      {visibleReminders.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-10 text-center">
          <BellRing
            className="w-8 h-8 text-slate-400 mx-auto"
            aria-hidden="true"
          />
          <p className="mt-2 text-sm font-semibold text-slate-900">
            Tidak ada pengingat aktif untuk ambang ini
          </p>
          <p className="mt-1 text-xs text-slate-600">
            Semua dokumen masih di luar batas H-{expiryWindowDays} atau seluruh
            tindak lanjut telah selesai.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-200 overflow-hidden">
          {visibleReminders.map((alert) => {
            const isCritical = alert.tingkat === 'Kritis';
            const isWarning = alert.tingkat === 'Peringatan';

            return (
              <div
                key={alert.id}
                className={`p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${
                  alert.sudahDitinjau ? 'bg-slate-50/60 opacity-75' : 'bg-white'
                }`}
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs">
                    <span
                      className={`inline-flex items-center gap-1 font-semibold ${
                        isCritical
                          ? 'text-red-700'
                          : isWarning
                            ? 'text-amber-700'
                            : 'text-[#13315C]'
                      }`}
                    >
                      {isCritical ? (
                        <AlertTriangle
                          className="w-3.5 h-3.5 shrink-0"
                          aria-hidden="true"
                        />
                      ) : (
                        <Clock
                          className="w-3.5 h-3.5 shrink-0"
                          aria-hidden="true"
                        />
                      )}
                      <span>{alert.tingkat}</span>
                    </span>
                    <span aria-hidden="true" className="text-slate-300">
                      ·
                    </span>
                    <span className="text-slate-600 font-medium">
                      {alert.kategori}
                    </span>
                    <span aria-hidden="true" className="text-slate-300">
                      ·
                    </span>
                    <span className="font-mono tabular-nums font-semibold text-slate-800">
                      {formatSisaHari(alert.sisaHari)}
                    </span>
                  </div>

                  <h2 className="text-sm sm:text-base font-semibold text-slate-900">
                    {alert.judulUtama}
                  </h2>

                  <p className="text-xs sm:text-sm text-slate-600">
                    {alert.subjudul}
                  </p>

                  <div className="text-xs text-slate-500">
                    {alert.jenis} · {alert.unit} · {alert.mitra} · Target:{' '}
                    <span className="font-mono tabular-nums text-slate-700">
                      {formatTanggalId(alert.tanggalTarget)}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => onToggleAcknowledge(alert.id)}
                    className={`min-h-[42px] inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border text-xs font-semibold transition-colors whitespace-nowrap ${
                      alert.sudahDitinjau
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    <span>
                      {alert.sudahDitinjau
                        ? 'Sudah Ditinjau'
                        : 'Tandai Ditinjau'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onOpenDocument(alert.dokumenId)}
                    className="min-h-[42px] inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-[#0B2545] text-white text-xs font-semibold hover:bg-[#13315C] transition-colors whitespace-nowrap"
                  >
                    <span>Tindak Lanjuti</span>
                    <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
