# 需求讲解（explain）

当用户要求给当前原型 demo 加「需求讲解 / 需求解释遮罩层」时，按以下流程：

1. 读 explain-kit 的 `PLAYBOOK.md` 并按其「安装步骤」与「作者流程」操作。
   - 全局安装过 Claude Code 的 explain skill 时位于 `~/.claude/skills/explain/PLAYBOOK.md`；
   - 否则从克隆的 explain-kit 仓库根读取 `PLAYBOOK.md`。
2. 把 `engine/`（来自 `~/.claude/skills/explain/engine/` 或仓库 `engine/`）拷到当前 demo 项目根。
3. 给讲解涉及的每个 `.html` 页面加 3 行 include（`engine/explain.css` + `engine/explain-engine.js` + `explain-config.js`），不改动原 demo 既有内容。
4. 基于 `explain-config.template.js` 在 demo 根生成 `explain-config.js`：每条需求→steps；demo 专属操作用 `Explain.registerAction`；伪造/注入的演示态用 `Explain.registerCleanup` 还原；退出需关闭的弹窗/抽屉用 `Explain.registerExit`。每步 setup 自包含。
5. 告诉用户用浏览器验证：右下角「📖 需求讲解」→ 选需求卡片 → 走右侧步骤点。

> Codex 没有 skill 机制，本文件是常驻指令 stub。`engine/` 与 `PLAYBOOK.md` 是单一真相源，与 Claude Code 的 explain skill 共用同一份。
