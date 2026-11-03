// ============================================================
//  IQ 智力测评 · 逻辑层
//  流程：封面 → 答题 → 分析动画 → 结果页
//  计分：答对数 → 折算 IQ（84 + 答对 × 1.15，封顶 132）
// ============================================================

const $ = id => document.getElementById(id);

let answers = new Array(QUESTIONS.length).fill(null);
let cur = 0;

function show(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  $(id).classList.add('active');
  const sc = $(id).querySelector('.result-scroll');
  if (sc) sc.scrollTop = 0;
  window.scrollTo(0, 0);
}

// ---------------- 答题 ----------------
function startQuiz() {
  answers = new Array(QUESTIONS.length).fill(null);
  show('page-quiz');
  renderQuestion(0);
}

function renderQuestion(i) {
  cur = i;
  const q = QUESTIONS[i];
  const dim = DIMS.find(d => d.key === q.dim);
  $('q-num').textContent = `Question ${i + 1}`;
  $('q-total').textContent = `${QUESTIONS.length} total`;
  $('q-bar').style.width = `${(i / QUESTIONS.length) * 100}%`;
  $('q-tag').textContent = dim.label;
  $('q-tag').style.color = dim.color;
  $('q-text').innerHTML = q.text;
  $('q-figure').innerHTML = q.figure || '';
  $('q-opts').innerHTML = q.opts.map((o, idx) => {
    const inner = typeof o === 'string' ? `<span class="opt-text">${o}</span>` : `<span class="opt-fig">${o.svg}</span>`;
    const cls = answers[i] === idx ? 'opt picked' : 'opt';
    return `<button class="${cls}" data-idx="${idx}"><span class="opt-tag">${'ABCD'[idx]}</span>${inner}</button>`;
  }).join('');
  $('q-opts').querySelectorAll('.opt').forEach(el => {
    el.addEventListener('click', () => pick(Number(el.dataset.idx)));
  });
  $('btn-back').style.visibility = i === 0 ? 'hidden' : 'visible';
  window.scrollTo(0, 0);
}

function pick(idx) {
  answers[cur] = idx;
  if (cur < QUESTIONS.length - 1) {
    renderQuestion(cur + 1);
  } else {
    startLoading();
  }
}

// ---------------- 分析动画 ----------------
const LOAD_STEPS = [
  '正在核验作答有效性…',
  '正在计算五维能力得分…',
  '正在比对认知常模…',
  '正在生成你的智力画像…',
];

function startLoading() {
  show('page-loading');
  const fill = $('load-fill'), pct = $('load-pct'), step = $('load-step');
  let p = 0, si = 0;
  const timer = setInterval(() => {
    p += Math.random() * 12 + 6;
    if (p >= 100) { p = 100; clearInterval(timer); setTimeout(renderResult, 420); }
    fill.style.width = p + '%';
    pct.textContent = Math.floor(p) + '%';
    const idx = Math.min(LOAD_STEPS.length - 1, Math.floor(p / 25));
    if (idx !== si) { si = idx; step.textContent = LOAD_STEPS[idx]; }
  }, 180);
}

// ---------------- 计分 ----------------
function compute() {
  const per = {}; DIMS.forEach(d => per[d.key] = { right: 0, total: 0 });
  let right = 0;
  QUESTIONS.forEach((q, i) => {
    per[q.dim].total++;
    if (answers[i] === q.ans) { per[q.dim].right++; right++; }
  });

  const dims = DIMS.map(d => {
    const s = per[d.key];
    const pct = s.total ? Math.round(s.right / s.total * 100) : 0;
    return { ...d, right: s.right, total: s.total, pct };
  });

  let iq = Math.round(84 + right * 1.15);
  iq = Math.min(132, Math.max(84, iq));
  const band = BANDS.find(b => iq >= b.min) || BANDS[BANDS.length - 1];

  // 百分位（正态近似，均值 100、标准差 15）
  const z = (iq - 100) / 15;
  const erf = x => {
    const s = Math.sign(x), ax = Math.abs(x);
    const t = 1 / (1 + 0.3275911 * ax);
    const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-ax * ax);
    return s * y;
  };
  const percentile = Math.round((0.5 * (1 + erf(z / Math.SQRT2))) * 100);
  const topPct = Math.max(1, 100 - percentile);

  const sorted = [...dims].sort((a, b) => b.pct - a.pct);
  const top = sorted[0], second = sorted[1], low = sorted[sorted.length - 1];
  const top2 = [...sorted].sort((a, b) => b.right - a.right).slice(0, 2);

  return { right, iq, band, percentile, topPct, dims, top, second, low, top2 };
}

