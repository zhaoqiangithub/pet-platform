# 前端 Web 应用 Dockerfile
FROM node:20 AS builder
WORKDIR /app

# 复制依赖文件
COPY package.json package-lock.json ./

# 安装所有依赖（包括 react-dom、react-native-web）
RUN npm ci --legacy-peer-deps

# 复制源代码
COPY . .

# 构建 Web 应用（Expo SDK 52 输出到 dist/）
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
