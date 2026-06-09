-- Carga inicial del menú Fortunella (correr DESPUÉS de schema.sql).
-- Generado desde tools/seed.json. Idempotente sobre tablas vacías.

truncate items, modules restart identity cascade;

with m as (
  insert into modules (name, subtitle, layout_type, title_variant, position)
  values ('Pizzas', 'Masa madre · Horno de barro · Todas incluyen tomates asados y aceitunas', 'pizza-grid', 'default', 10) returning id
)
insert into items (module_id, subgroup, name, description, prices, note, featured, position)
select m.id, v.subgroup, v.name, v.description, v.prices, v.note, v.featured, v.position
from m, (values
    (null, 'Muzzarella', 'Salsa, muzarrella, tomates asados y aceitunas', '[{"label": "CHICA", "value": 7000}, {"label": "GRANDE", "value": 13000}]'::jsonb, null, false, 10),
    (null, 'Doble Muzzarella', 'Salsa, doble muzarrella, tomates asados y aceitunas', '[{"label": "CHICA", "value": 7800}, {"label": "GRANDE", "value": 15100}]'::jsonb, null, false, 20),
    (null, 'Margarita', 'Salsa, muzarrella, aceite de albahaca, tomates asados y aceitunas', '[{"label": "CHICA", "value": 7200}, {"label": "GRANDE", "value": 14100}]'::jsonb, null, false, 30),
    (null, 'Fugazza', 'Salsa, muzarrella, cebolla caramelizada, tomates asados y aceitunas', '[{"label": "CHICA", "value": 7200}, {"label": "GRANDE", "value": 14200}]'::jsonb, null, false, 40),
    (null, 'Fugazza con Jamón', 'Salsa, muzarrella, cebolla caramelizada, jamón cocido, tomates asados y aceitunas', '[{"label": "CHICA", "value": 7700}, {"label": "GRANDE", "value": 14900}]'::jsonb, null, false, 50),
    (null, 'Jamón Crudo y Rúcula', 'Salsa, muzarrella, jamón crudo, rúcula, tomates asados y aceitunas negras', '[{"label": "CHICA", "value": 9000}, {"label": "GRANDE", "value": 16500}]'::jsonb, null, false, 60),
    (null, 'Napolitana', 'Salsa, muzarrella, tomate, ajo y aceitunas', '[{"label": "CHICA", "value": 7500}, {"label": "GRANDE", "value": 14500}]'::jsonb, null, false, 70),
    (null, 'Napolitana con Jamón', 'Salsa, muzarrella, tomate, ajo, jamón cocido y aceitunas', '[{"label": "CHICA", "value": 8900}, {"label": "GRANDE", "value": 15700}]'::jsonb, null, false, 80),
    (null, 'Capresse', 'Salsa, muzarrella, tomate, aceite de albahaca y aceitunas', '[{"label": "CHICA", "value": 8500}, {"label": "GRANDE", "value": 15200}]'::jsonb, null, false, 90),
    (null, 'Calabresa', 'Salsa, muzarrella, calabresa, tomates asados y aceitunas', '[{"label": "CHICA", "value": 8700}, {"label": "GRANDE", "value": 15800}]'::jsonb, null, false, 100),
    (null, 'Jamón y Morrón', 'Salsa, muzarrella, jamón cocido, morrones asados, tomates asados y aceitunas', '[{"label": "CHICA", "value": 8800}, {"label": "GRANDE", "value": 15500}]'::jsonb, null, false, 110),
    (null, 'Especial', 'Salsa, muzarrella, jamón cocido, huevo frito, morrones asados, tomates asados y aceitunas', '[{"label": "CHICA", "value": 9000}, {"label": "GRANDE", "value": 17000}]'::jsonb, null, false, 120),
    (null, '4 Quesos', 'Salsa, muzarrella, roquefort, provolone, parmesano, tomates asados y aceitunas', '[{"label": "CHICA", "value": 9100}, {"label": "GRANDE", "value": 17200}]'::jsonb, null, false, 130),
    (null, 'Roquefort y Nuez', 'Salsa, muzarrella, roquefort, nuez, tomates asados y aceitunas', '[{"label": "CHICA", "value": 8700}, {"label": "GRANDE", "value": 16000}]'::jsonb, null, false, 140),
    (null, 'Roquefort con Peras y Nuez', 'Salsa, muzarrella, roquefort, peras, miel, nuez, tomates asados y aceitunas verdes', '[{"label": "CHICA", "value": 9600}, {"label": "GRANDE", "value": 17000}]'::jsonb, null, false, 150),
    (null, 'Anchoas', 'Salsa, muzarrella, anchoas, tomates asados y aceitunas', '[{"label": "CHICA", "value": 9000}, {"label": "GRANDE", "value": 16200}]'::jsonb, null, false, 160),
    (null, 'Cantimpalo', 'Salsa, muzarrella, cantimpalo, tomates asados y aceitunas', '[{"label": "CHICA", "value": 8700}, {"label": "GRANDE", "value": 15800}]'::jsonb, null, false, 170),
    (null, 'Brócoli y Jamón', 'Salsa, muzarrella, brócoli, jamón cocido, tomates asados y aceitunas', '[{"label": "CHICA", "value": 9100}, {"label": "GRANDE", "value": 16400}]'::jsonb, null, false, 180),
    (null, 'Brócoli y Panceta', 'Salsa, muzarrella, brócoli, panceta, tomates asados y aceitunas', '[{"label": "CHICA", "value": 9300}, {"label": "GRANDE", "value": 16800}]'::jsonb, null, false, 190),
    (null, 'Choclo Asado', 'Salsa, muzarrella, choclo asado, aceite de albahaca, tomates asados y aceitunas', '[{"label": "CHICA", "value": 8200}, {"label": "GRANDE", "value": 14900}]'::jsonb, null, false, 200),
    (null, 'Choclo Asado y Queso Cremoso', 'Salsa, muzarrella, choclo asado, queso cremoso, aceite de albahaca, tomates asados y aceitunas', '[{"label": "CHICA", "value": 8600}, {"label": "GRANDE", "value": 15500}]'::jsonb, null, false, 210),
    (null, 'Panceta Ahumada', 'Salsa, muzarrella, panceta ahumada, tomates asados y aceitunas', '[{"label": "CHICA", "value": 8800}, {"label": "GRANDE", "value": 16900}]'::jsonb, null, false, 220),
    (null, 'Provolone', 'Salsa, muzarrella, provolone, tomates asados y aceitunas', '[{"label": "CHICA", "value": 8900}, {"label": "GRANDE", "value": 17000}]'::jsonb, null, false, 230),
    (null, 'Provolone con Jamón', 'Salsa, muzarrella, provolone, jamón cocido, tomates asados y aceitunas', '[{"label": "CHICA", "value": 9500}, {"label": "GRANDE", "value": 18100}]'::jsonb, null, false, 240),
    (null, 'Ananás y Cerezas', 'Salsa, muzarrella, ananás, cerezas, azúcar negra, tomates asados y aceitunas', '[{"label": "CHICA", "value": 9300}, {"label": "GRANDE", "value": 17000}]'::jsonb, null, false, 250),
    (null, 'Ananás y Jamón', 'Salsa, muzarrella, ananás, jamón cocido, azúcar negra, tomates asados y aceitunas', '[{"label": "CHICA", "value": 10200}, {"label": "GRANDE", "value": 18200}]'::jsonb, null, false, 260),
    (null, 'Champiñones', 'Salsa, muzarrella, champiñones salteados, tomates asados y aceitunas', '[{"label": "CHICA", "value": 9600}, {"label": "GRANDE", "value": 18500}]'::jsonb, null, false, 270),
    (null, 'Palmitos', 'Salsa, muzarrella, palmitos, salsa golf, tomates asados y aceitunas', '[{"label": "CHICA", "value": 10200}, {"label": "GRANDE", "value": 19500}]'::jsonb, null, false, 280),
    (null, 'Picante', 'Salsa, muzarrella, ají preparado, tomates asados y aceitunas', '[{"label": "CHICA", "value": 7200}, {"label": "GRANDE", "value": 13800}]'::jsonb, null, false, 290),
    (null, 'Veggie', 'Salsa, muzarrella, brócoli, choclo asado, cebolla caramelizada, champiñones, morrones asados, tomates asados y aceitunas', '[{"label": "CHICA", "value": 10000}, {"label": "GRANDE", "value": 17200}]'::jsonb, null, false, 300),
    (null, 'Popeye', 'Salsa, muzarrella, espinaca con aceite de ajo suave, manteca en cubitos, cebolla crocante, tomates asados y aceitunas', '[{"label": "CHICA", "value": 8900}, {"label": "GRANDE", "value": 16200}]'::jsonb, null, false, 310),
    (null, 'Porteña', 'Pizza de molde, salsa, ½ kg muzarrella, tomates asados y aceitunas', '[{"label": "GRANDE", "value": 19500}]'::jsonb, null, false, 320),
    (null, 'A Puro Huevo', 'Salsa, muzarrella, rodajas de huevo, panceta crocante, cebolla morada, tomates asados y aceitunas', '[{"label": "CHICA", "value": 9300}, {"label": "GRANDE", "value": 17300}]'::jsonb, null, false, 330),
    (null, 'Un Viaje de Papas', 'Salsa, muzarrella, mini papas pay, tomates asados y aceitunas', '[{"label": "CHICA", "value": 8600}, {"label": "GRANDE", "value": 14100}]'::jsonb, '+ alioli $600', false, 340),
    (null, 'Burrata y Mortadela', 'Salsa, muzarrella, mortadela con pistacho, burrata, tomates asados y aceitunas negras', '[{"label": "CHICA", "value": 10800}, {"label": "GRANDE", "value": 19800}]'::jsonb, null, false, 350),
    (null, 'Burrata y Jamón Crudo', 'Salsa, muzarrella, jamón crudo, burrata, rúcula, tomates asados y aceitunas negras', '[{"label": "CHICA", "value": 12300}, {"label": "GRANDE", "value": 22600}]'::jsonb, null, false, 360),
    (null, 'Carne', 'Salsa, muzarrella, carne braseada, cebolla caramelizada, hierbas, tomates asados y aceitunas', '[{"label": "CHICA", "value": 11600}, {"label": "GRANDE", "value": 21300}]'::jsonb, null, false, 370),
    (null, 'Cherry Bocconcinos', 'Salsa, muzarrella, cherrys asados, bocconcinos, pesto de albahaca y nuez, tomates asados y aceitunas', '[{"label": "CHICA", "value": 11900}, {"label": "GRANDE", "value": 21800}]'::jsonb, null, false, 380),
    (null, 'Chayera', 'Salsa, muzarrella, tomates cherry, aceite de albahaca, bolitas de muzzarella crocantes, tomates asados y aceitunas', '[{"label": "CHICA", "value": 10200}, {"label": "GRANDE", "value": 17500}]'::jsonb, null, false, 390),
    (null, 'Box Degustación de Pizzas', '9 pizzetas para compartir: Napolitana · Calabresa · Muzza · Capresse · Fugazza · Cantimpalo · 4 Quesos · Jamón y Morrón · Panceta', '[{"label": "", "value": 19800}]'::jsonb, null, true, 400)
) as v(subgroup, name, description, prices, note, featured, position);

