# Arquitectura de Aplicación - Pollería Gerson

Diagrama de arquitectura completo del proyecto con todas las herramientas y tecnologías utilizadas.

```mermaid
graph TB
    subgraph WorkEnv["🖥️ Entorno de Trabajo"]
        OS["Windows 10/11"]
        IDE["Visual Studio Code"]
        Git["Git"]
    end

    subgraph Frontend["🎨 Frontend"]
        React["React 19"]
        Next["Next.js 15"]
        TS["TypeScript 5.9"]
        CSS["Tailwind CSS"]
        UI["Radix UI Components"]
    end

    subgraph Backend["⚙️ Backend"]
        Node["Node.js 20"]
        NextAPI["Next.js API Routes"]
        Prisma["Prisma ORM"]
        Auth["Auth - JWT/Jose"]
        Validation["Zod - Validación"]
    end

    subgraph Database["🗄️ Base de Datos"]
        PostgreSQL["PostgreSQL"]
        Docker_DB["Docker"]
    end

    subgraph BuildTools["🔧 Herramientas Build"]
        PNPM["PNPM Package Manager"]
        Jest["Jest Testing"]
        SWC["SWC Compiler"]
        PostCSS["PostCSS"]
    end

    subgraph DevTools["🛠️ Herramientas Desarrollo"]
        ESLint["ESLint"]
        Prettier["Prettier"]
        DotEnv["Dotenv"]
    end

    subgraph Deployment["📦 Despliegue"]
        DockerBuild["Docker Build"]
        DockerImg["Imagen Docker"]
        DockerHub["Docker Hub Registry"]
    end

    subgraph GitHub_Section["📌 GitHub"]
        GHRepo["Repositorio GitHub"]
        GHActions["GitHub Actions"]
    end

    subgraph Production["🚀 Producción"]
        ProdEnv["Servidor Producción"]
        ProdDB["PostgreSQL en Prod"]
    end

    subgraph Libraries["📚 Librerías Principales"]
        HookForm["React Hook Form"]
        Charts["Recharts - Gráficos"]
        Icons["Lucide React - Iconos"]
        DateLib["date-fns - Fechas"]
        Toast["Sonner - Notificaciones"]
        Crypto["bcryptjs - Encriptación"]
    end

    %% Conexiones Frontend
    WorkEnv -->|Desarrollo| Frontend
    Frontend -->|usa| React
    Frontend -->|framework| Next
    Frontend -->|tipado| TS
    Frontend -->|estilos| CSS
    Frontend -->|componentes| UI

    %% Conexiones Backend
    Next -->|API Routes| Backend
    Backend -->|runtime| Node
    Backend -->|framework| NextAPI
    Backend -->|ORM| Prisma
    Backend -->|autenticación| Auth
    Backend -->|validación| Validation

    %% Conexiones Base de Datos
    Prisma -->|conecta a| Database
    PostgreSQL -->|corre en| Docker_DB
    Database -->|almacena| ProdDB

    %% Herramientas Build
    Frontend -->|usa| BuildTools
    Backend -->|usa| BuildTools
    PNPM -->|maneja dependencias| BuildTools
    Jest -->|testing| BuildTools
    SWC -->|compilación rápida| BuildTools

    %% Librerías
    Frontend -->|utiliza| Libraries
    Backend -->|utiliza| Libraries

    %% Dev Tools
    Frontend -->|usa| DevTools
    Backend -->|usa| DevTools

    %% GitHub y Control de Versiones
    WorkEnv -->|versionado| Git
    Git -->|push/pull| GHRepo
    GHRepo -->|integración| GHActions

    %% Despliegue
    GHActions -->|triggerea| Deployment
    Deployment -->|docker build| DockerImg
    DockerImg -->|push| DockerHub

    %% Producción
    DockerHub -->|docker pull| Production
    Production -->|ejecuta| ProdEnv

    %% Estilos
    style WorkEnv fill:#e1f5ff,stroke:#01579b,stroke-width:2px
    style Frontend fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    style Backend fill:#e8f5e9,stroke:#1b5e20,stroke-width:2px
    style Database fill:#fff3e0,stroke:#e65100,stroke-width:2px
    style BuildTools fill:#fce4ec,stroke:#880e4f,stroke-width:2px
    style DevTools fill:#f1f8e9,stroke:#33691e,stroke-width:2px
    style Deployment fill:#e0f2f1,stroke:#004d40,stroke-width:2px
    style GitHub_Section fill:#fbe9e7,stroke:#bf360c,stroke-width:2px
    style Production fill:#ede7f6,stroke:#3f51b5,stroke-width:2px
    style Libraries fill:#f0f4c3,stroke:#827717,stroke-width:2px
```

