import {
  ArrowRight,
  BellRing,
  Download,
  FileText,
  FolderOpen,
} from 'lucide-react';
import {
  CooperationDocument,
  FollowUpStatus,
  NavigationTab,
  ReminderAlert,
} from '../types/simoka';
import {
  formatSisaHari,
  formatTanggalId,
  getExpiryState,
  getFollowUpProgress,
} from '../utils/dateAndReminders';

interface AdminDashboardProps {
  documents: CooperationDocument[];
  reminders: ReminderAlert[];
  onOpenDocument: (docId: string) => void;
  onNavigate: (tab: NavigationTab) => void;
  onAddDocument: () => void;
}

export function AdminDashboard({
  documents,
  reminders,
  onOpenDocument,
  onNavigate,
  onAddDocument,
}: AdminDashboardProps) {
  const totalDocs = documents.length;
  const mouCount = documents.filter((d) => d.jenis === 'MoU').length;
  const pksCount = documents.filter((d) => d.jenis === 'PKS').length;

  const activeCount = documents.filter(
    (d) => getExpiryState(d.tanggalBerakhir) === 'Aktif'
  ).length;
  const expiringSoonCount = documents.filter(
    (d) => getExpiryState(d.tanggalBerakhir) === 'Segera Berakhir'
  ).length;
  const expiredCount = documents.filter(
    (d) => getExpiryState(d.tanggalBerakhir) === 'Kedaluwarsa'
  ).length;

  const allFollowUps = documents.flatMap((d) => d.tindakLanjut);
  const totalFollowUps = allFollowUps.length;
  const completedFollowUps = allFollowUps.filter(
    (f) => f.status === 'Selesai'
  ).length;
  const escalationCount = allFollowUps.filter(
    (f) => f.status === 'Perlu Eskalasi'
  ).length;
  const totalEvidence = allFollowUps.reduce(
    (acc, item) => acc + item.buktiDukung.length,
    0
  );
  const realizationRate =
    totalFollowUps > 0
      ? Math.round((completedFollowUps / totalFollowUps) * 100)
      : 0;

  // Group by Unit Pengelola
  const unitMap = new Map<
    string,
    {
      unit: string;
      total: number;
      mou: number;
      pks: number;
      followUpTotal: number;
      followUpDone: number;
      attentionNeeded: number;
    }
  >();

  for (const doc of documents) {
    const current = unitMap.get(doc.unit) ?? {
      unit: doc.unit,
      total: 0,
      mou: 0,
      pks: 0,
      followUpTotal: 0,
      followUpDone: 0,
      attentionNeeded: 0,
    };
    current.total += 1;
    if (doc.jenis === 'MoU') current.mou += 1;
    else current.pks += 1;

    const progress = getFollowUpProgress(doc);
    current.followUpTotal += progress.total;
    current.followUpDone += progress.selesai;

    const state = getExpiryState(doc.tanggalBerakhir);
    if (state !== 'Aktif') current.attentionNeeded += 1;

    unitMap.set(doc.unit, current);
  }

  const unitRecap = Array.from(unitMap.values()).sort(
    (a, b) => b.total - a.total
  );

  const followUpStatusCounts: { status: FollowUpStatus; count: number }[] = [
    {
      status: 'Selesai',
      count: allFollowUps.filter((f) => f.status === 'Selesai').length,
    },
    {
      status: 'Dalam Proses',
      count: allFollowUps.filter((f) => f.status === 'Dalam Proses').length,
    },
    {
      status: 'Belum Dimulai',
      count: allFollowUps.filter((f) => f.status === 'Belum Dimulai').length,
    },
    {
      status: 'Perlu Eskalasi',
      count: escalationCount,
    },
  ];

  const priorityReminders = reminders
    .filter((r) => !r.sudahDitinjau)
    .slice(0, 4);

  function handleExportCsv() {
    const headers = [
      'Nomor Dokumen',
      'Jenis',
      'Judul Kerja Sama',
      'Mitra',
      'Unit Pengelola',
      'Tanggal Mulai',
      'Tanggal Berakhir',
      'Status Masa Berlaku',
      'Tindak Lanjut Selesai',
      'Total Tindak Lanjut',
      'Jumlah Bukti Dukung',
    ];

    const rows = documents.map((doc) => {
      const progress = getFollowUpProgress(doc);
      const evidenceCount = doc.tindakLanjut.reduce(
        (sum, t) => sum + t.buktiDukung.length,
        0
      );
      const state = getExpiryState(doc.tanggalBerakhir);
      return [
        doc.nomorDokumen,
        doc.jenis,
        doc.judul,
        doc.mitra,
        doc.unit,
        doc.tanggalMulai,
        doc.tanggalBerakhir,
        state,
        String(progress.selesai),
        String(progress.total),
        String(evidenceCount),
      ]
        .map((val) => `"${val.replace(/"/g, '""')}"`)
        .join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rekap-simoka-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      {/* Header Summary Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Dashboard Kerja Sama
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Ringkasan terpusat status dokumen MoU/PKS, capaian tindak lanjut,
            dan peringatan tenggat lintas unit.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleExportCsv}
            className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
          >
            <Download className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Ekspor Rekap CSV</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Strip */}
      <section
        aria-label="Ringkasan Statistik Utama"
        className="grid grid-cols-2 lg:grid-cols-4 bg-white border border-slate-200 rounded-xl divide-y sm:divide-y-0 sm:divide-x divide-slate-200 overflow-hidden"
      >
        <div className="p-4 sm:p-5">
          <div className="text-xs font-medium text-slate-500">
            Total Dokumen
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-bold text-[#0B2545] tabular-nums">
            {totalDocs}
          </div>
          <div className="mt-1.5 text-xs text-slate-600 tabular-nums">
            {mouCount} MoU · {pksCount} PKS
          </div>
        </div>

        <div className="p-4 sm:p-5 border-l border-slate-200 sm:border-l-0">
          <div className="text-xs font-medium text-slate-500">
            Dokumen Aktif
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-bold text-emerald-700 tabular-nums">
            {activeCount}
          </div>
          <div className="mt-1.5 text-xs text-slate-600 tabular-nums">
            {totalDocs > 0 ? Math.round((activeCount / totalDocs) * 100) : 0}%
            dari total kerja sama
          </div>
        </div>

        <div className="p-4 sm:p-5">
          <div className="text-xs font-medium text-slate-500">
            Perlu Perhatian Masa Berlaku
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-bold text-amber-700 tabular-nums">
            {expiringSoonCount + expiredCount}
          </div>
          <div className="mt-1.5 text-xs text-slate-600 tabular-nums">
            {expiringSoonCount} segera habis · {expiredCount} kedaluwarsa
          </div>
        </div>

        <div className="p-4 sm:p-5 border-l border-slate-200 sm:border-l-0">
          <div className="text-xs font-medium text-slate-500">
            Realisasi Tindak Lanjut
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-bold text-[#0B2545] tabular-nums">
            {realizationRate}%
          </div>
          <div className="mt-1.5 text-xs text-slate-600 tabular-nums">
            {completedFollowUps}/{totalFollowUps} selesai · {totalEvidence}{' '}
            bukti dukung
          </div>
        </div>
      </section>

      {/* Main 2-Column Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Unit Recap Table */}
        <section className="lg:col-span-7 bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Rekapitulasi per Unit Pengelola
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Sebaran dokumen dan persentase penyelesaian tindak lanjut tiap
                unit
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('repositori')}
              className="text-xs font-semibold text-[#0B2545] hover:underline inline-flex items-center gap-1 whitespace-nowrap shrink-0 min-h-[36px]"
            >
              <span>Buka Repositori</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>

          {unitRecap.length === 0 ? (
            <div className="p-8 text-center">
              <FolderOpen
                className="w-8 h-8 text-slate-400 mx-auto"
                aria-hidden="true"
              />
              <p className="mt-2 text-sm text-slate-600">
                Belum ada dokumen yang tercatat pada unit mana pun.
              </p>
              <button
                type="button"
                onClick={onAddDocument}
                className="mt-4 min-h-[44px] px-4 py-2 rounded-lg bg-[#0B2545] text-white text-sm font-medium"
              >
                Tambah Dokumen Pertama
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {unitRecap.map((row) => {
                const pct =
                  row.followUpTotal > 0
                    ? Math.round((row.followUpDone / row.followUpTotal) * 100)
                    : 0;
                return (
                  <div key={row.unit} className="px-5 py-4 space-y-2.5">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className="text-sm font-semibold text-slate-900">
                        {row.unit}
                      </span>
                      <span className="text-xs text-slate-600 tabular-nums">
                        {row.total} dokumen ({row.mou} MoU · {row.pks} PKS)
                        {row.attentionNeeded > 0 && (
                          <span className="text-amber-700 font-medium">
                            {' '}
                            · {row.attentionNeeded} perlu perhatian
                          </span>
                        )}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#0B2545] rounded-full transition-all duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono tabular-nums text-slate-700 w-24 text-right shrink-0">
                        {row.followUpDone}/{row.followUpTotal} ({pct}%)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Status Tindak Lanjut Summary Strip */}
          <div className="px-5 py-4 bg-slate-50 border-t border-slate-200">
            <div className="text-xs font-semibold text-slate-700 mb-3">
              Distribusi Status Seluruh Tindak Lanjut
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {followUpStatusCounts.map((item) => (
                <div key={item.status} className="space-y-0.5">
                  <div className="text-xs text-slate-500">{item.status}</div>
                  <div className="text-lg font-bold text-slate-900 tabular-nums">
                    {item.count}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Right: Priority Reminders */}
        <section className="lg:col-span-5 bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <BellRing
                className="w-4 h-4 text-[#0B2545] shrink-0"
                aria-hidden="true"
              />
              <h2 className="text-base font-semibold text-slate-900">
                Pengingat Mendesak
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('pengingat')}
              className="text-xs font-semibold text-[#0B2545] hover:underline inline-flex items-center gap-1 whitespace-nowrap shrink-0 min-h-[36px]"
            >
              <span>Semua ({reminders.length})</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>

          {priorityReminders.length === 0 ? (
            <div className="p-6 text-center text-sm text-slate-600">
              Seluruh pengingat telah ditinjau atau belum ada tenggat mendesak.
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {priorityReminders.map((alert) => {
                const urgencyColor =
                  alert.tingkat === 'Kritis'
                    ? 'text-red-700'
                    : alert.tingkat === 'Peringatan'
                      ? 'text-amber-700'
                      : 'text-[#13315C]';
                return (
                  <button
                    key={alert.id}
                    type="button"
                    onClick={() => onOpenDocument(alert.dokumenId)}
                    className="w-full text-left px-5 py-4 hover:bg-slate-50 transition-colors focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#0B2545] min-h-[64px]"
                  >
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className={`font-semibold ${urgencyColor}`}>
                        {alert.tingkat} · {alert.kategori}
                      </span>
                      <span className="font-mono tabular-nums text-slate-600 shrink-0">
                        {formatSisaHari(alert.sisaHari)}
                      </span>
                    </div>
                    <div className="mt-1 text-sm font-semibold text-slate-900 line-clamp-1">
                      {alert.judulUtama}
                    </div>
                    <div className="mt-1 text-xs text-slate-600 line-clamp-1">
                      {alert.mitra} · {alert.unit} · Target{' '}
                      <span className="tabular-nums">
                        {formatTanggalId(alert.tanggalTarget)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2 text-xs text-slate-600">
            <span className="inline-flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>Klik item untuk membuka dokumen & mencatat tindak lanjut</span>
            </span>
          </div>
        </section>
      </div>
    </div>
  );
}
