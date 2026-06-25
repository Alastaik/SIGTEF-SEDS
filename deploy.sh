#!/bin/bash

# Atualiza o código
git pull origin main

# Build do Frontend
echo "Building Frontend..."
cd frontend
npm install
npm run build
cd ..

# Build do Backend
echo "Building Backend..."
cd backend
mvn clean package -DskipTests
cd ..

# Reinicia o serviço Spring Boot (assumindo que use Systemd na VM)
# sudo systemctl restart sigtef-backend

# Reinicia o Nginx
# sudo systemctl restart nginx

echo "Deploy finalizado!"
