import type { PartyId, DistrictId, ChallengeCategory } from '@/types/game';
import { PARTIES, DISTRICTS } from '@/types/game';

const PARTY_NAMES: Record<PartyId, string> = {
  blue: 'הגוש הכחול',
  red: 'הגוש האדום',
  orange: 'הגוש הכתום',
  green: 'הגוש הירוק',
  purple: 'הגוש הסגול',
  yellow: 'הגוש הצהוב',
};

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const isSatirical = () => Math.random() < 0.3;

// ─── Category A: District Conquests ───

const districtSerious = (player: string, party: PartyId, district: string, mandates: number): string =>
  pick([
    `דרמה ב${district}: ${PARTY_NAMES[party]} תופס/ת שליטה עם ${mandates} מנדטים!`,
    `עדכון סקר: ${PARTY_NAMES[party]} מוביל/ה ב${district}.`,
    `${player} נוחת/ת ב${district} — ${mandates} מנדטים על הכף!`,
    `מהלך אסטרטגי: ${PARTY_NAMES[party]} פורש/ת ל${district} עם ${mandates} מנדטים.`,
  ]);

const districtSatirical = (player: string, party: PartyId, district: string): string =>
  pick([
    `תל אביב: פעילי ${PARTY_NAMES[party]} נצפו מזמינים לאטה שיבולת שועל לפני כיבוש המחוז.`,
    `ירושלים: הדיון היה כל כך ארוך שהרגל של ${PARTY_NAMES[party]} נרדם על הלוח.`,
    `הנגב: ${PARTY_NAMES[party]} נכשל/ה באתגר; מקורות אומרים \'זו הלחות\'.`,
    `${district}: ${player} ניסה/תה להיכנס למחוז אבל שכח/ה את הקוביות בבית.`,
    `${district}: שמועה — ${PARTY_NAMES[party]} חילק/ה שוקולד לבוחרים ליד הקלפי.`,
    `${player} נוחת/ת ב${district}. התושבים המקומיים: "מי זה?"`,
  ]);

export const generateDistrictHeadline = (player: string, party: PartyId, districtId: DistrictId): string => {
  const district = DISTRICTS.find(d => d.id === districtId);
  if (!district) return `${player} בוחר/ת מחוז!`;
  return isSatirical()
    ? districtSatirical(player, party, district.name)
    : districtSerious(player, party, district.name, district.maxMandates);
};

// ─── Category B: Alliances & Betrayals ───

const allianceSerious = (playerA: string, partyA: PartyId, playerB: string, partyB: PartyId): string =>
  pick([
    `מבזק: ${PARTY_NAMES[partyA]} ו-${PARTY_NAMES[partyB]} חותמים על הסכם עודפים.`,
    `קואליציה חדשה! ${playerA} ו-${playerB} מכריזים על שיתוף פעולה.`,
    `ברית אסטרטגית: ${PARTY_NAMES[partyA]} מצטרף/ת ל-${PARTY_NAMES[partyB]} למהלך משותף.`,
  ]);

const allianceSatirical = (playerA: string, partyA: PartyId, playerB: string, partyB: PartyId): string =>
  pick([
    `שמועה: ${playerA} ו-${playerB} נצפו לוחשים בקפיטריה; פיצה או קואליציה?`,
    `${PARTY_NAMES[partyA]} ו-${PARTY_NAMES[partyB]} חתמו על הסכם. האותיות הקטנות: "מי מזמין סושי."`,
    `ברית חדשה! ${playerA} ו-${playerB} נראים כמו זוג נשוי שרב על השלט.`,
  ]);

export const generateAllianceHeadline = (playerA: string, partyA: PartyId, playerB: string, partyB: PartyId): string =>
  isSatirical()
    ? allianceSatirical(playerA, partyA, playerB, partyB)
    : allianceSerious(playerA, partyA, playerB, partyB);

