/* ---------- 詞綴 / 分級 / 怪物資料 ---------- */

const TIERS = [
  { id: 1, name: '普通', color: '#9da29a', hpMult: 1,    atkMult: 1 },
  { id: 2, name: '精英', color: '#7ec1e0', hpMult: 1.55, atkMult: 1.3 },
  { id: 3, name: '稀有', color: '#c58af0', hpMult: 2.3,  atkMult: 1.75 },
  { id: 4, name: '史詩', color: '#f0a23a', hpMult: 3.4,  atkMult: 2.3 },
  { id: 5, name: '世界', color: '#e0546a', hpMult: 1,    atkMult: 1 }, // 世界Boss專用標籤，數值另外指定
];

const AFFIXES = [
  { id: 'scorch',   name: '灼熱', icon: '🔥', desc: '攻擊命中時會附加灼燒，隨回合侵蝕生命。' },
  { id: 'venom',    name: '劇毒', icon: '☠',  desc: '攻擊命中時會附加中毒，隨回合侵蝕生命。' },
  { id: 'ironhide', name: '堅硬', icon: '🛡', desc: '防禦大幅提升，你的攻擊傷害會被削弱。' },
  { id: 'swift',    name: '迅捷', icon: '⚡', desc: '速度極快，有機率在回合中追加一次攻擊。' },
  { id: 'leech',    name: '汲取', icon: '🩸', desc: '攻擊你時會回復自身生命。' },
  { id: 'berserk',  name: '狂暴', icon: '💢', desc: '生命越低，攻擊力越高，瀕死時最為致命。' },
  { id: 'warded',   name: '守護', icon: '✺',  desc: '每數回合會凝聚護盾，抵擋大半下一次傷害。' },
  { id: 'thorns',   name: '反射', icon: '✦',  desc: '受到你的攻擊時，會反彈部分傷害給你。' },
];

const MONSTER_POOL = [
  { name: '灰燼守衛',   icon: '♜', hp: 80,  atk: 12, text: '一座被灰燼掩埋的古老守衛阻擋了去路。' },
  { name: '荒原掠食者', icon: '♞', hp: 62,  atk: 15, text: '沙礫翻騰，一頭飢餓的荒原掠食者從石縫間撲出。' },
  { name: '失語的巡禮者', icon: '♙', hp: 95, atk: 10, text: '它在殘碑前徘徊，像是在尋找早已遺失的祈禱。' },
  { name: '碎石傀儡',   icon: '♗', hp: 112, atk: 9,  text: '成堆的碎石緩緩堆疊成人形，發出石磨般的低鳴。' },
  { name: '塵語幽靈',   icon: '♟', hp: 54,  atk: 18, text: '低語自塵霧中傳來，那是屬於已逝之人的怨念。' },
  { name: '焦土狼群',   icon: '♝', hp: 70,  atk: 14, text: '數道黑影自焦土竄出，眼中燃著餘燼般的光。' },
  { name: '遺忘祭司',   icon: '♔', hp: 84,  atk: 13, text: '披著破碎法袍的身影仍在誦唸早已無人記得的禱詞。' },
  { name: '鏽蝕巨蟹',   icon: '♚', hp: 128, atk: 8,  text: '厚重的鏽甲相互摩擦，發出令人牙酸的聲響。' },
  { name: '荊棘潛獵者', icon: '♛', hp: 74,  atk: 16, text: '荊棘叢中傳來窸窣聲，某種東西正耐心地等待時機。' },
  { name: '白骨行者',   icon: '♙', hp: 88,  atk: 12, text: '一具早已風乾的骸骨仍機械式地邁著步伐。' },
];
const BOSS_INFO = { '灰燼巨像': { icon: '♛' } };

const ITEM_RARITIES = [
  { id: 'common',    name: '普通', weight: 52, mult: 1,   maxAffix: 0 },
  { id: 'uncommon',  name: '精良', weight: 28, mult: 1.5, maxAffix: 1 },
  { id: 'rare',      name: '稀有', weight: 14, mult: 2.2, maxAffix: 1 },
  { id: 'epic',      name: '史詩', weight: 5,  mult: 3,   maxAffix: 2 },
  { id: 'legendary', name: '傳說', weight: 1,  mult: 4,   maxAffix: 2 },
];

