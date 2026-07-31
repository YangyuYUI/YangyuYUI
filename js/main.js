const $ = (id) => document.getElementById(id);


/* ---------- 裝備欄位 / 數值重算 ---------- */

const SLOT_META = {
  weapon:    { icon: '⚔', label: '武器', statLabel: '力量' },
  armor:     { icon: '◈', label: '防具', statLabel: '防禦' },
  accessory: { icon: '✧', label: '飾品', statLabel: '速度' },
};

// 統一從「基礎值」與「目前裝備」重新算出角色最終數值。任何會影響數值的操作
// （升級、選擇職業、裝備／卸下、拾得裝備）之後都必須呼叫這個函式，才能讓
// 戰鬥、行囊、英雄面板看到的數字保持一致。
function recalcStats() {
  let atk = state.baseAtk, def = state.baseDef, spd = state.baseSpd, maxHp = state.baseMaxHp;
  let critChance = state.baseCritChance || 0, lifesteal = 0, block = state.baseBlock || 0, luck = state.baseLuck || 0;
  Object.values(state.equipment).forEach((id) => {
    if (!id) return;
    const item = state.inventory.find((i) => i.id === id);
    if (!item) return;
    if (item.stat === 'atk') atk += item.value;
    else if (item.stat === 'def') def += item.value;
    else if (item.stat === 'spd') spd += item.value;
    (item.affixes || []).forEach((a) => {
      if (a.stat === 'maxHp') maxHp += a.value;
      else if (a.stat === 'critChance') critChance += a.value;
      else if (a.stat === 'lifesteal') lifesteal += a.value;
      else if (a.stat === 'block') block += a.value;
      else if (a.stat === 'luck') luck += a.value;
    });
  });
  state.atk = atk; state.def = def; state.spd = spd; state.maxHp = maxHp;
  state.critChance = Math.round(critChance * 1000) / 1000;
  state.lifesteal = Math.round(lifesteal * 1000) / 1000;
  state.block = Math.round(block * 1000) / 1000;
  state.luck = Math.round(luck * 1000) / 1000;
  if (state.hp > state.maxHp) state.hp = state.maxHp;
}

function equipItem(id) {
  const item = state.inventory.find((i) => i.id === id);
  if (!item) return;
  const prevId = state.equipment[item.slotKey];
  if (prevId === id) return;
  const prevItem = prevId ? state.inventory.find((i) => i.id === prevId) : null;
  state.equipment[item.slotKey] = id;
  recalcStats();
  toast(prevItem ? `已裝備${item.name}，並卸下了${prevItem.name}。` : `已裝備${item.name}。`);
  render(); save(true);
}

function unequipItem(slotKey) {
  const id = state.equipment[slotKey];
  if (!id) return;
  const item = state.inventory.find((i) => i.id === id);
  state.equipment[slotKey] = null;
  recalcStats();
  toast(`已卸下${item ? item.name : '裝備'}，該欄位目前空著，能力會回到基礎值。`);
  render(); save(true);
}

document.addEventListener('click', (event) => {
  const equipBtn = event.target.closest('[data-equip]');
  if (equipBtn) { equipItem(equipBtn.dataset.equip); return; }
  const unequipBtn = event.target.closest('[data-unequip]');
  if (unequipBtn) unequipItem(unequipBtn.dataset.unequip);
});

/* ---------- 商店（補給） ---------- */

document.addEventListener('click', (event) => {
  const button = event.target.closest('[data-buy]');
  if (!button) return;
  const type = button.dataset.buy, price = type === 'potion' ? 35 : 85;
  if (state.gold < price) return toast('金幣不足，無法購買這項商品。');
  state.gold -= price;
  if (type === 'potion') {
    state.potions = (state.potions || 0) + 1;
    toast(`購入餘燼藥劑一瓶，目前持有 ${state.potions} 瓶，可在英雄面板或戰鬥中使用。`);
  } else { loot(); }
  render(); save(true);
});

/* ---------- 渲染 ---------- */

