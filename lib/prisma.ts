import { PrismaClient } from "@prisma/client"
import { buildDatabaseUrlFromEnv } from "@/lib/database-url"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: buildDatabaseUrlFromEnv(),
    // Configuración de conexión mejorada para Neon
    errorFormat: "pretty",
  })

// Reconectar automáticamente en caso de desconexión
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}

// Manejar desconexiones gracefully
if (typeof window === "undefined") {
  process.on("SIGTERM", async () => {
    await prisma.$disconnect()
  })

  process.on("SIGINT", async () => {
    await prisma.$disconnect()
  })
}

// Middleware para reintentar en caso de error de conexión
prisma.$use(async (params, next) => {
  let retries = 0
  const maxRetries = 3

  while (retries < maxRetries) {
    try {
      return await next(params)
    } catch (error: any) {
      retries++

      // Si es un error de conexión y no hemos agotado reintentos
      if (
        (error.code === "P1001" || error.code === "ECONNREFUSED") &&
        retries < maxRetries
      ) {
        const delay = Math.pow(2, retries) * 100 // Exponential backoff
        await new Promise((resolve) => setTimeout(resolve, delay))
        continue
      }

      // Si no es un error de conexión o agotamos reintentos, lanzar error
      throw error
    }
  }
})
