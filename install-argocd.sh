#!/bin/bash
set -e

echo "🎯 Installing ArgoCD..."
echo ""

# Step 1: Create namespace
echo "📁 Creating argocd namespace..."
kubectl create namespace argocd 2>/dev/null || echo "   Namespace already exists"
echo ""

# Step 2: Install ArgoCD
echo "📦 Installing ArgoCD manifests..."
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
echo ""

# Step 3: Wait for pods
echo "⏳ Waiting for ArgoCD pods to be ready (this may take 2-3 minutes)..."
kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=argocd-server -n argocd --timeout=300s
echo ""

# Step 4: Get admin password
echo "🔐 ArgoCD Admin Credentials:"
echo "   Username: admin"
echo -n "   Password: "
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d
echo ""
echo ""

# Step 5: Instructions
echo "✅ ArgoCD installed successfully!"
echo ""
echo "🌐 To access ArgoCD UI:"
echo "   1. Run: kubectl port-forward svc/argocd-server -n argocd 8080:443"
echo "   2. Open: https://localhost:8080"
echo "   3. Login with credentials above"
echo "   4. Accept the self-signed certificate warning"
echo ""
echo "📊 Check ArgoCD pods:"
echo "   kubectl get pods -n argocd"
echo ""
