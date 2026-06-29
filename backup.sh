#!/bin/bash
# script: backup.sh
# description: Script para rotina de backup (Banco de dados e Uploads) da aplicação SIGTEF
# Execução sugerida no Crontab (rodar todo dia as 02:00 da manhã):
# 0 2 * * * /opt/sigtef/backup.sh >> /var/log/sigtef-backup.log 2>&1

# Variáveis
BACKUP_DIR="/var/backups/sigtef"
DB_CONTAINER="sigtef_postgres"
DB_USER="sigtef_user"
DB_NAME="sigtef_db"
UPLOADS_DIR="./backend/uploads"
DATE=$(date +"%Y%m%d_%H%M%S")
RETENTION_DAYS=7

# Criar pasta de backup se não existir
mkdir -p "$BACKUP_DIR"

echo "[$(date)] Iniciando rotina de backup SIGTEF..."

# 1. Backup do Banco de Dados PostgreSQL (pg_dump via Docker)
DB_BACKUP_FILE="$BACKUP_DIR/db_sigtef_$DATE.sql.gz"
echo "[$(date)] Gerando dump do banco de dados..."
docker exec -t $DB_CONTAINER pg_dump -U $DB_USER $DB_NAME | gzip > "$DB_BACKUP_FILE"

if [ $? -eq 0 ]; then
  echo "[$(date)] Backup do banco de dados concluído com sucesso: $DB_BACKUP_FILE"
else
  echo "[$(date)] ERRO: Falha ao fazer o backup do banco de dados."
  exit 1
fi

# 2. Backup dos arquivos de upload (Documentos, fotos, etc)
UPLOADS_BACKUP_FILE="$BACKUP_DIR/uploads_sigtef_$DATE.tar.gz"
echo "[$(date)] Compactando arquivos de uploads..."
if [ -d "$UPLOADS_DIR" ]; then
  tar -czf "$UPLOADS_BACKUP_FILE" -C "$(dirname $UPLOADS_DIR)" "$(basename $UPLOADS_DIR)"
  if [ $? -eq 0 ]; then
    echo "[$(date)] Backup de arquivos concluído com sucesso: $UPLOADS_BACKUP_FILE"
  else
    echo "[$(date)] ERRO: Falha ao fazer o backup de uploads."
  fi
else
  echo "[$(date)] AVISO: Pasta de uploads ($UPLOADS_DIR) não encontrada. Ignorando."
fi

# 3. Expurgo de Backups Antigos (Limpeza de retenção local)
echo "[$(date)] Executando retenção: Removendo backups mais antigos que $RETENTION_DAYS dias..."
find "$BACKUP_DIR" -type f -name "*.gz" -mtime +$RETENTION_DAYS -exec rm -f {} \;
echo "[$(date)] Expurgo concluído."

# 4. Integração Cloud (Opcional - Oracle Cloud OCI CLI / AWS S3)
# Descomente e configure conforme necessário:
# echo "[$(date)] Enviando backups para o Object Storage (OCI)..."
# oci os object put -ns <namespace> -bn sigtef-backups --name db_sigtef_$DATE.sql.gz --file "$DB_BACKUP_FILE" --force

echo "[$(date)] Rotina de backup finalizada com sucesso."