const ITEM_AFFIXES = [
  { id: 'crit',      name: '致命', icon: '✹',  stat: 'critChance', min: .02, max: .05, desc: v => `+${Math.round(v * 100)}% 暴擊率` },
  { id: 'lifesteal', name: '嗜血', icon: '🩸', stat: 'lifesteal',  min: .02, max: .05, desc: v => `+${Math.round(v * 100)}% 生命偷取` },
  { id: 'block',     name: '格擋', icon: '🛡', stat: 'block',      min: .02, max: .05, desc: v => `-${Math.round(v * 100)}% 受到傷害` },
  { id: 'vitality',  name: '活力', icon: '♥',  stat: 'maxHp',      min: 6,   max: 14,  desc: v => `+${v} 最大生命` },
  { id: 'fortune',   name: '幸運', icon: '✧',  stat: 'luck',       min: .02, max: .05, desc: v => `+${Math.round(v * 100)}% 戰利品機率` },
];

const bases = [
  { name: '短劍', slot: '武器', slotKey: 'weapon', stat: 'atk', icon: '⚔' },
  { name: '斗篷', slot: '防具', slotKey: 'armor', stat: 'def', icon: '◈' },
  { name: '迅捷護符', slot: '飾品', slotKey: 'accessory', stat: 'spd', icon: '✧' },
];
const prefixes = ['碎石', '星火', '風化', '燼痕', '曙光', '遺忘'];


/* ---------- 職業差異化：被動加成 + 專屬戰鬥技能 ---------- */

