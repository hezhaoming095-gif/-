// ==UserScript==
// @name         一筷子漂流物
// @author       海豹用户
// @version      1.2.0
// @description  《一筷子漂流物》TRPG规则插件——一款在吃火锅时游玩的漂流求生轻量TRPG。2-6人，无需GM，约30分钟。使用.plw或.漂流物指令。
// @timestamp    1745078400
// 2026-04-19
// @diceRequireVer 1.2.0
// @license      MIT
// ==/UserScript==

// =============================================
// 规则全文
// =============================================
const ruleText = `🌊《一筷子漂流物》🌊

一群人挤在一艘摇摇欲坠的小船上，漂泊在茫茫大海中。
用筷子（或别的什么工具）打捞着各种奇奇怪怪的漂流物来求生。
这是一款在吃火锅时游玩的轻量级TRPG！

━━━━━━━━━━━━━━━
【基本信息】
人数：2-6人（无需GM）
时长：约30分钟
工具：1-2个D6、纸笔
　　　以及一顿火锅和各种食材！

━━━━━━━━━━━━━━━
【角色创建】
① 身份：给角色取个名字，设定灾难前的社会身份
　 （如"厨师小李"、"退休教授老王"等）
② 小玩意：口袋里带着的一件小东西（纯叙事用）

━━━━━━━━━━━━━━━
【每轮流程】
① 打捞 → 从火锅夹取食材（或使用 .plw 暗锅 线上打捞），想象它是什么漂流物
② 机遇 → 掷1D6判断漂流物带来的影响
③ 漂流 → 掷2D6查场景表，描述当前环境

━━━━━━━━━━━━━━━
【机遇表】(1D6)
1 = 🔴危险：遭遇不幸！+1【危险】标记
2 = ⚪擦肩：漂流物飘走了，什么也没发生
3 = 🟡代价：付出代价或放弃某些东西才能获得
4 = 🟢补给：恢复体力，疗愈身心
5 = 🔧改造：修缮或改造小船
6 = 🔵近岸：发现陆地迹象！+1【近岸】标记

━━━━━━━━━━━━━━━
【重投规则】
掷机遇骰时，可以消耗一件已有的漂流物来重掷。
被消耗的漂流物视为损坏/丢失，每件只能用一次。

【化解危机】
当机遇骰结果为2-5时，玩家可以给出合理叙述，
化解一个已有的【危险】标记（-1危险）。

━━━━━━━━━━━━━━━
【胜负条件】
🏝️ 抵达：集齐3个【近岸】标记 → 获救！胜利！
　 描述一个美好的结局吧！
💀 沉没：集齐3个【危险】标记 → 沉船！
　 描述沉没的场景，漂流者们的命运如何？`;



// =============================================
// 机遇表
// =============================================
const chanceTable: { [key: number]: [string, string, string] } = {
  1: ['🔴 危险', '遭遇不幸的事件。', '自动增加1个【危险】标记。船上的人面临新的威胁……'],
  2: ['⚪ 擦肩', '漂流物从身边默默飘走了……', '什么也没有发生。'],
  3: ['🟡 代价', '你必须付出代价才能获得这件漂流物。', '放弃某样东西，或承受某种损失。这件漂流物值得吗？'],
  4: ['🟢 补给', '这件漂流物带来了补给。', '恢复体力，疗愈身心。描述一下它如何帮助了你们。'],
  5: ['🔧 改造', '可以用这件漂流物修缮或改造小船。', '船变得更坚固、更快、或有了新功能？'],
  6: ['🔵 近岸', '看到了陆地的迹象！', '自动增加1个【近岸】标记。希望就在前方！']
};


// =============================================
// 场景表 6x6（漂流阶段使用）
// =============================================
const scenarioTable: string[][] = [
  // 列:       1        2        3        4        5         6
  /* 1 */ ['晴朗',   '夜晚',   '烈日',   '寒冷',   '下雨',   '暴风'],
  /* 2 */ ['风平浪静', '波涛汹涌', '漩涡',   '大雾',   '强风',   '海市蜃楼'],
  /* 3 */ ['食物腐坏', '口渴难耐', '饥肠辘辘', '撞击',   '船体漏水', '物品遗失'],
  /* 4 */ ['辨认方向', '身体虚弱', '争吵不休', '意外受伤', '互相鼓舞', '坠入梦境'],
  /* 5 */ ['湍急洋流', '赤潮',   '漂浮垃圾', '浑浊海水', '荧光海面', '发现孤岛'],
  /* 6 */ ['鱼群涌现', '鲨鱼出没', '暗礁密布', '幽灵船',  '不可思议的奇景', '秘密海域']
];

const scenarioRowNames = ['🌤️ 天气', '🌊 海面', '⚡ 危机', '💭 状态', '🏞️ 环境', '👁️ 奇遇'];


