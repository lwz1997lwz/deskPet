# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

桌面猫咪（deskPet）— 一个基于 Electron 的跨平台桌面宠物程序。猫咪在桌面上自由活动，支持点击互动、拖拽移动，并提供待办事项提醒和系统资源监控功能。

## 常用命令

```bash
npm start              # 启动 Electron 应用（开发模式）
npm test               # 运行全部 Jest 测试（jsdom 环境）
npm test -- tests/unit/state-machine.test.js  # 运行单个测试文件
npm run build:win      # Windows 平台打包（NSIS 安装包）
npm run build:mac      # macOS 平台打包（DMG）
```

## 架构

单窗口 + Canvas 动画方案，主进程与渲染进程通过 IPC 通信。

### 主进程 (`electron/`)
- `main.js` — 创建透明无边框窗口（alwaysOnTop）、系统托盘、IPC 监听（窗口拖拽、退出）
- `preload.js` — contextBridge 暴露 electronAPI（当前未启用 contextIsolation，渲染进程直接 require）

### 渲染进程 (`src/renderer/`)
- `app.js` — 入口文件，初始化所有子系统，启动 requestAnimationFrame 游戏循环，处理鼠标交互
- 窗口特性：frame: false, transparent: true, alwaysOnTop: true

### 引擎层 (`src/engine/`)
- `canvas.js` — 多层画布管理器（背景层 → 猫咪层 → 特效层 → UI 层）
- `animation.js` — 帧动画引擎，支持注册/播放/循环控制
- `collision.js` — 边界碰撞检测与实体约束

### 猫咪系统 (`src/cat/`)
- `state-machine.js` — 通用状态机（支持 onEnter/onExit/onUpdate 回调）
- `sprite.js` — 精灵实体，持有位置、速度、方向、状态机
- `behaviors.js` — 行为逻辑（idle/walk/sleep/interact/chase），驱动精灵移动并约束边界

### 功能模块 (`src/features/`)
- `todo.js` — 待办事项管理（JSON 文件持久化于 `data/todos.json`）
- `system-monitor.js` — CPU/内存监控（2 秒轮询，基于 os.cpus() 差值计算真实 CPU 使用率）

### UI 组件 (`src/ui/`)
- `bubble.js` — 气泡提示（毛玻璃效果，自动隐藏）
- `menu.js` — 右键菜单（动态创建 DOM，点击外部关闭）
- `settings.js` — 设置面板（依赖 electron-store，当前未集成到主流程）

### 素材 (`assets/`)
精灵图按状态分目录：`assets/cats/default/{idle,walk,sleep,interact,drag}/`，每帧一个 PNG 文件。

## 关键设计决策

- **渲染方式**：Canvas 2D 而非 DOM，精灵图逐帧绘制，支持方向翻转（ctx.scale(-1,1)）
- **状态机复用**：CatSprite 内部持有 StateMachine 实例，app.js 配置状态回调而非在 sprite 内硬编码
- **窗口拖拽**：通过 IPC 发送 deltaX/deltaY，主进程 setPosition 移动窗口（非 CSS -webkit-app-region）
- **精灵图加载**：渲染进程通过 fs 读取文件系统，用 file:/// 协议加载图片到 offscreen canvas
- **猫跟随视线**：非拖拽时鼠标在 200px 范围内，猫咪朝向跟随鼠标方向

## 测试

Jest + jsdom 环境。测试文件位于 `tests/unit/`，使用 `require()` 导入源码模块。当前覆盖引擎层和状态机。

<!-- superpowers-zh:begin (do not edit between these markers) -->
## Superpowers-ZH 中文增强版

本项目已安装 superpowers-zh 技能框架（20 个 skills）。

### 核心规则

1. **收到任务时，先检查是否有匹配的 skill** — 哪怕只有 1% 的可能性也要检查
2. **设计先于编码** — 收到功能需求时，先用 brainstorming skill 做需求分析
3. **测试先于实现** — 写代码前先写测试（TDD）
4. **验证先于完成** — 声称完成前必须运行验证命令