function render() {
  $('gold').textContent = state.gold; $('shards').textContent = state.shards; $('level').textContent = state.level;
  $('xp').textContent = state.xp; $('xp-next').textContent = state.maxXp; $('xp-bar').style.width = `${state.xp / state.maxXp * 100}%`;
  $('hp-value').textContent = `${state.hp} / ${state.maxHp}`; $('hp-bar').style.width = `${state.hp / state.maxHp * 100}%`;
  $('atk').textContent = state.atk; $('def').textContent = state.def; $('spd').textContent = state.spd;
  const rate = state.bossHp / state.bossMax * 100;
  $('boss-hp').textContent = comma(state.bossHp); $('boss-percent').textContent = `${rate.toFixed(1)}%`; $('boss-bar').style.width = `${rate}%`;
  $('contribution').textContent = comma(state.contribution);
  $('class-name').textContent = state.profession || (state.level >= 5 ? '可選職業' : '旅人');
  $('career-title').textContent = state.professionBranch || state.profession || (state.level >= 5 ? '起源法則正在等待' : '尚未覺醒');
  
  let careerCopy = '';
  if (state.professionBranch) {
    const pDef = PROFESSIONS[state.profession];
    const bDef = pDef.branches[state.professionBranch];
    careerCopy = `你已覺醒為${state.professionBranch}。${bDef.passiveText}戰鬥中可使用技能「${bDef.skillName}」。`;
  } else if (state.profession) {
    careerCopy = `你已選擇${state.profession}。${PROFESSIONS[state.profession].passiveText}戰鬥中可使用技能「${PROFESSIONS[state.profession].skillName}」。${state.level >= 10 ? '進階職業抉擇已開放。' : '職業分支將在 Lv.10 開放。'}`;
  } else {
    careerCopy = state.level >= 5 ? '選擇一個生活職業，為旅途奠定根基。' : '持續探索、擊敗敵人，讓起源法則辨認你的道路。';
  }
  $('career-copy').textContent = careerCopy;
  
  document.querySelectorAll('.profession-options').forEach(e => {
    e.classList.toggle('unlocked', (state.level >= 5 && !state.profession) || (state.level >= 10 && state.profession && !state.professionBranch));
  });
  renderEquipmentSlots(); renderConsumables(); renderInventory(); renderHeroBonuses(); renderCodex();
}

function potionHealAmount() { return state.profession === '鍊金師' ? 68 : 45; }

function renderConsumables() {
  const countEl = $('potion-count'), subEl = $('potion-sub'), quickBtn = $('potion-quick-btn');
  if (!countEl) return;
  countEl.textContent = state.potions || 0;
  subEl.textContent = state.potions > 0
    ? `恢復 ${potionHealAmount()} 點生命${state.profession === '鍊金師' ? '（鍊金師效果 +50%）' : ''}，戰鬥中使用會消耗一個回合`
    : '尚未持有，可到市集的補給商人購買';
  if (quickBtn) quickBtn.disabled = !state.potions || state.hp === state.maxHp;
}

function usePotionOutOfBattle() {
  if (!state.potions) return toast('沒有藥劑了，可以到市集購買。');
  if (state.hp === state.maxHp) return toast('生命值已滿，暫時不需要使用藥劑。');
  state.potions--;
  const healed = Math.min(potionHealAmount(), state.maxHp - state.hp);
  state.hp += healed;
  toast(`飲下餘燼藥劑，恢復了 ${healed} 點生命，剩餘 ${state.potions} 瓶。`);
  render(); save(true);
}

function renderEquipmentSlots() {
  Object.keys(SLOT_META).forEach((key) => {
    const meta = SLOT_META[key];
    const nameEl = $(`eq-${key}-name`), subEl = $(`eq-${key}-sub`), valEl = $(`eq-${key}-value`);
    if (!nameEl) return;
    const id = state.equipment[key];
    const item = id ? state.inventory.find((i) => i.id === id) : null;
    if (item) {
      nameEl.textContent = item.name;
      subEl.textContent = `${item.rarity} · ${meta.label}`;
      valEl.textContent = `+${item.value} ${meta.statLabel}`;
    } else {
      nameEl.textContent = '尚未裝備';
      subEl.textContent = `${meta.label}欄位是空的`;
      valEl.textContent = '';
    }
  });
}

function renderHeroBonuses() {
  const el = $('hero-bonuses'); if (!el) return;
  const bits = [];
  if (state.critChance > 0) bits.push(`✹ 暴擊 +${Math.round(state.critChance * 100)}%`);
  if (state.lifesteal > 0) bits.push(`🩸 嗜血 +${Math.round(state.lifesteal * 100)}%`);
  if (state.block > 0) bits.push(`🛡 格擋 +${Math.round(state.block * 100)}%`);
  if (state.luck > 0) bits.push(`✧ 幸運 +${Math.round(state.luck * 100)}%`);
  el.innerHTML = bits.length ? bits.map(b => `<span>${b}</span>`).join('') : '';
}

function renderInventory() {
  const e = $('inventory-list');
  $('inventory-count').textContent = `${state.inventory.length} 件`;
  if (!state.inventory.length) { e.innerHTML = '<p class="empty-state">尚未獲得裝備。探索荒原、擊敗敵人吧。</p>'; return; }
  e.innerHTML = state.inventory.slice().reverse().map(i => {
    const equipped = state.equipment[i.slotKey] === i.id;
    const affixLine = (i.affixes && i.affixes.length) ? `<div class="item-affixes">${i.affixes.map(a => `<span>${a.icon} ${a.desc}</span>`).join('')}</div>` : '';
    const statLabel = i.stat === 'atk' ? '力量' : i.stat === 'def' ? '防禦' : '速度';
    const equippedTag = equipped ? ' · <span class="equipped-tag">已裝備中</span>' : '';
    const actionBtn = equipped
      ? `<button class="equip-btn" data-unequip="${i.slotKey}">卸下</button>`
      : `<button class="equip-btn" data-equip="${i.id}">裝備</button>`;
    return `<div class="loot-item${equipped ? ' is-equipped' : ''}"><span>${i.icon}</span><p><b>${i.name}</b><small>${i.rarity} · ${i.slot} · seed ${i.seed}${equippedTag}</small>${affixLine}</p><em>+${i.value} ${statLabel}</em>${actionBtn}</div>`;
  }).join('');
}

