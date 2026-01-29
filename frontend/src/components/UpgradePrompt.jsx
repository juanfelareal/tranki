import { Crown, ArrowRight } from 'lucide-react';

const UpgradePrompt = ({ feature, onUpgrade }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6">
      <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-6 shadow-premium">
        <Crown size={36} className="text-white" />
      </div>

      <h2 className="text-2xl font-bold text-primary tracking-tight mb-2">
        Función Pro
      </h2>

      <p className="text-muted text-center max-w-sm mb-8">
        <span className="font-medium text-secondary">{feature}</span> está disponible con el complemento Pro.
        Desbloquea todas las funcionalidades avanzadas + actualizaciones futuras por solo <span className="font-semibold text-primary">$40.000 COP</span> (pago único).
      </p>

      <div className="space-y-4 w-full max-w-xs">
        <button
          onClick={onUpgrade}
          className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl font-semibold btn-scale shadow-elevated hover:shadow-premium transition-all"
        >
          <Crown size={18} />
          Desbloquear Pro — $40.000
          <ArrowRight size={16} />
        </button>

        <div className="text-center">
          <p className="text-xs text-muted">
            Pago único. Acceso de por vida.
          </p>
        </div>
      </div>

      {/* Features list */}
      <div className="mt-10 w-full max-w-sm">
        <p className="text-sm font-medium text-muted mb-3 text-center">El plan Pro incluye:</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            'Cuentas ilimitadas',
            'Presupuestos',
            'Reportes y analíticas',
            'Bola de nieve (deudas)',
            'Actualizaciones futuras',
          ].map((item) => (
            <div key={item} className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl">
              <div className="w-1.5 h-1.5 rounded-full bg-income flex-shrink-0" />
              <span className="text-xs text-secondary">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UpgradePrompt;
