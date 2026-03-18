#!/bin/bash
# 远程部署脚本 - Docker Registry

set -e

SERVER_IP=${1:-${DEPLOY_SERVER_IP:-}}
SSH_PASSWORD=${2:-${DEPLOY_SSH_PASSWORD:-root}}
SSH_USER=${SSH_USER:-root}

if [ -z "$SERVER_IP" ]; then
    echo "使用方法: $0 <服务器IP> [密码]"
    echo "示例: $0 100.75.140.35 root"
    exit 1
fi

export SSHPASS="$SSH_PASSWORD"
SSH_CMD="sshpass -e ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null"
SCP_CMD="sshpass -e scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null"

echo "=========================================="
echo "  远程部署 Docker Registry"
echo "=========================================="

# 检查SSH连接
echo "检查SSH连接..."
$SSH_CMD $SSH_USER@$SERVER_IP "echo ok"

# 检查Docker
echo "检查远程服务器Docker..."
DOCKER_VERSION=$($SSH_CMD $SSH_USER@$SERVER_IP "docker --version 2>/dev/null | head -1")
echo "Docker: $DOCKER_VERSION"

# 创建远程目录
echo "创建远程目录..."
$SSH_CMD $SSH_USER@$SERVER_IP "mkdir -p /opt/pet-platform/infrastructure/docker-registry"

# 复制配置文件
echo "复制配置文件..."
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
$SCP_CMD -r "$SCRIPT_DIR"/* $SSH_USER@$SERVER_IP:/opt/pet-platform/infrastructure/docker-registry/

# 启动服务
echo "启动Docker Registry..."
$SSH_CMD $SSH_USER@$SERVER_IP "cd /opt/pet-platform/infrastructure/docker-registry && docker-compose up -d"

echo ""
echo "=========================================="
echo "  部署完成!"
echo "=========================================="
echo ""
echo "Registry API: http://$SERVER_IP:5000"
echo "Registry UI:  http://$SERVER_IP:8081"
echo ""