const PROFESSIONS = {
  獵人: {
    passiveText: '被動：力量 +4、速度 +2、暴擊率永久 +8%。',
    applyBase: () => { state.baseAtk += 4; state.baseSpd += 2; state.baseCritChance = Math.round(((state.baseCritChance || 0) + .08) * 1000) / 1000; },
    skillName: '獵人直覺', skillCooldown: 3,
    skillHint: '看穿破綻，使出必定暴擊的致命一擊',
    useSkill: (b) => {
      const enemy = b.enemy;
      let d = Math.round(state.atk * 2.1 + Math.random() * 6);
      if (enemy.affixes.includes('ironhide')) d = Math.ceil(d * .75);
      let shieldBlocked = false;
      if (enemy.affixes.includes('warded') && b.enemyShieldActive) { d = Math.ceil(d * .3); b.enemyShieldActive = false; shieldBlocked = true; }
      enemy.currentHp -= d;
      let log = `你使出「獵人直覺」，精準捕捉破綻，造成 <b>${d}</b> 點必殺傷害${shieldBlocked ? '（護盾抵擋大半）' : ''}！`;
      if (state.lifesteal > 0) { const heal = Math.round(d * state.lifesteal); if (heal > 0) { state.hp = Math.min(state.maxHp, state.hp + heal); b.playerHp = Math.min(state.maxHp, b.playerHp + heal); log += ` · 汲取回復 ${heal} 點生命`; } }
      if (enemy.affixes.includes('thorns')) { const reflect = Math.ceil(d * .15); b.playerHp -= reflect; log += ` · 反射造成 ${reflect} 點傷害`; }
      $('battle-log').innerHTML = log;
      renderBattle();
      if (b.playerHp <= 0) return retreat('反射傷害擊倒了你，你撤回營地療傷。');
      if (enemy.currentHp <= 0) return victory();
      setTimeout(enemyTurn, 550);
    },
    branches: {
      '陷阱大師': {
        passiveText: '陷阱大師：速度 +4、戰鬥開始時敵人受到傷害且必定中毒。',
        applyBase: () => { state.baseSpd += 4; },
        onBattleStart: (b) => { b.enemy.currentHp -= 15; addDot(b, 'venom'); },
        skillName: '流血陷阱', skillCooldown: 4,
        skillHint: '造成傷害並大幅延長中毒與灼燒的持續時間',
        useSkill: (b) => {
          let d = Math.round(state.atk * 1.5); b.enemy.currentHp -= d;
          if (b.dots) b.dots.forEach(dot => dot.turns += 3);
          $('battle-log').innerHTML = `你使出「流血陷阱」，造成 ${d} 點傷害並使敵人的所有異常狀態延長 3 回合！`;
          renderBattle(); setTimeout(enemyTurn, 550);
        }
      },
      '狙擊手': {
        passiveText: '狙擊手：力量 +6、暴擊率永久 +12%。',
        applyBase: () => { state.baseAtk += 6; state.baseCritChance = Math.round(((state.baseCritChance || 0) + .12) * 1000) / 1000; },
        skillName: '致命狙殺', skillCooldown: 5,
        skillHint: '無視護盾的極高爆發，若擊殺敵人則無冷卻',
        useSkill: (b) => {
          let d = Math.round(state.atk * 2.5); b.enemy.currentHp -= d;
          if (b.enemy.currentHp <= 0) b.skillCd = 0;
          $('battle-log').innerHTML = `你使出「致命狙殺」，無視護盾造成 <b>${d}</b> 點毀滅性傷害！`;
          renderBattle(); if (b.enemy.currentHp <= 0) return victory(); setTimeout(enemyTurn, 550);
        }
      }
    }
  },
  鍊金師: {
    passiveText: '被動：生命上限 +24、防禦 +2，藥劑療效永久 +50%。',
    applyBase: () => { state.baseMaxHp += 24; state.baseDef += 2; },
    skillName: '緊急調配', skillCooldown: 4,
    skillHint: '當場調配藥劑，立即恢復大量生命',
    useSkill: (b) => {
      const heal = Math.round(state.maxHp * .35);
      const healed = Math.min(heal, state.maxHp - b.playerHp);
      b.playerHp = Math.min(state.maxHp, b.playerHp + heal);
      state.hp = Math.max(1, b.playerHp);
      $('battle-log').innerHTML = `你使出「緊急調配」，當場配出一劑猛藥，恢復了 <b>${healed}</b> 點生命。`;
      renderBattle();
      setTimeout(enemyTurn, 550);
    },
    branches: {
      '煉毒師': {
        passiveText: '煉毒師：防禦 +3、所有攻擊附帶微弱中毒。',
        applyBase: () => { state.baseDef += 3; },
        onAttack: (b) => { addDot(b, 'venom'); },
        skillName: '毒爆', skillCooldown: 4,
        skillHint: '引爆敵人身上的毒素，根據層數造成巨大傷害',
        useSkill: (b) => {
          let venomDot = b.dots?.find(d => d.type === 'venom');
          let d = Math.round(state.atk * 1.2);
          if (venomDot) { d += venomDot.turns * 12; venomDot.turns = 0; }
          b.enemy.currentHp -= d;
          $('battle-log').innerHTML = `你使出「毒爆」，引爆了敵人體內的毒素，造成 <b>${d}</b> 點傷害！`;
          renderBattle(); if (b.enemy.currentHp <= 0) return victory(); setTimeout(enemyTurn, 550);
        }
      },
      '大醫者': {
        passiveText: '大醫者：生命上限 +40、溢出的治療會轉換為護盾。',
        applyBase: () => { state.baseMaxHp += 40; },
        skillName: '生命禮讚', skillCooldown: 5,
        skillHint: '恢復極大量生命，並免疫下一回合的異常狀態',
        useSkill: (b) => {
          const heal = Math.round(state.maxHp * .4);
          b.playerHp = Math.min(state.maxHp + 50, b.playerHp + heal); // 50 cap for shield
          state.hp = Math.min(state.maxHp, b.playerHp);
          b.immuneNextTurn = true;
          $('battle-log').innerHTML = `你使出「生命禮讚」，恢復了巨量生命，多餘的治療化為護盾，並免疫下回異常！`;
          renderBattle(); setTimeout(enemyTurn, 550);
        }
      }
    }
  },
  鐵匠: {
    passiveText: '被動：力量 +2、防禦 +4、格擋率永久 +8%。',
    applyBase: () => { state.baseAtk += 2; state.baseDef += 4; state.baseBlock = Math.round(((state.baseBlock || 0) + .08) * 1000) / 1000; },
    skillName: '鋼鐵之軀', skillCooldown: 3,
    skillHint: '繃緊全身鋼甲，大幅減傷並反彈部分傷害',
    useSkill: (b) => {
      b.ironBody = true;
      $('battle-log').textContent = `你使出「鋼鐵之軀」，全身如鋼鐵般緊繃，準備承受並反彈下一次衝擊。`;
      renderBattle();
      setTimeout(enemyTurn, 450);
    },
    branches: {
      '重裝守衛': {
        passiveText: '重裝守衛：防禦 +8、格擋率 +10%。',
        applyBase: () => { state.baseDef += 8; state.baseBlock = Math.round(((state.baseBlock || 0) + .10) * 1000) / 1000; },
        skillName: '絕對防禦', skillCooldown: 4,
        skillHint: '完全抵擋下一次攻擊，並激怒敵人使其下次攻擊力降低',
        useSkill: (b) => {
          b.absoluteGuard = true;
          b.enemyWeakenTurns = (b.enemyWeakenTurns || 0) + 1;
          $('battle-log').textContent = `你使出「絕對防禦」，舉起重盾，準備無傷接下敵人的下一次攻擊並使其虛弱！`;
          renderBattle(); setTimeout(enemyTurn, 450);
        }
      },
      '狂戰士': {
        passiveText: '狂戰士：力量 +8、生命低於 50% 時攻擊力大幅提升。',
        applyBase: () => { state.baseAtk += 8; },
        skillName: '浴血奮戰', skillCooldown: 4,
        skillHint: '消耗 20% 剩餘生命，對敵人造成毀滅性打擊並附加吸血',
        useSkill: (b) => {
          let cost = Math.floor(b.playerHp * 0.2);
          b.playerHp -= cost; state.hp = Math.max(1, b.playerHp);
          let d = Math.round(state.atk * 2.2 + cost * 1.5);
          b.enemy.currentHp -= d;
          let heal = Math.round(d * 0.3); b.playerHp = Math.min(state.maxHp, b.playerHp + heal); state.hp = b.playerHp;
          $('battle-log').innerHTML = `你使出「浴血奮戰」，燃燒生命造成 <b>${d}</b> 點傷害並吸取了 ${heal} 點生命！`;
          renderBattle(); if (b.enemy.currentHp <= 0) return victory(); setTimeout(enemyTurn, 550);
        }
      }
    }
  },
  學者: {
    passiveText: '被動：速度 +3、戰利品機率永久 +15%。',
    applyBase: () => { state.baseSpd += 3; state.baseLuck += .15; },
    skillName: '洞察弱點', skillCooldown: 3,
    skillHint: '看穿敵人弱點，削弱其兩回合攻勢並提升你的精準度',
    useSkill: (b) => {
      b.enemyWeakenTurns = 2; b.scholarCritTurns = 2;
      $('battle-log').textContent = `你使出「洞察弱點」，看穿了${b.enemy.name}的破綻——接下來兩回合它的攻擊力大幅下降，你的出手也更加精準。`;
      renderBattle();
      setTimeout(enemyTurn, 450);
    },
    branches: {
      '占星家': {
        passiveText: '占星家：速度 +5、幸運 +10%。',
        applyBase: () => { state.baseSpd += 5; state.baseLuck += .1; },
        skillName: '星象指引', skillCooldown: 4,
        skillHint: '隨機獲得強大增益（大補血、攻防大增或大幅刷新技能冷卻）',
        useSkill: (b) => {
          let roll = Math.random();
          if (roll < 0.33) {
            let heal = Math.round(state.maxHp * 0.4); b.playerHp = Math.min(state.maxHp, b.playerHp + heal); state.hp = b.playerHp;
            $('battle-log').innerHTML = `星象指引了你，治癒之光恢復了 <b>${heal}</b> 點生命！`;
          } else if (roll < 0.66) {
            b.scholarCritTurns = 3; b.enemyWeakenTurns = 3;
            $('battle-log').innerHTML = `星象指引了你，獲得 3 回合極度洞察與敵人虛弱！`;
          } else {
            b.skillCd = 0;
            $('battle-log').innerHTML = `星象指引了你，時間被扭曲，技能冷卻瞬間重置！`;
          }
          renderBattle(); setTimeout(enemyTurn, 550);
        }
      },
      '戰術家': {
        passiveText: '戰術家：所有基礎屬性 +2、免疫戰鬥外的陷阱傷害。',
        applyBase: () => { state.baseAtk += 2; state.baseDef += 2; state.baseSpd += 2; state.baseMaxHp += 10; },
        skillName: '完美戰術', skillCooldown: 5,
        skillHint: '封印敵人一回合，使其下回合無法行動且受到持續傷害',
        useSkill: (b) => {
          b.enemyStunned = true; addDot(b, 'scorch');
          $('battle-log').textContent = `你使出「完美戰術」，敵人被困住，下回合無法行動並附帶灼熱！`;
          renderBattle(); setTimeout(enemyTurn, 550);
        }
      }
    }
  }
};


