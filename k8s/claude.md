# Kubernetes部署配置

## 环境
- 开发命名空间：`pet-dev`
- 测试命名空间：`pet-test`
- 生产命名空间：`pet-prod`

## 目录结构
k8s/
├── base/ # 基础配置（可被环境覆盖）
│ ├── namespace.yaml
│ └── ...
├── overlays/ # 环境特定配置
│ ├── dev/
│ ├── test/
│ └── prod/
└── README.md

text

## 部署命令
```bash
# 部署到开发环境
kubectl apply -k k8s/overlays/dev

# 查看状态
kubectl get pods -n pet-dev

# 滚动更新
kubectl rollout restart deployment/user-service -n pet-dev
重要配置
所有敏感信息使用Secret（如数据库密码、JWT密钥）。

资源配置（requests/limits）必须设置，防止资源争抢。

使用ConfigMap管理应用配置（如日志级别）。