import { useMemo, useState } from 'react';
import {
  ChevronRight,
  FilePlus2,
  Paperclip,
  RotateCcw,
  Search,
} from 'lucide-react';
import {
  CooperationDocument,
  DocumentKind,
  ExpiryState,
} from '../types/simoka';
import {
  diffDaysFromToday,
  formatSisaHari,
  formatTanggalId,
  getExpiryState,
  getFollowUpProgress,
} from '../utils/dateAndReminders';
import { ExpiryStatusLabel } from './StatusText';

interface DocumentRepositoryProps {
  documents: CooperationDocument[];
  unitOptions: string[];
  onOpenDocument: (docId: string) => void;
  onAddDocument: () => void;
}

export function DocumentRepository({
  documents,
  unitOptions,
  onOpenDocument,
  onAddDocument,
}: DocumentRepositoryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKind, setSelectedKind] = useState<'Semua' | DocumentKind>(
    'Semua'
  );
  const [selectedExpiry, setSelectedExpiry] = useState<'Semua' | ExpiryState>(
    'Semua'
  );
  const [selectedUnit, setSelectedUnit] = useState<string>('Semua');

  const hasActiveFilter =
    searchQuery.trim() !== '' ||
    selectedKind !== 'Semua' ||
    selectedExpiry !== 'Semua' ||
    selectedUnit !== 'Semua';

  const filteredDocs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return documents.filter((doc) => {
      if (selectedKind !== 'Semua' && doc.jenis !== selectedKind) return false;
      if (selectedUnit !== 'Semua' && doc.unit !== selectedUnit) return false;
      const expState = getExpiryState(doc.tanggalBerakhir);
      if (selectedExpiry !== 'Semua' && expState !== selectedExpiry) {
        return false;
      }
      if (q) {
        const haystack = [
          doc.nomorDokumen,
          doc.judul,
          doc.mitra,
          doc.unit,
          doc.picPeran,
          doc.kategoriMitra,
        ]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [documents, searchQuery, selectedKind, selectedExpiry, selectedUnit]);

  function resetFilters() {
    setSearchQuery('');
    setSelectedKind('Semua');
    setSelectedExpiry('Semua');
    setSelectedUnit('Semua');
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Repositori Dokumen Kerja Sama
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Seluruh dokumen MoU dan PKS lintas unit tersimpan terpusat lengkap
            dengan masa berlaku dan riwayat tindak lanjut.
          </p>
        </div>
        <div className="text-xs font-mono tabular-nums text-slate-600 shrink-0">
          Menampilkan {filteredDocs.length} dari {documents.length} dokumen
        </div>
      </div>

      {/* Search & Filters Toolbar */}
      <section
        aria-label="Pencarian dan Filter Dokumen"
        className="bg-white border border-slate-200 rounded-xl p-4 space-y-4"
      >
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search
              className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nomor dokumen, judul, mitra, unit, atau PIC peran..."
              aria-label="Cari dokumen kerja sama"
              className="w-full min-h-[44px] pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#0B2545]"
            />
          </div>

          {/* Unit Dropdown */}
          <div className="md:w-64 shrink-0">
            <select
              aria-label="Filter Unit Pengelola"
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              className="w-full min-h-[44px] px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:border-[#0B2545]"
            >
              <option value="Semua">Semua Unit Pengelola</option>
              {unitOptions.map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Segmented Filter Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-3">
            {/* Kind Filter */}
            <div
              role="group"
              aria-label="Filter Jenis Dokumen"
              className="inline-flex items-center p-1 bg-slate-100 rounded-lg"
            >
              {(['Semua', 'MoU', 'PKS'] as const).map((kind) => (
                <button
                  key={kind}
                  type="button"
                  onClick={() => setSelectedKind(kind)}
                  className={`min-h-[36px] px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    selectedKind === kind
                      ? 'bg-[#0B2545] text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {kind === 'Semua' ? 'Semua Jenis' : kind}
                </button>
              ))}
            </div>

            {/* Expiry State Filter */}
            <div
              role="group"
              aria-label="Filter Status Masa Berlaku"
              className="inline-flex flex-wrap items-center p-1 bg-slate-100 rounded-lg"
            >
              {(
                ['Semua', 'Aktif', 'Segera Berakhir', 'Kedaluwarsa'] as const
              ).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setSelectedExpiry(st)}
                  className={`min-h-[36px] px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    selectedExpiry === st
                      ? 'bg-white text-[#0B2545] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {st === 'Semua' ? 'Semua Status' : st}
                </button>
              ))}
            </div>
          </div>

          {hasActiveFilter && (
            <button
              type="button"
              onClick={resetFilters}
              className="min-h-[36px] inline-flex items-center gap-1.5 text-xs font-semibold text-[#0B2545] hover:underline whitespace-nowrap shrink-0 self-start sm:self-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Atur Ulang Filter</span>
            </button>
          )}
        </div>
      </section>

      {/* Empty State */}
      {filteredDocs.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-10 text-center">
          <p className="text-base font-semibold text-slate-900">
            Tidak ada dokumen yang sesuai filter
          </p>
          <p className="mt-1 text-sm text-slate-600">
            Coba ubah kata kunci pencarian atau atur ulang filter unit dan
            status masa berlaku.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            {hasActiveFilter && (
              <button
                type="button"
                onClick={resetFilters}
                className="min-h-[44px] px-4 py-2 rounded-lg border border-slate-300 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Atur Ulang Filter
              </button>
            )}
            <button
              type="button"
              onClick={onAddDocument}
              className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0B2545] text-white text-sm font-medium hover:bg-[#13315C]"
            >
              <FilePlus2 className="w-4 h-4" aria-hidden="true" />
              <span>Tambah Dokumen Baru</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden lg:block bg-white border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                  <th className="py-3.5 px-5">Dokumen & Mitra</th>
                  <th className="py-3.5 px-4">Jenis & Unit Pengelola</th>
                  <th className="py-3.5 px-4">Masa Berlaku</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Realisasi & Bukti</th>
                  <th className="py-3.5 px-5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {filteredDocs.map((doc) => {
                  const state = getExpiryState(doc.tanggalBerakhir);
                  const sisaHari = diffDaysFromToday(doc.tanggalBerakhir);
                  const progress = getFollowUpProgress(doc);
                  const evidenceCount = doc.tindakLanjut.reduce(
                    (acc, item) => acc + item.buktiDukung.length,
                    0
                  );

                  return (
                    <tr
                      key={doc.id}
                      onClick={() => onOpenDocument(doc.id)}
                      className="hover:bg-slate-50/90 cursor-pointer transition-colors"
                    >
                      <td className="py-4 px-5 max-w-md">
                        <div className="font-mono text-xs text-slate-500 tabular-nums">
                          {doc.nomorDokumen}
                        </div>
                        <div className="mt-0.5 font-semibold text-slate-900 leading-snug">
                          {doc.judul}
                        </div>
                        <div className="mt-1 text-xs text-slate-600">
                          {doc.mitra} · {doc.kategoriMitra}
                        </div>
                      </td>

                      <td className="py-4 px-4 align-top">
                        <div className="font-semibold text-[#0B2545]">
                          {doc.jenis}
                        </div>
                        <div className="mt-0.5 text-xs text-slate-600">
                          {doc.unit}
                        </div>
                      </td>

                      <td className="py-4 px-4 align-top whitespace-nowrap">
                        <div className="text-xs text-slate-700 tabular-nums">
                          {formatTanggalId(doc.tanggalMulai)} –{' '}
                          {formatTanggalId(doc.tanggalBerakhir)}
                        </div>
                        <div className="mt-1 text-xs font-mono tabular-nums text-slate-500">
                          {formatSisaHari(sisaHari)}
                        </div>
                      </td>

                      <td className="py-4 px-4 align-top">
                        <ExpiryStatusLabel state={state} />
                      </td>

                      <td className="py-4 px-4 align-top whitespace-nowrap">
                        <div className="text-xs font-semibold text-slate-800 tabular-nums">
                          {progress.selesai}/{progress.total} tindak lanjut (
                          {progress.persentase}%)
                        </div>
                        <div className="mt-1 inline-flex items-center gap-1 text-xs text-slate-500 tabular-nums">
                          <Paperclip
                            className="w-3 h-3 shrink-0"
                            aria-hidden="true"
                          />
                          <span>{evidenceCount} bukti dukung</span>
                        </div>
                      </td>

                      <td className="py-4 px-5 align-top text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenDocument(doc.id);
                          }}
                          className="min-h-[36px] inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-[#0B2545] hover:bg-slate-100 whitespace-nowrap"
                        >
                          <span>Kelola</span>
                          <ChevronRight
                            className="w-3.5 h-3.5"
                            aria-hidden="true"
                          />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Touch-Friendly List */}
          <div className="lg:hidden bg-white border border-slate-200 rounded-xl divide-y divide-slate-200 overflow-hidden">
            {filteredDocs.map((doc) => {
              const state = getExpiryState(doc.tanggalBerakhir);
              const sisaHari = diffDaysFromToday(doc.tanggalBerakhir);
              const progress = getFollowUpProgress(doc);
              const evidenceCount = doc.tindakLanjut.reduce(
                (acc, item) => acc + item.buktiDukung.length,
                0
              );

              return (
                <button
                  key={doc.id}
                  type="button"
                  onClick={() => onOpenDocument(doc.id)}
                  className="w-full text-left p-4 hover:bg-slate-50 active:bg-slate-100 transition-colors focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#0B2545]"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-[#0B2545]">
                      {doc.jenis} · {doc.unit}
                    </span>
                    <ExpiryStatusLabel state={state} compact />
                  </div>

                  <div className="mt-1.5 text-sm font-semibold text-slate-900 leading-snug">
                    {doc.judul}
                  </div>

                  <div className="mt-1 text-xs text-slate-600">
                    {doc.mitra}
                  </div>

                  <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 tabular-nums">
                    <span>
                      Berlaku s.d. {formatTanggalId(doc.tanggalBerakhir)} (
                      {formatSisaHari(sisaHari)})
                    </span>
                    <span className="font-medium text-slate-700">
                      {progress.selesai}/{progress.total} selesai ·{' '}
                      {evidenceCount} bukti
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