function renderCodex() {
  const tiersEl = $('codex-tiers');
  if (tiersEl) {
    tiersEl.innerHTML = TIERS.map(t => `<div class="codex-tier-row" style="--tier-color:${t.color}"><span class="tier-badge">${t.name}</span><small>${t.id <= 3 ? '第一大陸已知' : t.id === 4 ? '高階大陸傳聞' : '世界級威脅'}</small></div>`).join('');
  }
  const affixEl = $('codex-affixes');
  if (affixEl) {
    affixEl.innerHTML = state.discoveredAffixes.length
      ? state.discoveredAffixes.map(id => { const a = AFFIXES.find(x => x.id === id); return a ? `<div class="codex-affix-row"><span>${a.icon} ${a.name}</span><small>${a.desc}</small></div>` : ''; }).join('')
      : '<p class="empty-state">尚未遭遇擁有特殊詞綴的強敵。</p>';
  }
  const monEl = $('codex-monsters');
  if (monEl) {
    monEl.innerHTML = state.discoveredMonsters.length
      ? state.discoveredMonsters.map(name => { const tpl = MONSTER_POOL.find(m => m.name === name) || BOSS_INFO[name]; return tpl ? `<div class="codex-monster-row"><span>${tpl.icon}</span><b>${name}</b></div>` : ''; }).join('')
      : '<p class="empty-state">尚未記錄任何生物。</p>';
  }
  const loreEl = $('codex-lore');
  if (loreEl) {
    loreEl.innerHTML = state.discoveredLore.length
      ? state.discoveredLore.map(text => `<div class="codex-affix-row"><small>${text}</small></div>`).join('')
      : '<p class="empty-state">尚未拾得任何見聞碎片。</p>';
  }
}

/* ---------- 成長 / 職業 ---------- */

function gainXp(n) {
  state.xp += n;
  while (state.xp >= state.maxXp) {
    state.xp -= state.maxXp; state.level++; state.maxXp = Math.round(state.maxXp * 1.35);
    state.baseMaxHp += 18; state.baseAtk += 4; state.baseDef += 2; state.baseSpd++;
    recalcStats(); state.hp = state.maxHp;
    toast(`升至 Lv.${state.level}！生命上限與各項基礎能力已提升，生命也已回滿。`);
    if (state.level === 5 && !state.profession) { setTimeout(openProfession, 700); announce('起源法則回應了你的成長：<b>生活職業抉擇已開放。</b>'); }
    if (state.level === 10 && state.profession && !state.professionBranch) { setTimeout(openProfessionBranch, 700); announce('力量的盡頭出現了分歧：<b>進階職業抉擇已開放。</b>'); }
  }
}
function openProfession() { if (state.level >= 5 && !state.profession) { $('profession-modal').classList.add('open'); $('profession-modal').setAttribute('aria-hidden', 'false'); } }
function chooseProfession(name) {
  if (state.profession || state.level < 5) return;
  const def = PROFESSIONS[name]; if (!def) return;
  state.profession = name;
  def.applyBase();
  recalcStats(); state.hp = state.maxHp;
  $('profession-modal').classList.remove('open');
  announce(`你選擇了<b>${name}</b>之道。${def.passiveText}`);
  toast(`你已覺醒為${name}！${def.passiveText}戰鬥中可使用技能「${def.skillName}」。`);
  
  // 重新渲染畫面與英雄面板中的按鈕
  renderProfessionBranchOptions();
  save(true); render();
}

function openProfessionBranch() { 
  if (state.level >= 10 && state.profession && !state.professionBranch) { 
    renderProfessionBranchOptions();
    $('branch-modal').classList.add('open'); 
    $('branch-modal').setAttribute('aria-hidden', 'false'); 
  } 
}

function renderProfessionBranchOptions() {
  const container = $('branch-options-container');
  const modalContainer = $('modal-branch-options');
  if (!container || !modalContainer || !state.profession) return;
  
  const branches = PROFESSIONS[state.profession].branches;
  let html = '';
  Object.keys(branches).forEach(bName => {
    const b = branches[bName];
    html += `<button data-branch="${bName}"><b>${bName}</b><small>${b.passiveText}<br>技能「${b.skillName}」：${b.skillHint}</small></button>`;
  });
  container.innerHTML = html;
  modalContainer.innerHTML = html;
  
  const bindClicks = (parent) => {
    parent.querySelectorAll('[data-branch]').forEach(btn => btn.onclick = () => chooseProfessionBranch(btn.dataset.branch));
  };
  bindClicks(container);
  bindClicks(modalContainer);
}

