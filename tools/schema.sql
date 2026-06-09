-- ════════════════════════════════════════════════════════════════
-- Fortunella — esquema del menú (correr en Supabase → SQL Editor)
-- ════════════════════════════════════════════════════════════════

-- ─── Tablas ───
create table if not exists modules (
  id            bigint generated always as identity primary key,
  name          text    not null,
  subtitle      text,
  layout_type   text    not null default 'list',   -- pizza-grid | list | emp-table | postre-cards | bebidas-grid
  title_variant text    not null default 'default', -- default | orange | valientes
  position      int     not null default 0
);

create table if not exists items (
  id          bigint generated always as identity primary key,
  module_id   bigint  not null references modules(id) on delete cascade,
  subgroup    text,
  name        text    not null,
  description text,
  prices      jsonb   not null default '[]'::jsonb, -- [{"label":"CHICA","value":7000}, ...]
  note        text,
  featured    boolean not null default false,
  position    int     not null default 0
);

create index if not exists items_module_idx on items(module_id);

-- ─── Row Level Security (CRÍTICO: sin esto, las policies no aplican) ───
alter table modules enable row level security;
alter table items   enable row level security;

-- Lectura pública (el menú es público)
create policy "public read modules" on modules for select using (true);
create policy "public read items"   on items   for select using (true);

-- Escritura solo para usuarios autenticados (el panel admin)
create policy "auth insert modules" on modules for insert to authenticated with check (true);
create policy "auth update modules" on modules for update to authenticated using (true) with check (true);
create policy "auth delete modules" on modules for delete to authenticated using (true);
create policy "auth insert items"   on items   for insert to authenticated with check (true);
create policy "auth update items"   on items   for update to authenticated using (true) with check (true);
create policy "auth delete items"   on items   for delete to authenticated using (true);

-- ─── Recordatorios manuales (dashboard) ───
-- 1) Authentication → Providers → Email: DESACTIVAR "Allow new users to sign up".
-- 2) Authentication → Users → Add user: crear el único usuario admin
--    (email = el de ADMIN_EMAIL en js/config.js) con una contraseña fuerte.
--    Marcar "Auto Confirm User" para que no quede pendiente de verificación.
