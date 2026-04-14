# 贡献指南

感谢你考虑为 Hexo One Piece 项目做出贡献！

## 如何贡献

### 报告 Bug

如果你发现了 Bug，请优先通过仓库主页或站点联系方式和维护者同步，反馈时建议包含：

- 清晰的标题和描述
- 重现步骤
- 预期行为和实际行为
- 环境信息（Node 版本、操作系统等）
- 相关截图或错误日志

### 提交功能建议

1. 先在沟通渠道中描述你的想法
2. 说明为什么这个功能有用
3. 提供可能的实现方案

### 提交代码

1. **Fork 项目**
   ```bash
   git clone https://github.com/Leo0426/hexo-one-piece.git
   cd hexo-one-piece
   ```

2. **创建分支**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **安装依赖**
   ```bash
   corepack yarn install
   ```

4. **进行修改**
   - 遵循现有代码风格
   - 添加必要的注释
   - 提交前运行 `yarn run check`
   - 如果改动了 UI、样式或首页交互，再运行 `yarn run check:full`

5. **提交更改**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

6. **推送到远端仓库**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **创建 Merge Request**
   - 提供清晰的变更描述
   - 等待代码审查

## 代码规范

### 提交信息格式

使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
<type>(<scope>): <subject>

<body>

<footer>
```

类型（type）：
- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 重构
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建/工具链更新

示例：
```
feat(theme): add dark mode support

Add toggle button for dark mode in header
Update color scheme for better readability

Closes #123
```

### 代码风格

- 使用 2 空格缩进
- 使用单引号
- 行尾添加分号
- 遵循 ESLint 和 Prettier 配置

## 开发流程

1. **本地开发**
   ```bash
   yarn dev
   ```

2. **构建测试**
   ```bash
   yarn run check
   ```

3. **浏览器烟测**
   ```bash
   yarn run test:smoke
   ```

4. **清理缓存**
   ```bash
   yarn clean
   ```

## 问题和帮助

如有任何问题，欢迎：
- 访问仓库主页
- 在 Merge Request 中提问
- 联系维护者

再次感谢你的贡献！🎉
