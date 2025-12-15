# Deployment Guide

## Deploy to Kubernetes

### 1. Start Minikube
```bash
minikube start --kubernetes-version=v1.31.0
```

### 2. Create Namespace
```bash
kubectl create namespace synapse
```

### 3. Deploy in Order
```bash
# Step 1: Create persistent storage for MongoDB
kubectl apply -f k8s/mongodb-pvc.yaml

# Step 2: Create secrets
kubectl apply -f k8s/secrets.yaml

# Step 3: Deploy applications
kubectl apply -f k8s/deployment.yaml

# Step 4: Expose services
kubectl apply -f k8s/service.yaml
```

### 4. Verify Deployment
```bash
# Check pods
kubectl get pods -n synapse

# Check services
kubectl get services -n synapse

# Check persistent volume
kubectl get pvc -n synapse
```

### 5. Access Application
```bash
# Get Minikube IP
minikube ip

# Access URLs:
# Frontend: http://<minikube-ip>:30080
# Backend: http://<minikube-ip>:30800
```

---

## MongoDB Details

**Username**: chinmay  
**Password**: 123456  
**Database**: synapse  
**Storage**: 1GB persistent volume

**Data persists** even if pod is deleted!

---

## Clean Up

### Remove application only:
```bash
kubectl delete namespace synapse
```

### Stop Minikube (keeps data):
```bash
minikube stop
```

### Delete everything:
```bash
minikube delete
```
