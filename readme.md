## 开发和测试阶段

### 1. 设置开发环境
```bash
# 创建插件目录
mkdir design-token-tooltip
cd design-token-tooltip

# 初始化项目
npm init -y

# 安装依赖
npm install --save-dev @types/vscode @types/node typescript

# 创建 TypeScript 配置
echo '{
  "compilerOptions": {
    "module": "commonjs",
    "target": "ES2020",
    "outDir": "out",
    "lib": ["ES2020"],
    "sourceMap": true,
    "rootDir": "src",
    "strict": true
  }
}' > tsconfig.json
```

### 2. 项目结构
```
design-token-tooltip/
├── src/
│   └── extension.ts        # 主代码文件
├── package.json           # 插件配置
├── tsconfig.json         # TypeScript配置
└── tokens.json           # 示例token数据
```

### 3. 启动开发模式
```bash
# 编译代码
npx tsc -p ./

# 或者监听模式（推荐）
npx tsc -watch -p ./
```

### 4. 在 VSCode 中测试
1. 在 VSCode 中打开插件项目文件夹
2. 按 `F5` 或 `Ctrl+F5` 启动调试
3. 这会打开一个新的 "Extension Development Host" 窗口
4. 在新窗口中，插件会自动激活

## 插件的启动和关闭

### 自动启动
插件会在以下情况自动启动：
- 打开支持的文件类型（CSS、SCSS、JS、TS、Vue、HTML）
- VSCode 启动时（如果之前使用过）

### 手动控制

#### 查看插件状态
1. 打开命令面板：`Ctrl+Shift+P` (Windows/Linux) 或 `Cmd+Shift+P` (Mac)
2. 输入 "Extensions: Show Running Extensions"
3. 可以看到当前运行的所有插件

#### 重新加载插件
```bash
# 命令面板中执行
Developer: Reload Window
```

#### 禁用插件
1. 打开扩展面板：`Ctrl+Shift+X`
2. 找到你的插件
3. 点击"禁用"按钮

#### 重新加载 Token 数据
```bash
# 命令面板中执行
Design Token: Reload Design Tokens
```

## 生产环境部署

### 打包插件
```bash
# 安装打包工具
npm install -g vsce

# 打包成 .vsix 文件
vsce package
```

### 安装打包后的插件
```bash
# 从 .vsix 文件安装
code --install-extension design-token-tooltip-0.0.1.vsix
```

### 卸载插件
```bash
# 命令行卸载
code --uninstall-extension your-publisher.design-token-tooltip

# 或在 VSCode 扩展面板中点击卸载
```

## 配置管理

### 工作区配置
在项目根目录创建 `.vscode/settings.json`：
```json
{
  "designToken.filePath": "./src/tokens/design-tokens.json"
}
```

### 用户配置
在 VSCode 设置中添加：
```json
{
  "designToken.filePath": "/path/to/your/tokens.json"
}
```

## 调试和日志

### 查看插件日志
1. 打开开发者工具：`Help > Toggle Developer Tools`
2. 在 Console 中查看插件的 `console.log` 输出

### 常用调试命令
```bash
# 重启 VSCode
Developer: Reload Window

# 查看插件状态
Developer: Show Running Extensions

# 清除扩展缓存
Developer: Reset Extension Host
```

## 快速测试流程

1. **开发时**：
   ```bash
   npm run watch  # 持续编译
   # F5 启动调试窗口
   ```

2. **测试功能**：
   - 创建一个 CSS 文件
   - 写入 `color: var(--primary-500);`
   - 鼠标悬停在 `--primary-500` 上
   - 应该看到 tooltip 显示

3. **修改配置**：
   - 在设置中配置 token 文件路径
   - 使用 `Ctrl+Shift+P` → "Reload Design Tokens" 重新加载
