import { Link } from 'react-router-dom';
import {
  ArrowRight, Wallet, PiggyBank, BarChart3, Tags, Shield,
  TrendingUp, TrendingDown, Check, ChevronRight,
  Landmark, Crown, Layers
} from 'lucide-react';

const Landing = () => {
  const features = [
    {
      icon: Wallet,
      title: 'Dashboard completo',
      description: 'Balance, ingresos, gastos y tendencias en una vista clara y organizada.',
      color: 'bg-gradient-balance',
      badge: null
    },
    {
      icon: Layers,
      title: 'Múltiples cuentas',
      description: 'Organiza tu dinero por cuentas bancarias, efectivo o billeteras digitales.',
      color: 'gradient-income',
      badge: null
    },
    {
      icon: Tags,
      title: 'Categorías personalizadas',
      description: 'Crea y organiza categorías con íconos y colores a tu gusto.',
      color: 'bg-accent-emerald-600',
      badge: null
    },
    {
      icon: PiggyBank,
      title: 'Presupuestos',
      description: 'Establece límites mensuales por categoría y controla tus gastos.',
      color: 'bg-accent-emerald-700',
      badge: 'PRO'
    },
    {
      icon: BarChart3,
      title: 'Reportes visuales',
      description: 'Gráficos de tendencias, comparativas mensuales y análisis detallados.',
      color: 'bg-accent-emerald-800',
      badge: 'PRO'
    },
    {
      icon: Landmark,
      title: 'Bola de nieve',
      description: 'Estrategia para pagar deudas más rápido y ahorrar en intereses.',
      color: 'bg-accent-emerald-900',
      badge: 'PRO'
    }
  ];

  const steps = [
    {
      number: '01',
      title: 'Crea tu cuenta',
      description: 'Regístrate gratis en segundos. Sin tarjeta de crédito.',
      icon: Shield
    },
    {
      number: '02',
      title: 'Agrega transacciones',
      description: 'Registra tus ingresos y gastos fácilmente desde cualquier dispositivo.',
      icon: TrendingUp
    },
    {
      number: '03',
      title: 'Controla tu dinero',
      description: 'Visualiza reportes, controla presupuestos y toma mejores decisiones.',
      icon: PiggyBank
    }
  ];

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Radial Gradients Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] gradient-radial-mint opacity-60" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] gradient-radial-emerald opacity-40" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] gradient-radial-orange opacity-30" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 px-6 py-5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-balance flex items-center justify-center shadow-elevated">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <span className="text-xl font-bold text-primary tracking-tight">Tranki</span>
          </div>
          <Link
            to="/login"
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-emerald text-white rounded-full font-medium btn-scale shadow-elevated"
          >
            Iniciar sesión
            <ArrowRight size={16} />
          </Link>
        </div>
      </nav>

      {/* Hero Section - Two columns */}
      <section className="relative z-10 px-6 pt-16 pb-24">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Headline + CTAs */}
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-emerald-50 border border-accent-emerald-100 rounded-full mb-8 animate-fadeIn">
              <div className="w-2 h-2 rounded-full bg-accent-emerald-500 animate-pulse" />
              <span className="text-sm font-medium text-accent-emerald-700">Finanzas personales simplificadas</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-primary tracking-tight leading-[1.05] mb-6 animate-fadeIn" style={{ animationDelay: '100ms' }}>
              Controla tu dinero
              <br />
              <span className="bg-gradient-to-r from-accent-emerald-700 via-accent-emerald-500 to-accent-emerald-400 bg-clip-text text-transparent">
                sin estrés
              </span>
            </h1>

            <p className="text-xl text-secondary max-w-lg mb-10 animate-fadeIn" style={{ animationDelay: '200ms' }}>
              La app de finanzas personales que te ayuda a entender, organizar y controlar tus gastos. Diseñada para Colombia.
            </p>

            <div className="flex flex-col sm:flex-row items-start gap-4 animate-fadeIn" style={{ animationDelay: '300ms' }}>
              <Link
                to="/register"
                className="flex items-center gap-3 px-8 py-4 bg-gradient-emerald text-white rounded-full font-semibold text-lg btn-scale shadow-glow"
              >
                Crear cuenta gratis
                <ArrowRight size={20} />
              </Link>
              <a
                href="#features"
                className="flex items-center gap-2 px-6 py-4 text-secondary hover:text-accent-emerald-700 font-medium transition-colors"
              >
                Ver características
                <ChevronRight size={18} />
              </a>
            </div>
          </div>

          {/* Right: Mockup visual */}
          <div className="hidden lg:flex justify-center animate-fadeIn" style={{ animationDelay: '400ms' }}>
            <div className="relative">
              {/* Main balance card */}
              <div className="w-80 rounded-3xl bg-gradient-balance-premium p-8 text-white shadow-premium relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                <div className="relative">
                  <div className="flex items-center gap-2 mb-4">
                    <Wallet size={18} className="opacity-80" />
                    <span className="text-sm font-medium opacity-80">Balance total</span>
                  </div>
                  <p className="text-4xl font-black tabular-nums tracking-tight mb-2">$2.450.000</p>
                  <p className="text-sm opacity-60">Enero 2026</p>
                </div>
              </div>

              {/* Floating income card */}
              <div className="absolute -bottom-6 -left-8 glass-card-premium rounded-2xl p-4 shadow-elevated animate-float" style={{ animationDelay: '0.5s' }}>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-accent-emerald-50 rounded-xl">
                    <TrendingUp size={16} className="text-income" />
                  </div>
                  <div>
                    <p className="text-xs text-muted">Ingresos</p>
                    <p className="text-lg font-bold text-income tabular-nums">+$3.8M</p>
                  </div>
                </div>
              </div>

              {/* Floating expense card */}
              <div className="absolute -top-4 -right-6 glass-card-premium rounded-2xl p-4 shadow-elevated animate-float" style={{ animationDelay: '1s' }}>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-50 rounded-xl">
                    <TrendingDown size={16} className="text-expense" />
                  </div>
                  <div>
                    <p className="text-xs text-muted">Gastos</p>
                    <p className="text-lg font-bold text-expense tabular-nums">-$1.35M</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Row */}
      <section className="relative z-10 px-6 py-12 border-y border-accent-emerald-100/50 bg-white/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: '100%', label: 'Gratis para empezar' },
            { value: 'COP', label: 'Peso Colombiano' },
            { value: '0', label: 'Anuncios' },
            { value: '∞', label: 'Transacciones' }
          ].map((stat, index) => (
            <div
              key={index}
              className="text-center animate-fadeIn"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <p className="text-3xl font-black text-primary tabular-nums tracking-tight">{stat.value}</p>
              <p className="text-sm text-muted mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="relative z-10 px-6 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-primary tracking-tight mb-4">
              Todo lo que necesitas
            </h2>
            <p className="text-lg text-secondary max-w-2xl mx-auto">
              Herramientas poderosas y fáciles de usar para tomar el control de tus finanzas personales.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="glass-card-premium border border-accent-emerald-100/50 rounded-2xl p-7 card-hover animate-fadeIn relative"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {feature.badge && (
                  <span className="absolute top-4 right-4 px-2.5 py-1 text-[10px] font-bold tracking-wider rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white">
                    {feature.badge}
                  </span>
                )}
                <div className={`w-14 h-14 ${feature.color} rounded-2xl flex items-center justify-center mb-5 shadow-elevated`}>
                  <feature.icon size={24} className="text-white" />
                </div>
                <h3 className="text-xl font-semibold text-primary tracking-tight mb-2">
                  {feature.title}
                </h3>
                <p className="text-secondary leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="relative z-10 px-6 py-24 bg-white/30 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-primary tracking-tight mb-4">
              Así de fácil funciona
            </h2>
            <p className="text-lg text-secondary max-w-2xl mx-auto">
              En 3 simples pasos puedes tener todas tus finanzas organizadas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div
                key={index}
                className="relative animate-fadeIn"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-accent-emerald-200 to-transparent -translate-x-8" />
                )}
                <div className="text-center">
                  <div className="relative inline-block mb-6">
                    <div className="w-20 h-20 bg-accent-emerald-50 rounded-2xl flex items-center justify-center">
                      <step.icon size={32} className="text-accent-emerald-600" />
                    </div>
                    <span className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-emerald text-white rounded-full flex items-center justify-center text-sm font-bold shadow-elevated">
                      {step.number}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-primary tracking-tight mb-2">
                    {step.title}
                  </h3>
                  <p className="text-secondary">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="relative z-10 px-6 py-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-primary tracking-tight mb-4">
              Planes simples, sin letra pequeña
            </h2>
            <p className="text-lg text-secondary max-w-2xl mx-auto">
              Empieza gratis y desbloquea todo cuando quieras. Sin suscripciones.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Basic Plan */}
            <div className="glass-card-premium border border-accent-emerald-100/50 rounded-3xl p-8 animate-fadeIn">
              <div className="mb-6">
                <span className="px-3 py-1.5 text-xs font-bold tracking-wider rounded-full bg-accent-emerald-50 text-accent-emerald-700">
                  BÁSICO
                </span>
              </div>
              <div className="mb-6">
                <span className="text-5xl font-black text-primary tracking-tight">$0</span>
                <span className="text-muted ml-2">/ gratis</span>
              </div>
              <p className="text-secondary mb-8">Perfecto para empezar a organizar tus finanzas.</p>
              <ul className="space-y-3 mb-8">
                {['Dashboard completo', 'Transacciones ilimitadas', '1 cuenta', 'Categorías personalizadas'].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-accent-emerald-50 flex items-center justify-center flex-shrink-0">
                      <Check size={12} className="text-accent-emerald-600" />
                    </div>
                    <span className="text-secondary text-sm">{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/register"
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 border-2 border-accent-emerald-200 text-accent-emerald-700 rounded-2xl font-semibold hover:bg-accent-emerald-50 transition-colors btn-scale"
              >
                Empezar gratis
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="relative glass-card-premium border-2 border-amber-300 rounded-3xl p-8 animate-fadeIn" style={{ animationDelay: '150ms', transform: 'scale(1.02)' }}>
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="px-4 py-1.5 text-xs font-bold tracking-wider rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-md">
                  RECOMENDADO
                </span>
              </div>
              <div className="mb-6 mt-2">
                <span className="px-3 py-1.5 text-xs font-bold tracking-wider rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white flex items-center gap-1.5 w-fit">
                  <Crown size={12} />
                  PRO
                </span>
              </div>
              <div className="mb-6">
                <span className="text-5xl font-black text-primary tracking-tight">$40.000</span>
                <span className="text-muted ml-2">COP</span>
                <p className="text-sm text-accent-emerald-600 font-medium mt-1">Pago único de por vida</p>
              </div>
              <p className="text-secondary mb-8">Todo lo básico más funcionalidades avanzadas.</p>
              <ul className="space-y-3 mb-8">
                {['Todo lo del plan Básico', 'Cuentas ilimitadas', 'Presupuestos por categoría', 'Reportes y analíticas', 'Bola de nieve (deudas)', 'Actualizaciones futuras'].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0">
                      <Check size={12} className="text-amber-600" />
                    </div>
                    <span className="text-secondary text-sm">{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/register"
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl font-semibold btn-scale shadow-md hover:shadow-lg transition-all"
              >
                <Crown size={16} />
                Desbloquear Pro
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-6 py-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="glass-card-premium border border-accent-emerald-100/50 rounded-3xl p-12 md:p-16 relative overflow-hidden">
            <div className="absolute inset-0 gradient-radial-emerald opacity-30" />
            <div className="relative">
              <h2 className="text-4xl md:text-5xl font-bold text-primary tracking-tight mb-6">
                Empieza a controlar
                <br />
                tu dinero hoy
              </h2>
              <p className="text-lg text-secondary max-w-xl mx-auto mb-10">
                Gratis, sin tarjeta de crédito, sin complicaciones.
                Crea tu cuenta y comienza a organizar tus finanzas.
              </p>
              <Link
                to="/register"
                className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-emerald text-white rounded-full font-semibold text-lg btn-scale shadow-glow"
              >
                Comenzar ahora
                <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-12 border-t border-accent-emerald-100/50 bg-white/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-balance flex items-center justify-center shadow-soft">
                <span className="text-white font-bold text-lg">T</span>
              </div>
              <div>
                <span className="text-lg font-bold text-primary tracking-tight">Tranki</span>
                <p className="text-xs text-muted">Finanzas personales sin estrés</p>
              </div>
            </div>
            <p className="text-sm text-muted">
              Hecho con cariño en Colombia 🇨🇴
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
