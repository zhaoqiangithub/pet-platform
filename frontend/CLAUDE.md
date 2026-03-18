# 前端模块 - 跨平台宠物平台

## 职责
实现一套代码同时运行在Web、iOS、安卓，保证UI/UX一致性和平台原生体验。

## 技术栈
- **框架**：React 18 + React Native 0.76 + Expo SDK 51
- **语言**：TypeScript 5.0
- **路由**：React Navigation（原生） + React Navigation Web（Web适配）
- **状态管理**：Zustand（客户端状态） + React Query（服务端状态）
- **UI组件**：NativeBase（跨平台组件库） + TailwindCSS（通过`twrnc`）
- **表单**：React Hook Form + Zod
- **网络**：axios + React Query
- **存储**：AsyncStorage（移动端） + localStorage（Web）
- **测试框架**：
  - 单元/集成测试：Jest + React Native Testing Library
  - API Mock：MSW（Mock Service Worker）
  - E2E测试（Web）：Playwright + Claude MCP
  - E2E测试（移动端）：Detox
  - 视觉验证：ClaudeWatch
  - 类型检查：TypeScript（`tsc --noEmit`）

> **提示**：已配置 `Playwright MCP`（`npx @playwright/mcp@latest`），可直接在对话中使用自然语言控制浏览器进行测试。

## 界面风格指南
详见 `@./UI-GUIDE.md`

## 目录结构
frontend/
├── src/
│ ├── components/ # 跨平台组件
│ ├── screens/ # 页面
│ ├── navigation/ # 路由配置
│ ├── hooks/ # 自定义Hooks
│ ├── services/ # API调用（React Query + MSW mocks）
│ ├── stores/ # Zustand store
│ ├── utils/ # 工具函数
│ ├── types/ # TypeScript类型
│ └── assets/ # 图片、字体
├── tests/ # 单元测试（镜像src结构）
│ ├── components/
│ ├── screens/
│ └── hooks/
├── msw/ # Mock Service Worker配置
│ ├── handlers.ts # API mock handlers
│ └── server.ts # 测试服务器
├── e2e/ # E2E测试（Detox + Playwright）
│ ├── detox/ # 移动端E2E
│ ├── playwright/ # Web端E2E
│ └── scenarios/ # 共享测试场景（引用@../docs/test-scenarios/）
└── validation/ # 视觉验证截图

text

## 开发规范

### 组件开发
- **优先使用NativeBase组件**，它已处理多平台样式差异。
- **自定义组件**：
  - 使用`useWindowDimensions`获取屏幕尺寸
  - 避免平台特有API，如需使用则用`Platform.select`封装
  - 样式使用`twrnc`（`import { tw } from 'twrnc'`）实现Tailwind风格
- **命名**：组件文件`PascalCase.tsx`，非组件`camelCase.ts`
- 
### 测试初始化（重要！）

**禁止直接创建 package.json**，必须使用 Expo 官方模板：

```bash
# 1. 初始化测试环境（使用官方模板）
cd frontend
npx create-expo-app@latest . --template blank

# 2. 安装测试依赖
npm install --save-dev jest @testing-library/react-native @testing-library/jest-native jest-expo msw

# 3. 复制AI生成的测试文件
# 将生成的测试文件复制到 __tests__/ 目录
```

### 状态管理
- **Zustand**：用于客户端状态（主题、认证、购物车），定义在`stores/`。
- **React Query**：用于服务端状态（API数据），统一在`services/`中定义hooks，并配套MSW handlers。

### API调用与Mock
- 所有请求通过`src/utils/api.ts`封装的axios实例，自动附加token、处理错误。
- **MSW配置**：所有API的mock handlers存放在`msw/handlers.ts`，测试时自动启用。
- 开发环境可使用MSW模拟后端，实现前后端并行开发。

### 路由管理
- 统一在`navigation/index.tsx`定义Navigator。
- 路由名称常量定义在`navigation/routes.ts`。
- 使用`useNavigation`和`useRoute`进行导航和参数获取。

## 前端容器化（Web端）

### Dockerfile生成规范
如需将前端Web应用容器化部署（例如通过Nginx serve），应在`/frontend`目录生成以下`Dockerfile`：
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install
COPY . .
RUN pnpm build:web

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1
```
nginx.conf需提供基本配置（可让AI生成默认模板）。

构建命令：docker build -t pet-frontend:latest .

### Dockerfile验证
AI生成或修改前端Dockerfile后，应执行：
```bash
hadolint Dockerfile
docker build -t pet-frontend:test .

---

## 测试规范（核心新增内容）

### 测试分层与执行时机

