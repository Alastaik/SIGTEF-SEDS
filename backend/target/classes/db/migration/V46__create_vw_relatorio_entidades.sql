CREATE OR REPLACE VIEW vw_relatorio_entidades AS
SELECT 
    e.id AS entidade_id,
    e.corporate_name AS razao_social,
    e.cnpj,
    e.status AS status_entidade,
    e.created_at AS data_cadastro,
    c.id AS municipio_sede_id,
    c.name AS municipio_sede,
    r.id AS regiao_id,
    r.name AS regiao,
    -- Array or string aggregation of active programs for the entity
    (
        SELECT string_agg(DISTINCT p.name, ', ')
        FROM partnership_agreements pa 
        JOIN partnership_agreement_programs pap ON pap.partnership_agreement_id = pa.id
        JOIN programs p ON p.id = pap.program_id
        WHERE pa.legal_entity_id = e.id AND pa.status = 'ACTIVE'
    ) AS programas_ativos,
    -- Total transferred in the current month
    COALESCE(
        (
            SELECT SUM(me.transferred_value)
            FROM monthly_executions me
            JOIN partnership_agreement_programs pap ON me.partnership_agreement_program_id = pap.id
            JOIN partnership_agreements pa ON pap.partnership_agreement_id = pa.id
            WHERE pa.legal_entity_id = e.id
              AND me.competence = to_char(CURRENT_DATE, 'YYYY-MM')
        ), 0.00
    ) AS total_recebido_mes_atual,
    -- Total transferred in the current year
    COALESCE(
        (
            SELECT SUM(me.transferred_value)
            FROM monthly_executions me
            JOIN partnership_agreement_programs pap ON me.partnership_agreement_program_id = pap.id
            JOIN partnership_agreements pa ON pap.partnership_agreement_id = pa.id
            WHERE pa.legal_entity_id = e.id
              AND me.competence LIKE to_char(CURRENT_DATE, 'YYYY') || '-%'
        ), 0.00
    ) AS total_recebido_ano_atual,
    -- Total transferred ever (global)
    COALESCE(
        (
            SELECT SUM(me.transferred_value)
            FROM monthly_executions me
            JOIN partnership_agreement_programs pap ON me.partnership_agreement_program_id = pap.id
            JOIN partnership_agreements pa ON pap.partnership_agreement_id = pa.id
            WHERE pa.legal_entity_id = e.id
        ), 0.00
    ) AS total_recebido_global
FROM legal_entities e
LEFT JOIN cities c ON e.main_city_id = c.id
LEFT JOIN regions r ON c.region_id = r.id;
