# explain-kit

**帮助产品经理，依据需求文档，给demo原型一键加需求指引，便于快速查看功能点～**

> 给静态 HTML 原型 demo 加一层「需求讲解」遮罩——右下角按钮 → 底部需求卡片 → 右侧步骤点逐条跳转，每步在页面对应位置聚光灯高亮 + 讲解文字，跨页自动续上。日常隐藏，**全程在副本里做、原 demo 一个字不改**。

面向**用 AI 辅助工具做原型 demo 的人**：demo 做完后，让 AI 按 `PLAYBOOK.md` 自动生成讲解配置，不用手写步骤。

## 特性

- **聚光灯讲解**：每步高亮页面对应元素 + 浮出讲解卡，跨页自动续上、自动滚动定位。
- **讲解卡可拖动**：挡住内容时拖标题栏移开，切下一步自动重定位。
- **不碰原 demo**：调用时先把 demo 复制到同级 `<原名>-讲解/` 副本，所有改动落在副本里，原 demo 一字不动；不满意删副本重来。
- **AI 自动生成配置**：把需求文档喂给 AI，按 `PLAYBOOK.md` 产出 `explain-config.js`。
- **补「demo 看不见」的需求**：内置 `annotate`（元素旁钉标签，标状态 / 角色 / 数据流）与 `simulate`（弹通知模拟后端响应 / 状态变更 / 权限拦截）。
- **多工具通用**：同一份 `engine/` + `PLAYBOOK.md`，Claude Code、Codex、Cursor 都能用。

## 快速开始

```sh
git clone https://github.com/shawyingying/explain-kit.git
cd explain-kit
./install.sh
```

装好后，在任意原型 demo 文件夹里：

- **Claude Code**：敲 `/explain`
- **Codex**：说「给这个 demo 加需求讲解」

AI 会自动：读 `PLAYBOOK.md` → 把 demo 复制到同级 `<原名>-讲解/` 副本 → 在副本里拷 `engine/` + 加 3 行 include + 按你的需求文档生成 `explain-config.js`。过程中会先问你：**哪个文件是需求文档**、**逐个还是批量生成**。

> 浏览器打开**副本**里的 `.html`，右下角出现「📖 需求讲解」按钮即装好。

## 支持的工具

| 工具 | 调用方式 |
|------|----------|
| Claude Code | 装为个人级 Skill，敲 `/explain` |
| Codex | 装为个人级 Skill，自然语言「给 demo 加需求讲解」 |
| Cursor | 把 `launchers/cursor-rule.mdc` 拷进 demo 的 `.cursor/rules/` |
| 其它 AI 工具 | 对 AI 说「读 `PLAYBOOK.md`，给当前 demo 加需求讲解」 |

- **Codex 兜底**（没全局装 Skill 时）：把 `launchers/codex-AGENTS.md` 内容放进 Codex 工作目录的 `AGENTS.md`，再说「给当前 demo 加需求讲解」。
- **任意工具**：直接让 AI 读 `<explain-kit 路径>/PLAYBOOK.md`。

> Codex / Cursor 等没有 `AskUserQuestion` 的工具，提问会在对话里直接问并**停下等你回答**。引擎文件仍会落到每个 demo 里（浏览器需从本地加载）；`PLAYBOOK.md` 与 `engine/` 是单一真相源，所有工具共用。

## 工作原理

引擎（`engine/`）只认「配置 + 注册的动作」，完全不知道 demo 细节。所有需求步骤、demo 专属操作都写在 `explain-config.js` 里——这正是 AI 能按 `PLAYBOOK.md` 自动生成的那部分。**引擎与配置分离**，所以同一份引擎能用在任何 demo 上。

```
demo（原，不动）          ┐
                          ├─ AI 调用 explain → 复制到副本
需求文档 ─────────────────┘
                          ↓
              <原名>-讲解/（副本）
              ├─ （复制的原 demo 内容）
              ├─ engine/                 ← 通用引擎（drop-in，勿改）
              ├─ explain-config.js       ← AI 按需求文档生成
              └─ 各 .html 加 3 行 include
```

