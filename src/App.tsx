import { useEffect, useMemo, useState } from 'react';
import { FilePlus2, RotateCcw } from 'lucide-react';
import { AddDocumentModal } from './components/AddDocumentModal';
import { AdminDashboard } from './components/AdminDashboard';
import { DocumentDetailModal } from './components/DocumentDetailModal';
import { DocumentRepository } from './components/DocumentRepository';
import { FollowUpTrackerView } from './components/FollowUpTrackerView';
import { RemindersView } from './components/RemindersView';
import { Sidebar } from './components/Sidebar';
import { createInitialDocuments, UNIT_KERJA_LIST } from './data/mockDocuments';
import {
  CooperationDocument,
  EvidenceFile,
  FollowUpItem,
  FollowUpStatus,
  NavigationTab,
} from './types/simoka';
import { generateReminders, getTodayIso } from './utils/dateAndReminders';

const STORAGE_KEY = 'simoka_prototype_state_v1';

const TAB_TITLES: Record<NavigationTab, string> = {
  dasbor: 'Dashboard Kerja Sama',
  repositori: 'Repositori Dokumen',
  'tindak-lanjut': 'Tindak Lanjut & Bukti',
  pengingat: 'Pengingat Otomatis',
};

interface PersistedState {
  documents: CooperationDocument[];
  acknowledgedReminderIds: string[];
  expiryWindowDays: number;
}

function loadInitialState(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<PersistedState>;
      if (Array.isArray(parsed.documents) && parsed.documents.length > 0) {
        return {
          documents: parsed.documents,
          acknowledgedReminderIds: Array.isArray(parsed.acknowledgedReminderIds)
            ? parsed.acknowledgedReminderIds
            : [],
          expiryWindowDays:
            typeof parsed.expiryWindowDays === 'number'
              ? parsed.expiryWindowDays
              : 60,
        };
      }
    }
  } catch {
    // Fallback to initial seed data
  }
  return {
    documents: createInitialDocuments(),
    acknowledgedReminderIds: [],
    expiryWindowDays: 60,
  };
}

