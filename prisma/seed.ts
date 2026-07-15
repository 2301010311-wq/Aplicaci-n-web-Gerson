import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed de datos...')

  // Limpiar datos existentes (opcional)
  console.log('🗑️  Limpiando datos existentes...')
  await prisma.usuarios.deleteMany({})
  await prisma.mesas.deleteMany({})
  await prisma.productos.deleteMany({})

  // Crear usuarios de prueba
  console.log('👥 Creando usuarios de prueba...')
  
  const usuarios = [
    {
      nombre_user: 'Administrador',
      apellido_user: 'Sistema',
      correo_user: 'admin@gerson.com',
      dni_user: '12345678',
      telefono_user: '0987654321',
      rol: 'Admin',
      password: 'Admin123!',
    },
    {
      nombre_user: 'Mesero',
      apellido_user: 'Prueba',
      correo_user: 'mesero@gerson.com',
      dni_user: '87654321',
      telefono_user: '0912345678',
      rol: 'Mesero',
      password: 'Mesero123!',
    },
    {
      nombre_user: 'Cocinero',
      apellido_user: 'Jefe',
      correo_user: 'cocinero@gerson.com',
      dni_user: '11111111',
      telefono_user: '0911111111',
      rol: 'Cocinero',
      password: 'Cocinero123!',
    },
    {
      nombre_user: 'Cajero',
      apellido_user: 'Caja',
      correo_user: 'cajero@gerson.com',
      dni_user: '22222222',
      telefono_user: '0922222222',
      rol: 'Cajero',
      password: 'Cajero123!',
    },
  ]

  for (const usuario of usuarios) {
    // Hash de la contraseña
    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(usuario.password, saltRounds)

    const created = await prisma.usuarios.create({
      data: {
        nombre_user: usuario.nombre_user,
        apellido_user: usuario.apellido_user,
        correo_user: usuario.correo_user,
        dni_user: usuario.dni_user,
        telefono_user: usuario.telefono_user,
        rol: usuario.rol,
        contrasena: hashedPassword,
      },
    })

    console.log(`✓ Usuario creado: ${created.correo_user} (${created.rol})`)
    console.log(`  📧 Email: ${created.correo_user}`)
    console.log(`  🔐 Password: ${usuario.password}`)
  }

  // Crear mesas de prueba
  console.log('\n🪑 Creando mesas...')
  
  for (let i = 1; i <= 10; i++) {
    const mesa = await prisma.mesas.create({
      data: {
        numero_mesa: i,
        capacidad_mesa: 4,
        estado_mesa: 'Libre',
      },
    })
    console.log(`✓ Mesa ${mesa.numero_mesa} creada (capacidad: ${mesa.capacidad_mesa})`)
  }

  // Crear productos de prueba
  console.log('\n🍗 Creando productos...')
  
  const productos = [
    {
      nombre_produc: 'Pollo Rostizado 1/4',
      descripcion_produc: 'Pollo fresco rostizado al carbón',
      precio_produc: 8.50,
      categoria_produc: 'Pollo',
      stock_produc: 50,
      vencimiento_produc: new Date('2026-12-31'),
    },
    {
      nombre_produc: 'Pollo Rostizado 1/2',
      descripcion_produc: 'Media gallina rostizada al carbón',
      precio_produc: 15.00,
      categoria_produc: 'Pollo',
      stock_produc: 40,
      vencimiento_produc: new Date('2026-12-31'),
    },
    {
      nombre_produc: 'Pollo Rostizado Completo',
      descripcion_produc: 'Pollo completo fresco rostizado',
      precio_produc: 25.00,
      categoria_produc: 'Pollo',
      stock_produc: 30,
      vencimiento_produc: new Date('2026-12-31'),
    },
    {
      nombre_produc: 'Papas Fritas',
      descripcion_produc: 'Papas fritas caseras',
      precio_produc: 2.50,
      categoria_produc: 'Acompañamientos',
      stock_produc: 100,
      vencimiento_produc: new Date('2026-12-31'),
    },
    {
      nombre_produc: 'Ensalada de Lechuga',
      descripcion_produc: 'Ensalada fresca con lechuga, tomate y cebolla',
      precio_produc: 3.00,
      categoria_produc: 'Ensaladas',
      stock_produc: 60,
      vencimiento_produc: new Date('2026-12-31'),
    },
    {
      nombre_produc: 'Refresco Coca Cola',
      descripcion_produc: 'Bebida gaseosa',
      precio_produc: 1.50,
      categoria_produc: 'Bebidas',
      stock_produc: 200,
      vencimiento_produc: new Date('2026-12-31'),
    },
    {
      nombre_produc: 'Cerveza Pilsener',
      descripcion_produc: 'Cerveza fría',
      precio_produc: 2.00,
      categoria_produc: 'Bebidas',
      stock_produc: 150,
      vencimiento_produc: new Date('2026-12-31'),
    },
    {
      nombre_produc: 'Jugo Natural',
      descripcion_produc: 'Jugo fresco de frutas',
      precio_produc: 2.50,
      categoria_produc: 'Bebidas',
      stock_produc: 80,
      vencimiento_produc: new Date('2026-12-31'),
    },
  ]

  for (const producto of productos) {
    const created = await prisma.productos.create({
      data: {
        nombre_produc: producto.nombre_produc,
        descripcion_produc: producto.descripcion_produc,
        precio_produc: producto.precio_produc,
        categoria_produc: producto.categoria_produc,
        stock_produc: producto.stock_produc,
        vencimiento_produc: producto.vencimiento_produc,
        controlar_stock: true,
      },
    })
    console.log(
      `✓ Producto creado: ${created.nombre_produc} (S/. ${Number(created.precio_produc).toFixed(2)})`
    )
  }

  console.log('\n✅ Seed de datos completado exitosamente!')
  console.log('\n📋 Usuarios creados:')
  console.log('─'.repeat(60))
  console.log('Email                    | Password       | Rol')
  console.log('─'.repeat(60))
  console.log('admin@gerson.com         | Admin123!      | Admin')
  console.log('mesero@gerson.com        | Mesero123!     | Mesero')
  console.log('cocinero@gerson.com      | Cocinero123!   | Cocinero')
  console.log('cajero@gerson.com        | Cajero123!     | Cajero')
  console.log('─'.repeat(60))
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Error en seed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