## 配置示例

`explain-config.js` 定义需求卡片 + 每个需求的步骤：

```js
Explain.config({
  reqs: [{
    code: 'REQ-01', title: '需求标题', tag: '已就绪', ready: true,
    steps: [{
      title: '步骤标题',
      page: 'index.html',
      setup: [
        { t: 'click', sel: '#someBtn' },                                        // 点击元素（复用 demo 既有事件）
        { t: 'wait', ms: 200 },                                                  // 等过渡 / DOM 显隐
        { t: 'annotate', sel: '#field', label: '状态：待审核', variant: 'warn' }, // 钉标签
        { t: 'simulate', msg: '✓ 已提交', type: 'success', ms: 2600 }             // 模拟后端
      ],
      target: '.some-element',   // 聚光灯高亮的元素
      closest: '.row',           // 可选：向上取最近祖先作高亮框
      text: '讲解文字，支持 <b>HTML</b>'
    }]
  }]
});

// demo 专属操作（如模拟上传、切开关、伪造异常态）
Explain.registerAction('myAction', function (act) { /* ... */ });
Explain.registerCleanup(function () { /* 还原演示态，需幂等 */ });
Explain.registerExit(function () { /* 退出时关闭打开的弹窗 / 抽屉 */ });
```

### 内置动作

| 动作 | 作用 |
|------|------|
| `click` | 点击选择器命中的元素，复用 demo 既有事件 |
| `wait` | 等待 ms 毫秒，给过渡 / DOM 显隐留时间 |
| `annotate` | 元素旁钉标注气泡，就地显示 demo 看不到的状态 / 角色 / 数据流；每步自动清除 |
| `simulate` | 弹临时通知，模拟后端响应 / 状态变更 / 权限拦截；每步自动清除 |

完整 schema、作者流程、调试技巧见 [`PLAYBOOK.md`](PLAYBOOK.md)。

## 限制

- 仅面向**纯静态 HTML/CSS/JS 原型**（浏览器直接打开 `.html`，无构建、无后端）。
- demo 若用了 **Shadow DOM / iframe / 前端框架组件**，CSS 选择器可能命中不了。
- 单页 demo 支持（所有步骤同一页面，不触发跨页）。

## 示例

[`examples/REQ-DEMO-01/`](examples/REQ-DEMO-01/) —— 一个虚构「内容发布平台」demo 的 6 步讲解配置，覆盖：创建 / 编辑弹窗、添加内容抽屉（含模拟上传、切开关、伪造异常态）、片段页元数据抽屉，跨 3 个页面。照着改即可。

## 仓库结构

```
SKILL.md                    # Claude Code + Codex Skill（薄壳，委托 PLAYBOOK.md）
PLAYBOOK.md                 # AI 指令手册（核心，所有工具共用）
engine/
  explain-engine.js         # 通用引擎：Explain.config/registerAction/registerCleanup/registerExit
  explain.css               # 通用样式
explain-config.template.js  # 起始模板，复制为 explain-config.js 后由 AI 填写
examples/REQ-DEMO-01/       # 合成参考示例（虚构 demo，6 步、跨 3 页）
launchers/
  codex-AGENTS.md           # Codex 兜底 stub（未装 Skill 时用）
  cursor-rule.mdc           # Cursor 规则 stub
install.sh                  # 装为 Claude Code + Codex 个人级 Skill
```

## 更新与项目级安装

- **更新**：重新跑 `./install.sh`（幂等）。
- **项目级**（只想给某个 demo 装）：把 `SKILL.md` + `engine/` + `PLAYBOOK.md` + `explain-config.template.js` + `examples/` 拷进该 demo 的 `.claude/skills/explain/`。

## License

[MIT](LICENSE) © 2026 shawyingying
