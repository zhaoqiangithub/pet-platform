# 基础设施模块 - 本地宪法

本文件定义了项目基础设施的部署、配置和管理规范。

## 敏感信息处理

**重要原则**：当遇到账号、密码、配置值不确定时，**必须向用户询问**，不要猜测。

常见需要询问的场景：
- Docker Hub 登录凭据
- GitHub Token
- 服务器 SSH 密码
- Harbor/Registry 访问凭证

---

## 模块概述

infrastructure 模块负责项目的基础设施即代码管理，包括：
- Jenkins CI/CD 服务
- Docker Registry 私有镜像仓库
- Harbor 私有镜像仓库（完整版）
- Kubernetes 应用部署配置

## 架构说明

### 远程部署架构
项目采用远程服务器部署架构，Jenkins 和 Docker Registry 都部署在同一远程服务器上：

```
┌─────────────────────────────────────────────────────────┐
│                    远程服务器 (100.75.140.35)          │
│                                                         │
│  ┌─────────────────┐    ┌─────────────────┐          │
│  │  Jenkins       │    │ Docker Registry │          │
│  │  (docker-compose)   │  (docker-compose)   │          │
│  │                 │    │                 │          │
│  │  - /usr/bin/docker │◄──►│  :5000        │          │
│  │  - Docker socket  │    │                 │          │
│  └─────────────────┘    └─────────────────┘          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**关键点**：
- Jenkins 和 Docker Registry 通过 Docker 内部网络通信
- Jenkins 需要挂载远程服务器的 `/usr/bin/docker` 和 Docker socket
- 镜像推送在 Jenkins 容器内执行，走内部网络

### 环境配置
所有敏感配置存放在 `infrastructure/.env`，通过 `env_file` 注入到容器。

## 目录结构

```
infrastructure/
├── .env.example              # 环境配置模板
├── .env                     # 敏感配置（不提交到版本库）
├── CLAUDE.md                # 基础设施配置规范
├── jenkins/                  # CI/CD 服务
│   ├── docker-compose.yml   # Docker Compose 配置
│   ├── install.sh           # 本地安装脚本
│   ├── deploy.sh            # 远程部署脚本
│   ├── test-jenkins.sh      # 健康检查脚本
│   ├── Jenkinsfile          # CI/CD Pipeline 模板
│   └── k8s/
│       └── deployment.yaml  # Jenkins K8s 部署配置
├── harbor/                   # Harbor 私有镜像仓库（完整版）
│   ├── docker-compose.yml
│   ├── harbor.yml           # Harbor 主配置
│   ├── harbor.env
│   ├── nginx.conf
│   ├── generate-certs.sh    # 证书生成脚本
│   ├── install.sh
│   └── k8s/
│       └── deployment.yaml  # Harbor K8s 部署配置
├── docker-registry/          # Docker Registry（轻量版）
│   ├── docker-compose.yml
│   ├── deploy.sh            # 远程部署脚本
│   └── test-registry.sh    # 测试脚本
├── k8s/                     # 应用 Kubernetes 配置
│   ├── CLAUDE.md           # K8s 配置规范
│   └── feed-service/        # 服务部署配置
│       ├── deployment.yaml
│       ├── service.yaml
│       ├── configmap.yaml
│       ├── secret.yaml
│       ├── ingress.yaml
│       └── kustomization.yaml
└── README.md
```

## 敏感信息管理

**重要规则**：
- 敏感配置（如服务器IP、密码、密钥）必须存放在 `infrastructure/.env`
- `infrastructure/.env` 已在 `.gitignore` 中，不会提交到版本库
- 复制 `.env.example` 为 `.env` 并填入实际值

### 密码安全管理

#### 敏感信息配置

所有敏感密码必须配置在 `infrastructure/.env` 文件中：

| 变量 | 说明 | 必填 |
|------|------|------|
| `JENKINS_ADMIN_PASSWORD` | Jenkins 管理员密码 | 是 |
| `DEPLOY_SSH_PASSWORD` | SSH 远程部署密码 | 是 |
| `HARBOR_PASSWORD` | Harbor 仓库密码 | 是（使用 Harbor 时） |

#### 安全原则

1. **不提交到 Git**：.env 文件已在 .gitignore 中
2. **强密码要求**：至少 8 位，包含数字、大小写字母和特殊字符
3. **优先使用 SSH 密钥**：避免密码明文传输
4. **默认密码禁用**：部署脚本不再使用默认密码，密码必填

#### Jenkins 密码配置

Jenkins 管理员密码通过环境变量预设：

```yaml
# docker-compose.yml
environment:
  - JENKINS_ADMIN_PASSWORD=${JENKINS_ADMIN_PASSWORD}
```

首次部署后，使用预设密码登录：
- 用户名：`admin`
- 密码：`infrastructure/.env` 中的 `JENKINS_ADMIN_PASSWORD` 值

#### 使用 .env 文件部署

```bash
# 1. 复制配置模板
cp infrastructure/.env.example infrastructure/.env