/* ---------- 探索事件系統 (資料) ---------- */
const EVENT_TAGS = {
  combat:   { label: '遭遇戰', color: '#cc745c' },
  treasure: { label: '尋寶',   color: '#e5bd70' },
  lore:     { label: '見聞',   color: '#7ec1e0' },
  hazard:   { label: '意外',   color: '#db675c' },
  choice:   { label: '抉擇',   color: '#c58af0' },
};
function setEventTag(type) {
  const el = $('event-tag'); if (!el) return;
  const t = EVENT_TAGS[type] || EVENT_TAGS.combat;
  el.textContent = t.label; el.style.setProperty('--tag-color', t.color);
}

const EXPLORATION_WEIGHTS = [['combat', 42], ['treasure', 18], ['lore', 14], ['hazard', 10], ['choice', 16]];
function pickExplorationType() {
  const total = EXPLORATION_WEIGHTS.reduce((s, t) => s + t[1], 0);
  let roll = Math.random() * total;
  for (const [type, w] of EXPLORATION_WEIGHTS) { if (roll < w) return type; roll -= w; }
  return 'combat';
}

const TREASURE_EVENTS = [
  '你在崩塌的拱門下發現一只半埋的木箱。',
  '風沙掀開地面，露出一枚古老的金幣袋。',
  '一道裂縫中反射著微光，裡頭似乎藏著什麼。',
  '傾頹的柱基旁散落著幾枚仍算完好的錢幣。',
  '一具鏽蝕的骸骨手中緊握著一枚發亮的戒指。',
  '廢棄的商隊車廂裡還留著幾件未被搜刮的貨物。',
  '你踢開一堆碎石，底下滾出幾枚成色不錯的錢幣。',
  '一座傾倒的雕像基座暗藏夾層，裡頭堆著零散的財物。',
  '沙塵中露出半截箱蓋，裡面是前人來不及帶走的行囊。',
  '一群野狗盤據的洞穴深處，堆著不知名旅人的遺物。',
  '乾涸的井底反射著金屬光澤，你俯身撈起了幾枚硬幣。',
  '一處被藤蔓纏繞的石龕裡，供奉著早已無人認領的供品。',
  '破損的旗幟下埋著一只錫盒，裡頭是些許積蓄。',
  '你在焦黑的車轍痕跡旁，發現了一枚遺落的錢包。',
  '傾斜的墓碑後方，藏著一只被人遺忘的小箱子。',
];
function resolveTreasure() {
  setEventTag('treasure');
  const text = TREASURE_EVENTS[Math.floor(Math.random() * TREASURE_EVENTS.length)];
  const gold = 8 + Math.floor(Math.random() * 18);
  state.gold += gold;
  $('event-text').textContent = text;
  announce(`${text} 你獲得了 <b>${gold}</b> 金幣。`);
  toast(`尋獲寶藏，獲得 ${gold} 枚金幣。`);
  if (Math.random() < .35 + state.luck) loot();
  render(); save(true);
}

