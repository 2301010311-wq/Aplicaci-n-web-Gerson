import { prisma } from "@/lib/prisma"

async function main() {
  try {
    const result = await prisma.$queryRaw<{ ok: number }[]>`SELECT 1 as ok`
    console.log("Database connection OK:", result[0]?.ok === 1)
    process.exit(0)
  } catch (error) {
    console.error("Database connection FAILED")
    console.error(error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
