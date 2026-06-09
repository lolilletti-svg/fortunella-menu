# Setup de Supabase — Menú Fortunella

Pasos manuales para activar el menú dinámico. Una sola vez.

## 1. Crear el proyecto
1. Entrar a https://supabase.com → **New project** (free tier).
2. Anotar la región (cualquiera de Sudamérica/US East sirve).

## 2. Crear tablas + seguridad
1. En el proyecto → **SQL Editor** → New query.
2. Pegar y correr todo `tools/schema.sql`.
3. Pegar y correr todo `tools/load-seed.sql` (carga los 81 ítems iniciales).
4. Verificar en **Table editor**: `modules` (7 filas) e `items` (81 filas).

## 3. Configurar el acceso (contraseña compartida)
1. **Authentication → Providers → Email**: desactivar **"Allow new users to sign up"**.
   (Sin esto, cualquiera podría registrarse y editar el menú.)
2. **Authentication → Users → Add user**:
   - Email: `admin@fortunella.menu` (debe coincidir con `ADMIN_EMAIL` en `js/config.js`).
   - Password: una **contraseña fuerte** (es la que usará el dueño).
   - Marcar **Auto Confirm User**.

## 4. Conectar el frontend
1. **Project Settings → API**: copiar **Project URL** y **anon public key**.
2. Pegarlas en `js/config.js` (`SUPABASE_URL` y `SUPABASE_ANON_KEY`).
3. Listo: el menú (`index.html`) lee de Supabase y el panel (`admin.html`) ya permite editar.

## Cómo usa el dueño el panel
- Abrir `…/admin.html` → escribir la contraseña → editar.
- Cada cambio guardado se ve en el menú (URL del QR) al refrescar.

## Notas
- La `anon key` es pública por diseño; la escritura está protegida por RLS (solo usuarios autenticados).
- Rotar la contraseña: Authentication → Users → el usuario → reset password (no se toca código).
- Si Supabase estuviera caído, el menú muestra `data/menu-fallback.json` (snapshot) en vez de quedar vacío.
- Para actualizar el fallback al estado actual, volver a generarlo desde la DB cuando haga falta.
