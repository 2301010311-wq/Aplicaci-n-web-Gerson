import { prisma } from "@/lib/prisma"

async function fixRoles() {
  console.log("🔧 Corrigiendo roles en la base de datos...")

  // Mapeo de roles: MAYÚSCULAS -> Capitalizadas
  const roleMapping: Record<string, string> = {
    "ADMIN": "Admin",
    "MESERO": "Mesero",
    "COCINERO": "Cocinero",
    "CAJERO": "Cajero",
    "admin": "Admin",
    "mesero": "Mesero",
    "cocinero": "Cocinero",
    "cajero": "Cajero",
  }

  try {
    for (const [oldRole, newRole] of Object.entries(roleMapping)) {
      const count = await prisma.usuarios.updateMany({
        where: { rol: oldRole },
        data: { rol: newRole },
      })

      if (count.count > 0) {
        console.log(`✓ Actualizados ${count.count} usuarios con rol '${oldRole}' → '${newRole}'`)
      }
    }

    // Verificar que no haya roles inválidos
    const users = await prisma.usuarios.findMany({
      select: { id_user: true, correo_user: true, rol: true },
    })

    console.log("\n📋 Roles actuales en BD:")
    users.forEach((user) => {
      console.log(`  - ${user.correo_user}: ${user.rol}`)
    })

    console.log("\n✅ Roles corregidos exitosamente")
  } catch (error) {
    console.error("❌ Error al corregir roles:", error)
  } finally {
    await prisma.$disconnect()
  }
}

fixRoles()
