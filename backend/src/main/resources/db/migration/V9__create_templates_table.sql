-- V9__create_templates_table.sql

CREATE TABLE system_templates (
    template_key VARCHAR(100) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    subject VARCHAR(255),
    content TEXT NOT NULL,
    variables_description TEXT
);

-- Seed de templates iniciais

INSERT INTO system_templates (template_key, name, subject, content, variables_description) VALUES
('email.recuperacao_senha', 'E-mail de Recuperação de Senha', 'SIGTEF - Recuperação de Senha', 'Olá {{nome}},\n\nRecebemos uma solicitação para redefinir sua senha no sistema SIGTEF.\nSe foi você quem fez o pedido, clique no link abaixo para criar uma nova senha:\n\n{{link}}\n\nSe você não fez essa solicitação, pode ignorar este e-mail de forma segura.\n\nAtenciosamente,\nEquipe SIGTEF', '{{nome}} = Nome do Usuário\n{{link}} = URL de Recuperação com o Token'),

('email.convite_usuario', 'E-mail de Convite para Novo Usuário', 'SIGTEF - Convite de Acesso', 'Olá {{nome}},\n\nVocê foi convidado a participar do sistema SIGTEF do Órgão SEDS.\nPara ativar sua conta e cadastrar sua senha, clique no link abaixo:\n\n{{link}}\n\nBem-vindo!', '{{nome}} = Nome do Convidado\n{{link}} = URL de Ativação do Convite');

-- Tabela de auditoria para system_templates
CREATE TABLE system_templates_aud (
    template_key VARCHAR(100) NOT NULL,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    name VARCHAR(100),
    subject VARCHAR(255),
    content TEXT,
    variables_description TEXT,
    PRIMARY KEY (template_key, rev),
    CONSTRAINT fk_system_templates_aud_revinfo FOREIGN KEY (rev) REFERENCES revinfo (rev)
);
