/* ===== 需求讲解配置 · 本项目专属（AI 可编辑）=====
   引擎：engine/explain-engine.js（通用，勿改）
   本文件：定义需求卡片 + 每个需求的讲解步骤，并注册本项目专属的「揭示动作」。
   依赖加载顺序：engine/explain-engine.js → 本文件。 */

Explain.config({
  reqs: [
    {
      code: 'REQK-01', title: '知识库级与文档级分段策略配置', tag: '已就绪', ready: true,
      steps: [
        {
          title: '知识库级分段配置（创建）', page: 'index.html',
          setup: [{ t: 'click', sel: '#create' }, { t: 'wait', ms: 120 }, { t: 'click', sel: '#advancedToggle' }, { t: 'wait', ms: 160 }],
          target: '.rule-options',
          text: '在<b>创建知识库</b>弹窗中新增「分段配置」（高级配置内），可在<b>智能分段</b>与<b>指定分隔符分段</b>间二选一，作为该库<b>新上传文档的默认策略</b>。新建库默认「智能分段」。'
        },
        {
          title: '知识库级分段配置（查看/修改）', page: 'index.html',
          setup: [{ t: 'click', sel: '.more' }, { t: 'wait', ms: 120 }, { t: 'click', sel: '[data-action="edit"]' }, { t: 'wait', ms: 160 }, { t: 'click', sel: '#advancedToggle' }, { t: 'wait', ms: 160 }],
          target: '.edit-tip',
          text: '编辑知识库时同样在「高级配置」查看/修改分段规则。修改库级配置<b>仅对新上传文档生效</b>，<b>存量文档切片保持不变</b>（不重新解析）；需使用新配置的存量文档请重新上传。'
        },
        {
          title: '文档级·跟随知识库开关', page: 'knowledge-detail.html',
          setup: [{ t: 'click', sel: '#addKnowledgeBtn' }, { t: 'wait', ms: 240 }, { t: 'uploadFile' }, { t: 'wait', ms: 140 }, { t: 'click', sel: '#akNextBtn' }, { t: 'wait', ms: 220 }],
          target: '#akFollowToggle', closest: '.ak-toggle-row',
          text: '上传文件时分段规则默认<b>「跟随知识库：打开」</b>，沿用所属知识库的分段配置，并在解析时刻<b>固化为快照</b>；后续库级配置变更不再影响本文档，减少逐文档重复配置。'
        },
        {
          title: '文档级·关闭跟随后的自定义分段', page: 'knowledge-detail.html',
          setup: [{ t: 'click', sel: '#addKnowledgeBtn' }, { t: 'wait', ms: 240 }, { t: 'uploadFile' }, { t: 'wait', ms: 140 }, { t: 'click', sel: '#akNextBtn' }, { t: 'wait', ms: 200 }, { t: 'uncheckFollow' }, { t: 'wait', ms: 180 }],
          target: '.ak-rule-options',
          text: '关闭「跟随知识库」后，下方启用<b>智能分段 / 指定分隔符分段</b>二选一（与库级选项一致），<b>文档级覆盖库级</b>。文档级配置仅上传时可设，<b>上传后不可修改</b>，需使用新配置时重新上传。'
        },
        {
          title: '异常态·知识库无配置', page: 'knowledge-detail.html',
          setup: [{ t: 'click', sel: '#addKnowledgeBtn' }, { t: 'wait', ms: 240 }, { t: 'uploadFile' }, { t: 'wait', ms: 140 }, { t: 'click', sel: '#akNextBtn' }, { t: 'wait', ms: 200 }, { t: 'fakeException' }, { t: 'wait', ms: 160 }],
          target: '.ex-exception-hint',
          text: '当知识库<b>未配置分段策略</b>（如存量库升级后未设置）时，「跟随知识库」开关<b>灰显不可开启</b>，文档级自动按<b>智能分段</b>解析；该文档切片页元数据「分段规则」显示 <b>-</b>。<i>此为讲解演示态模拟，非真实数据。</i>'
        },
        {
          title: '切片页·元数据展示分段规则', page: 'slice-detail.html',
          setup: [{ t: 'click', sel: '#metaDataBtn' }, { t: 'wait', ms: 280 }],
          target: '#metaSegRule', closest: 'tr',
          text: '文档切片页通过<b>元数据 Drawer</b> 展示该文档生效的分段规则：「跟随知识库（打开/关闭）」+「分段规则（智能分段/指定分隔符/-）」。<b>-</b> 表示知识库无配置或无解析时快照的异常态。切片页不提供分段配置修改入口。'
        }
      ]
    },
    { code: 'REQK-02', title: '知识冲突智能检测', tag: '讲解待补充', ready: false },
    { code: 'REQK-03', title: '知识学习异常敏感命中提示', tag: '讲解待补充', ready: false },
    { code: 'REQK-04', title: '知识切片附属问题生成', tag: '讲解待补充', ready: false },
    { code: 'REQK-05', title: '非标准名称识别与词库映射', tag: '讲解待补充', ready: false },
    { code: 'REQK-06', title: '隐私策略配置与管理', tag: '讲解待补充', ready: false }
  ]
});

// ---------- 本项目专属揭示动作 ----------

// 模拟在「添加知识」抽屉上传一个文件，使「下一步」可用
Explain.registerAction('uploadFile', function () {
  var input = document.querySelector('#akFileInput');
  if (!input) return;
  try {
    var dt = new DataTransfer();
    dt.items.add(new File(['demo'], '演示文档.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }));
    input.files = dt.files;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  } catch (e) {}
});

// 关闭「跟随知识库」开关，显出自定义分段配置
Explain.registerAction('uncheckFollow', function () {
  var cb = document.querySelector('#akFollowToggle input');
  if (!cb) return;
  cb.checked = false;
  cb.dispatchEvent(new Event('change', { bubbles: true }));
});

// 异常态演示：运行时模拟「知识库无配置」→ 跟随开关灰显 + 提示条（不改原文件）
Explain.registerAction('fakeException', function () {
  var cb = document.querySelector('#akFollowToggle input');
  if (cb) { cb.checked = false; cb.dispatchEvent(new Event('change', { bubbles: true })); cb.disabled = true; }
  var tg = document.querySelector('#akFollowToggle');
  if (tg) { tg.style.opacity = '.5'; }
  var toggleRow = tg ? tg.closest('.ak-toggle-row') : null;
  var parent = toggleRow ? toggleRow.parentNode : null;
  if (parent) {
    parent.querySelectorAll('.ex-exception-hint').forEach(function (n) { n.remove(); });
    var hint = document.createElement('div');
    hint.className = 'ex-exception-hint';
    hint.innerHTML = '⚠ 当前知识库未配置分段策略，「跟随知识库」不可用，本次将按「智能分段」解析';
    parent.insertBefore(hint, toggleRow);
  }
});

// 还原异常态模拟（每步 setup 前 + 退出时调用）
Explain.registerCleanup(function () {
  var cb = document.querySelector('#akFollowToggle input');
  if (cb) { cb.disabled = false; if (!cb.checked) { cb.checked = true; cb.dispatchEvent(new Event('change', { bubbles: true })); } }
  var tg = document.querySelector('#akFollowToggle');
  if (tg) { tg.style.opacity = ''; }
  document.querySelectorAll('.ex-exception-hint').forEach(function (n) { n.remove(); });
});

// 退出讲解时关闭讲解中打开的弹窗/抽屉（仅退出调用）
Explain.registerExit(function () {
  ['#close', '#akClose', '#metaClose'].forEach(function (s) {
    var n = document.querySelector(s); if (n) n.click();
  });
});
