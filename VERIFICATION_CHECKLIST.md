# ✅ DevOps Pipeline Verification Checklist

## Pre-Commit Verification

Run these commands before committing to ensure everything works:

### 1. Backend Verification

```bash
cd backend

# Lint check (should show 0 errors, 46 warnings)
npm run lint

# Run tests (should show 8/8 passing)
npm test

# Build check (should complete without errors)
npm run build

cd ..
```

**Expected Output**:
- ✅ Lint: 0 errors, 46 warnings (all `any` type warnings)
- ✅ Tests: 8 passed
- ✅ Build: Successful

---

### 2. Frontend Verification

```bash
cd frontend

# Lint check (should show 0 errors, 16 warnings)
npm run lint

# Build check (should complete without errors)
npm run build

cd ..
```

**Expected Output**:
- ✅ Lint: 0 errors, 16 warnings
- ✅ Build: Successful (dist/ folder created)

---

### 3. Kubernetes Verification

```bash
# Check Minikube status
minikube status

# Check cluster
kubectl get nodes

# Check synapse namespace
kubectl get pods -n synapse
kubectl get services -n synapse

# Check ArgoCD namespace
kubectl get pods -n argocd
```

**Expected Output**:
- ✅ Minikube: Running
- ✅ Node: minikube (Ready)
- ✅ MongoDB pod: Running (1/1)
- ✅ Backend pods: ImagePullBackOff (expected)
- ✅ Frontend pods: ImagePullBackOff (expected)
- ✅ ArgoCD pods: All Running (7/7)

---

### 4. ArgoCD Access Verification

```bash
# Get ArgoCD password
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d && echo

# Port forward (run in separate terminal)
kubectl port-forward svc/argocd-server -n argocd 8080:443

# Access: https://localhost:8080
# Username: admin
# Password: <from above command>
```

**Expected Output**:
- ✅ Password retrieved successfully
- ✅ Port forward active
- ✅ ArgoCD UI accessible at https://localhost:8080

---

### 5. File Structure Verification

```bash
# Check all required files exist
ls -la .github/workflows/ci.yml
ls -la backend/eslint.config.js
ls -la backend/vitest.config.ts
ls -la backend/src/__tests__/
ls -la k8s/deployment.yaml
ls -la k8s/service.yaml
ls -la k8s/pvc.yaml
ls -la k8s/secrets.yaml
ls -la docs/DEVOPS_ROADMAP.md
ls -la docs/KUBERNETES_QUICKSTART.md
ls -la docs/FINAL_DEVOPS_SUMMARY.md
```

**Expected Output**:
- ✅ All files exist
- ✅ No "No such file or directory" errors

---

### 6. Git Status Check

```bash
git status
```

**Expected Changes**:
```
New files:
- .github/workflows/ci.yml
- backend/eslint.config.js
- backend/vitest.config.ts
- backend/src/__tests__/health.test.ts
- backend/src/__tests__/utils.test.ts
- k8s/ (entire folder)

Modified files:
- README.md
- backend/package.json
- backend/src/controllers/authController.ts
- backend/src/middlewares/*.ts
- frontend/eslint.config.js
- frontend/src/components/MessageBubble.tsx
- frontend/src/components/RoomInfoPanel.tsx
- frontend/src/pages/Profile.tsx
```

---

## Quick Verification Script

Save as `verify.sh` and run:

