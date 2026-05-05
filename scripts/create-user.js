const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

async function main() {
  const prisma = new PrismaClient()
  const email = 'nuevo@polleria.com'
  const plainPassword = 'NuevaPass123!'

  const existing = await prisma.usuarios.findUnique({ where: { correo_user: email } })
  if (existing) {
    console.log('Ya existe usuario con email:', email)
    process.exit(0)
  }

  const hashed = await bcrypt.hash(plainPassword, 10)
  const user = await prisma.usuarios.create({
    data: {
      nombre_user: 'Nuevo',
      apellido_user: 'Usuario',
      correo_user: email,
      contrasena: hashed,
      rol: 'Admin',
    },
  })

  console.log('Usuario creado con éxito:')
  console.log('Email:', email)
  console.log('Contraseña:', plainPassword)
  console.log('id_user:', user.id_user)
  await prisma.$disconnect()
}

main().catch((error) => {
  console.error('Error creando usuario:', error)
  process.exit(1)
})
