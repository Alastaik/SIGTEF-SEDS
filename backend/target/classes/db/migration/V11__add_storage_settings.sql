-- V11__add_storage_settings.sql
-- Inserindo as novas chaves de configuração do Módulo 02 para Storage e Expurgo

INSERT INTO system_settings (setting_key, category, setting_value, data_type, description)
VALUES
    ('anexos.storage.modo', 'STORAGE', 'LOCAL_FILESYSTEM', 'STRING', 'Modo de armazenamento dos anexos (LOCAL_FILESYSTEM, S3, R2)'),
    ('anexos.diretorio_base', 'STORAGE', '/data/sistema/anexos', 'STRING', 'Diretório base para salvar arquivos locais'),
    
    ('anexos.retencao_pdf_imagem_dias', 'STORAGE', '90', 'INTEGER', 'Dias para reter arquivos pesados de NF-e'),
    ('anexos.retencao_comprovante_dias', 'STORAGE', '90', 'INTEGER', 'Dias para reter comprovantes de pagamento'),
    ('anexos.retencao_xml_nfe_dias', 'STORAGE', '1825', 'INTEGER', 'Dias para reter o XML da NF-e (Padrão 5 anos)'),
    
    ('anexos.xml.compactar', 'STORAGE', 'true', 'BOOLEAN', 'Compactar XMLs após upload'),
    ('anexos.expurgo_automatico', 'STORAGE', 'true', 'BOOLEAN', 'Ativar expurgo automático diário'),
    ('anexos.expurgo_horario', 'STORAGE', '02:00', 'STRING', 'Horário em que o Cron de expurgo rodará'),
    ('anexos.disco_minimo_livre_gb', 'STORAGE', '30', 'INTEGER', 'Alerta se o disco livre cair abaixo deste limite (GB)'),
    
    ('upload.xml.max_mb', 'UPLOAD', '2', 'INTEGER', 'Tamanho máximo de um arquivo XML (MB)'),
    ('upload.pdf.max_mb', 'UPLOAD', '5', 'INTEGER', 'Tamanho máximo de um PDF (MB)'),
    ('upload.imagem.max_mb', 'UPLOAD', '5', 'INTEGER', 'Tamanho máximo de imagem (MB)'),
    ('upload.prestacao.total_max_mb', 'UPLOAD', '40', 'INTEGER', 'Limite total padrão de upload por prestação'),
    ('upload.prestacao.total_excecao_mb', 'UPLOAD', '100', 'INTEGER', 'Limite de upload estendido por prestação');
