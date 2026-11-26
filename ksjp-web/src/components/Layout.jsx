import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getRoleLabel } from '../utils/date';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { id: 'jadwal', label: 'Jadwal Pelajaran', icon: 'schedule' },
  { id: 'kalender', label: 'Kalender Akademik', icon: 'calendar_month' },
  { id: 'notifikasi', label: 'Notifikasi', icon: 'notifications' },
  { id: 'profil', label: 'Profil & Sesi', icon: 'person' },
];

export default function Layout({
  activeTab,
  onSelectTab,
  unreadCount = 0,
  momentumCount = 0,
  pergantianAktif = false,
  searchQuery = '',
  onSearchSubmit,
  toast,
  onDismissToast,
  children,
}) {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery);

  const initials = (user?.nama_lengkap || 'KS')
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  const isStaff = user?.role === 'guru' || user?.role === 'admin_organisasi';

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearchSubmit) {
      onSearchSubmit(localSearch);
    }
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface flex">
      {/* Desktop Fixed Sidebar (w-72) */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-72 bg-white shadow-sm border-r border-surface-high/60 flex-col z-30">
        {/* Brand Header */}
        <div className="h-20 px-6 flex items-center gap-3 border-b border-surface-high/50">
          <div className="w-10 h-10 rounded-xl bg-primary-container text-white flex items-center justify-center shadow-sm">
            <span className="material-symbols-outlined text-[22px]">school</span>
          </div>
          <div>
            <div className="text-sm font-extrabold tracking-tight text-on-surface">
              KSJP STEMATEL
            </div>
            <div className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">
              Portal Siswa & Jadwal
            </div>
          </div>
        </div>

        {/* Active Year Chip */}
        <div className="px-5 pt-5 pb-2">
          <div className="rounded-2xl bg-surface-low px-4 py-3 border border-surface-high/50">
            <div className="text-[10px] font-bold uppercase tracking-wider text-secondary">
              Tahun Pelajaran Aktif
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-sm font-bold text-on-surface">2026 / 2027</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-3 space-y-1.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition cursor-pointer ${
                  isActive
                    ? 'bg-primary-container text-white shadow-md shadow-primary-container/20'
                    : 'text-on-surface-variant hover:bg-surface-low hover:text-on-surface'
                }`}
              >
                <span className="flex items-center gap-3">
                  <span
                    className={`material-symbols-outlined text-[20px] ${
                      isActive ? 'material-symbols-fill' : ''
                    }`}
                  >
                    {item.icon}
                  </span>
                  {item.label}
                </span>

                {item.id === 'notifikasi' && unreadCount > 0 && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                      isActive
                        ? 'bg-white text-primary-container'
                        : 'bg-primary-container text-white'
                    }`}
                  >
                    {unreadCount}
                  </span>
                )}

                {item.id === 'jadwal' && momentumCount > 0 && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {momentumCount} Momentum
                  </span>
                )}
              </button>
            );
          })}

          {isStaff && (
            <a
              href={
                import.meta.env.VITE_ADMIN_URL ||
                (import.meta.env.DEV
                  ? 'http://127.0.0.1:8000/admin'
                  : 'https://ksjp-stematel-api.vercel.app/admin')
              }
              target="_blank"
              rel="noreferrer"
              className="mt-4 w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 transition"
            >
              <span className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[20px]">admin_panel_settings</span>
                Filament Admin
              </span>
              <span className="material-symbols-outlined text-[18px]">open_in_new</span>
            </a>
          )}
        </nav>

        {/* Bottom Helpdesk & Android APK Download Card */}
        <div className="p-4 border-t border-surface-high/60 space-y-2.5">
          <a
            href="/downloads/ksjp-stematel.apk"
            download="KSJP-SMK-Telkom-Purwokerto.apk"
            className="w-full rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 px-3.5 py-2.5 text-xs font-bold transition flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">android</span>
              Download Aplikasi HP (.apk)
            </span>
            <span className="material-symbols-outlined text-[16px]">download</span>
          </a>

          <div className="rounded-2xl bg-surface-low p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-on-surface">
              <span className="material-symbols-outlined text-primary text-[18px]">
                support_agent
              </span>
              Tim IT SMK Telkom Purwokerto
            </div>
            <p className="text-[11px] text-secondary leading-relaxed">
              Sesi login tersimpan otomatis. Hubungi wali kelas atau admin jika ada kendala NIS.
            </p>
            <button
              type="button"
              onClick={logout}
              className="w-full mt-1 rounded-xl bg-white hover:bg-red-50 text-[#ba1a1a] border border-surface-high px-3 py-2 text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">logout</span>
              Keluar Sesi Akun
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-72 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col z-10 p-4">
            <div className="flex items-center justify-between pb-4 border-b border-surface-high">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary-container text-white flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">school</span>
                </div>
                <div className="text-sm font-bold">KSJP STEMATEL</div>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg hover:bg-surface-low"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="flex-1 py-4 space-y-1.5">
              {NAV_ITEMS.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onSelectTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold ${
                      isActive ? 'bg-primary-container text-white' : 'text-on-surface-variant'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                      {item.label}
                    </span>
                    {item.id === 'notifikasi' && unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[11px] bg-white/20 font-bold">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={logout}
              className="rounded-xl bg-red-50 text-[#ba1a1a] py-2.5 text-sm font-semibold"
            >
              Keluar Akun
            </button>
          </div>
        </div>
      )}

      {/* Main Content Wrapper */}
      <div className="flex-1 lg:pl-72 flex flex-col min-w-0">
        {/* Frosted Topbar (h-20) */}
        <header className="h-20 sticky top-0 z-20 bg-surface/90 backdrop-blur-xl border-b border-surface-high/60 px-4 sm:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-white border border-surface-high text-on-surface"
              aria-label="Buka menu"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>

            <form onSubmit={handleSearch} className="hidden sm:flex flex-1 max-w-md relative">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary text-[20px]">
                search
              </span>
              <input
                type="search"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Cari agenda kalender, PSTS, UKK, libur..."
                className="w-full rounded-full bg-white border border-surface-high pl-10 pr-4 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container"
              />
            </form>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden md:inline-flex items-center px-3 py-1.5 rounded-full bg-surface-container text-xs font-semibold text-on-surface-variant">
              T.A. 2026/2027
            </span>

            <button
              type="button"
              onClick={() => onSelectTab('notifikasi')}
              className="relative p-2.5 rounded-full bg-white border border-surface-high hover:bg-surface-low transition cursor-pointer"
              aria-label="Notifikasi"
            >
              <span className="material-symbols-outlined text-[20px] text-on-surface">
                notifications
              </span>
              {(unreadCount > 0 || pergantianAktif) && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-primary-container ring-2 ring-white animate-pulse" />
              )}
            </button>

            <button
              type="button"
              onClick={() => onSelectTab('profil')}
              className="flex items-center gap-2.5 pl-1.5 pr-3 py-1 rounded-full bg-white border border-surface-high hover:bg-surface-low transition cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-primary-container text-white text-xs font-bold flex items-center justify-center">
                {initials}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-on-surface leading-tight max-w-[150px] truncate">
                  {user?.nama_lengkap}
                </div>
                <div className="text-[11px] text-secondary leading-tight">
                  {user?.kelas?.nama_kelas || getRoleLabel(user?.role)}
                  {user?.nis ? ` • ${user.nis}` : ''}
                </div>
              </div>
            </button>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 p-4 sm:p-8 pb-24 lg:pb-10 max-w-[1440px] w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-3 inset-x-3 z-30 bg-white/95 backdrop-blur-md border border-surface-high rounded-2xl shadow-lg px-2 py-1.5 flex items-center justify-around">
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-[10px] font-semibold transition ${
                isActive ? 'bg-primary-fixed/70 text-primary-container' : 'text-secondary'
              }`}
            >
              <span
                className={`material-symbols-outlined text-[20px] ${
                  isActive ? 'material-symbols-fill' : ''
                }`}
              >
                {item.icon}
              </span>
              <span>{item.label.split(' ')[0]}</span>
              {item.id === 'notifikasi' && unreadCount > 0 && (
                <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-primary-container" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Real-time Notification / Sync Toast */}
      {toast && (
        <div className="fixed bottom-20 lg:bottom-6 right-4 sm:right-6 z-40 max-w-sm w-full bg-white rounded-2xl shadow-2xl border border-surface-high p-4 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[20px]">notifications_active</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-on-surface">{toast.title}</div>
            <div className="text-xs text-secondary mt-0.5 leading-relaxed">{toast.message}</div>
          </div>
          <button
            type="button"
            onClick={onDismissToast}
            className="text-secondary hover:text-on-surface p-1"
            aria-label="Tutup"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}
    </div>
  );
}
