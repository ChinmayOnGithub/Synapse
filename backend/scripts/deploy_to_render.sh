#!/bin/bash
set -e

echo "🚀 Starting deployment to Render..."

# Check if required environment variables are set
if [ -z "$RENDER_API_KEY" ]; then
  echo "❌ Error: RENDER_API_KEY is not set"
  exit 1
fi

if [ -z "$RENDER_SERVICE_ID" ]; then
  echo "❌ Error: RENDER_SERVICE_ID is not set"
  exit 1
fi

# Trigger deployment via Render API
echo "📡 Triggering deployment for service: $RENDER_SERVICE_ID"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
  "https://api.render.com/v1/services/$RENDER_SERVICE_ID/deploys" \
  -H "Authorization: Bearer $RENDER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"clearCache": "do_not_clear"}')

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 201 ] || [ "$HTTP_CODE" -eq 200 ]; then
  echo "✅ Deployment triggered successfully!"
  echo "Response: $BODY"
  exit 0
else
  echo "❌ Deployment failed with HTTP code: $HTTP_CODE"
  echo "Response: $BODY"
  exit 1
fi
