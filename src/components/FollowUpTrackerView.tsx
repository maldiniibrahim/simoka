import { useMemo, useState } from 'react';
import {
  ChevronRight,
  FileCheck2,
  Paperclip,
  Plus,
  Search,
} from 'lucide-react';
import {
  CooperationDocument,
  EvidenceFile,
  FollowUpStatus,
} from '../types/simoka';
import {
  diffDaysFromToday,
  formatSisaHari,
  formatTanggalId,
} from '../utils/dateAndReminders';
import { FollowUpStatusLabel } from './StatusText';

interface FollowUpTrackerViewProps {
  documents: CooperationDocument[];
  onOpenDocument: (docId: string) => void;
  onUpdateFollowUpStatus: (
    docId: string,
    followUpId: string,
    status: FollowUpStatus
  ) => void;
  onAddEvidence: (
    docId: string,
    followUpId: string,
    evidence: Omit<EvidenceFile, 'id'>
  ) => void;
}

const STATUS_OPTIONS: ('Semua' | FollowUpStatus)[] = [
  'Semua',
  'Perlu Eskalasi',
  'Dalam Proses',
  'Belum Dimulai',
  'Selesai',
];

export function FollowUpTrackerView({
  documents,
  onOpenDocument,
  onUpdateFollowUpStatus,
  onAddEvidence,
}: FollowUpTrackerViewProps) {
  const [statusFilter, setStatusFilter] = useState<'Semua' | FollowUpStatus>(
    'Semua'
  );
  const [query, setQuery] = useState('');
  const [attachingKey, setAttachingKey] = useState<string | null>(null);
  const [evidenceName, setEvidenceName] = useState('');
  const [evidenceType, setEvidenceType] =
    useState<EvidenceFile['jenisBukti']>('Laporan Realisasi');

  const flattenedItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = documents.flatMap((doc) =>
      doc.tindakLanjut.map((item) => ({
        doc,
        item,
        sisaTenggat: diffDaysFromToday(item.tenggat),
      }))
    );

    return list
      .filter(({ doc, item }) => {
        if (statusFilter !== 'Semua' && item.status !== statusFilter) {
          return false;
        }
        if (q) {
          const text = [
            item.judulKegiatan,
            item.deskripsi,
            item.picPeran,
            doc.judul,
            doc.mitra,
            doc.unit,
          ]
            .join(' ')
            .toLowerCase();
          if (!text.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => a.sisaTenggat - b.sisaTenggat);
  }, [documents, statusFilter, query]);

  function handleQuickAttach(docId: string, followUpId: string) {
    const cleaned = evidenceName.trim();
    if (!cleaned) return;
    onAddEvidence(docId, followUpId, {
      namaBerkas: cleaned.endsWith('.pdf') ? cleaned : `${cleaned}.pdf`,
      jenisBukti: evidenceType,
      ukuran: '1,2 MB',
      tanggalUnggah: new Date().toISOString().slice(0, 10),
    });
    setEvidenceName('');
    setAttachingKey(null);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Pemantauan Tindak Lanjut
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Pantau realisasi rencana kerja setiap dokumen, perbarui status, dan
            lengkapi bukti dukung pelaksanaan.
          </p>
        </div>
        <div className="text-xs font-mono tabular-nums text-slate-600 shrink-0">
          {flattenedItems.length} kegiatan ditampilkan
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
        <div className="relative">
          <Search
            className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari kegiatan tindak lanjut, mitra, atau unit pengelola..."
            aria-label="Cari tindak lanjut"
            className="w-full min-h-[44px] pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#0B2545]"
          />
        </div>

        <div
          role="group"
          aria-label="Filter Status Tindak Lanjut"
          className="flex flex-wrap items-center gap-1.5"
        >
          {STATUS_OPTIONS.map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`min-h-[38px] px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap shrink-0 ${
                statusFilter === st
                  ? 'bg-[#0B2545] text-white border-[#0B2545]'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Follow-up List */}
      {flattenedItems.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-10 text-center">
          <p className="text-sm font-semibold text-slate-900">
            Tidak ada agenda tindak lanjut pada filter ini
          </p>
          <p className="mt-1 text-xs text-slate-600">
            Pilih dokumen pada menu Repositori untuk menambahkan agenda tindak
            lanjut baru.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-200 overflow-hidden">
          {flattenedItems.map(({ doc, item, sisaTenggat }) => {
            const key = `${doc.id}-${item.id}`;
            const isAttaching = attachingKey === key;

            return (
              <div key={key} className="p-4 sm:p-5 space-y-3">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                  <div className="space-y-1 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
                      <span className="font-semibold text-[#0B2545]">
                        {doc.jenis}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{doc.unit}</span>
                      <span aria-hidden="true">·</span>
                      <span>{doc.mitra}</span>
                    </div>

                    <h2 className="text-sm sm:text-base font-semibold text-slate-900">
                      {item.judulKegiatan}
                    </h2>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {item.deskripsi}
                    </p>

                    <div className="pt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 tabular-nums">
                      <span>PIC: {item.picPeran}</span>
                      <span aria-hidden="true">·</span>
                      <span
                        className={
                          item.status !== 'Selesai' && sisaTenggat < 0
                            ? 'text-red-700 font-semibold'
                            : item.status !== 'Selesai' && sisaTenggat <= 14
                              ? 'text-amber-700 font-semibold'
                              : ''
                        }
                      >
                        Tenggat {formatTanggalId(item.tenggat)} (
                        {item.status === 'Selesai'
                          ? 'Terealisasi'
                          : formatSisaHari(sisaTenggat)}
                        )
                      </span>
                    </div>
                  </div>

                  {/* Action Controls */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <FollowUpStatusLabel status={item.status} />

                    <select
                      aria-label={`Ubah status ${item.judulKegiatan}`}
                      value={item.status}
                      onChange={(e) =>
                        onUpdateFollowUpStatus(
                          doc.id,
                          item.id,
                          e.target.value as FollowUpStatus
                        )
                      }
                      className="min-h-[40px] px-3 py-1.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:border-[#0B2545]"
                    >
                      <option value="Belum Dimulai">Belum Dimulai</option>
                      <option value="Dalam Proses">Dalam Proses</option>
                      <option value="Perlu Eskalasi">Perlu Eskalasi</option>
                      <option value="Selesai">Selesai</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => onOpenDocument(doc.id)}
                      className="min-h-[40px] inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-[#0B2545] hover:bg-slate-50 whitespace-nowrap"
                    >
                      <span>Buka Dokumen</span>
                      <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                {/* Bukti Dukung List + Quick Attach */}
                <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs">
                    {item.buktiDukung.length === 0 ? (
                      <span className="text-slate-400 inline-flex items-center gap-1.5">
                        <Paperclip className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Belum ada bukti dukung terlampir</span>
                      </span>
                    ) : (
                      item.buktiDukung.map((ev) => (
                        <span
                          key={ev.id}
                          className="inline-flex items-center gap-1.5 text-slate-700 font-medium"
                        >
                          <FileCheck2
                            className="w-3.5 h-3.5 text-emerald-700 shrink-0"
                            aria-hidden="true"
                          />
                          <span>{ev.namaBerkas}</span>
                          <span className="text-slate-400 font-normal">
                            ({ev.jenisBukti} · {ev.ukuran})
                          </span>
                        </span>
                      ))
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setAttachingKey(isAttaching ? null : key)}
                    className="min-h-[36px] inline-flex items-center gap-1 text-xs font-semibold text-[#0B2545] hover:underline whitespace-nowrap self-start sm:self-auto"
                  >
                    <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>
                      {isAttaching ? 'Tutup Form Bukti' : 'Tambah Bukti Dukung'}
                    </span>
                  </button>
                </div>

                {isAttaching && (
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex flex-col sm:flex-row gap-2.5">
                    <input
                      type="text"
                      value={evidenceName}
                      onChange={(e) => setEvidenceName(e.target.value)}
                      placeholder="Nama berkas bukti dukung (mis. BA_Evaluasi_Tahap_2.pdf)"
                      className="flex-1 min-h-[40px] px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#0B2545]"
                    />
                    <select
                      aria-label="Jenis bukti dukung"
                      value={evidenceType}
                      onChange={(e) =>
                        setEvidenceType(
                          e.target.value as EvidenceFile['jenisBukti']
                        )
                      }
                      className="min-h-[40px] px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#0B2545]"
                    >
                      <option value="Laporan Realisasi">Laporan Realisasi</option>
                      <option value="Berita Acara">Berita Acara</option>
                      <option value="Notula Rapat">Notula Rapat</option>
                      <option value="Surat Resmi">Surat Resmi</option>
                      <option value="Dokumentasi">Dokumentasi</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => handleQuickAttach(doc.id, item.id)}
                      className="min-h-[40px] px-4 py-1.5 rounded-lg bg-[#0B2545] text-white text-xs font-semibold hover:bg-[#13315C] whitespace-nowrap"
                    >
                      Simpan Bukti
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