function chooseProfessionBranch(name) {
  if (state.professionBranch || state.level < 10 || !state.profession) return;
  const bDef = PROFESSIONS[state.profession].branches[name]; if (!bDef) return;
  state.professionBranch = name;
  bDef.applyBase();
  recalcStats(); state.hp = state.maxHp;
  $('branch-modal').classList.remove('open');
  announce(`你在 ${state.profession} 的道路上走到了極致，覺醒為<b>${name}</b>。${bDef.passiveText}`);
  toast(`你已轉職為${name}！戰鬥中可使用新技能「${bDef.skillName}」。`);
  save(true); render();
}

/* ---------- 裝備掉落 ---------- */

function pickRarity() {
  const total = ITEM_RARITIES.reduce((s, r) => s + r.weight, 0);
  let roll = Math.random() * total;
  for (const r of ITEM_RARITIES) { if (roll < r.weight) return r; roll -= r.weight; }
  return ITEM_RARITIES[0];
}
function rollItemAffixes(rarityDef) {
  const n = rarityDef.maxAffix === 0 ? 0 : (rarityDef.maxAffix === 1 ? 1 : (Math.random() < .5 ? 2 : 1));
  const pool = [...ITEM_AFFIXES], picked = [];
  for (let i = 0; i < n && pool.length; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    const def = pool.splice(idx, 1)[0];
    const raw = def.min + Math.random() * (def.max - def.min);
    const value = def.max < 1 ? Math.round(raw * 1000) / 1000 : Math.round(raw);
    picked.push({ id: def.id, name: def.name, icon: def.icon, stat: def.stat, value, desc: def.desc(value) });
  }
  return picked;
}
function loot() {
  const b = bases[Math.floor(Math.random() * bases.length)];
  const rarity = pickRarity();
  const baseVal = 2 + Math.floor(Math.random() * 3);
  const v = Math.round(baseVal * rarity.mult);
  const affixes = rollItemAffixes(rarity);
  state.itemSeq = (state.itemSeq || 0) + 1;
  const item = {
    id: `it${state.itemSeq}`,
    name: `${prefixes[Math.floor(Math.random() * prefixes.length)]}${b.name}`,
    slot: b.slot, slotKey: b.slotKey, stat: b.stat, icon: b.icon,
    rarity: rarity.name, rarityId: rarity.id, value: v,
    seed: Math.random().toString(36).slice(2, 8).toUpperCase(), affixes,
  };
  state.inventory.push(item);
  const rarityTag = rarity.id !== 'common' ? `（${rarity.name}）` : '';
  if (!state.equipment[b.slotKey]) {
    // 該欄位目前是空的，直接幫玩家裝備上，省去一趟行囊操作
    state.equipment[b.slotKey] = item.id;
    recalcStats();
    announce(`你從荒原遺跡尋得 <b>${item.name}</b>${rarityTag}，並自動裝備於${b.slot}欄位。`);
    toast(`獲得${rarity.name}裝備「${item.name}」，已自動裝備。`);
  } else {
    announce(`你從荒原遺跡尋得 <b>${item.name}</b>${rarityTag}，已收入行囊，可至「英雄」頁籤裝備。`);
    toast(`獲得${rarity.name}裝備「${item.name}」，收入行囊，可到行囊中裝備替換。`);
  }
}

/* ---------- 遭遇 / 分級 / 詞綴生成 ---------- */

function pickTier(level) {
  let pool;
  if (level < 3) pool = [1, 1, 1, 1];
  else if (level < 5) pool = [1, 1, 1, 2];
  else if (level < 8) pool = [1, 1, 2, 2, 3];
  else pool = [1, 2, 2, 3, 3, 4];
  return pool[Math.floor(Math.random() * pool.length)];
}
function rollAffixesForTier(tier) {
  if (tier <= 1) return [];
  const count = tier === 2 ? (Math.random() < .5 ? 1 : 0) : tier === 3 ? (Math.random() < .5 ? 2 : 1) : (Math.random() < .6 ? 2 : 1);
  const pool = [...AFFIXES], picked = [];
  while (picked.length < count && pool.length) { const i = Math.floor(Math.random() * pool.length); picked.push(pool.splice(i, 1)[0].id); }
  return picked;
}
function rollEncounter(level) {
  const tpl = MONSTER_POOL[Math.floor(Math.random() * MONSTER_POOL.length)];
  const tier = pickTier(level), tdef = TIERS[tier - 1];
  const affixes = rollAffixesForTier(tier);
  return { name: tpl.name, icon: tpl.icon, text: tpl.text, tier, affixes, hp: Math.round(tpl.hp * tdef.hpMult), atk: Math.round(tpl.atk * tdef.atkMult) };
}
function rollBossAffixes() {
  const pool = [...AFFIXES], picked = [];
  while (picked.length < 2 && pool.length) { const i = Math.floor(Math.random() * pool.length); picked.push(pool.splice(i, 1)[0].id); }
  return picked;
}

