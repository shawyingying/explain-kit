/* ===== 需求讲解遮罩层 · 通用引擎 explain-engine.js =====
   配置驱动、可注册自定义动作；跨页面 sessionStorage 保活；不改动宿主 demo 逻辑。
   依赖：宿主页面的 --blue 等 CSS token（可选）。

   用法（在 explain-config.js 中）：
     Explain.config({ reqs: [ {code,title,tag,ready, steps:[{title,page,setup,target,closest,text}]} ] });
     Explain.registerAction(name, fn);     // 自定义揭示动作，fn 可同步或返回 Promise
     Explain.registerCleanup(fn);          // 每步 setup 前 + 退出时调用，还原你改过的演示态
     Explain.registerExit(fn);             // 仅退出时调用，如关闭讲解中打开的弹窗/抽屉

   内置动作：{t:'click', sel}、{t:'wait', ms}。
   页面需按顺序引入：engine/explain.css → engine/explain-engine.js → explain-config.js。 */
(function () {
  'use strict';

  var STORAGE_KEY = 'k_explain_state';
  var config = { reqs: [] };
  var customActions = {};
  var cleanupFn = null;
  var exitFn = null;

  var currentPage = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  var curReq = null, curStep = 0;
  var calloutPinned = false, pinX = 0, pinY = 0;
  var annotates = [];
  var simulateStack = null;
  var el = {};

  var Explain = {
    config: function (cfg) { config = cfg || { reqs: [] }; },
    registerAction: function (name, fn) { customActions[name] = fn; },
    registerCleanup: function (fn) { cleanupFn = fn; },
    registerExit: function (fn) { exitFn = fn; }
  };
  window.Explain = Explain;

  // ---------- DOM 构建 ----------
  function h(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  function buildDom() {
    el.launcher = h('button', 'ex-launcher', '<span class="ex-launcher-icon">📖</span><span>需求讲解</span>');
    el.launcher.addEventListener('click', toggleBar);

    el.bar = h('div', 'ex-bar');
    var inner = h('div', 'ex-bar-inner');
    (config.reqs || []).forEach(function (r, i) {
      var card = h('div', 'ex-card' + (r.ready ? '' : ' disabled'),
        '<div class="ex-card-code">' + r.code + '</div>' +
        '<div class="ex-card-title">' + r.title + '</div>' +
        '<div class="ex-card-tag">' + r.tag + '</div>');
      card.addEventListener('click', function () { enterReq(i); });
      inner.appendChild(card);
    });
    el.bar.appendChild(inner);

    el.overlay = h('div', 'ex-overlay');
    el.shield = h('div', 'ex-shield');
    el.spotlight = h('div', 'ex-spotlight');
    el.callout = h('div', 'ex-callout');
    el.calloutHead = h('div', 'ex-callout-head');
    el.calloutBody = h('div', 'ex-callout-body');
    el.calloutFoot = h('div', 'ex-callout-foot');
    el.calloutFoot.innerHTML =
      '<span class="ex-callout-step"></span>' +
      '<div class="ex-callout-btns">' +
      '<button class="ex-btn ex-prev">上一步</button>' +
      '<button class="ex-btn primary ex-next">下一步</button>' +
      '</div>';
    el.callout.appendChild(el.calloutHead);
    el.callout.appendChild(el.calloutBody);
    el.callout.appendChild(el.calloutFoot);

    el.dots = h('div', 'ex-dots');
    el.close = h('button', 'ex-close', '<span>✕</span><span>退出讲解</span>');
    el.close.addEventListener('click', exit);
    el.toast = h('div', 'ex-toast');

    el.overlay.appendChild(el.shield);
    el.overlay.appendChild(el.spotlight);
    el.overlay.appendChild(el.callout);
    el.overlay.appendChild(el.dots);

    el.prevBtn = el.calloutFoot.querySelector('.ex-prev');
    el.nextBtn = el.calloutFoot.querySelector('.ex-next');
    el.prevBtn.addEventListener('click', function () { if (curStep > 0) gotoStep(curStep - 1); });
    el.nextBtn.addEventListener('click', function () { if (curReq && curStep < curReq.steps.length - 1) gotoStep(curStep + 1); });

    document.body.appendChild(el.launcher);
    document.body.appendChild(el.bar);
    document.body.appendChild(el.overlay);
    document.body.appendChild(el.close);
    document.body.appendChild(el.toast);

    window.addEventListener('resize', reposition);
    window.addEventListener('scroll', reposition, true);

    initCalloutDrag();
  }

  // ---------- 状态 ----------
  function saveState(reqIndex, step) {
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ reqIndex: reqIndex, step: step })); } catch (e) {}
  }
  function readState() {
    try { var s = sessionStorage.getItem(STORAGE_KEY); return s ? JSON.parse(s) : null; } catch (e) { return null; }
  }
  function clearState() { try { sessionStorage.removeItem(STORAGE_KEY); } catch (e) {} }

  // ---------- 启动器 / 卡片栏 ----------
  function toggleBar() {
    var open = el.bar.classList.toggle('show');
    el.launcher.classList.toggle('active', open);
  }
  function hideBar() { el.bar.classList.remove('show'); el.launcher.classList.remove('active'); }

  function showToast(msg) {
    el.toast.textContent = msg;
    el.toast.classList.add('show');
    clearTimeout(el._t);
    el._t = setTimeout(function () { el.toast.classList.remove('show'); }, 1600);
  }

  function enterReq(i) {
    var r = (config.reqs || [])[i];
    if (!r || !r.ready) { if (r) showToast('「' + r.code + '」讲解待补充'); return; }
    curReq = r;
    hideBar();
    el.launcher.style.display = 'none';
    saveState(i, 0);
    if (r.steps[0].page.toLowerCase() !== currentPage) { location.href = r.steps[0].page; return; }
    gotoStep(0);
  }

  // ---------- 步骤跳转 ----------
  function gotoStep(n) {
    if (!curReq) return;
    calloutPinned = false;
    curStep = n;
    var step = curReq.steps[n];
    saveState((config.reqs || []).indexOf(curReq), n);
    cleanupInjected();
    if (cleanupFn) { try { cleanupFn(); } catch (e) {} }
    if (step.page.toLowerCase() !== currentPage) { location.href = step.page; return; }
    showOverlay();
    renderDots(n);
    renderCallout(n);
    runSetup(step).then(function () { position(step); }).catch(function () { position(step); });
  }

  function showOverlay() {
    el.overlay.classList.add('show');
    el.close.classList.add('show');
    el.callout.classList.add('show');
    el.dots.classList.add('show');
    el.spotlight.style.opacity = '0';
    centerCallout();
  }

  function renderDots(n) {
    el.dots.innerHTML = '';
    curReq.steps.forEach(function (s, i) {
      var dot = h('button', 'ex-dot' + (i === n ? ' active' : ''));
      dot.appendChild(h('span', 'ex-dot-tip', (i + 1) + '. ' + s.title));
      dot.addEventListener('click', function () { gotoStep(i); });
      el.dots.appendChild(dot);
    });
  }

  function renderCallout(n) {
    var step = curReq.steps[n];
    el.calloutHead.innerHTML =
      '<div class="ex-callout-code">' + curReq.code + '</div>' +
      '<div class="ex-callout-title">' + step.title + '</div>';
    el.calloutBody.innerHTML = step.text;
    el.calloutFoot.querySelector('.ex-callout-step').textContent = (n + 1) + ' / ' + curReq.steps.length;
    el.prevBtn.disabled = n === 0;
    el.nextBtn.disabled = n === curReq.steps.length - 1;
  }

  // ---------- 揭示动作执行器 ----------
  function runSetup(step) {
    var actions = step.setup || [];
    return actions.reduce(function (p, act) {
      return p.then(function () { return doAction(act); });
    }, Promise.resolve());
  }
  function doAction(act) {
    return new Promise(function (resolve) {
      if (act.t === 'wait') { setTimeout(resolve, act.ms || 150); return; }
      if (act.t === 'click') { var n = document.querySelector(act.sel); if (n) n.click(); resolve(); return; }
      if (act.t === 'annotate') { addAnnotate(act); resolve(); return; }
      if (act.t === 'simulate') { showSimulate(act.msg || '', act.type, act.ms); resolve(); return; }
      var fn = customActions[act.t];
      if (fn) { Promise.resolve(fn(act)).then(resolve); return; }
      resolve();
    });
  }

  // ---------- 定位聚光灯 + 讲解卡 ----------
  function resolveTarget(step) {
    var n = document.querySelector(step.target);
    if (!n) return null;
    if (step.closest) { var p = n.closest(step.closest); if (p) return p; }
    return n;
  }

  function position(step) {
    var target = resolveTarget(step);
    if (!target) { centerCallout(); el.spotlight.style.opacity = '0'; return; }
    try { target.scrollIntoView({ block: 'center', behavior: 'auto' }); } catch (e) {}
    requestAnimationFrame(function () {
      placeSpotlight(target);
      placeCallout(target);
      positionAnnotates();
      el.spotlight.style.opacity = '1';
    });
  }

  function placeSpotlight(target) {
    var r = target.getBoundingClientRect();
    var pad = 4;
    el.spotlight.style.top = (r.top - pad) + 'px';
    el.spotlight.style.left = (r.left - pad) + 'px';
    el.spotlight.style.width = (r.width + pad * 2) + 'px';
    el.spotlight.style.height = (r.height + pad * 2) + 'px';
  }

  function placeCallout(target) {
    if (calloutPinned) { setCalloutPos(pinX, pinY); return; }
    var r = target.getBoundingClientRect();
    var cw = 360, ch = el.callout.offsetHeight || 220;
    var gap = 16, vw = window.innerWidth, vh = window.innerHeight;
    var left, top;
    if (r.right + gap + cw < vw - 12) {
      left = r.right + gap; top = clamp(r.top, 80, vh - ch - 40);
    } else if (r.left - gap - cw > 12) {
      left = r.left - cw - gap; top = clamp(r.top, 80, vh - ch - 40);
    } else {
      left = clamp(r.left, 12, vw - cw - 12);
      top = (r.bottom + gap + ch < vh) ? r.bottom + gap : Math.max(80, r.top - ch - gap);
    }
    el.callout.style.left = left + 'px';
    el.callout.style.top = top + 'px';
  }

  function centerCallout() {
    el.spotlight.style.width = '0px'; el.spotlight.style.height = '0px';
    var cw = 360, ch = el.callout.offsetHeight || 220;
    el.callout.style.left = ((window.innerWidth - cw) / 2) + 'px';
    el.callout.style.top = ((window.innerHeight - ch) / 2) + 'px';
  }

  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

  function setCalloutPos(x, y) {
    var w = el.callout.offsetWidth || 360;
    var h = el.callout.offsetHeight || 220;
    el.callout.style.left = clamp(x, 8, window.innerWidth - w - 8) + 'px';
    el.callout.style.top = clamp(y, 8, window.innerHeight - h - 8) + 'px';
  }

  function initCalloutDrag() {
    var head = el.calloutHead;
    var dragging = false, sx = 0, sy = 0, ox = 0, oy = 0;
    head.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      dragging = true;
      var r = el.callout.getBoundingClientRect();
      ox = r.left; oy = r.top; sx = e.clientX; sy = e.clientY;
      try { head.setPointerCapture(e.pointerId); } catch (_) {}
      e.preventDefault();
    });
    head.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      setCalloutPos(ox + (e.clientX - sx), oy + (e.clientY - sy));
    });
    function end(e) {
      if (!dragging) return;
      dragging = false;
      var r = el.callout.getBoundingClientRect();
      calloutPinned = true; pinX = r.left; pinY = r.top;
      try { head.releasePointerCapture(e.pointerId); } catch (_) {}
    }
    head.addEventListener('pointerup', end);
    head.addEventListener('pointercancel', end);
  }

  // ---------- 标注徽标 / 模拟反馈（内置动作，每步自动清除）----------
  function addAnnotate(act) {
    var badge = h('div', 'ex-annotate' + (act.variant ? ' ex-annotate-' + act.variant : ''));
    badge.innerHTML = act.label || '';
    badge.style.display = 'none';
    document.body.appendChild(badge);
    annotates.push({ el: badge, sel: act.sel, pos: act.pos || 'right' });
    positionAnnotates();
  }

  function positionAnnotates() {
    annotates.forEach(function (a) {
      var n = document.querySelector(a.sel);
      if (!n) { a.el.style.display = 'none'; return; }
      var r = n.getBoundingClientRect();
      a.el.style.display = '';
      if (a.pos === 'left') {
        a.el.style.left = (r.left - 10) + 'px'; a.el.style.top = (r.top + r.height / 2) + 'px';
        a.el.style.transform = 'translate(-100%,-50%)';
      } else if (a.pos === 'top') {
        a.el.style.left = (r.left + r.width / 2) + 'px'; a.el.style.top = (r.top - 10) + 'px';
        a.el.style.transform = 'translate(-50%,-100%)';
      } else if (a.pos === 'bottom') {
        a.el.style.left = (r.left + r.width / 2) + 'px'; a.el.style.top = (r.bottom + 10) + 'px';
        a.el.style.transform = 'translate(-50%,0)';
      } else {
        a.el.style.left = (r.right + 10) + 'px'; a.el.style.top = (r.top + r.height / 2) + 'px';
        a.el.style.transform = 'translateY(-50%)';
      }
    });
  }

  function cleanupInjected() {
    annotates.forEach(function (a) { if (a.el.parentNode) a.el.parentNode.removeChild(a.el); });
    annotates = [];
    if (simulateStack) simulateStack.innerHTML = '';
  }

  function showSimulate(msg, type, ms) {
    if (!simulateStack) {
      simulateStack = h('div', 'ex-simulate-stack');
      document.body.appendChild(simulateStack);
    }
    var item = h('div', 'ex-simulate ex-simulate-' + (type || 'info'));
    item.innerHTML = msg;
    simulateStack.appendChild(item);
    item.offsetWidth;
    item.classList.add('show');
    var dur = ms || 2600;
    item._t = setTimeout(function () {
      item.classList.remove('show');
      setTimeout(function () { if (item.parentNode) item.parentNode.removeChild(item); }, 250);
    }, dur);
  }

  var reposing = false;
  function reposition() {
    if (!curReq || !el.overlay.classList.contains('show')) return;
    if (reposing) return;
    reposing = true;
    requestAnimationFrame(function () {
      reposing = false;
      var step = curReq.steps[curStep];
      var target = resolveTarget(step);
      if (target) { placeSpotlight(target); placeCallout(target); }
      positionAnnotates();
    });
  }

  // ---------- 退出 ----------
  function exit() {
    clearState();
    if (cleanupFn) { try { cleanupFn(); } catch (e) {} }
    if (exitFn) { try { exitFn(); } catch (e) {} }
    cleanupInjected();
    curReq = null; curStep = 0;
    calloutPinned = false;
    el.overlay.classList.remove('show');
    el.close.classList.remove('show');
    el.callout.classList.remove('show');
    el.dots.classList.remove('show');
    el.launcher.style.display = '';
  }

  // ---------- 初始化 ----------
  function init() {
    buildDom();
    var st = readState();
    var reqs = config.reqs || [];
    if (st && reqs[st.reqIndex] && reqs[st.reqIndex].ready) {
      curReq = reqs[st.reqIndex];
      el.launcher.style.display = 'none';
      gotoStep(st.step || 0);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
