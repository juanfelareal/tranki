import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowUpDown,
  PiggyBank,
  BarChart3,
  Tags,
  Settings,
  Plus,
  Menu,
  X,
  Wallet,
  Sparkles,
  Landmark,
  LogOut,
  Lock,
  Crown
} from 'lucide-react';
import AddTransactionModal from './AddTransactionModal';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../hooks/useSubscription';

const navigation = [
  { name: 'Dashboard', path: '/app', icon: LayoutDashboard },
  { name: 'Transacciones', path: '/app/transactions', icon: ArrowUpDown },
  { name: 'Cuentas', path: '/app/cuentas', icon: Wallet },
  { name: 'Presupuesto', path: '/app/presupuesto', icon: PiggyBank, proOnly: true },
  { name: 'Deudas', path: '/app/deudas', icon: Landmark, proOnly: true },
  { name: 'Reportes', path: '/app/reportes', icon: BarChart3, proOnly: true },
  { name: 'Categorías', path: '/app/categorias', icon: Tags },
  { name: 'Configuración', path: '/app/configuracion', icon: Settings },
];

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const { isPro } = useSubscription();
  const [showAddModal, setShowAddModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const isActive = (path) => {
    if (path === '/app') return location.pathname === '/app';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Subtle gradient overlay */}
      <div className="fixed inset-0 gradient-radial-yellow pointer-events-none" />
      <div className="fixed inset-0 gradient-radial-green pointer-events-none" />

      {/* Mobile header - with safe area support */}
      <div
        className="lg:hidden fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-border/50 z-40 flex items-center justify-between px-4"
        style={{
          paddingTop: 'calc(var(--safe-area-top, 0px) + 8px)',
          height: 'calc(56px + var(--safe-area-top, 0px))'
        }}
      >
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-muted hover:text-primary rounded-full hover:bg-black/5 transition-all duration-75 touch-feedback touch-target"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        <span className="text-lg font-semibold tracking-tight">Tranki</span>
        <button
          onClick={() => setShowAddModal(true)}
          className="w-10 h-10 flex items-center justify-center bg-primary text-white rounded-full hover:scale-105 transition-transform duration-75 touch-feedback"
        >
          <Plus size={18} strokeWidth={2.5} />
        </button>
      </div>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-30 transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white/80 backdrop-blur-md border-r border-border/50 z-40 transform transition-transform duration-300 ease-out lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo + Plan Badge */}
          <div className="h-16 flex items-center justify-between px-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-balance flex items-center justify-center">
                <Sparkles size={16} className="text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-primary">Tranki</span>
            </div>
            <span className={`px-2.5 py-1 text-[10px] font-bold tracking-wider rounded-full ${
              isPro
                ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white'
                : 'bg-black/5 text-muted'
            }`}>
              {isPro ? 'PRO' : 'FREE'}
            </span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-2 px-3 overflow-y-auto">
            <ul className="space-y-0.5">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                const showLock = item.proOnly && !isPro;
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-75 touch-feedback touch-target ${
                        active
                          ? 'bg-primary text-white shadow-sm'
                          : 'text-secondary hover:bg-black/5 hover:text-primary'
                      }`}
                    >
                      <Icon size={18} className={active ? '' : 'text-muted group-hover:text-primary'} />
                      <span className="flex-1">{item.name}</span>
                      {showLock && (
                        <Lock size={12} className={active ? 'text-white/60' : 'text-muted/50'} />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Add button */}
          <div
            className="p-4 space-y-3"
            style={{ paddingBottom: 'calc(var(--safe-area-bottom, 0px) + 16px)' }}
          >
            <button
              onClick={() => {
                setShowAddModal(true);
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-full font-medium btn-scale shadow-md hover:shadow-lg touch-feedback"
            >
              <Plus size={18} />
              <span>Nueva transacción</span>
            </button>

            {/* User info & Logout */}
            <div className="pt-3 border-t border-border/50">
              <p className="text-xs text-muted truncate mb-2 px-1">
                {user?.email}
              </p>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-secondary hover:text-expense hover:bg-expense/5 rounded-xl font-medium transition-colors"
              >
                <LogOut size={16} />
                <span>Cerrar sesión</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content - with safe area support */}
      <main
        className="lg:ml-64 min-h-screen lg:pt-0 relative"
        style={{
          paddingTop: 'calc(56px + var(--safe-area-top, 0px))'
        }}
      >
        <div className="p-4 lg:p-8 max-w-7xl mx-auto pb-safe">
          <Outlet />
        </div>
      </main>

      {/* Add Transaction Modal */}
      <AddTransactionModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
    </div>
  );
};

export default Layout;