let currentEvent = null;
function openEventChoice(ev) {
  setEventTag('choice');
  currentEvent = ev;
  $('event-modal-icon').textContent = ev.icon;
  $('event-modal-title').textContent = ev.title;
  $('event-modal-text').textContent = ev.text;
  $('event-modal-options').innerHTML = ev.options.map((o, i) => `<button data-idx="${i}"><b>${o.label}</b><small>${o.hint}</small></button>`).join('');
  $('event-modal-options').querySelectorAll('button').forEach(btn => btn.onclick = () => chooseEventOption(Number(btn.dataset.idx)));
  $('event-text').textContent = ev.text;
  $('event-modal').classList.add('open');
}
function closeEventModal() { $('event-modal').classList.remove('open'); currentEvent = null; }
function chooseEventOption(idx) {
  const ev = currentEvent; if (!ev) return;
  closeEventModal();
  ev.options[idx].resolve();
  recalcStats(); // 部分抉擇事件會提升基礎屬性，統一在這裡重算，避免結果被漏算
  render(); save(true);
}

function triggerExploration() {
  if (state.hp < 15) return toast('生命過低，請先休整。');
  const type = pickExplorationType();
  if (type === 'combat') { setEventTag('combat'); openBattle('encounter', rollEncounter(state.level)); return; }
  if (type === 'treasure') return resolveTreasure();
  if (type === 'lore') return resolveLore();
  if (type === 'hazard') return resolveHazard();
  if (type === 'choice') return openEventChoice(CHOICE_EVENTS[Math.floor(Math.random() * CHOICE_EVENTS.length)]);
}

/* ---------- 戰鬥 ---------- */

function renderEnemyTags(enemy) {
  const el = $('enemy-tags'); if (!el) return;
  const tdef = TIERS[enemy.tier - 1];
  let html = `<span class="tier-badge" style="--tier-color:${tdef.color}">${tdef.name}</span>`;
  (enemy.affixes || []).forEach(id => { const a = AFFIXES.find(x => x.id === id); if (a) html += `<span class="affix-chip" title="${a.desc}">${a.icon} ${a.name}</span>`; });
  el.innerHTML = html;
}

function pickEnemyIntent(b) {
  const enemy = b.enemy;
  if (enemy.currentHp <= 0) return;
  const intents = [
    { type: 'attack', name: '準備攻擊', icon: '⚔' },
    { type: 'heavy', name: '蓄力重擊', icon: '💥' },
    { type: 'defend', name: '防禦姿態', icon: '🛡' },
  ];
  let roll = Math.random();
  if (enemy.affixes.includes('berserk') && enemy.currentHp / enemy.hp < 0.5) roll += 0.3; // 狂暴血少時更常重擊
  if (roll < 0.2) b.enemyIntent = intents[2];
  else if (roll < 0.8) b.enemyIntent = intents[0];
  else b.enemyIntent = intents[1];
}

function openBattle(kind, enemy) {
  state.guarding = false;
  state.battle = { kind, enemy: { ...enemy, currentHp: enemy.hp, wardCounter: 0 }, playerHp: state.hp, dots: [], enemyShieldActive: false, skillCd: 0, ironBody: false, enemyWeakenTurns: 0, scholarCritTurns: 0 };
  if (kind === 'encounter' && !state.discoveredMonsters.includes(enemy.name)) state.discoveredMonsters.push(enemy.name);
  (enemy.affixes || []).forEach(id => { if (!state.discoveredAffixes.includes(id)) state.discoveredAffixes.push(id); });
  const tier = enemy.tier || 1;
  $('battle-kind').textContent = kind === 'boss' ? '世界級地牢' : (tier >= 3 ? '強敵遭遇' : tier === 2 ? '精英遭遇' : '遭遇戰');
  $('enemy-name').textContent = enemy.name;
  $('monster-icon').textContent = enemy.icon;
  $('battle-log').textContent = kind === 'boss' ? '灰燼巨像的裂縫中湧出熾熱風暴。' : enemy.text;
  renderEnemyTags(state.battle.enemy);
  
  const pDef = state.profession ? PROFESSIONS[state.profession] : null;
  if (pDef && state.professionBranch) {
    const bDef = pDef.branches[state.professionBranch];
    if (bDef.onBattleStart) bDef.onBattleStart(state.battle);
  }
  pickEnemyIntent(state.battle);
  
  $('battle-modal').classList.add('open');
  renderBattle();
}
function renderBattle() {
  const b = state.battle; if (!b) return;
  $('enemy-hp-text').textContent = `${comma(b.enemy.currentHp)} / ${comma(b.enemy.hp)}`;
  $('enemy-hp-bar').style.width = `${Math.max(0, b.enemy.currentHp / b.enemy.hp * 100)}%`;
  $('player-hp-text').textContent = `${Math.max(0, b.playerHp)} / ${state.maxHp}`;
  $('battle-player-hp').style.width = `${Math.max(0, b.playerHp / state.maxHp * 100)}%`;
  const playerIcon = document.querySelector('.player-icon');
  if (playerIcon) playerIcon.classList.toggle('is-guarding', !!state.guarding);
  
  if (b.enemyIntent) {
    const el = $('enemy-intent');
    if (el) el.innerHTML = `<span>${b.enemyIntent.icon}</span> ${b.enemy.name} ${b.enemyIntent.name}`;
  }
  
  const pDots = $('player-dots');
  if (pDots) {
    pDots.innerHTML = (b.dots && b.dots.length) ? b.dots.map(d => `<span class="dot-tag ${d.type}">${d.type === 'venom' ? '☠' : '🔥'} ${d.turns}</span>`).join('') : '';
  }

  renderBattleActionButtons(b);
}

