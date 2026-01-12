import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { CheckCircle, AlertCircle } from 'lucide-react';

const AuthCallback = () => {
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Obtener el hash de la URL (Supabase usa hash para tokens)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type') || searchParams.get('type');

        if (accessToken && refreshToken) {
          // Establecer la sesión manualmente
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (error) throw error;

          if (type === 'recovery') {
            setStatus('success');
            setMessage('Sesión verificada. Redirigiendo para cambiar contraseña...');
            setTimeout(() => navigate('/app/configuracion', { replace: true }), 2000);
          } else {
            setStatus('success');
            setMessage('Email verificado correctamente. Redirigiendo...');
            setTimeout(() => navigate('/app', { replace: true }), 2000);
          }
        } else {
          // Verificar si hay una sesión existente
          const { data: { session } } = await supabase.auth.getSession();

          if (session) {
            setStatus('success');
            setMessage('Sesión activa. Redirigiendo...');
            setTimeout(() => navigate('/app', { replace: true }), 1500);
          } else {
            setStatus('error');
            setMessage('No se pudo verificar la sesión. Por favor intenta de nuevo.');
          }
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        setStatus('error');
        setMessage(error.message || 'Ocurrió un error durante la verificación');
      }
    };

    handleCallback();
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        {status === 'loading' && (
          <>
            <div className="w-16 h-16 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6" />
            <h1 className="text-xl font-bold text-primary mb-2">Verificando...</h1>
            <p className="text-muted">Por favor espera un momento</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-20 h-20 bg-income/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={40} className="text-income" />
            </div>
            <h1 className="text-xl font-bold text-primary mb-2">¡Listo!</h1>
            <p className="text-muted">{message}</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-20 h-20 bg-expense/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle size={40} className="text-expense" />
            </div>
            <h1 className="text-xl font-bold text-primary mb-2">Error</h1>
            <p className="text-muted mb-6">{message}</p>
            <button
              onClick={() => navigate('/login', { replace: true })}
              className="inline-block px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-all"
            >
              Ir a iniciar sesión
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
