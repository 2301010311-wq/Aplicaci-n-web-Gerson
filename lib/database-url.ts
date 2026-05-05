function getEnv(name: string): string | undefined {
  const value = process.env[name]
  return value && value.trim().length > 0 ? value.trim() : undefined
}

export function buildDatabaseUrlFromEnv(): string {
  const directUrl = getEnv("DATABASE_URL")
  if (directUrl) return directUrl

  const host = getEnv("DB_HOST")
  const port = getEnv("DB_PORT")
  const user = getEnv("DB_USER")
  const password = getEnv("DB_PASSWORD")
  const name = getEnv("DB_NAME")

  const missing = [
    !host && "DB_HOST",
    !port && "DB_PORT",
    !user && "DB_USER",
    !password && "DB_PASSWORD",
    !name && "DB_NAME",
  ].filter(Boolean) as string[]

  if (missing.length > 0) {
    throw new Error(
      `Missing database env vars: ${missing.join(", ")}. ` +
        "Set DATABASE_URL directly or provide DB_HOST, DB_PORT, DB_USER, DB_PASSWORD and DB_NAME."
    )
  }

  // Type assertion después de validación
  return `postgresql://${encodeURIComponent(user!)}:${encodeURIComponent(password!)}@${host!}:${port!}/${name!}?schema=public`
}
