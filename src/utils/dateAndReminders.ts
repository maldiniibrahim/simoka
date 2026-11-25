import { CooperationDocument, ExpiryState, ReminderAlert } from '../types/simoka';

const BULAN_ID = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'Mei',
  'Jun',
  'Jul',
  'Agu',
  'Sep',
  'Okt',
  'Nov',
  'Des',
];

export function getTodayIso(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function addDaysIso(baseIso: string, days: number): string {
  const [y, m, d] = baseIso.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days);
  const ry = dt.getFullYear();
  const rm = String(dt.getMonth() + 1).padStart(2, '0');
  const rd = String(dt.getDate()).padStart(2, '0');
  return `${ry}-${rm}-${rd}`;
}

export function diffDaysFromToday(targetIso: string): number {
  const todayIso = getTodayIso();
  const [ty, tm, td] = todayIso.split('-').map(Number);
  const [ey, em, ed] = targetIso.split('-').map(Number);
  const todayUtc = Date.UTC(ty, tm - 1, td);
  const targetUtc = Date.UTC(ey, em - 1, ed);
  return Math.round((targetUtc - todayUtc) / (1000 * 60 * 60 * 24));
}

export function formatTanggalId(isoDate: string): string {
  if (!isoDate) return '-';
  const parts = isoDate.split('-').map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return isoDate;
  const [y, m, d] = parts;
  return `${d} ${BULAN_ID[m - 1] ?? ''} ${y}`;
}

export function formatSisaHari(sisaHari: number): string {
  if (sisaHari < 0) {
    return `Lewat ${Math.abs(sisaHari)} hari`;
  }
  if (sisaHari === 0) {
    return 'Hari ini';
  }
  return `H-${sisaHari} (${sisaHari} hari lagi)`;
}

export function getExpiryState(tanggalBerakhir: string, thresholdDays = 60): ExpiryState {
  const sisa = diffDaysFromToday(tanggalBerakhir);
  if (sisa < 0) return 'Kedaluwarsa';
  if (sisa <= thresholdDays) return 'Segera Berakhir';
  return 'Aktif';
}

export function getFollowUpProgress(doc: CooperationDocument): {
  total: number;
  selesai: number;
  persentase: number;
} {
  const total = doc.tindakLanjut.length;
  if (total === 0) return { total: 0, selesai: 0, persentase: 0 };
  const selesai = doc.tindakLanjut.filter((t) => t.status === 'Selesai').length;
  return {
    total,
    selesai,
    persentase: Math.round((selesai / total) * 100),
  };
}

export function generateReminders(
  documents: CooperationDocument[],
  expiryWindowDays: number,
  acknowledgedIds: string[]
): ReminderAlert[] {
  const alerts: ReminderAlert[] = [];

  for (const doc of documents) {
    const sisaMasa = diffDaysFromToday(doc.tanggalBerakhir);
    if (sisaMasa <= expiryWindowDays) {
      const id = `exp-${doc.id}`;
      let tingkat: ReminderAlert['tingkat'] = 'Perlu Perhatian';
      if (sisaMasa < 0 || sisaMasa <= 14) {
        tingkat = 'Kritis';
      } else if (sisaMasa <= 45) {
        tingkat = 'Peringatan';
      }

      alerts.push({
        id,
        kategori: 'Masa Berlaku Dokumen',
        tingkat,
        dokumenId: doc.id,
        judulUtama:
          sisaMasa < 0
            ? `Masa berlaku dokumen telah habis (${Math.abs(sisaMasa)} hari lalu)`
            : `Masa berlaku berakhir dalam ${sisaMasa} hari`,
        subjudul: `${doc.nomorDokumen} — ${doc.judul}`,
        mitra: doc.mitra,
        unit: doc.unit,
        jenis: doc.jenis,
        tanggalTarget: doc.tanggalBerakhir,
        sisaHari: sisaMasa,
        sudahDitinjau: acknowledgedIds.includes(id),
      });
    }

    for (const item of doc.tindakLanjut) {
      if (item.status === 'Selesai') continue;
      const sisaTenggat = diffDaysFromToday(item.tenggat);
      if (sisaTenggat <= 21 || item.status === 'Perlu Eskalasi') {
        const id = `fu-${doc.id}-${item.id}`;
        let tingkat: ReminderAlert['tingkat'] = 'Perlu Perhatian';
        if (sisaTenggat < 0 || item.status === 'Perlu Eskalasi') {
          tingkat = 'Kritis';
        } else if (sisaTenggat <= 7) {
          tingkat = 'Peringatan';
        }

        alerts.push({
          id,
          kategori: 'Tenggat Tindak Lanjut',
          tingkat,
          dokumenId: doc.id,
          tindakLanjutId: item.id,
          judulUtama:
            sisaTenggat < 0
              ? `Tindak lanjut melewati tenggat ${Math.abs(sisaTenggat)} hari`
              : item.status === 'Perlu Eskalasi'
                ? `Tindak lanjut berstatus Perlu Eskalasi`
                : `Tenggat tindak lanjut dalam ${sisaTenggat} hari`,
          subjudul: `${item.judulKegiatan} · ${doc.judul}`,
          mitra: doc.mitra,
          unit: doc.unit,
          jenis: doc.jenis,
          tanggalTarget: item.tenggat,
          sisaHari: sisaTenggat,
          sudahDitinjau: acknowledgedIds.includes(id),
        });
      }
    }
  }

  return alerts.sort((a, b) => {
    if (a.sudahDitinjau !== b.sudahDitinjau) return a.sudahDitinjau ? 1 : -1;
    return a.sisaHari - b.sisaHari;
  });
}

export function parseScopePoints(raw: string): string[] {
  const trimmed = raw.trim();
  if (!trimmed) return [];

  const formatItem = (item: string) => {
    const cleaned = item
      .replace(/^[-•*]\s*/, '')
      .replace(/^\d+[.)]\s*/, '')
      .replace(/\.+$/, '')
      .trim();
    if (!cleaned) return '';
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  };

  if (trimmed.includes('\n')) {
    return trimmed.split('\n').map(formatItem).filter(Boolean);
  }

  const byDelimiters = trimmed
    .split(/;\s*|,\s*(?:dan|serta)\s+|,\s+|\s+serta\s+/i)
    .map(formatItem)
    .filter(Boolean);

  return byDelimiters.length > 0 ? byDelimiters : [formatItem(trimmed)];
}

