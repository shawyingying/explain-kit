---
name: explain
description: 给静态 HTML 原型 demo 加「需求讲解」遮罩层——右下角按钮→底部需求卡片→右侧步骤点逐条跳转、聚光灯高亮 + 讲解文字（卡可拖动）、跨页自动续上。demo 做完后调用：自动复制 demo 到同级副本、在副本里拷引擎 + 加 include + 生成配置，原 demo 不动。面向纯静态 HTML 原型。
---

# explain · 原型 demo 需求讲解

给当前项目的静态 HTML 原型 demo 加一层「需求讲解」能力：右下角按钮 → 底部需求卡片 → 进入讲解后右侧步骤点逐条跳转，每步在页面对应位置聚光灯高亮 + 讲解文字，跨页自动续上。日常隐藏，全程在副本里做、原 demo 不动。

## 资源（本 skill 自带，位于 skill 目录）

skill 目录：
- **Claude Code** → `${CLAUDE_SKILL_DIR}`（通常 `~/.claude/skills/explain/`）
- **Codex** → `~/.codex/skills/explain/`

内含：
- `PLAYBOOK.md` — 完整 AI 指令手册，**必读**，按它操作。
- `engine/` — 通用引擎（`explain-engine.js` + `explain.css`），drop-in，勿改。
- `explain-config.template.js` — 配置起始模板。
- `examples/REQ-DEMO-01/` — 合成参考示例（虚构 demo，6 步、跨 3 页、含自定义动作与异常态模拟）。

## 执行步骤

> **全程在原 demo 的副本里操作，原 demo 一个字都不改。**

1. 读 skill 目录下的 `PLAYBOOK.md`（Claude Code: `${CLAUDE_SKILL_DIR}/PLAYBOOK.md`；Codex: `~/.codex/skills/explain/PLAYBOOK.md`），按其「安装步骤」与「作者流程」操作。
2. **定位 demo 根**：找到含 `.html` 的目录作为 demo 根——它可能就是当前目录，也可能是子文件夹（如 `demo/`）。**需求文档**可能在兄弟文件夹（如 `需求文档/`），两处都看一下。
3. **复制 demo 到同级副本**：在 demo 根同级建 `<原名>-讲解/`，整份 `cp -R` 复制 demo 根进去。**单文件 demo**（一个 `.html` 躺在大杂烩文件夹里）则只复制该 `.html` + 它引用的本地资源（`<link>/<script>/<img>/<source>/<video>/<audio>` 里的本地路径，不含 `http(s)://`、`data:`），保持目录结构；原代码里的绝对路径（`/assets/...`、`file:///`、`C:\...`）在副本里改成相对路径，避免引用失效。后续所有操作都在副本里。
4. **确认需求文档（必须问用户，不要自作主张）**：即便在 demo 文件夹里发现了详细的 README / docs / `.md` 文件，也**不要自动把它当成需求文档**——demo 说明文档 ≠ 需求文档。必须先问用户：「哪个文件是需求文档？还是直接粘贴需求内容？还是跳过、按 demo 现有界面与文案推断？」拿到用户明确答复后再读。提问方式按所用工具：Claude Code 用 `AskUserQuestion`；Codex / Cursor 等没有该工具的，直接在对话里提问并**停下来等用户回答**，不要替用户决定。**缺文档且用户让跳过时，只能按 demo 现有界面与文案推断，不要臆造需求**。
   - **有多个需求要讲解时**（无论来自一份还是多份文档），同样要问用户「逐个生成」还是「一次性生成」并给利弊（逐个：可逐条验证、出错范围小、可中途调写法，但慢；一次性：快、能通盘去重排序，但配置大、一条错全盘受影响、难复核），建议默认逐个跑通第一条再批量。提问同样按工具走，Codex / Cursor 要停下等回答。
5. 把 skill 目录下的 `engine/` 拷到**副本根**（与 `.html` 同级）。
6. 给副本里涉及的 `.html` 页面加 3 行 include（`engine/explain.css` + `engine/explain-engine.js` + `explain-config.js`，相对路径），仅加 include 行 + 新增 `engine/` 与 `explain-config.js`，不动副本里复制的原 demo 内容。
7. 基于 skill 目录下的 `explain-config.template.js` 在副本根生成 `explain-config.js`：把每条需求映射成 steps；需要 demo 专属操作时用 `Explain.registerAction` 注册；任何伪造/注入的演示态用 `Explain.registerCleanup` 还原；退出需关闭的弹窗/抽屉用 `Explain.registerExit`。每步 setup 自包含（可从任意步骤点直接跳入）；弹窗/抽屉过渡后给 `{t:'wait',ms:200~300}` 再定位。**需求里 demo 视觉看不到的状态/数据流/权限/异步结果**，用内置 `{t:'annotate'}`（元素旁钉标签）与 `{t:'simulate'}`（弹通知模拟后端反馈）补出来——两者每步自动清除，详见 PLAYBOOK「内置动作」。
8. 完成后告诉用户用浏览器打开**副本**里的 `.html` 验证（点右下角「📖 需求讲解」→ 选需求卡片 → 走右侧步骤点；讲解卡挡内容时可拖标题栏移开）。
