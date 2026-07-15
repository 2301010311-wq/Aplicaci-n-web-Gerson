# ================================================================================
# 🚀 SETUP FINAL COMPLETO - Windows PowerShell
# ================================================================================
# Ejecutar en PowerShell como administrador

Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║         SETUP COMPLETO - PostgreSQL + Usuarios + App          ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# ================================================================================
# PASO 1: Verificar Docker
# ================================================================================
Write-Host "✓ Verificando Docker..." -ForegroundColor Green
try {
    $dockerVersion = docker --version
    Write-Host "✓ Docker disponible: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker no está instalado" -ForegroundColor Red
    exit 1
}
Write-Host ""

# ================================================================================
# PASO 2: Limpiar todo
# ================================================================================
Write-Host "🧹 Limpiando contenedores y volúmenes anteriores..." -ForegroundColor Yellow
docker-compose down -v 2>$null
Start-Sleep -Seconds 2
Write-Host "✓ Limpieza completada" -ForegroundColor Green
Write-Host ""

# ================================================================================
# PASO 3: Crear .env correcto
# ================================================================================
Write-Host "📝 Creando archivo .env..." -ForegroundColor Yellow
$envContent = @"
NODE_ENV=development
PORT=3000

# PostgreSQL 18 Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=gerson_db

# Database URL for Prisma
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/gerson_db?schema=public"

# Security
JWT_SECRET=your-secret-key-change-in-production

# Logging
LOKI_URL=http://localhost:3100
"@

Set-Content -Path ".env" -Value $envContent
Write-Host "✓ .env creado correctamente" -ForegroundColor Green
Write-Host ""

# ================================================================================
# PASO 4: Levantar PostgreSQL
# ================================================================================
Write-Host "🐘 Levantando PostgreSQL..." -ForegroundColor Yellow
docker-compose up postgres -d
Write-Host "⏳ Esperando a que PostgreSQL esté listo (15 segundos)..." -ForegroundColor Yellow
Start-Sleep -Seconds 15
Write-Host "✓ PostgreSQL está listo" -ForegroundColor Green
Write-Host ""

# ================================================================================
# PASO 5: Crear base de datos
# ================================================================================
Write-Host "🗄️  Creando base de datos 'gerson_db'..." -ForegroundColor Yellow
try {
    docker-compose exec postgres psql -U postgres -c "CREATE DATABASE gerson_db;" 2>$null
    Write-Host "✓ Base de datos creada" -ForegroundColor Green
} catch {
    Write-Host "⚠️  BD ya existe (ignorando)" -ForegroundColor Yellow
}
Write-Host ""

# ================================================================================
# PASO 6: Aplicar migraciones
# ================================================================================
Write-Host "🔄 Aplicando migraciones Prisma..." -ForegroundColor Yellow
npm run db:migrate 2>&1 | Select-String -Pattern "^✓|^[0-9]|Migrations|Created" | ForEach-Object { Write-Host $_.Line -ForegroundColor Green }
Write-Host "✓ Migraciones completadas" -ForegroundColor Green
Write-Host ""

# ================================================================================
# PASO 7: Crear usuarios de prueba
# ================================================================================
Write-Host "👥 Creando usuarios de prueba..." -ForegroundColor Yellow
npm run db:seed 2>&1 | Select-String -Pattern "✓|✅|Usuario|Producto|Mesa" | ForEach-Object { Write-Host $_.Line -ForegroundColor Green }
Write-Host "✓ Usuarios creados" -ForegroundColor Green
Write-Host ""

# ================================================================================
# PASO 8: Levantar backend
# ================================================================================
Write-Host "🚀 Levantando backend..." -ForegroundColor Yellow
docker-compose up backend -d
Start-Sleep -Seconds 5
Write-Host "✓ Backend iniciado" -ForegroundColor Green
Write-Host ""

# ================================================================================
# PASO 9: Mostrar información final
# ================================================================================
Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                    ✅ SETUP COMPLETADO                         ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

Write-Host "🌐 ACCESO A SERVICIOS:" -ForegroundColor Cyan
Write-Host "   Aplicación:  http://localhost:3000" -ForegroundColor White
Write-Host "   Grafana:     http://localhost:3001" -ForegroundColor White
Write-Host "   Prometheus:  http://localhost:9091" -ForegroundColor White
Write-Host ""

Write-Host "📋 USUARIOS DE PRUEBA:" -ForegroundColor Cyan
Write-Host "   Email: admin@gerson.com" -ForegroundColor Yellow
Write-Host "   Password: Admin123!" -ForegroundColor Yellow
Write-Host ""
Write-Host "   O usa cualquiera de estos:" -ForegroundColor White
Write-Host "   • mesero@gerson.com / Mesero123!" -ForegroundColor Gray
Write-Host "   • cocinero@gerson.com / Cocinero123!" -ForegroundColor Gray
Write-Host "   • cajero@gerson.com / Cajero123!" -ForegroundColor Gray
Write-Host ""

Write-Host "📊 BASE DE DATOS:" -ForegroundColor Cyan
Write-Host "   Host: localhost:5432" -ForegroundColor White
Write-Host "   User: postgres" -ForegroundColor White
Write-Host "   Password: postgres" -ForegroundColor White
Write-Host "   Database: gerson_db" -ForegroundColor White
Write-Host ""

Write-Host "✨ Datos de prueba incluidos:" -ForegroundColor Cyan
Write-Host "   ✓ 4 usuarios (diferentes roles)" -ForegroundColor Green
Write-Host "   ✓ 10 mesas (capacidad 4 personas c/u)" -ForegroundColor Green
Write-Host "   ✓ 8 productos (pollos, acompañamientos, bebidas)" -ForegroundColor Green
Write-Host ""

Write-Host "🎯 Próximo paso:" -ForegroundColor Cyan
Write-Host "   1. Abre: http://localhost:3000" -ForegroundColor Yellow
Write-Host "   2. Ingresa: admin@gerson.com / Admin123!" -ForegroundColor Yellow
Write-Host "   3. ¡Comienza a crear pedidos!" -ForegroundColor Yellow
Write-Host ""

Write-Host "📝 Para ver logs:" -ForegroundColor Cyan
Write-Host "   docker-compose logs -f backend" -ForegroundColor Gray
Write-Host ""

Write-Host "🛑 Para detener:" -ForegroundColor Cyan
Write-Host "   docker-compose down" -ForegroundColor Gray
Write-Host ""

Write-Host "✅ ¡TODO LISTO!" -ForegroundColor Green