function renderBattleActionButtons(b) {
  const skillBtn = $('skill-btn'), potionBtn = $('potion-btn');
  if (skillBtn) {
    const pDef = state.profession ? PROFESSIONS[state.profession] : null;
    if (!pDef) { skillBtn.disabled = true; skillBtn.innerHTML = '職業技能 <small>Lv.5 選擇生活職業後解鎖</small>'; }
    else { 
      const def = (state.professionBranch && pDef.branches[state.professionBranch]) ? pDef.branches[state.professionBranch] : pDef;
      if (b.skillCd > 0) { skillBtn.disabled = true; skillBtn.innerHTML = `${def.skillName} <small>冷卻中，還需 ${b.skillCd} 回合</small>`; }
      else { skillBtn.disabled = false; skillBtn.innerHTML = `${def.skillName} <small>${def.skillHint}</small>`; }
    }
  }
  if (potionBtn) {
    if (!state.potions) { potionBtn.disabled = true; potionBtn.innerHTML = '飲下藥劑 <small>行囊中沒有藥劑，先到市集購買</small>'; }
    else { potionBtn.disabled = false; potionBtn.innerHTML = `飲下藥劑 <small>剩餘 ${state.potions} 瓶，恢復生命並消耗一個回合</small>`; }
  }
}

function useBattleSkill() {
  const b = state.battle; if (!b || b.skillCd > 0) return;
  const pDef = state.profession ? PROFESSIONS[state.profession] : null; if (!pDef) return;
  const def = (state.professionBranch && pDef.branches[state.professionBranch]) ? pDef.branches[state.professionBranch] : pDef;
  b.skillCd = def.skillCooldown;
  def.useSkill(b);
}

function useBattlePotion() {
  const b = state.battle; if (!b || !state.potions) return;
  state.potions--;
  const heal = potionHealAmount();
  const healed = Math.min(heal, state.maxHp - b.playerHp);
  b.playerHp = Math.min(state.maxHp, b.playerHp + heal);
  state.hp = Math.max(1, b.playerHp);
  $('battle-log').innerHTML = `你在戰鬥中飲下餘燼藥劑，恢復了 <b>${healed}</b> 點生命，但也把這個回合讓給了對手。`;
  renderBattle(); render(); save(true);
  setTimeout(enemyTurn, 550);
}
function closeBattle() { $('battle-modal').classList.remove('open'); state.battle = null; render(); save(true); }

function retreat(msg) {
  const b = state.battle;
  b.playerHp = 0; state.hp = Math.max(1, Math.ceil(state.maxHp * .35));
  renderBattle();
  setTimeout(() => { toast(msg); closeBattle(); }, 900);
}

function addDot(b, type) {
  b.dots = b.dots || [];
  const existing = b.dots.find(d => d.type === type);
  if (type === 'scorch') { if (existing) existing.turns = 3; else b.dots.push({ type, dmg: 6, turns: 3 }); }
  if (type === 'venom') { if (existing) existing.turns = 4; else b.dots.push({ type, dmg: 4, turns: 4 }); }
}
function tickDots(b) {
  if (!b.dots || !b.dots.length) return;
  const total = b.dots.reduce((s, d) => s + d.dmg, 0);
  if (total > 0) {
    b.playerHp -= total;
    $('battle-log').textContent = `殘留的傷勢侵蝕了 ${total} 點生命。`;
    renderBattle();
  }
  b.dots = b.dots.map(d => ({ ...d, turns: d.turns - 1 })).filter(d => d.turns > 0);
  if (b.playerHp <= 0 && state.battle) retreat('傷勢過重，你撤回營地療傷。');
}

