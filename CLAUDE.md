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
| K8s配置    | `/infrastructure/k8s/`         | YAML                    | `feed-service/`                 |
| 基础设施   | `/infrastructure/`               | Docker + K8s            | `jenkins/`, `harbor/`, `k8s/` |

## 开发环境要求
- Node.js 20+ (前端)
- Java 21 (后端)
- Docker + Kubernetes (可选本地如 kind/minikube)
- pnpm (前端包管理)
- Maven (后端构建)

## Claude Code 最佳实践

### 敏感信息处理原则

当遇到以下情况时，**必须向用户询问**，不要猜测：

1. **账号/密码不确定**：如 Docker Hub、GitHub、Harbor 等服务的登录凭据
2. **配置值不确定**：如服务器 IP、端口、代理地址等
3. **环境变量缺失**：如 .env 文件中未定义的变量

**询问模板**：
```
请提供以下信息以便继续：
- [服务名称] 的用户名/密码
- 或确认是否使用 [默认值]
```

**原因**：盲目猜测会导致解决方案方向错误，浪费时间。

---

### MCP (Model Context Protocol) 扩展

项目已配置以下 MCP 服务：

#### Playwright - 浏览器自动化
```bash
# 已配置（通过 npx @playwright/mcp@latest）
# 用于 E2E 测试、页面交互验证
claude mcp list  # 查看 MCP 状态
```

**使用场景**：
- E2E 测试：自动打开浏览器执行用户操作
- 页面验证：检查元素存在性、点击按钮、填写表单
- 视觉回归测试：截图对比 UI 变化

**使用示例**：
```
使用 Playwright 打开 http://localhost:8080 并验证页面包含 "Jenkins" 文字
```

#### 添加新的 MCP
```bash
# 添加 MCP 服务
claude mcp add <name> <command>

# 示例：添加 Puppeteer
claude mcp add puppeteer npx @puppeteer/mcp

# 示例：添加 GitHub
claude mcp add github github.com/github/copilot-mcp-game
```

### CLI 命令技巧

```bash
# 使用 /help 获取帮助
/help

# 使用 /skills 查看可用技能
/skills

# 使用 /mcp 查看 MCP 信息
/mcp
```

### 对话技巧

1. **明确任务**：尽量详细描述需求，包括期望的结果
2. **提供上下文**：可以引用文件（如 `@./docs/requirements/`）
3. **分步执行**：复杂任务分成多个小步骤
4. **检查结果**：重要操作后验证结果

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

# Git 提交规范

### 重要规则
- **禁止随意提交代码**：AI 不得未经用户允许擅自提交代码到 Git
- **提交前必须确认**：每次提交前必须明确告知用户提交内容，待用户同意后再执行
- **feature 分支流程**：所有功能开发必须在 feature 分支进行，通过 PR 合并到 dev 分支
- **PR 审批机制**：合并到 dev 或 main 分支需要经过人工审批，禁止自动合并

### 分支策略
| 分支 | 用途 | 合并方式 |
|------|------|----------|
| `main` | 生产环境 | PR + 至少1人审批 |
| `dev` | 开发/测试环境 | PR + 至少1人审批 |
| `feature/*` | 功能开发 | PR 合并到 dev |
| `fix/*` | 修复开发 | PR 合并到 dev |

### 提交前的确认内容
AI 需要向用户确认以下信息：
1. 提交的目标分支
2. 提交的具体内容（哪些文件、什么改动）
3. 提交信息（commit message）

---

# 关键规则（AI必须遵守）
## 架构边界
前端只能通过网关调用后端API，禁止直接访问微服务。

微服务之间只能通过OpenFeign调用，禁止直接数据库访问其他服务。

每个微服务拥有独立的数据库，数据库命名pet_{service_name}。

修改API必须同步更新/docs/api-contracts/中的OpenAPI契约。

## 基础设施即代码与部署配置生成规则

### 核心原则
- **所有服务必须容器化**：每个后端微服务和前端Web应用都需提供`Dockerfile`，使用多阶段构建减小镜像体积。
- **Kubernetes配置与代码同源**：所有K8s YAML文件存放在`/infrastructure/k8s/`目录下，通过Kustomize管理环境差异。
- **AI同步生成**：在创建或修改服务时，AI应**同步生成或更新**对应的Dockerfile和K8s基础YAML模板，确保部署配置与代码变更一致。

### AI生成指令
- **创建新服务时**：AI必须自动生成：
    - 后端服务：在服务根目录生成`Dockerfile`，参考后端规范（见`@./backend/CLAUDE.md`）。
    - 前端Web（如需容器化）：在`/frontend`生成`Dockerfile`，参考前端规范（见`@./frontend/CLAUDE.md`）。
    - K8s基础配置：在`/infrastructure/k8s/{service-name}/`下生成`deployment.yaml`、`service.yaml`、`configmap.yaml`、`secret.yaml`（模板）。
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

引用文档：`@./infrastructure/k8s/CLAUDE.md` 提供详细K8s配置规则，`@./infrastructure/CLAUDE.md` 提供详细基础设施配置规则。

## 基础设施部署

本模块配置已迁移至 [infrastructure/CLAUDE.md](./infrastructure/CLAUDE.md)

### 服务器信息

| 环境 | IP/域名 | 用途 | 状态 |
|------|---------|------|------|
| CI/CD 服务器 | 100.75.140.35 | Jenkins + Docker Registry | 已部署 |
| 测试环境 K8s | 100.89.107.21 (node1) | 测试环境部署 | 已配置 |
| 生产环境 K8s | 位置保留 | 生产环境部署 | 待配置 |

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