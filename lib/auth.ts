import { SignJWT, jwtVerify } from "jose"
import bcrypt from "bcryptjs"
import { cookies } from "next/headers"

const jwtSecretEnv = process.env.JWT_SECRET

if (!jwtSecretEnv || jwtSecretEnv.trim().length === 0) {
  throw new Error(
    "JWT_SECRET no está configurado. Defínelo en las variables de entorno " +
      "(Vercel: Project Settings → Environment Variables, para Production/Preview/Development) " +
      "antes de desplegar. Nunca uses un valor por defecto: un secreto fijo en el código " +
      "permite falsificar sesiones de cualquier usuario, incluido Admin."
  )
}

const secret = new TextEncoder().encode(jwtSecretEnv)

export interface JWTPayload {
  id: string
  nombre: string
  email: string
  rol: string
  [key: string]: any
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function createToken(payload: JWTPayload): Promise<string> {
  return new SignJWT(payload).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("24h").sign(secret)
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload as unknown as JWTPayload
  } catch (error) {
    return null
  }
}

export async function getSession(): Promise<JWTPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value

  if (!token) return null

  return verifyToken(token)
}

export async function setSession(token: string) {
  const cookieStore = await cookies()
  cookieStore.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24, // 24 hours
    path: "/",
  })
}

export async function clearSession() {
  const cookieStore = await cookies()
  cookieStore.delete("token")
}
