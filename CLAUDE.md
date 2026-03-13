# 宠物平台 Monorepo - 全局宪法

## 项目概述
PetPal是一个跨平台宠物服务平台，支持Web、iOS、Android三端。后端采用Spring Cloud微服务架构，部署在Kubernetes上。

## 核心原则
- **跨平台优先**：前端使用Expo + React Native Web，一套代码运行三端。
- **微服务化**：后端按业务域拆分为独立微服务，每个服务独立数据库、独立部署。
- **云原生**：所有服务容器化，K8s编排，基础设施即代码。
- **契约驱动**：前后端通过OpenAPI契约通信，服务间通过Feign调用。

## 目录结构
| 模块 | 路径 | 技术栈 | 关键文件 |
|------|------|--------|----------|
| 前端跨平台 | `/frontend/` | Expo + React Native Web | `App.tsx`, `package.json` |
| 用户服务 | `/backend/user-service/` | Spring Boot + MyBatis | `UserApplication.java` |
| 宠物服务 | `/backend/pet-service/` | Spring Boot | `PetApplication.java` |
| 商品服务 | `/backend/product-service/` | Spring Boot | `ProductApplication.java` |
| 订单服务 | `/backend/order-service/` | Spring Boot | `OrderApplication.java` |
| 预约服务 | `/backend/appointment-service/` | Spring Boot | `AppointmentApplication.java` |
| 问诊服务 | `/backend/consult-service/` | Spring Boot | `ConsultApplication.java` |
| 动态服务 | `/backend/feed-service/` | Spring Boot | `FeedApplication.java` |
| 通知服务 | `/backend/notification-service/` | Spring Boot | `NotificationApplication.java` |
| 网关 | `/backend/gateway-service/` | Spring Cloud Gateway | `GatewayApplication.java` |
| 文档 | `/docs/` | Markdown + OpenAPI | `api-contracts/`, `requirements/` |
| K8s配置 | `/k8s/` | YAML | `deployments/`, `services/` |

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

关键规则（AI必须遵守）
架构边界
前端只能通过网关调用后端API，禁止直接访问微服务。

微服务之间只能通过OpenFeign调用，禁止直接数据库访问其他服务。

每个微服务拥有独立的数据库，数据库命名pet_{service_name}。

修改API必须同步更新/docs/api-contracts/中的OpenAPI契约。

代码质量
前端：必须通过跨平台测试（iOS/Android/Web），使用Platform.select处理差异。

后端：所有服务必须实现统一异常处理、统一响应格式。

测试：新功能必须包含单元测试和E2E测试场景（YAML描述）。

安全：敏感数据加密存储，日志脱敏，JWT在网关统一鉴权。

文档引用
需求文档：@./docs/requirements/

API契约：@./docs/api-contracts/

测试场景：@./docs/test-scenarios/

架构决策：@./docs/decisions/

已知陷阱
前端热更新失效：检查Metro配置，清除缓存pnpm start --reset-cache

跨域问题：网关CORS需配置允许前端域名

服务发现延迟：调整Nacos心跳间隔

数据库连接池泄露：监控HikariCP指标

K8s Pod OOMKill：配置JVM内存参数-XX:+UseContainerSupport

版本记录
2026-03-14 v1.0：初始版本，定义Monorepo架构
