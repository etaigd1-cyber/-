import type { AgeGroup } from '@/types/game';

export interface QuoteEntry {
  id: number;
  quote: string;
  answer: string;
  year: string;
  context: string;
  options: string[];
  ageGroup: AgeGroup;
}

/** Famous quotes by Israeli leaders, writers and thinkers — from אפיון מצבי משחק, מצב 2 */
export const QUOTE_BANK: QuoteEntry[] = [
  {
    id: 1,
    quote: '"אם תרצו, אין זו אגדה"',
    answer: 'תיאודור הרצל',
    year: '1902',
    context: 'מתוך הספר "אלטנוילנד" — חזון המדינה היהודית',
    options: ['תיאודור הרצל', 'חיים ויצמן', 'זאב ז\'בוטינסקי', 'דוד בן-גוריון'],
    ageGroup: 'נוער',
  },
  {
    id: 2,
    quote: '"אין אנחנו שופטים עצמנו..."',
    answer: 'דוד בן-גוריון',
    year: '1948',
    context: 'בהכרזת העצמאות של מדינת ישראל',
    options: ['דוד בן-גוריון', 'חיים ויצמן', 'גולדה מאיר', 'יצחק בן-צבי'],
    ageGroup: 'מבוגר',
  },
  {
    id: 3,
    quote: '"שיר לשלום ולא לניצחון"',
    answer: 'נעמי שמר',
    year: '1967',
    context: 'משורה משיריה בעקבות מלחמת ששת הימים',
    options: ['נעמי שמר', 'אריק איינשטיין', 'שלמה ארצי', 'עפרה חזה'],
    ageGroup: 'נוער',
  },
  {
    id: 4,
    quote: '"מי שלא זוכר את העבר..."',
    answer: 'שמעון פרס',
    year: 'שואה וגבורה',
    context: 'מתוך נאום בטקס יום השואה',
    options: ['שמעון פרס', 'יצחק רבין', 'מנחם בגין', 'אהוד ברק'],
    ageGroup: 'מבוגר',
  },
  {
    id: 5,
    quote: '"גדול כוחה של השפה..."',
    answer: 'אליעזר בן-יהודה',
    year: 'סוף המאה ה-19',
    context: 'מחייה השפה העברית כשפה מדוברת',
    options: ['אליעזר בן-יהודה', 'חיים נחמן ביאליק', 'אחד העם', 'זאב ז\'בוטינסקי'],
    ageGroup: 'נוער',
  },
  {
    id: 6,
    quote: '"ירושלים של זהב..."',
    answer: 'נעמי שמר',
    year: '1967',
    context: 'השיר שנכתב לפני מלחמת ששת הימים ושחרור ירושלים',
    options: ['נעמי שמר', 'אריק איינשטיין', 'עפרה חזה', 'זוהר ארגוב'],
    ageGroup: 'ילד',
  },
];

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export function getRandomQuote(playerAge: number): QuoteEntry {
  const ageGroup: AgeGroup = playerAge < 12 ? 'ילד' : playerAge < 18 ? 'נוער' : 'מבוגר';
  const order: AgeGroup[] = ['ילד', 'נוער', 'מבוגר'];
  const maxIdx = order.indexOf(ageGroup);
  const filtered = QUOTE_BANK.filter(q => order.indexOf(q.ageGroup) <= maxIdx);
  return pick(filtered.length > 0 ? filtered : QUOTE_BANK);
}
