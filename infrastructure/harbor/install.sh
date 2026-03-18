#!/bin/bash
# Harbor 安装脚本
# 用途: 一键安装 Harbor (开发/测试环境)

set -e

echo "=========================================="
echo "  Harbor 安装脚本 v2.10.0"
echo "=========================================="

# 检查 Docker
if ! command -v docker &> /dev/null; then
    echo "错误: Docker 未安装"
    exit 1
fi

# 检查 Docker Compose
if ! command -v docker compose &> /dev/null; then
    echo "检查 docker-compose 插件..."
    if ! command -v docker-compose &> /dev/null; then
        echo "错误: Docker Compose 未安装"
        exit 1
    fi
    COMPOSE_CMD="docker-compose"
else
    COMPOSE_CMD="docker compose"
fi

echo "Docker 版本: $($COMPOSE_CMD --version)"

# 创建数据目录
echo "创建数据目录..."
mkdir -p /data/{ca_download,registry,chart_storage,jobservice,redis,trust_cert,secret_keys,database}

# 生成 SSL 证书
if [ ! -f "certs/server.crt" ]; then
    echo "生成 SSL 证书..."
    chmod +x generate-certs.sh
    ./generate-certs.sh
else
    echo "SSL 证书已存在，跳过生成"
fi

# 启动 Harbor
echo "启动 Harbor 服务..."
$COMPOSE_CMD up -d

# 等待服务启动
echo "等待服务启动..."
sleep 10

# 检查服务状态
echo "检查服务状态..."
$COMPOSE_CMD ps

echo ""
echo "=========================================="
echo "  Harbor 安装完成!"
echo "=========================================="
echo ""
echo "访问地址:"
echo "  HTTP:  http://harbor.local"
echo "  HTTPS: https://harbor.local"
echo ""
echo "默认账号:"
echo "  用户名: admin"
echo "  密码:   Harbor12345"
echo ""
echo "请在 /etc/hosts 中添加:"
echo "  127.0.0.1 harbor.local"
echo ""
echo "常用命令:"
echo "  启动: $COMPOSE_CMD start"
echo "  停止: $COMPOSE_CMD stop"
echo "  重启: $COMPOSE_CMD restart"
echo "  日志: $COMPOSE_CMD logs -f"
