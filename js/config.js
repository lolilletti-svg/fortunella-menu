// Configuración de Supabase — COMPLETAR con los valores del proyecto.
// Estos dos valores son PÚBLICOS (van en el frontend): la anon key no es secreta,
// lo que protege la escritura es Row Level Security (RLS) en Supabase.
// Mientras estén en "TODO", el menú funciona con el fallback estático (data/menu-fallback.json).

export const SUPABASE_URL = "https://txxoyivwhsoowkhwzzpp.supabase.co";
export const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4eG95aXZ3aHNvb3draHd6enBwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5NjA0MTUsImV4cCI6MjA5NjUzNjQxNX0.2BwmresXRprVWnN5oPF_SEzeYKNuf7beXMJ__Sx2ZVg";

// Email fijo del único usuario admin (la contraseña la elige el dueño y se valida en Supabase Auth).
// El cliente solo escribe la contraseña en el panel; el email no se muestra.
export const ADMIN_EMAIL = "admin@fortunella.menu";

export function supabaseConfigured() {
  return (
    SUPABASE_URL && !SUPABASE_URL.startsWith("TODO") &&
    SUPABASE_ANON_KEY && !SUPABASE_ANON_KEY.startsWith("TODO")
  );
}
