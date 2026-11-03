// ============================================================
//  IQ 智力测评 · 数据层
//  5 维 × 8 题 = 40 题；含 SVG 图形推理
// ============================================================

const DIMS = [
  { key: 'logic',   label: '逻辑推理', color: '#2f5d8a' },
  { key: 'math',    label: '数学思维', color: '#3f7a6a' },
  { key: 'verbal',  label: '语言理解', color: '#8a6a3a' },
  { key: 'spatial', label: '空间想象', color: '#6a5a8a' },
  { key: 'detail',  label: '细节洞察', color: '#a05a4a' },
];

// ---------------- 分档 ----------------
const BANDS = [
  { min: 125, label: '卓越型', quote: '你的思路，常常比问题本身更远一些。',
    desc: '在抽象推理与复杂问题拆解上，你明显高于平均水平。你享受"想明白"的快感，也常被身边人说"想得太快"。真正的挑战不在能力，而在把天赋变成作品。' },
  { min: 115, label: '聪慧型', quote: '别人还在找路，你已经看见了路的方向。',
    desc: '你的认知效率高于大多数人，学习新东西时上手快、抓得住要点。你擅长在信息不完整时做出合理推断，但偶尔会因为太快而跳过细节。' },
  { min: 105, label: '敏锐型', quote: '你不是最吵的那个，但常常是最先看懂的。',
    desc: '你的智力结构均衡偏上：理解力好、反应不慢、判断靠得住。你不追求炫技，更擅长把复杂的事说清楚、做扎实，这是极稀缺的稳定优势。' },
  { min: 95,  label: '均衡型', quote: '你的聪明，是那种靠得住的聪明。',
    desc: '你在多数认知任务上表现稳定，属于人群中的中坚力量。你的优势不在单点爆发，而在综合判断与长期积累——后劲往往比开头更足。' },
  { min: 0,   label: '沉稳型', quote: '快的人很多，沉得住的人很少。',
    desc: '你的思维节奏偏慢而稳，喜欢想清楚再动手。这类风格在需要耐心、细致与反复核验的工作里，常常比"聪明"更值钱。' },
];

// ---------------- 认知风格（按最强维度） ----------------
const TYPE_PROFILE = {
  logic: {
    name: '推演者', tag: '条分缕析 · 见结构',
    desc: '你的大脑像一台自动拆解机：任何混乱的信息递到手上，都会被你拆成前提、推论和结论。你不轻信直觉，更喜欢问一句"凭什么"。',
    traits: ['结构化思维', '擅长归因', '不轻下结论', '爱较真'],
    scenes: ['复杂决策', '辩论与谈判', '规则设计', '问题诊断'],
    strengths: ['能在信息不全时做出最合理的推断', '对逻辑漏洞有近乎本能的敏感', '把混乱问题拆成清晰步骤'],
    growth: ['别要求所有人都按你的逻辑活着', '结论对，也要给别人留台阶'],
  },
  math: {
    name: '演算者', tag: '量化世界 · 找确定',
    desc: '你习惯用数字理解世界：模糊的感受到你这里，会自然变成概率、区间和成本。你不容易被情绪带走，因为你知道什么可以算。',
    traits: ['数字敏感', '成本意识强', '结果导向', '喜欢确定性'],
    scenes: ['投资决策', '数据分析', '资源分配', '风险定价'],
    strengths: ['一眼看出账算不算得过来', '决策前能把变量列清楚', '擅长把复杂事务量化管理'],
    growth: ['别把人也算成变量', '不是所有重要的事都能被计量'],
  },
  verbal: {
    name: '解读者', tag: '读懂人心 · 说清道理',
    desc: '你对语言和人心都有超出常人的敏感：一句话里的弯、一个词的分量，你都接得住。你能把复杂的道理，讲成别人愿意听的样子。',
    traits: ['表达准确', '共情力强', '善于类比', '记得住细节'],
    scenes: ['内容创作', '教学培训', '品牌传播', '谈判沟通'],
    strengths: ['能把难懂的事讲得人人明白', '听得出话里没说出口的部分', '写与说都自带说服力'],
    growth: ['别把"会表达"当成"已想清"', '少一点修辞，多一点结论'],
  },
  spatial: {
    name: '架构师', tag: '脑中建模 · 见全局',
    desc: '你在脑中能"看见"结构：空间、比例、层次、动线，别人要靠图纸，你闭上眼就能转一圈。你对"怎么搭起来"有天然的直觉。',
    traits: ['空间感强', '擅长建模', '关注全局结构', '动手能力强'],
    scenes: ['设计与工程', '产品架构', '空间规划', '可视化表达'],
    strengths: ['能在脑内预演方案再落地', '对比例与秩序异常敏感', '把抽象需求变成具体结构'],
    growth: ['结构再美，也要有人愿意用', '别只画图，多听听使用者的笨问题'],
  },
  detail: {
    name: '观察者', tag: '见微知著 · 不放过',
    desc: '你的注意力像一盏聚光灯：别人扫一眼就过的地方，你会停下来多看一眼。错误、差异、不对劲，在你眼里藏不住。',
    traits: ['细节控', '专注力强', '记忆力好', '对异常敏感'],
    scenes: ['质量与审核', '研究与调查', '编辑校对', '风险排查'],
    strengths: ['能在海量信息中锁定那一处错', '做事有耐心、有回访意识', '别人忽略的线索你能记住'],
    growth: ['别让细节拖住整体进度', '学会判断哪些细节值得较真'],
  },
};