# 2. 编辑配置文件，填入所有密码
vim infrastructure/.env

# 3. 部署 Jenkins
cd infrastructure/jenkins
./deploy.sh <server-ip>
# 或自动从 .env 读取密码
./deploy.sh

# 4. 测试 Jenkins
cd infrastructure/jenkins
./test-jenkins.sh <server-ip>
```

### 环境变量模板 (.env.example)

```bash
# Jenkins 配置
JENKINS_HOST=jenkins.example.com
JENKINS_PORT=8080
JENKINS_USER=admin
JENKINS_TOKEN=

# Docker Registry 配置
REGISTRY_HOST=registry.example.com
REGISTRY_PORT=5000
REGISTRY_USER=admin
REGISTRY_PASSWORD=

# Harbor 配置
HARBOR_HOST=harbor.example.com
HARBOR_PORT=80
HARBOR_USER=admin
HARBOR_PASSWORD=

# SSH 远程部署（可选）
SSH_HOST=
SSH_PORT=22
SSH_USER=
SSH_KEY_PATH=~/.ssh/id_rsa
```

## 依赖版本

| 组件 | 版本 | 说明 |
|------|------|------|
| Jenkins | 2.541.2-lts | 稳定版 |
| Docker Registry | 2.8 | 轻量级镜像仓库 |
| JDK | 17 | 与项目一致 |
| Docker | 24+ | 需要 Docker 24+ 支持 |

## 本地开发环境

### Docker Registry（轻量版）

```bash
cd infrastructure/docker-registry
docker compose up -d      # 启动
docker compose down       # 停止
docker compose logs -f    # 查看日志
```

### Harbor（完整版）

```bash
cd infrastructure/harbor
chmod +x install.sh generate-certs.sh
./install.sh
```

### Jenkins（本地）

```bash
cd infrastructure/jenkins

# 1. 复制配置模板
cp ../.env.example ../.env

# 2. 编辑配置文件，填入代理和其他敏感信息
vim ../.env

# 3. 启动 Jenkins
docker compose up -d
```

#### 敏感信息与配置管理

**设计原则**：所有敏感信息（如密码、IP、端口）必须从配置文件读取，不硬编码到代码中。

- **敏感配置**：存放在 `infrastructure/.env`（不提交到 Git）
- **配置模板**：使用 `infrastructure/.env.example`（提交到 Git）
- **部署脚本**：从 `.env` 读取配置

#### 网络代理配置

如果 Jenkins 部署环境无法直接访问外网（如 GitHub、Docker Hub），需要配置 HTTP 代理：

**配置步骤**：

```bash
# 1. 编辑 .env 文件
cd infrastructure
cp .env.example .env
vim .env

# 2. 填入代理配置（根据你的网络环境修改）
HTTP_PROXY_HOST=<your-proxy-host>
HTTP_PROXY_PORT=<your-proxy-port>

# 3. 重启 Jenkins 使配置生效
cd jenkins
docker compose restart
```

**配置说明**：

| 变量 | 说明 | 示例 |
|------|------|------|
| `HTTP_PROXY_HOST` | 代理服务器 IP 或域名 | `192.168.31.139` |
| `HTTP_PROXY_PORT` | 代理服务器端口 | `7890` |

**工作原理**：

1. `docker-compose.yml` 从 `.env` 读取代理配置
2. 容器启动时，自动将代理配置写入 `~/.gitconfig`
3. Git/Docker/NPM 自动使用代理访问外网

## 远程部署（测试/生产环境）

### 部署 Docker Registry

```bash
# 1. 复制配置模板
cp infrastructure/.env.example infrastructure/.env

# 2. 编辑配置文件
vim infrastructure/.env

# 3. 部署到远程服务器
cd infrastructure/docker-registry
chmod +x deploy.sh
./deploy.sh
```

### 部署 Jenkins

```bash
# 1. 复制配置模板（如未复制）
cp infrastructure/.env.example infrastructure/.env

# 2. 编辑配置文件
vim infrastructure/.env

# 3. 部署到远程服务器
cd infrastructure/jenkins
chmod +x deploy.sh test-jenkins.sh
./deploy.sh

# 4. 验证安装
./test-jenkins.sh
```

## CI/CD 流程

```
代码 push → GitHub → Jenkins 自动构建 → 单元测试 + 打包
    → 构建 Docker 镜像 → 推送到 Docker Registry → 部署到 K8s
```

### Docker Registry 私有镜像仓库

项目使用 Docker Registry 私有镜像仓库存储 Docker 镜像。

#### 镜像命名规范

```
localhost:5000/pet-platform/{service}:{tag}
```

示例：
- 后端：`localhost:5000/pet-platform/feed-service:latest`
- 前端：`localhost:5000/pet-platform/frontend:latest`

#### 认证配置

1. 在 Jenkins 添加凭据：
   - 类型：Username with password
   - ID：`registry-credential`
   - Username：`admin`
   - Password：Registry 登录密码

#### K8s 拉取镜像

在 K8s 集群中创建 Image Pull Secret：

```bash
kubectl create secret docker-registry registry-secret \
  --docker-server=localhost:5000 \
  --docker-username=admin \
  --docker-password=admin \
  --docker-email=admin@pet.com \
  -n pet-platform