export default function App() {
  const [initialState] = useState<PersistedState>(() => loadInitialState());
  const [documents, setDocuments] = useState<CooperationDocument[]>(
    initialState.documents
  );
  const [acknowledgedIds, setAcknowledgedIds] = useState<string[]>(
    initialState.acknowledgedReminderIds
  );
  const [expiryWindowDays, setExpiryWindowDays] = useState<number>(
    initialState.expiryWindowDays
  );

  const [activeTab, setActiveTab] = useState<NavigationTab>('dasbor');
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      const payload: PersistedState = {
        documents,
        acknowledgedReminderIds: acknowledgedIds,
        expiryWindowDays,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore storage quota issues
    }
  }, [documents, acknowledgedIds, expiryWindowDays]);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = window.setTimeout(() => setToastMessage(null), 3200);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  const reminders = useMemo(
    () => generateReminders(documents, expiryWindowDays, acknowledgedIds),
    [documents, expiryWindowDays, acknowledgedIds]
  );

  const activeReminderCount = useMemo(
    () => reminders.filter((r) => !r.sudahDitinjau).length,
    [reminders]
  );

  const unitOptions = useMemo(() => {
    const set = new Set<string>(UNIT_KERJA_LIST);
    for (const d of documents) set.add(d.unit);
    return Array.from(set);
  }, [documents]);

  const selectedDocument = useMemo(
    () => documents.find((d) => d.id === selectedDocId) ?? null,
    [documents, selectedDocId]
  );

  function showToast(msg: string) {
    setToastMessage(msg);
  }

  function handleCreateDocument(newDoc: Omit<CooperationDocument, 'id'>) {
    const created: CooperationDocument = {
      ...newDoc,
      id: `doc-${Date.now()}`,
    };
    setDocuments((prev) => [created, ...prev]);
    setIsAddModalOpen(false);
    setActiveTab('repositori');
    setSelectedDocId(created.id);
    showToast('Dokumen kerja sama berhasil disimpan ke repositori.');
  }

  function handleAddFollowUp(
    docId: string,
    followUp: Omit<FollowUpItem, 'id' | 'diperbaruiPada'>
  ) {
    const today = getTodayIso();
    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id !== docId) return doc;
        return {
          ...doc,
          tindakLanjut: [
            ...doc.tindakLanjut,
            {
              ...followUp,
              id: `tl-${Date.now()}`,
              diperbaruiPada: today,
            },
          ],
        };
      })
    );
    showToast('Catatan tindak lanjut baru berhasil ditambahkan.');
  }

  function handleUpdateFollowUpStatus(
    docId: string,
    followUpId: string,
    status: FollowUpStatus
  ) {
    const today = getTodayIso();
    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id !== docId) return doc;
        return {
          ...doc,
          tindakLanjut: doc.tindakLanjut.map((item) =>
            item.id === followUpId
              ? { ...item, status, diperbaruiPada: today }
              : item
          ),
        };
      })
    );
    showToast(`Status tindak lanjut diperbarui menjadi ${status}.`);
  }

  function handleAddEvidence(
    docId: string,
    followUpId: string,
    evidence: Omit<EvidenceFile, 'id'>
  ) {
    const today = getTodayIso();
    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id !== docId) return doc;
        return {
          ...doc,
          tindakLanjut: doc.tindakLanjut.map((item) =>
            item.id === followUpId
              ? {
                  ...item,
                  diperbaruiPada: today,
                  buktiDukung: [
                    ...item.buktiDukung,
                    { ...evidence, id: `ev-${Date.now()}` },
                  ],
                }
              : item
          ),
        };
      })
    );
    showToast('Bukti dukung berhasil dilampirkan.');
  }

  function handleExtendExpiry(docId: string, newEndDate: string) {
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === docId ? { ...doc, tanggalBerakhir: newEndDate } : doc
      )
    );
    showToast('Masa berlaku dokumen berhasil diperbarui.');
  }

  function handleToggleAcknowledge(reminderId: string) {
    setAcknowledgedIds((prev) =>
      prev.includes(reminderId)
        ? prev.filter((id) => id !== reminderId)
        : [...prev, reminderId]
    );
  }

  function handleResetDemoData() {
    const fresh = createInitialDocuments();
    setDocuments(fresh);
    setAcknowledgedIds([]);
    setExpiryWindowDays(60);
    setSelectedDocId(null);
    showToast('Data awal 5 dokumen prototipe telah dipulihkan.');
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col lg:flex-row">
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        activeReminderCount={activeReminderCount}
        onResetDemoData={handleResetDemoData}
      />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Top Bar (Desktop sticky-free or clean header, Mobile non-sticky to respect 15% sticky cap) */}
        <header className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <span className="lg:hidden text-lg font-bold tracking-tight text-[#0B2545] whitespace-nowrap shrink-0">
              SIMOKA
            </span>
            <span className="lg:hidden text-slate-300" aria-hidden="true">
              /
            </span>
            <span className="text-sm font-medium text-slate-600 truncate">
              {TAB_TITLES[activeTab]}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="min-h-[42px] inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0B2545] text-white text-xs sm:text-sm font-semibold hover:bg-[#13315C] transition-colors whitespace-nowrap shrink-0"
            >
              <FilePlus2 className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Tambah Dokumen</span>
            </button>
          </div>
        </header>

        {/* Main Viewport */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-10">
          {activeTab === 'dasbor' && (
            <AdminDashboard
              documents={documents}
              reminders={reminders}
              onOpenDocument={(id) => setSelectedDocId(id)}
              onNavigate={setActiveTab}
              onAddDocument={() => setIsAddModalOpen(true)}
            />
          )}

          {activeTab === 'repositori' && (
            <DocumentRepository
              documents={documents}
              unitOptions={unitOptions}
              onOpenDocument={(id) => setSelectedDocId(id)}
              onAddDocument={() => setIsAddModalOpen(true)}
            />
          )}

          {activeTab === 'tindak-lanjut' && (
            <FollowUpTrackerView
              documents={documents}
              onOpenDocument={(id) => setSelectedDocId(id)}
              onUpdateFollowUpStatus={handleUpdateFollowUpStatus}
              onAddEvidence={handleAddEvidence}
            />
          )}

          {activeTab === 'pengingat' && (
            <RemindersView
              reminders={reminders}
              expiryWindowDays={expiryWindowDays}
              onChangeExpiryWindow={setExpiryWindowDays}
              onToggleAcknowledge={handleToggleAcknowledge}
              onOpenDocument={(id) => setSelectedDocId(id)}
            />
          )}

          {/* Mobile Footer Utility (Restore initial 5 documents) */}
          <footer className="mt-10 pt-5 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
            <span>
              SIMOKA — Repositori & Monitoring Kerja Sama Komdigi (Prototipe)
            </span>
            <button
              type="button"
              onClick={handleResetDemoData}
              className="lg:hidden inline-flex items-center gap-1.5 font-medium text-[#0B2545] hover:underline self-start min-h-[36px]"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Pulihkan 5 Dokumen Awal</span>
            </button>
          </footer>
        </main>
      </div>

      {/* Document Detail & Follow-up Drawer */}
      {selectedDocument && (
        <DocumentDetailModal
          document={selectedDocument}
          onClose={() => setSelectedDocId(null)}
          onAddFollowUp={handleAddFollowUp}
          onUpdateFollowUpStatus={handleUpdateFollowUpStatus}
          onAddEvidence={handleAddEvidence}
          onExtendExpiry={handleExtendExpiry}
        />
      )}

      {/* Add Document Modal */}
      {isAddModalOpen && (
        <AddDocumentModal
          unitOptions={unitOptions}
          onClose={() => setIsAddModalOpen(false)}
          onCreateDocument={handleCreateDocument}
        />
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-20 lg:bottom-6 right-4 sm:right-6 z-50 bg-[#0B2545] text-white px-4 py-3 rounded-xl shadow-lg text-xs sm:text-sm font-medium max-w-sm border border-white/15"
        >
          {toastMessage}
        </div>
      )}
    </div>
  );
}
