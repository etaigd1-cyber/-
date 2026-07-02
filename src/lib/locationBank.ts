import type { AgeGroup, DifficultyLevel } from '@/types/game';

export interface LocationEntry {
  id: number;
  name: string;
  imageUrl: string;
  /** Target pin position as % of the israel-map-bg.png dimensions (approximate — calibrated by eye against the district map, not a strict geographic projection) */
  xPct: number;
  yPct: number;
  ageGroup: AgeGroup;
  difficulty: DifficultyLevel;
}

/** Places sourced from image_questions_list.xlsx — גליון "מקומות ונופים" (רשומות עם "יש תמונה ✓" בלבד) */
export const LOCATION_BANK: LocationEntry[] = [
  { id: 36, name: 'הכנסת', imageUrl: '/places/knesset.jpg', xPct: 53, yPct: 44, ageGroup: 'ילד', difficulty: 'קלה' },
  { id: 37, name: 'כיפת הסלע', imageUrl: '/places/dome-of-rock.jpg', xPct: 57, yPct: 45, ageGroup: 'ילד', difficulty: 'קלה' },
  { id: 38, name: 'הכותל המערבי', imageUrl: '/places/western-wall.jpg', xPct: 57, yPct: 45.5, ageGroup: 'ילד', difficulty: 'קלה' },
  { id: 39, name: 'מצדה', imageUrl: '/places/masada.jpg', xPct: 68, yPct: 58, ageGroup: 'ילד', difficulty: 'קלה' },
  { id: 41, name: 'בית המשפט העליון', imageUrl: '/places/supreme-court.jpg', xPct: 52, yPct: 43.5, ageGroup: 'מבוגר', difficulty: 'בינונית' },
  { id: 42, name: 'יד ושם', imageUrl: '/places/yad-vashem.jpg', xPct: 48, yPct: 44, ageGroup: 'נוער', difficulty: 'קלה' },
  { id: 44, name: 'שער יפו', imageUrl: '/places/jaffa-gate.jpg', xPct: 55, yPct: 45, ageGroup: 'נוער', difficulty: 'בינונית' },
  { id: 45, name: 'קיסריה', imageUrl: '/places/caesarea-amphitheater.jpg', xPct: 32, yPct: 26, ageGroup: 'נוער', difficulty: 'בינונית' },
  { id: 46, name: 'מנורת הכנסת', imageUrl: '/places/knesset-menorah.jpeg', xPct: 53, yPct: 43.8, ageGroup: 'נוער', difficulty: 'בינונית' },
  { id: 47, name: 'האוניברסיטה העברית', imageUrl: '/places/hebrew-university.jpeg', xPct: 58, yPct: 44, ageGroup: 'נוער', difficulty: 'בינונית' },
  { id: 48, name: 'הטכניון', imageUrl: '/places/technion.jpg', xPct: 25, yPct: 17, ageGroup: 'נוער', difficulty: 'בינונית' },
  { id: 49, name: 'מכון ויצמן למדע', imageUrl: '/places/weizmann-institute.jpg', xPct: 28, yPct: 48, ageGroup: 'מבוגר', difficulty: 'בינונית' },
  { id: 50, name: 'בית בן-גוריון בתל אביב', imageUrl: '/places/ben-gurion-house.jpeg', xPct: 22, yPct: 36, ageGroup: 'מבוגר', difficulty: 'בינונית' },
  { id: 51, name: 'הכנרת', imageUrl: '/places/kinneret.jpeg', xPct: 78, yPct: 18, ageGroup: 'ילד', difficulty: 'קלה' },
  { id: 52, name: 'ים המלח', imageUrl: '/places/dead-sea.jpeg', xPct: 75, yPct: 55, ageGroup: 'ילד', difficulty: 'קלה' },
  { id: 53, name: 'הר חרמון', imageUrl: '/places/hermon.jpg', xPct: 88, yPct: 3, ageGroup: 'ילד', difficulty: 'קלה' },
  { id: 54, name: 'מכתש רמון', imageUrl: '/places/ramon-crater.jpg', xPct: 35, yPct: 68, ageGroup: 'נוער', difficulty: 'קלה' },
  { id: 55, name: 'עין גדי', imageUrl: '/places/ein-gedi.jpeg', xPct: 67, yPct: 56, ageGroup: 'נוער', difficulty: 'בינונית' },
  { id: 56, name: 'בקעת הירדן', imageUrl: '/places/jordan-valley.jpg', xPct: 72, yPct: 35, ageGroup: 'נוער', difficulty: 'בינונית' },
  { id: 58, name: 'אילת — שונית האלמוגים', imageUrl: '/places/coral-reef-eilat.jpg', xPct: 58, yPct: 97, ageGroup: 'ילד', difficulty: 'קלה' },
  { id: 59, name: 'הר הכרמל', imageUrl: '/places/mount-carmel.jpeg', xPct: 22, yPct: 20, ageGroup: 'נוער', difficulty: 'קלה' },
  { id: 60, name: 'עמק יזרעאל', imageUrl: '/places/jezreel-valley.jpeg', xPct: 42, yPct: 30, ageGroup: 'מבוגר', difficulty: 'בינונית' },
  { id: 102, name: 'שוק מחנה יהודה', imageUrl: '/places/mahane-yehuda.jpeg', xPct: 51, yPct: 43, ageGroup: 'נוער', difficulty: 'קלה' },
  { id: 104, name: 'יפו העתיקה', imageUrl: '/places/jaffa.jpeg', xPct: 18, yPct: 38, ageGroup: 'ילד', difficulty: 'קלה' },
  { id: 105, name: 'עכו העתיקה', imageUrl: '/places/acre.jpeg', xPct: 24, yPct: 13, ageGroup: 'נוער', difficulty: 'בינונית' },
  { id: 106, name: 'צפת', imageUrl: '/places/safed.jpg', xPct: 60, yPct: 12, ageGroup: 'נוער', difficulty: 'בינונית' },
  { id: 107, name: 'נצרת', imageUrl: '/places/nazareth.jpeg', xPct: 48, yPct: 22, ageGroup: 'ילד', difficulty: 'קלה' },
  { id: 108, name: 'מערת המכפלה בחברון', imageUrl: '/places/cave-of-patriarchs.jpeg', xPct: 52, yPct: 58, ageGroup: 'מבוגר', difficulty: 'בינונית' },
  { id: 110, name: 'אילת', imageUrl: '/places/eilat.jpg', xPct: 58, yPct: 96, ageGroup: 'ילד', difficulty: 'קלה' },
];

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export function getRandomLocation(playerAge: number): LocationEntry {
  const ageGroup: AgeGroup = playerAge < 12 ? 'ילד' : playerAge < 18 ? 'נוער' : 'מבוגר';
  const order: AgeGroup[] = ['ילד', 'נוער', 'מבוגר'];
  const maxIdx = order.indexOf(ageGroup);
  const filtered = LOCATION_BANK.filter(l => order.indexOf(l.ageGroup) <= maxIdx);
  return pick(filtered.length > 0 ? filtered : LOCATION_BANK);
}