function attack() {
  const b = state.battle; if (!b) return;
  const enemy = b.enemy;
  
  const pDef = state.profession ? PROFESSIONS[state.profession] : null;
  if (pDef && state.professionBranch) {
    const bDef = pDef.branches[state.professionBranch];
    if (bDef.onAttack) bDef.onAttack(b);
  }
  
  let critChance = .16 + (state.critChance || 0);
  let scholarNote = '';
  if (b.scholarCritTurns > 0) { critChance += .35; scholarNote = '（洞察弱點加持）'; b.scholarCritTurns--; }
  const crit = Math.random() < critChance;
  let d = Math.round(state.atk * (crit ? 1.85 : 1) + Math.random() * 5);
  if (enemy.affixes.includes('ironhide')) d = Math.ceil(d * .75);
  let shieldBlocked = false;
  if (enemy.affixes.includes('warded') && b.enemyShieldActive) { d = Math.ceil(d * .3); b.enemyShieldActive = false; shieldBlocked = true; }
  enemy.currentHp -= d;
  let log = `你施展斬擊，造成 <b>${d}</b> 點傷害${crit ? ` · 暴擊${scholarNote}！` : ''}${shieldBlocked ? ' · 護盾抵擋大半傷害' : ''}`;
  if (state.lifesteal > 0) {
    const heal = Math.round(d * state.lifesteal);
    if (heal > 0) { state.hp = Math.min(state.maxHp, state.hp + heal); b.playerHp = Math.min(state.maxHp, b.playerHp + heal); log += ` · 汲取回復 ${heal} 點生命`; }
  }
  if (enemy.affixes.includes('thorns')) { const reflect = Math.ceil(d * .15); b.playerHp -= reflect; log += ` · 反射造成 ${reflect} 點傷害`; }
  $('battle-log').innerHTML = log;
  renderBattle();
  if (b.playerHp <= 0) return retreat('反射傷害擊倒了你，你撤回營地療傷。');
  if (enemy.currentHp <= 0) return victory();
  setTimeout(enemyTurn, 550);
}

function swiftExtraHit(b) {
  if (!state.battle) return;
  const enemy = b.enemy;
  let d = Math.max(2, Math.round((enemy.atk - state.def) * .7) + (Math.random() * 4 | 0));
  if (state.block > 0) d = Math.ceil(d * (1 - state.block));
  b.playerHp -= d;
  $('battle-log').textContent = `${enemy.name}的速度快得驚人，追加一擊造成 ${d} 點傷害。`;
  renderBattle();
  if (b.playerHp <= 0) retreat('你撤回營地，恢復了部分生命。');
}

function enemyTurn() {
  const b = state.battle; if (!b) return;
  tickDots(b);
  if (!state.battle) return;
  const enemy = b.enemy;
  
  if (b.enemyStunned) {
    $('battle-log').innerHTML = `${enemy.name} 被困住，無法行動！`;
    b.enemyStunned = false;
    if (b.skillCd > 0) b.skillCd--;
    pickEnemyIntent(b);
    renderBattle();
    return;
  }
  
  let atk = enemy.atk, weakenNote = '';
  if (b.enemyWeakenTurns > 0) { atk = Math.round(atk * .55); weakenNote = '（被削弱）'; b.enemyWeakenTurns--; }
  let d = Math.max(2, atk - state.def + (Math.random() * 6 | 0));
  
  if (b.enemyIntent?.type === 'heavy') d = Math.round(d * 1.8);
  if (b.enemyIntent?.type === 'defend') d = Math.round(d * 0.4);
  
  if (enemy.affixes.includes('berserk')) { const missing = 1 - enemy.currentHp / enemy.hp; d = Math.round(d * (1 + missing * .6)); }
  
  if (b.absoluteGuard) {
    d = 0;
    b.absoluteGuard = false;
  } else if (state.guarding) { 
    d = Math.ceil(d * .38); state.guarding = false; 
  }
  
  let ironNote = '';
  if (b.ironBody) {
    d = Math.ceil(d * .25);
    const reflect = Math.max(3, Math.round(state.def * .8));
    enemy.currentHp -= reflect;
    ironNote = `「鋼鐵之軀」大幅化解了衝擊，並反彈 <b>${reflect}</b> 點傷害給${enemy.name}。`;
    b.ironBody = false;
  }
  if (state.block > 0) d = Math.ceil(d * (1 - state.block));
  
  let immuneNote = '';
  if (b.immuneNextTurn) {
    immuneNote = '（免疫了異常狀態）';
    b.immuneNextTurn = false;
  }
  
  b.playerHp -= d;
  let log = `${enemy.name} ${b.enemyIntent?.name || '反擊'}${weakenNote}，造成 ${d} 點傷害。${ironNote}`;
  if (enemy.affixes.includes('leech') && enemy.currentHp < enemy.hp) { const heal = Math.ceil(d * .25); enemy.currentHp = Math.min(enemy.hp, enemy.currentHp + heal); log += ` ${enemy.name}汲取生命回復 ${heal} 點。`; }
  
  if (!immuneNote) {
    if (enemy.affixes.includes('scorch')) { addDot(b, 'scorch'); log += ' 灼熱附著在你身上。'; }
    if (enemy.affixes.includes('venom')) { addDot(b, 'venom'); log += ' 你中毒了。'; }
  } else {
    log += immuneNote;
  }
  
  if (enemy.affixes.includes('warded') && b.enemyIntent?.type === 'defend') {
    b.enemyShieldActive = true; log += ` ${enemy.name}凝聚出守護結界。`;
  } else if (enemy.affixes.includes('warded')) {
    enemy.wardCounter = (enemy.wardCounter || 0) + 1;
    if (enemy.wardCounter >= 3) { enemy.wardCounter = 0; b.enemyShieldActive = true; log += ` ${enemy.name}凝聚出守護結界。`; }
  }
  
  if (b.skillCd > 0) b.skillCd--;
  $('battle-log').innerHTML = log;
  if (enemy.currentHp <= 0) return victory(); // 鋼鐵之軀的反彈傷害有機會直接了結敵人
  if (b.playerHp <= 0) return retreat('你撤回營地，恢復了部分生命。');
  
  pickEnemyIntent(b);
  
  if (enemy.affixes.includes('swift') && Math.random() < .3) setTimeout(() => swiftExtraHit(b), 550);
  else renderBattle();
}