### 可用 Skills

Skills 位于 `.claude/skills/` 目录，每个 skill 有独立的 `SKILL.md` 文件。

- **brainstorming**: 在任何创造性工作之前必须使用此技能——创建功能、构建组件、添加功能或修改行为。在实现之前先探索用户意图、需求和设计。
- **chinese-code-review**: 中文 review 沟通参考——话术模板、分级标注（必须修复/建议修改/仅供参考）、国内团队常见反模式应对。仅在用户显式 /chinese-code-review 时调用，不要根据上下文自动触发。
- **chinese-commit-conventions**: 中文 commit 与 changelog 配置参考——Conventional Commits 中文适配、commitlint/husky/commitizen 中文模板、conventional-changelog 中文配置。仅在用户显式 /chinese-commit-conventions 时调用，不要根据上下文自动触发。
- **chinese-documentation**: 中文文档排版参考——中英文空格、全半角标点、术语保留、链接格式、中文文案排版指北约定。仅在用户显式 /chinese-documentation 时调用，不要根据上下文自动触发。
- **chinese-git-workflow**: 国内 Git 平台配置参考——Gitee、Coding.net、极狐 GitLab、CNB 的 SSH/HTTPS/凭据/CI 接入差异与镜像同步配置。仅在用户显式 /chinese-git-workflow 时调用，不要根据上下文自动触发。
- **dispatching-parallel-agents**: 当面对 2 以上可以独立进行、无共享状态或顺序依赖的任务时使用
- **executing-plans**: 当你有一份书面实现计划需要在单独的会话中执行，并设有审查检查点时使用
- **finishing-a-development-branch**: 当实现完成、所有测试通过、需要决定如何集成工作时使用——通过提供合并、PR 或清理等结构化选项来引导开发工作的收尾
- **mcp-builder**: MCP 服务器构建方法论 — 系统化构建生产级 MCP 工具，让 AI 助手连接外部能力
- **receiving-code-review**: 收到代码审查反馈后、实施建议之前使用，尤其当反馈不明确或技术上有疑问时——需要技术严谨性和验证，而非敷衍附和或盲目执行
- **requesting-code-review**: 完成任务、实现重要功能或合并前使用，用于验证工作成果是否符合要求
- **subagent-driven-development**: 当在当前会话中执行包含独立任务的实现计划时使用
- **systematic-debugging**: 遇到任何 bug、测试失败或异常行为时使用，在提出修复方案之前执行
- **test-driven-development**: 在实现任何功能或修复 bug 时使用，在编写实现代码之前
- **using-git-worktrees**: 当需要开始与当前工作区隔离的功能开发，或在执行实现计划之前使用——通过原生工具或 git worktree 回退机制确保隔离工作区存在
- **using-superpowers**: 在开始任何对话时使用——确立如何查找和使用技能，要求在任何响应（包括澄清性问题）之前调用 Skill 工具
- **verification-before-completion**: 在宣称工作完成、已修复或测试通过之前使用，在提交或创建 PR 之前——必须运行验证命令并确认输出后才能声称成功；始终用证据支撑断言
- **workflow-runner**: 在 Claude Code / OpenClaw / Cursor 中直接运行 agency-orchestrator YAML 工作流——无需 API key，使用当前会话的 LLM 作为执行引擎。当用户提供 .yaml 工作流文件或要求多角色协作完成任务时触发。
- **writing-plans**: 当你有规格说明或需求用于多步骤任务时使用，在动手写代码之前
- **writing-skills**: 当创建新技能、编辑现有技能或在部署前验证技能是否有效时使用

### 如何使用

当任务匹配某个 skill 时，使用 `Skill` 工具加载对应 skill 并严格遵循其流程。绝不要用 Read 工具读取 SKILL.md 文件。

如果你认为哪怕只有 1% 的可能性某个 skill 适用于你正在做的事情，你必须调用该 skill 检查。
<!-- superpowers-zh:end -->
