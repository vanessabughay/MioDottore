#!/bin/bash

echo "🚀 Iniciando MioDottore Backend..."
echo "=================================="

echo "📦 Construindo e subindo containers..."
docker-compose up --build -d

echo ""
echo "⏳ Aguardando serviços ficarem prontos..."
sleep 30

echo ""
echo "🔍 Verificando status dos serviços..."
echo ""

echo "🌐 API Gateway: http://localhost:4000/gateway-health"
curl -s http://localhost:4000/gateway-health | jq . || echo "API Gateway não está respondendo"

echo ""
echo "🔐 MS Autenticação: http://localhost:8081/health"  
curl -s http://localhost:8081/health | jq . || echo "MS Autenticação não está respondendo"

echo ""
echo "👤 MS Paciente: http://localhost:8082/health"
curl -s http://localhost:8082/health | jq . || echo "MS Paciente não está respondendo"

echo ""
echo "📅 MS Consulta: http://localhost:8083/health"
curl -s http://localhost:8083/health | jq . || echo "MS Consulta não está respondendo"

echo ""
echo "✅ Backend MioDottore iniciado!"
echo ""
echo "🔗 URLs disponíveis:"
echo "   • API Gateway: http://localhost:4000"
echo "   • MS Autenticação: http://localhost:8081"  
echo "   • MS Paciente: http://localhost:8082"
echo "   • MS Consulta: http://localhost:8083"
echo ""
echo "📚 Documentação: Consulte o README.md para endpoints da API"
echo ""
echo "🛑 Para parar: docker-compose down"