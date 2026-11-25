import { useState, type ChangeEvent, type FormEvent } from 'react';
import {
  CalendarClock,
  FileCheck2,
  FileText,
  Paperclip,
  Plus,
  Upload,
  X,
} from 'lucide-react';
import {
  CooperationDocument,
  EvidenceFile,
  FollowUpItem,
  FollowUpStatus,
} from '../types/simoka';
import {
  diffDaysFromToday,
  formatSisaHari,
  formatTanggalId,
  getExpiryState,
  getFollowUpProgress,
  getTodayIso,
  parseScopePoints,
} from '../utils/dateAndReminders';
import { ExpiryStatusLabel, FollowUpStatusLabel } from './StatusText';

interface DocumentDetailModalProps {
  document: CooperationDocument;
  onClose: () => void;
  onAddFollowUp: (
    docId: string,
    followUp: Omit<FollowUpItem, 'id' | 'diperbaruiPada'>
  ) => void;
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
  onExtendExpiry: (docId: string, newEndDate: string) => void;
}

export function DocumentDetailModal({
  document,
  onClose,
  onAddFollowUp,
  onUpdateFollowUpStatus,
  onAddEvidence,
  onExtendExpiry,
}: DocumentDetailModalProps) {
  const [showNewForm, setShowNewForm] = useState(false);
  const [judulKegiatan, setJudulKegiatan] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [picPeran, setPicPeran] = useState(document.picPeran);
  const [tenggat, setTenggat] = useState(getTodayIso());
  const [status, setStatus] = useState<FollowUpStatus>('Dalam Proses');
  const [initialEvidenceName, setInitialEvidenceName] = useState('');
  const [initialEvidenceType, setInitialEvidenceType] =
    useState<EvidenceFile['jenisBukti']>('Laporan Realisasi');
  const [initialEvidenceSize, setInitialEvidenceSize] = useState('1,1 MB');

  const [attachingId, setAttachingId] = useState<string | null>(null);
  const [attachName, setAttachName] = useState('');
  const [attachType, setAttachType] =
    useState<EvidenceFile['jenisBukti']>('Berita Acara');
  const [attachSize, setAttachSize] = useState('950 KB');

  const [editingExpiry, setEditingExpiry] = useState(false);
  const [newEndDate, setNewEndDate] = useState(document.tanggalBerakhir);

  const expiryState = getExpiryState(document.tanggalBerakhir);
  const sisaHari = diffDaysFromToday(document.tanggalBerakhir);
  const progress = getFollowUpProgress(document);

  function handleFilePick(
    e: ChangeEvent<HTMLInputElement>,
    target: 'new' | 'existing'
  ) {
    const file = e.target.files?.[0];
    if (!file) return;
    const sizeKb = Math.max(1, Math.round(file.size / 1024));
    const formattedSize =
      sizeKb >= 1024
        ? `${(sizeKb / 1024).toFixed(1).replace('.', ',')} MB`
        : `${sizeKb} KB`;
    if (target === 'new') {
      setInitialEvidenceName(file.name);
      setInitialEvidenceSize(formattedSize);
    } else {
      setAttachName(file.name);
      setAttachSize(formattedSize);
    }
  }

  function handleSubmitNewFollowUp(e: FormEvent) {
    e.preventDefault();
    if (!judulKegiatan.trim() || !picPeran.trim()) return;

    const buktiDukung: EvidenceFile[] = initialEvidenceName.trim()
      ? [
          {
            id: `ev-${Date.now()}`,
            namaBerkas: initialEvidenceName.trim(),
            jenisBukti: initialEvidenceType,
            ukuran: initialEvidenceSize,
            tanggalUnggah: getTodayIso(),
          },
        ]
      : [];

    onAddFollowUp(document.id, {
      judulKegiatan: judulKegiatan.trim(),
      deskripsi: deskripsi.trim() || 'Tindak lanjut pelaksanaan kerja sama.',
      picPeran: picPeran.trim(),
      tenggat,
      status,
      buktiDukung,
    });

    setJudulKegiatan('');
    setDeskripsi('');
    setInitialEvidenceName('');
    setShowNewForm(false);
  }

  function handleSubmitEvidence(followUpId: string) {
    if (!attachName.trim()) return;
    onAddEvidence(document.id, followUpId, {
      namaBerkas: attachName.trim(),
      jenisBukti: attachType,
      ukuran: attachSize,
      tanggalUnggah: getTodayIso(),
    });
    setAttachName('');
    setAttachingId(null);
  }

  function handleSaveExpiry() {
    if (!newEndDate) return;
    onExtendExpiry(document.id, newEndDate);
    setEditingExpiry(false);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="detail-modal-title"
      className="fixed inset-0 z-50 flex items-end sm:items-stretch sm:justify-end bg-slate-950/50 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-2xl max-h-[92vh] sm:max-h-full bg-white rounded-t-2xl sm:rounded-none sm:rounded-l-2xl flex flex-col overflow-hidden shadow-2xl border-t sm:border-t-0 sm:border-l border-slate-200"
      >
        {/* Mobile grab handle */}
        <div className="sm:hidden pt-2.5 pb-1 flex justify-center">
          <div className="w-10 h-1 rounded-full bg-slate-300" />
        </div>

        {/* Drawer Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-200 flex items-start justify-between gap-4 bg-[#0B2545] text-white">
          <div className="space-y-1 min-w-0">
            <div className="text-xs font-mono text-slate-300 tabular-nums">
              {document.nomorDokumen} · {document.jenis}
            </div>
            <h2
              id="detail-modal-title"
              className="text-base sm:text-lg font-bold leading-snug text-white"
            >
              {document.judul}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup detail dokumen"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-slate-300 hover:bg-white/10 hover:text-white transition-colors shrink-0"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5 space-y-6">
          {/* Metadata Grid */}
          <section aria-label="Metadata Dokumen" className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <ExpiryStatusLabel state={expiryState} />
              <span className="text-xs font-mono tabular-nums text-slate-600">
                {formatSisaHari(sisaHari)}
              </span>
            </div>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm border-y border-slate-200 py-4">
              <div>
                <dt className="text-xs text-slate-500">Mitra Kerja Sama</dt>
                <dd className="mt-0.5 font-semibold text-slate-900">
                  {document.mitra}
                </dd>
                <dd className="text-xs text-slate-500">
                  {document.kategoriMitra}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Unit Pengelola</dt>
                <dd className="mt-0.5 font-semibold text-slate-900">
                  {document.unit}
                </dd>
                <dd className="text-xs text-slate-500">
                  PIC: {document.picPeran}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">
                  Tanggal Penandatanganan
                </dt>
                <dd className="mt-0.5 font-medium text-slate-900 tabular-nums">
                  {formatTanggalId(document.tanggalTtd)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Masa Berlaku</dt>
                <dd className="mt-0.5 font-medium text-slate-900 tabular-nums">
                  {formatTanggalId(document.tanggalMulai)} –{' '}
                  {formatTanggalId(document.tanggalBerakhir)}
                </dd>
                {!editingExpiry ? (
                  <button
                    type="button"
                    onClick={() => {
                      setNewEndDate(document.tanggalBerakhir);
                      setEditingExpiry(true);
                    }}
                    className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-[#0B2545] hover:underline"
                  >
                    <CalendarClock className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Perbarui Masa Berlaku</span>
                  </button>
                ) : (
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="date"
                      value={newEndDate}
                      onChange={(e) => setNewEndDate(e.target.value)}
                      className="min-h-[36px] px-2.5 py-1 text-xs border border-slate-300 rounded-md"
                    />
                    <button
                      type="button"
                      onClick={handleSaveExpiry}
                      className="min-h-[36px] px-3 py-1 rounded-md bg-[#0B2545] text-white text-xs font-semibold"
                    >
                      Simpan
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingExpiry(false)}
                      className="min-h-[36px] px-2 py-1 text-xs text-slate-600"
                    >
                      Batal
                    </button>
                  </div>
                )}
              </div>
            </dl>

            <div>
              <h3 className="text-xs font-semibold text-slate-500">
                Ruang Lingkup Kerja Sama
              </h3>
              <ul className="mt-2 list-disc pl-5 space-y-1.5 text-sm text-slate-700 leading-relaxed marker:text-[#0B2545]">
                {parseScopePoints(document.ruangLingkup).map((point, idx) => (
                  <li key={idx}>{point}</li>
                ))}
              </ul>
            </div>

            <div className="flex items-center justify-between gap-3 py-2.5 px-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <FileText
                  className="w-4 h-4 text-[#0B2545] shrink-0"
                  aria-hidden="true"
                />
                <span className="font-medium text-slate-800 truncate">
                  {document.berkasNaskah.namaFile}
                </span>
              </div>
              <span className="text-slate-500 font-mono tabular-nums shrink-0">
                {document.berkasNaskah.ukuran}
              </span>
            </div>
          </section>

          {/* Follow-up Section */}
          <section aria-label="Catatan Tindak Lanjut" className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Tindak Lanjut & Bukti Dukung
                </h3>
                <p className="text-xs text-slate-500 tabular-nums">
                  {progress.selesai} dari {progress.total} agenda selesai (
                  {progress.persentase}%)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowNewForm((prev) => !prev)}
                className="min-h-[40px] inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#0B2545] text-white text-xs font-semibold hover:bg-[#13315C] transition-colors whitespace-nowrap shrink-0"
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
                <span>{showNewForm ? 'Tutup Form' : 'Catat Tindak Lanjut'}</span>
              </button>
            </div>

            {/* New Follow-Up Form */}
            {showNewForm && (
              <form
                onSubmit={handleSubmitNewFollowUp}
                className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3"
              >
                <div className="text-xs font-semibold text-[#0B2545]">
                  Agenda Tindak Lanjut Baru
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Judul Kegiatan / Realisasi *
                  </label>
                  <input
                    type="text"
                    required
                    value={judulKegiatan}
                    onChange={(e) => setJudulKegiatan(e.target.value)}
                    placeholder="Contoh: Rapat Koordinasi Implementasi Tahap II"
                    className="w-full min-h-[42px] px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#0B2545]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Uraian Tindak Lanjut
                  </label>
                  <textarea
                    rows={2}
                    value={deskripsi}
                    onChange={(e) => setDeskripsi(e.target.value)}
                    placeholder="Catat langkah pelaksanaan atau kendala teknis..."
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#0B2545]"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Peran PIC (tanpa nama/NIP) *
                    </label>
                    <input
                      type="text"
                      required
                      value={picPeran}
                      onChange={(e) => setPicPeran(e.target.value)}
                      className="w-full min-h-[40px] px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#0B2545]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Tenggat *
                    </label>
                    <input
                      type="date"
                      required
                      value={tenggat}
                      onChange={(e) => setTenggat(e.target.value)}
                      className="w-full min-h-[40px] px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#0B2545]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Status Awal
                    </label>
                    <select
                      value={status}
                      onChange={(e) =>
                        setStatus(e.target.value as FollowUpStatus)
                      }
                      className="w-full min-h-[40px] px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#0B2545]"
                    >
                      <option value="Belum Dimulai">Belum Dimulai</option>
                      <option value="Dalam Proses">Dalam Proses</option>
                      <option value="Perlu Eskalasi">Perlu Eskalasi</option>
                      <option value="Selesai">Selesai</option>
                    </select>
                  </div>
                </div>

                {/* Optional initial evidence */}
                <div className="pt-2 border-t border-slate-200 space-y-2">
                  <div className="text-xs font-medium text-slate-700">
                    Bukti Dukung Awal (opsional)
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={initialEvidenceName}
                      onChange={(e) => setInitialEvidenceName(e.target.value)}
                      placeholder="Nama berkas atau pilih file..."
                      className="flex-1 min-h-[40px] px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                    />
                    <select
                      value={initialEvidenceType}
                      onChange={(e) =>
                        setInitialEvidenceType(
                          e.target.value as EvidenceFile['jenisBukti']
                        )
                      }
                      className="min-h-[40px] px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                    >
                      <option value="Laporan Realisasi">
                        Laporan Realisasi
                      </option>
                      <option value="Berita Acara">Berita Acara</option>
                      <option value="Notula Rapat">Notula Rapat</option>
                      <option value="Surat Resmi">Surat Resmi</option>
                      <option value="Dokumentasi">Dokumentasi</option>
                    </select>
                    <label className="min-h-[40px] inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-700 hover:bg-slate-100 cursor-pointer whitespace-nowrap">
                      <Upload className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Pilih File</span>
                      <input
                        type="file"
                        className="sr-only"
                        onChange={(e) => handleFilePick(e, 'new')}
                      />
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowNewForm(false)}
                    className="min-h-[40px] px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="min-h-[40px] px-4 py-2 rounded-lg bg-[#0B2545] text-white text-xs font-semibold hover:bg-[#13315C]"
                  >
                    Simpan Tindak Lanjut
                  </button>
                </div>
              </form>
            )}

            {/* Follow-up Items */}
            {document.tindakLanjut.length === 0 ? (
              <div className="py-8 text-center border border-slate-200 rounded-xl text-sm text-slate-500">
                Belum ada tindak lanjut yang dicatat untuk dokumen ini.
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl divide-y divide-slate-200">
                {document.tindakLanjut.map((item) => {
                  const isAttaching = attachingId === item.id;
                  const sisaTenggat = diffDaysFromToday(item.tenggat);
                  return (
                    <div key={item.id} className="p-4 space-y-2.5">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="text-sm font-semibold text-slate-900">
                            {item.judulKegiatan}
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            {item.deskripsi}
                          </p>
                          <div className="text-xs text-slate-500 tabular-nums">
                            PIC: {item.picPeran} · Tenggat{' '}
                            {formatTanggalId(item.tenggat)} (
                            {item.status === 'Selesai'
                              ? 'Selesai'
                              : formatSisaHari(sisaTenggat)}
                            )
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <FollowUpStatusLabel status={item.status} />
                          <select
                            aria-label={`Status ${item.judulKegiatan}`}
                            value={item.status}
                            onChange={(e) =>
                              onUpdateFollowUpStatus(
                                document.id,
                                item.id,
                                e.target.value as FollowUpStatus
                              )
                            }
                            className="min-h-[38px] px-2.5 py-1 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                          >
                            <option value="Belum Dimulai">Belum Dimulai</option>
                            <option value="Dalam Proses">Dalam Proses</option>
                            <option value="Perlu Eskalasi">
                              Perlu Eskalasi
                            </option>
                            <option value="Selesai">Selesai</option>
                          </select>
                        </div>
                      </div>

                      {/* Evidence List */}
                      <div className="pt-2 border-t border-slate-100 space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-xs font-medium text-slate-500">
                            Bukti Dukung ({item.buktiDukung.length})
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setAttachingId(isAttaching ? null : item.id)
                            }
                            className="text-xs font-semibold text-[#0B2545] hover:underline inline-flex items-center gap-1 min-h-[32px]"
                          >
                            <Paperclip
                              className="w-3.5 h-3.5"
                              aria-hidden="true"
                            />
                            <span>
                              {isAttaching ? 'Tutup' : 'Unggah Bukti'}
                            </span>
                          </button>
                        </div>

                        {item.buktiDukung.length > 0 && (
                          <ul className="space-y-1">
                            {item.buktiDukung.map((ev) => (
                              <li
                                key={ev.id}
                                className="flex items-center justify-between gap-2 text-xs text-slate-700 py-1"
                              >
                                <span className="inline-flex items-center gap-1.5 min-w-0">
                                  <FileCheck2
                                    className="w-3.5 h-3.5 text-emerald-700 shrink-0"
                                    aria-hidden="true"
                                  />
                                  <span className="font-medium truncate">
                                    {ev.namaBerkas}
                                  </span>
                                </span>
                                <span className="text-slate-500 font-mono tabular-nums shrink-0">
                                  {ev.jenisBukti} · {ev.ukuran}
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}

                        {isAttaching && (
                          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                            <div className="flex flex-col sm:flex-row gap-2">
                              <input
                                type="text"
                                value={attachName}
                                onChange={(e) => setAttachName(e.target.value)}
                                placeholder="Nama berkas bukti dukung..."
                                className="flex-1 min-h-[38px] px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                              />
                              <select
                                value={attachType}
                                onChange={(e) =>
                                  setAttachType(
                                    e.target.value as EvidenceFile['jenisBukti']
                                  )
                                }
                                className="min-h-[38px] px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                              >
                                <option value="Berita Acara">
                                  Berita Acara
                                </option>
                                <option value="Laporan Realisasi">
                                  Laporan Realisasi
                                </option>
                                <option value="Notula Rapat">
                                  Notula Rapat
                                </option>
                                <option value="Surat Resmi">Surat Resmi</option>
                                <option value="Dokumentasi">Dokumentasi</option>
                              </select>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                              <label className="min-h-[38px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-700 hover:bg-slate-100 cursor-pointer">
                                <Upload
                                  className="w-3.5 h-3.5"
                                  aria-hidden="true"
                                />
                                <span>Pilih File dari Perangkat</span>
                                <input
                                  type="file"
                                  className="sr-only"
                                  onChange={(e) => handleFilePick(e, 'existing')}
                                />
                              </label>
                              <button
                                type="button"
                                onClick={() => handleSubmitEvidence(item.id)}
                                className="min-h-[38px] px-4 py-1.5 rounded-lg bg-[#0B2545] text-white text-xs font-semibold hover:bg-[#13315C]"
                              >
                                Simpan Bukti
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
