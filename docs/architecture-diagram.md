# Arquitectura de Aplicación

Este diagrama muestra una arquitectura de la app `Aplicaci-n-web-Gerson-main` y su flujo de desarrollo, similar al esquema que compartiste.

```mermaid
flowchart TB
  subgraph Work_Environment[Entorno de trabajo]
    OS[Ubuntu / Linux]
    IDE[Visual Studio Code]
  end

  subgraph Develop[Desarrollo]
    Backend[Backend: Node.js / JavaScript]
    Framework[NestJS]
    API[REST API]
  end

  DB[PostgreSQL] ---|"Docker / contenedor"| DockerDB[Docker]
  Code[Code] --> GitHub[GitHub]
  GitHub --> Jenkins[Jenkins CI/CD]
  Jenkins -->|"docker build"| DockerImage[Imagen Docker]
  DockerImage -->|"docker push"| DockerHub[Docker Hub]
  DockerHub -->|"docker pull"| Production[Producción]

  Work_Environment --> Develop
  Develop --> DB
  Develop --> Code
  DockerDB --> DB
  Jenkins --> Production
  GitHub --> Code

  style Work_Environment fill:#f8f9fa,stroke:#4b5563,stroke-width:1px
  style Develop fill:#eef2ff,stroke:#1d4ed8,stroke-width:1px
  style DB fill:#dcfce7,stroke:#15803d,stroke-width:1px
  style Jenkins fill:#fde68a,stroke:#b45309,stroke-width:1px
  style DockerHub fill:#bae6fd,stroke:#0284c7,stroke-width:1px
  style Production fill:#f5f3ff,stroke:#7c3aed,stroke-width:1px
```

## Descripción
- `Ubuntu` y `VS Code` representan tu entorno local de desarrollo.
- `Node.js` y `NestJS` son el stack backend.
- `PostgreSQL` corre en contenedor Docker.
- `GitHub` se usa para versionar el código.
- `Jenkins` construye y publica imágenes Docker.
- El entorno de producción descarga las imágenes desde `Docker Hub`.
