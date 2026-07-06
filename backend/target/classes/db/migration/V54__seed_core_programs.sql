-- V54__seed_core_programs.sql
-- Garante que os 3 programas principais da SEDS existam por padrão.
-- Usa INSERT ... WHERE NOT EXISTS para ser idempotente (não duplica se já existir).

-- Auxílio Energia
INSERT INTO programs (id, name, type, code, description, requires_goal, requires_service_days, requires_consumer_unit, requires_invoice, requires_receipt, requires_accountability, active, created_at)
SELECT
    gen_random_uuid(),
    'Auxílio Energia',
    'AUXILIO',
    'AUXILIO_ENERGIA',
    'Programa de auxílio para pagamento de contas de energia elétrica das entidades conveniadas com a SEDS.',
    FALSE, FALSE, TRUE, FALSE, FALSE, TRUE, TRUE, NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM programs WHERE code = 'AUXILIO_ENERGIA'
);

-- Auxílio Água/Esgoto
INSERT INTO programs (id, name, type, code, description, requires_goal, requires_service_days, requires_consumer_unit, requires_invoice, requires_receipt, requires_accountability, active, created_at)
SELECT
    gen_random_uuid(),
    'Auxílio Água/Esgoto',
    'AUXILIO',
    'AUXILIO_AGUA_ESGOTO',
    'Programa de auxílio para pagamento de contas de água e esgoto das entidades conveniadas com a SEDS.',
    FALSE, FALSE, FALSE, FALSE, FALSE, TRUE, TRUE, NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM programs WHERE code = 'AUXILIO_AGUA_ESGOTO'
);

-- Auxílio Nutricional
INSERT INTO programs (id, name, type, code, description, requires_goal, requires_service_days, requires_consumer_unit, requires_invoice, requires_receipt, requires_accountability, active, created_at)
SELECT
    gen_random_uuid(),
    'Auxílio Nutricional',
    'AUXILIO',
    'AUXILIO_NUTRICIONAL',
    'Programa de auxílio para custeio de alimentação/nutrição das entidades conveniadas com a SEDS.',
    FALSE, FALSE, FALSE, FALSE, FALSE, TRUE, TRUE, NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM programs WHERE code = 'AUXILIO_NUTRICIONAL'
);
