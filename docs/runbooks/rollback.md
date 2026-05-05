# Runbook: rollback de backend en Kubernetes

## Objetivo
Restaurar rapidamente una version estable del backend cuando un despliegue falla en `staging` o `production`.

## Prerrequisitos
- Acceso al cluster de Kubernetes.
- `kubectl` configurado con permisos para el namespace.
- Nombre del deployment: `backend`.

## Senales de incidente
- `readinessProbe` en fallo continuo.
- Error rate elevado en API.
- Latencia alta sostenida.
- Smoke test `/api/health` en estado no exitoso.

## Procedimiento de rollback rapido
1. Verificar estado del rollout actual:
   - `kubectl -n default rollout status deployment/backend --timeout=60s`
2. Consultar historial de revisiones:
   - `kubectl -n default rollout history deployment/backend`
3. Ejecutar rollback a la revision anterior:
   - `kubectl -n default rollout undo deployment/backend`
4. Confirmar estabilizacion:
   - `kubectl -n default rollout status deployment/backend --timeout=180s`
   - `kubectl -n default get pods -l app=backend`
5. Validar endpoint de salud:
   - `curl -f https://TU_DOMINIO/api/health`

## Rollback a una revision especifica
Si necesitas volver a una revision concreta:
- `kubectl -n default rollout undo deployment/backend --to-revision=<N>`

## Verificaciones post-rollback
- API responde correctamente.
- Logs sin errores criticos nuevos.
- Metricas de latencia y error rate vuelven a rangos normales.

## Acciones posteriores
- Congelar despliegues hasta identificar causa raiz.
- Abrir incidente con timeline.
- Crear tarea de remediacion y test de regresion.
