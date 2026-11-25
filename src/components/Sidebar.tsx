import {
  BellRing,
  ClipboardCheck,
  FileArchive,
  LayoutDashboard,
  RotateCcw,
} from 'lucide-react';
import { NavigationTab } from '../types/simoka';

interface SidebarProps {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  activeReminderCount: number;
  onResetDemoData: () => void;
}

const NAV_ITEMS: {
  id: NavigationTab;
  label: string;
  mobileLabel: string;
  icon: typeof LayoutDashboard;
}[] = [
  {
    id: 'dasbor',
    label: 'Dashboard Kerja Sama',
    mobileLabel: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    id: 'repositori',
    label: 'Repositori Dokumen',
    mobileLabel: 'Repositori',
    icon: FileArchive,
  },
  {
    id: 'tindak-lanjut',
    label: 'Tindak Lanjut',
    mobileLabel: 'Tindak Lanjut',
    icon: ClipboardCheck,
  },
  {
    id: 'pengingat',
    label: 'Pengingat Otomatis',
    mobileLabel: 'Pengingat',
    icon: BellRing,
  },
];

export function Sidebar({
  activeTab,
  onSelectTab,
  activeReminderCount,
  onResetDemoData,
}: SidebarProps) {
  return (
    <>
      {/* Desktop Left Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-[#0B2545] text-white border-r border-[#13315C] z-30">
        <div className="px-6 pt-6 pb-5 border-b border-white/10">
          <div className="text-xl font-bold tracking-tight text-white">
            SIMOKA
          </div>
          <p className="mt-1 text-xs text-slate-300 leading-relaxed">
            Monitoring Kerja Sama Komdigi
          </p>
        </div>

        <nav
          aria-label="Navigasi Utama"
          className="flex-1 px-3 py-5 space-y-1 overflow-y-auto"
        >
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`w-full min-h-[44px] flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
                  isActive
                    ? 'bg-white/15 text-white'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-3 whitespace-nowrap">
                  <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>{item.label}</span>
                </span>
                {item.id === 'pengingat' && activeReminderCount > 0 && (
                  <span className="text-xs font-mono tabular-nums font-semibold text-amber-300">
                    {activeReminderCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-3">
          <div className="text-xs text-slate-300 leading-relaxed">
            Mode Prototipe · 5 Dokumen Awal
          </div>
          <button
            type="button"
            onClick={onResetDemoData}
            className="w-full min-h-[40px] flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-white/15 text-xs font-medium text-slate-200 hover:bg-white/10 hover:text-white transition-colors whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>Pulihkan Data Awal</span>
          </button>
        </div>
      </aside>

      {/* Mobile Fixed Bottom Navigation Bar (56px height <= 15% mobile viewport cap) */}
      <nav
        aria-label="Navigasi Seluler"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0B2545] text-white border-t border-white/15"
      >
        <div className="grid grid-cols-4 h-14">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`relative flex flex-col items-center justify-center gap-1 min-h-[44px] px-1 transition-colors focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-white ${
                  isActive
                    ? 'text-white bg-white/10'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <div className="relative">
                  <Icon className="w-5 h-5" aria-hidden="true" />
                  {item.id === 'pengingat' && activeReminderCount > 0 && (
                    <span className="absolute -top-1.5 -right-2.5 text-[10px] font-mono tabular-nums font-bold text-amber-300">
                      {activeReminderCount}
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-medium leading-none whitespace-nowrap">
                  {item.mobileLabel}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
