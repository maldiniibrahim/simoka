import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Upload, X } from 'lucide-react';
import { CooperationDocument, DocumentKind } from '../types/simoka';
import { addDaysIso, getTodayIso } from '../utils/dateAndReminders';

interface AddDocumentModalProps {
  unitOptions: string[];
  onClose: () => void;
  onCreateDocument: (doc: Omit<CooperationDocument, 'id'>) => void;
}

export function AddDocumentModal({
  unitOptions,
  onClose,
  onCreateDocument,
}: AddDocumentModalProps) {
  const today = getTodayIso();
  const [nomorDokumen, setNomorDokumen] = useState('');
  const [judul, setJudul] = useState('');
  const [mitra, setMitra] = useState('');
  const [kategoriMitra, setKategoriMitra] =
    useState<CooperationDocument['kategoriMitra']>('Industri / Swasta');
  const [jenis, setJenis] = useState<DocumentKind>('PKS');
  const [unit, setUnit] = useState<string>(unitOptions[0]);
  const [tanggalMulai, setTanggalMulai] = useState(today);
  const [tanggalBerakhir, setTanggalBerakhir] = useState(
    addDaysIso(today, 365)
  );
  const [ruangLingkup, setRuangLingkup] = useState('');
  const [picPeran, setPicPeran] = useState('');
  const [namaFile, setNamaFile] = useState('');
  const [ukuranFile, setUkuranFile] = useState('1,8 MB');

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setNamaFile(file.name);
    const sizeKb = Math.max(1, Math.round(file.size / 1024));
    setUkuranFile(
      sizeKb >= 1024
        ? `${(sizeKb / 1024).toFixed(1).replace('.', ',')} MB`
        : `${sizeKb} KB`
    );
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!nomorDokumen.trim() || !judul.trim() || !mitra.trim()) return;

    onCreateDocument({
      nomorDokumen: nomorDokumen.trim(),
      judul: judul.trim(),
      mitra: mitra.trim(),
      kategoriMitra,
      jenis,
      unit,
      tanggalTtd: tanggalMulai,
      tanggalMulai,
      tanggalBerakhir,
      ruangLingkup:
        ruangLingkup.trim() ||
        'Pelaksanaan sinergi program kerja sama sesuai ruang lingkup yang disepakati.',
      picPeran: picPeran.trim() || 'Koordinator Unit Pengelola',
      berkasNaskah: {
        namaFile:
          namaFile.trim() ||
          `${jenis}_${nomorDokumen.trim().replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
        ukuran: ukuranFile,
      },
      tindakLanjut: [
        {
          id: `tl-${Date.now()}`,
          judulKegiatan: 'Rapat Koordinasi Awal (Kick-off) Pelaksanaan',
          deskripsi:
            'Penetapan jadwal kerja dan penunjukan tim pelaksana teknis unit.',
          picPeran: picPeran.trim() || 'Koordinator Unit Pengelola',
          tenggat: addDaysIso(tanggalMulai, 14),
          status: 'Belum Dimulai',
          buktiDukung: [],
          diperbaruiPada: today,
        },
      ],
    });
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-doc-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/50 backdrop-blur-[2px] p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-xl max-h-[92vh] bg-white rounded-t-2xl sm:rounded-2xl flex flex-col overflow-hidden shadow-2xl border border-slate-200"
      >
        <div className="px-5 sm:px-6 py-4 bg-[#0B2545] text-white flex items-center justify-between gap-4">
          <h2 id="add-doc-title" className="text-base sm:text-lg font-bold">
            Simpan Dokumen Kerja Sama Baru
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup form dokumen baru"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-slate-300 hover:bg-white/10 hover:text-white"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-5 sm:px-6 py-5 space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Jenis Dokumen *
              </label>
              <select
                value={jenis}
                onChange={(e) => setJenis(e.target.value as DocumentKind)}
                className="w-full min-h-[42px] px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:border-[#0B2545]"
              >
                <option value="MoU">Nota Kesepahaman (MoU)</option>
                <option value="PKS">Perjanjian Kerja Sama (PKS)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nomor Dokumen *
              </label>
              <input
                type="text"
                required
                value={nomorDokumen}
                onChange={(e) => setNomorDokumen(e.target.value)}
                placeholder="Mis. 088/KOMDIGI/PKS/2026"
                className="w-full min-h-[42px] px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:border-[#0B2545]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Judul Kerja Sama *
            </label>
            <input
              type="text"
              required
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              placeholder="Tuliskan judul naskah MoU atau PKS..."
              className="w-full min-h-[42px] px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:border-[#0B2545]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Mitra Instansi / Lembaga *
              </label>
              <input
                type="text"
                required
                value={mitra}
                onChange={(e) => setMitra(e.target.value)}
                placeholder="Mis. Universitas Teknologi Nusantara"
                className="w-full min-h-[42px] px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:border-[#0B2545]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kategori Mitra
              </label>
              <select
                value={kategoriMitra}
                onChange={(e) =>
                  setKategoriMitra(
                    e.target.value as CooperationDocument['kategoriMitra']
                  )
                }
                className="w-full min-h-[42px] px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:border-[#0B2545]"
              >
                <option value="Industri / Swasta">Industri / Swasta</option>
                <option value="Akademisi">Akademisi</option>
                <option value="Asosiasi / Komunitas">
                  Asosiasi / Komunitas
                </option>
                <option value="Pemerintah Daerah">Pemerintah Daerah</option>
                <option value="Lembaga Riset">Lembaga Riset</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Unit Pengelola *
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full min-h-[42px] px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:border-[#0B2545]"
              >
                {unitOptions.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Peran PIC (tanpa nama/NIP)
              </label>
              <input
                type="text"
                value={picPeran}
                onChange={(e) => setPicPeran(e.target.value)}
                placeholder="Mis. Koordinator Program Digital"
                className="w-full min-h-[42px] px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:border-[#0B2545]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tanggal Mulai / TTD *
              </label>
              <input
                type="date"
                required
                value={tanggalMulai}
                onChange={(e) => setTanggalMulai(e.target.value)}
                className="w-full min-h-[42px] px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:border-[#0B2545]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tanggal Berakhir *
              </label>
              <input
                type="date"
                required
                value={tanggalBerakhir}
                onChange={(e) => setTanggalBerakhir(e.target.value)}
                className="w-full min-h-[42px] px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:border-[#0B2545]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Ruang Lingkup Kerja Sama (pisahkan tiap poin dengan baris baru)
            </label>
            <textarea
              rows={3}
              value={ruangLingkup}
              onChange={(e) => setRuangLingkup(e.target.value)}
              placeholder={'Contoh:\nPendampingan adopsi niaga elektronik\nIntegrasi katalog produk unggulan daerah\nPelatihan pemasaran digital'}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:border-[#0B2545]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Naskah Dokumen (PDF)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={namaFile}
                onChange={(e) => setNamaFile(e.target.value)}
                placeholder="Pilih file naskah atau isi nama berkas..."
                className="flex-1 min-h-[42px] px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
              />
              <label className="min-h-[42px] inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer whitespace-nowrap">
                <Upload className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Unggah</span>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="sr-only"
                  onChange={handleFileChange}
                />
              </label>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              Batal
            </button>
            <button
              type="submit"
              className="min-h-[44px] px-5 py-2 rounded-lg bg-[#0B2545] text-white text-sm font-semibold hover:bg-[#13315C] transition-colors"
            >
              Simpan ke Repositori
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
