# Guía: Crear Job en Jenkins para Ejecutar Docker Orchestration Pipeline

## 📋 Requisitos Previos

✅ Jenkins corriendo en `http://localhost:8080`
✅ Docker instalado en el host de Jenkins
✅ Docker Compose disponible
✅ Acceso a tu repositorio Git (GitHub, GitLab, Bitbucket, etc.)
✅ Variables de entorno configuradas

---

## 🔧 Paso 1: Crear Credenciales en Jenkins

### 1.1 Acceder a Jenkins Credentials
```
http://localhost:8080/credentials/
```

### 1.2 Crear Credenciales Necesarias

Haz clic en **"System"** → **"Global credentials"** → **"Add Credentials"**

#### **1. gerson-db-user** (Secret text)
- **Kind:** Secret text
- **Secret:** `postgres` (o tu usuario DB)
- **ID:** `gerson-db-user`
- **Description:** Database username for Gerson PostgreSQL

#### **2. gerson-db-password** (Secret text)
- **Kind:** Secret text
- **Secret:** `tu_contraseña_db` (la de tu .env)
- **ID:** `gerson-db-password`
- **Description:** Database password for Gerson PostgreSQL

#### **3. gerson-jwt-secret** (Secret text)
- **Kind:** Secret text
- **Secret:** `tu_jwt_secret` (la de tu .env)
- **ID:** `gerson-jwt-secret`
- **Description:** JWT secret for application authentication

#### **4. github-credentials** (GitHub Personal Access Token)
- **Kind:** Username with password
- **Username:** `tu_usuario_github`
- **Password:** `ghp_xxxxxxxxxxxxxxxxxxx` (tu GitHub PAT token)
- **ID:** `github-credentials`
- **Description:** GitHub credentials for cloning repository

---

## 🏗️ Paso 2: Crear Pipeline Job

### 2.1 Crear Nuevo Job
```
http://localhost:8080/view/all/newJob
```
- **Job name:** `Gerson-Docker-Orchestration`
- **Type:** Pipeline
- Haz clic en **"OK"**

### 2.2 Configurar Git Repository
En la sección **"Pipeline"**:

1. **Definition:** Selecciona **"Pipeline script from SCM"**
2. **SCM:** Selecciona **"Git"**
3. **Repository URL:** 
   ```
   https://github.com/tu-usuario/aplicacion-web-gerson.git
   ```
4. **Credentials:** Selecciona **"github-credentials"**
5. **Branch Specifier:** `*/main`
6. **Script Path:** `Jenkinsfile.docker-orchestration`
7. Haz clic en **"Save"**

### 2.3 (Opcional) Configurar Triggers

Para que Jenkins ejecute automáticamente el pipeline cuando hagas push a GitHub:

1. En la configuración del job → **"Build Triggers"**
2. Marca **"GitHub hook trigger for GITScm polling"**
3. En GitHub:
   - Repositorio → **Settings** → **Webhooks**
   - **Add webhook**
   - **Payload URL:** `http://tu-jenkins-server:8080/github-webhook/`
   - **Content type:** `application/json`
   - **Events:** Just the push event

---

## 🚀 Paso 3: Ejecutar el Pipeline

### Opción 1: Ejecutar Manualmente
```
http://localhost:8080/job/Gerson-Docker-Orchestration/build
```

### Opción 2: Por Parámetros
El pipeline acepta parámetros:
- **GIT_BRANCH:** Rama a construir (default: `main`)
- **CLEAN_BUILD:** Limpiar contenedores previos (default: `true`)
- **RUN_PERFORMANCE_TESTS:** Ejecutar pruebas de rendimiento (default: `false`)

Haz clic en **"Build with Parameters"** para personalizarlos.

---

## 📊 Paso 4: Monitorear Ejecución

### Ver Logs en Tiempo Real
```
http://localhost:8080/job/Gerson-Docker-Orchestration/lastBuild/console
```

### Ver Historial de Builds
```
http://localhost:8080/job/Gerson-Docker-Orchestration/
```

### Acceder a Servicios Durante el Build
Una vez que el build inicie, los servicios están disponibles en:

| Servicio | URL | Credenciales |
|----------|-----|--------------|
| **Backend API** | http://localhost:3000 | - |
| **Grafana** | http://localhost:3001 | admin / admin123 |
| **Prometheus** | http://localhost:9091 | - |
| **AlertManager** | http://localhost:9093 | - |
| **Loki** | http://localhost:3100 | - |
| **PostgreSQL** | localhost:5432 | postgres / password |

---

## 🧪 Paso 5: Ejecutar Tareas Específicas

El Jenkinsfile ejecuta **7 etapas automáticamente**, pero puedes personalizar:

### Crear un Job con Etapas Específicas