with m as (
  insert into modules (name, subtitle, layout_type, title_variant, position)
  values ('Sandwich Solo para Valientes', 'Masa de pizza · Con papas fritas · Comen entre 7 y 8 personas · Aderezo Fortunella', 'list', 'valientes', 20) returning id
)
insert into items (module_id, subgroup, name, description, prices, note, featured, position)
select m.id, v.subgroup, v.name, v.description, v.prices, v.note, v.featured, v.position
from m, (values
    (null, 'Milanesa de Carne', 'Masa de pizza, tomate, lechuga, huevo frito, jamón, queso, milanesa de carne y aderezo Fortunella', '[{"label": "", "value": 75000}]'::jsonb, null, false, 10),
    (null, 'Milanesa de Pollo', 'Masa de pizza, tomate, lechuga, huevo frito, jamón, queso, milanesa de pollo y aderezo Fortunella', '[{"label": "", "value": 70000}]'::jsonb, null, false, 20),
    (null, 'Lomito', 'Masa de pizza, tomate, lechuga, huevo frito, jamón, queso, lomo y aderezo Fortunella', '[{"label": "", "value": 85000}]'::jsonb, null, false, 30)
) as v(subgroup, name, description, prices, note, featured, position);

with m as (
  insert into modules (name, subtitle, layout_type, title_variant, position)
  values ('Focacceria', 'Sandwiches con masa de focaccia artesanal', 'list', 'orange', 30) returning id
)
insert into items (module_id, subgroup, name, description, prices, note, featured, position)
select m.id, v.subgroup, v.name, v.description, v.prices, v.note, v.featured, v.position
from m, (values
    ('Clásicos', 'Jamón Crudo', 'Jamón crudo, queso tybo, lechuga o rúcula y aderezo Fortunella', '[{"label": "", "value": 10000}]'::jsonb, null, false, 10),
    ('Clásicos', 'Jamón Cocido', 'Jamón cocido, queso tybo, lechuga, tomate y aderezo Fortunella', '[{"label": "", "value": 9300}]'::jsonb, null, false, 20),
    ('Clásicos', 'Milanesa de Carne', 'Milanesa de carne, jamón cocido, lechuga, tomate y aderezo Fortunella', '[{"label": "", "value": 11000}]'::jsonb, null, false, 30),
    ('Clásicos', 'Milanesa de Pollo', 'Milanesa de pollo, queso tybo, lechuga, tomate y aderezo Fortunella', '[{"label": "", "value": 10000}]'::jsonb, null, false, 40),
    ('Especiales', 'Mortadela', 'Mortadela con pistachos, stracciatella, pesto, tomates asados, pickles de pepino, rúcula', '[{"label": "", "value": 13000}]'::jsonb, null, false, 50),
    ('Especiales', 'Jamón Crudo Especial', 'Jamón crudo, stracciatella, rúcula, tomates asados, aderezo Fortunella y gotas de limón fresco', '[{"label": "", "value": 15500}]'::jsonb, null, false, 60),
    ('Especiales', 'Porcheta', 'Arrollado de cerdo con limón y hierbas, berenjenas al escabeche, cebollas en pickles y aderezo de mostaza', '[{"label": "", "value": 10800}]'::jsonb, null, false, 70),
    ('Especiales', 'Carne', 'Carne, cebolla en pickles, tomates asados, morrones asados, rúcula y aderezo de chimichurri', '[{"label": "", "value": 11500}]'::jsonb, null, false, 80),
    ('Especiales', 'Panceta Ahumada', 'Panceta ahumada, cebolla morada con limón, repollo morado y aderezo de tomate', '[{"label": "", "value": 10500}]'::jsonb, null, false, 90),
    ('Especiales', 'Veggie', 'Stracciatella, escabeche de berenjenas, rúcula, tomates asados y pesto', '[{"label": "", "value": 11000}]'::jsonb, null, false, 100),
    ('Especiales', 'Bondiola Braseada', 'Cerdo desmenuzado con salsa barbacoa, repollo blanco y morado al limón, pickles de cebolla morada, panceta crocante y aderezo de mostaza', '[{"label": "", "value": 13000}]'::jsonb, null, false, 110)
) as v(subgroup, name, description, prices, note, featured, position);

