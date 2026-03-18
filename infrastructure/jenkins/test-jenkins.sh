#!/bin/bash
# Jenkins 健康检查与自动化测试脚本
# 使用方法: ./test-jenkins.sh [服务器IP] [SSH密码]
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

SERVER_IP=${1:-${DEPLOY_SERVER_IP:-}}
SSH_PASSWORD=${2:-${DEPLOY_SSH_PASSWORD:-}}
SSH_USER=${SSH_USER:-root}

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PASS=0
FAIL=0

echo_pass() { echo -e "${GREEN}[PASS]${NC} $1"; PASS=$((PASS+1)); }
echo_fail() { echo -e "${RED}[FAIL]${NC} $1"; FAIL=$((FAIL+1)); }
echo_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
echo_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }

if [ -z "$SERVER_IP" ]; then
    echo "使用方法: $0 <服务器IP> [SSH密码]"
    echo "或配置 infrastructure/.env 文件"
    exit 1
fi

# 检查密码
if [ -z "$SSH_PASSWORD" ]; then
    echo "请提供SSH密码"
    echo "使用方法: $0 <服务器IP> <SSH密码>"
    echo "或配置 infrastructure/.env 文件中的 DEPLOY_SSH_PASSWORD"
    exit 1
fi

# SSH命令封装
export SSHPASS="$SSH_PASSWORD"
SSH_CMD="sshpass -e ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null"

echo_info "=========================================="
echo_info "  Jenkins 安装测试"
echo_info "=========================================="
echo_info "测试服务器: $SERVER_IP"
echo ""

# 测试1: Docker容器运行状态
echo_info "测试1: 检查Docker容器状态..."
CONTAINER_STATUS=$($SSH_CMD $SSH_USER@$SERVER_IP "docker ps --filter name=jenkins --format '{{.Status}}'" 2>/dev/null || echo "")
if [[ "$CONTAINER_STATUS" == *"Up"* ]]; then
    echo_pass "Jenkins容器运行中: $CONTAINER_STATUS"
else
    echo_fail "Jenkins容器未运行"
fi
echo ""

# 测试2: 端口监听
echo_info "测试2: 检查8080端口..."
PORT_CHECK=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 10 "http://$SERVER_IP:8080" 2>/dev/null || echo "000")
if [ "$PORT_CHECK" = "200" ]; then
    echo_pass "8080端口可访问 (HTTP $PORT_CHECK)"
elif [ "$PORT_CHECK" = "403" ]; then
    echo_pass "8080端口可访问，Jenkins需要初始配置 (HTTP $PORT_CHECK)"
else
    echo_fail "8080端口不可访问 (HTTP $PORT_CHECK)"
fi
echo ""

# 测试3: 健康检查端点
echo_info "测试3: 健康检查API..."
HEALTH_CHECK=$($SSH_CMD $SSH_USER@$SERVER_IP "curl -s -o /dev/null -w '%{http_code}' http://localhost:8080/login 2>/dev/null" 2>/dev/null || echo "000")
if [ "$HEALTH_CHECK" = "200" ]; then
    echo_pass "Jenkins健康检查通过 (HTTP $HEALTH_CHECK)"
else
    echo_warn "Jenkins健康检查响应: HTTP $HEALTH_CHECK"
fi
echo ""

# 测试4: 页面内容验证
echo_info "测试4: 验证页面内容..."
PAGE_CONTENT=$(curl -s --connect-timeout 10 "http://$SERVER_IP:8080" 2>/dev/null || echo "")
if echo "$PAGE_CONTENT" | grep -qi "jenkins"; then
    echo_pass "页面包含Jenkins标识"
else
    echo_warn "页面内容无法识别"
fi
echo ""

# 测试5: Docker in Docker
echo_info "测试5: Docker in Docker支持..."
DOCKER_SOCK=$($SSH_CMD $SSH_USER@$SERVER_IP "ls -la /var/run/docker.sock 2>/dev/null | head -1" 2>/dev/null || echo "")
if [ -n "$DOCKER_SOCK" ]; then
    echo_pass "Docker socket已挂载"
else
    echo_warn "Docker socket未挂载，Docker Pipeline可能无法使用"
fi
echo ""

# 测试6: 资源使用情况
echo_info "测试6: 容器资源使用..."
MEMORY_USAGE=$($SSH_CMD $SSH_USER@$SERVER_IP "docker stats --no-stream --format 'table {{.Name}}\t{{.MemUsage}}' | grep jenkins" 2>/dev/null || echo "N/A")
echo_info "内存使用: $MEMORY_USAGE"
echo ""

# 测试7: Jenkins版本
echo_info "测试7: Jenkins版本..."
JENKINS_VERSION=$($SSH_CMD $SSH_USER@$SERVER_IP "docker exec pet-jenkins java -jar /usr/share/jenkins/jenkins.war --version 2>/dev/null | head -1" 2>/dev/null || echo "N/A")
echo_info "Jenkins版本: $JENKINS_VERSION"
echo ""

# 总结
echo_info "=========================================="
echo_info "  测试结果"
echo_info "=========================================="
echo -e "通过: ${GREEN}$PASS${NC}"
echo -e "失败: ${RED}$FAIL${NC}"
echo ""

if [ $FAIL -eq 0 ]; then
    echo_pass "所有测试通过! Jenkins安装成功"
    exit 0
else
    echo_fail "有测试失败，请检查"
    exit 1
fi
