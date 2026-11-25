export type DocumentKind = 'MoU' | 'PKS';

export type FollowUpStatus =
  | 'Belum Dimulai'
  | 'Dalam Proses'
  | 'Selesai'
  | 'Perlu Eskalasi';

export type ExpiryState = 'Aktif' | 'Segera Berakhir' | 'Kedaluwarsa';

export type NavigationTab = 'dasbor' | 'repositori' | 'tindak-lanjut' | 'pengingat';

export interface EvidenceFile {
  id: string;
  namaBerkas: string;
  jenisBukti: 'Berita Acara' | 'Laporan Realisasi' | 'Notula Rapat' | 'Dokumentasi' | 'Surat Resmi';
  ukuran: string;
  tanggalUnggah: string; // YYYY-MM-DD
  tautanReferensi?: string;
}

export interface FollowUpItem {
  id: string;
  judulKegiatan: string;
  deskripsi: string;
  picPeran: string;
  tenggat: string; // YYYY-MM-DD
  status: FollowUpStatus;
  buktiDukung: EvidenceFile[];
  diperbaruiPada: string; // YYYY-MM-DD
}

export interface CooperationDocument {
  id: string;
  nomorDokumen: string;
  judul: string;
  mitra: string;
  kategoriMitra: 'Akademisi' | 'Industri / Swasta' | 'Asosiasi / Komunitas' | 'Pemerintah Daerah' | 'Lembaga Riset';
  jenis: DocumentKind;
  unit: string;
  tanggalTtd: string; // YYYY-MM-DD
  tanggalMulai: string; // YYYY-MM-DD
  tanggalBerakhir: string; // YYYY-MM-DD
  ruangLingkup: string;
  picPeran: string;
  berkasNaskah: {
    namaFile: string;
    ukuran: string;
  };
  tindakLanjut: FollowUpItem[];
}

export interface ReminderAlert {
  id: string;
  kategori: 'Masa Berlaku Dokumen' | 'Tenggat Tindak Lanjut';
  tingkat: 'Kritis' | 'Peringatan' | 'Perlu Perhatian';
  dokumenId: string;
  tindakLanjutId?: string;
  judulUtama: string;
  subjudul: string;
  mitra: string;
  unit: string;
  jenis: DocumentKind;
  tanggalTarget: string; // YYYY-MM-DD
  sisaHari: number;
  sudahDitinjau: boolean;
}
