# 🚀 Quick Start - Complete Your DevOps Pipeline

## ✅ What's Done (75%)

1. **Application**: Full-stack chat app with React + Node.js + MongoDB ✅
2. **CI/CD**: GitHub Actions pipeline (lint, test, build, Docker) ✅
3. **Minikube**: Kubernetes cluster running ✅

---

## 🎯 What's Left (25% - 15 minutes)

### Step 1: Deploy to Kubernetes (5 min)

```bash
./deploy-to-k8s.sh
```

This will:
- Create `synapse` namespace
- Create secrets from template
- Deploy MongoDB, backend, frontend
- Show pod status

**Expected**: MongoDB running, backend/frontend showing ImagePullBackOff (normal - no images yet)

---

### Step 2: Install ArgoCD (10 min)

```bash
./install-argocd.sh
```

This will:
- Create `argocd` namespace
- Install ArgoCD
- Wait for pods to be ready
- Show admin credentials

---

### Step 3: Access ArgoCD UI

```bash
# In a separate terminal, run:
kubectl port-forward svc/argocd-server -n argocd 8080:443

# Then open: https://localhost:8080
# Username: admin
# Password: (shown by install-argocd.sh)
```

---

## 🎉 When Complete

You'll have:
- ✅ Full CI/CD pipeline with GitHub Actions
- ✅ Kubernetes cluster with your app deployed
- ✅ ArgoCD for GitOps
- ✅ Complete DevOps portfolio project

---

## 📊 Verification Commands

```bash
# Check Minikube
minikube status

# Check application pods
kubectl get pods -n synapse

# Check ArgoCD pods
kubectl get pods -n argocd

# Check all resources
kubectl get all -n synapse
```

---

## 🐛 Troubleshooting

### ImagePullBackOff for backend/frontend?
**This is EXPECTED!** Docker images haven't been pushed yet.

**To fix** (optional):
```bash
# Option 1: Push to main branch (GitHub Actions will build images)
git push origin main

# Option 2: Build locally
cd backend
docker build -t synapse-backend:latest .
minikube image load synapse-backend:latest
# Then update deployment.yaml: imagePullPolicy: Never
```

### Minikube issues?
```bash
minikube delete
minikube start --kubernetes-version=v1.31.0
```

---

## 📝 Resume Line

> "Built complete CI/CD pipeline using GitHub Actions with automated linting, testing, and Docker image builds. Deployed microservices to Kubernetes using Minikube and implemented GitOps workflow with ArgoCD."

---

**Ready? Run `./deploy-to-k8s.sh` to continue!** 🚀