with m as (
  insert into modules (name, subtitle, layout_type, title_variant, position)
  values ('Empanadas', null, 'emp-table', 'default', 40) returning id
)
insert into items (module_id, subgroup, name, description, prices, note, featured, position)
select m.id, v.subgroup, v.name, v.description, v.prices, v.note, v.featured, v.position
from m, (values
    (null, 'Verduras', null, '[{"label": "UNID.", "value": 1500}, {"label": "½ DOC.", "value": 7500}, {"label": "DOC.", "value": 13000}]'::jsonb, null, false, 10),
    (null, 'Jamón y Queso', null, '[{"label": "UNID.", "value": 1700}, {"label": "½ DOC.", "value": 9000}, {"label": "DOC.", "value": 17000}]'::jsonb, null, false, 20),
    (null, 'Pollo', null, '[{"label": "UNID.", "value": 1800}, {"label": "½ DOC.", "value": 9500}, {"label": "DOC.", "value": 17000}]'::jsonb, null, false, 30),
    (null, 'Carne', null, '[{"label": "UNID.", "value": 2000}, {"label": "½ DOC.", "value": 10000}, {"label": "DOC.", "value": 19000}]'::jsonb, null, false, 40),
    (null, 'Carne Fritas', null, '[{"label": "UNID.", "value": 2000}, {"label": "½ DOC.", "value": 10000}, {"label": "DOC.", "value": 19000}]'::jsonb, null, false, 50),
    (null, 'Capresse', null, '[{"label": "UNID.", "value": 1700}, {"label": "½ DOC.", "value": 9000}, {"label": "DOC.", "value": 17000}]'::jsonb, null, false, 60),
    (null, 'Árabes', null, '[{"label": "UNID.", "value": 2500}, {"label": "½ DOC.", "value": 15000}, {"label": "DOC.", "value": 27000}]'::jsonb, null, false, 70),
    (null, 'Carne a Cuchillo', null, '[{"label": "UNID.", "value": 2300}, {"label": "½ DOC.", "value": 12000}, {"label": "DOC.", "value": 23000}]'::jsonb, null, false, 80),
    (null, 'Cebolla y Muzza', null, '[{"label": "UNID.", "value": 2300}, {"label": "½ DOC.", "value": 8500}, {"label": "DOC.", "value": 15000}]'::jsonb, null, false, 90),
    (null, 'Acelga y Provolone', null, '[{"label": "UNID.", "value": 1700}, {"label": "½ DOC.", "value": 8000}, {"label": "DOC.", "value": 15000}]'::jsonb, null, false, 100),
    (null, 'Humita', null, '[{"label": "UNID.", "value": 1900}, {"label": "½ DOC.", "value": 9800}, {"label": "DOC.", "value": 17500}]'::jsonb, null, false, 110)
) as v(subgroup, name, description, prices, note, featured, position);