// ---------------- 五维解读（三档） ----------------
const DIM_TEXT = {
  logic: {
    hi: '你的推理链条又长又稳：能从残缺的前提一路推到结论，还能反过来检查结论站不站得住。这份"较真"，是你最锋利的工具。',
    mid: '你的逻辑能力扎实可靠：常规的推理与判断很少出错，遇到特别绕的题会稍慢一些，但基本不会掉进明显的坑里。',
    lo: '你更信直觉与经验，不太爱在前提和推论之间来回推敲。这让你决策更快，但也容易在"看起来合理"的地方吃亏。',
  },
  math: {
    hi: '你对数量和比例有天然的手感：别人要动笔的账，你心里已经有了大概。你能在模糊中估出区间，这是极实用的天赋。',
    mid: '你的数感在正常水准之上：日常的计算与估算不成问题，遇到多层条件时偶尔需要笔算，但结论通常靠得住。',
    lo: '你不太依赖数字思考，更相信具体感受。这不算缺点，但在需要算成本、比概率的场合，最好给自己配个"计算外挂"。',
  },
  verbal: {
    hi: '你对语言的颗粒度极细：一个词的轻重、一句话的言外之意，你都接得稳。这让你既能读懂人，也能说清事。',
    mid: '你的理解与表达都在中上水平：读得懂复杂表述，也能把想法说明白，偶尔在特别绕的句子上会慢半拍。',
    lo: '你偏好直给的表达，不爱在字缝里找意思。这让你显得坦率，但在需要读懂潜台词的场合，多问一句会更稳妥。',
  },
  spatial: {
    hi: '你脑中自带建模能力：图形怎么转、结构怎么搭，你几乎不用动笔。这份空间直觉，在设计、工程与产品上都是硬通货。',
    mid: '你的空间感处于良好水平：常见的图形变换难不倒你，复杂的立体折叠需要多花一点时间，但方向不会错。',
    lo: '你更习惯用文字与逻辑理解世界，对图形变换不太敏感。遇到空间问题，画出来、动手摆一摆，比硬想有效得多。',
  },
  detail: {
    hi: '你的注意力像放大镜：别人扫过就忘的细节，你能记住并复现。这种"看得见"的能力，在需要零失误的场合无可替代。',
    mid: '你的细节把控在正常水准：重要的事你会核对，琐碎处偶尔放过。把核对变成固定动作，你的可靠度会再上一个台阶。',
    lo: '你习惯抓大放小，不太在意细枝末节。这让你效率很高，但在需要精确的场合，务必给自己留一道复核的工序。',
  },
};

// ---------------- 职业适配 ----------------
const CAREER_TOP = {
  logic: '研究分析、策略规划、法务合规、咨询顾问——这些岗位每天都在奖励"想得清楚"的人，而你的强项恰好在此。',
  math: '金融投资、数据分析、精算风控、运营优化——凡是能用数字衡量结果的地方，你的判断力都能直接变现。',
  verbal: '内容创作、品牌公关、教育培训、商务谈判——你的表达与共情，是这些行业最直接的生产力。',
  spatial: '工业设计、建筑与空间规划、产品架构、可视化——你能把"想法"直接变成"看得见的结构"。',
  detail: '质量审核、研究调查、编辑校对、风控排查——零失误的地方，最需要你这种看得见差异的眼睛。',
};

