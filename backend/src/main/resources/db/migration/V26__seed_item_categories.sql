-- Inserindo categorias padrão
INSERT INTO item_categories (id, name, active, created_at) VALUES 
(gen_random_uuid(), 'Laticínios', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'Grãos e Cereais', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'Hortifruti', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'Carnes e Proteínas', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'Higiene e Limpeza', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'Diversos', true, CURRENT_TIMESTAMP);
