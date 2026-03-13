# ADR-001：采用Spring Cloud作为微服务基础架构

**状态**：已接受（2026-03-14）

## 背景
宠物平台需要支持高并发、快速迭代、多端接入，微服务架构是必然选择。我们需要一套完整的服务治理方案。

## 决策
采用Spring Cloud Alibaba作为微服务基础栈，具体组件：
- 注册/配置中心：Nacos
- 服务调用：OpenFeign + Resilience4j
- 网关：Spring Cloud Gateway
- 链路追踪：SkyWalking

## 理由
- 与Spring Boot生态无缝集成，开发效率高
- Nacos比Eureka功能更丰富（同时支持配置管理）
- 国内文档和社区活跃，问题易解决
- 团队（AI）熟悉Java技术栈，学习成本低

## 后果
正面：
- 快速搭建服务治理体系
- 统一技术栈，降低AI出错概率

负面：
- 引入额外组件（Nacos）需要运维
- 对云原生环境有一定依赖（但可通过K8s Service解决）

## 相关文档
- `@../architecture/overview.md`
- `@../../backend/CLAUDE.md`