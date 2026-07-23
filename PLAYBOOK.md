# 需求讲解 Playbook（给 AI 辅助工具读）

本文件是「需求讲解遮罩层」工具包的 **AI 指令手册**。任何能读写文件的 AI 编码工具（Claude Code、Codex、Cursor 等）按本文件操作，即可为一个静态 HTML 原型 demo 添加「需求讲解」能力。

## 它做什么

给原型 demo 加一层「讲解模式」：右下角按钮 → 底部一排需求卡片 → 点卡片进入讲解，右侧竖向步骤点逐条跳转，每步在页面对应位置聚光灯高亮 + 浮出讲解文字。跨页面自动续上。日常隐藏，不影响原 demo。

## 适用前提

- 纯静态 HTML/CSS/JS 原型（直接用浏览器打开 `.html`，无构建、无后端）。
- demo 可能由多个 `.html` 页面组成，需求讲解往往跨页。

## 安装步骤

> 「demo 项目根」= 含 `.html` 的目录；它可能就是你的当前目录，也可能是子文件夹（如 `demo/`）。需求文档可能在兄弟文件夹（如 `需求文档/`）。下面所有 `engine/`、`explain-config.js` 都放进 demo 根。

1. 把 `engine/` 文件夹拷进 demo 项目根目录（与各 `.html` 同级）。
2. 在**每个讲解会涉及的 `.html` 页面**：
   - `<head>` 里加：`<link rel="stylesheet" href="engine/explain.css">`
   - `</body>` 前、各页面原有 `<script>` **之后**加（顺序重要：引擎先于配置）：
     ```html
     <script src="engine/explain-engine.js"></script>
     <script src="explain-config.js"></script>
     ```
3. 在 demo 项目根创建 `explain-config.js`（可从 `explain-config.template.js` 改起）。
4. 浏览器打开 demo 验证：右下角出现「📖 需求讲解」按钮即装好。

> 不改动 demo 原有 HTML 结构与 JS/CSS 逻辑——只加 include 行 + 新增 `engine/` 与 `explain-config.js`。

## 配置 schema（explain-config.js）

```js
Explain.config({
  reqs: [
    {
      code: 'REQ-XX',           // 需求编号，卡片左上角
      title: '需求标题',         // 卡片标题
      tag: '已就绪',            // 卡片角标；未就绪用 '讲解待补充' + ready:false
      ready: true,              // false 时卡片置灰，点击提示待补充
      steps: [                  // 讲解步骤，对应右侧每个点
        {
          title: '步骤标题',
          page: 'xxx.html',     // 该步骤所在页面（相对 demo 根）
          setup: [              // 进入该步骤前依次执行的「揭示动作」
            { t: 'click', sel: '#someBtn' },
            { t: 'wait', ms: 200 }
          ],
          target: '.some-el',   // 聚光灯高亮的元素（CSS 选择器）
          closest: '.row',      // 可选：target 命中后再向上取最近祖先作为高亮框
          text: '讲解文字，支持 <b>HTML</b>'  // 讲解卡正文
        }
      ]
    }
  ]
});
```

### 内置动作（setup 里可直接用）
- `{ t: 'click', sel: '#sel' }` — 点击选择器命中的第一个元素（复用 demo 既有事件监听）。
- `{ t: 'wait', ms: 200 }` — 等待 ms 毫秒（给弹窗/抽屉过渡或 DOM 显隐留时间）。

### 自定义动作（demo 专属操作，如模拟上传、切换开关、伪造异常态）
```js
Explain.registerAction('myAction', function (act) {
  // act 是 setup 数组里那条对象，可带自定义参数
  // 同步或返回 Promise 均可
});
```
然后在 setup 里用 `{ t: 'myAction', ... }`。

### 还原钩子
- `Explain.registerCleanup(fn)` — **每步 setup 前 + 退出讲解时**调用。用于还原你在自定义动作里改过的演示态（如伪造的异常态）。fn 应幂等、容错（元素不存在时跳过）。
- `Explain.registerExit(fn)` — **仅退出讲解时**调用。用于关闭讲解中打开的弹窗/抽屉。

## 作者流程（核心）

对每个要讲解的需求：

1. **先拿到需求文档**：若用户已提供（路径或内容）直接读；若没有，先向用户索要（让用户提供文档路径、粘贴内容，或按 demo 现有界面与文案推断），**缺文档时不要臆造需求**。拿到后提炼这条需求在 demo 里的几个落点（哪个页面、哪个组件、哪个交互）。
2. **定位 demo 元素**：在对应 `.html` 里找到这些落点的选择器（按钮、表单、抽屉、表格行等）。注意：要高亮的元素可能默认隐藏（在弹窗/抽屉/折叠区里）。
3. **设计揭示动作**：让目标元素可见。优先复用 demo 既有按钮——`{t:'click',sel:'#打开按钮'}`。若需要更复杂操作（上传文件后才能下一步、切开关、伪造异常态），写自定义动作并 `registerAction`。
4. **每步自包含**：每步的 setup 要能从干净状态独立呈现该步——不要依赖「上一步留下的状态」。因为用户可从右侧任意点直接跳到任意步。常见模式：每步 setup 都从「打开入口」开始。
5. **高亮 target**：选最能代表该步语义的元素。若目标太小，用 `closest` 扩到整行/整块。
6. **写讲解文字**：简短，突出该步要传达的要点，可用 `<b>` 强调。
7. **清理伪造态**：凡是你注入/改过的 DOM（提示条、disabled、opacity 等），在 `registerCleanup` 里还原。
8. **测试**：浏览器打开，从第一个需求卡片进入，逐点走一遍；再从中间点直接跳、再退出，确认无残留、无报错。

## 跨页行为

- 步骤点跨页时，引擎自动 `location.href` 跳转，并用 sessionStorage 记住「当前需求 + 步骤」，新页加载后自动续上。你只需在每步写对 `page`。
- 因此**每个涉及的页面都要装 include**，否则跳过去后没有讲解层。

## 约定

- **不改 demo 原文件逻辑**：只加 include 行；揭示动作用 click 触发既有按钮，不重写 demo 的函数。
- **幂等**：setup 动作与 cleanup 反复执行不应出错或产生残留。
- **时序**：弹窗/抽屉有 CSS 过渡的，click 后给 `{t:'wait',ms:200~300}` 再定位，否则高亮框会贴在过渡中的位置。
- **z-index**：讲解层 900+，高于常见抽屉(31)/弹窗(20)；若 demo 有更高 z-index 的浮层，可能需要在 `engine/explain.css` 调高。

## 参考示例

见 `examples/REQ-DEMO-01/`——一个虚构 demo 的 6 步讲解配置，覆盖：创建弹窗、编辑弹窗、添加内容抽屉（含模拟上传、切开关、伪造异常态）、片段页元数据抽屉，跨 3 个页面。照着它的写法改即可。

## 调试技巧

- 临时在 setup 末尾加 `{t:'wait',ms:5000}` 可暂停看中间态。
- 浏览器控制台执行 `sessionStorage.removeItem('k_explain_state')` 可清除「卡在讲解中」的状态。
- 目标没高亮：检查 target 选择器在该步 setup 执行后是否真的存在于 DOM 且可见。
- 讲解卡位置不对：确认 target 在视口内（引擎会 `scrollIntoView`），且页面没有把目标固定在无法滚动到的区域。
