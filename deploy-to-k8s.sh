#!/bin/bash
set -e

echo "🚀 Deploying Synapse to Kubernetes..."
echo ""

# Step 1: Create namespace
echo "📁 Creating synapse namespace..."
kubectl create namespace synapse 2>/dev/null || echo "   Namespace already exists"
echo ""

# Step 2: Create secrets if they don't exist
echo "🔐 Setting up secrets..."
if [ ! -f k8s/secrets.yaml ]; then
    echo "   Creating secrets.yaml from template..."
    cp k8s/secrets.yaml.example k8s/secrets.yaml
    echo "   ✅ secrets.yaml created (using dev defaults)"
else
    echo "   ✅ secrets.yaml already exists"
fi
echo ""

# Step 3: Apply manifests
echo "🔧 Applying Kubernetes manifests..."
cd k8s

echo "   Applying PVC (persistent storage)..."
kubectl apply -f pvc.yaml

echo "   Applying secrets..."
kubectl apply -f secrets.yaml

echo "   Applying services..."
kubectl apply -f service.yaml

echo "   Applying deployments..."
kubectl apply -f deployment.yaml

cd ..
echo ""

# Step 4: Wait a bit for pods to start
echo "⏳ Waiting for pods to initialize (10 seconds)..."
sleep 10
echo ""

# Step 5: Check status
echo "📊 Current status:"
kubectl get pods -n synapse
echo ""

echo "✅ Deployment complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Check pod status: kubectl get pods -n synapse"
echo "   2. MongoDB should be Running (1/1)"
echo "   3. Backend/Frontend will show ImagePullBackOff (expected - no images yet)"
echo ""
echo "🔍 To see detailed pod info:"
echo "   kubectl describe pod <pod-name> -n synapse"
echo ""
echo "📦 To fix ImagePullBackOff, you need to either:"
echo "   Option 1: Build images locally and load into Minikube"
echo "   Option 2: Push to GitHub Container Registry (push to main branch)"
echo ""
