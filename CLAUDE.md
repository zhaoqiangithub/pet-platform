# 宠物平台 Monorepo - 全局宪法

## 项目概述
PetPal是一个跨平台宠物服务平台，支持Web、iOS、Android三端。后端采用Spring Cloud微服务架构，部署在Kubernetes上。

## 核心原则
- **跨平台优先**：前端使用Expo + React Native Web，一套代码运行三端。
- **微服务化**：后端按业务域拆分为独立微服务，每个服务独立数据库、独立部署。
- **云原生**：所有服务容器化，K8s编排，基础设施即代码。
- **契约驱动**：前后端通过OpenAPI契约通信，服务间通过Feign调用。

## 目录结构
| 模块       | 路径                             | 技术栈                  | 关键文件                          |
| ---------- | -------------------------------- | ----------------------- | --------------------------------- |
| 前端跨平台 | `/frontend/`                     | Expo + React Native Web | `App.tsx`, `package.json`         |
| 用户服务   | `/backend/user-service/`         | Spring Boot + MyBatis   | `UserApplication.java`            |
| 宠物服务   | `/backend/pet-service/`          | Spring Boot             | `PetApplication.java`             |
| 商品服务   | `/backend/product-service/`      | Spring Boot             | `ProductApplication.java`         |
| 订单服务   | `/backend/order-service/`        | Spring Boot             | `OrderApplication.java`           |
| 预约服务   | `/backend/appointment-service/`  | Spring Boot             | `AppointmentApplication.java`     |
| 问诊服务   | `/backend/consult-service/`      | Spring Boot             | `ConsultApplication.java`         |
| 动态服务   | `/backend/feed-service/`         | Spring Boot             | `FeedApplication.java`            |
| 通知服务   | `/backend/notification-service/` | Spring Boot             | `NotificationApplication.java`    |
| 网关       | `/backend/gateway-service/`      | Spring Cloud Gateway    | `GatewayApplication.java`         |
| 文档       | `/docs/`                         | Markdown + OpenAPI      | `api-contracts/`, `requirements/` |
| K8s配置    | `/k8s/`                          | YAML                    | `deployments/`, `services/`       |
| 基础设施   | `/infrastructure/`               | Docker + K8s            | `jenkins/`, `harbor/`            |

## 开发环境要求
- Node.js 20+ (前端)
- Java 21 (后端)
- Docker + Kubernetes (可选本地如 kind/minikube)
- pnpm (前端包管理)
- Maven (后端构建)

## 常用命令（在根目录执行）
```bash
# 前端开发
cd frontend && pnpm web          # 启动Web
cd frontend && pnpm ios           # 启动iOS模拟器
cd frontend && pnpm android       # 启动Android模拟器
cd frontend && pnpm test          # 运行前端测试
```

# 后端构建（所有服务）
cd backend && mvn clean package

# 启动单个服务（开发模式）
cd backend/user-service && mvn spring-boot:run

# 构建Docker镜像（使用Jib）
cd backend/user-service && mvn jib:build -Dimage=myregistry/pet-user-service

# 部署到K8s
kubectl apply -f k8s/user-service/

# 全量测试
./scripts/test-all.sh

# 关键规则（AI必须遵守）
## 架构边界
前端只能通过网关调用后端API，禁止直接访问微服务。

微服务之间只能通过OpenFeign调用，禁止直接数据库访问其他服务。

每个微服务拥有独立的数据库，数据库命名pet_{service_name}。

修改API必须同步更新/docs/api-contracts/中的OpenAPI契约。

## 基础设施即代码与部署配置生成规则

### 核心原则
- **所有服务必须容器化**：每个后端微服务和前端Web应用都需提供`Dockerfile`，使用多阶段构建减小镜像体积。
- **Kubernetes配置与代码同源**：所有K8s YAML文件存放在`/k8s/`目录下，通过Kustomize管理环境差异。
- **AI同步生成**：在创建或修改服务时，AI应**同步生成或更新**对应的Dockerfile和K8s基础YAML模板，确保部署配置与代码变更一致。

### AI生成指令
- **创建新服务时**：AI必须自动生成：
    - 后端服务：在服务根目录生成`Dockerfile`，参考后端规范（见`@./backend/CLAUDE.md`）。
    - 前端Web（如需容器化）：在`/frontend`生成`Dockerfile`，参考前端规范（见`@./frontend/CLAUDE.md`）。
    - K8s基础配置：在`/k8s/base/{service-name}/`下生成`deployment.yaml`、`service.yaml`、`configmap.yaml`、`secret.yaml`（模板）。
- **修改服务时**：若变更涉及环境变量、端口、资源需求等，AI应同步更新对应的K8s ConfigMap或Deployment配置，并确保环境覆盖（`overlays`）正确。
- **添加外部依赖**：若新增依赖（如Redis、Kafka），AI应在`docker-compose.yml`（本地开发）和K8s基础配置中同步添加。

