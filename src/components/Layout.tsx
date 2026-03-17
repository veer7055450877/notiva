import { AnimatePresence, motion } from 'framer-motion';
import { Archive, Command, FileText, Github, Instagram, LayoutDashboard, Linkedin, LogOut, Menu, RefreshCw, Sparkles, Wifi, WifiOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotes } from '../context/NotesContext';
import { CommandPalette } from './CommandPalette';
import { DeviceStatus } from './DeviceStatus';
import { ExtensionModal } from './ExtensionModal';
import { ThemeToggle } from './ThemeToggle';

export const Layout = () => {
  const { isOffline, isSyncing } = useNotes();
  const { user, logout } = useAuth();
  const [isCmdOpen, setIsCmdOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isExtModalOpen, setIsExtModalOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'k') { e.preventDefault(); setIsCmdOpen(true); }
    };
    window.addEventListener('keydown', handleKeyDown);
    setIsDark(document.documentElement.classList.contains('dark'));

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((m) => { if (m.attributeName === 'class') setIsDark(document.documentElement.classList.contains('dark')); });
    });
    observer.observe(document.documentElement, { attributes: true });

    return () => { window.removeEventListener('keydown', handleKeyDown); observer.disconnect(); };
  }, []);

  const toggleTheme = () => {
    if (isDark) { document.documentElement.classList.remove('dark'); localStorage.theme = 'light'; }
    else { document.documentElement.classList.add('dark'); localStorage.theme = 'dark'; }
  };

  const navLinks = [
    { to: '/', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard' },
    { to: '/notes', icon: <FileText className="w-5 h-5" />, label: 'All Notes' },
    { to: '/archived', icon: <Archive className="w-5 h-5" />, label: 'Archived' },
  ];

  const LogoIcon = () => (
    <motion.div
      whileHover={{ rotate: -10, scale: 1.05 }}
      className="w-8 h-8 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0"
    >
      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    </motion.div>
  );

  const SidebarContent = () => (
    <div className="flex flex-col h-full py-6 px-4">
      <div className="flex items-center gap-3 mb-8 px-2">
        <LogoIcon />
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Notiva</h1>
      </div>

      <nav className="flex-1 space-y-1">
        {navLinks.map((link) => (
          <NavLink
            key={link.to} to={link.to} onClick={() => setIsSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive ? 'bg-indigo-50 text-indigo-700 dark:bg-violet-500/10 dark:text-violet-400' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
              }`
            }
          >
            {link.icon} {link.label}
          </NavLink>
        ))}

        <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={() => { setIsExtModalOpen(true); setIsSidebarOpen(false); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/10 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors border border-indigo-100 dark:border-indigo-900/30"
          >
            <Sparkles className="w-5 h-5" /> Install Extension
          </button>
        </div>
      </nav>

      <div className="mt-auto pt-6 border-t border-slate-200 dark:border-slate-800 space-y-2">
        {user && (
          <div className="flex items-center gap-3 px-3 py-2 mb-2 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs uppercase">
              {user.name.substring(0, 2)}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user.name}</p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>
            <button onClick={logout} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Logout">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}

        <button onClick={() => setIsCmdOpen(true)} className="w-full flex items-center gap-2 px-2 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/50 transition-colors">
          <Command className="w-5 h-5" /> Command Menu
          <kbd className="ml-auto px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-[10px] font-bold">Ctrl K</kbd>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-[#0f172a]">
      <aside className="hidden md:block w-64 fixed inset-y-0 left-0 z-40 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
        <SidebarContent />
      </aside>

      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm md:hidden" />
            <motion.aside initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 md:hidden">
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col md:pl-64 min-h-screen">
        <header className="sticky top-0 z-30 glass">
          <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4 md:hidden">
              <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"><Menu className="w-5 h-5" /></button>
              <div className="flex items-center gap-2">
                <LogoIcon />
                <div className="font-bold text-slate-900 dark:text-white">Notiva</div>
              </div>
            </div>

            <div className="hidden md:block">
              <DeviceStatus />
            </div>

            <div className="flex items-center gap-3 sm:gap-4 ml-auto">
              <div className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${isOffline ? 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800/50' : isSyncing ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800/50' : 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800/50'}`}>
                {isOffline ? <WifiOff className="w-3.5 h-3.5" /> : isSyncing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Wifi className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{isOffline ? 'Offline' : isSyncing ? 'Syncing...' : 'Synced'}</span>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </header>

        <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Outlet />
        </main>

        <footer className="border-t border-slate-200 dark:border-slate-800 py-8 mt-auto bg-white dark:bg-slate-900">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col items-center md:items-start gap-1">
              <p className="text-sm text-slate-500">Built by <span className="font-semibold text-slate-900 dark:text-white">Conceptualcode</span></p>
              <p className="text-xs text-slate-400">Veer Singh | Frontend Developer</p>
            </div>
            <div className="flex items-center gap-6">
              <a href="http://github.com/conceptualCode-official" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-indigo-600 dark:hover:text-violet-400 transition-colors flex items-center gap-2 text-sm font-medium"><Github className="w-4 h-4" /> <span className="hidden sm:inline">GitHub</span></a>
              <a href="https://www.linkedin.com/in/vivek-kumar786" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-indigo-600 dark:hover:text-violet-400 transition-colors flex items-center gap-2 text-sm font-medium"><Linkedin className="w-4 h-4" /> <span className="hidden sm:inline">LinkedIn</span></a>
              <a href="https://instagram.com/conceptualcode" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-indigo-600 dark:hover:text-violet-400 transition-colors flex items-center gap-2 text-sm font-medium"><Instagram className="w-4 h-4" /> <span className="hidden sm:inline">Instagram</span></a>
            </div>
          </div>
        </footer>
      </div>

      <CommandPalette isOpen={isCmdOpen} onClose={() => setIsCmdOpen(false)} onCreateNote={() => window.dispatchEvent(new CustomEvent('open-editor'))} onToggleTheme={toggleTheme} isDark={isDark} />
      <ExtensionModal isOpen={isExtModalOpen} onClose={() => setIsExtModalOpen(false)} />
    </div>
  );
};
