#!/bin/bash
# Script de Implantação para Oracle Cloud VM (Oracle Linux / Ubuntu)

echo "Verificando se o Docker está instalado..."
if ! [ -x "$(command -v docker)" ]; then
  echo "Docker não encontrado. Instalando..."
  # Tenta instalar via apt (Ubuntu/Debian) ou dnf/yum (Oracle Linux/CentOS)
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
  echo "Docker instalado. Você pode precisar deslogar e logar novamente."
fi

echo "Iniciando a stack via Docker Compose..."
# Força o rebuild das imagens (importante se houve atualização no código local)
sudo docker-compose up -d --build

echo "Limpeza de imagens órfãs (opcional)..."
sudo docker image prune -f

echo "✅ Implantação concluída com sucesso!"
echo "Acesse o sistema na porta 80 (ou via DNS configurado)."
echo "Para verificar os logs do backend: sudo docker logs sigtef_backend -f"
echo "Para verificar os logs do frontend: sudo docker logs sigtef_frontend -f"