### 配置文件更新触发条件
AI仅在以下情形自动更新Docker/K8s配置：
1. **服务创建**：新建微服务时，生成全套基础配置。
2. **依赖变更**：检测到`pom.xml`或`package.json`新增依赖（如数据库驱动、消息队列客户端），若该依赖需要外部基础设施，则同步更新`docker-compose.yml`和K8s base中对应的服务定义。
3. **基础镜像版本升级**：当项目统一升级JDK/Node基础版本时，AI需批量更新所有服务的Dockerfile。
4. **环境变量增减**：当服务代码中新增或移除环境变量（如`@Value`或`process.env`），AI需同步更新对应的ConfigMap和（如有必要）部署文件。
5. **端口或协议修改**：当服务监听端口或通信协议（如HTTP/gRPC）变更，AI需更新Service和Ingress配置。
6. **资源配额调整**：根据性能测试反馈或运维要求，AI可协助调整Deployment中的`resources`字段，但需人工确认。

**不触发更新的情形**：纯业务逻辑修改、不涉及外部依赖的代码重构、测试代码变更等，不会自动更新部署配置。

### 配置验证自动化
AI在生成或更新Docker/K8s配置后，必须自动执行以下验证：
- **Dockerfile**：使用`hadolint`进行静态检查，并尝试`docker build`验证可构建性。
- **K8s YAML**：使用`kubeconform`验证Schema正确性，并通过`kustomize build`生成完整配置检查。
- **本地部署模拟**（可选）：在PR前，AI可协助启动`kind`或`minikube`，将配置部署到本地集群，并运行健康检查确认服务启动成功。

若验证失败，AI应分析错误原因并修正配置，直至通过。这些验证应在配置变更后立即进行，确保提交的配置是“绿色”的。

### 配置验证职责划分
| 验证类型 | 执行时机 | 工具 | 责任方 |
|---------|---------|------|--------|
| 语法验证 | PR前 | hadolint, kubeconform | 开发者（AI辅助） |
| 可构建性验证 | PR前 | docker build | 开发者（AI辅助） |
| 部署正确性 | PR后（测试环境） | 实际部署 + E2E | CI/CD |
| 运行时行为 | PR后（测试环境） | 健康检查 + 功能测试 | CI/CD |

**规则**：PR前只验证“配置是否正确”，PR后验证“部署是否能运行”。

引用文档：`@./k8s/CLAUDE.md` 提供详细K8s配置规则。

## 基础设施部署

### 目录结构
```
infrastructure/
├── jenkins/           # CI/CD 服务
│   ├── docker-compose.yml
│   ├── install.sh
│   ├── k8s/
│   │   └── deployment.yaml
│   └── Jenkinsfile    # CI/CD Pipeline 模板
├── harbor/            # 私有镜像仓库
│   ├── docker-compose.yml
│   ├── harbor.yml
│   ├── harbor.env
│   ├── nginx.conf
│   ├── install.sh
│   ├── generate-certs.sh
│   └── k8s/
│       └── deployment.yaml
└── README.md
```

### 快速启动（开发环境）

```bash
# 1. 安装 Harbor
cd infrastructure/harbor
chmod +x install.sh generate-certs.sh
./install.sh

# 2. 安装 Jenkins
cd infrastructure/jenkins
chmod +x install.sh
./install.sh
```

### 依赖版本（与项目一致）

| 组件 | 版本 | 说明 |
|------|------|------|
| Jenkins | 2.446.1-lts | 稳定版 |
| Harbor | 2.10.0 | 稳定版 |
| JDK | 17 | 与项目一致 |

### CI/CD 流程
1. 代码 push → GitHub
2. Jenkins 自动构建 (单元测试 + 打包)
3. 构建 Docker 镜像
4. 推送到 Harbor
5. 部署到 K8s (可选)

### 常用命令

```bash
# Harbor
cd infrastructure/harbor
docker compose up -d      # 启动
docker compose down       # 停止

# Jenkins
cd infrastructure/jenkins
docker compose up -d      # 启动
docker compose logs -f   # 查看日志
```

## 代码质量
前端：必须通过跨平台测试（iOS/Android/Web），使用Platform.select处理差异。

后端：所有服务必须实现统一异常处理、统一响应格式。

测试：新功能必须包含单元测试和E2E测试场景（YAML描述）,开发需求同时根据测试场景生成前后端对应的测试代码。

安全：敏感数据加密存储，日志脱敏，JWT在网关统一鉴权。

## 文档引用
需求文档：@./docs/requirements/

API契约：@./docs/api-contracts/

测试场景：@./docs/test-scenarios/

架构决策：@./docs/decisions/

## 已知陷阱
前端热更新失效：检查Metro配置，清除缓存pnpm start --reset-cache

跨域问题：网关CORS需配置允许前端域名

服务发现延迟：调整Nacos心跳间隔

数据库连接池泄露：监控HikariCP指标

K8s Pod OOMKill：配置JVM内存参数-XX:+UseContainerSupport

版本记录
2026-03-14 v1.0：初始版本，定义Monorepo架构