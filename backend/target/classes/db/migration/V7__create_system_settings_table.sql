-- V7__create_system_settings_table.sql

CREATE TABLE system_settings (
    setting_key VARCHAR(100) PRIMARY KEY,
    category VARCHAR(50) NOT NULL,
    setting_value TEXT,
    data_type VARCHAR(20) NOT NULL,
    description TEXT
);

-- Seed de configurações iniciais

-- 02.01 Parâmetros gerais
INSERT INTO system_settings (setting_key, category, setting_value, data_type, description) VALUES
('sistema.nome', 'GENERAL', 'Sistema de Gestão de Termos e Prestação de Contas', 'STRING', 'Nome principal do sistema.'),
('sistema.sigla', 'GENERAL', 'SIGTEF', 'STRING', 'Sigla do sistema.'),
('sistema.orgao', 'GENERAL', 'SEDS', 'STRING', 'Órgão responsável.'),
('sistema.url_publica', 'GENERAL', 'https://sistema.dominio.gov.br', 'STRING', 'URL raiz para envio de links por e-mail.'),
('sistema.timezone', 'GENERAL', 'America/Sao_Paulo', 'STRING', 'Timezone padrão do servidor.');

-- 02.04 Uploads e documentos
INSERT INTO system_settings (setting_key, category, setting_value, data_type, description) VALUES
('upload.tamanho_maximo_mb', 'UPLOAD', '50', 'INTEGER', 'Tamanho máximo permitido por arquivo em Megabytes.'),
('upload.extensoes_permitidas', 'UPLOAD', '.pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg', 'STRING', 'Extensões permitidas separadas por vírgula.');

-- 02.05 E-mail e notificações
INSERT INTO system_settings (setting_key, category, setting_value, data_type, description) VALUES
('email.remetente', 'EMAIL', 'nao-responda@sigtef.gov.br', 'STRING', 'E-mail utilizado como remetente nos envios do sistema.'),
('email.nome_remetente', 'EMAIL', 'SIGTEF / SEDS', 'STRING', 'Nome amigável de remetente.'),
('email.provider', 'EMAIL', 'RESEND', 'STRING', 'Provedor de envio ativo.');

-- 02.06 Storage e arquivos
INSERT INTO system_settings (setting_key, category, setting_value, data_type, description) VALUES
('storage.provider', 'STORAGE', 'CLOUDFLARE_R2', 'STRING', 'Provedor de nuvem ativo.'),
('storage.bucket_principal', 'STORAGE', 'anexos-prestacao', 'STRING', 'Nome do bucket para anexos de prestações.');

-- 02.07 Segurança operacional
INSERT INTO system_settings (setting_key, category, setting_value, data_type, description) VALUES
('seguranca.max_login_attempts', 'SECURITY', '5', 'INTEGER', 'Quantidade de erros de senha permitidos antes do bloqueio.'),
('seguranca.lockout_duration_minutes', 'SECURITY', '15', 'INTEGER', 'Tempo em minutos de congelamento da conta.'),
('seguranca.token_recuperacao_horas', 'SECURITY', '2', 'INTEGER', 'Validade em horas de um link de recuperação de senha.');

-- 02.09 Feature flags
INSERT INTO system_settings (setting_key, category, setting_value, data_type, description) VALUES
('feature.portal_entidade.habilitado', 'FEATURE_FLAG', 'false', 'BOOLEAN', 'Habilita o portal público de entidades e envios.'),
('feature.upload_documentos.habilitado', 'FEATURE_FLAG', 'true', 'BOOLEAN', 'Permite que usuários enviem anexos nas telas.'),
('feature.notificacoes_email.habilitado', 'FEATURE_FLAG', 'true', 'BOOLEAN', 'Ativa o envio de e-mails em todo o sistema.'),
('feature.modo_manutencao.habilitado', 'FEATURE_FLAG', 'false', 'BOOLEAN', 'Coloca o sistema inteiro em modo de manutenção.');

-- Criação da tabela de auditoria para system_settings
CREATE TABLE system_settings_aud (
    setting_key VARCHAR(100) NOT NULL,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    category VARCHAR(50),
    setting_value TEXT,
    data_type VARCHAR(20),
    description TEXT,
    PRIMARY KEY (setting_key, rev),
    CONSTRAINT fk_system_settings_aud_revinfo FOREIGN KEY (rev) REFERENCES revinfo (rev)
);
