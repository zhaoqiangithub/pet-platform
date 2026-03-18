#!/bin/bash
# Docker Registry 测试脚本

SERVER_IP=${1:-100.75.140.35}

echo "=========================================="
echo "  Docker Registry 测试"
echo "=========================================="

# 测试1: 检查 Registry API
echo -n "测试1: 检查 Registry API... "
RESULT=$(curl -s -o /dev/null -w "%{http_code}" http://$SERVER_IP:5000/v2/)
if [ "$RESULT" = "200" ]; then
    echo "✓ PASS"
else
    echo "✗ FAIL (HTTP $RESULT)"
fi

# 测试2: 检查 Registry UI
echo -n "测试2: 检查 Registry UI... "
RESULT=$(curl -s -o /dev/null -w "%{http_code}" http://$SERVER_IP:8081/)
if [ "$RESULT" = "200" ]; then
    echo "✓ PASS"
else
    echo "✗ FAIL (HTTP $RESULT)"
fi

# 测试3: 列出镜像
echo "测试3: 镜像列表"
curl -s http://$SERVER_IP:5000/v2/_catalog | jq .

echo ""
echo "=========================================="
echo "  Registry 信息"
echo "=========================================="
echo "Registry API: http://$SERVER_IP:5000/v2/"
echo "Registry UI:  http://$SERVER_IP:8081/"
