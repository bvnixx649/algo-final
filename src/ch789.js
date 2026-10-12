/* ---------- shared drawing helpers ---------- */
const legend = items => `<div class="legend">${items.map(([c, l, sh]) => `<span><i class="${sh || ''}" style="--c:${c}"></i>${l}</span>`).join('')}</div>`;
const L_ACC = 'var(--accent)', L_INK = 'var(--ink)', L_GOOD = 'var(--good)', L_BAD = 'var(--bad)', L_BASE = 'var(--panel-ink)';

function stepper(el, frames, render, opts = {}) {
  el.insertAdjacentHTML('beforeend', `<div class="stage"></div>${opts.legend || ''}<div class="cap step"><span class="ico"></span><span class="ct"></span></div><div class="stepbar"><button class="btn small sb-back" aria-label="ขั้นก่อนหน้า">←</button><button class="btn small primary sb-next">ถัดไป</button><span class="count"></span></div>`);
  const st = el.querySelector('.stage'), ct = el.querySelector('.ct'), ico = el.querySelector('.ico'), bk = el.querySelector('.sb-back'), fw = el.querySelector('.sb-next'), cn = el.querySelector('.count');
  let i = 0;
  const draw = () => {
    const f = frames[i];
    st.innerHTML = render(f, i) || '';
    const fin = f.done === true || f.found === true || f.fin === true;
    ct.innerHTML = f.cap; ico.textContent = fin ? '✓' : i + 1;
    ico.classList.toggle('fin', fin);
    cn.textContent = `${i + 1}/${frames.length}`; bk.disabled = i === 0;
    fw.textContent = i === frames.length - 1 ? 'เริ่มใหม่' : 'ถัดไป';
    if (opts.after) opts.after(st, f);
  };
  bk.onclick = () => { i--; draw(); };
  fw.onclick = () => { i = i === frames.length - 1 ? 0 : i + 1; draw(); };
  draw();
  return { set(fs) { frames = fs; i = 0; draw(); } };
}
const fromFrames = (q, frames, pre = []) => ({ q, lines: [...pre, ...frames.filter(f => f.w).map(f => ({ t: f.w, n: f.n }))] });

