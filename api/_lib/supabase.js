import { createClient } from '@supabase/supabase-js';

// Cliente admin (bypass RLS) - solo para operaciones especiales
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Export por defecto para compatibilidad (será reemplazado por req.supabase en handlers)
export default supabaseAdmin;
