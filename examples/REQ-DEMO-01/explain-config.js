/* ===== 需求讲解配置 · 合成示例（虚构 demo，仅作写法参考）=====
   引擎：engine/explain-engine.js（通用，勿改）
   本文件：定义需求卡片 + 每个需求的讲解步骤，并注册本 demo 专属的「揭示动作」。
   依赖加载顺序：engine/explain-engine.js → 本文件。

   ⚠ 这是为虚构的「内容发布平台」demo 写的示例配置，选择器都是假的，
      仅为演示写法，不要照抄到你的 demo。 */

Explain.config({
  reqs: [
    {
      code: 'REQ-DEMO-01', title: '分类级与内容级标签策略配置', tag: '已就绪', ready: true,
      steps: [
        {
          title: '分类级标签策略（创建）', page: 'index.html',
          setup: [{ t: 'click', sel: '#create' }, { t: 'wait', ms: 120 }, { t: 'click', sel: '#advancedToggle' }, { t: 'wait', ms: 160 }],
          target: '.tag-options',
          text: '在<b>创建分类</b>弹窗中新增「标签策略」（高级配置内），可在<b>智能打标</b>与<b>指定规则打标</b>间二选一，作为该分类下<b>新内容的默认策略</b>。新建分类默认「智能打标」。'
        },
        {
          title: '分类级标签策略（查看/修改）', page: 'index.html',
          setup: [{ t: 'click', sel: '.more' }, { t: 'wait', ms: 120 }, { t: 'click', sel: '[data-action="edit"]' }, { t: 'wait', ms: 160 }, { t: 'click', sel: '#advancedToggle' }, { t: 'wait', ms: 160 }],
          target: '.edit-tip',
          text: '编辑分类时同样在「高级配置」查看/修改标签规则。修改分类级配置<b>仅对新内容生效</b>，<b>存量内容标签保持不变</b>；需用新策略的存量内容请重新提交。'
        },
        {
          title: '内容级·跟随分类开关', page: 'detail.html',
          setup: [{ t: 'click', sel: '#addContentBtn' }, { t: 'wait', ms: 240 }, { t: 'uploadFile' }, { t: 'wait', ms: 140 }, { t: 'click', sel: '#ctNextBtn' }, { t: 'wait', ms: 220 }],
          target: '#ctFollowToggle', closest: '.ct-toggle-row',
          text: '上传内容时标签策略默认<b>「跟随分类：打开」</b>，沿用所属分类的标签配置，并在提交时刻<b>固化为快照</b>；后续分类配置变更不再影响该内容，减少逐内容重复配置。'
        },
        {
          title: '内容级·关闭跟随后的自定义标签', page: 'detail.html',
          setup: [{ t: 'click', sel: '#addContentBtn' }, { t: 'wait', ms: 240 }, { t: 'uploadFile' }, { t: 'wait', ms: 140 }, { t: 'click', sel: '#ctNextBtn' }, { t: 'wait', ms: 200 }, { t: 'uncheckFollow' }, { t: 'wait', ms: 180 }],
          target: '.ct-rule-options',
          text: '关闭「跟随分类」后，下方启用<b>智能打标 / 指定规则打标</b>二选一（与分类级选项一致），<b>内容级覆盖分类级</b>。内容级配置仅上传时可设，<b>上传后不可修改</b>，需用新策略时重新上传。'
        },
        {
          title: '异常态·分类无配置', page: 'detail.html',
          setup: [{ t: 'click', sel: '#addContentBtn' }, { t: 'wait', ms: 240 }, { t: 'uploadFile' }, { t: 'wait', ms: 140 }, { t: 'click', sel: '#ctNextBtn' }, { t: 'wait', ms: 200 }, { t: 'fakeException' }, { t: 'wait', ms: 160 }],
          target: '.ex-exception-hint',
          text: '当分类<b>未配置标签策略</b>时，「跟随分类」开关<b>灰显不可开启</b>，内容自动按<b>智能打标</b>处理；该内容片段页元数据「标签规则」显示 <b>-</b>。<i>此为讲解演示态模拟，非真实数据。</i>'
        },
        {
          title: '片段页·元数据展示标签规则', page: 'slice.html',
          setup: [{ t: 'click', sel: '#metaDataBtn' }, { t: 'wait', ms: 280 }],
          target: '#metaTagRule', closest: 'tr',
          text: '内容片段页通过<b>元数据 Drawer</b> 展示该内容生效的标签规则：「跟随分类（打开/关闭）」+「标签规则（智能打标/指定规则打标/-）」。<b>-</b> 表示分类无配置或无快照的异常态。片段页不提供标签策略修改入口。'
        }
      ]
    },
    { code: 'REQ-DEMO-02', title: '内容定时发布', tag: '讲解待补充', ready: false },
    { code: 'REQ-DEMO-03', title: '多端预览', tag: '讲解待补充', ready: false },
    { code: 'REQ-DEMO-04', title: '评论审核', tag: '讲解待补充', ready: false },
    { code: 'REQ-DEMO-05', title: '栏目权限管理', tag: '讲解待补充', ready: false },
    { code: 'REQ-DEMO-06', title: '数据导出', tag: '讲解待补充', ready: false }
  ]
});

