// Solvers + generators shared by the quiz. Pure functions; also loadable in node for tests.
const Core = (() => {
  const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  const shuffle = arr => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  // ---------- Coin row ----------
  function coinRow(c) {
    const F = [0, c[0]];
    const lines = [
      { t: 'F(0) = 0,  F(1) = c₁ = ' + c[0], n: 'ฐาน: ไม่มีเหรียญได้ 0 ถ้ามีเหรียญเดียวก็หยิบเหรียญนั้น' },
    ];
    for (let i = 2; i <= c.length; i++) {
      const take = c[i - 1] + F[i - 2], skip = F[i - 1];
      F[i] = Math.max(take, skip);
      lines.push({ t: `F(${i}) = max(${c[i - 1]} + ${F[i - 2]}, ${skip}) = ${F[i]}`, n: take >= skip ? `หยิบเหรียญที่ ${i} (ค่า ${c[i - 1]}) แล้วบวก F(${i - 2})` : `ไม่หยิบเหรียญที่ ${i} ใช้ค่า F(${i - 1}) เดิม` });
    }
    lines.push({ t: 'ตอบ ' + F[c.length], n: `F(${c.length}) คือมูลค่ารวมมากที่สุดเมื่อพิจารณาครบทุกเหรียญ` });
    return { answer: String(F[c.length]), lines };
  }

  // ---------- 0/1 Knapsack ----------
  function knapsack(items, W) {
    const n = items.length, V = Array.from({ length: n + 1 }, () => Array(W + 1).fill(0));
    const lines = [{ t: 'V[0][j] = 0 และ V[i][0] = 0', n: 'แถว 0 คือยังไม่มีของ คอลัมน์ 0 คือกระเป๋าจุ 0' }];
    for (let i = 1; i <= n; i++) {
      const { w, v } = items[i - 1];
      for (let j = 0; j <= W; j++) V[i][j] = j >= w ? Math.max(V[i - 1][j], v + V[i - 1][j - w]) : V[i - 1][j];
      lines.push({ t: `i=${i} (w=${w}, v=${v}):  ${V[i].join('  ')}`, n: `j < ${w} ลอกแถวบนลงมา ส่วน j ≥ ${w} ใช้ max(V[${i - 1}][j], ${v} + V[${i - 1}][j−${w}])` });
    }
    lines.push({ t: `ตอบ V[${n}][${W}] = ${V[n][W]}`, n: 'ช่องขวาล่างของตาราง' });
    return { answer: String(V[n][W]), lines, V };
  }

  // ---------- Dijkstra ----------
  function dijkstra(nodes, edges, src = 'A') {
    const dist = {}, prev = {}, done = new Set(), cnt = {};
    nodes.forEach(v => { dist[v] = Infinity; cnt[v] = 0; });
    dist[src] = 0; cnt[src] = 1;
    const lines = [{ t: `d(${src}) = 0 ที่เหลือ = ∞`, n: 'ตั้งระยะเริ่มต้นจากต้นทาง' }];
    while (done.size < nodes.length) {
      let u = null;
      nodes.forEach(v => { if (!done.has(v) && dist[v] < Infinity && (u === null || dist[v] < dist[u] || (dist[v] === dist[u] && v < u))) u = v; });
      if (u === null) break;
      done.add(u);
      const ups = [];
      edges.filter(e => e[0] === u && !done.has(e[1])).forEach(([, v, w]) => {
        const nd = dist[u] + w;
        if (nd < dist[v]) { dist[v] = nd; prev[v] = u; cnt[v] = cnt[u]; ups.push(`d(${v}) = ${dist[u]}+${w} = ${nd}`); }
        else if (nd === dist[v]) { cnt[v] += cnt[u]; }
      });
      lines.push({ t: `เลือก ${u} (${dist[u]})` + (ups.length ? `  อัปเดต ${ups.join(', ')}` : '  ไม่มีค่าไหนลดลง'), n: u === src ? 'เริ่มจากต้นทาง แล้วผ่อนคลายทุกเส้นที่ออกจากมัน' : `${u} มีระยะสะสมน้อยที่สุดในบรรดาโหนดที่ยังไม่เลือก` });
    }
    const path = v => { const p = [v]; while (prev[p[0]]) p.unshift(prev[p[0]]); return p.join('->'); };
    const dests = nodes.filter(v => v !== src).sort();
    const answer = dests.map(v => `${path(v)}:${dist[v]}`).join(' ');
    lines.push({ t: 'ตอบ ' + answer, n: 'ไล่ย้อนโหนดก่อนหน้าจากปลายทางกลับไปหา A แล้วเรียงตามตัวอักษรปลายทาง' });
    const unique = dests.every(v => dist[v] < Infinity && cnt[v] === 1);
    return { answer, lines, unique, dist };
  }

  // ---------- Horspool ----------
  function horspool(p) {
    const m = p.length, letters = [...new Set(p.split(''))].sort(), table = {};
    letters.forEach(ch => { table[ch] = m; });
    for (let j = 0; j < m - 1; j++) table[p[j]] = m - 1 - j;
    const lines = [{ t: `m = ${m} ใช้แค่ ${m - 1} ตัวแรก "${p.slice(0, m - 1)}"`, n: 'ตัวสุดท้ายของ pattern ไม่นับ' }];
    letters.forEach(ch => {
      const last = p.slice(0, m - 1).lastIndexOf(ch);
      lines.push(last < 0 ? { t: `${ch}: ไม่อยู่ใน ${m - 1} ตัวแรก → ${m}`, n: 'ใช้ค่า m' } : { t: `${ch}: ตำแหน่งสุดท้าย j = ${last + 1} → ${m} − ${last + 1} = ${table[ch]}`, n: 'shift = m − j โดย j นับจาก 1 และดูแค่ m−1 ตัวแรก' });
    });
    lines.push({ t: `*: ตัวอื่นๆ → ${m}`, n: 'ตัวที่ไม่อยู่ใน pattern เลื่อนได้เต็มความยาว' });
    const answer = letters.map(ch => `${ch}:${table[ch]}`).join(' ') + ` *:${m}`;
    lines.push({ t: 'ตอบ ' + answer, n: 'เรียงตามตัวอักษร ปิดท้ายด้วย *' });
    return { answer, lines, table };
  }

  // ---------- Huffman ----------
  function huffman(freqs) {
    let q = freqs.map(f => ({ w: f.p, syms: [f.s], name: f.s }));
    const depth = {}; freqs.forEach(f => (depth[f.s] = 0));
    const lines = [];
    while (q.length > 1) {
      q.sort((a, b) => a.w - b.w || a.name.localeCompare(b.name));
      const a = q.shift(), b = q.shift();
      [...a.syms, ...b.syms].forEach(s => depth[s]++);
      const node = { w: a.w + b.w, syms: [...a.syms, ...b.syms], name: a.name + b.name };
      lines.push({ t: `รวม ${a.name}(${a.w}) + ${b.name}(${b.w}) = ${node.w}`, n: 'หยิบสองค่าที่น้อยที่สุดในตอนนั้นมารวมกัน' });
      q.push(node);
    }
    lines.push({ t: 'จำนวนบิต  ' + freqs.map(f => `${f.s} = ${depth[f.s]}`).join('   '), n: 'ความลึกของใบในต้นไม้ เท่ากับจำนวนบิตของรหัส' });
    const sum = freqs.reduce((s, f) => s + f.p * depth[f.s], 0);
    const avg = (sum / 100).toFixed(2);
    lines.push({ t: 'เฉลี่ย = ' + freqs.map(f => `${(f.p / 100).toFixed(2)}×${depth[f.s]}`).join(' + ') + ` = ${avg}`, n: 'ผลรวมของ ความถี่ × จำนวนบิต' });
    lines.push({ t: 'ตอบ ' + avg, n: 'ทศนิยม 2 ตำแหน่ง' });
    return { answer: avg, lines, depth };
  }

  // ---------- Floyd (0 off-diagonal = no edge, the instructor's convention) ----------
  function floyd(M) {
    const n = M.length, INF = Infinity;
    let D = M.map((r, i) => r.map((x, j) => (i !== j && x === 0 ? INF : x)));
    const fmt = v => (v === INF ? '∞' : v);
    const show = A => A.map(r => '[' + r.map(fmt).join(' ') + ']').join(' ');
    const lines = [{ t: 'D(0) = ' + show(D), n: 'เลข 0 ที่ไม่อยู่บนแนวทแยงแปลว่าไม่มีเส้นเชื่อม ให้เขียนเป็น ∞' }];
    for (let k = 0; k < n; k++) {
      const ch = [], N = D.map(r => r.slice());
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
        if (D[i][k] + D[k][j] < D[i][j]) { N[i][j] = D[i][k] + D[k][j]; ch.push(`d${i + 1}${j + 1} = ${fmt(D[i][k])}+${fmt(D[k][j])} = ${N[i][j]}`); }
      }
      D = N;
      lines.push({ t: `D(${k + 1}) = ` + show(D), n: `ให้ผ่านโหนด ${k + 1}: ` + (ch.length ? ch.join(', ') : 'ไม่มีช่องไหนลดลง') });
    }
    const ok = D.every(r => r.every(x => x < INF));
    const answer = '[' + D.map(r => '[' + r.join(' ') + ']').join(' ') + ']';
    lines.push({ t: 'ตอบ ' + answer, n: 'D(n) คือระยะสั้นที่สุดของทุกคู่' });
    return { answer, lines, ok };
  }

  // ---------- Generators ----------
  const gen = {
    coin() { return { kind: 'coin', ch: '8', c: Array.from({ length: rnd(10, 14) }, () => rnd(1, 25)) }; },
    knap() {
      return { kind: 'knap', ch: '8', W: rnd(5, 8), items: Array.from({ length: 4 }, () => ({ w: rnd(1, 5), v: rnd(4, 30) })) };
    },
    dijk() {
      for (;;) {
        const nodes = ['A', 'B', 'C', 'D', 'E'], set = new Map(), want = rnd(7, 9);
        while (set.size < want) {
          const a = pick(nodes), b = pick(nodes);
          if (a === b || b === 'A' || set.has(a + b) || set.has(b + a)) continue;
          set.set(a + b, [a, b, rnd(1, 9)]);
        }
        const edges = [...set.values()].sort((x, y) => (x[0] + x[1]).localeCompare(y[0] + y[1]));
        if (dijkstra(nodes, edges).unique) return { kind: 'dijk', ch: '9', nodes, edges };
      }
    },
    hors() {
      for (;;) {
        const m = rnd(8, 12), p = Array.from({ length: m }, () => pick('abcde')).join(''), head = p.slice(0, m - 1);
        if ([...new Set(p)].every(ch => head.includes(ch)) && new Set(p).size >= 4) return { kind: 'hors', ch: '7', p };
      }
    },
    huff() {
      const k = pick([4, 5]);
      for (;;) {
        const cuts = Array.from({ length: k - 1 }, () => rnd(4, 96)).sort((a, b) => a - b);
        const ps = cuts.map((c, i) => c - (i ? cuts[i - 1] : 0)).concat(100 - cuts[k - 2]);
        if (ps.every(p => p >= 4) && new Set(ps).size === k) {
          ps.sort((a, b) => b - a);
          return { kind: 'huff', ch: '9', f: ps.map((p, i) => ({ s: 'ABCDE'[i], p })) };
        }
      }
    },
    floyd() {
      for (;;) {
        const M = Array.from({ length: 4 }, (_, i) => Array.from({ length: 4 }, (_, j) => (i === j ? 0 : Math.random() < 0.5 ? rnd(1, 9) : 0)));
        if (floyd(M).ok) return { kind: 'floyd', ch: '8', M };
      }
    },
  };

  function solve(q) {
    switch (q.kind) {
      case 'coin': return coinRow(q.c);
      case 'knap': return knapsack(q.items, q.W);
      case 'dijk': return dijkstra(q.nodes, q.edges);
      case 'hors': return horspool(q.p);
      case 'huff': return huffman(q.f);
      case 'floyd': return floyd(q.M);
    }
  }

  // ---------- Answer checking (lenient on spacing and case, strict on values) ----------
  function check(q, input, answer) {
    const s = (input || '').trim().replace(/\s+/g, ' ');
    if (!s) return false;
    switch (q.kind) {
      case 'coin': case 'knap': return /^\d+$/.test(s) && s === answer;
      case 'huff': return /^\d+(\.\d+)?$/.test(s) && Math.abs(parseFloat(s) - parseFloat(answer)) < 0.001;
      case 'floyd': { const a = s.match(/\d+/g) || [], b = answer.match(/\d+/g); return a.length === b.length && a.every((x, i) => +x === +b[i]); }
      case 'hors': {
        const toMap = t => Object.fromEntries((t.match(/[a-z*]\s*:\s*\d+/gi) || []).map(x => { const [k, v] = x.split(':'); return [k.trim().toLowerCase(), +v]; }));
        const A = toMap(s), B = toMap(answer);
        return Object.keys(A).length === Object.keys(B).length && Object.keys(B).every(k => A[k] === B[k]);
      }
      case 'dijk': {
        const toks = t => t.toUpperCase().replace(/\s*-\s*>\s*/g, '->').replace(/\s*:\s*/g, ':').split(' ').filter(Boolean).sort().join(' ');
        return toks(s) === toks(answer);
      }
    }
    return false;
  }

  return { rnd, pick, shuffle, coinRow, knapsack, dijkstra, horspool, huffman, floyd, gen, solve, check };
})();
if (typeof module !== 'undefined') module.exports = Core;