const betrayalSerious = (betrayer: string, partyA: PartyId, target: string, partyB: PartyId): string =>
  pick([
    `הלם: הקואליציה של ${PARTY_NAMES[partyA]}-${PARTY_NAMES[partyB]} קרסה.`,
    `בגידה פוליטית! ${betrayer} דוקר/ת ב-${target}!`,
    `משבר קואליציוני: ${PARTY_NAMES[partyA]} מפר/ה את ההסכם עם ${PARTY_NAMES[partyB]}.`,
  ]);

const betrayalSatirical = (betrayer: string, partyA: PartyId, target: string, partyB: PartyId): string =>
  pick([
    `דקירת גב! ${betrayer} בגד/ה ב-${target}; מקורות אומרים שזה תוכנן מאז החימום.`,
    `מבוכה: ${PARTY_NAMES[partyA]} ניסה/תה לבגוד ב-${PARTY_NAMES[partyB]} אבל שכח/ה שאין לו קלפי בגידה.`,
    `${betrayer} בגד/ה ב-${target}. הקהל: "לא ראינו את זה מגיע" (כולם ראו).`,
  ]);

export const generateBetrayalHeadline = (betrayer: string, partyA: PartyId, target: string, partyB: PartyId): string =>
  isSatirical()
    ? betrayalSatirical(betrayer, partyA, target, partyB)
    : betrayalSerious(betrayer, partyA, target, partyB);

// ─── Category C: Challenge Results ───

const CATEGORY_NAMES: Record<ChallengeCategory, string> = {
  knowledge: 'ידע',
  mission: 'משימה',
  debate: 'דיבייט',
  quote: 'מי אמר?',
  map: 'זיהוי מקומות',
  music: 'זהה את השיר',
};

const challengeSerious = (player: string, party: PartyId, category: ChallengeCategory, won: boolean): string => {
  if (won) {
    return pick([
      `מומחיות: נציג/ת ${PARTY_NAMES[party]} מציג/ה בקיאות מדהימה באתגר ה${CATEGORY_NAMES[category]}.`,
      `ניצחון מרשים ל-${player} בקטגוריית ${CATEGORY_NAMES[category]}!`,
      `פסק הקהל: הביצוע של ${PARTY_NAMES[party]} הוצבע כמשכנע ביותר.`,
    ]);
  }
  return pick([
    `${PARTY_NAMES[party]} נכשל/ה באתגר ה${CATEGORY_NAMES[category]}. מכה קשה למירוץ.`,
    `${player} מפסיד/ה באתגר ${CATEGORY_NAMES[category]} — האם זו נקודת המפנה?`,
  ]);
};

const challengeSatirical = (player: string, party: PartyId, category: ChallengeCategory, won: boolean): string => {
  const satiricalByCategory: Partial<Record<ChallengeCategory, string[]>> = {
    knowledge: [
      `ידע: ${PARTY_NAMES[party]} לא ידע/ה מי היה רה"מ ב-1948, אבל יודע/ת כל טרנד בטיקטוק.`,
      `${player} ענה/תה נכון! הקהל בהלם — "חשבנו שהוא/היא מנחש/ת."`,
    ],
    mission: [
      `משימה: ${PARTY_NAMES[party]} ניסה/תה לבצע את המשימה — הקהל לא בטוח מה ראה.`,
      `${player} השלים/ה את המשימה. או שסתם עמד/ה שם. קשה להגיד.`,
    ],
    debate: [
      `דיבייט: הנאום היה כל כך גרוע, שהשולחן שוקל הורדת מנדטים על \'עוגמת נפש\'.`,
      `${player} נשא/ה נאום. הקהל החליט לצאת להפסקה.`,
    ],
  };
  const options = satiricalByCategory[category] || [`${player} — רגע קומי בקטגוריית ${CATEGORY_NAMES[category]}.`];
  return pick(options);
};

export const generateChallengeHeadline = (player: string, party: PartyId, category: ChallengeCategory, won: boolean): string =>
  isSatirical()
    ? challengeSatirical(player, party, category, won)
    : challengeSerious(player, party, category, won);

// ─── Category D: WOW Moments & Atmosphere ───

