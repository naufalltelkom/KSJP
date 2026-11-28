import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePwaInstall } from '../context/PwaContext';
import { getRoleLabel } from '../utils/date';

const BASE_NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', railLabel: 'DASHBOARD', icon: 'home' },
  { id: 'jadwal', label: 'Jadwal Pelajaran', railLabel: 'JADWAL', icon: 'schedule' },
  { id: 'kalender', label: 'Kalender Akademik', railLabel: 'KALENDER', icon: 'calendar_month' },
  { id: 'notifikasi', label: 'Notifikasi', railLabel: 'NOTIFIKASI', icon: 'notifications' },
  { id: 'profil', label: 'Profil & Sesi', railLabel: 'PROFIL', icon: 'person' },
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
  const { triggerInstall, installed, isMobileDevice } = usePwaInstall();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem('ksjp_sidebar_collapsed') === '1';
    } catch {
      return false;
    }
  });
  const [brandHovered, setBrandHovered] = useState(false);
  const [liquidMorphing, setLiquidMorphing] = useState(false);
  const [dragIndex, setDragIndex] = useState(null);
  const sidebarSearchRef = useRef(null);
  const bottomNavRef = useRef(null);
  const morphTimerRef = useRef(null);

  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  const isStaff = user?.role === 'guru' || user?.role === 'admin_organisasi';
  const navItems = isStaff
    ? [
        ...BASE_NAV_ITEMS.slice(0, 4),
        { id: 'admin', label: 'Halaman Admin', railLabel: 'ADMIN', icon: 'admin_panel_settings' },
        BASE_NAV_ITEMS[4],
      ]
    : BASE_NAV_ITEMS;

  const activeNavIndex = Math.max(
    0,
    navItems.findIndex((item) => item.id === activeTab)
  );
  const displayIndex = dragIndex !== null ? dragIndex : activeNavIndex;

  useEffect(() => {
    setLiquidMorphing(true);
    if (morphTimerRef.current) clearTimeout(morphTimerRef.current);
    morphTimerRef.current = setTimeout(() => setLiquidMorphing(false), 360);
    return () => {
      if (morphTimerRef.current) clearTimeout(morphTimerRef.current);
    };
  }, [activeTab]);

  const resolveSwipeIndex = (clientX) => {
    const rect = bottomNavRef.current?.getBoundingClientRect();
    if (!rect || rect.width <= 0) return activeNavIndex;
    const ratio = Math.min(0.999, Math.max(0, (clientX - rect.left) / rect.width));
    return Math.floor(ratio * navItems.length);
  };

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('ksjp_sidebar_collapsed', next ? '1' : '0');
      } catch {
        // Abaikan error localStorage
      }
      return next;
    });
  };

  useEffect(() => {
    const onKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleCollapsed();
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCollapsed(false);
        try {
          localStorage.setItem('ksjp_sidebar_collapsed', '0');
        } catch {
          // Abaikan
        }
        setTimeout(() => {
          sidebarSearchRef.current?.focus();
        }, 120);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const initials = (user?.nama_lengkap || 'KS')
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  const adminUrl =
    import.meta.env.VITE_ADMIN_URL ||
    (import.meta.env.DEV
      ? 'http://127.0.0.1:8000/admin'
      : 'https://ksjp-stematel-api.vercel.app/admin');

  const activeNavMeta = navItems.find((n) => n.id === activeTab) || navItems[0];

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearchSubmit) {
      onSearchSubmit(localSearch);
    }
  };

  const quickStatusDots = [
    {
      id: 'kalender',
      label: 'T.A. 2026/2027',
      badge: 'Live',
      dotClass: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.85)]',
    },
    {
      id: 'jadwal',
      label: 'Jadwal Hari Ini',
      badge: momentumCount > 0 ? `${momentumCount} Mom` : 'Aktif',
      dotClass: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.85)]',
    },
    {
      id: 'notifikasi',
      label: 'Bel Real-Time',
      badge: pergantianAktif ? 'Dekat' : 'Siaga',
      dotClass: 'bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.85)]',
    },
  ];

  // Contextual icons on the attached right white utility rail (adapts per active tab)
  const railActions = (() => {
    if (activeTab === 'jadwal') {
      return [
        { icon: 'calendar_month', label: 'Kalender Akademik', onClick: () => onSelectTab('kalender') },
        { icon: 'notifications', label: 'Notifikasi', onClick: () => onSelectTab('notifikasi') },
        { icon: 'person', label: 'Profil & Akun', onClick: () => onSelectTab('profil') },
      ];
    }
    if (activeTab === 'kalender') {
      return [
        {
          icon: 'search',
          label: 'Cari Agenda (⌘K)',
          onClick: () => sidebarSearchRef.current?.focus(),
        },
        { icon: 'schedule', label: 'Jadwal Pelajaran', onClick: () => onSelectTab('jadwal') },
        { icon: 'home', label: 'Dashboard', onClick: () => onSelectTab('dashboard') },
      ];
    }
    return [
      { icon: 'schedule', label: 'Jadwal Pelajaran', onClick: () => onSelectTab('jadwal') },
      { icon: 'calendar_month', label: 'Kalender Akademik', onClick: () => onSelectTab('kalender') },
      { icon: 'tune', label: 'Ciutkan (⌘B)', onClick: toggleCollapsed },
    ];
  })();

  return (
    <div className="min-h-screen bg-surface text-on-surface flex">
      {/* Desktop Floating Glassy Sidebar V10 */}
      <aside
        className={`hidden lg:flex fixed top-3.5 left-3.5 bottom-3.5 z-30 glassy-sidebar-shell select-none ${
          collapsed
            ? 'w-[68px] rounded-full overflow-visible'
            : 'w-[272px] xl:w-[300px] rounded-[30px] overflow-hidden'
        }`}
      >
        {/* Left Translucent Glass Pane */}
        <div
          className={`flex-1 min-w-0 flex flex-col h-full ${
            collapsed ? 'items-center py-2.5 px-2 overflow-visible' : 'py-2.5 pl-0 pr-0'
          }`}
        >
          {/* Brand Header */}
          {collapsed ? (
            <div className="relative flex justify-center w-full mb-2.5">
              <button
                type="button"
                onClick={toggleCollapsed}
                onMouseEnter={() => setBrandHovered(true)}
                onMouseLeave={() => setBrandHovered(false)}
                aria-label="Perluas Sidebar (⌘B)"
                className="glassy-tip-trigger relative w-[42px] h-[42px] rounded-full glassy-circle-btn flex items-center justify-center cursor-pointer"
              >
                {brandHovered ? (
                  <span className="material-symbols-outlined text-[20px] text-white transition-transform duration-200">
                    dock_to_right
                  </span>
                ) : (
                  <img
                    src="/images/ksjp-logo.png"
                    alt="Logo KSJP"
                    className="w-8 h-8 rounded-full object-cover border border-white/40"
                  />
                )}
                <span className="glassy-tooltip flex items-center gap-2">
                  <span>Expand</span>
                  <kbd className="px-1.5 py-0.5 rounded bg-white/15 text-[10px] font-mono text-white/90">
                    ⌘B
                  </kbd>
                </span>
              </button>
            </div>
          ) : (
            <div className="px-3.5 pb-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src="/images/ksjp-logo.png"
                  alt="Logo KSJP"
                  className="w-9 h-9 rounded-xl border border-white/40 shadow-sm object-cover shrink-0"
                />
                <div className="min-w-0 glassy-stagger-item">
                  <div className="text-[13px] font-extrabold tracking-tight text-white truncate">
                    KSJP Stematel
                  </div>
                  <div className="text-[10px] font-medium text-rose-100/80 truncate">
                    Portal Siswa & Jadwal
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={toggleCollapsed}
                title="Ciutkan Sidebar (⌘B)"
                aria-label="Ciutkan Sidebar"
                className="w-7 h-7 rounded-full glassy-circle-btn flex items-center justify-center shrink-0 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">chevron_left</span>
              </button>
            </div>
          )}

          {/* Search Pill */}
          {collapsed ? (
            <div className="relative flex justify-center w-full mb-2">
              <button
                type="button"
                onClick={() => {
                  setCollapsed(false);
                  try {
                    localStorage.setItem('ksjp_sidebar_collapsed', '0');
                  } catch {
                    // Abaikan
                  }
                  setTimeout(() => sidebarSearchRef.current?.focus(), 140);
                }}
                aria-label="Cari Agenda"
                className="glassy-tip-trigger relative w-[40px] h-[40px] rounded-full glassy-circle-btn flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">search</span>
                <span className="glassy-tooltip flex items-center gap-2">
                  <span>Cari agenda</span>
                  <kbd className="px-1.5 py-0.5 rounded bg-white/15 text-[10px] font-mono text-white/90">
                    ⌘K
                  </kbd>
                </span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleSearch} className="px-3.5 pb-1">
              <div className="relative flex items-center rounded-full bg-white/12 border border-white/20 px-3 py-1.5 shadow-inner focus-within:bg-white/20 focus-within:border-white/40 transition">
                <span className="material-symbols-outlined text-[16px] text-white/75 mr-2 shrink-0">
                  search
                </span>
                <input
                  ref={sidebarSearchRef}
                  type="search"
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  placeholder="Search agenda..."
                  className="w-full bg-transparent text-xs text-white placeholder:text-white/65 focus:outline-none"
                />
                <kbd className="ml-1.5 px-1.5 py-0.5 rounded-md bg-white/15 text-[9px] font-bold text-white/85 shrink-0">
                  ⌘K
                </kbd>
              </div>
            </form>
          )}

          {/* Navigation Items (Supports Seamless Cutout Active Tab) */}
          <nav
            className={`flex-1 ${
              collapsed
                ? 'flex flex-col items-center gap-1 py-1 overflow-visible w-full'
                : 'pl-3 pr-0 py-2 space-y-1 overflow-y-auto no-scrollbar'
            }`}
          >
            {navItems.map((item, idx) => {
              const isActive = activeTab === item.id;

              if (collapsed) {
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectTab(item.id)}
                    aria-label={item.label}
                    className={`glassy-tip-trigger relative w-[40px] h-[40px] rounded-full flex items-center justify-center cursor-pointer ${
                      isActive ? 'glassy-circle-active' : 'glassy-circle-btn'
                    }`}
                  >
                    <span
                      className={`material-symbols-outlined text-[19px] ${
                        isActive ? 'material-symbols-fill text-slate-900' : 'text-white'
                      }`}
                    >
                      {item.icon}
                    </span>

                    {item.id === 'notifikasi' && unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-[#7a0e19]" />
                    )}

                    <span className="glassy-tooltip">
                      {item.label}
                      {item.id === 'notifikasi' && unreadCount > 0 ? ` (${unreadCount})` : ''}
                    </span>
                  </button>
                );
              }

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectTab(item.id)}
                  style={{ animationDelay: `${idx * 30}ms` }}
                  className={`glassy-stagger-item flex items-center justify-between px-3.5 py-2 text-[13px] font-semibold cursor-pointer ${
                    isActive
                      ? 'w-full glassy-tab-active pr-4'
                      : 'w-[calc(100%-12px)] rounded-full glassy-pill'
                  }`}
                >
                  <span className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`material-symbols-outlined text-[18px] shrink-0 ${
                        isActive ? 'material-symbols-fill text-slate-900' : 'text-white/90'
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span className="truncate">{item.label}</span>
                  </span>

                  {item.id === 'notifikasi' && unreadCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-extrabold flex items-center justify-center shrink-0 shadow-xs">
                      {unreadCount}
                    </span>
                  )}

                  {item.id === 'jadwal' && momentumCount > 0 && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-bold shrink-0 ${
                        isActive ? 'bg-slate-900/10 text-slate-800' : 'bg-white/15 text-amber-200'
                      }`}
                    >
                      {momentumCount} Mom
                    </span>
                  )}
                </button>
              );
            })}

            {/* Divider + Ringkasan Hari Ini (Matches PROJECTS Section with 3 Glowing Dots) */}
            <div
              className={`${
                collapsed ? 'w-6 my-1 border-t border-white/15' : 'mr-3 my-2 pt-2 border-t border-white/15'
              }`}
            >
              {!collapsed && (
                <div className="flex items-center justify-between px-1 mb-2 glassy-stagger-item">
                  <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-rose-100/75">
                    Ringkasan
                  </span>
                  {isStaff && (
                    <a
                      href={adminUrl}
                      target="_blank"
                      rel="noreferrer"
                      title="Buka KSJP Admin"
                      className="w-5 h-5 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
                    >
                      <span className="material-symbols-outlined text-[13px]">admin_panel_settings</span>
                    </a>
                  )}
                </div>
              )}

              <div className={collapsed ? 'flex flex-col items-center gap-2.5 pt-1' : 'space-y-1'}>
                {quickStatusDots.map((dot) =>
                  collapsed ? (
                    <button
                      key={dot.id}
                      type="button"
                      onClick={() => onSelectTab(dot.id)}
                      aria-label={dot.label}
                      className="glassy-tip-trigger relative w-6 h-5 flex items-center justify-center cursor-pointer"
                    >
                      <span className={`w-2 h-2 rounded-full ${dot.dotClass}`} />
                      <span className="glassy-tooltip">
                        {dot.label} • {dot.badge}
                      </span>
                    </button>
                  ) : (
                    <button
                      key={dot.id}
                      type="button"
                      onClick={() => onSelectTab(dot.id)}
                      className="w-full flex items-center justify-between px-2 py-1.5 rounded-xl text-[12px] text-white/85 hover:bg-white/10 hover:text-white transition cursor-pointer"
                    >
                      <span className="flex items-center gap-2.5 min-w-0">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${dot.dotClass}`} />
                        <span className="truncate font-medium">{dot.label}</span>
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-white/12 text-[10px] font-bold text-rose-100/95 shrink-0">
                        {dot.badge}
                      </span>
                    </button>
                  )
                )}
              </div>
            </div>
          </nav>

          {/* Footer: PWA Card (mobile only) + User Avatar Row */}
          {collapsed ? (
            <div className="flex flex-col items-center gap-2 pt-2 border-t border-white/15 w-full">
              {isMobileDevice && (
                <button
                  type="button"
                  onClick={triggerInstall}
                  aria-label="Install Aplikasi Android & iOS"
                  className="glassy-tip-trigger relative w-[38px] h-[38px] rounded-full border-2 border-amber-400/80 bg-white/10 text-amber-300 flex items-center justify-center cursor-pointer hover:scale-105 transition"
                >
                  <span className="material-symbols-outlined text-[17px]">
                    {installed ? 'verified' : 'install_mobile'}
                  </span>
                  <span className="glassy-tooltip">
                    {installed ? 'PWA Terpasang' : 'Install App (Android & iOS)'}
                  </span>
                </button>
              )}

              <button
                type="button"
                onClick={() => onSelectTab('profil')}
                aria-label={user?.nama_lengkap || 'Profil'}
                className="glassy-tip-trigger relative w-[38px] h-[38px] rounded-full bg-gradient-to-br from-[#f8b384] to-[#e67e5f] text-slate-900 text-xs font-extrabold flex items-center justify-center cursor-pointer shadow-md"
              >
                {initials}
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#3a0911]" />
                <span className="glassy-tooltip">
                  {user?.nama_lengkap} • {user?.kelas?.nama_kelas || getRoleLabel(user?.role)}
                </span>
              </button>
            </div>
          ) : (
            <div className="px-3 pt-2 border-t border-white/15 space-y-2.5 glassy-stagger-item">
              {isMobileDevice && (
                <div className="rounded-2xl bg-white/10 border border-white/15 p-2.5 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full border-2 border-amber-400/90 bg-slate-900/40 text-amber-300 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[16px]">
                        {installed ? 'verified' : 'install_mobile'}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div className="text-[11px] font-bold text-white leading-tight truncate">
                        {installed ? 'App Terpasang' : 'PWA Mobile'}
                      </div>
                      <div className="text-[10px] text-rose-100/75 leading-tight truncate">
                        {installed ? 'Android & iOS OK' : 'Notif Real-Time'}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={triggerInstall}
                    className="px-2.5 py-1 rounded-full bg-[#e3bc6e] hover:bg-[#f0ca7d] text-slate-950 text-[10px] font-extrabold transition shrink-0 cursor-pointer"
                  >
                    {installed ? 'Aktif' : 'Install'}
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between gap-2 px-1 pb-0.5">
                <button
                  type="button"
                  onClick={() => onSelectTab('profil')}
                  className="flex items-center gap-2.5 min-w-0 text-left cursor-pointer group"
                >
                  <div className="relative w-8 h-8 rounded-full bg-gradient-to-br from-[#f8b384] to-[#e67e5f] text-slate-900 text-xs font-extrabold flex items-center justify-center shrink-0 shadow-sm">
                    {initials}
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#3a0911]" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white truncate max-w-[125px] group-hover:text-rose-200 transition">
                      {user?.nama_lengkap}
                    </div>
                    <div className="text-[10px] text-rose-100/75 truncate">
                      {user?.kelas?.nama_kelas || getRoleLabel(user?.role)}
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={logout}
                  title="Keluar Akun"
                  aria-label="Keluar Akun"
                  className="w-7 h-7 rounded-full hover:bg-white/15 text-rose-100/80 hover:text-white flex items-center justify-center transition shrink-0 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">logout</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Attached White Utility Rail (Expanded Only) */}
        <div
          className={`bg-white flex flex-col items-center justify-between transition-all duration-300 ${
            collapsed
              ? 'w-0 opacity-0 pointer-events-none overflow-hidden py-0'
              : 'w-[48px] opacity-100 py-3.5 shrink-0'
          }`}
        >
          <div className="flex flex-col items-center gap-3">
            {/* Vibrant Crimson Top Action Square */}
            <button
              type="button"
              onClick={() => onSelectTab('jadwal')}
              title="Buka Jadwal Hari Ini"
              className="w-9 h-9 rounded-xl bg-[#d91e2a] hover:bg-[#b10019] text-white shadow-md shadow-rose-600/30 flex items-center justify-center transition cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">event_note</span>
            </button>

            {/* 3 Contextual White Rail Utility Icons */}
            <div className="flex flex-col items-center gap-1.5 pt-1">
              {railActions.map((act) => (
                <button
                  key={act.label}
                  type="button"
                  onClick={act.onClick}
                  title={act.label}
                  aria-label={act.label}
                  className="w-8 h-8 rounded-full text-slate-600 hover:bg-slate-100 hover:text-slate-900 flex items-center justify-center transition cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">{act.icon}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Vertical Rotated Active Tab Label */}
          <div className="glassy-vertical-label text-[10px] font-extrabold text-slate-400 select-none pb-1">
            {activeNavMeta.railLabel}
          </div>
        </div>
      </aside>

      {/* Mobile Drawer (Glassy V10 Theme) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-72 max-w-[85vw] glassy-sidebar-shell rounded-r-[28px] h-full flex flex-col z-10 p-4 text-white">
            <div className="flex items-center justify-between pb-4 border-b border-white/15">
              <div className="flex items-center gap-2.5">
                <img
                  src="/images/ksjp-logo.png"
                  alt="Logo KSJP"
                  className="w-9 h-9 rounded-xl border border-white/40 object-cover shrink-0"
                />
                <div>
                  <div className="text-sm font-extrabold">KSJP STEMATEL</div>
                  <div className="text-[10px] text-rose-100/80">Portal Siswa & Jadwal</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <div className="flex-1 py-4 space-y-1.5 overflow-y-auto">
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onSelectTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-full text-sm font-semibold transition ${
                      isActive ? 'bg-white text-slate-900 shadow-md' : 'glassy-pill'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span
                        className={`material-symbols-outlined text-[20px] ${
                          isActive ? 'material-symbols-fill text-slate-900' : 'text-white'
                        }`}
                      >
                        {item.icon}
                      </span>
                      {item.label}
                    </span>
                    {item.id === 'notifikasi' && unreadCount > 0 && (
                      <span className="w-5 h-5 rounded-full text-[11px] bg-amber-400 text-slate-950 font-extrabold flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                );
              })}

              {isStaff && (
                <a
                  href={adminUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 w-full flex items-center justify-between px-4 py-2.5 rounded-full bg-amber-400/20 border border-amber-300/30 text-amber-100 text-sm font-semibold"
                >
                  <span className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[20px]">admin_panel_settings</span>
                    Panel Admin
                  </span>
                  <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                </a>
              )}
            </div>
            <div className="space-y-2 pt-3 border-t border-white/15">
              {isMobileDevice && (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    triggerInstall();
                  }}
                  className="w-full rounded-full bg-[#e3bc6e] text-slate-950 py-2.5 px-3 text-sm font-bold flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">install_mobile</span>
                  {installed ? 'Aplikasi Terpasang' : 'Install App (Android & iOS)'}
                </button>
              )}
              <button
                type="button"
                onClick={logout}
                className="w-full rounded-full bg-rose-500/20 border border-rose-300/30 text-rose-100 py-2.5 text-sm font-semibold cursor-pointer"
              >
                Keluar Akun
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Wrapper (Dynamic Padding Matching Floating Sidebar Width) */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-[padding] duration-300 ease-out ${
          collapsed ? 'lg:pl-[94px]' : 'lg:pl-[298px] xl:pl-[326px]'
        }`}
      >
        {/* iOS Liquid Glass Topbar (Grey Glass + Black Typography) */}
        <header className="mx-3 sm:mx-6 mt-3.5 h-16 sticky top-3.5 z-20 ios-liquid-glass-nav px-3 sm:px-5 flex items-center justify-between gap-2 sm:gap-3">
          <div className="relative z-10 flex items-center gap-2 sm:gap-2.5 flex-1 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-full bg-white/45 border border-white/60 text-[#111827] hover:bg-white/65 transition cursor-pointer shrink-0 flex items-center justify-center"
              aria-label="Buka menu"
            >
              <span className="material-symbols-outlined text-[20px]">menu</span>
            </button>

            <div className="flex sm:hidden items-center gap-2 min-w-0">
              <img
                src="/images/ksjp-logo.png"
                alt="Logo KSJP"
                className="w-8 h-8 rounded-xl object-cover border border-white/60 shrink-0"
              />
              <span className="text-xs font-extrabold text-[#111827] truncate">KSJP</span>
            </div>

            <form onSubmit={handleSearch} className="hidden sm:flex flex-1 max-w-md relative">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#111827] text-[19px]">
                search
              </span>
              <input
                type="search"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Cari agenda kalender, PSTS, UKK, libur..."
                className="w-full rounded-full bg-white/45 border border-white/65 pl-10 pr-4 py-1.5 text-sm font-semibold text-[#111827] placeholder:text-[#111827]/60 focus:outline-none focus:bg-white/65 focus:ring-2 focus:ring-slate-900/20 transition"
              />
            </form>
          </div>

          <div className="relative z-10 flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {isMobileDevice && !installed && (
              <button
                type="button"
                onClick={triggerInstall}
                className="lg:hidden inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white/50 border border-white/70 text-[#111827] text-[11px] font-bold shadow-xs cursor-pointer whitespace-nowrap shrink-0"
              >
                <span className="material-symbols-outlined text-[15px]">install_mobile</span>
                <span>Install</span>
              </button>
            )}
            <span className="hidden md:inline-flex items-center px-3 py-1.5 rounded-full bg-white/45 border border-white/65 text-xs font-extrabold text-[#111827]">
              T.A. 2026/2027
            </span>

            <button
              type="button"
              onClick={() => onSelectTab('notifikasi')}
              className="relative p-2 rounded-full bg-white/45 border border-white/65 hover:bg-white/70 transition cursor-pointer"
              aria-label="Notifikasi"
            >
              <span className="material-symbols-outlined text-[20px] text-[#111827]">
                notifications
              </span>
              {(unreadCount > 0 || pergantianAktif) && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-primary-container ring-2 ring-white animate-pulse" />
              )}
            </button>

            <button
              type="button"
              onClick={() => onSelectTab('profil')}
              className="flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-full bg-white/45 border border-white/65 hover:bg-white/70 transition cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-primary-container text-white text-xs font-bold flex items-center justify-center shadow-xs">
                {initials}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-extrabold text-[#111827] leading-tight max-w-[150px] truncate">
                  {user?.nama_lengkap}
                </div>
                <div className="text-[11px] font-semibold text-[#111827]/75 leading-tight">
                  {user?.kelas?.nama_kelas || getRoleLabel(user?.role)}
                  {user?.nis ? ` • ${user.nis}` : ''}
                </div>
              </div>
            </button>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 p-4 sm:p-5 lg:p-6 pb-28 lg:pb-8 max-w-[1440px] w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile iOS Liquid Glass Bottom Navigation Bar (Grey Glass + Black Text; Active Turns Red Only When Droplet Arrives) */}
      <nav
        ref={bottomNavRef}
        onPointerDown={(e) => {
          if (e.pointerType === 'mouse' && e.button !== 0) return;
          const idx = resolveSwipeIndex(e.clientX);
          setDragIndex(idx);
          setLiquidMorphing(true);
        }}
        onPointerMove={(e) => {
          if (dragIndex === null) return;
          setDragIndex(resolveSwipeIndex(e.clientX));
        }}
        onPointerUp={(e) => {
          if (dragIndex === null) return;
          const finalIdx = resolveSwipeIndex(e.clientX);
          setDragIndex(null);
          const targetItem = navItems[finalIdx];
          if (targetItem && targetItem.id !== activeTab) {
            onSelectTab(targetItem.id);
          } else {
            setTimeout(() => setLiquidMorphing(false), 220);
          }
        }}
        onPointerCancel={() => {
          setDragIndex(null);
          setLiquidMorphing(false);
        }}
        className="lg:hidden fixed bottom-3.5 inset-x-3.5 z-30 ios-liquid-glass-nav p-1 grid items-center select-none touch-pan-y"
        style={{ gridTemplateColumns: `repeat(${navItems.length}, minmax(0, 1fr))` }}
      >
        {/* Sliding & Stretching Liquid Droplet Pill */}
        <span
          aria-hidden="true"
          className={`ios-liquid-droplet ${liquidMorphing ? 'is-morphing' : ''}`}
          style={{
            width: `calc((100% - 8px) / ${navItems.length})`,
            transform: `translateX(${displayIndex * 100}%) scale(${
              liquidMorphing ? '1.08, 1.14' : '1, 1'
            })`,
          }}
        />

        {navItems.map((item) => {
          const isSettledActive = !liquidMorphing && dragIndex === null && activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`relative z-10 flex flex-col items-center justify-center gap-0.5 py-2 rounded-full text-[10px] transition-colors duration-200 cursor-pointer ${
                isSettledActive ? 'text-[#b10019] font-extrabold' : 'text-[#111827] font-semibold'
              }`}
            >
              <span
                className={`material-symbols-outlined text-[20px] transition-transform duration-200 ${
                  isSettledActive ? 'material-symbols-fill scale-105' : ''
                }`}
              >
                {item.icon}
              </span>
              <span className="leading-none tracking-tight truncate max-w-full px-0.5">
                {item.id === 'admin' ? 'Admin' : item.label.split(' ')[0]}
              </span>
              {item.id === 'notifikasi' && unreadCount > 0 && (
                <span className="absolute top-1.5 right-3 w-2 h-2 rounded-full bg-[#d91e2a] ring-1 ring-white" />
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
