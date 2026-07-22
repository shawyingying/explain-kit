---
name: explain
description: 给静态 HTML 原型 demo 加「需求讲解」遮罩层——右下角按钮→底部需求卡片→右侧步骤点逐条跳转、聚光灯高亮 + 讲解文字、跨页自动续上。demo 做完后调用，自动拷引擎 + 加 include + 生成配置，不改原 demo。面向纯静态 HTML 原型。
---

# explain · 原型 demo 需求讲解

给当前项目的静态 HTML 原型 demo 加一层「需求讲解」能力：右下角按钮 → 底部需求卡片 → 进入讲解后右侧步骤点逐条跳转，每步在页面对应位置聚光灯高亮 + 讲解文字，跨页自动续上。日常隐藏，不改原 demo。

## 资源（本 skill 自带，位于 skill 目录）

skill 目录 = 环境变量 `${CLAUDE_SKILL_DIR}`（通常 `~/.claude/skills/explain/`）。内含：

- `PLAYBOOK.md` — 完整 AI 指令手册，**必读**，按它操作。
- `engine/` — 通用引擎（`explain-engine.js` + `explain.css`），drop-in，勿改。
- `explain-config.template.js` — 配置起始模板。
- `examples/REQK-01/` — 真实 demo 参考配置（6 步、跨 3 页、含自定义动作与异常态模拟）。

## 执行步骤

1. 读 `${CLAUDE_SKILL_DIR}/PLAYBOOK.md`，按其「安装步骤」与「作者流程」操作。
2. 列出当前 demo 的所有 `.html` 页面与需求文档（如有），识别讲解会涉及的页面。
3. 把 `${CLAUDE_SKILL_DIR}/engine/` 拷到当前项目根的 `engine/`。
4. 给涉及的 `.html` 页面加 3 行 include（`engine/explain.css` + `engine/explain-engine.js` + `explain-config.js`），**不改动原 demo 既有内容**，仅加 include 行 + 新增 `engine/` 与 `explain-config.js`。
5. 基于 `${CLAUDE_SKILL_DIR}/explain-config.template.js` 在项目根生成 `explain-config.js`：把每条需求映射成 steps；需要 demo 专属操作时用 `Explain.registerAction` 注册；任何伪造/注入的演示态用 `Explain.registerCleanup` 还原；退出需关闭的弹窗/抽屉用 `Explain.registerExit`。每步 setup 自包含（可从任意步骤点直接跳入）；弹窗/抽屉过渡后给 `{t:'wait',ms:200~300}` 再定位。
6. 完成后告诉用户如何用浏览器验证（点右下角「📖 需求讲解」→ 选需求卡片 → 走右侧步骤点）。

如果用户给定了需求文档路径或讲解范围，优先按其讲解。