// =============================================
// 食材档案库
// =============================================
const basicFoods: [string, string, string][] = [
  // 高档
  ['牛肉卷', '一张高级柔软的毛毯', '高档'],
  ['榴莲', '长满尖刺的果实，散发异味', '高档'],
  ['鸭肠', '细长婉蜒的管子', '高档'],
  ['巧克力', '正在融化的棕色泥板', '高档'],
  ['龙利鱼', '柔软光滑的薄膜', '高档'],
  ['牛肚', '表面布满颗粒的粗糙皮革', '高档'],
  ['鹅肠', '透明发亮的宽管', '高档'],
  ['鲜虾', '弯曲着身体的小型海怪甲壳', '高档'],
  ['黄喉', '白色的坚韧软管', '高档'],
  ['扇贝', '带有美丽的贝壳', '高档'],
  ['鲍鱼', '椭圆形的吸盘生物', '高档'],
  ['蟹肉棒', '带着红白条纹的木棍', '高档'],
  // 普通
  ['紫甘蓝', '紫色的宽大扁平树叶', '普通'],
  ['鱼糕', '具有弹性的光滑白色方块', '普通'],
  ['土豆片', '黄色的圆盘状金属片', '普通'],
  ['香菜', '一把绿色的杂草', '普通'],
  ['乌鸡卷', '卷曲的黑色薄片', '普通'],
  ['甜不辣', '形状不规则的柔软石块', '普通'],
  ['八角', '坚硬的星形飞镖', '普通'],
  ['豆腐', '四四方方的白色浮标', '普通'],
  ['宽粉', '半透明的扁平丝带', '普通'],
  ['粉丝', '一团乱糟糟的白色丝线', '普通'],
  ['鱼丸', '光滑的白色珍珠', '普通'],
  ['生菜', '薄薄的绿色大叶片', '普通'],
  ['虾滑', '黏稠的粉色块状物', '普通'],
  ['藕片', '带有多个圆形孔洞的齿轮', '普通'],
  ['海带', '墨绿色的滑腻飘带', '普通'],
  ['香菇', '褐色的木碗', '普通'], 
  ['年糕', '白色的密封蜡条', '普通'],
  // 怪
  ['吸管', '一根神秘的彩色塑料中空管', '怪'],
  ['冰块', '一块散发寒气的浮冰', '怪'],
  ['破旧鞋子', '一只装满污水的破旧皮靴', '怪'],
  ['金属打印件', '生锈的沉重机器碎片', '怪'],
  ['完整猪心', '巨大的还连着血管的器官', '怪'],
  ['脑花', '表面布满褶皱的软性晶体', '怪'],
  ['折耳根', '带着浓烈土腥味的奇怪树根', '怪'],
  ['山东大葱', '长达两米多的绿色柱体', '怪'],
  ['未拆封自热锅', '一个被塑料封死的神秘盒子', '怪'],
  ['幼虫西兰花', '内部寄生了外星生物的绿色珊瑚', '怪'],
  ['彩色蘑菇', '颜色鲜艳但让人不安的伞苞', '怪'],
  ['臭豆腐', '散发着黑气的废弃海绵', '怪'],
  ['鞭炮笋', '会发出噼里啪啦响声的危险水草', '怪']
];

// Helper Functions
function getCustomFoods(ext: seal.ExtInfo): any[] { try { return JSON.parse(ext.storageGet("custom_foods") || "[]"); } catch(e) { return []; } }
function addCustomFood(ext: seal.ExtInfo, name: string, desc: string, rank: string) { const arr = getCustomFoods(ext); arr.push([name, desc, rank]); ext.storageSet("custom_foods", JSON.stringify(arr)); }
function getAllFoods(ext: seal.ExtInfo): any[] { return basicFoods.concat(getCustomFoods(ext)); }

function getGroupPot(ext: seal.ExtInfo, groupId: string): any[] { try { return JSON.parse(ext.storageGet("pot_" + groupId) || "[]"); } catch(e) { return []; } }
function setGroupPot(ext: seal.ExtInfo, groupId: string, arr: any[]) { ext.storageSet("pot_" + groupId, JSON.stringify(arr)); }

function getGroupStats(ext: seal.ExtInfo, groupId: string): any { try { return JSON.parse(ext.storageGet("stats_" + groupId) || "{}"); } catch(e) { return {}; } }
function setGroupStats(ext: seal.ExtInfo, groupId: string, stats: any) { ext.storageSet("stats_" + groupId, JSON.stringify(stats)); }
function incPlayerStat(ext: seal.ExtInfo, groupId: string, userId: string, userName: string, rank: string) {
  const stats = getGroupStats(ext, groupId);
  if (!stats[userId]) stats[userId] = { name: userName, normal: 0, high: 0, weird: 0, total: 0 };
  stats[userId].total += 1;
  if(rank === "普通") stats[userId].normal += 1;
  else if(rank === "高档") stats[userId].high += 1;
  else if(rank === "怪") stats[userId].weird += 1;
  setGroupStats(ext, groupId, stats);
}
function decPlayerStat(ext: seal.ExtInfo, groupId: string, userId: string, rank: string) {
  const stats = getGroupStats(ext, groupId);
  if (stats[userId]) {
    stats[userId].total = Math.max(0, stats[userId].total - 1);
    if(rank === "普通") stats[userId].normal = Math.max(0, stats[userId].normal - 1);
    else if(rank === "高档") stats[userId].high = Math.max(0, stats[userId].high - 1);
    else if(rank === "怪") stats[userId].weird = Math.max(0, stats[userId].weird - 1);
    setGroupStats(ext, groupId, stats);
  }
}

function getTitlesConfig(ext: seal.ExtInfo, groupId: string): any { 
  try { 
    return JSON.parse(ext.storageGet("titles_" + groupId) || '{"万物入腹者":"最多食材","食材鉴定官":"最多普通","锅中贵族":"最多高档","禁忌吞噬者":"最多怪食材"}'); 
  } catch(e) { return {}; } 
}
function setTitlesConfig(ext: seal.ExtInfo, groupId: string, configs: any) { ext.storageSet("titles_" + groupId, JSON.stringify(configs)); }

