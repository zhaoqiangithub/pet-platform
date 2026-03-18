#!/bin/bash
# 生成 Harbor 自签名 SSL 证书
# 用法: ./generate-certs.sh [域名]

DOMAIN=${1:-harbor.local}
DAYS=${2:-365}

echo "生成 SSL 证书 for $DOMAIN ..."

# 创建证书目录
mkdir -p certs

# 生成私钥
openssl genrsa -out certs/server.key 4096

# 生成自签名证书
openssl req -new -x509 \
    -key certs/server.key \
    -out certs/server.crt \
    -days $DAYS \
    -subj "/C=CN/ST=Shanghai/L=Shanghai/O=PetPlatform/CN=$DOMAIN"

echo "证书生成完成!"
echo "  域名: $DOMAIN"
echo "  有效期: $DAYS 天"
echo ""
echo "请在 hosts 文件中添加:"
echo "  127.0.0.1 $DOMAIN"
