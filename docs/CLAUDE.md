# 文档维护规范

## 职责
存放所有项目文档，包括需求、设计、API契约、测试场景等。文档与代码同源，保持同步。

## 目录结构
docs/
├── README.md # 文档索引
├── requirements/ # 需求文档（用户故事）
│ ├── 01-user-auth.md
│ ├── 02-pet-profile.md
│ └── 03-service-booking.md
├── acceptance-criteria/ # 验收标准（与测试联动）
│ └── login.md
├── feedback/ # 用户反馈/Bug报告
│ └── latest.md
├── api-contracts/ # OpenAPI契约（YAML）
│ ├── user-service.yaml
│ ├── product-service.yaml
│ └── ...
├── architecture/ # 架构设计
│ ├── overview.md
│ └── data-flow.md
├── decisions/ # 架构决策记录（ADR）
│ ├── 001-use-spring-cloud.md
│ └── 002-expo-rn-web.md
└── test-scenarios/ # 可读测试场景（YAML）
├── login.yml
└── checkout.yml

text

## 文档编写规则
- **需求文档**：Markdown格式，包含用户故事和验收标准。
- **API契约**：OpenAPI 3.0 YAML格式，每个服务一个文件。
- **测试场景**：YAML格式，描述用户操作步骤，用于AI生成E2E测试。
- **架构决策**：ADR格式（标题、状态、上下文、决策、后果）。

## 文档与代码同步
- 修改API时必须更新对应的OpenAPI契约。
- 新增功能必须先写用户故事和验收标准。
- 测试场景应覆盖主要用户旅程。

## 引用方式
在CLAUDE.md中使用`@./docs/xxx`引用，AI会自动加载。