function graphSVG(G, st = {}) {
  const r = 22, [W, H] = G.vb, col = { tree: 'var(--accent)', now: 'var(--ink)', rej: 'var(--bad)', cand: 'var(--ink)', base: 'var(--panel-ink)' };
  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${G.label || 'กราฟ'}"><defs>${Object.entries(col).map(([k, c]) => `<marker id="mk-${k}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="10" markerHeight="10" markerUnits="userSpaceOnUse" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="${c}"/></marker>`).join('')}</defs>`;
  G.E.forEach(([u, v, w]) => {
    const k = st.edge ? st.edge(u, v) || 'base' : 'base';
    let [x1, y1] = G.pos[u], [x2, y2] = G.pos[v];
    if (G.directed) { const d = Math.hypot(x2 - x1, y2 - y1); x1 += (x2 - x1) / d * r; y1 += (y2 - y1) / d * r; x2 -= (x2 - x1) / d * (r + 2); y2 -= (y2 - y1) / d * (r + 2); }
    const sw = k === 'tree' || k === 'now' ? 4 : k === 'rej' ? 2.5 : k === 'cand' ? 2.2 : 1.8, op = k === 'base' ? .4 : 1;
    s += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${col[k]}" stroke-width="${sw}" stroke-opacity="${op}"${k === 'rej' || k === 'cand' ? ' stroke-dasharray="7 6"' : ''}${G.directed ? ` marker-end="url(#mk-${k})"` : ''}/>`;
    if (w != null) { const mx = (G.pos[u][0] + G.pos[v][0]) / 2, my = (G.pos[u][1] + G.pos[v][1]) / 2; s += `<circle cx="${mx}" cy="${my}" r="13" fill="var(--panel)"/><text x="${mx}" y="${my + 5}" text-anchor="middle" font-size="14" font-weight="600" style="fill:${k === 'base' ? 'var(--panel-ink)' : col[k]}">${w}</text>`; }
  });
  Object.entries(G.pos).forEach(([v, [x, y]]) => {
    const k = st.node ? st.node(v) || 'base' : 'base';
    const fill = k === 'in' ? 'var(--accent)' : 'var(--bg)', stroke = k === 'now' ? 'var(--ink)' : k === 'in' ? 'var(--accent)' : 'var(--panel-ink)';
    s += `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${k === 'now' ? 3.5 : 1.6}" stroke-opacity="${k === 'base' ? .55 : 1}"/><text x="${x}" y="${y + 6}" text-anchor="middle" font-size="17" font-weight="700" style="fill:${k === 'in' ? 'var(--on-accent)' : 'var(--ink)'}">${v}</text>`;
    const lab = st.label ? st.label(v) : null;
    if (lab != null) { const dy = (G.labPos && G.labPos[v] === 'up') ? -36 : 44; s += `<text x="${x}" y="${y + dy}" text-anchor="middle" font-size="15" font-weight="700" style="fill:var(--accent);font-family:var(--mono)">${lab}</text>`; }
  });
  return s + '</svg>';
}
function matrixHTML(M, V, o = {}) {
  const fmt = x => (x === Infinity ? '∞' : x);
  return `<table class="mx"><tr><th></th>${V.map((v, j) => `<th class="${o.k === j ? 'kh' : ''}">${v}</th>`).join('')}</tr>${M.map((r, i) => `<tr><th class="${o.k === i ? 'kh' : ''}">${V[i]}</th>${r.map((x, j) => {
    const ch = (o.ch || []).some(c => c[0] === i && c[1] === j), k = o.k === i || o.k === j;
    return `<td class="${ch ? 'ch' : k ? 'k' : ''}">${fmt(x)}</td>`;
  }).join('')}</tr>`).join('')}</table>`;
}
const cell = (v, cls = '', top = '') => `<span class="cl ${cls}">${top !== '' ? `<small>${top}</small>` : ''}${v}</span>`;

/* ---------- week 7 visuals ---------- */
Object.assign(VIZ, {
  tradeoff(el) {
    const items = [['Counting sort', 1], ['Horspool', 1], ['Boyer-Moore', 1], ['Hashing', 0], ['B-Tree', 0]];
    el.innerHTML = `<div class="flip three">${items.map(([t], i) => `<button class="flipc" data-i="${i}"><span>${t}</span><small>แตะเพื่อดูกลุ่ม</small></button>`).join('')}</div>${legend([[L_ACC, 'Input enhancement: เตรียมข้อมูลจาก input ไว้ก่อน'], [L_INK, 'Prestructuring: จัดโครงสร้างไว้ให้เข้าถึงเร็ว']])}`;
    el.querySelectorAll('.flipc').forEach(b => b.onclick = () => { const d = items[b.dataset.i][1]; b.classList.add(d ? 'grpA' : 'grpB'); b.querySelector('small').textContent = d ? 'Input enhancement' : 'Prestructuring'; });
  },
  counting(el) {
    const A = [13, 11, 12, 13, 12, 12], l = 11;
    stepper(el, A7.distCount(A, 11, 13), f => `<div class="rows">
      <div class="rw"><span class="rl">A</span><div class="cells">${f.A.map((v, i) => cell(v, f.ai === i ? 'ring' : '', i)).join('')}</div></div>
      <div class="rw"><span class="rl">${f.dist ? 'D' : 'นับ'}</span><div class="cells">${f.cnt.map((v, j) => cell(v, f.hc === j ? 'hi' : '', l + j)).join('')}</div></div>
      <div class="rw"><span class="rl">S</span><div class="cells">${f.S.map((v, i) => cell(v ?? '', f.hs === i ? 'hi' : v != null ? 'ok' : 'empty', i)).join('')}</div></div></div>`,
      { legend: legend([[L_INK, 'ตัวที่กำลังอ่าน', 'ring'], [L_ACC, 'ช่องที่เพิ่งเปลี่ยน'], [L_GOOD, 'วางใน S แล้ว']]) });
  },
  horspool(el) {
    const pat = 'BARBER', text = 'JIM_SAW_ME_IN_A_BARBERSHOP', t = A7.shiftTable(pat);
    el.innerHTML = `<div class="sub">shift table ของ ${pat} (m = 6)</div><div class="cells">${[...'ABER'].map(c => cell(t[c], 'hi', c)).join('')}${cell(6, '', 'ตัวอื่น')}</div><div class="sub" style="margin-top:18px">ค้นใน text</div>`;
    stepper(el, A7.horspoolFrames(text, pat), f => alignRows(text, pat, f), { legend: legend([[L_GOOD, 'ตรง'], [L_BAD, 'ไม่ตรง'], [L_INK, 'ตัวที่ใช้เปิดตาราง', 'ring']]), after: scrollToPat });
  },
  boyer(el) {
    const pat = 'BAOBAB', text = 'BESS_KNEW_ABOUT_BAOBABS', t1 = A7.shiftTable(pat), d2 = A7.bmD2(pat);
    el.innerHTML = `<div class="duo2"><div><div class="sub">t₁ (bad-symbol)</div><div class="cells">${Object.keys(t1).sort().map(c => cell(t1[c], 'hi', c)).join('')}${cell(6, '', 'อื่น')}</div></div><div><div class="sub">d₂ (good-suffix)</div><div class="cells">${Object.keys(d2).map(k => cell(d2[k], 'hi', 'k=' + k)).join('')}</div></div></div><div class="sub" style="margin-top:18px">ค้นใน text</div>`;
    stepper(el, A7.bmFrames(text, pat), f => alignRows(text, pat, f, true), { legend: legend([[L_GOOD, 'ตรง (k ตัว)'], [L_BAD, 'ตัวที่ไม่ตรง c']]), after: scrollToPat });
  },
  hashing(el) {
    const words = 'A FOOL AND HIS MONEY ARE SOON PARTED'.split(' ');
    el.innerHTML = `<div class="chips"><button class="chip" aria-pressed="true" data-m="open">Separate chaining</button><button class="chip" aria-pressed="false" data-m="closed">Linear probing</button></div>`;
    const render = f => `<div class="scrollx"><div class="hgrid">${f.T.map((x, k) => `<div class="hcol"><span class="hix${f.slot === k ? ' on' : ''}">${k}</span>${(Array.isArray(x) ? x : x ? [x] : []).map(w => `<span class="hw${w === f.word ? ' hi' : ''}">${w}</span>`).join('')}${(f.bad || []).includes(k) ? '<span class="hw bad">ชน</span>' : ''}</div>`).join('')}</div></div>`;
    const sp = stepper(el, A7.hashFrames(words, 'open'), render, { legend: legend([[L_ACC, 'key ที่เพิ่งใส่'], [L_BAD, 'ช่องที่ชน']]) });
    el.querySelectorAll('.chip').forEach(b => b.onclick = () => { el.querySelectorAll('.chip').forEach(x => x.setAttribute('aria-pressed', x === b)); sp.set(A7.hashFrames(words, b.dataset.m)); });
  },
  btree(el) {
    let t = A7.btreeStart(); const fr = [{ root: t, hl: [], cap: 'B-tree order 4 จากสไลด์ ข้อมูลอยู่ที่ใบ แต่ละ node มีได้ไม่เกิน 3 key' }];
    for (const k of [65, 5, 6, 8, 9]) { const r = A7.btreeInsert(t, k); t = r.root; r.frames[0].cap = `<b>ใส่ ${k}</b> ` + r.frames[0].cap; fr.push(...r.frames); }
    fr[fr.length - 1].done = true;
    stepper(el, fr, f => `<div class="scrollx">${treeSVG(f.root, f.hl)}</div>`, { legend: legend([[L_ACC, 'node ที่เกี่ยวข้องในขั้นนี้']]), after: st => { const sx = st.querySelector('.scrollx'), hx = +st.querySelector('svg').dataset.hx; if (sx && hx >= 0) sx.scrollLeft = Math.max(0, hx - sx.clientWidth / 2); } });
  },
});
function alignRows(text, pat, f, bm) {
  const ok = new Map(f.cmp.map(([i, o]) => [i, o]));
  const row1 = [...text].map((c, i) => cell(c, ok.has(i) ? (ok.get(i) ? 'ok' : 'bad') : f.c === i ? 'ring' : '', i)).join('');
  const row2 = Array(f.pos).fill('<span class="cl gap"></span>').join('') + [...pat].map((c, j) => { const ti = f.pos + j; return cell(c, ok.has(ti) ? (ok.get(ti) ? 'ok' : 'bad') : 'pat'); }).join('');
  return `<div class="scrollx sm"><div class="cells nowrap">${row1}</div><div class="cells nowrap">${row2}</div></div>`;
}
function scrollToPat(st, f) { const sx = st.querySelector('.scrollx'); if (sx) sx.scrollLeft = Math.max(0, f.pos * 32 - 40); }
function treeSVG(root, hl = []) {
  const lay = [], kw = 30, gap = 14; let x = 10, maxD = 0;
  const place = (nd, d) => {
    const w = nd.keys.length * kw + 8; maxD = Math.max(maxD, d);
    if (nd.leaf) { const o = { nd, d, x, w }; x += w + gap; lay.push(o); return o; }
    const kids = nd.kids.map(k => place(k, d + 1));
    const cx = (kids[0].x + kids[kids.length - 1].x + kids[kids.length - 1].w) / 2;
    const o = { nd, d, x: cx - w / 2, w, kids }; lay.push(o); return o;
  };
  place(root, 0);
  const W = Math.max(x, 320), H = maxD * 78 + 50, y = d => 10 + d * 78;
  const hls = lay.filter(o => hl.includes(o.nd.id)), hx = hls.length ? (Math.min(...hls.map(o => o.x)) + Math.max(...hls.map(o => o.x + o.w))) / 2 : -1;
  let s = `<svg viewBox="0 0 ${W} ${H}" width="${W}" data-hx="${hx}" style="width:${W}px;max-width:none">`;
  lay.forEach(o => (o.kids || []).forEach(k => { s += `<line x1="${o.x + o.w / 2}" y1="${y(o.d) + 32}" x2="${k.x + k.w / 2}" y2="${y(k.d)}" stroke="var(--panel-ink)" stroke-opacity=".5" stroke-width="1.5"/>`; }));
  lay.forEach(o => {
    const on = hl.includes(o.nd.id);
    s += `<rect x="${o.x}" y="${y(o.d)}" width="${o.w}" height="32" rx="8" fill="${on ? 'var(--accent)' : 'var(--bg)'}" stroke="${on ? 'var(--accent)' : 'var(--panel-ink)'}" stroke-opacity="${on ? 1 : .5}"/>`;
    o.nd.keys.forEach((k, i) => { s += `<text x="${o.x + 4 + i * kw + kw / 2}" y="${y(o.d) + 21}" text-anchor="middle" font-size="14" font-weight="600" style="fill:${on ? 'var(--on-accent)' : 'var(--ink)'};font-family:var(--mono)">${k}</text>`; });
  });
  return s + '</svg>';
}

/* ---------- week 8 visuals ---------- */
Object.assign(VIZ, {
  fib(el) {
    el.innerHTML = `<div class="chips"><button class="chip" aria-pressed="true" data-m="0">Recursion ตรงๆ</button><button class="chip" aria-pressed="false" data-m="1">Memoization</button></div><div class="stage"></div>${legend([[L_ACC, 'คำนวณจริง'], [L_BAD, 'คำนวณซ้ำ'], [L_BASE, 'ดึงค่าที่จำไว้', 'ringd']])}<div class="cap"><span class="ct"></span></div>`;
    const draw = memo => {
      const root = A7.fibTree(5, memo), lay = []; let x = 0;
      const place = (nd, d) => { if (!nd.kids.length) { const o = { nd, d, x: x++ }; lay.push(o); return o; } const ks = nd.kids.map(k => place(k, d + 1)); const o = { nd, d, x: (ks[0].x + ks[ks.length - 1].x) / 2, ks }; lay.push(o); return o; };
      place(root, 0);
      const W = 560, sx = (W - 60) / Math.max(1, x - 1), px = o => 30 + o.x * sx, py = o => 28 + o.d * 62;
      const seenK = new Set(), rep = new Set();
      const dfs = nd => { if (seenK.has(nd.k) && !nd.lookup) rep.add(nd.id); seenK.add(nd.k); nd.kids.forEach(dfs); };
      dfs(root);
      let s = `<svg viewBox="0 0 ${W} ${py({ d: 5 }) + 10}">`;
      lay.forEach(o => (o.ks || []).forEach(k => { s += `<line x1="${px(o)}" y1="${py(o)}" x2="${px(k)}" y2="${py(k)}" stroke="var(--panel-ink)" stroke-opacity=".45" stroke-width="1.5"/>`; }));
      lay.forEach(o => {
        const n = o.nd, kind = n.lookup ? 'lk' : rep.has(n.id) ? 'rep' : 'ok';
        s += `<circle cx="${px(o)}" cy="${py(o)}" r="19" fill="${kind === 'ok' ? 'var(--accent)' : kind === 'rep' ? 'var(--bad)' : 'var(--bg)'}" stroke="${kind === 'lk' ? 'var(--panel-ink)' : 'none'}" stroke-dasharray="4 3" stroke-width="1.6"/><text x="${px(o)}" y="${py(o) + 5}" text-anchor="middle" font-size="13" font-weight="700" style="fill:${kind === 'lk' ? 'var(--ink)' : '#fff'};font-family:var(--mono)">f${n.k}</text>`;
      });
      el.querySelector('.stage').innerHTML = s + '</svg>';
      el.querySelector('.ct').innerHTML = memo ? `เรียกฟังก์ชัน <b>${lay.length} ครั้ง</b> แต่ละ f(k) คำนวณครั้งเดียว ครั้งต่อไปดึงจากตาราง <b>O(n)</b>` : `เรียกฟังก์ชัน <b>${lay.length} ครั้ง</b> สีแดงคือคำนวณ f(k) ที่เคยคำนวณแล้วซ้ำอีก โตแบบ <b>O(2ⁿ)</b>`;
    };
    el.querySelectorAll('.chip').forEach(b => b.onclick = () => { el.querySelectorAll('.chip').forEach(x => x.setAttribute('aria-pressed', x === b)); draw(b.dataset.m === '1'); });
    draw(false);
  },
  coinrow(el) {
    const c = [5, 1, 2, 10, 6, 2];
    stepper(el, A7.coinRowFrames(c), f => `<div class="rows"><div class="rw"><span class="rl">c</span><div class="cells">${cell('', 'gap', 0)}${c.map((v, k) => cell(v, f.pick && f.pick.includes(k + 1) ? 'hi' : f.i === k + 1 ? 'ring' : '', k + 1)).join('')}</div></div>
      <div class="rw"><span class="rl">F</span><div class="cells">${Array.from({ length: c.length + 1 }, (_, k) => cell(f.F[k] ?? '', k === f.i ? 'hi' : f.i && !f.done && (k === f.i - 1 || k === f.i - 2) ? 'src' : f.F[k] != null ? 'ok' : 'empty', k)).join('')}</div></div></div>`,
      { legend: legend([[L_ACC, 'ค่าที่เพิ่งคำนวณ / เหรียญที่เลือก'], [L_INK, 'ค่าที่ใช้คำนวณ', 'ring']]) });
  },
  change(el) {
    const d = [1, 3, 4], n = 6;
    el.innerHTML = `<div class="sub">เหรียญ d = {${d.join(', ')}} จำนวน n = ${n}</div>`;
    stepper(el, A7.changeFrames(d, n), f => `<div class="rows"><div class="rw"><span class="rl">F</span><div class="cells">${Array.from({ length: n + 1 }, (_, k) => cell(f.F[k] ?? '', k === f.i ? 'hi' : (f.from || []).includes(k) && !f.done ? 'src' : f.F[k] != null ? 'ok' : 'empty', k)).join('')}</div></div></div>`,
      { legend: legend([[L_ACC, 'F ที่เพิ่งคำนวณ'], [L_INK, 'F(n − dⱼ) ที่นำมาเทียบ', 'ring']]) });
  },
  collect(el) {
    const C = [[0, 0, 0, 0, 1, 0], [0, 1, 0, 1, 0, 0], [0, 0, 0, 1, 0, 1], [0, 0, 1, 0, 0, 1], [1, 0, 0, 0, 1, 0]];
    stepper(el, A7.collectFrames(C), f => `<table class="grid">${C.map((r, i) => `<tr>${r.map((v, j) => { const onP = f.path && f.path.some(p => p[0] === i && p[1] === j); return `<td class="${onP ? 'path' : f.row === i && !f.done ? 'row' : ''}">${v ? '<i class="coin"></i>' : ''}<b>${f.F[i][j] ?? ''}</b></td>`; }).join('')}</tr>`).join('')}</table>`,
      { legend: legend([[L_ACC, 'เส้นทางที่ดีที่สุด'], ['var(--accent-soft)', 'แถวที่กำลังเติม'], ['#E8A33D', 'เหรียญ', 'dot']]) });
  },
  knap(el) {
    const items = [{ w: 2, v: 12 }, { w: 1, v: 10 }, { w: 3, v: 20 }, { w: 2, v: 15 }], W = 5;
    el.innerHTML = `<div class="sub">กระเป๋าจุ W = ${W}</div><div class="cells">${items.map((it, i) => cell(`${it.w}, ${it.v}`, 'wide', 'ชิ้น ' + (i + 1))).join('')}</div>`;
    stepper(el, A7.knapFrames(items, W), f => {
      const tk = new Set(); if (f.take) { let j = W; for (let i = items.length; i >= 1; i--) { tk.add(i + ',' + j); if (f.take.includes(i)) j -= items[i - 1].w; } tk.add('0,' + j); }
      return `<div class="scrollx"><table class="mx kn"><tr><th>i \\ j</th>${Array.from({ length: W + 1 }, (_, j) => `<th>${j}</th>`).join('')}</tr>${f.V.map((r, i) => `<tr><th>${i}${i ? `<small> w${i}=${items[i - 1].w} v${i}=${items[i - 1].v}</small>` : ''}</th>${r.map((x, j) => `<td class="${tk.has(i + ',' + j) ? (f.take.includes(i) ? 'ch' : 'k') : i === f.row && !f.done ? 'k' : ''}">${i <= f.row || f.done ? x : ''}</td>`).join('')}</tr>`).join('')}</table></div>`;
    }, { legend: legend([['var(--accent-soft)', 'แถวที่กำลังเติม / เส้นย้อนรอย'], [L_ACC, 'ช่องที่หยิบของชิ้นนั้น']]) });
  },
  warshall(el) { closureViz(el, 'w'); },
  floyd(el) { closureViz(el, 'f'); },
  lcs(el) {
    const X = 'ABCBDAB', Y = 'BDCABA';
    stepper(el, A7.lcsFrames(X, Y), f => `<div class="scrollx"><table class="mx"><tr><th></th><th>ε</th>${[...Y].map(c => `<th>${c}</th>`).join('')}</tr>${f.L.map((r, i) => `<tr><th>${i ? X[i - 1] : 'ε'}</th>${r.map((x, j) => `<td class="${i === f.row && (f.mt || []).includes(j) ? 'ch' : i === f.row ? 'k' : f.done && i === X.length && j === Y.length ? 'ch' : ''}">${i <= f.row || f.done ? x : ''}</td>`).join('')}</tr>`).join('')}</table></div>`,
      { legend: legend([[L_ACC, 'ตัวอักษรตรงกัน: ทแยง + 1'], ['var(--accent-soft)', 'แถวที่กำลังเติม']]) });
  },
});
const CL_V = ['a', 'b', 'c', 'd'];
const CL_G = {
  w: { vb: [360, 290], directed: true, pos: { a: [70, 55], b: [290, 55], c: [70, 235], d: [290, 235] }, E: [['a', 'b', null], ['b', 'd', null], ['d', 'a', null], ['d', 'c', null]] },
  f: { vb: [360, 290], directed: true, pos: { a: [70, 55], b: [290, 55], c: [70, 235], d: [290, 235] }, E: [['a', 'c', 3], ['b', 'a', 2], ['c', 'b', 7], ['c', 'd', 1], ['d', 'a', 6]] },
};
function closureViz(el, kind) {
  const G = CL_G[kind];
  stepper(el, A7.closureFrames(CL_V, G.E, kind), f => `<div class="split"><div>${graphSVG(G, { node: v => (f.k >= 0 && CL_V[f.k] === v ? 'in' : 'base') })}</div><div class="scrollx">${matrixHTML(f.M, CL_V, { k: f.k, ch: f.ch })}</div></div>`,
    { legend: legend([[L_ACC, 'vertex k ที่อนุญาตให้ผ่าน / ช่องที่เปลี่ยน'], ['var(--accent-soft)', 'แถวและคอลัมน์ k']]) });
}

/* ---------- week 9 visuals ---------- */
const MSTG = { vb: [600, 330], pos: { a: [60, 165], b: [190, 60], c: [410, 60], d: [540, 165], e: [300, 285], f: [300, 165] }, E: [['a', 'b', 3], ['a', 'e', 6], ['a', 'f', 5], ['b', 'c', 1], ['b', 'f', 4], ['c', 'f', 4], ['c', 'd', 6], ['d', 'f', 5], ['d', 'e', 8], ['e', 'f', 2]] };
const DJG = { vb: [560, 270], pos: { a: [50, 190], b: [170, 75], c: [400, 75], d: [290, 190], e: [510, 190] }, labPos: { b: 'up', c: 'up' }, E: [['a', 'b', 3], ['a', 'd', 7], ['b', 'c', 4], ['b', 'd', 2], ['c', 'd', 5], ['c', 'e', 6], ['d', 'e', 4]] };
const ekey = (u, v) => [u, v].sort().join('');
Object.assign(VIZ, {
  greedycoin(el) {
    el.innerHTML = `<div class="sub">ทอนเงิน 6 ด้วยเหรียญ {1, 3, 4}</div><div class="chips"><button class="chip" aria-pressed="true" data-m="g">Greedy</button><button class="chip" aria-pressed="false" data-m="o">คำตอบที่ดีที่สุด (DP)</button></div><div class="coins"></div><div class="cap"><span class="ct"></span></div>`;
    const draw = g => {
      const cs = g ? [4, 1, 1] : [3, 3];
      el.querySelector('.coins').innerHTML = cs.map(c => `<span class="cn ${g ? 'g' : 'o'}">${c}</span>`).join('');
      el.querySelector('.ct').innerHTML = g ? 'Greedy หยิบเหรียญใหญ่สุดที่ไม่เกินก่อน ได้ 4 + 1 + 1 = <b>3 เหรียญ</b> ซึ่งไม่ใช่คำตอบที่ดีที่สุด' : '3 + 3 ใช้แค่ <b>2 เหรียญ</b> greedy มองแค่ขั้นปัจจุบันจึงพลาด';
    };
    el.querySelectorAll('.chip').forEach(b => b.onclick = () => { el.querySelectorAll('.chip').forEach(x => x.setAttribute('aria-pressed', x === b)); draw(b.dataset.m === 'g'); });
    draw(true);
  },
  prim(el) {
    stepper(el, A7.primFrames(MSTG, 'a'), f => graphSVG(MSTG, { node: v => (f.inT.includes(v) ? 'in' : 'base'), edge: (u, v) => { const k = ekey(u, v); return k === f.now ? 'now' : f.tree.includes(k) ? 'tree' : (f.cand || []).includes(k) ? 'cand' : 'base'; } }),
      { legend: legend([[L_ACC, 'อยู่ในต้นไม้แล้ว'], [L_INK, 'เส้นที่เลือกขั้นนี้', 'line'], [L_INK, 'เส้นที่ข้ามออกจากต้นไม้ (ตัวเลือก)', 'dash']]) });
  },
  kruskal(el) {
    stepper(el, A7.kruskalFrames(MSTG), f => `<div class="elist">${f.order.map(([u, v, w]) => { const k = ekey(u, v); return `<span class="${f.status[k] || ''}${f.now === k ? ' now' : ''}">${u}${v} <b>${w}</b></span>`; }).join('')}</div>` + graphSVG(MSTG, { node: v => (f.tree.some(k => k.includes(v)) ? 'in' : 'base'), edge: (u, v) => { const k = ekey(u, v); return f.now === k && f.status[k] === 'rej' ? 'rej' : f.now === k ? 'now' : f.tree.includes(k) ? 'tree' : 'base'; } }),
      { legend: legend([[L_ACC, 'รับเข้า MST', 'line'], [L_BAD, 'ทิ้ง เพราะเกิด cycle', 'dash'], [L_INK, 'เส้นที่พิจารณาขั้นนี้', 'line']]) });
  },
  dijkstra(el) {
    stepper(el, A7.dijkstraFrames(DJG, 'a'), f => graphSVG(DJG, { node: v => (v === f.now && !f.fin ? 'now' : f.done.includes(v) ? 'in' : 'base'), label: v => (f.dist[v] === Infinity ? '∞' : f.dist[v]), edge: (u, v) => (f.prev[v] === u || f.prev[u] === v ? 'tree' : 'base') }) +
      `<div class="cells">${Object.keys(DJG.pos).map(v => cell(f.dist[v] === Infinity ? '∞' : f.dist[v], f.done.includes(v) ? 'ok' : v === f.now ? 'hi' : '', v)).join('')}</div>`,
      { legend: legend([[L_ACC, 'ปิดแล้ว (ระยะสุดท้าย)'], [L_INK, 'เลือกในขั้นนี้', 'ring'], [L_ACC, 'เส้นทางสั้นสุดที่รู้ตอนนี้', 'line']]) });
  },
  activity(el) {
    const acts = [[1, 4], [3, 5], [0, 6], [5, 7], [3, 8], [5, 9], [6, 10], [8, 11]], T = 12;
    stepper(el, A7.activityFrames(acts), f => {
      const W = 560, x = t => 30 + t * (W - 50) / T, rh = 30;
      let s = `<svg viewBox="0 0 ${W} ${f.A.length * rh + 40}">`;
      for (let t = 0; t <= T; t++) s += `<line x1="${x(t)}" y1="8" x2="${x(t)}" y2="${f.A.length * rh + 12}" stroke="var(--panel-ink)" stroke-opacity=".12"/><text x="${x(t)}" y="${f.A.length * rh + 32}" text-anchor="middle" font-size="12" style="fill:var(--panel-ink);font-family:var(--mono)">${t}</text>`;
      f.A.forEach((a, k) => {
        const on = f.pick.includes(k), seen = f.now != null && k <= f.now, cur = f.now === k;
        const fill = on ? 'var(--accent)' : seen ? 'var(--bad)' : 'var(--panel-ink)', op = on ? 1 : seen ? .35 : .25;
        s += `<rect x="${x(a.s)}" y="${12 + k * rh}" width="${x(a.f) - x(a.s)}" height="${rh - 10}" rx="6" fill="${fill}" fill-opacity="${op}" stroke="${cur ? 'var(--ink)' : 'none'}" stroke-width="2.5"/><text x="${x(a.f) + 6}" y="${12 + k * rh + 15}" font-size="12" style="fill:var(--ink);font-family:var(--mono)">(${a.s},${a.f})</text>`;
      });
      return s + '</svg>';
    }, { legend: legend([[L_ACC, 'เลือก'], [L_BAD, 'ข้าม (ทับเวลา)'], [L_INK, 'กำลังพิจารณา', 'ring']]) });
  },
  frac(el) {
    const items = [{ v: 60, w: 10 }, { v: 100, w: 20 }, { v: 120, w: 30 }], W = 50, shades = [1, .7, .45];
    stepper(el, A7.fracFrames(items, W), f => {
      let acc = 0;
      const segs = f.A.map((a, k) => { const t = f.take[k] || 0, wd = a.w * t / W * 100; const s = t ? `<span class="seg" style="width:${wd}%;opacity:${shades[k]}">${t === 1 ? `${a.v}` : `${a.v * t}`}</span>` : ''; acc += wd; return s; }).join('');
      return `<div class="cells">${f.A.map((a, k) => cell(`${a.v}/${a.w}`, f.take[k] ? 'hi' : '', `v/w = ${a.r}`)).join('')}</div><div class="cap50"><div class="bar50">${segs}</div><div class="axis50"><span>0</span><span>W = ${W}</span></div></div>`;
    }, { legend: legend([[L_ACC, 'ส่วนที่ใส่ในกระเป๋า (ตัวเลขคือมูลค่าที่ได้)']]) });
  },
  huffman(el) {
    const F = [['A', 0.35], ['B', 0.1], ['C', 0.2], ['D', 0.2], ['_', 0.15]];
    stepper(el, A7.huffmanFrames(F), f => f.tree ? huffSVG(f.tree, f.codes) : `<div class="hq">${f.q.slice().sort((a, b) => a.w - b.w).map(t => `<span class="${t.id === f.now ? 'now' : ''}"><b>${t.leaf ? t.s : '{' + t.s.split('').join(',') + '}'}</b>${t.w}</span>`).join('')}</div>`,
      { legend: legend([[L_ACC, 'ต้นที่เพิ่งรวม']]) });
  },
});
function huffSVG(root, codes) {
  const lay = []; let x = 0;
  const place = (nd, d) => { if (nd.leaf) { const o = { nd, d, x: x++ }; lay.push(o); return o; } const ks = nd.kids.map(k => place(k, d + 1)); const o = { nd, d, x: (ks[0].x + ks[1].x) / 2, ks }; lay.push(o); return o; };
  place(root, 0);
  const W = 560, depth = Math.max(...lay.map(o => o.d)), px = o => 50 + o.x * (W - 100) / (x - 1), py = o => 30 + o.d * 70;
  let s = `<svg viewBox="0 0 ${W} ${depth * 70 + 90}">`;
  lay.forEach(o => (o.ks || []).forEach((k, i) => { s += `<line x1="${px(o)}" y1="${py(o)}" x2="${px(k)}" y2="${py(k)}" stroke="var(--accent)" stroke-width="2"/><text x="${(px(o) + px(k)) / 2 + (i ? 10 : -10)}" y="${(py(o) + py(k)) / 2}" text-anchor="middle" font-size="14" font-weight="700" style="fill:var(--accent);font-family:var(--mono)">${i}</text>`; }));
  lay.forEach(o => {
    const n = o.nd;
    s += `<circle cx="${px(o)}" cy="${py(o)}" r="20" fill="${n.leaf ? 'var(--accent)' : 'var(--bg)'}" stroke="var(--accent)" stroke-width="1.6"/><text x="${px(o)}" y="${py(o) + 5}" text-anchor="middle" font-size="${n.leaf ? 15 : 12}" font-weight="700" style="fill:${n.leaf ? 'var(--on-accent)' : 'var(--ink)'}">${n.leaf ? n.s : n.w}</text>`;
    if (n.leaf) s += `<text x="${px(o)}" y="${py(o) + 42}" text-anchor="middle" font-size="14" font-weight="700" style="fill:var(--ink);font-family:var(--mono)">${codes[n.s]}</text>`;
  });
  return s + '</svg>';
}

/* ---------- worked answers built from the same frames ---------- */
Object.assign(WORK, {
  counting: fromFrames('จงเรียง A = [13, 11, 12, 13, 12, 12] ด้วย distribution counting แสดงตารางความถี่ ค่าสะสม และการวาง', A7.distCount([13, 11, 12, 13, 12, 12], 11, 13)),
  horspool: fromFrames('จงสร้าง shift table ของ BARBER แล้วค้นหาใน JIM_SAW_ME_IN_A_BARBERSHOP ด้วย Horspool', A7.horspoolFrames('JIM_SAW_ME_IN_A_BARBERSHOP', 'BARBER'), [{ t: 'm = 6 ดู 5 ตัวแรก BARBE: t(B) = 2, t(A) = 4, t(R) = 3, t(E) = 1, ตัวอื่น = 6', n: 'B ตัวขวาสุดใน 5 ตัวแรกอยู่ห่างตัวท้าย 2 ช่อง' }]),
  boyer: fromFrames('จงค้นหา BAOBAB ใน BESS_KNEW_ABOUT_BAOBABS ด้วย Boyer-Moore', A7.bmFrames('BESS_KNEW_ABOUT_BAOBABS', 'BAOBAB'), [{ t: 't₁: A = 1, B = 2, O = 3, ตัวอื่น = 6' }, { t: 'd₂: k=1 → 2, k=2 → 5, k=3 → 5, k=4 → 5, k=5 → 5' }]),
  hashing: fromFrames('จงใส่คำ A FOOL AND HIS MONEY ARE SOON PARTED ลงตาราง 13 ช่องด้วย linear probing เมื่อ h(K) = ผลรวมลำดับตัวอักษร mod 13', A7.hashFrames('A FOOL AND HIS MONEY ARE SOON PARTED'.split(' '), 'closed')),
  btree: fromFrames('จงใส่ 65 และ 5 ลงใน B-tree order 4 ตามรูปในสไลด์', [...A7.btreeInsert(A7.btreeStart(), 65).frames, ...(() => { let t = A7.btreeInsert(A7.btreeStart(), 65).root; return A7.btreeInsert(t, 5).frames; })()]),
  coinrow: fromFrames('Coin-row: เหรียญ 5, 1, 2, 10, 6, 2 ห้ามหยิบติดกัน จงหามูลค่ารวมสูงสุดและเหรียญที่เลือก', A7.coinRowFrames([5, 1, 2, 10, 6, 2])),
  change: fromFrames('Change-making: เหรียญ {1, 3, 4} จงหาจำนวนเหรียญน้อยที่สุดที่รวมได้ 6', A7.changeFrames([1, 3, 4], 6)),
  collect: fromFrames('Robot coin collection บนกระดาน 5 × 6 ในสไลด์ จงเติมตาราง F', A7.collectFrames([[0, 0, 0, 0, 1, 0], [0, 1, 0, 1, 0, 0], [0, 0, 0, 1, 0, 1], [0, 0, 1, 0, 0, 1], [1, 0, 0, 0, 1, 0]])),
  knap: fromFrames('0/1 Knapsack: W = 5 ของ (w, v) = (2, 12), (1, 10), (3, 20), (2, 15) จงเติมตาราง V และหาของที่เลือก', A7.knapFrames([{ w: 2, v: 12 }, { w: 1, v: 10 }, { w: 3, v: 20 }, { w: 2, v: 15 }], 5)),
  warshall: fromFrames('จงหา transitive closure ของกราฟ a→b, b→d, d→a, d→c ด้วย Warshall', A7.closureFrames(CL_V, CL_G.w.E, 'w')),
  floyd: fromFrames('จงหา shortest path ทุกคู่ของกราฟ a→c 3, b→a 2, c→b 7, c→d 1, d→a 6 ด้วย Floyd', A7.closureFrames(CL_V, CL_G.f.E, 'f')),
  prim: fromFrames('จงหา MST ของกราฟในสไลด์ด้วย Prim เริ่มที่ a', A7.primFrames(MSTG, 'a')),
  kruskal: fromFrames('จงหา MST ของกราฟเดียวกันด้วย Kruskal', A7.kruskalFrames(MSTG)),
  dijkstra: fromFrames('จงหาระยะสั้นสุดจาก a ไปทุก vertex ด้วย Dijkstra', A7.dijkstraFrames(DJG, 'a')),
  activity: fromFrames('Activity selection: (1,4) (3,5) (0,6) (5,7) (3,8) (5,9) (6,10) (8,11) จงเลือกกิจกรรมให้ได้มากที่สุด', A7.activityFrames([[1, 4], [3, 5], [0, 6], [5, 7], [3, 8], [5, 9], [6, 10], [8, 11]])),
  frac: fromFrames('Fractional knapsack: W = 50 ของ (v, w) = (60, 10), (100, 20), (120, 30)', A7.fracFrames([{ v: 60, w: 10 }, { v: 100, w: 20 }, { v: 120, w: 30 }], 50)),
  huffman: fromFrames('จงสร้าง Huffman code ของ A 0.35, B 0.1, C 0.2, D 0.2, _ 0.15 และหาความยาวเฉลี่ย', A7.huffmanFrames([['A', 0.35], ['B', 0.1], ['C', 0.2], ['D', 0.2], ['_', 0.15]])),
});

/* ---------- cards ---------- */
const CARDS7 = [
  { t: 'Space and time trade-offs', s: 'Input enhancement กับ Prestructuring', key: 'ยอมใช้หน่วยความจำเพิ่ม เพื่อให้อัลกอริทึมทำงานเร็วขึ้น', body: 'มีสองแบบ <b>Input enhancement</b> คือเตรียมข้อมูลจาก input เก็บไว้ก่อนแล้วใช้ตอนทำงาน เช่น counting sort, Horspool และ Boyer-Moore ส่วน <b>Prestructuring</b> คือจัดโครงสร้างข้อมูลไว้ล่วงหน้าให้เข้าถึงเร็ว เช่น hashing และ B-tree ถ้าข้อมูลใหญ่มากก็อาจใช้หน่วยความจำเกิน', viz: 'tradeoff' },
  { t: 'Counting sort', s: 'Distribution counting O(n + k)', key: 'Distribution counting นับความถี่ สะสม แล้ววางแต่ละค่าลงตำแหน่งของมัน ใช้เวลา <span class="mono">O(n + k)</span>', body: 'เหมาะกับจำนวนเต็มที่ค่าอยู่ในช่วงแคบ [l, u] เพราะต้องมีช่องนับเท่ากับ k = u − l + 1 ทำสามรอบ นับความถี่ บวกสะสมจากซ้าย แล้วไล่ A จากขวาไปซ้ายวาง v ที่ S[D[v] − 1] อีกแบบคือ comparison counting นับว่ามีกี่ตัวน้อยกว่า ใช้ O(n²)', viz: 'counting', work: ['counting'] },
  { t: 'Horspool', s: 'shift table', key: 't(c) = ระยะจาก c ตัวขวาสุดใน m − 1 ตัวแรก ถึงตัวท้ายของ pattern ถ้าไม่มี t(c) = m', body: 'เทียบ pattern จากขวาไปซ้าย พอไม่ตรงหรือตรงครบ ให้ดูตัวใน text ที่อยู่ใต้ตัวท้ายของ pattern แล้วเลื่อนตาม t ของตัวนั้น ตารางสร้างจาก pattern ก่อนเริ่มค้น จึงนับเป็น input enhancement', viz: 'horspool', work: ['horspool'] },
  { t: 'Boyer-Moore', s: 'bad-symbol กับ good-suffix', key: 'เลื่อน <span class="mono">d = max(d₁, d₂)</span> โดย <span class="mono">d₁ = max(t₁(c) − k, 1)</span>', body: 'k คือจำนวนตัวที่ตรงแล้วนับจากท้าย c คือตัวใน text ที่ไม่ตรง t₁ คือตารางเดียวกับ Horspool ถ้า k = 0 ใช้แค่ d₁ ส่วน d₂(k) มาจากตาราง good-suffix ซึ่งบอกว่าส่วนท้ายยาว k ที่ตรงแล้วไปซ้ำที่ไหนใน pattern', viz: 'boyer', work: ['boyer'] },
  { t: 'Hashing', s: 'hash function และ collision', key: 'Hashing กระจาย key ลงตาราง m ช่องด้วย hash function เช่น <span class="mono">h(K) = K mod m</span>', body: 'key สองตัวได้ช่องเดียวกันเรียกว่า collision แก้ได้สองแบบ <b>Separate chaining</b> (open hashing) ต่อเป็นลิสต์ในช่องเดิม และ <b>Open addressing</b> (closed hashing) เช่น linear probing ที่ไล่หาช่องว่างถัดไป load factor α = n/m บอกว่าตารางแน่นแค่ไหน ตัวอย่างในสไลด์ใช้ h = ผลรวมลำดับตัวอักษร (A = 1 ถึง Z = 26) mod 13', viz: 'hashing', work: ['hashing'] },
  { t: 'B-Tree', s: 'คุณสมบัติและการแทรก', key: 'B-tree order m ใบทุกใบอยู่ระดับเดียวกัน และ node ภายในมีลูก <span class="mono">⌈m/2⌉</span> ถึง m ตัว', body: 'root มีลูก 2 ถึง m ตัว (หรือเป็นใบ) ต้นไม้จึงเตี้ย ค้นหาและแทรกใช้ Θ(log n) แบบในสไลด์เก็บข้อมูลที่ใบ key ใน node ข้างบนคือ key ตัวแรกของลูกทางขวา ตัวอย่างนี้ m = 4 แต่ละ node มีไม่เกิน 3 key แทรกแล้วเกินให้แยกครึ่ง แล้วดัน key ตัวแรกของครึ่งขวาขึ้นไปที่ parent', viz: 'btree', work: ['btree'] },
];
const CARDS8 = [
  { t: 'Dynamic Programming', s: 'overlapping subproblems', key: 'DP เก็บคำตอบของปัญหาย่อยที่เกิดซ้ำไว้ในตาราง แต่ละปัญหาย่อยจึงคำนวณครั้งเดียว', body: 'ใช้ได้เมื่อมี <b>overlapping subproblems</b> (ปัญหาย่อยเดิมเกิดซ้ำ) และ <b>optimal substructure</b> (คำตอบที่ดีที่สุดสร้างจากคำตอบที่ดีที่สุดของปัญหาย่อย) ทำได้สองแบบ top-down คือ recursion กับ memoization ที่คำนวณเฉพาะที่ถูกเรียก และ bottom-up คือ tabulation เติมตารางทุกช่องตามลำดับ ขั้นสุดท้ายคือ traceback ย้อนจากช่องคำตอบเพื่อดูว่าเลือกอะไร', viz: 'fib' },
  { t: 'Coin-row', s: 'ห้ามหยิบเหรียญติดกัน', key: '<span class="mono">F(n) = max(cₙ + F(n − 2), F(n − 1))</span> โดย F(0) = 0, F(1) = c₁', body: 'เหรียญที่ n จะหยิบ (แล้วต้องข้ามเหรียญ n − 1) หรือไม่หยิบก็ได้ เลือกทางที่ได้มากกว่า ใช้เวลา O(n)', viz: 'coinrow', work: ['coinrow'] },
  { t: 'Change-making', s: 'ทอนเหรียญให้น้อยที่สุด', key: '<span class="mono">F(n) = min{ F(n − dⱼ) : dⱼ ≤ n } + 1</span> โดย F(0) = 0', body: 'ลองให้เหรียญแต่ละชนิดเป็นเหรียญสุดท้าย แล้วเลือกแบบที่ใช้เหรียญน้อยที่สุด ใช้เวลา O(nm) เมื่อมีเหรียญ m ชนิด', viz: 'change', work: ['change'] },
  { t: 'Robot coin collection', s: 'เดินได้แค่ขวาหรือลง', key: '<span class="mono">F(i, j) = max(F(i − 1, j), F(i, j − 1)) + cᵢⱼ</span>', body: 'หุ่นยนต์มาถึงช่อง (i, j) ได้จากช่องบนหรือช่องซ้ายเท่านั้น เลือกทางที่เก็บได้มากกว่าแล้วบวกเหรียญในช่องนี้ (cᵢⱼ = 1 ถ้ามีเหรียญ) ใช้เวลา O(nm)', viz: 'collect', work: ['collect'] },
  { t: '0/1 Knapsack', s: 'ตาราง V[i][j]', key: '<span class="mono">V[i][j] = max(V[i−1][j], vᵢ + V[i−1][j − wᵢ])</span> เมื่อ j ≥ wᵢ ไม่งั้น V[i−1][j]', body: 'V[i][j] คือมูลค่าสูงสุดเมื่อใช้ของ i ชิ้นแรกกับกระเป๋าจุ j ตารางขนาด (n + 1) × (W + 1) ใช้เวลา O(nW) ของต้องหยิบทั้งชิ้นหรือไม่หยิบเลย', viz: 'knap', work: ['knap'] },
  { t: 'Warshall', s: 'transitive closure', key: '<span class="mono">r⁽ᵏ⁾ᵢⱼ = r⁽ᵏ⁻¹⁾ᵢⱼ หรือ (r⁽ᵏ⁻¹⁾ᵢₖ และ r⁽ᵏ⁻¹⁾ₖⱼ)</span>', body: 'ตอบว่าไปถึงกันได้ไหม (0 หรือ 1) รอบที่ k อนุญาตให้ใช้ vertex k เป็นทางผ่าน ถ้า i ไป k ได้และ k ไป j ได้ ก็ได้ว่า i ไป j ได้ ใช้เวลา O(n³)', viz: 'warshall', work: ['warshall'] },
  { t: 'Floyd', s: 'all-pairs shortest path', key: '<span class="mono">d⁽ᵏ⁾ᵢⱼ = min(d⁽ᵏ⁻¹⁾ᵢⱼ, d⁽ᵏ⁻¹⁾ᵢₖ + d⁽ᵏ⁻¹⁾ₖⱼ)</span>', body: 'หาระยะสั้นที่สุดของทุกคู่ โครงเดียวกับ Warshall แต่เก็บระยะทาง และใช้ min กับ + แทน "หรือ" กับ "และ" ใช้เวลา O(n³)', viz: 'floyd', work: ['floyd'] },
  { t: 'LCS', s: 'Longest Common Subsequence', key: 'ถ้า xᵢ = yⱼ แล้ว <span class="mono">L[i, j] = L[i−1, j−1] + 1</span> ไม่งั้น <span class="mono">max(L[i−1, j], L[i, j−1])</span>', body: 'หาลำดับย่อยร่วมที่ยาวที่สุดของสองสตริง ตัวอย่าง X = ABCBDAB และ Y = BDCABA', viz: 'lcs' },
];
const CARDS9 = [
  { t: 'Greedy technique', s: 'local optimum', key: 'แต่ละขั้นเลือกตัวเลือกที่ดีที่สุดตอนนั้น และเลือกแล้วไม่ย้อนกลับ', body: 'ตัวเลือกต้อง feasible (ไม่ผิดเงื่อนไข) locally optimal และ irrevocable ได้คำตอบที่ดีที่สุดเสมอใน Prim, Kruskal, Dijkstra, Huffman, Fractional knapsack และ Activity selection แต่ไม่การันตีใน 0/1 knapsack, TSP และการทอนเหรียญบางชุด', viz: 'greedycoin' },
  { t: 'Prim', s: 'MST ขยายจาก vertex', key: 'เริ่มจาก vertex หนึ่ง แล้วเพิ่ม edge ที่เบาที่สุดที่เชื่อมต้นไม้กับ vertex นอกต้นไม้ ทีละเส้น', body: 'ทำจนครบทุก vertex ได้ minimum spanning tree ใช้ priority queue (min-heap) ได้ O(E log V)', viz: 'prim', work: ['prim'] },
  { t: 'Kruskal', s: 'MST จาก edge ที่เบาที่สุด', key: 'เรียง edge จากเบาไปหนัก แล้วหยิบทีละเส้นถ้าไม่ทำให้เกิด cycle', body: 'ใช้ union-find ตรวจว่าปลายทั้งสองอยู่กลุ่มเดียวกันหรือยัง ได้ครบ V − 1 edge ก็จบ ใช้เวลา O(E log E) ส่วนใหญ่มาจากการเรียง Prim ขยายจาก vertex เริ่มต้น ส่วน Kruskal เลือก edge ที่เบาที่สุดจากทั้งกราฟ', viz: 'kruskal', work: ['kruskal'] },
  { t: 'Dijkstra', s: 'single-source shortest path', key: 'ทุกขั้นเลือก vertex ที่ระยะสะสมน้อยที่สุดที่ยังไม่ปิด แล้วอัปเดตระยะของเพื่อนบ้าน', body: 'หาระยะสั้นที่สุดจากจุดเริ่มจุดเดียว ใช้ได้เมื่อน้ำหนักไม่ติดลบ ใช้ min-heap ได้ O(E log V)', viz: 'dijkstra', work: ['dijkstra'] },
  { t: 'Activity selection', s: 'เรียงตามเวลาสิ้นสุด', key: 'เรียงตามเวลาสิ้นสุด แล้วเลือกกิจกรรมที่เริ่มหลังกิจกรรมล่าสุดที่เลือกจบ', body: 'กิจกรรมที่จบเร็วที่สุดเหลือเวลาให้กิจกรรมอื่นมากที่สุด จึงได้จำนวนกิจกรรมที่ไม่ทับกันมากที่สุด ใช้เวลา O(n log n) จากการเรียง', viz: 'activity', work: ['activity'] },
  { t: 'Fractional knapsack', s: 'เรียงตาม v/w', key: 'เรียงของตาม v/w จากมากไปน้อย ใส่ทั้งชิ้นจนกว่าจะไม่พอ แล้วตัดชิ้นสุดท้ายเป็นเศษส่วน', body: 'ของแบ่งได้ greedy จึงได้คำตอบที่ดีที่สุด ต่างจาก 0/1 knapsack ที่ต้องใช้ DP', viz: 'frac', work: ['frac'] },
  { t: 'Huffman coding', s: 'รหัสความยาวผันแปร', key: 'รวมสองต้นที่มีความถี่น้อยที่สุดซ้ำๆ จนเหลือต้นเดียว แล้วให้ซ้าย = 0 ขวา = 1', body: 'ได้รหัสความยาวผันแปรแบบ prefix-free ตัวที่ใช้บ่อยได้รหัสสั้น ความยาวเฉลี่ย = Σ ความถี่ × จำนวนบิต', viz: 'huffman', work: ['huffman'] },
];
