# 构建阶段
FROM node:18-alpine AS builder

WORKDIR /app

# 复制依赖文件
COPY package.json yarn.lock ./

# 安装依赖
RUN corepack enable && yarn install --frozen-lockfile

# 复制源代码
COPY . .

# 生成静态文件
RUN corepack enable && yarn build

# 部署阶段
FROM nginx:alpine

# 复制自定义 nginx 配置（可选）
# COPY nginx.conf /etc/nginx/nginx.conf

# 从构建阶段复制生成的静态文件
COPY --from=builder /app/public /usr/share/nginx/html

# 暴露 80 端口
EXPOSE 80

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# 启动 Nginx 服务器
CMD ["nginx", "-g", "daemon off;"]
