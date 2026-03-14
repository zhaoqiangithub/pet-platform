---
name: split-requirements
description: 根据设计文档拆分为用户故事，并生成API契约和测试场景
parameters:
  - name: design_doc
    description: 设计文档的内容或文件路径（如果提供路径，AI会自动读取）
    required: true
  - name: output_dir
    description: 输出目录（默认为当前项目）
    required: false
---

## 任务目标
根据提供的设计文档，将其拆分为独立的用户故事，每个故事包含：
- 用户故事（As a... I want... so that...）
- 验收标准（列表形式）

同时，为每个涉及API的故事生成OpenAPI契约初稿（YAML），并为每个故事生成测试场景（YAML格式）。

## 输入
设计文档：{{design_doc}}
输出根目录：{{output_dir | default("./")}}

## 执行步骤

### 步骤1：理解设计文档
请仔细阅读以下设计文档内容，识别其中的核心功能模块和用户角色：

{{design_doc}}

### 步骤2：拆分为用户故事
基于上述文档，将其拆分为多个独立的用户故事。每个故事应遵循标准格式：
- 以“作为...，我想要...，以便...”开头
- 包含明确的验收标准（列表形式，用- [ ] 表示）

请将每个故事保存为独立的Markdown文件，命名格式为：`序号-简短描述.md`，例如 `01-user-auth.md`。
所有文件存放在 `{{output_dir}}docs/requirements/` 目录下。

### 步骤3：生成OpenAPI契约
对于每个涉及API交互的用户故事，请生成对应的OpenAPI 3.0契约初稿。每个契约文件应包括：
- 基本信息（title, version, description）
- 相关路径、方法、请求/响应结构（暂不填充细节，但至少定义端点）

请将每个契约保存为YAML文件，命名格式为：`服务名.yaml`（如 `user-service.yaml`），存放在 `{{output_dir}}docs/api-contracts/` 目录下。

### 步骤4：生成测试场景（YAML）
为每个用户故事生成测试场景，采用YAML格式，描述主要用户流程和验证点。每个场景文件应包含：
- name: 场景名称
- steps: 步骤列表（given/when/then 或直接描述）
- tags: 标签

请将每个测试场景保存为YAML文件，命名格式为：`简短描述.yml`（如 `login.yml`），存放在 `{{output_dir}}docs/test-scenarios/` 目录下。

### 步骤5：输出总结
完成后，请列出生成的所有文件清单，并提醒用户下一步可以基于这些故事创建分支进行开发。