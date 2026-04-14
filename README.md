# Hexo One Piece 🏴‍☠️

一个基于 [hexo-theme-shoka](https://github.com/amehime/hexo-theme-shoka) 定制的海贼王主题 Hexo 博客模板。

[![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![Hexo Version](https://img.shields.io/badge/hexo-7.3.0-blue)](https://hexo.io/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

## ✨ 特性

- 🎨 精美的海贼王主题设计
- 📱 响应式布局，完美支持移动端
- 🚀 快速构建和部署
- 🐳 Docker 支持，一键部署
- 📝 Markdown 增强支持
- 🔍 站内搜索功能
- 📊 文章字数统计和阅读时间
- 📡 RSS/Atom/JSON Feed 支持

---

## 📁 项目结构

```text
hexo-one-piece/
├── _config.yml              # Hexo 主配置文件
├── package.json             # 项目依赖和脚本
├── scaffolds/               # 文章模板
├── source/                  # 源文件目录
│   ├── _drafts/            # 草稿文章
│   └── _posts/             # 发布文章
├── themes/                  # 主题目录
│   └── onePiece/           # One Piece 主题
├── public/                  # 生成的静态文件（构建后）
├── Dockerfile               # Docker 构建配置
├── nginx.conf               # Nginx 服务器配置
```


## 🚀 快速开始

### 环境要求

- Node.js >= 18.0.0
- Yarn Classic >= 1.22.0

### 安装步骤

1. **克隆项目**
   ```bash
   git clone https://heyonepiece-gitlab.ddnsto.com/leo-personal-group/hexo-one-piece.git
   cd hexo-one-piece
   ```

2. **安装依赖**
   ```bash
   corepack yarn install
   ```

3. **本地开发**
   ```bash
   yarn dev
   # 访问 http://localhost:4000
   ```

4. **构建生产版本**
   ```bash
   yarn build
   ```

5. **执行质量检查**
   ```bash
   yarn run check
   ```

6. **执行首页烟测**
   ```bash
   yarn run test:smoke
   ```

### 常用命令

```bash
yarn dev          # 启动开发服务器（带调试）
yarn build        # 清理并构建静态文件
yarn server       # 启动本地服务器
yarn preview      # 预览草稿文章
yarn new          # 创建新文章
yarn clean        # 清理缓存和生成的文件
yarn lint         # 检查主题脚本
yarn run check    # 执行 lint + build
yarn run test:smoke # 执行首页浏览器烟测
yarn run check:full # 执行 lint + build + smoke
```

## 🐳 Docker 部署

### 使用 Docker 构建和运行

```bash
# 构建镜像
docker build -t hexo-one-piece .

# 运行容器
docker run -d -p 80:80 hexo-one-piece

# 访问 http://localhost
```

### 使用 Docker Compose（推荐）

创建 `docker-compose.yml`：

```yaml
version: '3.8'
services:
  blog:
    build: .
    ports:
      - "80:80"
    restart: unless-stopped
```

运行：
```bash
docker-compose up -d
```

---

## 📦 插件说明

项目已集成以下 Hexo 插件： 

| 插件名称 | 功能描述 | 版本 |
|---------|---------|------|
| hexo-renderer-multi-markdown-it | Markdown 渲染器，本地维护 fork，兼容新版依赖链 | file:packages/hexo-renderer-multi-markdown-it |
| hexo-symbols-count-time | 文章字数统计和阅读时间，本地维护 fork | file:packages/hexo-symbols-count-time |
| hexo-feed | 生成 RSS/Atom/JSON Feed | ^3.0.0 |
| hexo-generator-* | 生成归档、分类、标签、索引页面 | ^2.0.0+ |
| postcss + autoprefixer | 构建后为生成的 CSS 添加浏览器前缀 | ^8 / ^10 |
| @playwright/test | 首页关键交互浏览器烟测 | ^1.59.1 |

其中 `packages/` 目录保存了项目内维护的轻量 vendor 包，只对上游未修复的依赖安全问题和兼容性问题做最小修补。

### ⚠️ 注意事项

1. **Prism 语法高亮**
   - 如果遇到 `Prism's Diff Highlight plugin requires...` 提示
   - 需要从 [Prism 官网](https://prismjs.com/) 下载对应的语言定义文件

2. **Stylus 循环依赖警告**
   - 如果出现 circular dependency 警告
   - 使用以下命令查看详细堆栈信息：
   ```bash
   yarn cross-env NODE_OPTIONS="--trace-warnings" hexo s
   ```
   - 已通过 `resolutions` 字段锁定 stylus 版本解决

3. **Playwright 首次运行**
   - `yarn run test:smoke` 会在首次执行时自动下载 Chromium
   - 如果网络受限，也可以提前手动执行：
   ```bash
   yarn playwright install chromium
   ```

## 📝 写作指南

### 创建新文章

```bash
yarn new "文章标题"
# 或
yarn hexo new post "文章标题"
```

### 创建草稿

```bash
yarn hexo new draft "草稿标题"
```

### 发布草稿

```bash
yarn hexo publish draft "草稿标题"
```

---

## 🎨 主题配置

主题配置文件位于 `themes/onePiece/_config.yml`

主要配置项：
- 站点信息
- 社交链接
- 评论系统
- 统计分析
- Iconfont 图标：https://www.iconfont.cn/

详细配置请参考主题文档。

---

## 🔧 常见问题

### 修改文件后不生效？

建议先清除缓存：
```bash
yarn clean
yarn build
```

### UI 或样式改动后怎么回归？

建议至少执行：
```bash
yarn run check:full
```
它会完成脚本检查、站点构建以及首页关键交互烟测。

### 如何部署到静态托管平台？

1. 修改 `_config.yml` 中的 `url` 配置
2. 配置 `deploy` 部署选项
3. 运行 `yarn deploy`

---

## 🤝 贡献

欢迎通过仓库主页和站点联系方式反馈问题与改进建议。

### 开发流程

1. Fork 本仓库或创建你自己的分支
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 发起 Merge Request

---

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

---

## 🙏 致谢

- 感谢 [@amehime](https://github.com/amehime) 提供的优秀主题 [hexo-theme-shoka](https://github.com/amehime/hexo-theme-shoka)
- 感谢 Hexo 社区的所有贡献者

---

## 📮 联系方式

- 作者：Leo Lu
- 网站：https://www.heyonepiece.com