const LORE_EVENTS = [
  { text: '一位獨行的巡禮者向你講述了起源法則崩壞前的傳說。', xp: 12 },
  { text: '殘破的石碑上刻著早已被人遺忘的祈禱文。', xp: 10 },
  { text: '你在遺跡深處找到一頁被燒黑一半的日誌。', xp: 14 },
  { text: '流浪的旅人與你交換了關於灰燼巨像的隻字片語。', xp: 10 },
  { text: '風中傳來若有似無的鐘聲，像是來自某座已沉沒的城市。', xp: 12 },
  { text: '斷裂的石碑上刻著模糊的字跡：「起源法則，乃萬物命名之始。」', xp: 10 },
  { text: '瓦礫堆裡翻出一枚鏽蝕徽章，圖騰早已無法辨認屬於哪個時代。', xp: 10 },
  { text: '殘留的守衛喃喃著一段無人能懂的語言，隨後徹底歸於沉寂。', xp: 12 },
  { text: '地面裂縫滲出微光，彷彿某種法則仍在此處緩慢流動、尚未熄滅。', xp: 14 },
  { text: '半埋的石板上刻著：「第二大陸，航行永閉。」字跡已模糊難辨。', xp: 12 },
  { text: '風化的旗幟殘片隨風擺動，圖案依稀是某個消逝已久的王國徽記。', xp: 10 },
  { text: '一本焦黑的手記裡，只剩下一句能辨讀：「他們說法則從未消失，只是睡著了。」', xp: 14 },
  { text: '古老的界碑上刻著十二道刻痕，其中過半已被劃上代表『寂滅』的符號。', xp: 16 },
  { text: '你聽見遠方傳來鐘聲般的回響，卻找不到任何鐘的蹤影。', xp: 10 },
  { text: '一段刻痕記錄著某場遠古戰役，勝者的名字已被刻意鑿去。', xp: 12 },
];
function resolveLore() {
  setEventTag('lore');
  const tpl = LORE_EVENTS[Math.floor(Math.random() * LORE_EVENTS.length)];
  gainXp(tpl.xp);
  $('event-text').textContent = tpl.text;
  announce(`${tpl.text}（經驗 +${tpl.xp}）`);
  toast(`一段旅途見聞，獲得 ${tpl.xp} 點經驗。`);
  if (!state.discoveredLore.includes(tpl.text)) state.discoveredLore.push(tpl.text);
  render(); save(true);
}

