import { PrismaClient, Role } from "@prisma/client"
import { hashSync } from "bcryptjs"

// Inicializa el cliente de Prisma
const prisma = new PrismaClient()

/**
 * Función principal para sembrar la base de datos con datos iniciales.
 * Utiliza `upsert` para evitar errores de duplicados si el script se ejecuta varias veces.
 */
async function main() {
  console.log("🌱 Comenzando el sembrado de la base de datos...")

  // --- 1. Creación de Usuarios ---
  console.log("👤 Creando o actualizando usuarios...")

  const admin = await prisma.user.upsert({
    where: { email: "admin@gerson.com" },
    update: {},
    create: {
      name: "Administrador del Sistema",
      email: "admin@gerson.com",
      password: hashSync("Admin123!", 10),
      role: Role.ADMIN, // Asigna el rol de Administrador
    },
  })
  console.log(`✅ Usuario Administrador creado/actualizado: ${admin.email}`)

  const cocinero = await prisma.user.upsert({
    where: { email: "cocinero@gerson.com" },
    update: {},
    create: {
      name: "Jefe de Cocina",
      email: "cocinero@gerson.com",
      password: hashSync("Cocinero123!", 10),
      role: Role.COCINERO, // Asigna el rol de Cocinero
    },
  })
  console.log(`✅ Usuario Cocinero creado/actualizado: ${cocinero.email}`)

  const mesero = await prisma.user.upsert({
    where: { email: "mesero@gerson.com" },
    update: {},
    create: {
      name: "Mesero Principal",
      email: "mesero@gerson.com",
      password: hashSync("Mesero123!", 10),
      role: Role.MESERO, // Asigna el rol de Mesero
    },
  })
  console.log(`✅ Usuario Mesero creado/actualizado: ${mesero.email}`)

  // --- 2. Creación de Mesas de Prueba ---
  console.log("\n🍽️  Creando o actualizando mesas de prueba...")
  // Usamos una transacción para asegurar que todas las mesas se creen o ninguna.
  await prisma.$transaction(
    Array.from({ length: 6 }, (_, i) =>
      prisma.mesa.upsert({
        where: { numero_mesa: i + 1 },
        update: {},
        create: {
          numero_mesa: i + 1,
          capacidad_mesa: 4,
          estado_mesa: "Libre",
        },
      })
    )
  )
  console.log("✅ 6 mesas creadas/actualizadas.")

  // --- 3. Creación de Productos de Prueba ---
  console.log("\n🍗 Creando o actualizando productos de prueba...")
  const productos = [
    { nombre: "Pollo a la Brasa", precio: 25.0, categoria: "Platos", diasVencimiento: 30 },
    { nombre: "Medio Pollo", precio: 18.0, categoria: "Platos", diasVencimiento: 30 },
    { nombre: "Cuarto de Pollo", precio: 12.0, categoria: "Platos", diasVencimiento: 30 },
    { nombre: "Arroz con Pollo", precio: 20.0, categoria: "Platos", diasVencimiento: 30 },
    { nombre: "Papas Fritas", precio: 8.0, categoria: "Acompañamientos", diasVencimiento: 7 },
    { nombre: "Ensalada", precio: 10.0, categoria: "Acompañamientos", diasVencimiento: 3 },
    { nombre: "Gaseosa Pequeña", precio: 3.0, categoria: "Bebidas", diasVencimiento: 365 },
    { nombre: "Gaseosa Grande", precio: 5.0, categoria: "Bebidas", diasVencimiento: 365 },
    { nombre: "Agua", precio: 2.0, categoria: "Bebidas", diasVencimiento: 365 },
    { nombre: "Cerveza", precio: 8.0, categoria: "Bebidas", diasVencimiento: 180 },
  ]

  await prisma.$transaction(
    productos.map((producto) => {
      const vencimiento = new Date()
      vencimiento.setDate(vencimiento.getDate() + producto.diasVencimiento)

      return prisma.producto.upsert({
        where: { nombre_produc: producto.nombre },
        update: {
          precio_produc: producto.precio,
          categoria_produc: producto.categoria,
        },
        create: {
          nombre_produc: producto.nombre,
          precio_produc: producto.precio,
          categoria_produc: producto.categoria,
          estado_produc: "Activo",
          vencimiento_produc: vencimiento,
        },
      })
    })
  )
  console.log(`✅ ${productos.length} productos creados/actualizados.`)

  console.log("\n🎉 Sembrado completado exitosamente!")
}

// Ejecuta la función principal y maneja errores
main()
  .catch((e) => {
    console.error("❌ Error durante el sembrado:", e)
    process.exit(1)
  })
  .finally(async () => {
    // Cierra la conexión a la base de datos
    console.log("🔌 Desconectando Prisma Client...")
    await prisma.$disconnect()
  })
