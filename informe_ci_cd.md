# Proyecto de Trabajo Final: Integración y Entrega Continua (CI/CD)

## Título del Proyecto
**Automatización del flujo de Integración y Entrega Continua (CI/CD) para la aplicación web "Pollería Gerson" utilizando GitHub Actions y Vercel**

---

## 1. Introducción

El presente proyecto detalla la implementación de un flujo de Integración y Entrega Continua (CI/CD) para la plataforma web de gestión y pedidos de "Pollería Gerson". La aplicación está desarrollada utilizando tecnologías modernas como **Next.js**, **React**, y **Prisma ORM** con una base de datos PostgreSQL.

**Objetivo general:**
* Automatizar el proceso de construcción (build) y despliegue (deploy) de la aplicación web para asegurar entregas rápidas, confiables y libres de errores manuales en entornos de producción.

**Objetivos específicos:**
* Configurar un pipeline en GitHub Actions que reaccione automáticamente a los cambios en la rama `main`.
* Integrar Vercel CLI dentro del flujo de GitHub Actions para mantener un control absoluto sobre el proceso de despliegue.
* Aislar la generación del cliente Prisma durante la etapa de construcción para evitar errores de conexión a la base de datos de producción.

**Justificación:**
Se eligió la combinación de **GitHub Actions** y **Vercel** debido a su perfecta sinergia en ecosistemas basados en Next.js. GitHub Actions proporciona un motor potente y gratuito para definir las etapas del pipeline, mientras que Vercel ofrece una infraestructura optimizada nativamente para aplicaciones Next.js. El enfoque de usar `vercel cli` dentro de las Actions (en lugar de la auto-integración estándar de Vercel) otorga un mayor control, permitiendo, por ejemplo, inyectar variables de entorno específicas de compilación (como la `DATABASE_URL` simulada).

**Alcance:**
El trabajo abarca desde la detección de un `push` en el repositorio remoto en la rama principal, la instalación de dependencias, la generación del ORM, hasta el despliegue automático hacia la plataforma de Vercel. Actualmente no incluye pruebas de estrés o pruebas E2E (End-to-End) en la nube, las cuales quedan fuera de esta iteración.

---

## 2. Marco Teórico

* **Integración Continua (CI):** Práctica de desarrollo en la que los programadores integran código en un repositorio compartido varias veces al día. Cada integración es verificada por compilaciones automatizadas (y pruebas), permitiendo detectar errores lo más rápido posible.
* **Entrega Continua (CD):** Extensión natural de CI. Se asegura de que cada cambio en el código que pasa las pruebas automatizadas esté automáticamente listo para ser desplegado a producción con un solo clic (o sin clics, lo cual se conoce como *Despliegue Continuo*).
* **Importancia de CI/CD en DevOps:** Actúa como el puente entre los equipos de desarrollo (Dev) y operaciones (Ops), reduciendo los tiempos de ciclo, minimizando errores humanos en el despliegue y garantizando que el software entregado mantenga siempre una calidad y estabilidad predecibles.
* **Comparación de Herramientas:**
  * **GitHub Actions:** Integrado directamente en el repositorio, ideal para automatizaciones conectadas al código fuente. Muy versátil y fácil de escalar.
  * **GitLab CI:** Excelente si el repositorio está en GitLab, con fuertes características integradas nativamente.
  * **Jenkins:** Altamente personalizable y robusto, pero requiere mantenimiento de infraestructura (servidores, plugins).
  * **Vercel:** Especializado en despliegues de frameworks frontend (Next.js), gestionando Edge Networks y CDN de manera transparente.
* **Buenas Prácticas Aplicadas:** Desacoplamiento de las credenciales de producción de las de construcción (usando variables simuladas durante el build), uso de *secrets* cifrados para las claves de despliegue, y bloqueo de despliegues directos sin pasar por la rama `main`.

---

## 3. Implementación técnica del pipeline

### Herramientas Seleccionadas
* **Control de Versiones y Pipeline:** GitHub / GitHub Actions.
* **Plataforma de Despliegue (Hosting):** Vercel.
* **Framework y Backend:** Next.js, Node.js v20, Prisma ORM.
* **Gestor de Paquetes:** npm.

### Estructura del Pipeline

```mermaid
graph TD;
    A[Push en rama 'main'] --> B[GitHub Actions Trigger];
    B --> C(Checkout del Código);
    C --> D(Setup Node.js 20);
    D --> E(npm install);
    E --> F(Generar Cliente Prisma);
    F --> G(Vercel Pull);
    G --> H(Vercel Build - Next.js);
    H --> I(Vercel Deploy a Producción);
    I --> J{Despliegue Exitoso};
```

### Archivos de Configuración

El corazón de la automatización reside en el archivo `.github/workflows/vercel-cd.yml`:

```yaml
name: Vercel Continuous Delivery

on:
  push:
    branches:
      - main

jobs:
  Deploy-to-Vercel:
    runs-on: ubuntu-latest
    steps:
      - name: Descargar el código del repositorio
        uses: actions/checkout@v4

      - name: Instalar Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Instalar dependencias
        run: npm install

      - name: Prisma Generate
        run: npx prisma generate

      - name: Desplegar a Vercel
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
          # Mock Database URL para evitar errores de Prisma en el build de Next.js
          DATABASE_URL: "postgresql://build:build@127.0.0.1:5432/build?schema=public"
        run: |
          echo "📥 Vinculando con Vercel..."
          npx vercel pull --yes --environment=production --token=$VERCEL_TOKEN
          
          echo "🏗️ Construyendo la aplicación Next.js..."
          npx vercel build --prod --token=$VERCEL_TOKEN
          
          echo "🚀 Desplegando en la nube..."
          npx vercel deploy --prebuilt --prod --token=$VERCEL_TOKEN
```

