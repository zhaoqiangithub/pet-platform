#!/bin/bash
# Jenkins 安装脚本
# 用途: 一键安装 Jenkins (开发/测试环境)

set -e

echo "=========================================="
echo "  Jenkins 安装脚本"
echo "=========================================="

# 检查 Docker
if ! command -v docker &> /dev/null; then
    echo "错误: Docker 未安装"
    exit 1
fi

# 检查 Docker Compose
if ! command -v docker compose &> /dev/null; then
    if ! command -v docker-compose &> /dev/null; then
        echo "错误: Docker Compose 未安装"
        exit 1
    fi
    COMPOSE_CMD="docker-compose"
else
    COMPOSE_CMD="docker compose"
fi

echo "Docker 版本: $($COMPOSE_CMD --version)"

# 创建 JENKINS_HOME 目录
echo "创建 Jenkins 数据目录..."
mkdir -p /data/jenkins_home

# 启动 Jenkins
echo "启动 Jenkins 服务..."
$COMPOSE_CMD up -d

# 等待服务启动
echo "等待服务启动 (首次启动可能需要3-5分钟初始化)..."
sleep 30

# 检查服务状态
echo "检查服务状态..."
$COMPOSE_CMD ps

# 获取初始管理员密码
echo "获取初始管理员密码..."
sleep 10
echo ""
echo "=========================================="
echo "  Jenkins 安装完成!"
echo "=========================================="
echo ""
echo "访问地址: http://localhost:8080"
echo ""
echo "获取初始密码:"
echo "  docker exec pet-jenkins cat /var/jenkins_home/secrets/initialAdminPassword"
echo ""
echo "推荐安装的插件:"
echo "  - Docker Pipeline"
echo "  - Git"
echo "  - Pipeline"
echo "  - Credentials Binding"
echo "  - GitHub Integration"
echo ""
echo "常用命令:"
echo "  启动: $COMPOSE_CMD start"
echo "  停止: $COMPOSE_CMD stop"
echo "  重启: $COMPOSE_CMD restart"
echo "  日志: $COMPOSE_CMD logs -f"
