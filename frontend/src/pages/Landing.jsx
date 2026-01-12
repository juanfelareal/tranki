import { Link } from 'react-router-dom';
import {
  ArrowRight, Wallet, PiggyBank, BarChart3, ScanLine, Brain, Shield,
  Smartphone, TrendingUp, TrendingDown, Sparkles, Check, ChevronRight,
  Camera, Zap, Target, Clock, Lock, Globe
} from 'lucide-react';

const Landing = () => {
  const features = [
    {
      icon: Wallet,
      title: 'Dashboard intuitivo',
      description: 'Vista completa de tus finanzas en un solo lugar. Balance, ingresos, gastos y tendencias.',
      color: 'bg-gradient-balance'
    },
    {
      icon: ScanLine,
      title: 'Escaneo con IA',
      description: 'Sube fotos de extractos bancarios o SMS y la IA detecta automáticamente tus transacciones.',
      color: 'bg-primary'
    },
    {
      icon: Brain,
      title: 'Categorías inteligentes',
      description: 'El sistema aprende tus hábitos y categoriza automáticamente tus gastos recurrentes.',
      color: 'bg-income'
    },
    {
      icon: Target,
      title: 'Presupuestos',
      description: 'Establece límites mensuales por categoría y recibe alertas cuando te acerques.',
      color: 'bg-expense'
    },
    {
      icon: BarChart3,
      title: 'Reportes visuales',
      description: 'Gráficos de tendencias, comparativas mensuales y análisis de gastos por categoría.',
      color: 'bg-blue-500'
    },
    {
      icon: Shield,
      title: 'Privacidad local',
      description: 'Tus datos se guardan en tu dispositivo. Sin servidores externos, sin rastreo.',
      color: 'bg-amber-500'
    }
  ];

  const steps = [
    {
      number: '01',
      title: 'Sube tu extracto',
      description: 'Toma una foto de tu extracto bancario, SMS o comprobante de pago.',
      icon: Camera
    },
    {
      number: '02',
      title: 'IA detecta transacciones',
      description: 'Nuestra inteligencia artificial identifica automáticamente cada transacción.',
      icon: Sparkles
    },
    {
      number: '03',
      title: 'Categoriza y ahorra',
      description: 'Revisa, edita si es necesario, y comienza a controlar tu dinero.',
      icon: PiggyBank
    }
  ];

  const stats = [
    { value: '100%', label: 'Gratis' },
    { value: 'COP', label: 'Peso Colombiano' },
    { value: '0', label: 'Anuncios' },
    { value: 'Local', label: 'Tus datos' }
  ];

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Radial Gradients Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] gradient-radial-yellow opacity-40" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] gradient-radial-green opacity-30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] gradient-radial-orange opacity-20" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 px-6 py-5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-balance flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <span className="text-xl font-bold text-primary tracking-tight">Tranki</span>
          </div>
          <Link
            to="/login"
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-full font-medium btn-scale shadow-md"
          >
            Iniciar sesión
            <ArrowRight size={16} />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-6 pt-16 pb-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/5 rounded-full mb-8 animate-fadeIn">
            <Sparkles size={16} className="text-primary" />
            <span className="text-sm font-medium text-primary">Finanzas personales con IA</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-primary tracking-tight leading-[1.1] mb-6 animate-fadeIn" style={{ animationDelay: '100ms' }}>
            Controla tu dinero
            <br />
            <span className="bg-gradient-to-r from-income to-primary bg-clip-text text-transparent">
              sin estrés
            </span>
          </h1>

          <p className="text-xl text-secondary max-w-2xl mx-auto mb-10 animate-fadeIn" style={{ animationDelay: '200ms' }}>
            La app de finanzas personales que usa inteligencia artificial para ayudarte
            a entender, categorizar y controlar tus gastos. Diseñada para Colombia.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fadeIn" style={{ animationDelay: '300ms' }}>
            <Link
              to="/register"
              className="flex items-center gap-3 px-8 py-4 bg-primary text-white rounded-full font-semibold text-lg btn-scale shadow-lg shadow-primary/20"
            >
              Crear cuenta gratis
              <ArrowRight size={20} />
            </Link>
            <a
              href="#features"
              className="flex items-center gap-2 px-6 py-4 text-secondary hover:text-primary font-medium transition-colors"
            >
              Ver características
              <ChevronRight size={18} />
            </a>
          </div>
        </div>
      </section>

      {/* Stats Row */}
      <section className="relative z-10 px-6 py-12 border-y border-border/50 bg-white/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center animate-fadeIn"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <p className="text-3xl font-bold text-primary tabular-nums tracking-tight">{stat.value}</p>
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
                className="glass-card border border-border/50 rounded-2xl p-7 card-hover animate-fadeIn"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`w-14 h-14 ${feature.color} rounded-2xl flex items-center justify-center mb-5 shadow-lg`}>
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
              En 3 simples pasos puedes tener todas tus transacciones organizadas y categorizadas.
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
                  <div className="hidden md:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-border to-transparent -translate-x-8" />
                )}
                <div className="text-center">
                  <div className="relative inline-block mb-6">
                    <div className="w-20 h-20 bg-primary/5 rounded-2xl flex items-center justify-center">
                      <step.icon size={32} className="text-primary" />
                    </div>
                    <span className="absolute -top-2 -right-2 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
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

      {/* AI Feature Highlight */}
      <section className="relative z-10 px-6 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="glass-card border border-border/50 rounded-3xl p-8 md:p-12 overflow-hidden relative">
            <div className="absolute inset-0 gradient-radial-green opacity-20" />
            <div className="relative grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-income/10 rounded-full mb-6">
                  <Brain size={16} className="text-income" />
                  <span className="text-sm font-medium text-income">Inteligencia Artificial</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-primary tracking-tight mb-4">
                  IA que aprende de ti
                </h2>
                <p className="text-lg text-secondary mb-6">
                  Tranki usa inteligencia artificial para detectar patrones en tus gastos.
                  Cuanto más la uses, más inteligente se vuelve categorizando automáticamente
                  tus transacciones recurrentes.
                </p>
                <ul className="space-y-3">
                  {[
                    'Detecta bancos colombianos (Bancolombia, Davivienda, etc.)',
                    'Lee SMS de notificaciones bancarias',
                    'Aprende tus categorías personalizadas',
                    'Procesa múltiples imágenes a la vez'
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-income/10 flex items-center justify-center flex-shrink-0">
                        <Check size={12} className="text-income" />
                      </div>
                      <span className="text-secondary">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex justify-center">
                <div className="w-64 h-64 bg-gradient-balance rounded-3xl flex items-center justify-center shadow-xl">
                  <div className="text-center text-white">
                    <Sparkles size={48} className="mx-auto mb-4 opacity-80" />
                    <p className="text-lg font-semibold">Procesamiento</p>
                    <p className="text-sm opacity-80">con Claude AI</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="relative z-10 px-6 py-24 bg-white/30 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-primary tracking-tight mb-4">
              Diseñado para Colombia
            </h2>
            <p className="text-lg text-secondary max-w-2xl mx-auto">
              Pensado desde el inicio para usuarios colombianos, con soporte nativo para pesos y bancos locales.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                icon: Globe,
                title: 'Moneda COP nativa',
                description: 'Formato de pesos colombianos con separadores correctos. Sin conversiones extrañas.'
              },
              {
                icon: Smartphone,
                title: 'Bancos colombianos',
                description: 'Reconoce extractos de Bancolombia, Davivienda, BBVA, Nequi y más.'
              },
              {
                icon: Zap,
                title: 'Entrada rápida',
                description: 'Escribe "45 mil" o "1.5M" y la app entiende el monto automáticamente.'
              },
              {
                icon: Lock,
                title: 'Datos locales',
                description: 'Tu información financiera nunca sale de tu dispositivo. Privacidad total.'
              }
            ].map((benefit, i) => (
              <div
                key={i}
                className="flex gap-5 p-6 glass-card border border-border/50 rounded-2xl animate-fadeIn"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center flex-shrink-0">
                  <benefit.icon size={24} className="text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-primary tracking-tight mb-1">
                    {benefit.title}
                  </h3>
                  <p className="text-secondary">
                    {benefit.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-6 py-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="glass-card border border-border/50 rounded-3xl p-12 md:p-16 relative overflow-hidden">
            <div className="absolute inset-0 gradient-radial-yellow opacity-30" />
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
                className="inline-flex items-center gap-3 px-10 py-5 bg-primary text-white rounded-full font-semibold text-lg btn-scale shadow-lg shadow-primary/20"
              >
                Comenzar ahora
                <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-12 border-t border-border/50 bg-white/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-balance flex items-center justify-center">
                <span className="text-white font-bold text-lg">T</span>
              </div>
              <div>
                <span className="text-lg font-bold text-primary tracking-tight">Tranki</span>
                <p className="text-xs text-muted">Finanzas personales sin estrés</p>
              </div>
            </div>
            <p className="text-sm text-muted">
              Hecho con cariño en Colombia
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
