# Aplicaci-n-web-Gerson
Aplicación web de gestión de polleria

Prueba de Continuous Deployment en Vercel - 14 de mayo de 2026

## Ejercicio de entrega continua
Este repositorio incluye un pipeline de Jenkins definido en `Jenkinsfile` que cubre:
- instalación reproducible con `npm ci`
- generación de Prisma
- compilación de Next.js
- lint con `npm run lint`
- escaneo de seguridad con `npm audit --audit-level=critical`
- pruebas con `npm test`
- empaquetado de artefactos de entrega continua

Al ejecutar el job de Jenkins, se genera y archiva el archivo `jenkins-build-info.txt` y `release/release-ready.txt` como prueba de que el flujo CI/CD llegó hasta la etapa de entrega.
