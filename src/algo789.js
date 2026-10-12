// Frame generators for chapters 7-9. Each frame: data for the picture, cap (HTML caption), w (optional written-answer line), n (note).
const A7 = (() => {
  const sub = n => String(n).split('').map(d => '₀₁₂₃₄₅₆₇₈₉'[d]).join('');

  /* ---------- week 7 ---------- */
  function distCount(A, l, u) {
    const k = u - l + 1, F = [];
    let cnt = Array(k).fill(0), S = Array(A.length).fill(null), D = null;
    F.push({ A, cnt: cnt.slice(), S: S.slice(), cap: `ค่าอยู่ในช่วง [${l}, ${u}] จึงมีช่องนับ ${k} ช่อง เริ่มจากศูนย์ทั้งหมด`, w: `ช่วงค่า l = ${l}, u = ${u} สร้างตารางความถี่ ${k} ช่อง` });
    A.forEach((v, i) => { cnt[v - l]++; F.push({ A, ai: i, cnt: cnt.slice(), hc: v - l, S: S.slice(), cap: `รอบ 1 นับ: A[${i}] = <b>${v}</b> บวกช่อง ${v} เป็น ${cnt[v - l]}` }); });
    F[F.length - 1].w = `ความถี่: ${cnt.map((c, j) => `${l + j}→${c}`).join(', ')}`;
    D = cnt.slice(); for (let j = 1; j < k; j++) D[j] += D[j - 1];
    F.push({ A, cnt: D.slice(), dist: true, S: S.slice(), cap: `รอบ 2 สะสมจากซ้าย ได้ D = [${D.join(', ')}] คือจำนวนตัวที่ ≤ ค่านั้น`, w: `สะสม D = [${D.join(', ')}]`, n: 'D[v] บอกตำแหน่งสุดท้ายของค่า v ใน S' });
    for (let i = A.length - 1; i >= 0; i--) {
      const v = A[i], pos = D[v - l] - 1; S[pos] = v; D[v - l]--;
      F.push({ A, ai: i, cnt: D.slice(), dist: true, hc: v - l, S: S.slice(), hs: pos, cap: `รอบ 3 ไล่จากขวา: A[${i}] = <b>${v}</b> วางที่ S[${pos}] แล้วลด D[${v}] เป็น ${D[v - l]}`, w: `A[${i}] = ${v} → S[${pos}], D[${v}] = ${D[v - l]}` });
    }
    F.push({ A, cnt: D.slice(), dist: true, S: S.slice(), done: true, cap: `<b>เรียงเสร็จ S = ${S.join(' ')}</b> ไม่ต้องเทียบค่ากันเลย ใช้เวลา O(n + k)`, w: `S = [${S.join(', ')}] ใช้เวลา O(n + k)` });
    return F;
  }

  function shiftTable(p) {
    const m = p.length, t = {};
    for (let j = 0; j < m - 1; j++) t[p[j]] = m - 1 - j;
    return t;
  }
  function horspoolFrames(text, pat) {
    const m = pat.length, n = text.length, t = shiftTable(pat), F = [];
    let i = m - 1, comps = 0;
    while (i <= n - 1) {
      let k = 0; const cmp = [];
      while (k < m && pat[m - 1 - k] === text[i - k]) { cmp.push([i - k, 1]); k++; comps++; }
      if (k === m) { F.push({ pos: i - m + 1, cmp, found: true, cap: `<b>ตรงครบ ${m} ตัว เจอที่ตำแหน่ง ${i - m + 1}</b> เทียบไปทั้งหมด ${comps} ครั้ง`, w: `ตำแหน่ง ${i - m + 1}: ตรงครบ ${m} ตัว เจอ pattern` }); return F; }
      cmp.push([i - k, 0]); comps++;
      const c = text[i], s = t[c] ?? m;
      F.push({ pos: i - m + 1, cmp, c: i, cap: `${k ? `ตรง ${k} ตัวแล้วไม่ตรง ` : 'ตัวท้ายไม่ตรง '}ดูตัวใต้ตัวท้าย pattern คือ <b>${c === '_' ? '_' : c}</b> → t(${c}) = <b>${s}</b> เลื่อน ${s} ช่อง`, w: `ตำแหน่ง ${i - m + 1}: ตัวใต้ตัวท้ายคือ ${c}, t(${c}) = ${s} → เลื่อน ${s}` });
      i += s;
    }
    F.push({ pos: i - m + 1, cmp: [], cap: '<b>pattern เลยท้าย text แล้ว ไม่เจอ</b>', w: 'ไม่เจอ pattern' });
    return F;
  }

  function bmD2(p) {
    const m = p.length, d2 = {};
    for (let k = 1; k < m; k++) {
      const suf = p.slice(m - k), prev = p[m - k - 1];
      let found = -1;
      for (let j = m - k - 1; j >= 0; j--) if (p.slice(j, j + k) === suf && (j === 0 || p[j - 1] !== prev)) { found = j; break; }
      if (found >= 0) d2[k] = m - k - found;
      else { let l = k - 1; while (l > 0 && p.slice(0, l) !== suf.slice(k - l)) l--; d2[k] = m - l; }
    }
    return d2;
  }
  function bmFrames(text, pat) {
    const m = pat.length, n = text.length, t1 = shiftTable(pat), d2 = bmD2(pat), F = [];
    let i = m - 1;
    while (i <= n - 1) {
      let k = 0; const cmp = [];
      while (k < m && pat[m - 1 - k] === text[i - k]) { cmp.push([i - k, 1]); k++; }
      if (k === m) { F.push({ pos: i - m + 1, cmp, found: true, cap: `<b>ตรงครบ เจอ ${pat} ที่ตำแหน่ง ${i - m + 1}</b>`, w: `ตำแหน่ง ${i - m + 1}: ตรงครบ เจอ pattern` }); return F; }
      const c = text[i - k]; cmp.push([i - k, 0]);
      const tc = t1[c] ?? m, d1 = Math.max(tc - k, 1);
      const d = k ? Math.max(d1, d2[k]) : d1;
      const why = k ? `k = ${k}, ตัวที่ไม่ตรงคือ <b>${c}</b>: d₁ = max(t₁(${c}) − ${k}, 1) = max(${tc} − ${k}, 1) = ${d1}, d₂(${k}) = ${d2[k]} → เลื่อน <b>max = ${d}</b>` : `k = 0 ตัวที่ไม่ตรงคือ <b>${c}</b>: d₁ = t₁(${c}) = ${tc} → เลื่อน <b>${d}</b>`;
      F.push({ pos: i - m + 1, cmp, cap: why, w: `ตำแหน่ง ${i - m + 1}: ${why.replace(/<[^>]+>/g, '')}` });
      i += d;
    }
    F.push({ pos: i - m + 1, cmp: [], cap: '<b>ไม่เจอ</b>' });
    return F;
  }

  const letterSum = w => [...w].reduce((s, c) => s + c.charCodeAt(0) - 64, 0);
  function hashFrames(words, mode, M = 13) {
    const F = [];
    if (mode === 'open') {
      const T = Array.from({ length: M }, () => []);
      F.push({ T: T.map(x => x.slice()), cap: `ตาราง ${M} ช่อง แต่ละช่องเป็น linked list (separate chaining)` });
      for (const w of words) {
        const s = letterSum(w), k = s % M; T[k].push(w);
        F.push({ T: T.map(x => x.slice()), slot: k, word: w, cap: `h(${w}) = ${s} mod ${M} = <b>${k}</b>` + (T[k].length > 1 ? ` ชนกับ ${T[k].slice(0, -1).join(', ')} จึง<b>ต่อท้ายลิสต์</b>` : ''), w: `h(${w}) = ${s} mod ${M} = ${k}` + (T[k].length > 1 ? ` (ชน ต่อลิสต์ช่อง ${k})` : '') });
      }
      F.push({ T: T.map(x => x.slice()), cap: `ใส่ครบ ${words.length} คำ load factor <b>α = n/m = ${words.length}/${M} ≈ ${(words.length / M).toFixed(2)}</b>`, w: `α = ${words.length}/${M}` });
    } else {
      const T = Array(M).fill(null);
      F.push({ T: T.slice(), cap: `ตาราง ${M} ช่อง ทุก key อยู่ในตารางเอง (open addressing แบบ linear probing)` });
      for (const w of words) {
        const s = letterSum(w); let k = s % M; const tried = [];
        while (T[k] !== null) { tried.push(k); k = (k + 1) % M; }
        T[k] = w;
        F.push({ T: T.slice(), slot: k, bad: tried, word: w, cap: `h(${w}) = ${s} mod ${M} = <b>${s % M}</b>` + (tried.length ? ` ช่อง ${tried.join(', ')} ไม่ว่าง จึง<b>ไล่ไปช่องถัดไป</b> ได้ช่อง ${k}` : ''), w: `h(${w}) = ${s} mod ${M} = ${s % M}` + (tried.length ? ` ชน → ช่อง ${k}` : '') });
      }
    }
    return F;
  }

  /* B-tree, Levitin variant: keys in leaves, max 3 keys per node (order 4) */
  let uid = 0;
  const leaf = keys => ({ id: ++uid, leaf: true, keys });
  const inner = (keys, kids) => ({ id: ++uid, leaf: false, keys, kids });
  const clone = nd => (nd.leaf ? { id: nd.id, leaf: true, keys: nd.keys.slice() } : { id: nd.id, leaf: false, keys: nd.keys.slice(), kids: nd.kids.map(clone) });
  function btreeStart() {
    uid = 0;
    return inner([20, 51], [
      inner([11, 15], [leaf([4, 7, 10]), leaf([11, 14]), leaf([15, 16, 19])]),
      inner([25, 34, 40], [leaf([20, 24]), leaf([25, 28]), leaf([34, 38]), leaf([40, 43, 46])]),
      inner([60], [leaf([51, 55]), leaf([60, 68, 80])]),
    ]);
  }
  function btreeInsert(root0, key, MAXK = 3) {
    let root = clone(root0); const F = [];
    const path = []; let nd = root;
    while (!nd.leaf) { let i = 0; while (i < nd.keys.length && key >= nd.keys[i]) i++; path.push([nd, i]); nd = nd.kids[i]; }
    F.push({ root: clone(root), hl: [...path.map(p => p[0].id), nd.id], cap: `ค้นจาก root ลงไปหาใบที่ ${key} ควรอยู่ (เทียบกับ key ใน node แล้วเลือกลูก)` });
    nd.keys.push(key); nd.keys.sort((a, b) => a - b);
    F.push({ root: clone(root), hl: [nd.id], cap: `ใส่ <b>${key}</b> ลงใบ ได้ [${nd.keys.join(', ')}]` + (nd.keys.length > MAXK ? ` มี ${nd.keys.length} key <b>เกิน ${MAXK}</b> ต้องแยก` : ' ไม่เกิน จบ'), w: `ใส่ ${key} ลงใบ → [${nd.keys.join(', ')}]` });
    let cur = nd;
    while (cur.keys.length > MAXK) {
      const parentEntry = path.pop();
      let up, left, right;
      if (cur.leaf) { left = leaf(cur.keys.slice(0, 2)); right = leaf(cur.keys.slice(2)); up = right.keys[0]; }
      else { left = inner(cur.keys.slice(0, 2), cur.kids.slice(0, 3)); right = inner(cur.keys.slice(3), cur.kids.slice(3)); up = cur.keys[2]; }
      if (!parentEntry) { root = inner([up], [left, right]); F.push({ root: clone(root), hl: [root.id, left.id, right.id], cap: `แยก root ได้ [${left.keys.join(', ')}] | [${right.keys.join(', ')}] และสร้าง root ใหม่ [${up}] <b>ต้นไม้สูงขึ้น 1 ชั้น</b>`, w: `แยก root → root ใหม่ [${up}]` }); break; }
      const [par, idx] = parentEntry;
      par.kids.splice(idx, 1, left, right); par.keys.splice(idx, 0, up);
      F.push({ root: clone(root), hl: [par.id, left.id, right.id], cap: `แยกเป็น [${left.keys.join(', ')}] | [${right.keys.join(', ')}] แล้ว<b>ดัน ${up} ขึ้น</b> ไปที่ parent ได้ [${par.keys.join(', ')}]` + (par.keys.length > MAXK ? ' parent เกินด้วย แยกต่อ' : ''), w: `แยก [${left.keys.join(', ')}] | [${right.keys.join(', ')}] ดัน ${up} ขึ้น parent → [${par.keys.join(', ')}]` });
      cur = par;
    }
    return { root, frames: F };
  }

  /* ---------- week 8 ---------- */
  function fibTree(n, memo) {
    const seen = new Set(); let id = 0;
    const go = k => {
      const node = { id: id++, k, kids: [] };
      if (memo && seen.has(k)) { node.lookup = true; return node; }
      if (k >= 2) { node.kids = [go(k - 1), go(k - 2)]; }
      seen.add(k);
      return node;
    };
    return go(n);
  }

  function coinRowFrames(c) {
    const n = c.length, F = [0, c[0]], fr = [];
    fr.push({ F: [0, c[0]], i: 1, cap: `F(0) = 0 และ F(1) = c₁ = <b>${c[0]}</b>`, w: `F(0) = 0, F(1) = ${c[0]}` });
    for (let i = 2; i <= n; i++) {
      const take = c[i - 1] + F[i - 2], skip = F[i - 1]; F[i] = Math.max(take, skip);
      fr.push({ F: F.slice(), i, take: take >= skip, cap: `F(${i}) = max(c${sub(i)} + F(${i - 2}), F(${i - 1})) = max(${c[i - 1]} + ${F[i - 2]}, ${skip}) = <b>${F[i]}</b>`, w: `F(${i}) = max(${c[i - 1]} + ${F[i - 2]}, ${skip}) = ${F[i]}` });
    }
    const pick = []; for (let i = n; i >= 1;) { if (i === 1 || F[i] !== F[i - 1]) { pick.push(i); i -= 2; } else i--; }
    pick.reverse();
    fr.push({ F: F.slice(), pick, done: true, cap: `<b>ตอบ F(${n}) = ${F[n]}</b> ย้อนรอยได้เหรียญที่ ${pick.join(', ')} (${pick.map(i => c[i - 1]).join(' + ')})`, w: `ตอบ ${F[n]} โดยเลือกเหรียญที่ ${pick.join(', ')}` });
    return fr;
  }

  function changeFrames(d, n) {
    const F = [0], via = [null], fr = [{ F: [0], i: 0, cap: 'F(0) = 0 เพราะจำนวน 0 ไม่ต้องใช้เหรียญ', w: 'F(0) = 0' }];
    for (let i = 1; i <= n; i++) {
      const opts = d.filter(x => x <= i).map(x => [x, F[i - x] + 1]);
      const best = opts.reduce((a, b) => (b[1] < a[1] ? b : a));
      F[i] = best[1]; via[i] = best[0];
      fr.push({ F: F.slice(), i, from: opts.map(o => i - o[0]), cap: `F(${i}) = min(${opts.map(([x]) => `F(${i - x})`).join(', ')}) + 1 = min(${opts.map(([x]) => F[i - x]).join(', ')}) + 1 = <b>${F[i]}</b>`, w: `F(${i}) = min(${opts.map(([x]) => F[i - x]).join(', ')}) + 1 = ${F[i]}` });
    }
    const coins = []; for (let i = n; i > 0; i -= via[i]) coins.push(via[i]);
    fr.push({ F: F.slice(), done: true, cap: `<b>ตอบ F(${n}) = ${F[n]} เหรียญ</b> คือ ${coins.join(' + ')}`, w: `ตอบ ${F[n]} เหรียญ (${coins.join(' + ')})` });
    return fr;
  }

  function collectFrames(C) {
    const R = C.length, Cn = C[0].length, F = C.map(r => r.map(() => null)), fr = [];
    for (let i = 0; i < R; i++) {
      for (let j = 0; j < Cn; j++) F[i][j] = Math.max(i ? F[i - 1][j] : 0, j ? F[i][j - 1] : 0) + C[i][j];
      fr.push({ F: F.map(r => r.slice()), row: i, cap: `แถว ${i + 1}: แต่ละช่อง F(i, j) = max(ช่องบน, ช่องซ้าย) + เหรียญในช่อง ได้ <b>${F[i].join(' ')}</b>`, w: `แถว ${i + 1}: ${F[i].join(' ')}` });
    }
    const path = [[R - 1, Cn - 1]]; let i = R - 1, j = Cn - 1;
    while (i || j) { if (i && (!j || F[i - 1][j] >= F[i][j - 1])) i--; else j--; path.push([i, j]); }
    fr.push({ F: F.map(r => r.slice()), path, done: true, cap: `<b>ตอบ F(${R}, ${Cn}) = ${F[R - 1][Cn - 1]} เหรียญ</b> ย้อนจากมุมขวาล่างไปทางช่องที่ค่ามากกว่าจะได้เส้นทาง`, w: `ตอบ ${F[R - 1][Cn - 1]} เหรียญ` });
    return fr;
  }

  function knapFrames(items, W) {
    const n = items.length, V = Array.from({ length: n + 1 }, () => Array(W + 1).fill(0)), fr = [];
    fr.push({ V: V.map(r => r.slice()), row: 0, cap: 'แถว 0 และคอลัมน์ 0 เป็นศูนย์ทั้งหมด (ยังไม่มีของ หรือกระเป๋าจุ 0)', w: 'V[0][j] = 0, V[i][0] = 0' });
    for (let i = 1; i <= n; i++) {
      const { w, v } = items[i - 1];
      for (let j = 0; j <= W; j++) V[i][j] = j >= w ? Math.max(V[i - 1][j], v + V[i - 1][j - w]) : V[i - 1][j];
      const j = W;
      fr.push({ V: V.map(r => r.slice()), row: i, cap: `ชิ้นที่ ${i} (w = ${w}, v = ${v}): j < ${w} ลอกแถวบน ส่วน j ≥ ${w} ใช้ max(บน, ${v} + V[${i - 1}][j − ${w}]) เช่น V[${i}][${j}] = max(${V[i - 1][j]}, ${v} + ${j >= w ? V[i - 1][j - w] : '-'}) = <b>${V[i][j]}</b>`, w: `i = ${i}: ${V[i].join(' ')}` });
    }
    const take = []; let j = W;
    for (let i = n; i >= 1; i--) if (V[i][j] !== V[i - 1][j]) { take.push(i); j -= items[i - 1].w; }
    take.reverse();
    fr.push({ V: V.map(r => r.slice()), take, done: true, cap: `<b>ตอบ V[${n}][${W}] = ${V[n][W]}</b> ย้อนรอย: ค่าเปลี่ยนจากแถวบนแปลว่าหยิบชิ้นนั้น ได้ชิ้นที่ ${take.join(', ')}`, w: `ตอบ ${V[n][W]} หยิบชิ้นที่ ${take.join(', ')}` });
    return fr;
  }

  function closureFrames(V, E, kind) {
    const n = V.length, INF = Infinity, ix = Object.fromEntries(V.map((v, i) => [v, i]));
    let M = V.map((u, i) => V.map((w, j) => (kind === 'w' ? 0 : i === j ? 0 : INF)));
    E.forEach(([a, b, w]) => { M[ix[a]][ix[b]] = kind === 'w' ? 1 : w; });
    const fmt = x => (x === INF ? '∞' : x);
    const fr = [{ M: M.map(r => r.slice()), k: -1, ch: [], cap: kind === 'w' ? 'R⁽⁰⁾ คือ adjacency matrix: 1 ถ้ามีลูกศรตรงจาก i ไป j' : 'D⁽⁰⁾ คือ weight matrix: ไม่มีเส้นตรง = ∞', w: (kind === 'w' ? 'R(0) = ' : 'D(0) = ') + M.map(r => '[' + r.map(fmt).join(' ') + ']').join(' ') }];
    for (let k = 0; k < n; k++) {
      const N = M.map(r => r.slice()), ch = [];
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
        if (kind === 'w') { if (!M[i][j] && M[i][k] && M[k][j]) { N[i][j] = 1; ch.push([i, j]); } }
        else if (M[i][k] + M[k][j] < M[i][j]) { N[i][j] = M[i][k] + M[k][j]; ch.push([i, j, M[i][k], M[k][j]]); }
      }
      M = N;
      const list = ch.map(([i, j, a, b]) => kind === 'w' ? `${V[i]}→${V[j]}` : `d(${V[i]},${V[j]}) = ${a} + ${b} = ${M[i][j]}`);
      fr.push({ M: M.map(r => r.slice()), k, ch, cap: `k = ${V[k]}: ให้ผ่าน ${V[k]} ได้ ` + (ch.length ? (kind === 'w' ? `ไปถึงกันเพิ่ม <b>${list.join(', ')}</b>` : `ระยะลดลง <b>${list.join(', ')}</b>`) : 'ไม่มีช่องไหนเปลี่ยน'), w: `${kind === 'w' ? 'R' : 'D'}(${k + 1}): ` + (ch.length ? list.join(', ') : 'ไม่เปลี่ยน') });
    }
    fr[fr.length - 1].w += '  ผลสุดท้าย ' + M.map(r => '[' + r.map(fmt).join(' ') + ']').join(' ');
    return fr;
  }

  function lcsFrames(X, Y) {
    const m = X.length, n = Y.length, L = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0)), fr = [];
    fr.push({ L: L.map(r => r.slice()), row: 0, cap: 'แถว 0 และคอลัมน์ 0 เป็นศูนย์ (สตริงว่าง)' });
    for (let i = 1; i <= m; i++) {
      const mt = [];
      for (let j = 1; j <= n; j++) { if (X[i - 1] === Y[j - 1]) { L[i][j] = L[i - 1][j - 1] + 1; mt.push(j); } else L[i][j] = Math.max(L[i - 1][j], L[i][j - 1]); }
      fr.push({ L: L.map(r => r.slice()), row: i, mt, cap: `แถว ${X[i - 1]}: ช่องที่ตัวอักษรตรงกัน (${mt.length ? mt.map(j => Y[j - 1] + sub(j)).join(', ') : 'ไม่มี'}) ใช้ <b>ทแยงบนซ้าย + 1</b> ช่องอื่นใช้ max(บน, ซ้าย)` });
    }
    fr.push({ L: L.map(r => r.slice()), done: true, cap: `<b>ความยาว LCS = L[${m}][${n}] = ${L[m][n]}</b>` });
    return fr;
  }

  /* ---------- week 9 ---------- */
  const ek = (u, v) => [u, v].sort().join('');
  function primFrames(G, s) {
    const V = Object.keys(G.pos), inT = [s], tree = [], fr = [];
    let total = 0;
    fr.push({ inT: inT.slice(), tree: [], cap: `เริ่มที่ <b>${s}</b> ต้นไม้มี vertex เดียว`, w: `เริ่มที่ ${s}` });
    while (inT.length < V.length) {
      const cand = G.E.filter(([u, v]) => inT.includes(u) !== inT.includes(v));
      const best = cand.reduce((a, b) => (b[2] < a[2] ? b : a));
      const nv = inT.includes(best[0]) ? best[1] : best[0];
      inT.push(nv); tree.push(ek(best[0], best[1])); total += best[2];
      fr.push({ inT: inT.slice(), tree: tree.slice(), cand: cand.map(e => ek(e[0], e[1])), now: ek(best[0], best[1]), cap: `เส้นที่ข้ามจากต้นไม้ออกไป: ${cand.map(e => `${e[0]}${e[1]} ${e[2]}`).join(', ')} เลือกเบาสุด <b>${best[0]}${best[1]} (${best[2]})</b> เพิ่ม ${nv}`, w: `เลือก ${best[0]}${best[1]} (${best[2]}) เพิ่ม ${nv}` });
    }
    fr.push({ inT, tree, done: true, cap: `<b>ครบ ${V.length} vertex น้ำหนักรวม = ${total}</b>`, w: `MST น้ำหนักรวม ${total}` });
    return fr;
  }
  function kruskalFrames(G) {
    const V = Object.keys(G.pos), order = G.E.slice().sort((a, b) => a[2] - b[2] || (a[0] + a[1]).localeCompare(b[0] + b[1]));
    const par = Object.fromEntries(V.map(v => [v, v])), find = x => (par[x] === x ? x : (par[x] = find(par[x])));
    const status = {}, tree = [], fr = [];
    let total = 0;
    fr.push({ status: {}, tree: [], order, cap: `เรียง edge จากเบาไปหนัก: ${order.map(e => `${e[0]}${e[1]} ${e[2]}`).join(', ')}`, w: 'เรียง edge: ' + order.map(e => `${e[0]}${e[1]}(${e[2]})`).join(', ') });
    for (const [u, v, w] of order) {
      if (tree.length === V.length - 1) break;
      const a = find(u), b = find(v), k = ek(u, v);
      if (a !== b) { par[a] = b; status[k] = 'ok'; tree.push(k); total += w; fr.push({ status: { ...status }, tree: tree.slice(), order, now: k, cap: `<b>${u}${v} (${w}) รับ</b> ${u} กับ ${v} อยู่คนละกลุ่ม ไม่เกิด cycle`, w: `${u}${v} (${w}) รับ` }); }
      else { status[k] = 'rej'; fr.push({ status: { ...status }, tree: tree.slice(), order, now: k, cap: `<b>${u}${v} (${w}) ทิ้ง</b> ${u} กับ ${v} เชื่อมกันอยู่แล้ว ถ้าใส่จะเกิด cycle`, w: `${u}${v} (${w}) ทิ้ง เกิด cycle` }); }
    }
    fr.push({ status, tree, order, done: true, cap: `<b>ได้ ${V.length - 1} edge น้ำหนักรวม = ${total}</b>`, w: `MST น้ำหนักรวม ${total}` });
    return fr;
  }
  function dijkstraFrames(G, s) {
    const V = Object.keys(G.pos), dist = Object.fromEntries(V.map(v => [v, Infinity])), prev = {}, done = [], fr = [];
    dist[s] = 0;
    const nb = u => G.E.filter(e => e[0] === u || (!G.directed && e[1] === u)).map(e => (e[0] === u ? [e[1], e[2]] : [e[0], e[2]]));
    while (done.length < V.length) {
      const u = V.filter(v => !done.includes(v)).reduce((a, b) => (dist[b] < dist[a] ? b : a));
      if (dist[u] === Infinity) break;
      done.push(u);
      const ups = [];
      nb(u).forEach(([v, w]) => { if (!done.includes(v) && dist[u] + w < dist[v]) { dist[v] = dist[u] + w; prev[v] = u; ups.push(`${v} = ${dist[u]} + ${w} = ${dist[v]}`); } });
      fr.push({ dist: { ...dist }, done: done.slice(), prev: { ...prev }, now: u, cap: `เลือก <b>${u}</b> (ระยะ ${dist[u]} น้อยสุดที่ยังไม่ปิด)` + (ups.length ? ` อัปเดต <b>${ups.join(', ')}</b>` : ' ไม่มีระยะไหนลดลง'), w: `เลือก ${u}(${dist[u]})` + (ups.length ? ` อัปเดต ${ups.join(', ')}` : '') });
    }
    const path = v => { const p = [v]; while (prev[p[0]]) p.unshift(prev[p[0]]); return p.join('-'); };
    fr.push({ dist: { ...dist }, done: done.slice(), prev: { ...prev }, fin: true, cap: '<b>ระยะสั้นสุดจาก ' + s + '</b> ' + V.filter(v => v !== s).map(v => `${v} = ${dist[v]}`).join(', '), w: 'สรุป ' + V.filter(v => v !== s).map(v => `${path(v)} : ${dist[v]}`).join(', ') });
    return fr;
  }
  function activityFrames(acts) {
    const A = acts.map((a, i) => ({ s: a[0], f: a[1], i })).sort((a, b) => a.f - b.f), fr = [], pick = [];
    let last = -Infinity;
    fr.push({ A, pick: [], cap: 'เรียงกิจกรรมตาม<b>เวลาสิ้นสุด</b>จากน้อยไปมาก', w: 'เรียงตามเวลาสิ้นสุด: ' + A.map(a => `(${a.s},${a.f})`).join(' ') });
    A.forEach((a, k) => {
      const ok = a.s >= last, prevEnd = last; if (ok) { pick.push(k); last = a.f; }
      fr.push({ A, pick: pick.slice(), now: k, rej: !ok, cap: ok ? (prevEnd === -Infinity ? `<b>(${a.s}, ${a.f}) เลือก</b> เป็นกิจกรรมที่จบเร็วที่สุด` : `<b>(${a.s}, ${a.f}) เลือก</b> เริ่ม ${a.s} ≥ เวลาจบล่าสุด ${prevEnd} ไม่ทับกัน`) : `<b>(${a.s}, ${a.f}) ข้าม</b> เริ่ม ${a.s} ก่อนกิจกรรมที่เลือกไว้จบ (${last})`, w: `(${a.s},${a.f}) ${ok ? 'เลือก' : 'ข้าม'}` });
    });
    fr.push({ A, pick, done: true, cap: `<b>ได้ ${pick.length} กิจกรรม</b> ${pick.map(k => `(${A[k].s}, ${A[k].f})`).join(', ')}`, w: `ได้ ${pick.length} กิจกรรม` });
    return fr;
  }
  function fracFrames(items, W) {
    const A = items.map((it, i) => ({ ...it, i, r: it.v / it.w })).sort((a, b) => b.r - a.r), fr = [];
    let cap = W, val = 0; const take = [];
    fr.push({ A, take: [], val: 0, cap: `คำนวณ v/w: ${A.map(a => `${a.v}/${a.w} = ${a.r}`).join(', ')} แล้วเรียงจากมากไปน้อย`, w: 'v/w: ' + A.map(a => `${a.v}/${a.w} = ${a.r}`).join(', ') });
    for (const a of A) {
      if (cap <= 0) break;
      const x = Math.min(1, cap / a.w), got = a.v * x; cap -= a.w * x; val += got; take.push(x);
      fr.push({ A, take: take.slice(), val, cap: x === 1 ? `ใส่ชิ้น (${a.v}, ${a.w}) <b>ทั้งชิ้น</b> ได้ ${a.v} เหลือที่ ${cap}` : `ที่เหลือ ${a.w * x} ใส่ชิ้น (${a.v}, ${a.w}) ได้ <b>${a.w * x}/${a.w}</b> ได้ ${got}`, w: x === 1 ? `ใส่ (${a.v},${a.w}) ทั้งชิ้น ได้ ${a.v}` : `ใส่ (${a.v},${a.w}) ${a.w * x}/${a.w} ได้ ${got}` });
    }
    fr.push({ A, take, val, done: true, cap: `<b>มูลค่ารวม = ${val}</b>`, w: `มูลค่ารวม ${val}` });
    return fr;
  }
  function huffmanFrames(freqs) {
    let id = 0;
    let q = freqs.map(([s, f]) => ({ id: id++, s, w: f, leaf: true }));
    const r2 = x => Math.round(x * 100) / 100, fr = [];
    fr.push({ q: q.slice(), cap: 'เริ่มจากใบเดี่ยวๆ ตามความถี่ แล้วเรียงจากน้อยไปมาก', w: 'ความถี่: ' + freqs.map(([s, f]) => `${s} ${f}`).join(', ') });
    while (q.length > 1) {
      q.sort((a, b) => a.w - b.w || a.id - b.id);
      const [a, b] = q.splice(0, 2);
      const nd = { id: id++, w: r2(a.w + b.w), kids: [a, b], s: a.s + b.s };
      q.push(nd);
      const nm = x => (x.leaf ? x.s : '{' + x.s.split('').join(',') + '}');
      fr.push({ q: q.slice(), now: nd.id, cap: `หยิบสองค่าที่น้อยที่สุด <b>${nm(a)} (${a.w}) + ${nm(b)} (${b.w}) = ${nd.w}</b> รวมเป็นต้นใหม่`, w: `รวม ${nm(a)}(${a.w}) + ${nm(b)}(${b.w}) = ${nd.w}` });
    }
    const codes = {}; const walk = (nd, c) => { if (nd.leaf) codes[nd.s] = c || '0'; else { walk(nd.kids[0], c + '0'); walk(nd.kids[1], c + '1'); } };
    walk(q[0], '');
    const avg = r2(freqs.reduce((s, [x, f]) => s + f * codes[x].length, 0));
    fr.push({ q: q.slice(), tree: q[0], codes, done: true, cap: `ซ้าย = 0 ขวา = 1 ได้รหัส ${freqs.map(([s]) => `${s} = ${codes[s]}`).join(', ')} <b>เฉลี่ย ${avg} บิต</b>`, w: `รหัส ${freqs.map(([s]) => `${s}=${codes[s]}`).join(' ')} เฉลี่ย = ${freqs.map(([s, f]) => `${f}×${codes[s].length}`).join(' + ')} = ${avg}` });
    return fr;
  }

  return { distCount, shiftTable, horspoolFrames, bmD2, bmFrames, hashFrames, letterSum, btreeStart, btreeInsert, fibTree, coinRowFrames, changeFrames, collectFrames, knapFrames, closureFrames, lcsFrames, primFrames, kruskalFrames, dijkstraFrames, activityFrames, fracFrames, huffmanFrames };
})();
if (typeof module !== 'undefined') module.exports = A7;