// ---------- 本 demo 专属揭示动作 ----------

// 模拟在「添加内容」抽屉上传一个文件，使「下一步」可用
Explain.registerAction('uploadFile', function () {
  var input = document.querySelector('#ctFileInput');
  if (!input) return;
  try {
    var dt = new DataTransfer();
    dt.items.add(new File(['demo'], '示例文档.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }));
    input.files = dt.files;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  } catch (e) {}
});

// 关闭「跟随分类」开关，显出自定义标签配置
Explain.registerAction('uncheckFollow', function () {
  var cb = document.querySelector('#ctFollowToggle input');
  if (!cb) return;
  cb.checked = false;
  cb.dispatchEvent(new Event('change', { bubbles: true }));
});

// 异常态演示：运行时模拟「分类无配置」→ 跟随开关灰显 + 提示条（不改原文件）
Explain.registerAction('fakeException', function () {
  var cb = document.querySelector('#ctFollowToggle input');
  if (cb) { cb.checked = false; cb.dispatchEvent(new Event('change', { bubbles: true })); cb.disabled = true; }
  var tg = document.querySelector('#ctFollowToggle');
  if (tg) { tg.style.opacity = '.5'; }
  var toggleRow = tg ? tg.closest('.ct-toggle-row') : null;
  var parent = toggleRow ? toggleRow.parentNode : null;
  if (parent) {
    parent.querySelectorAll('.ex-exception-hint').forEach(function (n) { n.remove(); });
    var hint = document.createElement('div');
    hint.className = 'ex-exception-hint';
    hint.innerHTML = '⚠ 当前分类未配置标签策略，「跟随分类」不可用，本次将按「智能打标」处理';
    parent.insertBefore(hint, toggleRow);
  }
});

// 还原异常态模拟（每步 setup 前 + 退出时调用）
Explain.registerCleanup(function () {
  var cb = document.querySelector('#ctFollowToggle input');
  if (cb) { cb.disabled = false; if (!cb.checked) { cb.checked = true; cb.dispatchEvent(new Event('change', { bubbles: true })); } }
  var tg = document.querySelector('#ctFollowToggle');
  if (tg) { tg.style.opacity = ''; }
  document.querySelectorAll('.ex-exception-hint').forEach(function (n) { n.remove(); });
});

// 退出讲解时关闭讲解中打开的弹窗/抽屉（仅退出调用）
Explain.registerExit(function () {
  ['#close', '#ctClose', '#metaClose'].forEach(function (s) {
    var n = document.querySelector(s); if (n) n.click();
  });
});