function getLastUsedGroupId(ext: seal.ExtInfo, userId: string): string { return ext.storageGet("lastGroupId_" + userId) || ""; }
function setLastUsedGroupId(ext: seal.ExtInfo, userId: string, groupId: string) { ext.storageSet("lastGroupId_" + userId, groupId); }

function getTempDraw(ext: seal.ExtInfo, groupId: string, userId: string): any { try { return JSON.parse(ext.storageGet("draw_" + groupId + "_" + userId) || "null"); } catch(e) { return null; } }
function setTempDraw(ext: seal.ExtInfo, groupId: string, userId: string, val: any) { ext.storageSet("draw_" + groupId + "_" + userId, JSON.stringify(val)); }

function evalCondition(cond: string, ustat: any, allStats: any[]): boolean {
  // Max check
  let maxFields = {'最多食材':'total','最多普通':'normal','最多高档':'high','最多怪食材':'weird'};
  if (maxFields[cond]) {
    const f = maxFields[cond];
    if (ustat[f] === 0) return false;
    let is_max = true;
    for(let s of allStats) { if(s[f] > ustat[f]) is_max = false; }
    return is_max;
  }
  // Math match
  let fields = {'普通':'normal','高档':'high','怪':'weird','食材':'total','怪食材':'weird'};
  let m = cond.match(/(普通|高档|怪|食材|怪食材)(>=|<=|>|<|=)(\d+)/);
  if (m) {
    let prop = fields[m[1]]; let op = m[2]; let v = parseInt(m[3]);
    let cv = ustat[prop] || 0;
    if(op==='=') return cv === v;
    if(op==='>') return cv > v;
    if(op==='<') return cv < v;
    if(op==='>=') return cv >= v;
    if(op==='<=') return cv <= v;
  }
  return false;
}

// =============================================
// 注册规则模板
// =============================================
const template = {
  "name": "plw",
  "fullName": "一筷子漂流物",
  "authors": ["海豹用户"],
  "version": "1.2.0",
  "updatedTime": "20260419",
  "templateVer": "1.0",

  "setConfig": {
    "diceSides": 6,
    "enableTip": "🌊 已切换至6面骰，并开启《一筷子漂流物》扩展\n输入 .plw help 查看指令帮助",
    "keys": ["plw", "漂流物", "一筷子漂流物"],
    "relatedExt": ["plw", "coc7"]
  },

  "nameTemplate": {
    "plw": {
      "template": "{$t玩家_RAW} 🏝️{近岸标记}/3 ⚠️{危险标记}/3",
      "helpText": "设置漂流物名片，显示近岸和危险标记"
    }
  },

  "attrConfig": {
    "top": ["近岸标记", "危险标记", "漂流物数量"],
    "sortBy": "name",
    "ignores": [],
    "showAs": {
      "近岸标记": "{近岸标记}/3",
      "危险标记": "{危险标记}/3"
    },
    "setter": null
  },

  "defaults": {
    "近岸标记": 0,
    "危险标记": 0,
    "漂流物数量": 0
  },

  "defaultsComputed": {},

  "alias": {
    "近岸标记": ["近岸", "coast"],
    "危险标记": ["危险", "danger"],
    "漂流物数量": ["物品", "items"]
  },

  "textMap": {},
  "textMapHelpInfo": null
};

try {
  seal.gameSystem.newTemplate(JSON.stringify(template));
} catch (e) {
  console.log('加载《一筷子漂流物》模板时出错:', e);
}


// =============================================
// 注册扩展
// =============================================
let ext = seal.ext.find('plw');
if (!ext) {
  ext = seal.ext.new('plw', '海豹用户', '1.2.0');
  seal.ext.register(ext);
}


// ─── 辅助函数 ───────────────────────────────

/** 获取群组级别存储的 key */
function getGroupKey(ctx: seal.MsgContext, name: string): string {
  const groupId = ctx.group ? ctx.group.groupId : 'private';
  return `${groupId}_${name}`;
}

/** 获取群组标记数值 */
function getMarker(theExt: seal.ExtInfo, ctx: seal.MsgContext, name: string): number {
  const key = getGroupKey(ctx, name);
  const val = theExt.storageGet(key);
  if (val) {
    const n = parseInt(val, 10);
    return isNaN(n) ? 0 : n;
  }
  return 0;
}

/** 设置群组标记数值 */
function setMarker(theExt: seal.ExtInfo, ctx: seal.MsgContext, name: string, value: number): void {
  const key = getGroupKey(ctx, name);
  theExt.storageSet(key, value.toString());
}

/** 生成进度条 */
function progressBar(current: number, max: number, filled: string, empty: string): string {
  let bar = '';
  for (let i = 0; i < max; i++) {
    bar += i < current ? filled : empty;
  }
  return bar;
}

/** 获取当前状态文本 */
function getStatusText(theExt: seal.ExtInfo, ctx: seal.MsgContext): string {
  const coast  = getMarker(theExt, ctx, '近岸');
  const danger = getMarker(theExt, ctx, '危险');
  return `🏝️近岸 ${progressBar(coast, 3, '🟢', '⚫')} ${coast}/3　　⚠️危险 ${progressBar(danger, 3, '🔴', '⚫')} ${danger}/3`;
}

