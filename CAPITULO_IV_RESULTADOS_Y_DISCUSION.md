# CAPÍTULO IV: RESULTADOS Y DISCUSIÓN

---

## 4.1. Análisis de Resultados Obtenidos

### 4.1.1. Comparativa de Métricas DevOps (DORA Metrics)

**Frecuencia de Despliegue**
- Antes: 1-2 despliegues/mes
- Después: 4-5 despliegues/semana
- Resultado: aumento de la frecuencia y reducción del riesgo de cambios extensos

**Tiempo de Lead para Cambios**
- Antes: 2-3 días por feature completo
- Después: < 1 día para features pequeños y correcciones
- Resultado: mayor capacidad de respuesta y entrega continua

**Tiempo de Restauración de Servicio (MTTR)**
- Antes: 30-60 minutos en rollback manual
- Después: 2-3 minutos con rollout y health checks automatizados
- Resultado: recuperación rápida ante fallas

**Tasa de Fallos de Cambios**
- Antes: 5-10% de despliegues con errores detectados tras deploy
- Después: <1% de despliegues con fallo en producción
- Resultado: mejora significativa gracias a tests y validación previa

### 4.1.2. Evaluación de la Calidad del Software

**Cobertura de pruebas**
- Tests implementados con Jest + ts-jest
- Cobertura estimada: 70% en backend y utilidades, 65% en componentes críticos
- El valor real fue suficiente para reducir regresiones en módulos de pedidos y finanzas

**Erros en producción**
- Antes: 3-5 errores por mes debido a cambios sin validación completa
- Después: 0-1 errores por mes en producción
- Impacto: menor tiempo de atención de incidentes y mayor estabilidad para usuarios de cocina, meseros y cajeros

### 4.1.3. Rendimiento de la Aplicación

**Tiempo de respuesta de API**
- Endpoints críticos como `/api/pedidos`, `/api/productos`, `/api/mesas` responden en menos de 200 ms en condiciones normales
- Health check `/api/health` responde en < 150 ms

**Health Checks**
- Implementados en `/api/health`
- Validan conexión a PostgreSQL y estado general de la app
- Permiten a Kubernetes decidir si el pod está listo y vivo

**Observaciones de rendimiento**
- El uso de Next.js API Routes y Prisma proporciona respuestas ágiles para las operaciones CRUD
- La mayor latencia se produce en operaciones de reporte financiero y consultas de inventario complejas

---

## 4.2. Discusión de Resultados

### 4.2.1. Contrastación con los Objetivos Planteados

**Objetivo: reducir tiempos de despliegue**
- Cumplido: el pipeline CI/CD llevó los tiempos de 30-45 min a 5-10 min

**Objetivo: mejorar calidad del software**
- Cumplido: pruebas automatizadas, validación TypeScript y linting disminuyeron errores en producción

**Objetivo: garantizar estabilidad en producción**
- Parcialmente cumplido: health checks y despliegue en Kubernetes mejoraron la confiabilidad, pero la configuración actual de 1 réplica limita alta disponibilidad

**Objetivo: mantener un tratamiento consistente de ambientes**
- Cumplido: Docker + docker-compose + Kubernetes generan entornos reproducibles

### 4.2.2. Comparación con Estudios Previos

- Las mejoras de Gerson siguen tendencias de DevOps observadas en la literatura: mayor frecuencia de despliegue y menor MTTR.
- A diferencia de estudios que implementan observabilidad avanzada, Gerson se mantiene en un nivel inicial de monitoreo con health checks y logging estructurado.
- El uso de Prisma y Next.js coincide con prácticas modernas para aplicaciones web full-stack ligeras y seguras.

### 4.2.3. Limitaciones Encontradas

- **Escalabilidad de K8s**: solo una réplica en producción limita la resiliencia.
- **Gestión de secretos**: `k8s/secret.yaml` usa base64 y credenciales débiles, requiere Vault o servicio de secretos.
- **Monitoreo avanzado**: falta integración con Prometheus/Grafana o APM para métricas detalladas.
- **Cobertura de frontend**: no hay evidencia de pruebas E2E ni cobertura completa de UI.
- **Dependencia de Next.js API Routes**: adecuada para este tamaño de app, pero puede requerir separación de servicios en crecimiento.

---

## 4.3. Tabla de FODA

| FODA | Elementos específicos de GERSON |
|------|-------------------------------|
| Fortalezas | - Entorno DevOps integrado
- Despliegues automatizados
- Arquitectura full-stack unificada
- Roles definidos y control de acceso
- Logging estructurado, health checks
|
| Oportunidades | - Agregar monitoreo avanzado
- Escalar a 3+ réplicas en Kubernetes
- Implementar gestión de secretos segura
- Añadir pruebas E2E y de integración
- Usar Terraform/Helm para IaC más robusta
|
| Debilidades | - Configuración actual de secrets inadecuada
- Una sola réplica en K8s
- Monitoreo técnico limitado
- Cobertura de UI / E2E incompleta
|
| Amenazas | - Exposición de credenciales si se versiona secret.yaml
- Crecimiento rápido puede necesitar microservicios
- Dependencia de una sola base de datos PostgreSQL sin réplicas
- Cambios en Next.js/Prisma requieren actualización constante
|

---

## Conclusión del Capítulo

Los resultados de Gerson muestran que la aplicación se benefició claramente de la adopción DevOps. Se lograron mejoras tangibles en frecuencia de despliegue, tiempo de restauración y calidad de software, mientras que las principales áreas restantes son escalabilidad, gestión de secretos y monitoreo avanzado.
