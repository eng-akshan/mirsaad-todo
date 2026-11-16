import { LogOut } from 'lucide-react';
import { Logo } from '../components/Logo.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export function AppLayout({ children }) {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen bg-sand">
      <header className="sticky top-0 z-30 border-b border-black/5 bg-sand/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Logo />
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <div className="text-sm font-bold text-ink">{user?.name}</div>
              <div className="text-xs text-ink/45">{user?.email}</div>
            </div>
            <button className="icon-button h-10 w-10 border border-black/5 bg-white" onClick={logout} title="Log out"><LogOut size={18} /></button>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
