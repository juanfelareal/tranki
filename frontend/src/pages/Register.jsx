import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const { signUp, user } = useAuth();
  const navigate = useNavigate();

  // Si ya está autenticado, redirigir al app
  if (user) {
    navigate('/app', { replace: true });
    return null;
  }

  const validatePassword = (pass) => {
    const checks = {
      length: pass.length >= 8,
      uppercase: /[A-Z]/.test(pass),
      lowercase: /[a-z]/.test(pass),
      number: /[0-9]/.test(pass)
    };
    return checks;
  };

  const passwordChecks = validatePassword(password);
  const isPasswordValid = Object.values(passwordChecks).every(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validaciones
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (!isPasswordValid) {
      setError('La contraseña no cumple con los requisitos');
      return;
    }

    setLoading(true);

    try {
      const { error, data } = await signUp(email, password);

      if (error) {
        if (error.message.includes('already registered')) {
          setError('Este email ya está registrado. Intenta iniciar sesión.');
        } else {
          setError(error.message);
        }
      } else {
        // Mostrar mensaje de éxito
        setSuccess(true);
      }
    } catch (err) {
      setError('Ocurrió un error. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Pantalla de éxito
  if (success) {
    return (
      <div className="min-h-screen bg-surface flex flex-col">
        <header className="p-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted hover:text-primary transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Volver</span>
          </Link>
        </header>

        <div className="flex-1 flex items-center justify-center px-4 pb-8">
          <div className="w-full max-w-md text-center">
            <div className="w-20 h-20 bg-income/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={40} className="text-income" />
            </div>
            <h1 className="text-2xl font-bold text-primary mb-3">¡Revisa tu correo!</h1>
            <p className="text-muted mb-8">
              Hemos enviado un enlace de confirmación a <strong className="text-primary">{email}</strong>.
              Haz clic en el enlace para activar tu cuenta.
            </p>
            <Link
              to="/login"
              className="inline-block w-full py-3.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-all text-center"
            >
              Ir a iniciar sesión
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Header */}
      <header className="p-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-muted hover:text-primary transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Volver</span>
        </Link>
      </header>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4 pb-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center justify-center gap-2">
              <span className="text-3xl">💰</span>
              <span className="text-2xl font-bold text-primary">Tranki</span>
            </Link>
            <h1 className="text-2xl font-bold text-primary mt-6">Crea tu cuenta</h1>
            <p className="text-muted mt-2">Empieza a controlar tus finanzas hoy</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-expense/10 border border-expense/20 rounded-xl flex items-start gap-3">
              <AlertCircle size={20} className="text-expense flex-shrink-0 mt-0.5" />
              <p className="text-sm text-expense">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-white border border-border rounded-xl text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-12 pr-12 py-3.5 bg-white border border-border rounded-xl text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-primary transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {/* Password Requirements */}
              {password && (
                <div className="mt-3 space-y-1.5">
                  <PasswordCheck passed={passwordChecks.length} label="Mínimo 8 caracteres" />
                  <PasswordCheck passed={passwordChecks.uppercase} label="Una mayúscula" />
                  <PasswordCheck passed={passwordChecks.lowercase} label="Una minúscula" />
                  <PasswordCheck passed={passwordChecks.number} label="Un número" />
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Confirmar contraseña
              </label>
              <div className="relative">
                <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className={`w-full pl-12 pr-4 py-3.5 bg-white border rounded-xl text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
                    confirmPassword && password !== confirmPassword
                      ? 'border-expense focus:border-expense'
                      : 'border-border focus:border-primary'
                  }`}
                />
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-expense mt-2">Las contraseñas no coinciden</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !isPasswordValid || password !== confirmPassword}
              className="w-full py-3.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Creando cuenta...</span>
                </>
              ) : (
                'Crear cuenta'
              )}
            </button>
          </form>

          {/* Terms */}
          <p className="text-center text-xs text-muted mt-6">
            Al crear una cuenta, aceptas nuestros{' '}
            <a href="#" className="text-primary hover:underline">Términos de servicio</a>
            {' '}y{' '}
            <a href="#" className="text-primary hover:underline">Política de privacidad</a>
          </p>

          {/* Login Link */}
          <p className="text-center text-muted mt-6">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

const PasswordCheck = ({ passed, label }) => (
  <div className="flex items-center gap-2">
    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
      passed ? 'bg-income' : 'bg-border'
    }`}>
      {passed && <CheckCircle size={12} className="text-white" />}
    </div>
    <span className={`text-xs ${passed ? 'text-income' : 'text-muted'}`}>{label}</span>
  </div>
);

export default Register;