const HAZARD_EVENTS = [
  { text: '腳下的石板突然塌陷，你踉蹌著跌落碎石堆。', dmg: [6, 14] },
  { text: '一陣夾雜著灰燼的熱風灼傷了你的皮膚。', dmg: [5, 12] },
  { text: '不慎踩中隱藏在荒草下的荊棘陷阱。', dmg: [4, 10] },
  { text: '一群受驚的甲蟲自石縫中湧出，噬咬了你的小腿。', dmg: [5, 11] },
  { text: '頭頂的崩落岩塊擦過你的肩膀，留下瘀傷。', dmg: [7, 13] },
  { text: '一陣強風捲起沙塵，刺痛了你的雙眼與呼吸道。', dmg: [4, 9] },
  { text: '你誤觸了殘存的法陣餘波，被輕微的能量反噬。', dmg: [6, 15] },
  { text: '腐朽的木橋在你踏過時斷裂，你重重摔在地面。', dmg: [8, 16] },
  { text: '蟄伏在裂縫中的毒蟲驚醒，狠狠螫了你一口。', dmg: [6, 12] },
  { text: '一道銳利的碎冰從高處墜落，劃傷了你的手臂。', dmg: [5, 10] },
];
function resolveHazard() {
  setEventTag('hazard');
  const tpl = HAZARD_EVENTS[Math.floor(Math.random() * HAZARD_EVENTS.length)];
  const raw = tpl.dmg[0] + Math.floor(Math.random() * (tpl.dmg[1] - tpl.dmg[0] + 1));
  const dmg = Math.max(1, raw - Math.floor(state.def * .3));
  state.hp = Math.max(1, state.hp - dmg);
  $('event-text').textContent = tpl.text;
  announce(`${tpl.text}（受到 ${dmg} 點傷害）`);
  toast(`發生意外事故，損失了 ${dmg} 點生命。`);
  render(); save(true);
}

