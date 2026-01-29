import { useState } from 'react';
import {
  User, Download, Upload, Trash2, Moon, Sun, Database,
  Cloud, AlertTriangle, Check, Info, Sparkles, Crown, ArrowRight
} from 'lucide-react';
import { transactionsAPI } from '../utils/api';
import { useSubscription } from '../hooks/useSubscription';

const Settings = () => {
  const [theme, setTheme] = useState('light');
  const { isPro, loading: subLoading, upgrade } = useSubscription();
  const [exporting, setExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleExport = async () => {
    try {
      setExporting(true);
      const res = await transactionsAPI.getAll({ limit: 10000 });
      const transactions = res.data || [];

      let csv = 'Fecha,Tipo,Monto,Descripción,Categoría\n';
      transactions.forEach(tx => {
        csv += `${tx.date},${tx.type},${tx.amount},"${tx.description || ''}","${tx.category_name || ''}"\n`;
      });

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tranki-backup-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (error) {
      console.error('Export error:', error);
      alert('Error al exportar');
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAll = async () => {
    try {
      setDeleting(true);
      const res = await transactionsAPI.getAll({ limit: 10000 });
      const ids = (res.data || []).map(t => t.id);

      if (ids.length > 0) {
        await transactionsAPI.bulkDelete(ids);
      }

      setShowDeleteConfirm(false);
      alert('Datos eliminados correctamente');
    } catch (error) {
      console.error('Delete error:', error);
      alert('Error al eliminar datos');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-primary tracking-tight">Configuración</h1>
        <p className="text-muted mt-1">Personaliza tu experiencia</p>
      </div>

      {/* Subscription Section */}
      <div className="glass-card border border-border/50 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border/50 bg-black/[0.01]">
          <h3 className="font-semibold text-primary flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${isPro ? 'bg-gradient-to-br from-amber-400 to-orange-500' : 'bg-primary/5'}`}>
              <Crown size={16} className={isPro ? 'text-white' : 'text-primary'} />
            </div>
            Tu plan
          </h3>
        </div>
        <div className="p-6">
          {subLoading ? (
            <div className="h-20 shimmer rounded-xl" />
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2.5">
                    <p className="font-semibold text-lg text-primary">
                      Tranki {isPro ? 'Pro' : 'Básico'}
                    </p>
                    <span className={`px-2.5 py-1 text-[10px] font-bold tracking-wider rounded-full ${
                      isPro
                        ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white'
                        : 'bg-black/5 text-muted'
                    }`}>
                      {isPro ? 'PRO' : 'FREE'}
                    </span>
                  </div>
                  <p className="text-sm text-muted mt-0.5">
                    {isPro ? 'Todas las funcionalidades desbloqueadas' : 'Dashboard, transacciones, 1 cuenta'}
                  </p>
                </div>

                {!isPro && (
                  <button
                    onClick={upgrade}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full font-semibold btn-scale shadow-md hover:shadow-lg transition-all"
                  >
                    <Crown size={16} />
                    Desbloquear Pro — $20.000
                    <ArrowRight size={14} />
                  </button>
                )}
              </div>

              {!isPro && (
                <div className="mt-4 p-4 bg-black/[0.02] rounded-xl">
                  <p className="text-sm font-medium text-primary mb-2">Con Pro desbloqueas (pago único de $20.000):</p>
                  <div className="grid grid-cols-2 gap-2">
                    {['Cuentas ilimitadas', 'Presupuestos', 'Reportes y analíticas', 'Bola de nieve (deudas)'].map(feature => (
                      <div key={feature} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-income" />
                        <span className="text-xs text-secondary">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Profile Section */}
      <div className="glass-card border border-border/50 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border/50 bg-black/[0.01]">
          <h3 className="font-semibold text-primary flex items-center gap-2.5">
            <div className="p-2 bg-primary/5 rounded-xl">
              <User size={16} className="text-primary" />
            </div>
            Perfil
          </h3>
        </div>
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-muted mb-2">Nombre</label>
            <input
              type="text"
              placeholder="Tu nombre"
              className="w-full px-4 py-3 bg-white border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted mb-2">Moneda</label>
            <select
              disabled
              className="w-full px-4 py-3 border border-border/50 rounded-xl bg-black/[0.02] text-muted cursor-not-allowed"
            >
              <option>COP - Peso Colombiano</option>
            </select>
            <p className="text-xs text-muted mt-2 flex items-center gap-1.5">
              <Sparkles size={12} />
              Más monedas próximamente
            </p>
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="glass-card border border-border/50 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border/50 bg-black/[0.01]">
          <h3 className="font-semibold text-primary flex items-center gap-2.5">
            <div className="p-2 bg-accent-yellow/20 rounded-xl">
              <Sun size={16} className="text-amber-600" />
            </div>
            Apariencia
          </h3>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-primary">Tema</p>
              <p className="text-sm text-muted mt-0.5">Modo claro u oscuro</p>
            </div>
            <div className="flex gap-1 p-1 bg-black/[0.03] rounded-xl">
              <button
                onClick={() => setTheme('light')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-75 ${
                  theme === 'light'
                    ? 'bg-white shadow-sm text-primary'
                    : 'text-muted hover:text-secondary'
                }`}
              >
                <Sun size={16} />
                <span className="text-sm">Claro</span>
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-75 ${
                  theme === 'dark'
                    ? 'bg-white shadow-sm text-primary'
                    : 'text-muted hover:text-secondary'
                }`}
              >
                <Moon size={16} />
                <span className="text-sm">Oscuro</span>
              </button>
            </div>
          </div>
          {theme === 'dark' && (
            <div className="mt-4 px-4 py-3 bg-primary/5 rounded-xl flex items-center gap-2 text-sm text-muted animate-fadeIn">
              <Info size={14} />
              Modo oscuro próximamente
            </div>
          )}
        </div>
      </div>

      {/* Data */}
      <div className="glass-card border border-border/50 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border/50 bg-black/[0.01]">
          <h3 className="font-semibold text-primary flex items-center gap-2.5">
            <div className="p-2 bg-income/10 rounded-xl">
              <Database size={16} className="text-income" />
            </div>
            Datos
          </h3>
        </div>
        <div className="divide-y divide-border/50">
          {/* Export */}
          <div className="p-6 flex items-center justify-between">
            <div>
              <p className="font-medium text-primary">Exportar datos</p>
              <p className="text-sm text-muted mt-0.5">Descarga todas tus transacciones</p>
            </div>
            <button
              onClick={handleExport}
              disabled={exporting}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-all btn-scale ${
                exportSuccess
                  ? 'bg-income/10 text-income'
                  : 'bg-white/80 backdrop-blur-sm border border-border/50 text-secondary hover:text-primary hover:border-primary'
              }`}
            >
              {exportSuccess ? (
                <>
                  <Check size={16} />
                  Listo
                </>
              ) : exporting ? (
                'Exportando...'
              ) : (
                <>
                  <Download size={16} />
                  Exportar CSV
                </>
              )}
            </button>
          </div>

          {/* Import */}
          <div className="p-6 flex items-center justify-between opacity-60">
            <div>
              <p className="font-medium text-primary">Importar datos</p>
              <p className="text-sm text-muted mt-0.5">Carga transacciones desde archivo</p>
            </div>
            <button
              disabled
              className="flex items-center gap-2 px-5 py-2.5 border border-border/50 rounded-full text-muted cursor-not-allowed"
            >
              <Upload size={16} />
              Próximamente
            </button>
          </div>
        </div>
      </div>

      {/* Cloud Sync */}
      <div className="glass-card border border-border/50 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border/50 bg-black/[0.01]">
          <h3 className="font-semibold text-primary flex items-center gap-2.5">
            <div className="p-2 bg-blue-500/10 rounded-xl">
              <Cloud size={16} className="text-blue-500" />
            </div>
            Sincronización
          </h3>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-primary">Sincronización en la nube</p>
              <p className="text-sm text-muted mt-0.5">Accede a tus datos desde cualquier dispositivo</p>
            </div>
            <span className="px-4 py-1.5 bg-primary/5 text-primary text-xs font-medium rounded-full">
              Próximamente
            </span>
          </div>
          <div className="mt-4 px-4 py-3 bg-blue-500/5 border border-blue-500/10 rounded-xl">
            <p className="text-sm text-secondary">
              Tus datos se guardan localmente en tu dispositivo. La sincronización con Supabase estará disponible pronto.
            </p>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="glass-card border border-expense/30 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-expense/20 bg-expense/5">
          <h3 className="font-semibold text-expense flex items-center gap-2.5">
            <div className="p-2 bg-expense/10 rounded-xl">
              <AlertTriangle size={16} className="text-expense" />
            </div>
            Zona de peligro
          </h3>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-primary">Eliminar todos los datos</p>
              <p className="text-sm text-muted mt-0.5">Esta acción no se puede deshacer</p>
            </div>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 px-5 py-2.5 border border-expense/50 text-expense rounded-full font-medium hover:bg-expense/10 transition-all btn-scale"
            >
              <Trash2 size={16} />
              Eliminar todo
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden animate-fadeIn shadow-elevated">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-expense/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <AlertTriangle size={32} className="text-expense" />
              </div>
              <h3 className="text-xl font-semibold text-primary tracking-tight mb-2">
                ¿Eliminar todos los datos?
              </h3>
              <p className="text-muted text-sm mb-8">
                Se eliminarán todas las transacciones. Esta acción es permanente y no se puede deshacer.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-3 border border-border/50 rounded-xl font-medium text-secondary hover:bg-black/[0.02] transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteAll}
                  disabled={deleting}
                  className="flex-1 py-3 bg-expense text-white rounded-xl font-medium hover:bg-expense/90 transition-all disabled:opacity-50 btn-scale"
                >
                  {deleting ? 'Eliminando...' : 'Sí, eliminar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* App Info */}
      <div className="text-center py-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-black/[0.02] rounded-full mb-3">
          <div className="w-6 h-6 rounded-lg bg-gradient-balance flex items-center justify-center">
            <span className="text-white text-xs font-bold">T</span>
          </div>
          <span className="text-sm font-medium text-primary">Tranki v1.0.0</span>
        </div>
        <p className="text-sm text-muted">
          Hecho con cariño para tus finanzas
        </p>
      </div>
    </div>
  );
};

export default Settings;