| 测试类型     | 工具                                | 生成方式                 | 执行时机              | 通过标准     |
| ------------ | ----------------------------------- | ------------------------ | --------------------- | ------------ |
| **单元测试** | Jest + React Native Testing Library | AI从验收标准生成         | 本地开发、每次push    | 覆盖率≥80%   |
| **集成测试** | Jest + MSW                          | AI从API契约+组件交互生成 | 本地开发、每次push    | 所有通过     |
| **E2E测试**  | Playwright/Detox                    | AI从YAML测试场景生成     | PR合并到dev后、发布前 | 关键流程100% |
| **视觉验证** | ClaudeWatch                         | 自动触发                 | 每次部署到测试环境    | 无视觉偏差   |
| **类型检查** | TypeScript `tsc`                    | 编码时自动               | 每次push              | 无类型错误   |

### 测试先行原则（TDD）
- 所有新功能必须**先编写测试，再实现代码**。
- AI应遵循以下顺序：
  1. 读取用户故事和验收标准（`@../docs/requirements/`）
  2. 生成YAML测试场景（如果不存在）
  3. 根据YAML生成单元测试、集成测试代码（红阶段）
  4. 实现功能代码，使测试通过（绿阶段）
  5. 运行所有测试并重构（蓝阶段）

### 测试生成自动化
- **单元测试**：AI根据验收标准直接生成`__tests__/`下的测试文件。
- **集成测试**：AI结合API契约（`@../docs/api-contracts/`）和组件交互生成带MSW的测试。
- **E2E测试**：使用`cc-e2e`工具生成（需安装）：
  ```bash
  npx cc-e2e init
  # 然后在Claude Code中运行
  /e2e:generate --scenario login.yml
AI会自动分析YAML场景，打开Playwright浏览器验证，生成测试代码并执行。

视觉验证（ClaudeWatch）
安装：npm install -g claudewatch

配置：claudewatch claude-setup（自动在项目根目录生成配置）

每次Claude完成任务后，自动触发验证：

bash
claudewatch validate --url http://localhost:3000
验证内容包括：

关键视觉元素是否存在

布局是否符合响应式设计

可访问性（alt文本、颜色对比度）

与UI-GUIDE.md的一致性

测试场景YAML的使用
测试场景存放在@../docs/test-scenarios/，格式示例：

yaml
# login.yml
name: 用户登录成功
steps:
  - "访问登录页面"
  - "输入手机号13800138000"
  - "输入密码Password123"
  - "点击登录按钮"
  - "验证跳转到首页，显示欢迎消息"
AI应：

读取YAML，提取步骤

生成对应的单元测试、集成测试（验证各步骤）

生成E2E测试（验证完整流程）

跨平台测试策略
Web端：Playwright测试（e2e/playwright/）

移动端：Detox测试（e2e/detox/）

共享测试场景：所有E2E测试基于同一组YAML文件生成，确保跨平台行为一致。

平台差异处理：在测试代码中使用条件判断（如device.getPlatform()）。

测试覆盖率要求
单元测试覆盖率：语句覆盖≥80%，分支覆盖≥70%

关键组件（如登录、购物车）覆盖率：≥90%

CI中会生成覆盖率报告，低于阈值则构建失败。

测试环境配置
测试环境使用.env.test，确保与生产环境配置隔离。

所有外部服务（API、数据库）在测试中均使用Mock（MSW或TestContainers）。

注意：测试通过不代表生产能运行，需通过测试环境部署验证。

常用命令
bash
# 启动开发服务器
pnpm web           # Web
pnpm ios           # iOS模拟器
pnpm android       # Android模拟器

# 运行所有测试（本地）
pnpm test          # 单元测试 + 集成测试
pnpm test:coverage # 带覆盖率报告
pnpm test:e2e:web  # Playwright E2E
pnpm test:e2e:ios  # Detox iOS
pnpm test:e2e:android # Detox Android

# 视觉验证
claudewatch validate

# 类型检查
pnpm typecheck

# 构建
pnpm build:web     # 构建Web静态文件
pnpm build:ios     # 构建iOS bundle
pnpm build:android # 构建Android bundle

# 代码检查
pnpm lint
pnpm format
已知陷阱（更新版）
测试环境与生产环境配置不一致：可能导致测试通过但生产启动失败。解决方法：在CI中增加生产配置验证步骤。

MSW handlers未及时更新：API变更后未同步更新mock，导致集成测试误通过。规则：修改API契约后必须更新msw/handlers.ts。

E2E测试不稳定：元素定位可能因平台差异失败。使用data-testid属性统一标识关键元素。

视觉验证误报：截图对比可能因动画或异步加载失败。配置ClaudeWatch等待稳定后再截图。

类型检查遗漏：确保tsconfig.json中strict模式开启，并在CI中运行tsc --noEmit。

引用文档
需求文档：@../docs/requirements/

API契约：@../docs/api-contracts/

测试场景：@../docs/test-scenarios/

架构决策：@../docs/decisions/

界面风格指南：@./UI-GUIDE.md