const CHOICE_EVENTS = [
  {
    title: '封印的箱子', icon: '▣',
    text: '一只以陌生符文封印的箱子半埋在瓦礫中，鎖芯已經鏽蝕。',
    options: [
      { label: '強行撬開', hint: '有機會獲得更好戰利品，但可能觸發封印反噬', resolve: () => {
        if (Math.random() < .55) {
          loot(); const bonus = 6 + Math.floor(Math.random() * 10); state.gold += bonus;
          announce(`箱子應聲而開，你獲得了裡頭的戰利品，並多得 <b>${bonus}</b> 金幣。`); toast(`箱子成功打開，額外獲得 ${bonus} 枚金幣！`);
        } else {
          const dmg = 8 + Math.floor(Math.random() * 10); state.hp = Math.max(1, state.hp - dmg);
          announce(`封印反噬，符文爆出灼熱氣浪，你受到 <b>${dmg}</b> 點傷害。`); toast(`封印反噬，損失了 ${dmg} 點生命。`);
        }
      } },
      { label: '謹慎帶走', hint: '不冒風險，穩定獲得少量金幣', resolve: () => {
        const gold = 10 + Math.floor(Math.random() * 6); state.gold += gold;
        announce(`你小心翼翼地將箱子完整帶走，變賣後獲得 <b>${gold}</b> 金幣。`); toast(`謹慎帶走箱子，獲得 ${gold} 枚金幣。`);
      } },
    ],
  },
  {
    title: '受傷的旅人', icon: '✚',
    text: '一位旅人倒臥在焦黑的岩石旁，呼吸微弱。',
    options: [
      { label: '上前救助', hint: '消耗部分生命為代價，換取經驗與可能的謝禮', resolve: () => {
        const cost = Math.min(10, state.hp - 1); state.hp -= cost; gainXp(20);
        if (Math.random() < .4) { loot(); announce('你救起了旅人，他將身上僅存的裝備贈與了你以表謝意。'); }
        else announce('你救起了旅人，他向你道謝後蹣跚離去，只留下片刻的信任。');
        toast(`你救助了旅人，損失 ${cost} 點生命並獲得 20 點經驗。`);
      } },
      { label: '匆匆離開', hint: '不參與此事，安全但一無所獲', resolve: () => { announce('你選擇不涉入此事，繼續趕路。'); toast('你選擇匆匆離開，沒有任何收穫，但很安全。'); } },
    ],
  },
  {
    title: '古老的祭壇', icon: '⌘',
    text: '一座殘破的祭壇散發著與世界法則相似的氣息，似乎在等待某種獻祭。',
    options: [
      { label: '獻上生命之力', hint: '損失部分生命，永久換取一點基礎屬性提升', resolve: () => {
        const cost = Math.min(18, state.hp - 1); state.hp -= cost;
        const pick = ['baseAtk', 'baseDef', 'baseSpd'][Math.floor(Math.random() * 3)]; state[pick] += 2;
        const label = pick === 'baseAtk' ? '力量' : pick === 'baseDef' ? '防禦' : '速度';
        announce(`祭壇吸收了你獻上的生命之力，你感覺到${label}永久微微增強。`);
        toast(`祭壇回應了獻祭，${label}永久 +2，但損失了 ${cost} 點生命。`);
      } },
      { label: '不予理會', hint: '安全離開，僅獲得少量經驗', resolve: () => { gainXp(8); announce('你選擇不打擾這座祭壇，只記下了它的位置。'); toast('你選擇不打擾祭壇，獲得 8 點經驗。'); } },
    ],
  },
  {
    title: '神秘的行商', icon: '✧',
    text: '一位披著兜帽的行商在廢墟間擺出小攤，貨品來歷不明。',
    options: [
      { label: '購買神秘藥水（20 金幣）', hint: '效果隨機，可能是治療也可能是劣質貨', resolve: () => {
        if (state.gold < 20) { toast('金幣不足，行商搖了搖頭，這次交易無法成立。'); return; }
        state.gold -= 20;
        if (Math.random() < .7) {
          const heal = Math.min(state.maxHp - state.hp, 40); state.hp += heal;
          announce(`藥水帶著溫暖的藥效，你恢復了 <b>${heal}</b> 點生命。`); toast(`藥水發揮功效，恢復 ${heal} 點生命。`);
        } else {
          const dmg = 10; state.hp = Math.max(1, state.hp - dmg);
          announce('藥水竟是劣質貨，你感到一陣噁心與刺痛。'); toast(`藥水是劣質貨，損失了 ${dmg} 點生命。`);
        }
      } },
      { label: '婉拒離開', hint: '不消費，安全通過', resolve: () => { announce('你婉拒了行商的推銷，繼續前行。'); toast('你婉拒了行商，沒有花費也沒有收穫。'); } },
    ],
  },
  {
    title: '岔路', icon: '⌇',
    text: '前方的荒原分成兩條路徑，一條深入霧氣瀰漫的裂谷，一條沿著相對安全的稜線。',
    options: [
      { label: '深入裂谷', hint: '觸發一場更強力的遭遇戰，勝利獎勵較高', resolve: () => { openBattle('encounter', rollEncounter(Math.min(12, state.level + 2))); } },
      { label: '沿稜線前進', hint: '穩定獲得少量戰利品，沒有戰鬥風險', resolve: () => {
        const gold = 6 + Math.floor(Math.random() * 8); state.gold += gold;
        announce(`你沿著安全的稜線前進，順手拾得 <b>${gold}</b> 金幣。`); toast(`沿稜線前進，獲得 ${gold} 枚金幣。`);
      } },
    ],
  },
  {
    title: '沉睡的守衛', icon: '♜',
    text: '一尊石造守衛倚牆而立，身上纏繞著早已褪色的封印符文，似乎還殘留一絲意識。',
    options: [
      { label: '嘗試喚醒它', hint: '有機會獲得守衛認可的獎勵，但可能觸怒它', resolve: () => {
        if (Math.random() < .5) {
          loot(); gainXp(15);
          announce('石像守衛微微頷首，認可了你的勇氣，並贈與你一件封存已久的裝備。'); toast('守衛認可了你，贈與裝備並獲得 15 點經驗！');
        } else {
          const dmg = 9 + Math.floor(Math.random() * 9); state.hp = Math.max(1, state.hp - dmg);
          announce(`守衛猛然睜眼，一記重擊將你逼退，你受到 <b>${dmg}</b> 點傷害。`); toast(`觸怒了守衛，損失了 ${dmg} 點生命。`);
        }
      } },
      { label: '悄悄離開', hint: '安全，但一無所獲', resolve: () => { announce('你放輕腳步，不去驚動沉睡中的守衛。'); toast('你悄悄離開，沒有驚動守衛，也沒有收穫。'); } },
    ],
  },
  {
    title: '迷路的獸群', icon: '♞',
    text: '一群溫馴的獸群似乎迷失了方向，牠們警覺地看著你，卻沒有離開的意思。',
    options: [
      { label: '引導牠們離開危險區域', hint: '花費一些時間，但可能得到獸群的回饋', resolve: () => {
        const gold = 8 + Math.floor(Math.random() * 10); gainXp(10); state.gold += gold;
        announce(`你耐心地引導獸群繞開了危險地帶，牠們留下了一些散落的獸皮與飾物，你獲得 <b>${gold}</b> 金幣。`); toast(`成功引導獸群，獲得 ${gold} 枚金幣與 10 點經驗。`);
      } },
      { label: '不予理會，逕自離開', hint: '安全但無獲得', resolve: () => { announce('你選擇不多管閒事，獸群漸漸消失在荒煙之中。'); toast('你選擇不多管閒事，沒有任何收穫。'); } },
    ],
  },
  {
    title: '破碎的鏡面', icon: '◈',
    text: '一面幾乎完整的鏡子立在廢墟中，鏡面深處似乎倒映著並非此刻的景象。',
    options: [
      { label: '凝視鏡中影像', hint: '可能看見有用的預兆並小幅提升能力，但也可能被迷惑而受傷', resolve: () => {
        if (Math.random() < .5) {
          const pick = ['baseCritChance', 'baseBlock'][Math.floor(Math.random() * 2)];
          state[pick] = Math.round(((state[pick] || 0) + .02) * 1000) / 1000;
          announce(`鏡中景象一閃而逝，你感覺到自己${pick === 'baseCritChance' ? '出手更為精準' : '身法更為沉穩'}了一些。`);
          toast(`你從幻象中習得了一絲訣竅，${pick === 'baseCritChance' ? '暴擊率' : '格擋'}永久 +2%。`);
        } else {
          const dmg = 6 + Math.floor(Math.random() * 8); state.hp = Math.max(1, state.hp - dmg);
          announce(`鏡中景象令你一陣暈眩，你受到 <b>${dmg}</b> 點傷害。`); toast(`被幻象迷惑，損失了 ${dmg} 點生命。`);
        }
      } },
      { label: '打碎鏡子帶走碎片', hint: '穩定獲得少量金幣，沒有風險', resolve: () => {
        const gold = 10 + Math.floor(Math.random() * 8); state.gold += gold;
        announce(`你打碎了鏡子，帶走了幾片仍算值錢的碎片，換得 <b>${gold}</b> 金幣。`); toast(`打碎鏡子帶走碎片，獲得 ${gold} 枚金幣。`);
      } },
    ],
  },
  {
    title: '深淵裂隙', icon: '⌇',
    text: '地面裂開一道深不見底的縫隙，寒氣不斷從裡頭湧出，隱約能聽見底部有什麼在移動。',
    options: [
      { label: '朝裂隙投擲火把窺探', hint: '觸發一場較強的遭遇戰，但戰利品更豐厚', resolve: () => { openBattle('encounter', rollEncounter(Math.min(12, state.level + 2))); } },
      { label: '用石塊填埋裂隙', hint: '安全地將裂隙封住，獲得些許經驗', resolve: () => { gainXp(10); announce('你搬來石塊將裂隙填平，雖然一無所獲，但至少不必擔心後患。'); toast('你填平了裂隙，獲得 10 點經驗。'); } },
    ],
  },
  {
    title: '共鳴石陣', icon: '✺',
    text: '一圈環狀石陣散發著與你體內法則相似的微光，彷彿在等待有緣人踏入。',
    options: [
      { label: '踏入石陣中心', hint: '有機會提升防禦或生命上限，但也可能引發輕微反噬', resolve: () => {
        if (Math.random() < .55) {
          if (Math.random() < .5) { state.baseDef += 1; announce('石陣的微光滲入你的身體，你感覺防禦永久略微增強。'); toast('石陣回應了共鳴，防禦永久 +1。'); }
          else { state.baseMaxHp += 10; state.hp += 10; announce('石陣的微光滲入你的身體，你的生命上限永久微幅提升。'); toast('石陣回應了共鳴，生命上限永久 +10。'); }
        } else {
          const dmg = 7 + Math.floor(Math.random() * 7); state.hp = Math.max(1, state.hp - dmg);
          announce(`石陣的能量並不穩定，反噬讓你受到 <b>${dmg}</b> 點傷害。`); toast(`石陣反噬，損失了 ${dmg} 點生命。`);
        }
      } },
      { label: '從外圍觀察後離開', hint: '安全，記下位置換取經驗', resolve: () => { gainXp(8); announce('你選擇從外圍觀察這圈石陣，並將其位置記錄下來。'); toast('你從外圍觀察石陣，獲得 8 點經驗。'); } },
    ],
  },
];


