-- ════════════════════════════════════════════════════════════════
-- Fortunella — segunda carta: "Patio Fortunella" (inauguración)
-- Correr UNA vez en Supabase → SQL Editor. No toca el menú actual.
-- Copia los precios vigentes del menú Fortunella al momento de correrlo.
-- ════════════════════════════════════════════════════════════════

-- ─── 1) Columna "menu": a qué carta pertenece cada módulo ───
alter table modules add column if not exists menu text not null default 'fortunella';
create index if not exists modules_menu_idx on modules(menu);

-- ─── 2) Módulos de la carta Patio ───
insert into modules (menu, name, subtitle, layout_type, title_variant, position) values
  ('patio', 'Mientras esperás',           'Empanadas al horno de barro',                                                        'emp-table',    'default',   10),
  ('patio', 'Sandwichería',               'Sándwiches con masa de focaccia artesanal',                                          'list',         'orange',    20),
  ('patio', 'Sandwich Solo para Valientes','Masa de pizza · Con papas fritas · Comen entre 7 y 8 personas · Aderezo Fortunella', 'list',         'valientes', 30),
  ('patio', 'Nuestras deliciosas pizzas', 'Masa madre · Horno de barro · Todas incluyen tomates asados y aceitunas',            'pizza-grid',   'default',   40),
  ('patio', 'Ensaladas de verano',        null,                                                                                  'list',         'default',   50),
  ('patio', 'Dulce Fortunella',           null,                                                                                  'postre-cards', 'default',   60),
  ('patio', 'Bebidas',                    null,                                                                                  'bebidas-grid', 'default',   70);

-- ─── 3) Ítems copiados del menú Fortunella (mismos nombres, descripciones y precios) ───
-- (patio_module, fortunella_module, nombre_en_fortunella, nombre_en_patio)
with mapping(patio_mod, src_mod, src_name, new_name) as (
  select 'Mientras esperás', 'Empanadas', i.name, i.name
    from items i join modules m on m.id = i.module_id
   where m.menu = 'fortunella' and m.name = 'Empanadas'
  union all
  select 'Sandwichería', 'Focacceria', i.name, i.name
    from items i join modules m on m.id = i.module_id
   where m.menu = 'fortunella' and m.name = 'Focacceria'
  union all
  select 'Sandwich Solo para Valientes', 'Sandwich Solo para Valientes', i.name, i.name
    from items i join modules m on m.id = i.module_id
   where m.menu = 'fortunella' and m.name = 'Sandwich Solo para Valientes'
  union all
  select 'Nuestras deliciosas pizzas', 'Pizzas', i.name, i.name
    from items i join modules m on m.id = i.module_id
   where m.menu = 'fortunella' and m.name = 'Pizzas' and not i.featured   -- sin el Box Degustación
  union all
  select 'Ensaladas de verano', 'Ensalada', 'Ensalada César', 'César con Pollo'
  union all
  select 'Dulce Fortunella', 'Postres', 'Flan', 'Flan Casero'
  union all
  select 'Dulce Fortunella', 'Postres', 'Tiramisú', 'Tiramisú'
  union all
  select 'Bebidas', 'Bebidas', i.name, i.name
    from items i join modules m on m.id = i.module_id
   where m.menu = 'fortunella' and m.name = 'Bebidas' and i.subgroup = 'Sin Alcohol'
)
insert into items (module_id, subgroup, name, description, prices, note, featured, position)
select pm.id, si.subgroup, mp.new_name, si.description, si.prices, si.note, false, si.position
  from mapping mp
  join modules sm on sm.menu = 'fortunella' and sm.name = mp.src_mod
  join items   si on si.module_id = sm.id and si.name = mp.src_name
  join modules pm on pm.menu = 'patio' and pm.name = mp.patio_mod;

-- ─── 4) Ensaladas nuevas (sin precio: cargarlo desde el panel) ───
insert into items (module_id, name, prices, position)
select pm.id, v.name, '[]'::jsonb, v.pos
  from modules pm,
       (values ('Criolla', 10), ('Mixta', 20), ('Rúcula y Parmesano', 40)) as v(name, pos)
 where pm.menu = 'patio' and pm.name = 'Ensaladas de verano';
update items set position = 30
 where name = 'César con Pollo'
   and module_id = (select id from modules where menu = 'patio' and name = 'Ensaladas de verano');

-- ─── Control: debería listar 7 módulos con sus cantidades ───
select m.position, m.name, count(i.id) as items
  from modules m left join items i on i.module_id = m.id
 where m.menu = 'patio'
 group by m.id order by m.position;