/** 检查胜负 */
function checkEndCondition(theExt: seal.ExtInfo, ctx: seal.MsgContext): string {
  const coast  = getMarker(theExt, ctx, '近岸');
  const danger = getMarker(theExt, ctx, '危险');
  if (coast >= 3) {
    return '\n\n🎉🎉🎉 【抵达】已集齐3个近岸标记！\n远处出现了陆地的轮廓……漂流者们获救了！\n请描述一个美好的结局吧！';
  }
  if (danger >= 3) {
    return '\n\n💀💀💀 【沉没】已集齐3个危险标记！\n船体不堪重负，缓缓沉入大海……\n请描述沉没的场景和漂流者们的命运。';
  }
  return '';
}


// ─── 主指令 ─────────────────────────────────

const cmdPlw = seal.ext.newCmdItemInfo();
cmdPlw.name = 'plw';
cmdPlw.help = `🌊《一筷子漂流物》TRPG 指令帮助

【记录与准备】
.plw 绑定　　　── 锁定当前群，以便进行私聊提交
.plw 提交 <食材> ── (私聊可用) 向锁定群的锅底中提交食材（同种不超2份）
.plw 录入 <食材> <联想物描述> <普通/高档/怪> ── 自定义新食材录入库
.plw 锅底 [数量] ── 随机自动往锅里加满食材（默认10）
.plw 重置锅底　 ── 清空当前全群锅底
.plw 称号列表　 ── 查看当前设置的结算称号
.plw 称号添加 <称号> <条件> ── 增加条件称号。条件支持：最多食材/最多普通/最少高档/怪>=2等式

【角色创建】
.plw 建卡　　　── 查看角色创建指引

【每轮流程】
.plw 暗锅　　　── ① 打捞食材并获得联想提示
.plw 放回　　　── 抽到不满意的食材原样放入重抽一层（每抽仅限1次）
.plw 机遇　　　── ② 掷1D6判断漂流物带来的影响
.plw 场景　　　── ③ 掷2D6生成当前漂流场景
.plw 化解　　　── 叙述合理后，化解1个危险标记

【标记管理】
.plw 状态　　　── 查看近岸/危险标记进度及锅中有多少食材
.plw +近岸　　 ── 手动+1近岸标记
.plw +危险　　 ── 手动+1危险标记
.plw -近岸　　 ── 手动-1近岸标记
.plw -危险　　 ── 手动-1危险标记

【查阅与其他】
.plw 规则　　　── 查看完整游戏规则
.plw 机遇表 / 场景表
.plw clr　　　 ── 重置游戏（清除标记/锅底/统计表）`;


