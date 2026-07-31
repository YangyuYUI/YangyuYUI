/* ---------- 存檔 ---------- */

// v3：裝備改為「欄位制」（武器／防具／飾品各一件），角色數值拆成基礎值 + 已裝備物品加成，
// 因此存檔格式與 v2 不相容，故切換 saveKey，避免舊格式資料造成數值錯亂。
const saveKey = 'arcanova-demo-v3';
const fresh = () => ({
  gold: 120, shards: 0, level: 1, xp: 0, maxXp: 100,
  hp: 100,
  // 基礎值：僅受等級、職業與探索事件的永久獎勵影響，不含裝備加成
  baseAtk: 16, baseDef: 7, baseSpd: 12, baseMaxHp: 100, baseLuck: 0, baseCritChance: 0, baseBlock: 0,
  // 以下為「基礎值 + 已裝備物品加成」的最終數值，由 recalcStats() 統一計算，其他地方請勿直接加減
  atk: 16, def: 7, spd: 12, maxHp: 100, critChance: 0, lifesteal: 0, block: 0, luck: 0,
  bossHp: 10000, bossMax: 10000, contribution: 0,
  profession: null, professionBranch: null,
  inventory: [], itemSeq: 0, potions: 0,
  equipment: { weapon: null, armor: null, accessory: null },
  guarding: false, battle: null,
  discoveredMonsters: [], discoveredAffixes: [], discoveredLore: [],
});
function load() { try { return { ...fresh(), ...JSON.parse(localStorage.getItem(saveKey) || '{}') }; } catch { return fresh(); } }
function save(silent = false) { localStorage.setItem(saveKey, JSON.stringify({ ...state, battle: null, guarding: false, pendingEvent: null })); if (!silent) toast('進度已儲存到這個瀏覽器，換裝置或清除快取將會遺失。'); }
let state = load();
recalcStats();

function comma(n) { return Math.max(0, Math.round(n)).toLocaleString('en-US'); }
function toast(msg) { const e = $('toast'); e.textContent = msg; e.classList.add('show'); clearTimeout(window.t); window.t = setTimeout(() => e.classList.remove('show'), 2600); }
function announce(text) { const li = document.createElement('li'); li.innerHTML = `<time>現在</time><p>${text}</p>`; $('announcement-list').prepend(li); }


