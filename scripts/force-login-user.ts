import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

async function main() {
  const email = "demo@gerson.com"
  const plainPassword = "Demo123!"
  const passwordHash = await bcrypt.hash(plainPassword, 10)

  const existingUser = await prisma.usuarios.findUnique({
    where: { correo_user: email },
  })

  if (existingUser) {
    await prisma.usuarios.update({
      where: { id_user: existingUser.id_user },
      data: {
        nombre_user: "Demo",
        apellido_user: "User",
        contrasena: passwordHash,
        rol: "Admin",
      },
    })
    console.log("User updated for login test")
  } else {
    await prisma.usuarios.create({
      data: {
        nombre_user: "Demo",
        apellido_user: "User",
        correo_user: email,
        contrasena: passwordHash,
        rol: "Admin",
      },
    })
    console.log("User created for login test")
  }

  console.log("Login credentials:")
  console.log(`Email: ${email}`)
  console.log(`Password: ${plainPassword}`)
}

main()
  .catch((error) => {
    console.error("Failed to create/update login user", error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
