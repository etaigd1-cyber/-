import type { AgeGroup, DifficultyLevel } from '@/types/game';

export interface PhotoEntry {
  id: number;
  imageUrl: string;
  answer: string;
  options: string[];
  ageGroup: AgeGroup;
  difficulty: DifficultyLevel;
}

/**
 * "מה בתמונה?" — תמונה בלבד, בלי טקסט שאלה.
 * מקור: image_questions_list.xlsx — גליון "אישיות וסמלים" (רשומות עם "יש תמונה ✓" בלבד).
 */
export const PHOTO_BANK: PhotoEntry[] = [
  { id: 1, imageUrl: '/photos/ben-gurion.jpg', answer: 'דוד בן-גוריון', options: ['דוד בן-גוריון', 'חיים ויצמן', 'לוי אשכול', 'משה שרת'], ageGroup: 'ילד', difficulty: 'קלה' },
  { id: 2, imageUrl: '/photos/weizmann.jpg', answer: 'חיים ויצמן', options: ['חיים ויצמן', 'דוד בן-גוריון', 'יצחק בן-צבי', 'שניאור זלמן שזר'], ageGroup: 'ילד', difficulty: 'קלה' },
  { id: 3, imageUrl: '/photos/golda.jpg', answer: 'גולדה מאיר', options: ['גולדה מאיר', 'לאה רבין', 'דליה איציק', 'לימור לבנת'], ageGroup: 'ילד', difficulty: 'קלה' },
  { id: 4, imageUrl: '/photos/begin.jpg', answer: 'מנחם בגין', options: ['מנחם בגין', 'יצחק שמיר', 'אריאל שרון', 'משה דיין'], ageGroup: 'נוער', difficulty: 'קלה' },
  { id: 5, imageUrl: '/photos/rabin.jpg', answer: 'יצחק רבין', options: ['יצחק רבין', 'שמעון פרס', 'אהוד ברק', 'יצחק שמיר'], ageGroup: 'נוער', difficulty: 'קלה' },
  { id: 6, imageUrl: '/photos/peres.jpg', answer: 'שמעון פרס', options: ['שמעון פרס', 'יצחק רבין', 'אהוד ברק', 'אריאל שרון'], ageGroup: 'נוער', difficulty: 'קלה' },
  { id: 7, imageUrl: '/photos/sharon.jpg', answer: 'אריאל שרון', options: ['אריאל שרון', 'אהוד ברק', 'בנימין נתניהו', 'אהוד אולמרט'], ageGroup: 'מבוגר', difficulty: 'קלה' },
  { id: 8, imageUrl: '/photos/netanyahu.jpg', answer: 'בנימין נתניהו', options: ['בנימין נתניהו', 'אריאל שרון', 'אהוד ברק', 'אהוד אולמרט'], ageGroup: 'נוער', difficulty: 'קלה' },
  { id: 9, imageUrl: '/photos/herzl.jpg', answer: 'תיאודור הרצל', options: ['תיאודור הרצל', 'חיים ויצמן', 'אחד העם', 'מנחם אוסישקין'], ageGroup: 'נוער', difficulty: 'קלה' },
  { id: 10, imageUrl: '/photos/jabotinsky.jpg', answer: 'זאב ז\'בוטינסקי', options: ['זאב ז\'בוטינסקי', 'מנחם בגין', 'יצחק שמיר', 'אריאל שרון'], ageGroup: 'מבוגר', difficulty: 'בינונית' },
  { id: 11, imageUrl: '/photos/moshe-dayan.jpg', answer: 'משה דיין', options: ['משה דיין', 'יגאל אלון', 'חיים בר-לב', 'יצחק רבין'], ageGroup: 'מבוגר', difficulty: 'קלה' },
  { id: 12, imageUrl: '/photos/ehud-barak.jpg', answer: 'אהוד ברק', options: ['אהוד ברק', 'אהוד אולמרט', 'אמיר פרץ', 'שאול מופז'], ageGroup: 'מבוגר', difficulty: 'קלה' },
  { id: 13, imageUrl: '/photos/yitzhak-shamir.jpg', answer: 'יצחק שמיר', options: ['יצחק שמיר', 'מנחם בגין', 'אריאל שרון', 'משה דיין'], ageGroup: 'מבוגר', difficulty: 'בינונית' },
  { id: 14, imageUrl: '/photos/olmert.jpg', answer: 'אהוד אולמרט', options: ['אהוד אולמרט', 'אהוד ברק', 'אריאל שרון', 'בנימין נתניהו'], ageGroup: 'מבוגר', difficulty: 'בינונית' },
  { id: 15, imageUrl: '/photos/ben-zvi.jpg', answer: 'יצחק בן-צבי', options: ['יצחק בן-צבי', 'חיים ויצמן', 'שניאור זלמן שזר', 'זלמן ארן'], ageGroup: 'מבוגר', difficulty: 'קשה' },
  { id: 16, imageUrl: '/photos/yigal-allon.jpg', answer: 'יגאל אלון', options: ['יגאל אלון', 'משה דיין', 'יצחק רבין', 'חיים בר-לב'], ageGroup: 'מבוגר', difficulty: 'קשה' },
  { id: 17, imageUrl: '/photos/motta-gur.jpg', answer: 'מוטה גור', options: ['מוטה גור', 'אוריה בר-לב', 'עוזי נרקיס', 'רפאל איתן'], ageGroup: 'מבוגר', difficulty: 'קשה' },
  { id: 18, imageUrl: '/photos/raful.jpg', answer: 'רפאל איתן', options: ['רפאל איתן', 'משה לוי', 'דן שומרון', 'אמנון ליפקין שחק'], ageGroup: 'מבוגר', difficulty: 'קשה' },
  { id: 19, imageUrl: '/photos/ezer-weizman.jpg', answer: 'עזר וייצמן', options: ['עזר וייצמן', 'דוד עברי', 'ביני פלד', 'מרדכי הוד'], ageGroup: 'מבוגר', difficulty: 'קשה' },
  { id: 20, imageUrl: '/photos/flag.jpg', answer: 'דגל ישראל', options: ['דגל ישראל', 'דגל ירדן', 'דגל יוון', 'דגל אוזבקיסטן'], ageGroup: 'ילד', difficulty: 'קלה' },
  { id: 21, imageUrl: '/photos/menorah.jpg', answer: 'מנורת שבעת הקנים', options: ['מנורת שבעת הקנים', 'מגן דוד', 'מנורת חנוכה', 'כוכב דוד'], ageGroup: 'ילד', difficulty: 'קלה' },
  { id: 22, imageUrl: '/photos/magen-david.jpg', answer: 'מגן דוד', options: ['מגן דוד', 'כוכב דוד', 'מגן שלמה', 'חותם שלמה'], ageGroup: 'ילד', difficulty: 'קלה' },
  { id: 23, imageUrl: '/photos/state-emblem.jpg', answer: 'סמל מדינת ישראל', options: ['סמל מדינת ישראל', 'סמל הכנסת', 'סמל צה"ל', 'סמל ירושלים'], ageGroup: 'נוער', difficulty: 'בינונית' },
  { id: 24, imageUrl: '/photos/jerusalem-emblem.png', answer: 'סמל עיריית ירושלים', options: ['סמל עיריית ירושלים', 'סמל הכנסת', 'סמל מדינת ישראל', 'סמל המוסד'], ageGroup: 'נוער', difficulty: 'בינונית' },
  { id: 25, imageUrl: '/photos/idf-emblem.jpg', answer: 'סמל צה"ל', options: ['סמל צה"ל', 'סמל משטרת ישראל', 'סמל שב"כ', 'סמל המוסד'], ageGroup: 'נוער', difficulty: 'קלה' },
  { id: 26, imageUrl: '/photos/pilot-wings.jpg', answer: 'כנף טייס חיל האוויר', options: ['כנף טייס חיל האוויר', 'כנף צניחה', 'כנף צוללות', 'כנף שייטת'], ageGroup: 'נוער', difficulty: 'בינונית' },
  { id: 27, imageUrl: '/photos/navy-emblem.jpg', answer: 'סמל חיל הים', options: ['סמל חיל הים', 'סמל חיל האוויר', 'סמל חיל השריון', 'סמל החי"ר'], ageGroup: 'נוער', difficulty: 'בינונית' },
  { id: 28, imageUrl: '/photos/armor-corps.png', answer: 'סמל חיל השריון', options: ['סמל חיל השריון', 'סמל חיל הים', 'סמל ח"א', 'סמל הצנחנים'], ageGroup: 'נוער', difficulty: 'בינונית' },
  { id: 29, imageUrl: '/photos/red-beret.jpg', answer: 'כומתה אדומה - צנחנים', options: ['כומתה אדומה - צנחנים', 'כומתה ירוקה', 'כומתה שחורה', 'כומתה כחולה'], ageGroup: 'ילד', difficulty: 'קלה' },
  { id: 30, imageUrl: '/photos/black-beret.jpg', answer: 'כומתה שחורה - שריון', options: ['כומתה שחורה - שריון', 'כומתה אדומה', 'כומתה ירוקה', 'כומתה כתומה'], ageGroup: 'נוער', difficulty: 'בינונית' },
  { id: 31, imageUrl: '/photos/valor-medal.jpg', answer: 'עיטור הגבורה', options: ['עיטור הגבורה', 'עיטור המופת', 'אות העוז', 'עיטור הצטיינות'], ageGroup: 'מבוגר', difficulty: 'קשה' },
  { id: 32, imageUrl: '/photos/sayeret-matkal.png', answer: 'סיירת מטכ"ל', options: ['סיירת מטכ"ל', 'שייטת 13', 'יחידה 8200', 'סיירת גולני'], ageGroup: 'מבוגר', difficulty: 'קשה' },
  { id: 33, imageUrl: '/photos/shayetet-13.jpg', answer: 'שייטת 13', options: ['שייטת 13', 'סיירת מטכ"ל', 'יחידה 8200', 'סיירת גבעתי'], ageGroup: 'מבוגר', difficulty: 'קשה' },
  { id: 34, imageUrl: '/photos/paratroopers.png', answer: 'יחידה 101', options: ['יחידה 101', 'גדוד 51', 'גדוד 202', 'גדוד 890'], ageGroup: 'מבוגר', difficulty: 'קשה' },
  { id: 35, imageUrl: '/photos/ofra-haza.jpeg', answer: 'עופרה חזה', options: ['עופרה חזה', 'ריטה', 'נעמי שמר', 'שלומית'], ageGroup: 'נוער', difficulty: 'קלה' },
  { id: 36, imageUrl: '/photos/arik-einstein.jpeg', answer: 'אריק אינשטיין', options: ['אריק אינשטיין', 'שלמה ארצי', 'יהורם גאון', 'נחום היימן'], ageGroup: 'נוער', difficulty: 'קלה' },
  { id: 37, imageUrl: '/photos/shlomo-artzi.jpeg', answer: 'שלמה ארצי', options: ['שלמה ארצי', 'אריק אינשטיין', 'יהורם גאון', 'מוקי'], ageGroup: 'נוער', difficulty: 'קלה' },
  { id: 38, imageUrl: '/photos/naomi-shemer.jpeg', answer: 'נעמי שמר', options: ['נעמי שמר', 'חוה אלברשטיין', 'יורם טהרלב', 'אהוד מנור'], ageGroup: 'נוער', difficulty: 'בינונית' },
  { id: 39, imageUrl: '/photos/amos-oz.jpeg', answer: 'עמוס עוז', options: ['עמוס עוז', 'א.ב. יהושע', 'דוד גרוסמן', 'מאיר שלו'], ageGroup: 'מבוגר', difficulty: 'בינונית' },
  { id: 40, imageUrl: '/photos/gal-gadot.jpeg', answer: 'גל גדות', options: ['גל גדות', 'ורד פלדמן', 'רוני ניצן', 'נטע ברזילי'], ageGroup: 'נוער', difficulty: 'קלה' },
  { id: 41, imageUrl: '/photos/zohar-argov.jpeg', answer: 'זוהר ארגוב', options: ['זוהר ארגוב', 'מוסה ברלין', 'שלמה ברוכי', 'פולה'], ageGroup: 'מבוגר', difficulty: 'בינונית' },
  { id: 42, imageUrl: '/photos/topol.jpeg', answer: 'חיים טופול', options: ['חיים טופול', 'אסי דיין', 'שייקה אופיר', 'אורי זוהר'], ageGroup: 'מבוגר', difficulty: 'בינונית' },
  { id: 43, imageUrl: '/photos/netta-barzilai.jpeg', answer: 'נטע ברזילי', options: ['נטע ברזילי', 'שירי מימון', 'נועה קירל', 'דנה אינטרנשיונל'], ageGroup: 'נוער', difficulty: 'קלה' },
  { id: 44, imageUrl: '/photos/yael-arad.jpeg', answer: 'יאל ארד', options: ['יאל ארד', 'גאל פרידמן', 'טל פליקר', 'אריק זאבי'], ageGroup: 'נוער', difficulty: 'קלה' },
  { id: 45, imageUrl: '/photos/gal-fridman.jpeg', answer: 'גאל פרידמן', options: ['גאל פרידמן', 'יאל ארד', 'שגיא מוקי', 'טל פליקר'], ageGroup: 'נוער', difficulty: 'קלה' },
  { id: 46, imageUrl: '/photos/sagi-muki.jpeg', answer: 'שגיא מוקי', options: ['שגיא מוקי', 'אריק זאבי', 'טל פליקר', 'גיא שמולביץ'], ageGroup: 'מבוגר', difficulty: 'בינונית' },
  { id: 47, imageUrl: '/photos/bloomfield.jpeg', answer: 'אצטדיון בלומפילד', options: ['אצטדיון בלומפילד', 'אצטדיון טדי', 'אצטדיון סמי עופר', 'היכל מנורה'], ageGroup: 'מבוגר', difficulty: 'בינונית' },
  { id: 48, imageUrl: '/photos/independence-scroll.jpeg', answer: 'הצהרת העצמאות של ישראל', options: ['הצהרת העצמאות של ישראל', 'הצהרת בלפור', 'אמנת האו"ם', 'הסכמי אוסלו'], ageGroup: 'נוער', difficulty: 'בינונית' },
  { id: 49, imageUrl: '/photos/independence-declaration.jpeg', answer: 'הכרזת המדינה ב-1948', options: ['הכרזת המדינה ב-1948', 'הכרזת ירושלים', 'הסכמי אוסלו', 'כינוס הכנסת הראשונה'], ageGroup: 'נוער', difficulty: 'קלה' },
  { id: 50, imageUrl: '/photos/exodus-ship.jpeg', answer: 'ספינת אקסודוס', options: ['ספינת אקסודוס', 'ספינת אלטלנה', 'ספינת תל חי', 'ספינת יחיעם'], ageGroup: 'מבוגר', difficulty: 'בינונית' },
  { id: 51, imageUrl: '/photos/ben-yehuda.jpeg', answer: 'אליעזר בן-יהודה', options: ['אליעזר בן-יהודה', 'חיים נחמן ביאליק', 'אחד העם', 'מנדלי מוכר ספרים'], ageGroup: 'נוער', difficulty: 'בינונית' },
  { id: 52, imageUrl: '/photos/bialik.jpeg', answer: 'ח"נ ביאליק', options: ['ח"נ ביאליק', 'שאול טשרניחובסקי', 'נתן אלתרמן', 'לאה גולדברג'], ageGroup: 'מבוגר', difficulty: 'בינונית' },
  { id: 53, imageUrl: '/photos/f16.jpeg', answer: 'מטוס F-16 ישראלי', options: ['מטוס F-16 ישראלי', 'מטוס F-15', 'מטוס כפיר', 'מטוס מיראז\''], ageGroup: 'נוער', difficulty: 'בינונית' },
  { id: 54, imageUrl: '/photos/egypt-peace.jpeg', answer: 'הסכם השלום עם מצרים', options: ['הסכם השלום עם מצרים', 'הסכמי אוסלו', 'הסכמי אברהם', 'הסכם עם ירדן'], ageGroup: 'נוער', difficulty: 'בינונית' },
  { id: 55, imageUrl: '/photos/torah-scroll.jpeg', answer: 'ספר תורה', options: ['ספר תורה', 'הגדה של פסח', 'מגילת אסתר', 'סידור תפילה'], ageGroup: 'ילד', difficulty: 'קלה' },
  { id: 56, imageUrl: '/photos/hanukkiah.jpeg', answer: 'חנוכייה', options: ['חנוכייה', 'מנורת שבעת הקנים', 'מנורת בית המקדש', 'פמוט שבת'], ageGroup: 'ילד', difficulty: 'קלה' },
  { id: 57, imageUrl: '/photos/shofar.jpeg', answer: 'שופר', options: ['שופר', 'חליל', 'חצוצרה', 'כינור'], ageGroup: 'ילד', difficulty: 'קלה' },
  { id: 58, imageUrl: '/photos/falafel.jpeg', answer: 'פלאפל', options: ['פלאפל', 'שווארמה', 'שקשוקה', 'מנסאף'], ageGroup: 'ילד', difficulty: 'קלה' },
  { id: 59, imageUrl: '/photos/hummus.jpeg', answer: 'חומוס', options: ['חומוס', 'טחינה', 'לאבנה', 'בבגנוש'], ageGroup: 'ילד', difficulty: 'קלה' },
  { id: 60, imageUrl: '/photos/shakshuka.jpeg', answer: 'שקשוקה', options: ['שקשוקה', 'חביתה', 'מג\'דרה', 'קישקה'], ageGroup: 'נוער', difficulty: 'קלה' },
  { id: 61, imageUrl: '/photos/bourekas.jpeg', answer: 'בורקס', options: ['בורקס', 'כנאפה', 'סמבוסק', 'לחמעג\'ין'], ageGroup: 'ילד', difficulty: 'קלה' },
  { id: 62, imageUrl: '/photos/olive-oil.jpeg', answer: 'שמן זית ישראלי', options: ['שמן זית ישראלי', 'שמן חמניות', 'שמן קנולה', 'שמן שומשום'], ageGroup: 'נוער', difficulty: 'בינונית' },
];

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export function getRandomPhoto(playerAge: number): PhotoEntry {
  const ageGroup: AgeGroup = playerAge < 12 ? 'ילד' : playerAge < 18 ? 'נוער' : 'מבוגר';
  const order: AgeGroup[] = ['ילד', 'נוער', 'מבוגר'];
  const maxIdx = order.indexOf(ageGroup);
  const filtered = PHOTO_BANK.filter(p => order.indexOf(p.ageGroup) <= maxIdx);
  return pick(filtered.length > 0 ? filtered : PHOTO_BANK);
}