const wowSerious = (eventType: string, playerA?: string, playerB?: string): string =>
  pick([
    `מבזק בחירות: המדינה עוצרת את הנשימה — קרב על 5 מנדטים מהקופה!`,
    `חדשות מתפרצות: שערורייה פוליטית חדשה מטלטלת את המשחק; כל המפלגות מאבדות כוח.`,
    `שידור חי: אירוע דרמטי — המתן בשיאו!`,
  ]);

const wowSatirical = (eventType: string, playerA?: string, playerB?: string): string =>
  pick([
    `סקר: 90% מהמתלבטים מעדיפים שהמשחק יסתיים כדי שמישהו יזמין אוכל.`,
    `צוות כפוי: זוג פוליטי חדש? ${playerA || 'שחקן'} ו-${playerB || 'שחקן'} נראים כמו זוג נשוי שרב על השלט.`,
    `שמועה: המועמד/ת נצפה/ית אוכל/ת פיצה עם סכין ומזלג — הסקרים צונחים.`,
    `מבזק: מישהו הפיל את הקוביות מהשולחן. שוב.`,
    `ניתוח פוליטי: האנליסטים חלוקים — האם הצעד הבא יהיה גאוני או מביך?`,
  ]);

export const generateWowHeadline = (eventType: string, playerA?: string, playerB?: string): string =>
  isSatirical()
    ? wowSatirical(eventType, playerA, playerB)
    : wowSerious(eventType, playerA, playerB);

// ─── Ambient / Filler Headlines ───

export const generateAmbientHeadline = (): string =>
  pick([
    `סקר בזק: מי המועמד/ת המפתיע/ה של הערב?`,
    `פאנל מומחים: "המשחק הזה צמוד מתמיד."`,
    `עדכון: מנדטים עפים! מי יגיע ל-61 ראשון?`,
    `כתב שטח מדווח: האווירה חשמלית באולפן.`,
    `ניתוח: ההימורים עולים — מי לוקח סיכון?`,
    `סקר: 73% מהצופים חושבים שהמשחק יסתיים בבגידה.`,
    `הפסקת פרסומות: בדרך ל-61 — עוד רגע חוזרים!`,
    `מבט מהאולפן: שולחן ההימורים רותח.`,
    `פרשנות פוליטית: "ראינו הכל, אבל לא ראינו דבר כזה."`,
    `סקר: 60% מהצופים מעדיפים ויכוח על פיצה.`,
  ]);

// ─── Player Join ───

export const generatePlayerJoinHeadline = (player: string, party: PartyId): string =>
  isSatirical()
    ? pick([
        `${player} מצטרף/ת למירוץ עם ${PARTY_NAMES[party]}. המתחרים: "מי?"`,
        `${PARTY_NAMES[party]} מקבל/ת חיזוק! ${player} נכנס/ת לזירה. ובינתיים, אף אחד לא שם לב.`,
        `${player} הצטרף/ת. ההורים שלו/שלה צפו בגאווה. (מהספה.)`,
      ])
    : pick([
        `מבזק: ${player} מצטרף/ת למירוץ עם ${PARTY_NAMES[party]}!`,
        `חדש באולפן: ${player} מייצג/ת את ${PARTY_NAMES[party]} במירוץ ל-61.`,
        `${PARTY_NAMES[party]} מתחזק/ת! ${player} נכנס/ת לקרב.`,
      ]);

// ─── Battle Join ───

export const generateBattleJoinHeadline = (player: string, party: PartyId): string =>
  isSatirical()
    ? pick([
        `${player} נכנס/ת לזירה. הייתה לו/לה בחירה — ובחר/ה בטירוף.`,
        `${PARTY_NAMES[party]} שולח/ת את ${player} לקרב. מקורות: "זו טעות."`,
      ])
    : pick([
        `${player} מצטרף/ת לקרב! המתח עולה!`,
        `${PARTY_NAMES[party]} שולח/ת כוחות נוספים — ${player} נכנס/ת!`,
      ]);
