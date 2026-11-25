import { CooperationDocument } from '../types/simoka';
import { addDaysIso, getTodayIso } from '../utils/dateAndReminders';

export const UNIT_KERJA_LIST = [
  'Ditjen Infrastruktur Digital',
  'Ditjen Ekosistem Digital',
  'Ditjen Pengawasan Ruang Digital',
  'BPSDM Komdigi',
  'Sekretariat Jenderal',
] as const;

export function createInitialDocuments(): CooperationDocument[] {
  const today = getTodayIso();

  return [
    {
      id: 'doc-01',
      nomorDokumen: '042/KOMDIGI/MOU/KS/2024',
      judul: 'Penguatan Kapasitas Talenta Digital dan Pelatihan Keamanan Siber',
      mitra: 'Konsorsium Perguruan Tinggi Informatika Nusantara',
      kategoriMitra: 'Akademisi',
      jenis: 'MoU',
      unit: 'BPSDM Komdigi',
      tanggalTtd: addDaysIso(today, -712),
      tanggalMulai: addDaysIso(today, -712),
      tanggalBerakhir: addDaysIso(today, 18),
      ruangLingkup:
        'Penyelenggaraan kurikulum bersama\nSertifikasi kompetensi keamanan siber bagi aparatur dan masyarakat\nPertukaran narasumber teknis',
      picPeran: 'Koordinator Program Talenta Digital',
      berkasNaskah: {
        namaFile: 'MoU_042_Talenta_Digital_2024.pdf',
        ukuran: '2,4 MB',
      },
      tindakLanjut: [
        {
          id: 'tl-01-1',
          judulKegiatan: 'Penyusunan Silabus Pelatihan Keamanan Siber Tingkat Menengah',
          deskripsi:
            'Penyelarasan modul pelatihan berbasis standar kompetensi nasional bersama tim kurikulum mitra.',
          picPeran: 'Tim Pengembangan Kurikulum BPSDM',
          tenggat: addDaysIso(today, -45),
          status: 'Selesai',
          diperbaruiPada: addDaysIso(today, -48),
          buktiDukung: [
            {
              id: 'ev-01-1',
              namaBerkas: 'Berita_Acara_Validasi_Silabus_Siber.pdf',
              jenisBukti: 'Berita Acara',
              ukuran: '1,1 MB',
              tanggalUnggah: addDaysIso(today, -48),
            },
          ],
        },
        {
          id: 'tl-01-2',
          judulKegiatan: 'Evaluasi Akhir & Penyusunan Draf Adendum Perpanjangan MoU',
          deskripsi:
            'Rekapitulasi capaian peserta pelatihan angkatan I–III serta penyiapan naskah perpanjangan masa berlaku.',
          picPeran: 'Koordinator Kerja Sama Kelembagaan',
          tenggat: addDaysIso(today, 5),
          status: 'Dalam Proses',
          diperbaruiPada: addDaysIso(today, -2),
          buktiDukung: [
            {
              id: 'ev-01-2',
              namaBerkas: 'Notula_Rapat_Evaluasi_Pra_Perpanjangan.pdf',
              jenisBukti: 'Notula Rapat',
              ukuran: '680 KB',
              tanggalUnggah: addDaysIso(today, -2),
            },
          ],
        },
      ],
    },
    {
      id: 'doc-02',
      nomorDokumen: '118/KOMDIGI/PKS/INF/2025',
      judul: 'Perjanjian Kerja Sama Perluasan Konektivitas Layanan Publik Wilayah 3T',
      mitra: 'PT Jaringan Telekomunikasi Nusantara Terbuka',
      kategoriMitra: 'Industri / Swasta',
      jenis: 'PKS',
      unit: 'Ditjen Infrastruktur Digital',
      tanggalTtd: addDaysIso(today, -220),
      tanggalMulai: addDaysIso(today, -220),
      tanggalBerakhir: addDaysIso(today, 145),
      ruangLingkup:
        'Pembangunan titik akses internet pita lebar di fasilitas pendidikan daerah tertinggal\nPemeliharaan infrastruktur jaringan pada puskesmas wilayah 3T',
      picPeran: 'Ketua Tim Layanan Infrastruktur Wilayah',
      berkasNaskah: {
        namaFile: 'PKS_118_Konektivitas_3T_2025.pdf',
        ukuran: '4,8 MB',
      },
      tindakLanjut: [
        {
          id: 'tl-02-1',
          judulKegiatan: 'Uji Terima Teknis Gelombang Pertama (42 Titik Lokasi)',
          deskripsi:
            'Verifikasi keandalan tautan dan pencapaian SLA minimal 98,5% pada perangkat transmisi mitra.',
          picPeran: 'Tim Teknis Pengawasan Jaringan',
          tenggat: addDaysIso(today, -30),
          status: 'Selesai',
          diperbaruiPada: addDaysIso(today, -32),
          buktiDukung: [
            {
              id: 'ev-02-1',
              namaBerkas: 'BAST_Uji_Terima_Gelombang_1.pdf',
              jenisBukti: 'Berita Acara',
              ukuran: '3,2 MB',
              tanggalUnggah: addDaysIso(today, -32),
            },
          ],
        },
        {
          id: 'tl-02-2',
          judulKegiatan: 'Rekonsiliasi Laporan Kinerja Triwulan IV',
          deskripsi:
            'Pencocokan log ketersediaan jaringan dan penyelesaian kendala catu daya di 6 titik terpencil.',
          picPeran: 'Analis Monitoring Infrastruktur',
          tenggat: addDaysIso(today, 14),
          status: 'Dalam Proses',
          diperbaruiPada: addDaysIso(today, -4),
          buktiDukung: [],
        },
      ],
    },
    {
      id: 'doc-03',
      nomorDokumen: '075/KOMDIGI/MOU/PRD/2025',
      judul: 'Kolaborasi Literasi dan Pengawasan Konten Ruang Digital Sehat',
      mitra: 'Asosiasi Pengelola Platform & Komunitas Literasi Digital',
      kategoriMitra: 'Asosiasi / Komunitas',
      jenis: 'MoU',
      unit: 'Ditjen Pengawasan Ruang Digital',
      tanggalTtd: addDaysIso(today, -323),
      tanggalMulai: addDaysIso(today, -323),
      tanggalBerakhir: addDaysIso(today, 42),
      ruangLingkup:
        'Pertukaran mekanisme pelaporan konten negatif secara cepat\nKampanye edukasi literasi digital lintas daerah',
      picPeran: 'Ketua Tim Tata Kelola Ruang Digital',
      berkasNaskah: {
        namaFile: 'MoU_075_Ruang_Digital_Sehat.pdf',
        ukuran: '1,9 MB',
      },
      tindakLanjut: [
        {
          id: 'tl-03-1',
          judulKegiatan: 'Penetapan SOP Jalur Eskalasi Aduan Konten Prioritas',
          deskripsi:
            'Penyusunan matriks waktu tanggap penanganan laporan antara unit pengawasan dan tim moderasi mitra.',
          picPeran: 'Analis Kebijakan Moderasi Konten',
          tenggat: addDaysIso(today, -6),
          status: 'Perlu Eskalasi',
          diperbaruiPada: addDaysIso(today, -3),
          buktiDukung: [],
        },
        {
          id: 'tl-03-2',
          judulKegiatan: 'Pelaporan Realisasi Kampanye Edukasi Regional',
          deskripsi:
            'Pengumpulan dokumentasi dan rekapitulasi jangkauan kegiatan sosialisasi untuk lampiran evaluasi MoU.',
          picPeran: 'Tim Edukasi & Kemitraan Publik',
          tenggat: addDaysIso(today, 19),
          status: 'Belum Dimulai',
          diperbaruiPada: addDaysIso(today, -15),
          buktiDukung: [],
        },
      ],
    },
    {
      id: 'doc-04',
      nomorDokumen: '204/KOMDIGI/PKS/EKO/2024',
      judul: 'Penerapan Sistem Layanan Digital Terpadu UMKM Daerah',
      mitra: 'Pemerintah Provinsi Kepulauan Nusantara',
      kategoriMitra: 'Pemerintah Daerah',
      jenis: 'PKS',
      unit: 'Ditjen Ekosistem Digital',
      tanggalTtd: addDaysIso(today, -377),
      tanggalMulai: addDaysIso(today, -377),
      tanggalBerakhir: addDaysIso(today, -12),
      ruangLingkup:
        'Pendampingan adopsi niaga elektronik\nIntegrasi katalog produk unggulan daerah\nPelatihan pemasaran digital',
      picPeran: 'Koordinator Ekosistem Niaga Daerah',
      berkasNaskah: {
        namaFile: 'PKS_204_UMKM_Digital_Daerah.pdf',
        ukuran: '2,7 MB',
      },
      tindakLanjut: [
        {
          id: 'tl-04-1',
          judulKegiatan: 'Pelaksanaan Lokakarya Onboarding 300 Pelaku Usaha',
          deskripsi:
            'Pendampingan langsung pencatatan usaha dan pemanfaatan kanal pemasaran daring.',
          picPeran: 'Tim Pendamping Ekosistem Wilayah',
          tenggat: addDaysIso(today, -60),
          status: 'Selesai',
          diperbaruiPada: addDaysIso(today, -55),
          buktiDukung: [
            {
              id: 'ev-04-1',
              namaBerkas: 'Laporan_Realisasi_Onboarding_UMKM.pdf',
              jenisBukti: 'Laporan Realisasi',
              ukuran: '2,1 MB',
              tanggalUnggah: addDaysIso(today, -55),
            },
          ],
        },
        {
          id: 'tl-04-2',
          judulKegiatan: 'Penyusunan Berita Acara Penutupan / Evaluasi Akhir PKS',
          deskripsi:
            'Finalisasi dokumen serah terima hasil pendampingan karena masa berlaku PKS telah berakhir.',
          picPeran: 'Koordinator Ekosistem Niaga Daerah',
          tenggat: addDaysIso(today, -3),
          status: 'Dalam Proses',
          diperbaruiPada: addDaysIso(today, -1),
          buktiDukung: [],
        },
      ],
    },
    {
      id: 'doc-05',
      nomorDokumen: '019/KOMDIGI/PKS/SJ/2026',
      judul: 'Integrasi Tata Kelola Arsip Elektronik dan Standar Keamanan Informasi',
      mitra: 'Pusat Riset Sistem Informasi Terpadu Nasional',
      kategoriMitra: 'Lembaga Riset',
      jenis: 'PKS',
      unit: 'Sekretariat Jenderal',
      tanggalTtd: addDaysIso(today, -85),
      tanggalMulai: addDaysIso(today, -85),
      tanggalBerakhir: addDaysIso(today, 280),
      ruangLingkup:
        'Kajian standar interoperabilitas metadata kearsipan lintas unit kerja\nAudit kepatuhan pengamanan dokumen elektronik',
      picPeran: 'Ketua Tim Tata Kelola & Hukum Kelembagaan',
      berkasNaskah: {
        namaFile: 'PKS_019_Arsip_Elektronik_2026.pdf',
        ukuran: '3,1 MB',
      },
      tindakLanjut: [
        {
          id: 'tl-05-1',
          judulKegiatan: 'Pemetaan Struktur Metadata Kerja Sama Lintas Unit',
          deskripsi:
            'Penyeragaman format penomoran, klasifikasi unit pengelola, dan jadwal retensi dokumen MoU/PKS.',
          picPeran: 'Analis Tata Kelola Kearsipan',
          tenggat: addDaysIso(today, -20),
          status: 'Selesai',
          diperbaruiPada: addDaysIso(today, -22),
          buktiDukung: [
            {
              id: 'ev-05-1',
              namaBerkas: 'Dokumen_Standar_Metadata_SIMOKA.pdf',
              jenisBukti: 'Laporan Realisasi',
              ukuran: '1,4 MB',
              tanggalUnggah: addDaysIso(today, -22),
            },
            {
              id: 'ev-05-2',
              namaBerkas: 'Surat_Persetujuan_Implementasi_Unit.pdf',
              jenisBukti: 'Surat Resmi',
              ukuran: '520 KB',
              tanggalUnggah: addDaysIso(today, -21),
            },
          ],
        },
        {
          id: 'tl-05-2',
          judulKegiatan: 'Uji Coba Migrasi Data Arsip Kerja Sama Unit Kerja',
          deskripsi:
            'Verifikasi kelengkapan berkas digital dari seluruh unit teknis ke repositori terpusat.',
          picPeran: 'Tim Implementasi Sistem Informasi',
          tenggat: addDaysIso(today, 38),
          status: 'Dalam Proses',
          diperbaruiPada: addDaysIso(today, -5),
          buktiDukung: [
            {
              id: 'ev-05-3',
              namaBerkas: 'Rekap_Uji_Coba_Migrasi_Tahap_1.pdf',
              jenisBukti: 'Dokumentasi',
              ukuran: '940 KB',
              tanggalUnggah: addDaysIso(today, -5),
            },
          ],
        },
      ],
    },
  ];
}