// ---------------- 结果渲染 ----------------
function renderResult() {
  const r = compute();
  const tp = TYPE_PROFILE[r.top.key];
  const sp = TYPE_PROFILE[r.second.key];
  const tier = (pct) => pct >= 75 ? 'hi' : pct >= 45 ? 'mid' : 'lo';
  const dotPos = Math.max(2, Math.min(98, (r.iq - 70) / 65 * 100));

  const dimBars = r.dims.map(d => `
    <div class="dim-line">
      <div class="dl-top"><span class="dl-name">${d.label}</span><span class="dl-val">${d.pct}% <em>${d.right}/${d.total}</em></span></div>
      <div class="dl-track"><div class="dl-fill" style="width:${d.pct}%;background:${d.color}"></div></div>
    </div>
  `).join('');

  const dimDetails = r.dims.map(d => `
    <div class="dim-card">
      <div class="dc-head"><span class="dc-dot" style="background:${d.color}"></span><span class="dc-name">${d.label}</span><span class="dc-pct">${d.pct}%</span></div>
      <p class="dc-text">${DIM_TEXT[d.key][tier(d.pct)]}</p>
    </div>
  `).join('');

  const jobChips = (TYPE_PROFILE[r.top.key].scenes || []).map(x => `<span class="chip">${x}</span>`).join('');

  $('result-scroll').innerHTML = `
    <div class="r-hero fade">
      <div class="r-hero-label">智 商 评 估</div>
      <div class="r-score">${r.iq}<small>分</small></div>
      <div class="r-quote">${r.band.quote}</div>
      <div class="r-band">${r.band.label}</div>
      <div class="r-percentile">超过约 <strong>${r.percentile}%</strong> 的同龄答题者 · 前 ${r.topPct}%</div>
      <p class="r-hero-desc">${r.band.desc}</p>
      <div class="scale-wrap">
        <div class="scale-track"><div class="scale-dot" id="scale-dot"></div></div>
        <div class="scale-marks"><span>85</span><span>100</span><span>115</span><span>130</span></div>
      </div>
    </div>

    <div class="sec fade" style="animation-delay:.06s">
      <div class="sec-head"><div class="sec-title">◎ 你的认知风格</div></div>
      <div class="card type-card">
        <div class="chip-row center">
          <span class="chip primary">${tp.name}</span>
          <span class="chip soft">${sp.name}</span>
        </div>
        <div class="type-tag">${tp.tag}</div>
        <p class="type-desc">${tp.desc}</p>
        <div class="kv-line"><span class="kl">思维特点</span><div class="chip-row">${tp.traits.map(x => `<span class="chip sm">${x}</span>`).join('')}</div></div>
        <div class="kv-line"><span class="kl">优势场景</span><div class="chip-row">${tp.scenes.map(x => `<span class="chip sm">${x}</span>`).join('')}</div></div>
        <div class="kv-line col"><span class="kl">你的天赋</span>${tp.strengths.map(x => `<div class="li">· ${x}</div>`).join('')}</div>
        <div class="kv-line col"><span class="kl">成长提醒</span>${tp.growth.map(x => `<div class="li">· ${x}</div>`).join('')}</div>
      </div>
    </div>

    <div class="sec fade" style="animation-delay:.1s">
      <div class="sec-head"><div class="sec-title">▤ 五维能力结构</div></div>
      <div class="card">
        <canvas id="radar-canvas"></canvas>
        <div class="dim-bars">${dimBars}</div>
      </div>
    </div>

    <div class="sec fade" style="animation-delay:.14s">
      <div class="sec-head"><div class="sec-title">✎ 五个维度 · 逐项解读</div></div>
      <div class="card">${dimDetails}</div>
    </div>

    <div class="sec fade" style="animation-delay:.18s">
      <div class="sec-head"><div class="sec-title">▲ 你的强项与短板</div></div>
      <div class="card">
        <div class="sec3-label good">最突出的两项</div>
        ${r.top2.map(d => `<div class="li-strong"><strong>${d.label}</strong> · ${d.pct}%<p>${DIM_TEXT[d.key].hi}</p></div>`).join('')}
        <div class="sec3-label warn" style="margin-top:14px">相对薄弱的一项</div>
        <div class="li-warn"><strong>${r.low.label}</strong> · ${r.low.pct}%<p>${DIM_TEXT[r.low.key].lo}</p></div>
      </div>
    </div>

    <div class="sec fade" style="animation-delay:.22s">
      <div class="sec-head"><div class="sec-title">♞ 适合的领域与工作</div></div>
      <div class="card">
        <div class="kv-line"><span class="kl">适合的方向</span><div class="chip-row">${jobChips}</div></div>
        <div class="sec3-label" style="margin-top:14px">为什么适合你</div>
        <p class="career-text">${CAREER_TOP[r.top.key]}</p>
        <div class="sec3-label warn" style="margin-top:14px">需要避开的领域</div>
        <p class="career-text warn">${CAREER_AVOID[r.low.key]}</p>
      </div>
    </div>

    <div class="sec fade" style="animation-delay:.26s">
      <div class="sec-head"><div class="sec-title">✚ 提升建议</div></div>
      <div class="card">
        <div class="li">· 把「${r.top.label}」用在真正值得的地方：它是你的杠杆，别只用来做小事。</div>
        <div class="li">· 「${r.low.label}」不必变成强项，配一套外部工具或流程替你补位即可。</div>
        <div class="li">· 智力不是固定值：持续的深度阅读、动手项目与复盘，比刷题更能改变你的认知上限。</div>
        <div class="li">· 找一件"略高于你当前水平"的事长期做，这是最有效的认知训练。</div>
      </div>
    </div>

    <div class="r-foot">
      <p class="foot-share">我的 IQ 评估是 <strong>${r.iq}</strong> 分 ·「${r.band.label}」<br>截图发给朋友，看看他们的智力结构是什么形状</p>
      <button class="btn-again" id="btn-again">重新测评</button>
      <p class="disclaimer">本测评共 40 题，基于自建题库计分，题目数量、施测条件与常模均不同于专业智力测验，结果仅供娱乐与自我认知参考，不作为任何专业或医学结论。</p>
    </div>
  `;

  show('page-result');

  requestAnimationFrame(() => {
    setTimeout(() => {
      const dot = $('scale-dot');
      if (dot) dot.style.left = dotPos + '%';
    }, 120);
    drawRadar('radar-canvas', r.dims);
  });

  $('btn-again').addEventListener('click', () => {
    answers = new Array(QUESTIONS.length).fill(null);
    show('page-cover');
  });
}

