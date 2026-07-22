/* ===== 需求讲解配置 · 由 AI 按 PLAYBOOK.md 生成 =====
   引擎：engine/explain-engine.js（通用，勿改）
   本文件：定义需求卡片 + 每个需求的讲解步骤 + 本 demo 专属的揭示动作。
   加载顺序：engine/explain-engine.js → 本文件。 */

Explain.config({
  reqs: [
    // —— 示例：把下面这条改成你的第一个需求 ——
    {
      code: 'REQ-01', title: '需求标题', tag: '已就绪', ready: true,
      steps: [
        {
          title: '步骤1标题',
          page: 'index.html',                 // 该步所在页面（相对项目根）
          setup: [                            // 进入该步前依次执行的揭示动作
            { t: 'click', sel: '#someBtn' },  // 内置：点击元素（复用 demo 既有事件）
            { t: 'wait', ms: 200 }            // 内置：等待过渡 / DOM 显隐
          ],
          target: '.some-element',            // 聚光灯高亮的元素（CSS 选择器）
          closest: '',                        // 可选：命中后向上取最近祖先作为高亮框
          text: '这一步要传达的要点，可用 <b>强调</b>。'
        }
        // 继续加步骤…
      ]
    }
    // 继续加需求；未就绪的用 { code, title, tag:'讲解待补充', ready:false }
  ]
});

// —— 本 demo 专属揭示动作（按需注册）——
// Explain.registerAction('myAction', function (act) { /* … */ });

// 还原你改过的演示态（每步 setup 前 + 退出讲解时调用，需幂等容错）
// Explain.registerCleanup(function () { /* … */ });

// 退出讲解时关闭讲解中打开的弹窗/抽屉
// Explain.registerExit(function () { /* … */ });
