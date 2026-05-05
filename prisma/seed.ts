import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("Iniciando seeding de usuarios...")

  // Crear usuarios de prueba con bcryptjs
  const adminPassword = await bcrypt.hash("Admin123!", 10)
  const meseroPassword = await bcrypt.hash("Mesero123!", 10)
  const cocineroPassword = await bcrypt.hash("Cocinero123!", 10)

  // Verificar si ya existe el admin
  const existingAdmin = await prisma.usuarios.findUnique({
    where: { correo_user: "admin@gerson.com" },
  })

  if (existingAdmin) {
    // Actualizar con contraseña correcta
    await prisma.usuarios.update({
      where: { id_user: existingAdmin.id_user },
      data: { contrasena: adminPassword },
    })
    console.log("✓ Usuario admin actualizado con nueva contraseña")
  } else {
    const admin = await prisma.usuarios.create({
      data: {
        nombre_user: "Admin",
        apellido_user: "Gerson",
        correo_user: "admin@gerson.com",
        contrasena: adminPassword,
        rol: "Admin",
      },
    })
    console.log("✓ Usuario Admin creado:", admin.correo_user)
  }

  // Crear mesero de prueba
  const existingMesero = await prisma.usuarios.findUnique({
    where: { correo_user: "mesero@gerson.com" },
  })

  if (existingMesero) {
    // Actualizar con contraseña correcta
    await prisma.usuarios.update({
      where: { id_user: existingMesero.id_user },
      data: { contrasena: meseroPassword },
    })
    console.log("✓ Usuario mesero actualizado con nueva contraseña")
  } else {
    const mesero = await prisma.usuarios.create({
      data: {
        nombre_user: "Juan",
        apellido_user: "Mesero",
        correo_user: "mesero@gerson.com",
        contrasena: meseroPassword,
        rol: "Mesero",
      },
    })
    console.log("✓ Usuario Mesero creado:", mesero.correo_user)
  }

  // Crear cocinero de prueba
  const existingCocinero = await prisma.usuarios.findUnique({
    where: { correo_user: "cocinero@gerson.com" },
  })

  if (existingCocinero) {
    // Actualizar con contraseña correcta
    await prisma.usuarios.update({
      where: { id_user: existingCocinero.id_user },
      data: { contrasena: cocineroPassword },
    })
    console.log("✓ Usuario cocinero actualizado con nueva contraseña")
  } else {
    const cocinero = await prisma.usuarios.create({
      data: {
        nombre_user: "Carlos",
        apellido_user: "Cocinero",
        correo_user: "cocinero@gerson.com",
        contrasena: cocineroPassword,
        rol: "Cocinero",
      },
    })
    console.log("✓ Usuario Cocinero creado:", cocinero.correo_user)
  }

  console.log("\n✓ Seeding completado!")
  console.log("\nCredenciales de prueba:")
  console.log("═══════════════════════════════════════")
  console.log("Admin:")
  console.log("  Email: admin@gerson.com")
  console.log("  Contraseña: Admin123!")
  console.log("─────────────────────────────────────")
  console.log("Mesero:")
  console.log("  Email: mesero@gerson.com")
  console.log("  Contraseña: Mesero123!")
  console.log("─────────────────────────────────────")
  console.log("Cocinero:")
  console.log("  Email: cocinero@gerson.com")
  console.log("  Contraseña: Cocinero123!")
  console.log("═══════════════════════════════════════")

  // Crear mesas de prueba
  console.log("\n\nCreando mesas de prueba...")
  const existingMesas = await (prisma as any).mesas.findMany()
  
  if (existingMesas.length === 0) {
    for (let i = 1; i <= 6; i++) {
      await (prisma as any).mesas.create({
        data: {
          numero_mesa: i,
          capacidad_mesa: 4,
          estado_mesa: "Libre",
        },
      })
    }
    console.log("✓ 6 mesas creadas")
  } else {
    console.log(`✓ Ya existen ${existingMesas.length} mesas`)
  }

  // Crear productos de prueba
  console.log("\nCreando productos de prueba...")
  const existingProductos = await (prisma as any).productos.findMany()
  
  if (existingProductos.length === 0) {
    const productos = [
      { nombre: "Pollo a la Brasa", precio: 25.00, categoria: "Platos", diasVencimiento: 30 },
      { nombre: "Medio Pollo", precio: 18.00, categoria: "Platos", diasVencimiento: 30 },
      { nombre: "Cuarto de Pollo", precio: 12.00, categoria: "Platos", diasVencimiento: 30 },
      { nombre: "Arroz con Pollo", precio: 20.00, categoria: "Platos", diasVencimiento: 30 },
      { nombre: "Papas Fritas", precio: 8.00, categoria: "Acompañamientos", diasVencimiento: 7 },
      { nombre: "Ensalada", precio: 10.00, categoria: "Acompañamientos", diasVencimiento: 3 },
      { nombre: "Gaseosa Pequeña", precio: 3.00, categoria: "Bebidas", diasVencimiento: 365 },
      { nombre: "Gaseosa Grande", precio: 5.00, categoria: "Bebidas", diasVencimiento: 365 },
      { nombre: "Agua", precio: 2.00, categoria: "Bebidas", diasVencimiento: 365 },
      { nombre: "Cerveza", precio: 8.00, categoria: "Bebidas", diasVencimiento: 180 },
    ]

    for (const producto of productos) {
      const vencimiento = new Date()
      vencimiento.setDate(vencimiento.getDate() + producto.diasVencimiento)
      
      await (prisma as any).productos.create({
        data: {
          nombre_produc: producto.nombre,
          precio_produc: producto.precio,
          categoria_produc: producto.categoria,
          estado_produc: "Activo",
          vencimiento_produc: vencimiento,
        },
      })
    }
    console.log(`✓ ${productos.length} productos creados`)
  } else {
    console.log(`✓ Ya existen ${existingProductos.length} productos`)
  }

  console.log("\n═══════════════════════════════════════")
  console.log("✅ Seeding completado exitosamente!")
  console.log("═══════════════════════════════════════")
}

main()
  .catch((e) => {
    console.error("Error en seeding:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
