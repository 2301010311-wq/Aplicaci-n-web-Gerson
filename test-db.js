const { PrismaClient } = require('@prisma/client')

async function testDatabase() {
  const prisma = new PrismaClient()

  try {
    console.log('🔍 Probando conexión a base de datos...')

    // Test básico de conexión
    const result = await prisma.$queryRaw`SELECT 1 as test`
    console.log('✅ Conexión exitosa:', result)

    // Test productos
    const productos = await prisma.productos.findMany({ take: 1 })
    console.log('✅ Tabla productos OK, registros encontrados:', productos.length)

    // Test pedidos
    const pedidos = await prisma.pedidos.findMany({ take: 1 })
    console.log('✅ Tabla pedidos OK, registros encontrados:', pedidos.length)

    // Test detallepedido
    const detalles = await prisma.detallepedido.findMany({ take: 1 })
    console.log('✅ Tabla detallepedido OK, registros encontrados:', detalles.length)

    console.log('🎉 Todas las pruebas pasaron exitosamente!')

  } catch (error) {
    console.error('❌ Error en pruebas:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

testDatabase()