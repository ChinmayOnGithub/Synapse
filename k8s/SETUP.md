# Kubernetes + ArgoCD Setup Guide

## Prerequisites Installation

### 1. Install kubectl (Kubernetes CLI)

```bash
# Linux
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
chmod +x kubectl
sudo mv kubectl /usr/local/bin/

# Verify
kubectl version --client
```

### 2. Install Minikube

```bash
# Linux
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube

# Verify
minikube version
```

### 3. Start Minikube

```bash
# Start with Docker driver
minikube start --driver=docker

# Verify cluster is running
kubectl get nodes
```

## Deploy Synapse to Kubernetes

### 1. Apply Kubernetes Manifests

```bash
cd k8s

# Create namespace
kubectl create namespace synapse

# Apply all manifests
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml

# Check deployment status
kubectl get pods -n synapse
kubectl get services -n synapse
```

### 2. Access the Application

```bash
# Get Minikube IP
minikube ip

# Get NodePort
kubectl get service synapse-backend -n synapse

# Access backend
curl http://$(minikube ip):<NodePort>/healthz

# Or use port-forward
kubectl port-forward -n synapse service/synapse-backend 8000:8000
kubectl port-forward -n synapse service/synapse-frontend 5173:80
```

## Install ArgoCD

### 1. Install ArgoCD

```bash
# Create ArgoCD namespace
kubectl create namespace argocd

# Install ArgoCD
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Wait for ArgoCD pods to be ready
kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=argocd-server -n argocd --timeout=300s
```

### 2. Access ArgoCD UI

```bash
# Get initial admin password
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d

# Port forward to access UI
kubectl port-forward svc/argocd-server -n argocd 8080:443

# Access at: https://localhost:8080
# Username: admin
# Password: <from above command>
```

### 3. Install ArgoCD CLI (Optional)

```bash
# Linux
curl -sSL -o argocd-linux-amd64 https://github.com/argoproj/argo-cd/releases/latest/download/argocd-linux-amd64
sudo install -m 555 argocd-linux-amd64 /usr/local/bin/argocd
rm argocd-linux-amd64

# Login
argocd login localhost:8080
```

## Configure GitOps with ArgoCD

### 1. Create ArgoCD Application

```bash
# Apply the ArgoCD application manifest
kubectl apply -f argocd-application.yaml

# Or create via CLI
argocd app create synapse \
  --repo https://github.com/yourusername/synapse-chat.git \
  --path k8s \
  --dest-server https://kubernetes.default.svc \
  --dest-namespace synapse \
  --sync-policy automated
```

### 2. Sync Application

```bash
# Manual sync
argocd app sync synapse

# Check status
argocd app get synapse

# View in UI
# https://localhost:8080/applications/synapse
```

## Test GitOps Workflow

### 1. Update Image Tag

```bash
# Edit deployment.yaml
# Change image tag from :latest to :v1.0.0

git add k8s/deployment.yaml
git commit -m "Update backend image to v1.0.0"
git push origin main
```

### 2. Watch ArgoCD Sync

```bash
# ArgoCD will automatically detect changes and sync
argocd app get synapse --watch

# Or check in UI
```

## Useful Commands

### Minikube

```bash
# Start cluster
minikube start

# Stop cluster
minikube stop

# Delete cluster
minikube delete

# SSH into node
minikube ssh

# Dashboard
minikube dashboard
```

### kubectl

```bash
# Get all resources
kubectl get all -n synapse

# View logs
kubectl logs -f deployment/synapse-backend -n synapse

# Describe pod
kubectl describe pod <pod-name> -n synapse

# Execute command in pod
kubectl exec -it <pod-name> -n synapse -- /bin/sh

# Delete resources
kubectl delete -f deployment.yaml
```

### ArgoCD

```bash
# List applications
argocd app list

# Get app details
argocd app get synapse

# Sync app
argocd app sync synapse

# Delete app
argocd app delete synapse
```

## Troubleshooting

### Pods not starting

```bash
# Check pod status
kubectl get pods -n synapse

# View pod logs
kubectl logs <pod-name> -n synapse

# Describe pod for events
kubectl describe pod <pod-name> -n synapse
```

### ArgoCD not syncing

```bash
# Check ArgoCD application status
argocd app get synapse

# View sync status
kubectl get application synapse -n argocd -o yaml

# Check ArgoCD logs
kubectl logs -n argocd deployment/argocd-application-controller
```

### Image pull errors

```bash
# For private registries, create secret
kubectl create secret docker-registry ghcr-secret \
  --docker-server=ghcr.io \
  --docker-username=<username> \
  --docker-password=<token> \
  -n synapse

# Add to deployment.yaml
# imagePullSecrets:
#   - name: ghcr-secret
```

## Clean Up

```bash
# Delete Synapse resources
kubectl delete namespace synapse

# Delete ArgoCD
kubectl delete namespace argocd

# Stop Minikube
minikube stop

# Delete Minikube cluster
minikube delete
```
