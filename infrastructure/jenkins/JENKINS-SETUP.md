# Jenkins 多分支流水线配置手册

## 一、登录 Jenkins

```
URL: http://ci-cd:8080
用户名: admin
密码: admin
```

---

## 二、创建多分支流水线任务

### 步骤 1：新建任务

1. 点击左侧菜单 **新建任务**
2. 输入任务名称：`pet-platform`
3. 选择 **多分支流水线**（Multibranch Pipeline）
4. 点击 **确定**

### 步骤 2：配置 Branch Sources（分支源）

1. 在任务配置页面，找到 **Branch Sources** 部分
2. 点击 **添加源** → **GitHub**

配置如下：
```
- 凭证: 选择 github-credential（如果没有则先添加）
  * 点击右侧 **添加**
  * 类型: Username with password
  * 用户名: 你的 GitHub 用户名
  * 密码: 你的 GitHub 密码或 Token
  * ID: github-credential

- Repository Owner: 你的 GitHub 用户名 (zhaoqiangithub)
- Repository: pet-platform-map-rescue-info

- 行为 (Behaviors):
  * 添加 → Discover branches
    - Strategy: All branches
  * 添加 → Discover pull requests from origin
    - Strategy: Current pull request revision
```

### 步骤 3：配置 Build Configuration（构建配置）

1. 找到 **Build Configuration** 部分
2. 配置：
```
- 模式: by Jenkinsfile
- 脚本路径: infrastructure/jenkins/Jenkinsfile
```

### 步骤 4：配置构建设置（可选）

1. 找到 **构建设置** 部分
2. 勾选：
   - ✅ 丢弃旧的构建
     - 策略: 保持 10 个构建
   - ✅ 添加时间戳到构建控制台输出

### 步骤 5：保存

1. 点击 **保存** 按钮

---

## 三、立即触发构建

### 方法 1：扫描仓库

1. 进入 `pet-platform` 任务页面
2. 点击左侧 **立即扫描**
3. 观察日志，确认分支被识别

### 方法 2：手动触发构建

1. 进入 `pet-platform` 任务页面
2. 点击 **分支** 标签
3. 找到 `dev` 或 `main` 分支
4. 点击右侧 **构建** 按钮

---

## 四、观察构建日志

1. 构建开始后，会在左侧下方显示构建进度
2. 点击构建编号（如 #1）
3. 点击 **控制台输出** 查看完整日志

---

## 五、验证 Pipeline 阶段

构建成功后，应该看到以下阶段：

```
✅ Checkout - 拉取代码
✅ Build Backend - Maven 构建后端
✅ Build Frontend - NPM 构建前端
✅ Test Backend - 后端测试
✅ Test Frontend - 前端测试
✅ Build & Push Backend - Docker 构建推送后端
✅ Build & Push Frontend - Docker 构建推送前端
✅ Deploy to K8s - 部署到 K8s
```

---

## 六、常见问题

### 问题 1：找不到 GitHub 凭证

**解决**：
1. 先在 **系统管理** → **Manage Credentials** 中添加
2. 凭证类型选择 **Username with password**
3. ID 填写 `github-credential`

### 问题 2：无法连接 GitHub

**解决**：
1. 检查 GitHub 凭证是否正确
2. 检查 Jenkins 系统配置中的 GitHub 服务器

### 问题 3：Pipeline 阶段失败

**解决**：
1. 点击失败的阶段查看详细日志
2. 常见问题：
   - Maven 构建失败：检查 pom.xml
   - Docker 构建失败：检查 Dockerfile
   - K8s 部署失败：检查 kubectl 权限

---

## 七、配置完成后的完整流程

```
1. 你本地修改代码
2. git add . && git commit -m "xxx"
3. git push origin dev
4. Jenkins 自动触发构建
5. 构建完成后自动部署到 K8s 测试环境
6. 访问 http://100.89.107.21:31015 查看前端
```

---

## 八、关键配置汇总

| 配置项 | 值 |
|--------|-----|
| 任务类型 | 多分支流水线 |
| 凭证 | github-credential |
| 仓库 | zhaoqiangithub/pet-platform-map-rescue-info |
| 脚本路径 | infrastructure/jenkins/Jenkinsfile |
| 分支策略 | 自动发现所有分支 |
