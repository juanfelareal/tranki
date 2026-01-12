import { createClient } from '@supabase/supabase-js';

// Crear cliente Supabase con el token del usuario
export const createUserClient = (accessToken) => {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
    {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    }
  );
};

// Middleware de autenticación
export const withAuth = (handler) => async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Extraer token del header Authorization
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'No autorizado. Token requerido.' });
  }

  try {
    // Crear cliente con el token del usuario
    const supabase = createUserClient(token);

    // Verificar que el token es válido obteniendo el usuario
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return res.status(401).json({ error: 'Token inválido o expirado' });
    }

    // Adjuntar usuario y cliente Supabase al request
    req.user = user;
    req.supabase = supabase;

    // Continuar con el handler
    return handler(req, res);
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(401).json({ error: 'Error de autenticación' });
  }
};