with m as (
  insert into modules (name, subtitle, layout_type, title_variant, position)
  values ('Ensalada', null, 'list', 'default', 50) returning id
)
insert into items (module_id, subgroup, name, description, prices, note, featured, position)
select m.id, v.subgroup, v.name, v.description, v.prices, v.note, v.featured, v.position
from m, (values
    (null, 'Ensalada César', null, '[{"label": "", "value": 9800}]'::jsonb, null, false, 10)
) as v(subgroup, name, description, prices, note, featured, position);

with m as (
  insert into modules (name, subtitle, layout_type, title_variant, position)
  values ('Postres', null, 'postre-cards', 'default', 60) returning id
)
insert into items (module_id, subgroup, name, description, prices, note, featured, position)
select m.id, v.subgroup, v.name, v.description, v.prices, v.note, v.featured, v.position
from m, (values
    (null, 'Flan', null, '[{"label": "", "value": 3500}]'::jsonb, null, false, 10),
    (null, 'Tiramisú', null, '[{"label": "", "value": 6500}]'::jsonb, null, false, 20)
) as v(subgroup, name, description, prices, note, featured, position);

with m as (
  insert into modules (name, subtitle, layout_type, title_variant, position)
  values ('Bebidas', null, 'bebidas-grid', 'default', 70) returning id
)
insert into items (module_id, subgroup, name, description, prices, note, featured, position)
select m.id, v.subgroup, v.name, v.description, v.prices, v.note, v.featured, v.position
from m, (values
    ('Sin Alcohol', 'Agua', null, '[{"label": "", "value": 2000}]'::jsonb, null, false, 10),
    ('Sin Alcohol', 'Agua saborizada', null, '[{"label": "", "value": 3000}]'::jsonb, null, false, 20),
    ('Sin Alcohol', 'Coca Zero 500ml', null, '[{"label": "", "value": 3800}]'::jsonb, null, false, 30),
    ('Sin Alcohol', 'Coca Común 500ml', null, '[{"label": "", "value": 3800}]'::jsonb, null, false, 40),
    ('Sin Alcohol', 'Fanta 500ml', null, '[{"label": "", "value": 3800}]'::jsonb, null, false, 50),
    ('Sin Alcohol', 'Sprite 500ml', null, '[{"label": "", "value": 3800}]'::jsonb, null, false, 60),
    ('Sin Alcohol', 'Coca Común 1,5L', null, '[{"label": "", "value": 6000}]'::jsonb, null, false, 70),
    ('Sin Alcohol', 'Coca Zero 1,5L', null, '[{"label": "", "value": 6000}]'::jsonb, null, false, 80),
    ('Sin Alcohol', 'Fanta 1,5L', null, '[{"label": "", "value": 6000}]'::jsonb, null, false, 90),
    ('Sin Alcohol', 'Sprite 1,5L', null, '[{"label": "", "value": 6000}]'::jsonb, null, false, 100),
    ('Cervezas', 'Budweiser lata 473ml', null, '[{"label": "", "value": 3500}]'::jsonb, null, false, 110),
    ('Cervezas', 'Corona 330ml', null, '[{"label": "", "value": 4000}]'::jsonb, null, false, 120),
    ('Cervezas', 'Corona 710ml', null, '[{"label": "", "value": 6500}]'::jsonb, null, false, 130)
) as v(subgroup, name, description, prices, note, featured, position);
