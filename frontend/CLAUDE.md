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
- **测试**：Jest + React Native Testing Library + Detox（移动端E2E）+ Playwright（Web E2E）

## 界面风格指南
详见 `@./UI-GUIDE.md`

## 目录结构
frontend/
├── src/
│ ├── components/ # 跨平台组件（原子/分子/有机）
│ ├── screens/ # 页面（自动适配三端）
│ ├── navigation/ # 路由配置（Stack/Tab）
│ ├── hooks/ # 自定义Hooks
│ ├── services/ # API调用（React Query）
│ ├── stores/ # Zustand store
│ ├── utils/ # 工具函数
│ ├── types/ # TypeScript类型
│ └── assets/ # 图片、字体
├── tests/ # 单元测试（镜像src结构）
└── e2e/ # E2E测试（Detox配置 + Playwright配置）

text

## 开发规范

### 组件开发
- **优先使用NativeBase组件**，它已处理多平台样式差异。
- **自定义组件**：
  - 使用`useWindowDimensions`获取屏幕尺寸
  - 避免平台特有API，如需使用则用`Platform.select`封装
  - 样式使用`twrnc`（`import { tw } from 'twrnc'`）实现Tailwind风格
- **命名**：组件文件`PascalCase.tsx`，非组件`camelCase.ts`

### 状态管理
- **Zustand**：用于客户端状态（主题、认证、购物车），定义在`stores/`。
  ```ts
  import { create } from 'zustand';
  import { persist } from 'zustand/middleware';
  
  interface AuthState {
    token: string | null;
    setToken: (token: string) => void;
  }
  
  export const useAuthStore = create<AuthState>()(
    persist(
      (set) => ({
        token: null,
        setToken: (token) => set({ token }),
      }),
      { name: 'auth-storage' }
    )
  );
React Query：用于服务端状态（API数据），统一在services/中定义hooks。

ts
// services/useUser.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '../utils/api';

export const useUser = (id: string) => {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => api.get(`/users/${id}`).then(res => res.data),
  });
};
API调用
所有请求通过src/utils/api.ts封装的axios实例，自动附加token、处理错误。

错误处理：统一在拦截器处理，业务层只处理特定错误（如404）。

路由管理
统一在navigation/index.tsx定义Navigator。

路由名称常量定义在navigation/routes.ts。

使用useNavigation和useRoute进行导航和参数获取。

测试要求
单元测试：每个组件至少有一个快照测试，关键逻辑有行为测试。

E2E测试：

移动端：Detox（在e2e/中编写测试用例）

Web：Playwright（在e2e/中编写，与Detox共享测试场景描述）

测试场景YAML：参考/docs/test-scenarios/生成测试代码。

常用命令
bash
# 启动
pnpm web           # Web
pnpm ios           # iOS模拟器
pnpm android       # Android模拟器

# 测试
pnpm test          # 单元测试
pnpm test:e2e:web  # Playwright E2E
pnpm test:e2e:ios  # Detox iOS

# 构建
pnpm build:web     # 构建Web静态文件
pnpm build:ios     # 构建iOS bundle
pnpm build:android # 构建Android bundle

# 代码检查
pnpm lint
pnpm typecheck
已知陷阱
热更新失效：pnpm start --reset-cache

图片加载失败：检查expo-image配置，使用CDN地址

Web端导航闪烁：确保react-navigation-web正确配置

引用文档
需求文档：@../docs/requirements/

API契约：@../docs/api-contracts/

测试场景：@../docs/test-scenarios/