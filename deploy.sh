#!/bin/bash
# Script de Implantação Otimizado para Oracle Cloud VM (Oracle Linux / Ubuntu)

# 1. Checa a presença do arquivo .env
if [ ! -f .env ]; then
  echo "ERRO: O arquivo .env não foi encontrado!"
  echo "Copie o .env.example para .env e configure as variáveis antes de rodar o script."
  exit 1
fi

echo "Verificando se o Docker está instalado..."
if ! [ -x "$(command -v docker)" ]; then
  echo "Docker não encontrado. Instalando..."
  if [ -x "$(command -v apt-get)" ]; then
    sudo apt-get update
    sudo apt-get install -y docker.io docker-compose
  elif [ -x "$(command -v dnf)" ]; then
    sudo dnf install -y docker docker-compose-plugin
  else
    sudo yum install -y docker
  fi
  
  sudo systemctl start docker
  sudo systemctl enable docker
  sudo usermod -aG docker $USER
  echo "Docker instalado. Faça logout e login novamente para aplicar permissões."
fi

echo "Configurando regras de Firewall (Oracle VM default iptables)..."
# Oracle Cloud bloqueia as portas HTTP e HTTPS no iptables da instância
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
sudo netfilter-persistent save 2>/dev/null || echo "Aviso: netfilter-persistent não encontrado. As regras de iptables podem sumir ao reiniciar a VM."

echo "Garantindo diretórios e permissões do Block Volume e Certbot..."
mkdir -p ./backend/logs
sudo mkdir -p /data/postgres
sudo mkdir -p /data/uploads
sudo mkdir -p /data/backups
mkdir -p ./certbot/conf
mkdir -p ./certbot/www

sudo chmod -R 750 ./backend/logs
sudo chmod -R 750 /data/postgres
sudo chmod -R 750 /data/uploads
sudo chmod -R 750 /data/backups
sudo chmod -R 750 ./certbot/www

echo "Iniciando a stack via Docker Compose..."
# Subimos os containers
sudo docker-compose up -d --build

echo "Limpeza de imagens órfãs..."
sudo docker image prune -f

echo "=========================================================="
echo "✅ Implantação concluída com sucesso!"
echo "Acesse o sistema no domínio que você configurou."
echo ""
echo "🔐 Dica de HTTPS / SSL:"
echo "Para ativar o SSL no Certbot pela primeira vez, rode:"
echo "  sudo docker run -it --rm --name certbot \\"
echo "    -v \"./certbot/conf:/etc/letsencrypt\" \\"
echo "    -v \"./certbot/www:/var/www/certbot\" \\"
echo "    certbot/certbot certonly --webroot -w /var/www/certbot -d SEU_DOMINIO"
echo "Em seguida, descomente as linhas do SSL no nginx.conf e reinicie o container do nginx."
echo "=========================================================="
