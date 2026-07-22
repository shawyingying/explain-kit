# explain-kit · 原型 demo 需求讲解工具包

给静态 HTML 原型 demo 加一层「需求讲解」能力：右下角按钮 → 底部需求卡片 → 进入讲解后右侧步骤点逐条跳转，每步在页面对应位置聚光灯高亮 + 讲解文字，跨页自动续上。日常隐藏，不改原 demo。

面向**用 AI 辅助工具（Claude Code、Codex、Cursor 等）做原型 demo 的人**：demo 做完后，让 AI 读 `PLAYBOOK.md` 即可一键生成讲解配置。

## 它适合谁

- 经常做纯静态 HTML 原型 demo、需要给客户/评审讲解每个需求在界面上的落点。
- 用 Claude Code / Codex 等 AI 工具辅助开发，希望「做完 demo → 一句话生成讲解」。

## 全局安装（推荐：一次安装，所有 demo 通用）

不想每个 demo 都拷文件？装一次到全局，以后在任何 demo 文件夹敲 `/explain` 即可。

```sh
git clone https://github.com/shawyingying/explain-kit.git
cd explain-kit
./install-global.sh
```

脚本会把 `engine/`+`PLAYBOOK.md`+模板装到 `~/.explain-kit/`，把 `/explain` 命令装到 `~/.claude/commands/`（用户级，所有项目可用）。之后：

- **Claude Code**：在任意 demo 文件夹敲 `/explain`，命令自动从 `~/.explain-kit/` 拷引擎进 demo、加 include、按需求文档生成 `explain-config.js`。
- **Codex / Cursor / 其它 AI 工具**：对其说「读 `~/.explain-kit/PLAYBOOK.md`，给当前 demo 加需求讲解」。

> 引擎文件仍会落到每个 demo 里（浏览器需从本地加载），但 `/explain` 全自动完成，无需手动拷。
> 更新：重新跑 `./install-global.sh`（幂等）。

## 或：单次拷入某个 demo（不装全局）

如果只想给单个 demo 装、不留全局：把 `engine/`、`PLAYBOOK.md`、`explain-config.template.js`、`.claude/` 拷进该 demo 项目根，然后在 demo 里敲 `/explain`（命令会用 demo 内的本地 `engine/`+`PLAYBOOK.md`）。Codex / 其它工具同理，让 AI 读 demo 内的 `PLAYBOOK.md`。

## 仓库结构

```
engine/                     # 通用引擎（drop-in，勿改）
  explain-engine.js         # 配置驱动；Explain.config/registerAction/registerCleanup/registerExit
  explain.css               # 样式
explain-config.template.js  # 起始模板，复制为 explain-config.js 后由 AI 填写
PLAYBOOK.md                 # AI 指令手册（核心，AI 按此操作）
install-global.sh           # 全局安装脚本（装到 ~/.explain-kit/ + ~/.claude/commands/）
launchers/
  explain.global.md         # 全局 /explain 命令（install-global.sh 装到 ~/.claude/commands/）
.claude/commands/explain.md # 项目级 /explain 命令（拷入 demo 时用本地 engine/PLAYBOOK）
examples/REQK-01/           # 真实 demo 的参考配置（6 步、跨 3 页、含自定义动作与异常态模拟）
README.md                   # 本文件
```

## 工作原理

引擎（`engine/`）只认「配置 + 注册的动作」，完全不知道你的 demo 细节。所有需求步骤、demo 专属操作都写在 `explain-config.js` 里——这正是 AI 能按 `PLAYBOOK.md` 自动生成的那部分。引擎与配置分离，所以同一份引擎能用在任何 demo 上。

详见 `PLAYBOOK.md`。
