# Production Deployment Guide

Deploy your MCP server to production with Docker Compose, Kubernetes, or cloud platforms.

## 🐳 Docker Compose (Recommended)

### Basic Docker Compose Setup

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  # Your existing GraphQL server
  graphql-api:
    build: .
    ports:
      - "4000:4000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - NODE_ENV=production

  # Apollo MCP Server
  mcp-server:
    build:
      context: .
      dockerfile: mcp.Dockerfile
    ports:
      - "5000:5000"
    environment:
      - GRAPHQL_ENDPOINT=http://graphql-api:4000/graphql
      - APOLLO_API_KEY=${APOLLO_API_KEY}
      - NODE_ENV=production
    env_file:
      - .env
    depends_on:
      - graphql-api
    restart: unless-stopped
    volumes:
      - ./tools:/app/tools:ro
      - ./.apollo:/app/.apollo:ro
```

### Start Production Stack

```bash
# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs mcp-server -f
```

## ☸️ Kubernetes Deployment

### MCP Server Deployment

```yaml
# k8s-mcp-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: apollo-mcp-server
spec:
  replicas: 2
  selector:
    matchLabels:
      app: apollo-mcp-server
  template:
    metadata:
      labels:
        app: apollo-mcp-server
    spec:
      containers:
      - name: mcp-server
        image: your-project-mcp:latest
        ports:
        - containerPort: 5000
        env:
        - name: GRAPHQL_ENDPOINT
          value: "http://graphql-service:4000/graphql"
        - name: APOLLO_API_KEY
          valueFrom:
            secretKeyRef:
              name: apollo-credentials
              key: api-key
        resources:
          requests:
            memory: "256Mi"
            cpu: "100m"
          limits:
            memory: "512Mi"
            cpu: "500m"
---
apiVersion: v1
kind: Service
metadata:
  name: apollo-mcp-service
spec:
  selector:
    app: apollo-mcp-server
  ports:
    - protocol: TCP
      port: 5000
      targetPort: 5000
  type: LoadBalancer
```

### Deploy to Kubernetes

```bash
# Create secrets
kubectl create secret generic apollo-credentials \
  --from-literal=api-key="your-apollo-api-key"

# Deploy
kubectl apply -f k8s-mcp-deployment.yaml

# Check status
kubectl get pods -l app=apollo-mcp-server
kubectl logs -l app=apollo-mcp-server -f
```

## ☁️ Cloud Platform Deployment

### Render (Easy Deploy)

1. Connect your GitHub repo to Render
2. Create a new Web Service
3. Configure:
   - **Build Command**: `docker build -f mcp.Dockerfile -t mcp-server .`
   - **Start Command**: Use Docker image
   - **Port**: 5000
4. Set environment variables in Render dashboard

### Railway

1. Connect GitHub repo to Railway
2. Railway auto-detects `mcp.Dockerfile`
3. Configure environment variables in Railway dashboard
4. Deploy automatically on git push

### AWS ECS/Fargate

```json
{
  "family": "apollo-mcp-server",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "containerDefinitions": [{
    "name": "mcp-server",
    "image": "your-ecr-repo/mcp-server:latest",
    "portMappings": [{
      "containerPort": 5000,
      "protocol": "tcp"
    }],
    "environment": [
      {"name": "GRAPHQL_ENDPOINT", "value": "https://your-graphql-api.com/graphql"},
      {"name": "NODE_ENV", "value": "production"}
    ]
  }]
}
```

## 🔒 Production Security

### Environment Configuration

```bash
# Production .env
NODE_ENV="production"
LOG_LEVEL="info"
EXPOSE_ERROR_DETAILS="false"
DEVELOPMENT_MODE="false"
HOT_RELOAD="false"
PLAYGROUND_ENABLED="false"

# Security settings
RATE_LIMIT_REQUESTS_PER_MINUTE=30
MAX_QUERY_COMPLEXITY=500
MAX_QUERY_DEPTH=10
MAX_REQUEST_SIZE=1048576  # 1MB
```

### Secrets Management

**Docker Compose with secrets:**
```yaml
secrets:
  apollo_api_key:
    file: ./secrets/apollo_api_key.txt
    
services:
  mcp-server:
    secrets:
      - apollo_api_key
    environment:
      - APOLLO_API_KEY_FILE=/run/secrets/apollo_api_key
```

**Kubernetes secrets:**
```bash
kubectl create secret generic apollo-secrets \
  --from-literal=api-key="your-key" \
  --from-literal=auth-token="your-token"
```

### Network Security

**Docker network isolation:**
```yaml
networks:
  internal:
    driver: bridge
    
services:
  mcp-server:
    networks:
      - internal
```

**Load balancer with SSL:**
```yaml
# With Traefik
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.mcp.rule=Host(`mcp.yourdomain.com`)"
  - "traefik.http.routers.mcp.tls=true"
  - "traefik.http.routers.mcp.tls.certresolver=letsencrypt"
```

## 📊 Production Monitoring

### Health Checks

```yaml
# Docker Compose health check
services:
  mcp-server:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

### Metrics and Logging

```bash
# Enable metrics in .env
METRICS_ENABLED="true"
METRICS_PATH="/metrics"

# Structured logging
LOG_FORMAT="json"
LOG_LEVEL="info"
```

### Monitoring Stack

```yaml
# Add to docker-compose.yml
services:
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      
  grafana:
    image: grafana/grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
```

## 🚀 CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy MCP Server

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Build and push Docker image
      run: |
        echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
        docker build -f mcp.Dockerfile -t ${{ secrets.REGISTRY }}/mcp-server:${{ github.sha }} .
        docker push ${{ secrets.REGISTRY }}/mcp-server:${{ github.sha }}
    
    - name: Deploy to production
      run: |
        # Your deployment commands
        kubectl set image deployment/apollo-mcp-server mcp-server=${{ secrets.REGISTRY }}/mcp-server:${{ github.sha }}
```

### Rolling Updates

```bash
# Kubernetes rolling update
kubectl set image deployment/apollo-mcp-server \
  mcp-server=your-registry/mcp-server:new-version

# Docker Compose rolling update
docker-compose up -d --no-deps mcp-server
```

## 📈 Scaling

### Horizontal Scaling

```yaml
# Kubernetes horizontal pod autoscaler
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: mcp-server-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: apollo-mcp-server
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

### Load Balancing

```yaml
# Docker Compose with multiple replicas
services:
  mcp-server:
    build:
      dockerfile: mcp.Dockerfile
    deploy:
      replicas: 3
    ports:
      - "5000-5002:5000"
      
  nginx:
    image: nginx
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
```

## 🔧 Maintenance

### Backup Strategy

```bash
# Backup configuration
tar -czf mcp-backup-$(date +%Y%m%d).tar.gz \
  .env .apollo/ tools/ docs/

# Backup to cloud storage
aws s3 cp mcp-backup-$(date +%Y%m%d).tar.gz s3://your-backup-bucket/
```

### Updates

```bash
# Update MCP server
docker pull apollo/mcp-server:latest
docker-compose up -d mcp-server

# Or with zero downtime
docker-compose up -d --scale mcp-server=2 mcp-server
docker-compose up -d --scale mcp-server=1 mcp-server
```

## 📖 Next Steps

After deployment:
- Monitor application logs and metrics
- Set up alerting for critical failures
- Implement automated backups
- Document runbook procedures

For troubleshooting production issues, see [Troubleshooting Guide](troubleshooting.md).