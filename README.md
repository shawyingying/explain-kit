# explain-kit · 原型 demo 需求讲解工具包

给静态 HTML 原型 demo 加一层「需求讲解」能力：右下角按钮 → 底部需求卡片 → 进入讲解后右侧步骤点逐条跳转，每步在页面对应位置聚光灯高亮 + 讲解文字，跨页自动续上。日常隐藏，不改原 demo。

面向**用 AI 辅助工具做原型 demo 的人**：demo 做完后，让 AI 按 `PLAYBOOK.md` 一键生成讲解配置。

## 工具分工

同一份 `engine/` + `PLAYBOOK.md`，按工具分两种调用方式：

- **Claude Code**：打包成 **Skill**，全局装一次，任意 demo 文件夹敲 `/explain` 即用。
- **Codex / Cursor 等**：没有 skill 机制，用各自的规则/指令文件（`AGENTS.md` / `.cursor/rules`）作 stub，指向同一份 `PLAYBOOK.md`。

## Claude Code：装为 Skill（推荐）

```sh
git clone https://github.com/shawyingying/explain-kit.git
cd explain-kit
./install.sh
```

脚本把 `SKILL.md`+`engine/`+`PLAYBOOK.md`+模板+示例装到 `~/.claude/skills/explain/`（用户级，所有项目可用），并清理旧版 `/explain` 命令。之后在任意 demo 文件夹敲 `/explain`：skill 自动读自带 `PLAYBOOK.md`、拷 `engine/` 进 demo、加 include、按需求文档生成 `explain-config.js`。

> 更新：重新跑 `./install.sh`（幂等）。
> 项目级（只想给某个 demo 装）：把 `SKILL.md`+`engine/`+`PLAYBOOK.md`+`explain-config.template.js`+`examples/` 拷进该 demo 的 `.claude/skills/explain/`。

## Codex / Cursor / 其它 AI 工具

这些工具没有 skill 概念，用各自的常驻指令文件指向同一份 `PLAYBOOK.md`：

- **Codex**：把 `launchers/codex-AGENTS.md` 的内容放进 demo 项目根的 `AGENTS.md`（或追加进去），然后对 Codex 说「给当前 demo 加需求讲解」。
- **Cursor**：把 `launchers/cursor-rule.mdc` 拷进 demo 的 `.cursor/rules/`。
- **任意工具**：直接对 AI 说「读 `<explain-kit 路径>/PLAYBOOK.md`，给当前 demo 加需求讲解」。

> 引擎文件仍会落到每个 demo 里（浏览器需从本地加载）。`PLAYBOOK.md` 与 `engine/` 是单一真相源，所有工具共用。

## 仓库结构

```
SKILL.md                    # Claude Code skill（薄壳，委托给 PLAYBOOK.md）
engine/                     # 通用引擎（drop-in，勿改）
  explain-engine.js         # 配置驱动；Explain.config/registerAction/registerCleanup/registerExit
  explain.css
PLAYBOOK.md                 # AI 指令手册（核心，所有工具共用）
explain-config.template.js  # 起始模板，复制为 explain-config.js 后由 AI 填写
examples/REQK-01/           # 真实 demo 参考配置（6 步、跨 3 页、含自定义动作与异常态模拟）
launchers/
  codex-AGENTS.md           # Codex 常驻指令 stub
  cursor-rule.mdc           # Cursor 规则 stub
install.sh                  # 装为 Claude Code 个人级 skill（~/.claude/skills/explain/）
README.md
```

## 工作原理

引擎（`engine/`）只认「配置 + 注册的动作」，完全不知道 demo 细节。所有需求步骤、demo 专属操作都写在 `explain-config.js` 里——这正是 AI 能按 `PLAYBOOK.md` 自动生成的那部分。引擎与配置分离，所以同一份引擎能用在任何 demo 上。

详见 `PLAYBOOK.md`。
