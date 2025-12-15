# Synapse - Real-time WebSocket Chat

A learning project to understand the DevOps workflow: containerization, CI/CD, and Kubernetes deployment.

## What I Built

### 1. Application
- Backend: Node.js WebSocket server with MongoDB
- Frontend: React chat interface

### 2. Docker Containerization
- Multi-stage Dockerfile for backend (reduced image size by 40%)
- Optimized frontend build with Nginx

### 3. CI/CD Pipeline
- GitHub Actions workflow that runs on every push
- Runs linting and tests
- Builds Docker images
- Pushes to GitHub Container Registry

### 4. Kubernetes Deployment
- Deployed to Minikube cluster
- Created Deployment and Service manifests
- Backend, frontend, and MongoDB running as pods

### 5. GitOps with ArgoCD
- Installed ArgoCD on Kubernetes
- Watches Git repository for changes
- Automatically syncs manifests to cluster

### 6. Terraform (AWS)
- Created S3 bucket for static assets
- Set up IAM user with programmatic access
- Applied infrastructure with `terraform plan` and `apply`

## Tech Stack

**Backend**: Node.js, Express, WebSocket, MongoDB  
**Frontend**: React, TypeScript  
**DevOps**: Docker, GitHub Actions, Kubernetes, ArgoCD, Terraform

## Project Structure

```
synapse/
├── backend/              # Node.js server
│   ├── Dockerfile
│   └── src/
├── frontend/             # React app
│   ├── Dockerfile
│   └── src/
├── k8s/                  # Kubernetes manifests
│   ├── deployment.yaml
│   └── service.yaml
├── terraform/            # AWS infrastructure
│   └── main.tf
└── .github/workflows/
    └── ci.yml            # CI/CD pipeline
```

## Quick Start

### Run Locally

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

### Build Docker Images

```bash
docker build -t synapse-backend ./backend
docker build -t synapse-frontend ./frontend
```

### Deploy to Kubernetes

```bash
# Start Minikube
minikube start

# Create namespace
kubectl create namespace synapse

# Deploy
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml

# Check status
kubectl get pods -n synapse

# Access app
minikube ip  # Get IP
# Frontend: http://<ip>:30080
# Backend: http://<ip>:30800
```

### Setup ArgoCD

```bash
# Install
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Access UI
kubectl port-forward svc/argocd-server -n argocd 8080:443
# Open: https://localhost:8080

# Get password
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d
```

### Apply Terraform

```bash
cd terraform
terraform init
terraform plan
terraform apply
```

## What I Learned

- Docker multi-stage builds and image optimization
- Setting up CI/CD pipelines with GitHub Actions
- Kubernetes basics: Deployments, Services, namespaces
- GitOps principles with ArgoCD
- Infrastructure as Code with Terraform

## Notes

This is a learning project focused on DevOps fundamentals. The application is intentionally simple to keep focus on infrastructure and deployment practices.
