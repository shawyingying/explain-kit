# 需求讲解（explain）· Codex 兜底 stub

> **首选**：全局装 skill（在 explain-kit 仓库跑 `./install.sh`，会装到 `~/.codex/skills/explain/`），之后任意 demo 文件夹说「给 demo 加需求讲解」即可，无需本文件。本 stub 仅用于没装 skill 时。

当用户要求给当前原型 demo 加「需求讲解 / 需求解释遮罩层」时，按以下流程：

1. **定位 demo 根**：找到含 `.html` 的目录作为 demo 根——可能就是当前目录，也可能是子文件夹（如 `demo/`）。需求文档可能在兄弟文件夹（如 `需求文档/`）。
2. 读 explain-kit 的 `PLAYBOOK.md` 并按其「安装步骤」与「作者流程」操作：
   - 全局装过 skill 时位于 `~/.codex/skills/explain/PLAYBOOK.md`；
   - 否则从克隆的 explain-kit 仓库根读取 `PLAYBOOK.md`。
3. 把 `engine/`（来自 `~/.codex/skills/explain/engine/` 或仓库 `engine/`）拷到 **demo 根**（与 `.html` 同级）。
4. 给 demo 根里涉及的每个 `.html` 加 3 行 include（`engine/explain.css` + `engine/explain-engine.js` + `explain-config.js`，相对路径），不改动原 demo 既有内容。
5. 基于 `explain-config.template.js` 在 demo 根生成 `explain-config.js`：每条需求→steps；demo 专属操作用 `Explain.registerAction`；伪造/注入的演示态用 `Explain.registerCleanup` 还原；退出需关闭的弹窗/抽屉用 `Explain.registerExit`。每步 setup 自包含。
6. 若用户没给需求文档，先问用户要（路径/粘贴/按 demo 推断），不要臆造。
7. 告诉用户用浏览器验证：右下角「📖 需求讲解」→ 选需求卡片 → 走右侧步骤点。

> `engine/` 与 `PLAYBOOK.md` 是单一真相源，与 Claude Code 的 explain skill 共用同一份。