const CAREER_AVOID = {
  logic: '少碰靠感觉拍板、不许追问原因的活。你在那种环境里会憋得慌，而且往往最后要替别人的糊涂买单。',
  math: '避开需要长期与精确数字打交道、又没人帮你复核的岗位。数量上的偏差一旦滚大，很难收场。',
  verbal: '慎入纯技术输出、几乎不需要沟通的深井岗位。你的长处会被闲置，成就感也会很快耗尽。',
  spatial: '避开高度依赖空间想象却缺少试错成本的岗位。你需要能画、能试、能改的环境。',
  detail: '别选容错率极低、却要求你一个人盯完全程的岗位。给自己配流程与复核，比硬扛更专业。',
};

// ---------------- 图形题素材 ----------------
const SVG_ARROW = d => {
  const rot = { up: 0, right: 90, down: 180, left: 270 }[d];
  return `<svg viewBox="0 0 100 100" class="fig-svg"><g transform="rotate(${rot} 50 50)"><path d="M50 18 L50 74" stroke="#2f5d8a" stroke-width="7" stroke-linecap="round"/><path d="M30 42 L50 18 L70 42" fill="none" stroke="#2f5d8a" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></g></svg>`;
};

const SVG_BOX = (label, bg) => `<svg viewBox="0 0 100 100" class="fig-svg"><rect x="12" y="12" width="76" height="76" rx="8" fill="${bg || '#fff'}" stroke="#2f5d8a" stroke-width="3"/><text x="50" y="62" font-size="34" text-anchor="middle" fill="#2f5d8a" font-family="serif">${label}</text></svg>`;

const SVG_DOTS = n => {
  const pos = [[50, 24], [30, 52], [70, 52], [32, 78], [68, 78], [50, 52]];
  let s = `<svg viewBox="0 0 100 100" class="fig-svg"><rect x="8" y="8" width="84" height="84" rx="8" fill="#fff" stroke="#d8d2c4" stroke-width="2"/>`;
  for (let i = 0; i < n; i++) s += `<circle cx="${pos[i][0]}" cy="${pos[i][1]}" r="7" fill="#2f5d8a"/>`;
  return s + '</svg>';
};

const SVG_TRI = `<svg viewBox="0 0 100 100" class="fig-svg"><rect x="8" y="8" width="84" height="84" rx="8" fill="#fff" stroke="#d8d2c4" stroke-width="2"/><path d="M50 22 L78 76 L22 76 Z" fill="none" stroke="#2f5d8a" stroke-width="5" stroke-linejoin="round"/></svg>`;
const SVG_CIR = `<svg viewBox="0 0 100 100" class="fig-svg"><rect x="8" y="8" width="84" height="84" rx="8" fill="#fff" stroke="#d8d2c4" stroke-width="2"/><circle cx="50" cy="50" r="28" fill="none" stroke="#2f5d8a" stroke-width="5"/></svg>`;
const SVG_SQR = `<svg viewBox="0 0 100 100" class="fig-svg"><rect x="8" y="8" width="84" height="84" rx="8" fill="#fff" stroke="#d8d2c4" stroke-width="2"/><rect x="26" y="26" width="48" height="48" fill="none" stroke="#2f5d8a" stroke-width="5"/></svg>`;

