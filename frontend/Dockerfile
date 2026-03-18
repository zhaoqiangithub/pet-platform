# 前端 Web 应用 Dockerfile
FROM node:20 AS builder
WORKDIR /app

# 复制依赖文件
COPY package.json package-lock.json ./

# 安装依赖（使用legacy-peer-deps解决版本冲突）
RUN npm ci --legacy-peer-deps

# 复制源代码
COPY . .

# 安装 Web 支持依赖（使用legacy-peer-deps）
RUN npx expo install react-dom react-native-web @expo/metro-runtime -- --legacy-peer-deps

# 构建 Web 应用（Expo）
RUN npx expo export

# 生产阶段 - Nginx
FROM nginx:alpine

# 复制构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制 Nginx 配置
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