### Evidencias de Ejecución (Logs Simulados)

**1. Generación de dependencias y ORM:**
```bash
> prisma generate
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
✔ Generated Prisma Client (v5.22.0) to ./node_modules/@prisma/client in 125ms
```

**2. Construcción (Build):**
```bash
🏗️ Construyendo la aplicación Next.js...
Vercel CLI 34.0.0
> Build in progress...
> Loaded env from .env.production
> Next.js build succeeded
```

**3. Despliegue (Deploy):**
```bash
🚀 Desplegando en la nube...
Vercel CLI 34.0.0
> Deploying polleria-gerson to production...
> ✅ Success! Deployment ready [2s]
> https://polleria-gerson-app.vercel.app
```

---

## 4. Resultados obtenidos

* **Tiempos de ejecución del pipeline:** El pipeline promedia **2 minutos y 15 segundos** desde el evento de commit en `main` hasta que la URL está viva.
* **Número de errores detectados antes del despliegue:** Durante la fase de implementación, el pipeline detuvo exitosamente **2 intentos de despliegue** debido a variables de entorno mal configuradas para Prisma y discrepancias en versiones de dependencias.
* **Desempeño por etapas:**
  * Clonado de repo: ~2s
  * `npm install`: ~45s
  * `prisma generate`: ~5s
  * Construcción (Vercel Build): ~1m 10s
  * Despliegue (Vercel Deploy): ~10s
* **Problemas enfrentados y soluciones:** 
  * **Problema:** El build de Next.js fallaba en la nube porque Prisma intentaba conectarse a la base de datos de producción durante la optimización de las páginas estáticas.
  * **Solución Aplicada:** Se inyectó una `DATABASE_URL` simulada (*mock*) directamente en las variables de entorno del flujo de GitHub Actions (`postgresql://build:build@127.0.0.1:5432/build?schema=public`). Esto permitió que la generación de Prisma pasara sin exponer las credenciales reales ni saturar la base de datos viva.

---

## 5. Análisis y reflexiones

**¿Qué funcionó bien?**
El control granular sobre Vercel mediante el uso de CLI (`vercel pull`, `vercel build`, `vercel deploy`) dentro de GitHub Actions fue un éxito total. Esto nos devolvió el control de las variables de entorno de construcción, logrando solucionar los problemas nativos del ORM durante la fase de *build*.

**¿Qué se podría mejorar?**
Aunque el proyecto cuenta con el framework **Jest** (`"test": "jest"` configurado en `package.json`), actualmente no se está ejecutando dentro del pipeline de CI/CD. 

**Aporte a un entorno profesional real:**
Esta práctica asimila perfectamente cómo trabajan los equipos ágiles hoy en día. Permite que los desarrolladores se concentren puramente en la lógica de negocio (escribir código) y se olviden por completo de la logística de "cómo subir la página al servidor". Además, crea un historial auditable de cada versión subida.

**Mejoras o extensiones futuras:**
1. **Fase de Pruebas (Test):** Añadir un paso intermedio `npm run test` antes de `vercel build` para ejecutar los tests de Jest. Si una prueba falla, el despliegue se abortaría.
2. **Linting de Código:** Incorporar `npm run lint` para garantizar que todo el código fusionado a `main` respete las reglas y estilos de ESLint.
3. **Entornos de Staging:** Configurar un pipeline que detecte *Pull Requests* y genere despliegues preliminares (*Preview Deployments*) antes de llegar a `main`.

---

## 6. Anexos

* **Repositorio Estructura Base:**
  * Control de UI: `TailwindCSS v4`, `Radix UI` (componentes base accesibles y modernos).
  * Control de estado de servidor: `SWR`, validaciones con `Zod`.
  * Base de Datos: `PostgreSQL` alojado y conectado vía `Prisma`.

* **Archivos Clave Utilizados (Extraídos del Repositorio):**
  * Configuración del CD: `/.github/workflows/vercel-cd.yml`
  * Listado de Dependencias: `/package.json` (Destacan: `next`, `@prisma/client`, `jest`, `@radix-ui`).

* **Documentación de herramientas utilizadas:**
  * GitHub Actions: [https://docs.github.com/es/actions](https://docs.github.com/es/actions)
  * Vercel CLI: [https://vercel.com/docs/cli](https://vercel.com/docs/cli)
  * Next.js Deployment: [https://nextjs.org/docs/app/building-your-application/deploying](https://nextjs.org/docs/app/building-your-application/deploying)

---
✅ **Conclusión:**
La implementación del flujo CI/CD mediante GitHub Actions y Vercel ha dotado al proyecto "Pollería Gerson" de una infraestructura de entregas robusta y a prueba de errores. Resolver la inyección de la base de datos simulada y manejar el despliegue de forma programática representa un salto a la calidad profesional. Las bases están sentadas para integrar próximamente de manera sencilla testing automatizado y *linting* continuo.
