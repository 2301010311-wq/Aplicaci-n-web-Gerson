// Guarda de seguridad: las pruebas de integración solo corren contra una BD cuyo nombre termina en "_test".

export function assertTestDatabase(rawUrl: string | undefined = process.env.DATABASE_URL): void {
  let dbName = ""
  try {
    dbName = new URL(rawUrl ?? "").pathname.replace(/^\//, "")
  } catch {
    // URL vacía o inválida: dbName queda "" y se aborta abajo
  }

  if (!dbName.endsWith("_test")) {
    throw new Error(
      `ABORTADO: DATABASE_URL apunta a "${dbName || "(vacía o inválida)"}"; ` +
        `el nombre de la base de datos debe terminar en "_test". No se ejecutó ninguna prueba.`
    )
  }
}

export default async function guard(): Promise<void> {
  assertTestDatabase()
}