```

在 Deployment 中引用：

```yaml
spec:
  template:
    spec:
      imagePullSecrets:
        - name: registry-secret
      containers:
        - name: feed-service
          image: localhost:5000/pet-platform/feed-service:latest
          imagePullPolicy: Always
```

### Jenkins Pipeline 模板

项目提供了 `Jenkinsfile` 模板，位于 `infrastructure/jenkins/Jenkinsfile`。

#### Pipeline 流程

```
Git Push → Checkout → Build → Test → Docker Build → Push to Registry → Deploy to K8s
```

#### 分支策略

| 分支 | 构建 | 测试 | 镜像推送 | K8s 部署 | 目标环境 |
|------|------|------|----------|----------|----------|
| `dev` | ✅ | ✅ | ✅ | ✅ | pet-platform-test |
| `main` | ✅ | ✅ | ✅ | ✅ | pet-platform-prod |
| `feature/**` | ✅ | ✅ | ✅ | ❌ | 不部署 |

#### 环境配置

配置文件：`infrastructure/.env`

```bash
# Docker Registry 私有镜像仓库
REGISTRY_URL=localhost
REGISTRY_PORT=5000
REGISTRY_PROJECT=pet-platform
REGISTRY_USER=admin
REGISTRY_PASSWORD=<your-registry-password>

# K8s 集群
K8S_MASTER_IP=100.89.107.21
K8S_SSH_USER=root
K8S_TEST_NAMESPACE=pet-platform-test
K8S_PROD_NAMESPACE=pet-platform-prod
```

#### K8s 部署流程

1. Jenkins 通过 SSH 连接到 K8s master (100.89.107.21)
2. 执行 `kubectl set image` 更新 Deployment
3. 执行 `kubectl rollout status` 等待滚动更新完成

#### K8s 命名空间

| 命名空间 | 用途 |
|----------|------|
| `pet-platform-test` | 测试环境 (dev 分支部署) |
| `pet-platform-prod` | 生产环境 (main 分支部署) |

## 常用命令

### Docker Registry

```bash
# 启动服务
cd infrastructure/docker-registry
docker compose up -d

# 停止服务
docker compose down

# 查看日志
docker compose logs -f

# 测试 Registry
./test-registry.sh
```

### Jenkins

```bash
# 启动服务
cd infrastructure/jenkins
docker compose up -d

# 停止服务
docker compose down

# 查看日志
docker compose logs -f

# 验证健康状态
./test-jenkins.sh

# 远程部署
./deploy.sh
```

### Harbor

```bash
# 启动（需先运行 install.sh）
cd infrastructure/harbor
docker compose up -d

# 停止
docker compose down
```

## 部署脚本说明

### deploy.sh

远程部署脚本，执行以下步骤：
1. 读取 `.env` 配置
2. 通过 SSH 连接到远程服务器
3. 复制配置文件到服务器
4. 在服务器上启动 Docker Compose 服务

### test-jenkins.sh

健康检查脚本，执行以下验证：
1. 检查 Jenkins 容器是否运行
2. 等待 Jenkins 就绪
3. 验证 Jenkins API 可访问
4. 输出健康状态报告

## K8s 部署配置

infrastructure 包含两类 K8s 配置：

### 1. 基础设施 K8s 部署
用于将 Jenkins、Harbor 等基础设施服务部署到 K8s：

```bash
# 部署 Jenkins 到 K8s
kubectl apply -f infrastructure/jenkins/k8s/deployment.yaml

# 部署 Harbor 到 K8s
kubectl apply -f infrastructure/harbor/k8s/deployment.yaml
```

### 2. 应用 K8s 部署
用于将微服务应用部署到 K8s：

```bash
# 部署应用到 K8s（使用 Kustomize）
kubectl apply -k infrastructure/k8s/feed-service/

# 或直接应用 YAML
kubectl apply -f infrastructure/k8s/feed-service/
```

详细 K8s 配置规范请参考：[k8s/CLAUDE.md](./k8s/CLAUDE.md)

## 注意事项

1. **首次部署**：首次使用需配置 `.env` 文件
2. **远程部署**：确保 SSH 密钥已配置并有服务器访问权限
3. **端口冲突**：确保目标服务器端口（8080, 5000等）未被占用
4. **存储**：Docker Registry 需要配置持久化存储

## 版本记录

- 2026-03-19: 合并 k8s 目录到 infrastructure
- 2026-03-18: 添加 Jenkins 远程部署和健康检查脚本
- 2026-03-14: 初始版本，定义基础设施模块
