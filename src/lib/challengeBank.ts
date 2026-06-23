const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

interface FallbackChallenge {
  text: string;
  ageGroup: 'child' | 'adult';
}

const MISSIONS: FallbackChallenge[] = [
  { text: 'עמוד על רגל אחת במשך 15 שניות בלי ליפול!', ageGroup: 'child' },
  { text: 'חקה את ראש הממשלה ונאם נאום של 20 שניות', ageGroup: 'child' },
  { text: 'ספור לאחור מ-30 ל-0 בלי לטעות!', ageGroup: 'child' },
  { text: 'שיר את ההמנון הלאומי בזמן שאתה מקפץ', ageGroup: 'child' },
  { text: 'צייר את מפת ישראל באוויר עם הידיים', ageGroup: 'child' },
  { text: 'אמור 5 ערים בישראל ב-10 שניות', ageGroup: 'child' },
  { text: 'חקה 3 חיות שונות ב-15 שניות', ageGroup: 'child' },
  { text: 'אמור משפט ארוך בלי לנשום באמצע', ageGroup: 'child' },
  { text: 'נאם נאום שכנוע של 30 שניות למה אתה צריך להיות ראש ממשלה', ageGroup: 'adult' },
  { text: 'תן 3 סיבות למה צריך להוריד מיסים — ב-20 שניות', ageGroup: 'adult' },
  { text: 'חקה פוליטיקאי ישראלי מפורסם — השאר צריכים לנחש מי', ageGroup: 'adult' },
  { text: 'אמור 7 ראשי ממשלה של ישראל ב-15 שניות', ageGroup: 'adult' },
  { text: 'תאר את המצב הפוליטי בישראל ב-3 מילים בלבד', ageGroup: 'adult' },
  { text: 'שכנע את השולחן לתת לך 5 מנדטים — יש לך 20 שניות', ageGroup: 'adult' },
  { text: 'אמור 5 מדינות שיש להן גבול עם ישראל ב-10 שניות', ageGroup: 'adult' },
  { text: 'תן הסבר של 15 שניות — מה זה קואליציה?', ageGroup: 'adult' },
];

const DEBATES: FallbackChallenge[] = [
  { text: 'האם ילדים צריכים להצביע בבחירות?', ageGroup: 'child' },
  { text: 'האם צריך לבטל שיעורי בית?', ageGroup: 'child' },
  { text: 'האם טוב יותר לגור בעיר או בכפר?', ageGroup: 'child' },
  { text: 'האם טלפונים חכמים טובים או רעים לילדים?', ageGroup: 'child' },
  { text: 'האם חייזרים קיימים?', ageGroup: 'child' },
  { text: 'מה עדיף — להיות חזק או חכם?', ageGroup: 'child' },
  { text: 'האם ישראל צריכה חוקה כתובה?', ageGroup: 'adult' },
  { text: 'האם צריך להגביל את כהונת ראש הממשלה לשתי קדנציות?', ageGroup: 'adult' },
  { text: 'האם מערכת הבחירות הישראלית צריכה לעבור לאזורית?', ageGroup: 'adult' },
  { text: 'האם צריך להוריד את גיל ההצבעה ל-16?', ageGroup: 'adult' },
  { text: 'האם תקשורת חברתית היא איום על הדמוקרטיה?', ageGroup: 'adult' },
  { text: 'האם צריך שירות אזרחי חובה לכולם?', ageGroup: 'adult' },
  { text: 'האם פוליטיקאים צריכים להיות עם תואר אקדמי?', ageGroup: 'adult' },
  { text: 'האם יש לאפשר משאלי עם על נושאים מרכזיים?', ageGroup: 'adult' },
];

export function getRandomMission(playerAge: number): FallbackChallenge {
  const ageGroup = playerAge < 14 ? 'child' : 'adult';
  const filtered = MISSIONS.filter(m => m.ageGroup === ageGroup || ageGroup === 'adult');
  return pick(filtered);
}

export function getRandomDebate(playerAge: number): FallbackChallenge {
  const ageGroup = playerAge < 14 ? 'child' : 'adult';
  const filtered = DEBATES.filter(d => d.ageGroup === ageGroup || ageGroup === 'adult');
  return pick(filtered);
}