cmdPlw.solve = (ctx, msg, cmdArgs) => {
  if (ctx.group && ctx.group.groupId && ctx.group.groupId !== 'private') setLastUsedGroupId(ext, ctx.player.userId, ctx.group.groupId);
  let val = cmdArgs.getArgN(1);

  switch (val) {
    // ─── 帮助 ─────────────────────────────
    case 'help': {
      const ret = seal.ext.newCmdExecuteResult(true);
      ret.showHelp = true;
      return ret;
    }

    // ─── 规则全文 ──────────────────────────
    case '规则':
    case 'rule':
    case 'rules': {
      seal.replyToSender(ctx, msg, ruleText);
      break;
    }

    // ─── 建卡 ──────────────────────────────
    case '建卡':
    case '制卡':
    case 'create': {
      let text = seal.format(ctx, `🎲 {$t玩家} 的角色创建\n`);
      text += `━━━━━━━━━━━━━━━\n`;
      text += `请为角色设定：\n`;
      text += `① 名字和灾难前的身份\n`;
      text += `　 (如"厨师小李"、"退休教授老王")\n`;
      text += `② 口袋里的小玩意\n`;
      text += `　 (如"一个没电的打火机")\n\n`;
      text += `💡 使用 .nn <角色名> 设置角色名`;

      seal.replyToSender(ctx, msg, text);
      break;
    }

    // ─── 机遇表 ────────────────────────────
    case '机遇表': {
      let text = `📋 机遇表 (1D6)\n`;
      text += `━━━━━━━━━━━━━━━\n`;
      for (let i = 1; i <= 6; i++) {
        const [title, desc, _] = chanceTable[i];
        text += `${i} = ${title}\n　 ${desc}\n`;
      }
      text += `━━━━━━━━━━━━━━━\n`;
      text += `使用 .plw 机遇 来掷骰\n`;
      text += `💡 可消耗漂流物来重掷`;
      seal.replyToSender(ctx, msg, text);
      break;
    }

    // ─── 场景表 ────────────────────────────
    case '场景表': {
      let text = `📋 场景表 (掷2D6: 行+列)\n`;
      text += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      for (let r = 0; r < 6; r++) {
        text += `${r+1}. ${scenarioRowNames[r]}:\n   `;
        for (let c = 0; c < 6; c++) {
          text += `${c+1}=${scenarioTable[r][c]}`;
          if (c < 5) text += ' ';
        }
        text += '\n';
      }
      text += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      text += `使用 .plw 场景 来掷骰`;
      seal.replyToSender(ctx, msg, text);
      break;
    }

    // ─── 联想提示 ──────────────────────────
    case '联想':
    case '提示':
    case 'hint': {
      // 随机挑选3个联想示例
      const shuffled = [...ingredientExamples].sort(() => Math.random() - 0.5);
      const picks = shuffled.slice(0, 3);

      let text = `🍲 食材→漂流物联想提示\n`;
      text += `━━━━━━━━━━━━━━━\n`;
      for (const [food, item] of picks) {
        text += `🥢 ${food} → ${item}\n`;
      }
      text += `━━━━━━━━━━━━━━━\n`;
      text += `从火锅里夹起食材，\n`;
      text += `根据它的形状、颜色、气味或名字，\n`;
      text += `想象它是一件什么样的漂流物！`;

      seal.replyToSender(ctx, msg, text);
      break;
    }

    // ─── 机遇骰 ───────────────────────────
    case '机遇':
    case 'chance': {
      const roll = Math.floor(Math.random() * 6) + 1;
      const [title, desc, detail] = chanceTable[roll];

      let text = seal.format(ctx, `🎲 {$t玩家} 的机遇骰\n`);
      text += `━━━━━━━━━━━━━━━\n`;
      text += `🎲 D6 = ${roll}\n\n`;
      text += `${title}\n${desc}\n${detail}`;

      // 自动处理标记
      if (roll === 1) {
        const danger = getMarker(ext, ctx, '危险') + 1;
        setMarker(ext, ctx, '危险', danger);
        text += `\n\n${getStatusText(ext, ctx)}`;
        text += checkEndCondition(ext, ctx);
      } else if (roll === 6) {
        const coast = getMarker(ext, ctx, '近岸') + 1;
        setMarker(ext, ctx, '近岸', coast);
        text += `\n\n${getStatusText(ext, ctx)}`;
        text += checkEndCondition(ext, ctx);
      } else {
        // 2-5的结果，提示可以化解危机
        const danger = getMarker(ext, ctx, '危险');
        if (danger > 0) {
          text += `\n\n💡 当前有${danger}个危险标记。`;
          text += `\n若能给出合理叙述，可使用 .plw 化解 来移除1个危险标记。`;
        }
        text += `\n\n${getStatusText(ext, ctx)}`;
      }

      text += `\n\n🔄 提示：可消耗1件漂流物来重掷此骰（.plw 重掷）`;

      seal.replyToSender(ctx, msg, text);
      break;
    }

    // ─── 重掷机遇骰 ──────────────────────
    case '重掷':
    case '重投':
    case 'reroll': {
      const roll = Math.floor(Math.random() * 6) + 1;
      const [title, desc, detail] = chanceTable[roll];

      let text = seal.format(ctx, `🔄 {$t玩家} 消耗一件漂流物重掷机遇骰！\n`);
      text += `━━━━━━━━━━━━━━━\n`;
      text += `🎲 重掷 D6 = ${roll}\n\n`;
      text += `${title}\n${desc}\n${detail}`;

      // 自动处理标记
      if (roll === 1) {
        const danger = getMarker(ext, ctx, '危险') + 1;
        setMarker(ext, ctx, '危险', danger);
        text += `\n\n${getStatusText(ext, ctx)}`;
        text += checkEndCondition(ext, ctx);
      } else if (roll === 6) {
        const coast = getMarker(ext, ctx, '近岸') + 1;
        setMarker(ext, ctx, '近岸', coast);
        text += `\n\n${getStatusText(ext, ctx)}`;
        text += checkEndCondition(ext, ctx);
      } else {
        const danger = getMarker(ext, ctx, '危险');
        if (danger > 0) {
          text += `\n\n💡 当前有${danger}个危险标记，可使用 .plw 化解 来移除1个。`;
        }
        text += `\n\n${getStatusText(ext, ctx)}`;
      }

      text += `\n\n⚠️ 别忘了标记被消耗的漂流物已损坏/丢失！`;

      seal.replyToSender(ctx, msg, text);
      break;
    }

    // ─── 化解危机 ──────────────────────────
    case '化解':
    case 'resolve': {
      const danger = getMarker(ext, ctx, '危险');
      if (danger <= 0) {
        seal.replyToSender(ctx, msg, '✅ 当前没有需要化解的危险标记。');
        break;
      }

      const newDanger = danger - 1;
      setMarker(ext, ctx, '危险', newDanger);

      let text = seal.format(ctx, `🛡️ {$t玩家} 化解了一个危机！\n`);
      text += `━━━━━━━━━━━━━━━\n`;
      text += `⚠️ 危险标记 ${danger} → ${newDanger}\n\n`;
      text += `${getStatusText(ext, ctx)}\n`;
      text += `━━━━━━━━━━━━━━━\n`;
      text += `危机被成功化解。讲述一下你们是如何做到的吧！`;

      seal.replyToSender(ctx, msg, text);
      break;
    }

    // ─── 场景生成（漂流阶段 2D6）─────────
    case '场景':
    case '漂流':
    case 'scene':
    case 'drift': {
      const rowRoll = Math.floor(Math.random() * 6) + 1;
      const colRoll = Math.floor(Math.random() * 6) + 1;

      const rowName = scenarioRowNames[rowRoll - 1];
      const scene   = scenarioTable[rowRoll - 1][colRoll - 1];

      let text = `🌊 漂流·场景生成\n`;
      text += `━━━━━━━━━━━━━━━\n`;
      text += `🎲 掷骰: [${rowRoll}] [${colRoll}]\n\n`;
      text += `📍 ${rowName} ——【${scene}】\n`;
      text += `━━━━━━━━━━━━━━━\n\n`;

      // 根据场景类别给出叙事引导
      switch (rowRoll) {
        case 1:
          text += `天空呈现出${scene}的景象……\n这样的天气下，漂流者们会做什么？`;
          break;
        case 2:
          text += `海面上出现了${scene}的变化……\n小船在这样的海面上如何前行？`;
          break;
        case 3:
          text += `⚡ 危机来袭：${scene}！\n漂流者们必须想办法应对这个困境。`;
          break;
        case 4:
          text += `漂流者们的状态：${scene}。\n这会如何影响接下来的旅程？`;
          break;
        case 5:
          text += `周围的环境发生了变化：${scene}。\n请描述漂流者们看到了什么。`;
          break;
        case 6:
          text += `👁️ 奇遇！发现了${scene}！\n这会带来希望还是新的危险？`;
          break;
      }

      seal.replyToSender(ctx, msg, text);
      break;
    }

    // ─── 查看状态 ──────────────────────────
    case '状态':
    case 'status': {
      const coast  = getMarker(ext, ctx, '近岸');
      const danger = getMarker(ext, ctx, '危险');

      let text = `🚢 漂流状态一览\n`;
      text += `━━━━━━━━━━━━━━━\n`;
      text += `🏝️ 近岸: ${progressBar(coast, 3, '🟢', '⚫')}  ${coast}/3\n`;
      text += `⚠️ 危险: ${progressBar(danger, 3, '🔴', '⚫')}  ${danger}/3\n`;
      text += `━━━━━━━━━━━━━━━\n`;

      if (coast >= 3) {
        text += '🎉 【抵达】漂流者们已经获救！游戏胜利！';
      } else if (danger >= 3) {
        text += '💀 【沉没】船只已经沉没……游戏结束。';
      } else {
        const coastLeft  = 3 - coast;
        const dangerLeft = 3 - danger;
        text += `距获救还需 ${coastLeft} 个近岸标记\n`;
        text += `距沉没还差 ${dangerLeft} 个危险标记\n\n`;

        if (danger > coast) {
          text += `⛈️ 形势危急，需要尽快找到陆地……`;
        } else if (coast > danger) {
          text += `☀️ 希望在望，继续坚持！`;
        } else if (coast === 0 && danger === 0) {
          text += `🌅 旅程刚刚开始，一切皆有可能……`;
        } else {
          text += `🌅 前路未卜，命运悬于一线……`;
        }
      }

      seal.replyToSender(ctx, msg, text);
      break;
    }

    // ─── 手动 + 近岸 ──────────────────────
    case '+近岸':
    case '近岸+':
    case '近岸': {
      const coast = getMarker(ext, ctx, '近岸') + 1;
      setMarker(ext, ctx, '近岸', coast);
      let text = `🏝️ +1 近岸标记\n`;
      text += `当前: ${progressBar(coast, 3, '🟢', '⚫')} (${coast}/3)`;
      text += checkEndCondition(ext, ctx);
      seal.replyToSender(ctx, msg, text);
      break;
    }

    // ─── 手动 + 危险 ──────────────────────
    case '+危险':
    case '危险+':
    case '危险': {
      const danger = getMarker(ext, ctx, '危险') + 1;
      setMarker(ext, ctx, '危险', danger);
      let text = `⚠️ +1 危险标记\n`;
      text += `当前: ${progressBar(danger, 3, '🔴', '⚫')} (${danger}/3)`;
      text += checkEndCondition(ext, ctx);
      seal.replyToSender(ctx, msg, text);
      break;
    }

    // ─── 手动 - 近岸 ──────────────────────
    case '-近岸':
    case '近岸-': {
      let coast = getMarker(ext, ctx, '近岸') - 1;
      if (coast < 0) coast = 0;
      setMarker(ext, ctx, '近岸', coast);
      seal.replyToSender(ctx, msg,
        `🏝️ -1 近岸标记\n当前: ${progressBar(coast, 3, '🟢', '⚫')} (${coast}/3)`);
      break;
    }

    // ─── 手动 - 危险 ──────────────────────
    case '-危险':
    case '危险-': {
      let danger = getMarker(ext, ctx, '危险') - 1;
      if (danger < 0) danger = 0;
      setMarker(ext, ctx, '危险', danger);
      seal.replyToSender(ctx, msg,
        `⚠️ -1 危险标记\n当前: ${progressBar(danger, 3, '🔴', '⚫')} (${danger}/3)`);
      break;
    }

    // ─── 重置游戏 ─────────────────────────
    
    case 'clr':
    case '清除':
    case '重置':
    case 'reset': {
      setMarker(ext, ctx, '近岸', 0);
      setMarker(ext, ctx, '危险', 0);
      let bindG = ctx.group?.groupId || getLastUsedGroupId(ext, ctx.player.userId);
      setGroupPot(ext, bindG, []);
      setGroupStats(ext, bindG, {});

      let text = `🔄 游戏已重置！\n`;
      text += `━━━━━━━━━━━━━━━\n`;
      text += `🏝️ 近岸: ⚫⚫⚫  0/3\n`;
      text += `⚠️ 危险: ⚫⚫⚫  0/3\n`;
      text += `🧹 所有人统计及锅底已清空。新的旅程开始了。\n`;
      text += `━━━━━━━━━━━━━━━\n\n`;
      text += `💡 下一步：\n`;
      text += `· .plw 锅底 ── 往锅里铺垫随机食材\n`;
      text += `· .plw 提交 ── 大家私聊开始加菜\n`;
      text += `· .plw 暗锅 ── 开始打捞`;

      seal.replyToSender(ctx, msg, text);
      break;
    }


    
    case '绑定': {
      if(!ctx.group || ctx.group.groupId==='private') {
        seal.replyToSender(ctx, msg, "⚠️请在群聊中使用该指令");
        break;
      }
      setLastUsedGroupId(ext, ctx.player.userId, ctx.group.groupId);
      seal.replyToSender(ctx, msg, `✅ 已成功将你的提交群号绑定至当前群。
你可以通过私聊我发送 ".plw 提交 <食材名>" 进行秘密下锅啦！`);
      break;
    }

    case '录入': {
       const fd = cmdArgs.getArgN(2);
       const ds = cmdArgs.getArgN(3);
       const rk = cmdArgs.getArgN(4);
       if(!fd || !ds || !rk || !['普通','高档','怪'].includes(rk)) {
         seal.replyToSender(ctx, msg, "格式错误，例如：.plw 录入 羊肉卷 高级的羊毛毯 高档");
         break;
       }
       addCustomFood(ext, fd, ds, rk);
       // automatically put into last pot
       let bindG = ctx.group?.groupId || getLastUsedGroupId(ext, ctx.player.userId);
       if (bindG && bindG !== 'private') {
         let p = getGroupPot(ext, bindG);
         if(p.filter(x=>x===fd).length < 2) {
           p.push(fd);
           setGroupPot(ext, bindG, p);
         }
       }
       seal.replyToSender(ctx, msg, `✅ 成功把【${fd}】(${rk})入库并放入锅底！`);
       break;
    }

    case '提交': {
       const fdName = cmdArgs.getArgN(2);
       if(!fdName) { seal.replyToSender(ctx, msg, "请输入要提交的食材。"); break; }
       
       let bindGroup = getLastUsedGroupId(ext, ctx.player.userId);
       if(!bindGroup) bindGroup = ctx.group?.groupId || '';
       if(!bindGroup || bindGroup === 'private') {
         seal.replyToSender(ctx, msg, "你还没有绑定任何群组！请先在对应群中发 .plw 绑定"); break;
       }

       let p = getGroupPot(ext, bindGroup);
       let allFs = getAllFoods(ext);
       let matched = allFs.find(item => item[0].includes(fdName));
       
       if (!matched) {
         seal.replyToSender(ctx, msg, `❌ 系统未找到叫做“${fdName}”的食材。
你可以通过指令将其录入数据库并放入锅中：
.plw 录入 ${fdName} <联想物描述> <普通/高档/怪>`);
       } else {
         if (p.filter(x => x === matched[0]).length >= 2) {
            seal.replyToSender(ctx, msg, `⚠️锅子里的【${matched[0]}】已经有不止2份啦！放点别的吧。`);
         } else {
            p.push(matched[0]);
            setGroupPot(ext, bindGroup, p);
            seal.replyToSender(ctx, msg, `🍲 你悄悄地往锅底加入了一份【${matched[0]}】。群ID:${bindGroup}`);
         }
       }
       break;
    }

    case '锅底': {
       let bindG = ctx.group?.groupId || getLastUsedGroupId(ext, ctx.player.userId);
       if (!bindG || bindG === 'private') {
         seal.replyToSender(ctx, msg, "没有指定群组"); break;
       }
       let n = parseInt(cmdArgs.getArgN(2)) || 10;
       if(n > 30) n = 30;
       let pot = getGroupPot(ext, bindG);
       let all = getAllFoods(ext);
       let addCount = 0;
       
       for(let i=0; i<100 && addCount<n; i++) {
         let r = all[Math.floor(Math.random() * all.length)][0];
         if (pot.filter(x => x === r).length < 2) { pot.push(r); addCount++; }
       }
       setGroupPot(ext, bindG, pot);
       seal.replyToSender(ctx, msg, `✅ 已随机往锅里添置了等闲 ${addCount} 样新鲜食材！当前锅内共 ${pot.length} 样食材。`);
       break;
    }

    case '重置锅底':
    case '重新roll锅底': {
       let bindG = ctx.group?.groupId || getLastUsedGroupId(ext, ctx.player.userId);
       if (!bindG || bindG === 'private') { seal.replyToSender(ctx, msg, "无群组"); break; }
       setGroupPot(ext, bindG, []);
       seal.replyToSender(ctx, msg, `🧹 锅底已清空。可以使用 .plw 锅底 指令重新打满了。`);
       break;
    }

    case '称号列表':
    case '称号': {
       if (cmdArgs.getArgN(2) === '列表' || !cmdArgs.getArgN(2)) {
         let bindG = ctx.group?.groupId || getLastUsedGroupId(ext, ctx.player.userId);
         let cfgs = getTitlesConfig(ext, bindG);
         let txt = "🏆 当前可用称号：\n";
         for(let k in cfgs) txt += ` 【${k}】条件: ${cfgs[k]}\n`;
         seal.replyToSender(ctx, msg, txt.trimEnd());
       }
       break;
    }

    case '称号添加': {
       let bindG = ctx.group?.groupId || getLastUsedGroupId(ext, ctx.player.userId);
       let tName = cmdArgs.getArgN(2);
       let tCond = cmdArgs.getArgN(3);
       if(!tName || !tCond) { seal.replyToSender(ctx, msg, "格式：.plw 称号添加 <称号> <条件>"); break; }
       let cfgs = getTitlesConfig(ext, bindG);
       cfgs[tName] = tCond;
       setTitlesConfig(ext, bindG, cfgs);
       seal.replyToSender(ctx, msg, `✅ 成功加入结算称号【${tName}】`);
       break;
    }

    case '放回':
    case '重抽': {
       let bindG = ctx.group?.groupId || getLastUsedGroupId(ext, ctx.player.userId);
       let draw = getTempDraw(ext, bindG, ctx.player.userId);
       if (!draw || draw.used) { seal.replyToSender(ctx, msg, "⚠️ 你本回合没有可放回的食材，或已放回重抽过了！"); break; }
       
       // dec item stat
       decPlayerStat(ext, bindG, ctx.player.userId, draw.rank);
       // restore to pot
       let p = getGroupPot(ext, bindG);
       p.push(draw.name);
       setGroupPot(ext, bindG, p);
       
       // mark
       draw.used = true;
       setTempDraw(ext, bindG, ctx.player.userId, draw);

       seal.replyToSender(ctx, msg, `🥢 你将【${draw.name}】悄悄地放回了锅里！你可以再次使用 .plw 暗锅 抽取别的！`);
       break;
    }

    case '暗锅':
    case '赛博':
    case 'cyber': {
      let bindG = ctx.group?.groupId || getLastUsedGroupId(ext, ctx.player.userId);
      let p = getGroupPot(ext, bindG);
      if (p.length === 0) {
        seal.replyToSender(ctx, msg, `⚠️ 当前漂流火锅里空无一物！请大家使用 .plw 提交 添加，或 .plw 锅底 让命运准备食材。`);
        break;
      }
      
      let rd = Math.floor(Math.random() * p.length);
      let fdName = p[rd];
      p.splice(rd, 1);
      setGroupPot(ext, bindG, p);
      
      let allFs = getAllFoods(ext);
      let matched = allFs.find(item => item[0] === fdName) || [fdName, '不可名状的杂物', '普通'];
      let rName = matched[0];
      let rDesc = matched[1];
      let rRank = matched[2];

      incPlayerStat(ext, bindG, ctx.player.userId, ctx.player.userName, rRank);
      
      let draw = getTempDraw(ext, bindG, ctx.player.userId) || {used: false};
      draw.name = rName;
      draw.rank = rRank;
      if (!draw.used) {
        draw.used = false; // first draw of this round (loosely tracked)
      } else {
        // if they already redrew previously in history, resetting the token so they might redraw in future?
        // Let's just allow putting back the immediate last drawn item loosely.
        draw.used = false; 
      }
      setTempDraw(ext, bindG, ctx.player.userId, draw);

      let text = `🎰 赛博暗锅·随机打捞！\n`;
      text += `━━━━━━━━━━━━━━━\n`;
      text += `🥢 你捞到了：【${rName}】[${rRank}]\n\n`;
      text += `💭 联想提示：${rDesc}\n`;
      text += `━━━━━━━━━━━━━━━\n`;
      text += `这件漂流物是什么？它有什么用？\n请发挥想象力来描述它！\n\n`;
      text += `· 描述完毕后，请在群内使用 .plw 机遇 掷骰判明影响\n`;
      text += `· 如果不想这件食材发生，可使用 .plw 放回 重抽 (一人仅限1次)\n`;
      text += `(锅中还剩 ${p.length} 个物品)`;

      seal.replyPerson(ctx, msg, text);
      if (ctx.group && ctx.group.groupId) {
        seal.replyToSender(ctx, msg, '✅ 已经将暗锅打捞的结果通过私聊发送给你啦！');
      }
      break;
    }


    // ─── 赛博暗锅（线上随机食材）──────────
    case '暗锅':
    case '赛博':
    case 'cyber': {
      const idx = Math.floor(Math.random() * ingredientExamples.length);
      const [food, item] = ingredientExamples[idx];

      let text = `🎰 赛博暗锅·随机打捞！\n`;
      text += `━━━━━━━━━━━━━━━\n`;
      text += `🥢 你从暗锅中夹到了：【${food}】\n\n`;
      text += `💭 联想提示：${item}\n`;
      text += `━━━━━━━━━━━━━━━\n`;
      text += `这件漂流物是什么？它有什么用？\n`;
      text += `请发挥你的想象力来描述它！\n\n`;
      text += `描述完毕后，请在群内使用 .plw 机遇 来掷骰\n`;
      text += `看看这件漂流物会带来什么影响。`;

      seal.replyPerson(ctx, msg, text);
      if (ctx.group && ctx.group.groupId) {
        seal.replyToSender(ctx, msg, '✅ 已经将暗锅打捞的结果通过私聊发送给你啦！');
      }
      break;
    }

    // ─── 默认 ─────────────────────────────
    default: {
      const ret = seal.ext.newCmdExecuteResult(true);
      ret.showHelp = true;
      return ret;
    }
  }

  return seal.ext.newCmdExecuteResult(true);
};


// ─── 注册指令 ──────────────────────────────

ext.cmdMap['plw'] = cmdPlw;
ext.cmdMap['漂流物'] = cmdPlw;
