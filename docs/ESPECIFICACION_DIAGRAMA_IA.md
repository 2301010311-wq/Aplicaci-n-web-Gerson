# Descripción Detallada del Diagrama de Arquitectura - Pollería Gerson
## Para Generación con IA (DALL-E, Midjourney, etc.)

---

## 📐 ESTRUCTURA GENERAL DEL DIAGRAMA

### Dimensiones y Layout
- **Formato:** Horizontal / Landscape (1920x1080 px mínimo)
- **Orientación:** Flujo de izquierda a derecha y de arriba hacia abajo
- **Fondo:** Degradado suave de blanco a gris muy claro (#f5f5f5)
- **Estilo:** Profesional, limpio, moderno con bordes redondeados

---

## 🎨 PALETA DE COLORES

| Área | Color Principal | Color Secundario |
|------|-----------------|-----------------|
| **Entorno de Trabajo** | Azul Claro (#e1f5ff) | Azul Oscuro (#01579b) |
| **Frontend** | Púrpura Claro (#f3e5f5) | Púrpura Oscuro (#4a148c) |
| **Backend** | Verde Claro (#e8f5e9) | Verde Oscuro (#1b5e20) |
| **Base de Datos** | Naranja Claro (#fff3e0) | Naranja Oscuro (#e65100) |
| **Build Tools** | Rosa Claro (#fce4ec) | Rosa Oscuro (#880e4f) |
| **Dev Tools** | Lima Claro (#f1f8e9) | Lima Oscuro (#33691e) |
| **Despliegue** | Turquesa Claro (#e0f2f1) | Turquesa Oscuro (#004d40) |
| **GitHub** | Naranja Claro (#fbe9e7) | Rojo Oscuro (#bf360c) |
| **Producción** | Indigo Claro (#ede7f6) | Indigo Oscuro (#3f51b5) |

---

## 🖼️ ESTRUCTURA Y DISPOSICIÓN

### FILA 1 - ENTORNO DE TRABAJO (Parte Superior Izquierda)

**Contenedor "Entorno de Trabajo":**
- Forma: Rectángulo redondeado con borde azul (#01579b, 3px)
- Fondo: Azul claro (#e1f5ff)
- Ancho: ~300px
- Alto: ~200px
- Posición: Esquina superior izquierda

**Dentro del contenedor:**

1. **Windows Logo** (Icono)
   - Logo oficial de Windows (cuatro cuadrados azules)
   - Tamaño: 48x48px
   - Posición: Arriba a la izquierda
   - Texto debajo: "Windows 10/11" (Fuente: 14px, Bold)

2. **Visual Studio Code Logo** (Icono)
   - Logo oficial de VS Code (letra "C" azul sobre fondo azul)
   - Tamaño: 48x48px
   - Posición: Arriba a la derecha
   - Texto debajo: "Visual Studio Code" (Fuente: 14px, Bold)

3. **Git Logo** (Icono)
   - Logo oficial de Git (círculo naranja con "G" blanca)
   - Tamaño: 48x48px
   - Posición: Abajo centro
   - Texto debajo: "Git" (Fuente: 14px, Bold)

---

### FILA 2 - DESARROLLO (Parte Superior Centro-Derecha)

**Contenedor "Frontend":**
- Forma: Rectángulo redondeado con borde púrpura (#4a148c, 3px)
- Fondo: Púrpura claro (#f3e5f5)
- Ancho: ~400px
- Alto: ~200px
- Posición: Superior centro

**Dentro del contenedor Frontend (5 elementos en fila):**

1. **React Logo**
   - Logo oficial: Átomo azul con electrones
   - Tamaño: 40x40px
   - Texto: "React 19" (Fuente: 12px)

2. **Next.js Logo**
   - Logo: Cuadrado negro con "Next"
   - Tamaño: 40x40px
   - Texto: "Next.js 15" (Fuente: 12px)

3. **TypeScript Logo**
   - Logo: Cuadrado azul con "TS"
   - Tamaño: 40x40px
   - Texto: "TypeScript 5.9" (Fuente: 12px)

4. **Tailwind CSS Logo**
   - Logo: Punto azul turquesa
   - Tamaño: 40x40px
   - Texto: "Tailwind CSS" (Fuente: 12px)

5. **Radix UI Logo**
   - Logo: Forma geométrica abstracta
   - Tamaño: 40x40px
   - Texto: "Radix UI" (Fuente: 12px)

---

**Contenedor "Backend":**
- Forma: Rectángulo redondeado con borde verde (#1b5e20, 3px)
- Fondo: Verde claro (#e8f5e9)
- Ancho: ~400px
- Alto: ~200px
- Posición: Debajo de Frontend, ligeramente a la derecha

**Dentro del contenedor Backend (5 elementos en fila):**

1. **Node.js Logo**
   - Logo: Rectángulo verde con "Node.js"
   - Tamaño: 40x40px
   - Texto: "Node.js 20" (Fuente: 12px)

2. **Next.js API Routes Badge**
   - Forma: Rectángulo con esquinas redondeadas
   - Color: Verde oscuro
   - Icono: Engranaje
   - Tamaño: 40x40px
   - Texto: "Next.js API" (Fuente: 12px)

3. **Prisma ORM Logo**
   - Logo: Triángulo geométrico
   - Tamaño: 40x40px
   - Texto: "Prisma ORM" (Fuente: 12px)

4. **Auth Badge**
   - Forma: Candado con llave
   - Color: Verde oscuro
   - Tamaño: 40x40px
   - Texto: "JWT/Jose" (Fuente: 12px)

5. **Zod Validation Badge**
   - Forma: Escudo con checkmark
   - Color: Verde oscuro
   - Tamaño: 40x40px
   - Texto: "Zod" (Fuente: 12px)

---

### FILA 3 - BASE DE DATOS (Derecha)

**Contenedor "Base de Datos":**
- Forma: Rectángulo redondeado con borde naranja (#e65100, 3px)
- Fondo: Naranja claro (#fff3e0)
- Ancho: ~300px
- Alto: ~150px
- Posición: Lado derecho superior

**Dentro del contenedor (2 elementos):**

1. **PostgreSQL Logo**
   - Logo oficial: Elefante azul estilizado
   - Tamaño: 50x50px
   - Posición: Centro
   - Texto: "PostgreSQL" (Fuente: 14px, Bold)

2. **Docker Logo**
   - Logo: Ballena azul con contenedores
   - Tamaño: 50x50px
   - Posición: Centro-derecha
   - Texto: "Docker" (Fuente: 14px, Bold)

---

### FILA 4 - HERRAMIENTAS BUILD (Centro-Izquierda Inferior)

**Contenedor "Herramientas Build":**
- Forma: Rectángulo redondeado con borde rosa (#880e4f, 3px)
- Fondo: Rosa claro (#fce4ec)
- Ancho: ~350px
- Alto: ~150px
- Posición: Centro-izquierda

**Dentro del contenedor (4 elementos):**

1. **PNPM Logo**
   - Logo: Tres puntos conectados
   - Tamaño: 35x35px
   - Texto: "PNPM" (Fuente: 11px)

2. **Jest Logo**
   - Logo: J de color rojo/magenta
   - Tamaño: 35x35px
   - Texto: "Jest" (Fuente: 11px)

3. **SWC Logo**
   - Logo: S estilizada dorada
   - Tamaño: 35x35px
   - Texto: "SWC" (Fuente: 11px)

4. **PostCSS Logo**
   - Logo: Naranja con símbolo de CSS
   - Tamaño: 35x35px
   - Texto: "PostCSS" (Fuente: 11px)

---

### FILA 5 - HERRAMIENTAS DE DESARROLLO (Centro Inferior)

**Contenedor "Herramientas Dev":**
- Forma: Rectángulo redondeado con borde lima (#33691e, 3px)
- Fondo: Lima claro (#f1f8e9)
- Ancho: ~300px
- Alto: ~120px
- Posición: Centro

**Dentro del contenedor (3 elementos en fila):**

1. **ESLint Logo**
   - Logo: Cuadrado rojo con símbolo de verificación
   - Tamaño: 35x35px
   - Texto: "ESLint" (Fuente: 11px)

2. **Prettier Logo**
   - Logo: Icono de formato/belleza
   - Tamaño: 35x35px
   - Texto: "Prettier" (Fuente: 11px)

3. **Dotenv Logo**
   - Logo: Archivo con punto
   - Tamaño: 35x35px
   - Texto: ".env" (Fuente: 11px)

---

### FILA 6 - LIBRERÍAS PRINCIPALES (Centro-Derecha Inferior)

**Contenedor "Librerías":**
- Forma: Rectángulo redondeado con borde lima (#827717, 3px)
- Fondo: Amarillo claro (#f0f4c3)
- Ancho: ~350px
- Alto: ~150px
- Posición: Centro-derecha

**Dentro del contenedor (6 elementos en 2 filas de 3):**

Fila 1:
1. **React Hook Form** - Icono de formulario azul
2. **Recharts** - Icono de gráficos con líneas
3. **Lucide React** - Icono de iconografía

Fila 2:
4. **date-fns** - Icono de calendario
5. **Sonner** - Icono de notificación/campana
6. **bcryptjs** - Icono de candado/encriptación

---

### FILA 7 - GITHUB (Parte Inferior Izquierda)

**Contenedor "GitHub":**
- Forma: Rectángulo redondeado con borde rojo (#bf360c, 3px)
- Fondo: Naranja muy claro (#fbe9e7)
- Ancho: ~300px
- Alto: ~150px
- Posición: Esquina inferior izquierda

**Dentro del contenedor (2 elementos):**

1. **GitHub Logo**
   - Logo: Gato github (Octocat)
   - Tamaño: 50x50px
   - Texto: "Repositorio GitHub" (Fuente: 12px)

2. **GitHub Actions Logo**
   - Logo: Engranaje con símbolo de automatización
   - Tamaño: 50x50px
   - Texto: "GitHub Actions" (Fuente: 12px)

---

### FILA 8 - DESPLIEGUE (Centro Inferior)

**Contenedor "Despliegue":**
- Forma: Rectángulo redondeado con borde turquesa (#004d40, 3px)
- Fondo: Turquesa claro (#e0f2f1)
- Ancho: ~400px
- Alto: ~180px
- Posición: Centro-inferior

**Dentro del contenedor (3 elementos en columna):**

1. **Docker Build**
   - Icono: Ballena con martillo/construcción
   - Tamaño: 40x40px
   - Texto: "Docker Build" (Fuente: 12px)
   - Flecha hacia abajo

2. **Imagen Docker**
   - Icono: Contenedor/caja
   - Tamaño: 40x40px
   - Texto: "Imagen Docker" (Fuente: 12px)
   - Flecha hacia abajo

3. **Docker Hub Registry**
   - Icono: Logo de Docker Hub (nube con ballena)
   - Tamaño: 40x40px
   - Texto: "Docker Hub Registry" (Fuente: 12px)

---

### FILA 9 - PRODUCCIÓN (Esquina Inferior Derecha)

**Contenedor "Producción":**
- Forma: Rectángulo redondeado con borde indigo (#3f51b5, 3px)
- Fondo: Indigo claro (#ede7f6)
- Ancho: ~300px
- Alto: ~150px
- Posición: Esquina inferior derecha

**Dentro del contenedor (2 elementos):**

1. **Servidor Producción**
   - Icono: Servidor/torre/computadora
   - Tamaño: 45x45px
   - Texto: "Servidor Producción" (Fuente: 12px)

2. **PostgreSQL en Producción**
   - Icono: Elefante (PostgreSQL)
   - Tamaño: 45x45px
   - Texto: "PostgreSQL Prod" (Fuente: 12px)

---

## 🔗 LÍNEAS DE CONEXIÓN (Flechas)

### Tipos de Flechas:
- **Sólidas:** Indicar flujo de dependencia directa
- **Punteadas:** Indicar relación indirecta
- **Color:** Usar color que coincida con la categoría origen
- **Grosor:** 2-3px

### Conexiones principales:

1. **Windows → VS Code, Git** (Dentro del mismo contenedor)
2. **Windows → Frontend** (Flecha azul, "Desarrollo")
3. **Frontend → React, Next.js, TypeScript, Tailwind, Radix** (Azul púrpura)
4. **Backend → Node.js, Next API, Prisma, Auth, Zod** (Verde oscuro)
5. **Prisma → PostgreSQL** (Verde a naranja, "conecta a")
6. **PostgreSQL → Docker** (Naranja, "corre en")
7. **Frontend, Backend → Build Tools** (Múltiples colores)
8. **Frontend, Backend → Dev Tools** (Múltiples colores)
9. **Frontend, Backend → Libraries** (Múltiples colores)
10. **Git → GitHub Repo** (Naranja rojo, "push/pull")
11. **GitHub Repo → GitHub Actions** (Rojo, "integración")
12. **GitHub Actions → Despliegue** (Rojo a turquesa, "triggerea")
13. **Despliegue → Docker Build → Imagen Docker → Docker Hub** (Turquesa oscuro, flujo vertical)
14. **Docker Hub → Producción** (Turquesa a indigo, "docker pull")
15. **Producción → PostgreSQL Prod** (Indigo, "almacena datos")

---

## 📌 ANOTACIONES EN LAS FLECHAS

Cada flecha debe tener texto corto describiendo la relación:

- "Desarrollo"
- "usa"
- "framework"
- "tipado"
- "estilos"
- "componentes"
- "runtime"
- "ORM"
- "autenticación"
- "validación"
- "conecta a"
- "corre en"
- "almacena"
- "push/pull"
- "integración"
- "triggerea"
- "docker build"
- "docker push"
- "docker pull"

---

## 🎯 FLUJO NARRATIVO (De izquierda a derecha, arriba a abajo)

```
DESARROLLO (Windows + VS Code + Git)
        ↓
CODING (Frontend + Backend)
        ↓
BUILD TOOLS (PNPM + Jest + SWC)
        ↓
DEV TOOLS (ESLint + Prettier)
        ↓
LIBRARIES (Utilidades especializadas)
        ↓
VERSIONADO (Git + GitHub)
        ↓
CI/CD (GitHub Actions)
        ↓
DEPLOYMENT (Docker Build → Hub)
        ↓
PRODUCCIÓN (Servidor con PostgreSQL)
```

---

## 🖌️ ESTILOS VISUALES ADICIONALES

### Sombras y Profundidad:
- Cada contenedor debe tener sombra suave: `box-shadow: 0 4px 12px rgba(0,0,0,0.1)`
- Los iconos pueden tener sombra más leve

### Bordes:
- Todos los contenedores: Border radius 12px, borde 3px sólido
- Todos los iconos: Border radius 8px, sombra ligera

### Tipografía:
- Título de categorías: Bold, 16px, color del borde
- Nombres de elementos: Regular, 12px, color gris oscuro (#333)
- Anotaciones de flechas: Italic, 10px, color gris medio (#777)

### Efectos:
- Hover effect (si es interactivo): Aumentar sombra y escala 1.05x
- Gradientes suaves en los contenedores para profundidad

---

## 📏 DIMENSIONES FINALES RECOMENDADAS

- **Resolución:** 1920x1440px (Landscape optimizado)
- **Resolución alternativa:** 1200x900px (Web)
- **Resolución alternativa:** 2560x1920px (Impresión de alta calidad)

---

## 🎨 RESUMEN VISUAL

```
┌─────────────────────────────────────────────────────────────────────┐
│                        ARQUITECTURA POLLERÍA GERSON                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐  ┌────────────────┐  ┌──────────────┐           │
│  │  DESARROLLO  │→→│    FRONTEND    │→→│  BASE DE     │           │
│  │  (Windows)   │  │  (React +      │  │  DATOS       │           │
│  │              │  │   Next.js)     │  │(PostgreSQL)  │           │
│  └──────────────┘  └────────────────┘  └──────────────┘           │
│         │                  │                    │                   │
│         ↓                  ↓                    ↓                   │
│  ┌──────────────┐  ┌────────────────┐  ┌──────────────┐           │
│  │    BUILD     │  │  HERRAMIENTAS  │  │  LIBRERÍAS   │           │
│  │   TOOLS      │  │   DESARROLLO   │  │ PRINCIPALES  │           │
│  └──────────────┘  └────────────────┘  └──────────────┘           │
│         │                  │                    │                   │
│         └──────────┬───────┴────────────┬──────┘                   │
│                    ↓                    ↓                           │
│              ┌──────────────┐                                       │
│              │ GITHUB REPO  │                                       │
│              │ + ACTIONS    │                                       │
│              └──────────────┘                                       │
│                    ↓                                               │
│         ┌──────────────────┐                                       │
│         │  DOCKER BUILD    │                                       │
│         │     + PUSH       │                                       │
│         └──────────────────┘                                       │
│                    ↓                                               │
│         ┌──────────────────┐                                       │
│         │   PRODUCCIÓN     │                                       │
│         │ + PostgreSQL     │                                       │
│         └──────────────────┘                                       │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📝 INSTRUCCIÓN FINAL PARA LA IA

"Crea un diagrama de arquitectura moderno y profesional con las siguientes características:

1. **Fondo:** Degradado blanco a gris claro
2. **Contenedores:** 9 grupos con colores específicos, bordes redondeados y sombras
3. **Iconos:** Logos reales de cada tecnología (Windows, React, Node.js, PostgreSQL, Docker, GitHub, etc.)
4. **Layout:** Flujo de arriba a abajo y de izquierda a derecha
5. **Conexiones:** Flechas con etiquetas describiendo relaciones
6. **Estilo:** Moderno, profesional, limpio, con espaciado adecuado
7. **Tipografía:** Clara, legible, jerarquía visual bien definida
8. **Colorimetría:** Usa la paleta de colores especificada con colores claros y oscuros
9. **Propósito:** Mostrar el stack completo de una aplicación fullstack con CI/CD en Windows

Específicamente incluye:
- Windows como SO (no Linux)
- PostgreSQL en base de datos
- Todas las herramientas especificadas
- Flujo de despliegue con Docker y GitHub Actions
- Ambiente de producción separado
"