## 📋 Descripción de Componentes

### 🖥️ Entorno de Trabajo
- **Windows 10/11**: Sistema operativo de desarrollo
- **Visual Studio Code**: IDE principal
- **Git**: Control de versiones local

### 🎨 Frontend (Capa de Presentación)
- **React 19**: Librería de componentes
- **Next.js 15**: Framework fullstack con SSR
- **TypeScript**: Tipado estático
- **Tailwind CSS**: Estilos utilitarios
- **Radix UI**: Componentes accesibles

### ⚙️ Backend (API & Lógica)
- **Node.js 20**: Runtime de JavaScript
- **Next.js API Routes**: Endpoints HTTP
- **Prisma ORM**: Gestión de base de datos
- **Jose**: Autenticación JWT
- **Zod**: Validación de esquemas

### 🗄️ Base de Datos
- **PostgreSQL**: SGBDR robusto
- **Docker**: Contenedor para la BD

### 🔧 Herramientas Build
- **PNPM**: Gestor de paquetes (más rápido que npm)
- **Jest**: Framework de testing
- **SWC**: Compilador rápido de JavaScript
- **PostCSS**: Procesamiento de CSS

### 📚 Librerías Principales
- **React Hook Form**: Gestión de formularios
- **Recharts**: Gráficos de datos
- **Lucide React**: Iconografía
- **date-fns**: Manipulación de fechas
- **Sonner**: Sistema de notificaciones Toast
- **bcryptjs**: Encriptación de contraseñas

### 📌 GitHub & CI/CD
- **Repositorio GitHub**: Alojamiento del código
- **GitHub Actions**: Automatización de pipeline

### 📦 Despliegue
- **Docker Build**: Creación de imágenes
- **Docker Hub**: Registro de imágenes
- **Servidor Producción**: Ejecución de la app

---

## 🔄 Flujo de Desarrollo Completo

```
1. Desarrollador en Windows hace cambios en VS Code
                    ↓
2. Comete con Git y push a GitHub
                    ↓
3. GitHub Actions ejecuta workflow automáticamente
                    ↓
4. Se ejecutan tests (Jest) y build (SWC)
                    ↓
5. Docker construye la imagen (Dockerfile)
                    ↓
6. La imagen se publica en Docker Hub
                    ↓
7. Servidor de producción descarga la imagen
                    ↓
8. PostgreSQL en producción se sincroniza
                    ↓
9. App está disponible para usuarios
```

---

## 🛠️ Stack Tecnológico Resumen

| Aspecto | Tecnología |
|--------|------------|
| **SO Desarrollo** | Windows 10/11 |
| **Lenguaje** | TypeScript / JavaScript |
| **Frontend Framework** | Next.js + React |
| **Estilos** | Tailwind CSS + Radix UI |
| **Backend** | Node.js + Next.js API Routes |
| **BD** | PostgreSQL + Prisma ORM |
| **Contenedores** | Docker |
| **Gestor Paquetes** | PNPM |
| **Testing** | Jest |
| **Versionado** | Git + GitHub |
| **Auth** | JWT (Jose) |
| **Encriptación** | bcryptjs |
