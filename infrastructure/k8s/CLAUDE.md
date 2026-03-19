# Kubernetes部署配置指南

## 目录结构规范
k8s/
├── base/ # 与环境无关的基础配置
│ ├── namespace.yaml # 命名空间定义（dev/test/prod共用）
│ ├── user-service/ # 每个服务一个子目录
│ │ ├── deployment.yaml # 部署模板（含副本、镜像、探针、资源限制）
│ │ ├── service.yaml # Service模板（ClusterIP）
│ │ ├── configmap.yaml # 环境变量配置（键值对）
│ │ └── secret.yaml # 敏感信息模板（占位符）
│ ├── pet-service/
│ └── ...
├── overlays/ # 环境特定覆盖
│ ├── dev/
│ │ ├── kustomization.yaml # 引用base并patch
│ │ ├── user-service-patch.yaml # 如调整副本数、镜像tag、环境变量
│ │ └── ...
│ ├── test/
│ └── prod/
└── README.md

text

## 基础YAML模板生成规则

### deployment.yaml
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{SERVICE_NAME}}
  namespace: pet-{{ENV}}
spec:
  replicas: 1  # base中为1，环境覆盖可调整
  selector:
    matchLabels:
      app: {{SERVICE_NAME}}
  template:
    metadata:
      labels:
        app: {{SERVICE_NAME}}
    spec:
      containers:
      - name: {{SERVICE_NAME}}
        image: {{IMAGE}}:{{TAG}}  # 由CI替换
        ports:
        - containerPort: 8080
        envFrom:
        - configMapRef:
            name: {{SERVICE_NAME}}-config
        - secretRef:
            name: {{SERVICE_NAME}}-secret
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /actuator/health
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /actuator/health/readiness
            port: 8080
          initialDelaySeconds: 20
          periodSeconds: 5
```          
          
### service.yaml
```yaml
apiVersion: v1
kind: Service
metadata:
  name: {{SERVICE_NAME}}
  namespace: pet-{{ENV}}
spec:
  selector:
    app: {{SERVICE_NAME}}
  ports:
  - port: 80
    targetPort: 8080
  type: ClusterIP
```  
### configmap.yaml
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: {{SERVICE_NAME}}-config
  namespace: pet-{{ENV}}
data:
  SPRING_PROFILES_ACTIVE: {{ENV}}
```  
  
### 其他环境变量键值对（由AI根据服务配置生成）
secret.yaml（仅模板，实际值由CI/运维注入）
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: {{SERVICE_NAME}}-secret
  namespace: pet-{{ENV}}
type: Opaque
data:
  DATABASE_PASSWORD: {{BASE64_ENCODED_PASSWORD}}
  JWT_SECRET: {{BASE64_ENCODED_SECRET}}
```

### Kustomize使用规范
每个环境在overlays/下创建kustomization.yaml，内容示例：
```yaml
resources:
- ../../base/user-service
patchesStrategicMerge:
- user-service-patch.yaml
configMapGenerator:
- name: user-service-config
  behavior: merge
  literals:
  - LOG_LEVEL=DEBUG  # 开发环境覆盖
```
不要在base中硬编码环境差异，一律通过patches或configMapGenerator注入。

AI生成部署配置的指令
创建新服务时：AI应在/k8s/base/{service-name}/下生成上述四个YAML文件，填充占位符（如服务名、端口），并从服务配置文件（如application.yml）提取环境变量填充到ConfigMap。

修改服务配置时：AI应识别变更（如新增环境变量、修改端口），并同步更新对应的ConfigMap和Deployment（如端口变化需更新Service）。

环境覆盖：AI应根据服务类型和默认环境，在overlays/dev/中生成基础patch（如设置开发环境日志级别、镜像tag为latest）。

部署命令
bash
# 部署到开发环境
kubectl apply -k k8s/overlays/dev

# 查看状态
kubectl get pods -n pet-dev

# 更新镜像（修改patch后重新apply）
kubectl apply -k k8s/overlays/dev

# 滚动重启（当配置更新需要重启时）
kubectl rollout restart deployment/user-service -n pet-dev
注意事项
Secrets中的敏感数据禁止明文存储，base中的secret只作为模板，实际值由CI从安全渠道注入。

生产环境必须配置Ingress并启用TLS，相关配置放在overlays/prod/中。

所有镜像版本应在CI/CD中动态注入，不硬编码。

### K8s配置验证
AI生成或修改YAML后，应执行：

# 安装验证工具（若未安装）
# brew install kubeconform

# 验证base配置
kubeconform k8s/base/**/*.yaml

# 验证overlay配置
kustomize build k8s/overlays/dev | kubeconform

# 可选：使用kubeconform（更支持K8s 1.28+）
```