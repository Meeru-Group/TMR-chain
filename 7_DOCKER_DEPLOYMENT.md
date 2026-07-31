# ============================================================================
# Dockerfile for TMR Chain Node
# ============================================================================
# Save as: Dockerfile

FROM node:18-alpine

LABEL maintainer="TMR Chain Team <contact@tmr-chain.io>"
LABEL description="TMR Chain - Layer-1 Hybrid Consensus Blockchain"
LABEL version="1.0.0"

# Set working directory
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    curl \
    git \
    bash

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy application code
COPY . .

# Create necessary directories
RUN mkdir -p data/{blocks,contracts} logs configs

# Expose ports
EXPOSE 8545 3000 4001 4000 30303 8546

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Set environment variables
ENV NODE_ENV=production
ENV LOG_LEVEL=info

# Volume mounts
VOLUME /app/data
VOLUME /app/logs

# Start command
CMD ["node", "src/index.js"]

# ============================================================================
# Docker Compose Configuration
# ============================================================================
# Save as: docker-compose.yml

version: '3.9'

services:
  tmr-node-1:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: tmr-chain-node-1
    hostname: tmr-node-1
    ports:
      - "8545:8545"    # JSON-RPC
      - "3000:3000"    # REST API
      - "4001:4001"    # Explorer
      - "4000:4000"    # Wallet API
      - "30303:30303"  # P2P
    environment:
      NODE_ENV: production
      CHAIN_ID: 5524050
      AUTOMINE: "true"
      MINER_ADDRESS: "0x742d35Cc6634C0532925a3b844Bc029e4f42fDf8"
      RPC_PORT: 8545
      REST_PORT: 3000
      EXPLORER_PORT: 4001
      LOG_LEVEL: info
    volumes:
      - tmr-data-1:/app/data
      - tmr-logs-1:/app/logs
      - ./configs:/app/configs:ro
    networks:
      - tmr-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  tmr-node-2:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: tmr-chain-node-2
    hostname: tmr-node-2
    ports:
      - "8546:8545"
      - "3001:3000"
      - "4002:4001"
      - "4001:4000"
    environment:
      NODE_ENV: production
      CHAIN_ID: 5524050
      AUTOMINE: "false"
      RPC_PORT: 8545
      REST_PORT: 3000
      LOG_LEVEL: info
    volumes:
      - tmr-data-2:/app/data
      - tmr-logs-2:/app/logs
    networks:
      - tmr-network
    restart: unless-stopped
    depends_on:
      - tmr-node-1
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  tmr-node-3:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: tmr-chain-node-3
    hostname: tmr-node-3
    ports:
      - "8547:8545"
      - "3002:3000"
      - "4003:4001"
      - "4002:4000"
    environment:
      NODE_ENV: production
      CHAIN_ID: 5524050
      AUTOMINE: "false"
      RPC_PORT: 8545
      REST_PORT: 3000
      LOG_LEVEL: info
    volumes:
      - tmr-data-3:/app/data
      - tmr-logs-3:/app/logs
    networks:
      - tmr-network
    restart: unless-stopped
    depends_on:
      - tmr-node-1
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Optional: Monitoring with Prometheus
  prometheus:
    image: prom/prometheus:latest
    container_name: tmr-prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - tmr-prometheus-data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
    networks:
      - tmr-network
    restart: unless-stopped

  # Optional: Grafana for visualization
  grafana:
    image: grafana/grafana:latest
    container_name: tmr-grafana
    ports:
      - "3100:3000"
    environment:
      GF_SECURITY_ADMIN_PASSWORD: admin
      GF_USERS_ALLOW_SIGN_UP: "false"
    volumes:
      - tmr-grafana-data:/var/lib/grafana
    networks:
      - tmr-network
    restart: unless-stopped
    depends_on:
      - prometheus

volumes:
  tmr-data-1:
  tmr-data-2:
  tmr-data-3:
  tmr-logs-1:
  tmr-logs-2:
  tmr-logs-3:
  tmr-prometheus-data:
  tmr-grafana-data:

networks:
  tmr-network:
    driver: bridge

# ============================================================================
# Kubernetes Deployment Configuration
# ============================================================================
# Save as: k8s/tmr-chain-deployment.yaml

apiVersion: v1
kind: Namespace
metadata:
  name: tmr-chain

---
apiVersion: v1
kind: ConfigMap
metadata:
  name: tmr-config
  namespace: tmr-chain
data:
  .env: |
    NODE_ENV=production
    CHAIN_ID=5524050
    AUTOMINE=true
    RPC_PORT=8545
    REST_PORT=3000
    LOG_LEVEL=info

---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: tmr-node
  namespace: tmr-chain
spec:
  serviceName: tmr-node
  replicas: 3
  selector:
    matchLabels:
      app: tmr-node
  template:
    metadata:
      labels:
        app: tmr-node
    spec:
      containers:
      - name: tmr-node
        image: tmr-chain:latest
        imagePullPolicy: IfNotPresent
        ports:
        - containerPort: 8545
          name: rpc
        - containerPort: 3000
          name: rest-api
        - containerPort: 30303
          name: p2p
        envFrom:
        - configMapRef:
            name: tmr-config
        volumeMounts:
        - name: tmr-data
          mountPath: /app/data
        - name: tmr-logs
          mountPath: /app/logs
        resources:
          requests:
            cpu: "1"
            memory: "2Gi"
          limits:
            cpu: "2"
            memory: "4Gi"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 5
          timeoutSeconds: 3
  volumeClaimTemplates:
  - metadata:
      name: tmr-data
    spec:
      accessModes: [ "ReadWriteOnce" ]
      storageClassName: fast-ssd
      resources:
        requests:
          storage: 20Gi
  - metadata:
      name: tmr-logs
    spec:
      accessModes: [ "ReadWriteOnce" ]
      storageClassName: standard
      resources:
        requests:
          storage: 5Gi

---
apiVersion: v1
kind: Service
metadata:
  name: tmr-node-service
  namespace: tmr-chain
spec:
  type: LoadBalancer
  ports:
  - port: 8545
    targetPort: 8545
    name: rpc
  - port: 3000
    targetPort: 3000
    name: rest-api
  - port: 30303
    targetPort: 30303
    name: p2p
  selector:
    app: tmr-node

---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: tmr-node-hpa
  namespace: tmr-chain
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: StatefulSet
    name: tmr-node
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80

# ============================================================================
# Docker Compose Override for Development
# ============================================================================
# Save as: docker-compose.override.yml

version: '3.9'

services:
  tmr-node-1:
    build:
      context: .
      dockerfile: Dockerfile
      target: development
    environment:
      NODE_ENV: development
      LOG_LEVEL: debug
    volumes:
      - .:/app
      - /app/node_modules
    command: npm run dev

# ============================================================================
# Build and Run Instructions
# ============================================================================
# 
# DOCKER BUILD:
# docker build -t tmr-chain:latest .
#
# RUN SINGLE NODE:
# docker run -d \
#   -p 8545:8545 \
#   -p 3000:3000 \
#   -v tmr-data:/app/data \
#   --name tmr-node \
#   tmr-chain:latest
#
# RUN CLUSTER (3 nodes):
# docker-compose up -d
#
# VIEW LOGS:
# docker-compose logs -f tmr-node-1
#
# STOP CLUSTER:
# docker-compose down
#
# DEPLOY TO KUBERNETES:
# kubectl apply -f k8s/tmr-chain-deployment.yaml
#
# ============================================================================
