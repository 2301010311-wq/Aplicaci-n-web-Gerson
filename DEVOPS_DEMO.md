# DevOps Demo Guide

This file is a quick script to demonstrate Git, Docker, Jenkins, and Kubernetes usage in this project.

## 1) Git evidence

```powershell
git status
git add .
git commit -m "chore: prepare devops baseline"
git log --oneline -n 5
```

## 2) Local database + Prisma evidence

```powershell
npm run db:generate
npm run db:deploy
npm run db:test
npm run db:seed
```

Expected:
- `Database connection OK: true`
- Seed execution completed

## 3) Docker evidence

```powershell
docker compose up --build -d
docker compose ps
docker compose logs backend --tail 50
```

Expected:
- `postgres` and `backend` are `Up`
- Backend is reachable at `http://localhost:3000`

## 4) Kubernetes evidence

```powershell
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl get pods
kubectl get svc
```

Expected:
- backend and postgres pods in `Running`
- `backend-service` exposed as `NodePort` (`30080`)

## 5) Jenkins evidence

Use this repository in Jenkins Pipeline job and point to `Jenkinsfile`.

Expected stages:
- `Build` (Docker image build)
- `Test` (runs only when test script exists)
- `Deploy` (simulated with echo)

## 6) Demo closing checklist

- Git repository initialized
- Prisma connected to PostgreSQL
- Docker services running
- Kubernetes manifests applied
- Jenkins pipeline stages visible