```bash
#!/bin/bash

echo "🔍 Starting verification..."
echo ""

# Backend
echo "📦 Backend checks..."
cd backend
npm run lint > /dev/null 2>&1 && echo "✅ Backend lint: PASS" || echo "❌ Backend lint: FAIL"
npm test > /dev/null 2>&1 && echo "✅ Backend tests: PASS" || echo "❌ Backend tests: FAIL"
npm run build > /dev/null 2>&1 && echo "✅ Backend build: PASS" || echo "❌ Backend build: FAIL"
cd ..

# Frontend
echo ""
echo "🎨 Frontend checks..."
cd frontend
npm run lint > /dev/null 2>&1 && echo "✅ Frontend lint: PASS" || echo "❌ Frontend lint: FAIL"
npm run build > /dev/null 2>&1 && echo "✅ Frontend build: PASS" || echo "❌ Frontend build: FAIL"
cd ..

# Kubernetes
echo ""
echo "☸️  Kubernetes checks..."
kubectl get nodes > /dev/null 2>&1 && echo "✅ Minikube: RUNNING" || echo "❌ Minikube: NOT RUNNING"
kubectl get pods -n synapse > /dev/null 2>&1 && echo "✅ Synapse namespace: EXISTS" || echo "❌ Synapse namespace: MISSING"
kubectl get pods -n argocd > /dev/null 2>&1 && echo "✅ ArgoCD namespace: EXISTS" || echo "❌ ArgoCD namespace: MISSING"

# Files
echo ""
echo "📁 File checks..."
[ -f .github/workflows/ci.yml ] && echo "✅ CI workflow: EXISTS" || echo "❌ CI workflow: MISSING"
[ -f k8s/deployment.yaml ] && echo "✅ K8s manifests: EXISTS" || echo "❌ K8s manifests: MISSING"
[ -f docs/KUBERNETES_QUICKSTART.md ] && echo "✅ Documentation: EXISTS" || echo "❌ Documentation: MISSING"

echo ""
echo "✨ Verification complete!"
```

Run with:
```bash
chmod +x verify.sh
./verify.sh
```

---

## Final Checklist Before Commit

- [ ] Backend lint passes (0 errors)
- [ ] Backend tests pass (8/8)
- [ ] Backend builds successfully
- [ ] Frontend lint passes (0 errors)
- [ ] Frontend builds successfully
- [ ] Minikube is running
- [ ] MongoDB pod is running
- [ ] ArgoCD pods are running (7/7)
- [ ] ArgoCD UI is accessible
- [ ] All documentation files created
- [ ] Git status shows expected changes
- [ ] No sensitive data in commits (check secrets.yaml is gitignored)

---

## Known Issues (Expected)

### ✅ These are NORMAL and EXPECTED:

1. **Backend/Frontend pods: ImagePullBackOff**
   - Reason: Docker images not pushed to GHCR yet
   - Fix: Build and push images or use local images
   - Status: Expected, not a blocker

2. **Linting warnings for `any` types**
   - Count: 62 warnings (46 backend + 16 frontend)
   - Reason: Intentionally left as warnings, not errors
   - Status: Acceptable for development

3. **Missing env vars in tests**
   - Message: "Missing env vars (expected in CI)"
   - Reason: Tests designed to work without env vars
   - Status: Expected behavior

---

## What Should NOT Happen

### ❌ These indicate problems:

1. **Linting errors** (not warnings)
   - Should be: 0 errors
   - If errors exist: Fix before committing

2. **Test failures**
   - Should be: 8/8 passing
   - If failing: Debug and fix

3. **Build failures**
   - Should be: Successful
   - If failing: Check TypeScript errors

4. **Minikube not running**
   - Should be: Running
   - If not: Run `minikube start`

5. **ArgoCD pods not running**
   - Should be: 7/7 Running
   - If not: Wait or reinstall ArgoCD

---

## Troubleshooting

### If backend lint/test/build fails:
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
npm run lint
npm test
npm run build
```

### If frontend lint/build fails:
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run lint
npm run build
```

### If Minikube is not running:
```bash
minikube delete
minikube start --driver=docker
```

### If ArgoCD pods are not ready:
```bash
kubectl delete namespace argocd
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

---

## Success Criteria

All of these should be true:

✅ Backend: 0 lint errors, 8 tests passing, build successful
✅ Frontend: 0 lint errors, build successful  
✅ Minikube: Running with 1 node Ready
✅ MongoDB: 1/1 pod Running
✅ ArgoCD: 7/7 pods Running
✅ Documentation: All files created
✅ Git: Changes staged and ready to commit

---

**If all checks pass, you're ready to commit! 🚀**

```bash
git add .
git commit -m "feat: implement complete DevOps pipeline with CI/CD and Kubernetes"
git push origin main
```