// ============================================================
//  40 道题
// ============================================================
const QUESTIONS = [
  // ---------- 逻辑推理 8 ----------
  { dim: 'logic', text: '已知：所有 A 都是 B，所有 B 都是 C。下列哪项一定成立？',
    opts: ['所有 C 都是 A', '所有 A 都是 C', '有些 C 不是 A', '无法判断'], ans: 1 },
  { dim: 'logic', text: '规则：如果下雨，地面就会湿。现在地面没有湿，可以推出：',
    opts: ['下过雨但很快干了', '没有下雨', '可能会下雨', '地会自己变干'], ans: 1 },
  { dim: 'logic', text: '甲说"乙在说谎"，乙说"丙在说谎"，丙说"甲乙都在说谎"。谁的陈述是真的？',
    opts: ['甲', '乙', '丙', '三人都真'], ans: 1 },
  { dim: 'logic', text: '数列：2，6，12，20，30，？', opts: ['36', '40', '42', '48'], ans: 2 },
  { dim: 'logic', text: '数列：3，7，16，35，74，？', opts: ['148', '153', '156', '166'], ans: 1 },
  { dim: 'logic', text: '数列：1，4，9，16，25，？', opts: ['30', '32', '36', '49'], ans: 2 },
  { dim: 'logic', text: '数列：2，3，5，8，13，？', opts: ['18', '20', '21', '26'], ans: 2 },
  { dim: 'logic', text: '已知：有些猫是黑的；所有黑的东西都是动物。可以推出：',
    opts: ['所有动物都是猫', '有些猫是动物', '所有猫都是黑的', '有些动物不是猫'], ans: 1 },

  // ---------- 数学思维 8 ----------
  { dim: 'math', text: '一件商品先涨价 20%，再降价 20%，最终价格与原价相比：',
    opts: ['一样', '高 4%', '低 4%', '低 2%'], ans: 2 },
  { dim: 'math', text: '5 个人互相握手，每两人握一次，共握几次？',
    opts: ['8 次', '10 次', '12 次', '20 次'], ans: 1 },
  { dim: 'math', text: '若 3x + 5 = 20，则 x 等于：',
    opts: ['3', '4', '5', '6'], ans: 2 },
  { dim: 'math', text: '钟表显示 3 点 15 分，此时时针与分针的夹角是：',
    opts: ['0°', '7.5°', '15°', '30°'], ans: 1 },
  { dim: 'math', text: '一个数加上它自己的一半，等于 18。这个数是：',
    opts: ['9', '10', '11', '12'], ans: 3 },
  { dim: 'math', text: '甲管单独注满水池需 6 小时，乙管需 3 小时。两管同开，几小时注满？',
    opts: ['1.5 小时', '2 小时', '2.5 小时', '4.5 小时'], ans: 1 },
  { dim: 'math', text: '数列：1，1，2，3，5，8，？', opts: ['11', '12', '13', '16'], ans: 2 },
  { dim: 'math', text: '100 以内所有 3 的倍数之和是：',
    opts: ['1583', '1650', '1683', '1716'], ans: 2 },

  // ---------- 语言理解 8 ----------
  { dim: 'verbal', text: '成语「刻舟求剑」比喻的是：',
    opts: ['做事认真不马虎', '拘泥成法，不知变通', '以小人之心度君子之腹', '做事不切实际'], ans: 1 },
  { dim: 'verbal', text: '医生 : 医院 = 教师 : ？',
    opts: ['学生', '课本', '学校', '知识'], ans: 2 },
  { dim: 'verbal', text: '犹豫 : 果断 = 吝啬 : ？',
    opts: ['节俭', '小气', '慷慨', '富有'], ans: 2 },
  { dim: 'verbal', text: '下列哪一个与其他三个不同类？',
    opts: ['钢琴', '小提琴', '吉他', '画板'], ans: 3 },
  { dim: 'verbal', text: '「并非所有人都同意这个方案」的意思是：',
    opts: ['所有人都不同意', '大多数人都同意', '有人不同意', '没有人同意'], ans: 2 },
  { dim: 'verbal', text: '成语「三人成虎」的意思是：',
    opts: ['人多力量大', '谣言重复多次就会让人信以为真', '三个人能打败老虎', '人多反而办不成事'], ans: 1 },
  { dim: 'verbal', text: '笔 : 写 = 刀 : ？',
    opts: ['铁', '切', '快', '鞘'], ans: 1 },
  { dim: 'verbal', text: '「不言而喻」的意思是：',
    opts: ['不说话就生气', '不用说就能明白', '说了也听不明白', '不能随便说'], ans: 1 },

  // ---------- 空间想象 8 ----------
  { dim: 'spatial', text: '箭头每次顺时针旋转 90°，问号处应是：', figure: `<div class="fig-row">${SVG_ARROW('up')}${SVG_ARROW('right')}${SVG_ARROW('down')}<div class="fig-q">?</div></div>`,
    opts: [{ svg: SVG_ARROW('up') }, { svg: SVG_ARROW('left') }, { svg: SVG_ARROW('down') }, { svg: SVG_ARROW('right') }], ans: 1 },
  { dim: 'spatial', text: '下列哪个图形是左图沿竖直中线镜像后的结果？', figure: `<div class="fig-row"><svg viewBox="0 0 100 100" class="fig-svg"><rect x="8" y="8" width="84" height="84" rx="8" fill="#fff" stroke="#d8d2c4" stroke-width="2"/><path d="M22 30 L22 70 L58 70 Z" fill="none" stroke="#2f5d8a" stroke-width="5" stroke-linejoin="round"/></svg></div>`,
    opts: [
      { svg: `<svg viewBox="0 0 100 100" class="fig-svg"><rect x="8" y="8" width="84" height="84" rx="8" fill="#fff" stroke="#d8d2c4" stroke-width="2"/><path d="M78 30 L78 70 L42 70 Z" fill="none" stroke="#2f5d8a" stroke-width="5" stroke-linejoin="round"/></svg>` },
      { svg: `<svg viewBox="0 0 100 100" class="fig-svg"><rect x="8" y="8" width="84" height="84" rx="8" fill="#fff" stroke="#d8d2c4" stroke-width="2"/><path d="M22 70 L22 30 L58 30 Z" fill="none" stroke="#2f5d8a" stroke-width="5" stroke-linejoin="round"/></svg>` },
      { svg: `<svg viewBox="0 0 100 100" class="fig-svg"><rect x="8" y="8" width="84" height="84" rx="8" fill="#fff" stroke="#d8d2c4" stroke-width="2"/><path d="M22 30 L22 70 L58 70 Z" fill="none" stroke="#2f5d8a" stroke-width="5" stroke-linejoin="round"/></svg>` },
      { svg: `<svg viewBox="0 0 100 100" class="fig-svg"><rect x="8" y="8" width="84" height="84" rx="8" fill="#fff" stroke="#d8d2c4" stroke-width="2"/><path d="M50 22 L50 78 L14 78 Z" fill="none" stroke="#2f5d8a" stroke-width="5" stroke-linejoin="round"/></svg>` },
    ], ans: 0 },
  { dim: 'spatial', text: '数一数，下图中共有多少个正方形？', figure: `<div class="fig-row"><svg viewBox="0 0 100 100" class="fig-svg"><rect x="10" y="10" width="80" height="80" rx="4" fill="#fff" stroke="#2f5d8a" stroke-width="4"/><path d="M50 10 L50 90 M10 50 L90 50" stroke="#2f5d8a" stroke-width="4"/></svg></div>`,
    opts: ['3 个', '4 个', '5 个', '6 个'], ans: 2 },
  { dim: 'spatial', text: '前两个图形叠加，会得到哪个结果？', figure: `<div class="fig-row"><svg viewBox="0 0 100 100" class="fig-svg"><rect x="8" y="8" width="84" height="84" rx="8" fill="#fff" stroke="#d8d2c4" stroke-width="2"/><rect x="24" y="24" width="52" height="52" fill="none" stroke="#2f5d8a" stroke-width="5"/></svg><span class="fig-plus">+</span><svg viewBox="0 0 100 100" class="fig-svg"><rect x="8" y="8" width="84" height="84" rx="8" fill="#fff" stroke="#d8d2c4" stroke-width="2"/><circle cx="50" cy="50" r="30" fill="none" stroke="#2f5d8a" stroke-width="5"/></svg><span class="fig-plus">=</span><div class="fig-q">?</div></div>`,
    opts: [
      { svg: `<svg viewBox="0 0 100 100" class="fig-svg"><rect x="8" y="8" width="84" height="84" rx="8" fill="#fff" stroke="#d8d2c4" stroke-width="2"/><circle cx="50" cy="50" r="30" fill="none" stroke="#2f5d8a" stroke-width="5"/><rect x="24" y="24" width="52" height="52" fill="none" stroke="#2f5d8a" stroke-width="5"/></svg>` },
      { svg: `<svg viewBox="0 0 100 100" class="fig-svg"><rect x="8" y="8" width="84" height="84" rx="8" fill="#fff" stroke="#d8d2c4" stroke-width="2"/><circle cx="50" cy="50" r="30" fill="none" stroke="#2f5d8a" stroke-width="5"/></svg>` },
      { svg: `<svg viewBox="0 0 100 100" class="fig-svg"><rect x="8" y="8" width="84" height="84" rx="8" fill="#fff" stroke="#d8d2c4" stroke-width="2"/><rect x="24" y="24" width="52" height="52" fill="none" stroke="#2f5d8a" stroke-width="5"/></svg>` },
      { svg: `<svg viewBox="0 0 100 100" class="fig-svg"><rect x="8" y="8" width="84" height="84" rx="8" fill="#fff" stroke="#d8d2c4" stroke-width="2"/><circle cx="50" cy="50" r="30" fill="none" stroke="#2f5d8a" stroke-width="5"/><circle cx="50" cy="50" r="14" fill="#2f5d8a"/></svg>` },
    ], ans: 0 },
  { dim: 'spatial', text: '圆点数量依次递增，问号处应是：', figure: `<div class="fig-row">${SVG_DOTS(1)}${SVG_DOTS(2)}${SVG_DOTS(3)}<div class="fig-q">?</div></div>`,
    opts: [{ svg: SVG_DOTS(4) }, { svg: SVG_DOTS(5) }, { svg: SVG_DOTS(6) }, { svg: SVG_DOTS(3) }], ans: 0 },
  { dim: 'spatial', text: '下图中每一行都按「圆 → 三角 → 方」循环排列，问号处应填：',
    figure: `<div class="fig-grid">${SVG_CIR}${SVG_TRI}${SVG_SQR}${SVG_TRI}${SVG_SQR}${SVG_CIR}${SVG_SQR}${SVG_CIR}<div class="fig-q2">?</div></div>`,
    opts: [{ svg: SVG_CIR }, { svg: SVG_TRI }, { svg: SVG_SQR }, { svg: SVG_DOTS(3) }], ans: 1 },
  { dim: 'spatial', text: '把下图折成正方体（字母在外侧），与 A 面相对的是哪一面？',
    figure: `<div class="fig-row"><svg viewBox="0 0 120 200" class="fig-svg tall"><g stroke="#2f5d8a" stroke-width="3" fill="#fff"><rect x="35" y="10" width="50" height="50"/><rect x="35" y="60" width="50" height="50"/><rect x="35" y="110" width="50" height="50"/><rect x="35" y="160" width="50" height="50"/><rect x="85" y="60" width="50" height="50"/></g><g font-size="26" text-anchor="middle" fill="#2f5d8a" font-family="serif"><text x="60" y="45">B</text><text x="60" y="95">A</text><text x="60" y="145">C</text><text x="60" y="195">D</text><text x="110" y="95">E</text></g></svg></div>`,
    opts: ['B 面', 'C 面', 'D 面', 'E 面'], ans: 2 },
  { dim: 'spatial', text: '方格中的黑白块按规律排列，右下角应填：',
    figure: `<div class="fig-grid">${SVG_SQR}${SVG_CIR}${SVG_TRI}${SVG_CIR}${SVG_TRI}${SVG_SQR}${SVG_TRI}${SVG_SQR}<div class="fig-q2">?</div></div>`,
    opts: [{ svg: SVG_TRI }, { svg: SVG_CIR }, { svg: SVG_SQR }, { svg: SVG_DOTS(2) }], ans: 1 },

  // ---------- 细节洞察 8 ----------
  { dim: 'detail', text: '对比两个字符串：8362517 与 8362571，它们从第几位开始不同？',
    opts: ['第 3 位', '第 4 位', '第 5 位', '第 6 位'], ans: 2 },
  { dim: 'detail', text: '下面这段文字中，"的"字出现了几次？<br><span class="q-inline">秋天的风把窗外的梧桐叶吹得沙沙作响，桌上的咖啡凉了，她的心事还没说完。</span>',
    opts: ['2 次', '3 次', '4 次', '5 次'], ans: 2 },
  { dim: 'detail', text: '下列四个词中，哪一个与其他三个不属于同一类？',
    opts: ['铅笔', '橡皮', '尺子', '书本'], ans: 3 },
  { dim: 'detail', text: '在这组数字中，哪一个数字出现了两次：4 7 9 2 7 5 8 3',
    opts: ['4', '7', '9', '5'], ans: 1 },
  { dim: 'detail', text: '请数一数，下面一排符号中共有几个三角形：<br><span class="q-sym">△ ○ △ □ △ ◇ △ ○ △</span>',
    opts: ['3 个', '4 个', '5 个', '6 个'], ans: 2 },
  { dim: 'detail', text: '「除了小王，其他人都通过了考核。」这句话说明：',
    opts: ['小王通过了', '只有小王没通过', '所有人都没通过', '只有小王通过了'], ans: 1 },
  { dim: 'detail', text: '下列句子中没有错别字的一项是：',
    opts: ['他按步就班地完成了工作', '这件事情迫在眉捷', '她一丝不苟地核对了数据', '他们对此不以为燃，坚持己见'], ans: 2 },
  { dim: 'detail', text: '把 1—9 九个数字填入九宫格，每行每列及对角线之和相等。若已有数字：<br><span class="q-inline">8 · 1 ／ · 5 · ／ · 7 ·</span> 那么中心格应填：',
    opts: ['4', '5', '6', '9'], ans: 1 },
];
