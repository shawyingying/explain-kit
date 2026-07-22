---
description: 给当前原型 demo 添加「需求讲解」遮罩层（全局安装；自动接入 engine，无需手动拷贝）
---

全局资源在 `~/.explain-kit/`（引擎、PLAYBOOK、模板）。按 `~/.explain-kit/PLAYBOOK.md` 的流程，为**当前项目**的原型 demo 添加「需求讲解」能力。

执行步骤：
1. 读 `~/.explain-kit/PLAYBOOK.md`，按其「安装步骤」与「作者流程」操作。
2. 列出当前 demo 的所有 `.html` 页面与需求文档（如有），识别讲解会涉及的页面。
3. 把 `~/.explain-kit/engine/` 拷到当前项目根的 `engine/`（已存在则比对更新）。
4. 给涉及的 `.html` 页面加 3 行 include（`engine/explain.css` + `engine/explain-engine.js` + `explain-config.js`），**不改动原 demo 既有内容**，仅加 include 行 + 新增 `engine/` 与 `explain-config.js`。
5. 基于 `~/.explain-kit/explain-config.template.js` 在项目根生成 `explain-config.js`：把每条需求映射成 steps；需要 demo 专属操作时用 `Explain.registerAction` 注册；任何伪造/注入的演示态用 `Explain.registerCleanup` 还原；退出需关闭的弹窗/抽屉用 `Explain.registerExit`。每步 setup 自包含（可从任意步骤点直接跳入）；弹窗/抽屉过渡后给 `{t:'wait',ms:200~300}` 再定位。
6. 完成后告诉用户如何用浏览器验证（点右下角「📖 需求讲解」→ 选需求卡片 → 走右侧步骤点）。

如果 $ARGUMENTS 给定了需求文档路径或讲解范围，优先按其讲解。