// ---------------- 雷达图 ----------------
function drawRadar(canvasId, dims) {
  const canvas = $(canvasId);
  if (!canvas) return;
  const dpr = window.devicePixelRatio || 1;
  const size = Math.min(300, window.innerWidth - 90);
  canvas.width = size * dpr; canvas.height = size * dpr;
  canvas.style.width = size + 'px'; canvas.style.height = size + 'px';
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  const cx = size / 2, cy = size / 2, R = size / 2 - 42;
  const n = dims.length;

  ctx.clearRect(0, 0, size, size);
  for (let ring = 1; ring <= 4; ring++) {
    const rr = R * ring / 4;
    ctx.beginPath();
    for (let i = 0; i <= n; i++) {
      const ang = -Math.PI / 2 + (i % n) * (2 * Math.PI / n);
      const x = cx + rr * Math.cos(ang), y = cy + rr * Math.sin(ang);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.strokeStyle = 'rgba(47,93,138,0.14)'; ctx.lineWidth = 1; ctx.stroke();
  }
  for (let i = 0; i < n; i++) {
    const ang = -Math.PI / 2 + i * (2 * Math.PI / n);
    ctx.beginPath(); ctx.moveTo(cx, cy);
    ctx.lineTo(cx + R * Math.cos(ang), cy + R * Math.sin(ang));
    ctx.strokeStyle = 'rgba(47,93,138,0.12)'; ctx.stroke();
  }
  ctx.beginPath();
  const pts = [];
  dims.forEach((d, i) => {
    const v = Math.max(0.06, d.pct / 100);
    const ang = -Math.PI / 2 + i * (2 * Math.PI / n);
    const x = cx + R * v * Math.cos(ang), y = cy + R * v * Math.sin(ang);
    pts.push([x, y]);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.closePath();
  ctx.fillStyle = 'rgba(47,93,138,0.18)'; ctx.fill();
  ctx.strokeStyle = '#2f5d8a'; ctx.lineWidth = 2; ctx.stroke();
  pts.forEach(([x, y]) => { ctx.beginPath(); ctx.arc(x, y, 3.2, 0, 7); ctx.fillStyle = '#2f5d8a'; ctx.fill(); });
  ctx.font = '12px "Noto Sans SC", sans-serif';
  ctx.fillStyle = '#5a6a7a'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  dims.forEach((d, i) => {
    const ang = -Math.PI / 2 + i * (2 * Math.PI / n);
    ctx.fillText(d.label, cx + (R + 26) * Math.cos(ang), cy + (R + 20) * Math.sin(ang));
  });
}

// ---------------- 初始绑定 ----------------
document.addEventListener('DOMContentLoaded', () => {
  $('btn-start').addEventListener('click', startQuiz);
  $('btn-back').addEventListener('click', () => { if (cur > 0) renderQuestion(cur - 1); });
  show('page-cover');
});
