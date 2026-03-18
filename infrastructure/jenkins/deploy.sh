#!/bin/bash
# 远程部署脚本 - Jenkins
# 使用方法: ./deploy.sh [服务器IP] [SSH密码]
# 示例: ./deploy.sh 100.75.140.35 MySecurePassword123
#
# 注意: 所有敏感密码应配置在 infrastructure/.env 文件中
#       复制 .env.example 为 .env 并填入实际值

set -e

# 配置 - 优先从 .env 文件加载
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$(dirname "$SCRIPT_DIR")/.env"

# 加载 .env 文件（如果存在）
if [ -f "$ENV_FILE" ]; then
    source "$ENV_FILE"
fi

# 服务器配置
SERVER_IP=${1:-${DEPLOY_SERVER_IP:-}}
SSH_PASSWORD=${2:-${DEPLOY_SSH_PASSWORD:-}}
SSH_USER=${SSH_USER:-root}
SSH_PORT=${SSH_PORT:-22}

# 检查 sshpass 是否安装
if ! command -v sshpass &> /dev/null; then
    echo "安装 sshpass..."
    brew install hudochenkov/sshpass/sshpass
fi

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
echo_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
echo_error() { echo -e "${RED}[ERROR]${NC} $1"; }

if [ -z "$SERVER_IP" ]; then
    echo_error "请提供服务器IP"
    echo "使用方法: $0 <服务器IP> [SSH密码]"
    echo "或配置 infrastructure/.env 文件"
    exit 1
fi

# 检查密码
if [ -z "$SSH_PASSWORD" ]; then
    echo_error "请提供SSH密码"
    echo "使用方法: $0 <服务器IP> <SSH密码>"
    echo "或配置 infrastructure/.env 文件中的 DEPLOY_SSH_PASSWORD"
    exit 1
fi

echo_info "=========================================="
echo_info "  远程部署 Jenkins"
echo_info "=========================================="
echo_info "服务器: $SSH_USER@$SERVER_IP"

# SSH命令封装（不使用变量嵌套引号）
export SSHPASS="$SSH_PASSWORD"
SSH_CMD="sshpass -e ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null"
SCP_CMD="sshpass -e scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null"

# 检查SSH连接
echo_info "检查SSH连接..."
if ! $SSH_CMD $SSH_USER@$SERVER_IP "echo ok" > /dev/null 2>&1; then
    echo_error "无法连接到服务器 $SERVER_IP"
    exit 1
fi
echo_info "SSH连接成功"

# 检查Docker
echo_info "检查远程服务器Docker..."
DOCKER_VERSION=$($SSH_CMD $SSH_USER@$SERVER_IP "docker --version 2>/dev/null || echo 'NOT_INSTALLED'")
if [ "$DOCKER_VERSION" = "NOT_INSTALLED" ]; then
    echo_error "远程服务器未安装Docker，请先安装Docker"
    exit 1
fi
echo_info "Docker已安装: $DOCKER_VERSION"

# 检测 docker compose 命令可用性
echo_info "检测 Docker Compose..."
COMPOSE_CMD="docker compose"
if ! $SSH_CMD $SSH_USER@$SERVER_IP "docker compose version" >/dev/null 2>&1; then
    COMPOSE_CMD="docker-compose"
    if ! $SSH_CMD $SSH_USER@$SERVER_IP "docker-compose --version" >/dev/null 2>&1; then
        echo_error "远程服务器未安装 Docker Compose，请先安装"
        exit 1
    fi
    echo_info "使用 docker-compose 命令"
else
    echo_info "使用 docker compose 命令"
fi

# 创建远程目录
echo_info "创建远程目录..."
$SSH_CMD $SSH_USER@$SERVER_IP "mkdir -p /opt/pet-platform/infrastructure/jenkins"

# 复制配置文件
echo_info "复制配置文件..."
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
$SCP_CMD -r "$SCRIPT_DIR"/* $SSH_USER@$SERVER_IP:/opt/pet-platform/infrastructure/jenkins/

# 复制 .env 文件（如果存在）
ENV_FILE="$(dirname "$SCRIPT_DIR")/.env"
if [ -f "$ENV_FILE" ]; then
    echo_info "复制环境变量文件..."
    $SCP_CMD "$ENV_FILE" $SSH_USER@$SERVER_IP:/opt/pet-platform/infrastructure/.env
fi

# 启动Jenkins
echo_info "启动Jenkins服务..."
$SSH_CMD $SSH_USER@$SERVER_IP "cd /opt/pet-platform/infrastructure/jenkins && $COMPOSE_CMD up -d"

# 等待服务启动
echo_info "等待Jenkins启动 (首次可能需要2-3分钟)..."
sleep 60

# 检查服务状态
echo_info "检查服务状态..."
$SSH_CMD $SSH_USER@$SERVER_IP "cd /opt/pet-platform/infrastructure/jenkins && $COMPOSE_CMD ps"

# 获取初始密码
echo_info "获取初始管理员密码..."
JENKINS_PASSWORD=$($SSH_CMD $SSH_USER@$SERVER_IP "docker exec pet-jenkins cat /var/jenkins_home/secrets/initialAdminPassword 2>/dev/null || echo 'PENDING'")

echo ""
echo_info "=========================================="
echo_info "  部署完成!"
echo_info "=========================================="
echo ""
echo "访问地址: http://$SERVER_IP:8080"
echo "用户名: admin"
echo "密码: $JENKINS_ADMIN_PASSWORD (预设密码)"
echo ""
echo "常用命令:"
echo "  查看日志: sshpass -e ssh -o StrictHostKeyChecking=no $SSH_USER@$SERVER_IP 'docker logs -f pet-jenkins'"
echo "  重启服务: sshpass -e ssh -o StrictHostKeyChecking=no $SSH_USER@$SERVER_IP 'cd /opt/pet-platform/infrastructure/jenkins && docker compose restart'"