function victory() {
  const b = state.battle;
  if (b.kind === 'boss') {
    const d = Math.min(b.enemy.hp, state.bossHp);
    state.bossHp -= d; state.contribution += d; state.shards += 3; gainXp(60);
    announce(`你對灰燼巨像造成 <b>${comma(d)}</b> 傷害。`);
    if (state.bossHp <= 0) { announce('<b>起源法則已穩定！</b>職業系統正式開放。'); toast('灰燼巨像已被修復，第一大陸的起源法則重新穩定！'); }
    else toast(`對灰燼巨像造成 ${comma(d)} 點傷害，世界貢獻已累計，並獲得 3 個靈魂碎片。`);
  } else {
    const tierMult = 1 + (b.enemy.tier - 1) * .35;
    const c = Math.round((10 + Math.floor(Math.random() * 11)) * tierMult);
    const xpGain = Math.round(28 * tierMult);
    state.gold += c; gainXp(xpGain);
    if (Math.random() < .28 + state.luck) loot();
    toast(`戰鬥勝利！獲得 ${c} 枚金幣與 ${xpGain} 點經驗${b.enemy.tier >= 2 ? '，並額外獲得精英擊破獎勵' : ''}。`);
    $('event-text').textContent = '荒原暫時恢復寂靜，但更深處仍傳來不屬於風的低語。';
  }
  state.hp = Math.max(1, b.playerHp);
  renderBattle(); save(true);
  setTimeout(closeBattle, 800);
}

/* ---------- 事件綁定 ---------- */

$('explore-btn').onclick = () => triggerExploration();
$('boss-btn').onclick = () => {
  if (state.bossHp <= 0) return toast('灰燼巨像已被修復。');
  if (state.hp < 35) return toast('挑戰世界 Boss 需要至少 35 點生命。');
  openBattle('boss', { name: '灰燼巨像', hp: 420, atk: 18, icon: '♛', tier: 5, affixes: rollBossAffixes(), text: '' });
};
$('attack-btn').onclick = attack;
$('guard-btn').onclick = () => {
  if (!state.battle) return;
  state.guarding = true;
  $('battle-log').textContent = state.profession === '鐵匠' ? '你擺出鍛匠架式，準備將衝擊化為修復之力。' : '你穩住呼吸，準備承受下一次衝擊。';
  renderBattle();
  setTimeout(enemyTurn, 450);
};
$('skill-btn').onclick = useBattleSkill;
$('potion-btn').onclick = useBattlePotion;
$('close-modal').onclick = closeBattle;
$('close-event-modal').onclick = closeEventModal;
$('rest-btn').onclick = () => { if (state.hp === state.maxHp) return toast('生命值已滿，暫時不需要休整。'); const n = Math.min(state.maxHp - state.hp, 28); state.hp += n; render(); save(true); toast(`你在餘燼旁休整，恢復了 ${n} 點生命。`); };
$('potion-quick-btn').onclick = usePotionOutOfBattle;
$('save-btn').onclick = () => save();
$('reset-btn').onclick = () => { if (confirm('確定要重設這個瀏覽器中的原型進度嗎？此動作無法復原。')) { localStorage.removeItem(saveKey); state = fresh(); recalcStats(); render(); toast('原型進度已重設，所有數值已回到初始狀態。'); } };
document.querySelectorAll('[data-profession]').forEach(b => b.onclick = () => chooseProfession(b.dataset.profession));
document.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => {
  document.querySelectorAll('[data-tab]').forEach(x => x.classList.remove('active'));
  document.querySelectorAll('.tab-panel').forEach(x => x.classList.remove('active'));
  b.classList.add('active'); $(b.dataset.tab).classList.add('active');
});

render();