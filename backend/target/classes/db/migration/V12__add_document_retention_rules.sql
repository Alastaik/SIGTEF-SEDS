-- V12__add_document_retention_rules.sql
-- Refatoração do Módulo 03: Tipos de Documento para controle granular de expurgo

ALTER TABLE document_types
    ADD COLUMN IF NOT EXISTS categoria_documento VARCHAR(80),
    ADD COLUMN IF NOT EXISTS exige_dados_nota_fiscal BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS exige_chave_acesso_nfe BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS eh_xml_fiscal BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS eh_anexo_pesado BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS expurgavel BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS retencao_dias INT,
    ADD COLUMN IF NOT EXISTS compactar_apos_upload BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS permite_multiplos_anexos BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE document_types_aud
    ADD COLUMN IF NOT EXISTS categoria_documento VARCHAR(80),
    ADD COLUMN IF NOT EXISTS exige_dados_nota_fiscal BOOLEAN,
    ADD COLUMN IF NOT EXISTS exige_chave_acesso_nfe BOOLEAN,
    ADD COLUMN IF NOT EXISTS eh_xml_fiscal BOOLEAN,
    ADD COLUMN IF NOT EXISTS eh_anexo_pesado BOOLEAN,
    ADD COLUMN IF NOT EXISTS expurgavel BOOLEAN,
    ADD COLUMN IF NOT EXISTS retencao_dias INT,
    ADD COLUMN IF NOT EXISTS compactar_apos_upload BOOLEAN,
    ADD COLUMN IF NOT EXISTS permite_multiplos_anexos BOOLEAN;

-- Seeds Obrigatórias

-- 1. XML da NF-e
INSERT INTO document_types (id, name, code, context, categoria_documento, exige_dados_nota_fiscal, exige_chave_acesso_nfe, eh_xml_fiscal, eh_anexo_pesado, expurgavel, retencao_dias, compactar_apos_upload, permite_multiplos_anexos, active, created_at)
VALUES (gen_random_uuid(), 'XML da NF-e', 'XML_NFE', 'PRESTACAO', 'FISCAL', TRUE, TRUE, TRUE, FALSE, TRUE, 1825, TRUE, TRUE, TRUE, CURRENT_TIMESTAMP);

-- 2. DANFE / PDF
INSERT INTO document_types (id, name, code, context, categoria_documento, exige_dados_nota_fiscal, exige_chave_acesso_nfe, eh_xml_fiscal, eh_anexo_pesado, expurgavel, retencao_dias, compactar_apos_upload, permite_multiplos_anexos, active, created_at)
VALUES (gen_random_uuid(), 'DANFE / PDF da Nota Fiscal', 'DANFE_PDF', 'PRESTACAO', 'FISCAL', TRUE, TRUE, FALSE, TRUE, TRUE, 90, FALSE, TRUE, TRUE, CURRENT_TIMESTAMP);

-- 3. Imagem da Nota Fiscal
INSERT INTO document_types (id, name, code, context, categoria_documento, exige_dados_nota_fiscal, exige_chave_acesso_nfe, eh_xml_fiscal, eh_anexo_pesado, expurgavel, retencao_dias, compactar_apos_upload, permite_multiplos_anexos, active, created_at)
VALUES (gen_random_uuid(), 'Imagem da Nota Fiscal', 'NOTA_FISCAL_IMAGEM', 'PRESTACAO', 'FISCAL', TRUE, FALSE, FALSE, TRUE, TRUE, 90, TRUE, TRUE, TRUE, CURRENT_TIMESTAMP);

-- 4. Comprovante de Pagamento
INSERT INTO document_types (id, name, code, context, categoria_documento, exige_dados_nota_fiscal, exige_chave_acesso_nfe, eh_xml_fiscal, eh_anexo_pesado, expurgavel, retencao_dias, compactar_apos_upload, permite_multiplos_anexos, active, created_at)
VALUES (gen_random_uuid(), 'Comprovante de Pagamento', 'COMPROVANTE_PAGAMENTO', 'PRESTACAO', 'FINANCEIRO', FALSE, FALSE, FALSE, TRUE, TRUE, 90, TRUE, TRUE, TRUE, CURRENT_TIMESTAMP);

-- Documentos Oficiais (Não Expurgáveis)
INSERT INTO document_types (id, name, code, context, categoria_documento, exige_dados_nota_fiscal, exige_chave_acesso_nfe, eh_xml_fiscal, eh_anexo_pesado, expurgavel, retencao_dias, compactar_apos_upload, permite_multiplos_anexos, active, created_at)
VALUES 
    (gen_random_uuid(), 'Termo de Fomento', 'TERMO_FOMENTO', 'TERMO', 'OFICIAL', FALSE, FALSE, FALSE, FALSE, FALSE, NULL, FALSE, FALSE, TRUE, CURRENT_TIMESTAMP),
    (gen_random_uuid(), 'Parecer Técnico', 'PARECER_TECNICO', 'PRESTACAO', 'OFICIAL', FALSE, FALSE, FALSE, FALSE, FALSE, NULL, FALSE, TRUE, TRUE, CURRENT_TIMESTAMP),
    (gen_random_uuid(), 'Relatório Final', 'RELATORIO_FINAL', 'PRESTACAO', 'OFICIAL', FALSE, FALSE, FALSE, TRUE, FALSE, NULL, FALSE, FALSE, TRUE, CURRENT_TIMESTAMP);