1. Crea un nuevo Pipeline job: `Gerson-Docker-Tests`
2. **Pipeline → Script:**

```groovy
// Ejecutar SOLO tests
pipeline {
  agent any
  
  environment {
    COMPOSE_FILE = "docker-compose.jenkins.yml"
    COMPOSE_PROJECT_NAME = "gerson-tests-${BUILD_NUMBER}"
    DB_USER = credentials('gerson-db-user')
    DB_PASSWORD = credentials('gerson-db-password')
  }
  
  stages {
    stage("Checkout") {
      steps {
        checkout scm
      }
    }
    
    stage("Run Unit Tests") {
      steps {
        sh '''
          docker compose -f "${COMPOSE_FILE}" -p "${COMPOSE_PROJECT_NAME}" build tests
          docker compose -f "${COMPOSE_FILE}" -p "${COMPOSE_PROJECT_NAME}" \
            run --rm tests npm test -- --coverage --json
        '''
      }
    }
    
    stage("Publish Test Results") {
      steps {
        junit 'test-results/**/*.xml'
        publishHTML target: [
          reportDir: 'coverage',
          reportFiles: 'index.html',
          reportName: 'Code Coverage'
        ]
      }
    }
  }
  
  post {
    always {
      sh '''
        docker compose -f "${COMPOSE_FILE}" -p "${COMPOSE_PROJECT_NAME}" down --volumes
      '''
    }
  }
}
```

---

## 🔍 Paso 6: Verificar Configuración

### Ver Variables de Entorno
```
http://localhost:8080/job/Gerson-Docker-Orchestration/configure
```

### Ver Artefactos Archivados
```
http://localhost:8080/job/Gerson-Docker-Orchestration/lastBuild/artifact/
```

Deberías ver:
- `test-results/` - Resultados de pruebas
- `coverage/` - Reportes de cobertura de código
- `docker-logs/` - Logs de todos los servicios

---

## 🐛 Troubleshooting

### Error: "Docker daemon not accessible"
```bash
# En el servidor Jenkins, verificar permiso de Docker
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

### Error: "Port already in use"
```bash
# Si los puertos ya están en uso, detener contenedores previos
docker compose -f docker-compose.jenkins.yml down --volumes
```

### Error: "GitHub credentials not found"
```bash
# Asegurar que las credenciales están creadas
curl -s http://localhost:8080/credentials/ \
  -u admin:admin | grep gerson-db-user
```

### Build se queda en espera
```bash
# Verificar logs de Jenkins
tail -f /var/log/jenkins/jenkins.log

# O en Docker:
docker logs jenkins
```

---

## 📈 Casos de Uso Adicionales

### 1. Ejecutar Solo Tests
Crea un job que ejecute solo la etapa de tests sin compilar la app.

### 2. Ejecutar Solo Build
Para compilar sin ejecutar tests.

### 3. Ejecutar Solo Verificaciones de Seguridad
```groovy
stage("Security Scan") {
  steps {
    sh 'npm audit --audit-level=high'
  }
}
```

### 4. Notificaciones en Slack/Email
Agrega en `post`:
```groovy
post {
  success {
    echo "Build successful!"
    // emailext(to: "team@example.com", subject: "Build #${BUILD_NUMBER} Success")
  }
  failure {
    echo "Build failed!"
    // slackSend(message: "Build #${BUILD_NUMBER} failed")
  }
}
```

---

## 📝 Variables Disponibles en el Jenkinsfile

```groovy
// Accesibles en el pipeline:
BUILD_NUMBER        // Número del build actual
JOB_NAME            // Nombre del job
BUILD_URL           // URL del build
WORKSPACE           // Directorio de trabajo
```

---

## ✅ Checklist de Verificación

- [ ] Jenkins está corriendo (http://localhost:8080)
- [ ] Docker está instalado en el servidor Jenkins
- [ ] Credenciales creadas (DB user, password, JWT secret)
- [ ] Repositorio Git clonado exitosamente
- [ ] Job "Gerson-Docker-Orchestration" creado
- [ ] Script Path apunta a `Jenkinsfile.docker-orchestration`
- [ ] Credenciales del job configuradas correctamente
- [ ] Primer build ejecutado exitosamente
- [ ] Servicios están accesibles en los puertos correctos
- [ ] Logs y artefactos se archivaron correctamente

---

## 🎯 Próximos Pasos

1. **Registra métricas:** Importa dashboards en Grafana
2. **Configura alertas:** En AlertManager para notificaciones
3. **Auto-deploy:** Implementa CD en el Jenkinsfile para desplegar a producción
4. **Webhooks:** Configura GitHub para triggering automático
5. **SonarQube:** Integra análisis de código

---

**Última actualización:** 2026-07-11
**Versión del Jenkinsfile:** 2.0 (Docker Orchestration)
