# explain-kit · 原型 demo 需求讲解工具包

给静态 HTML 原型 demo 加一层「需求讲解」能力：右下角按钮 → 底部需求卡片 → 进入讲解后右侧步骤点逐条跳转，每步在页面对应位置聚光灯高亮 + 讲解文字，跨页自动续上。日常隐藏，不改原 demo。

面向**用 AI 辅助工具（Claude Code、Codex、Cursor 等）做原型 demo 的人**：demo 做完后，让 AI 读 `PLAYBOOK.md` 即可一键生成讲解配置。

## 它适合谁

- 经常做纯静态 HTML 原型 demo、需要给客户/评审讲解每个需求在界面上的落点。
- 用 Claude Code / Codex 等 AI 工具辅助开发，希望「做完 demo → 一句话生成讲解」。

## 30 秒上手

### Claude Code
1. 把本仓库内容拷进你的 demo 项目根目录（至少 `engine/`、`PLAYBOOK.md`、`explain-config.template.js`、`.claude/`）。
2. 在 demo 项目里敲 `/explain`（来自 `.claude/commands/explain.md`）。
3. Claude 读 `PLAYBOOK.md`，给涉及页面加 include、按你的需求文档生成 `explain-config.js`。
4. 浏览器打开 demo，点右下角「📖 需求讲解」。

### Codex / Cursor / 其它 AI 工具
1. 同样把 `engine/`、`PLAYBOOK.md`、`explain-config.template.js` 拷进 demo 项目。
2. 给涉及页面手动加 3 行 include（见 `PLAYBOOK.md`「安装步骤」）。
3. 对 AI 说：「读 `PLAYBOOK.md`，按里面的流程给这个 demo 加需求讲解，并生成 `explain-config.js`」。
4. （可选）把这句加进项目的 `AGENTS.md`，下次直接说「加需求讲解」即可。

## 仓库结构

```
engine/                     # 通用引擎（drop-in，勿改）
  explain-engine.js         # 配置驱动；Explain.config/registerAction/registerCleanup/registerExit
  explain.css               # 样式
explain-config.template.js  # 起始模板，复制为 explain-config.js 后由 AI 填写
PLAYBOOK.md                 # AI 指令手册（核心，AI 按此操作）
.claude/commands/explain.md # Claude Code 的 /explain 斜杠命令
examples/REQK-01/           # 真实 demo 的参考配置（6 步、跨 3 页、含自定义动作与异常态模拟）
README.md                   # 本文件
```

## 工作原理

引擎（`engine/`）只认「配置 + 注册的动作」，完全不知道你的 demo 细节。所有需求步骤、demo 专属操作都写在 `explain-config.js` 里——这正是 AI 能按 `PLAYBOOK.md` 自动生成的那部分。引擎与配置分离，所以同一份引擎能用在任何 demo 上。

详见 `PLAYBOOK.md`。
