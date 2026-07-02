export interface VideoClip {
  id: number;
  eventName: string;
  videoUrl: string;
  year: string;
  explanation: string;
  options: string[];
}

/**
 * מצב משחק 4 — "זהה את האירוע" (ראו אפיון_מצבי_משחק.docx).
 * טרם קיים תוכן וידאו מאושר-רישיון בפרויקט — יש להוסיף קישורים אמיתיים
 * (ויקימדיה קומונס / ספריית הסרטים הלאומית / YouTube עם רישיון CC) לפני
 * שהמצב הזה יחובר ל-ChallengeCategory / CATEGORIES / CategorySelect.
 */
export const VIDEO_BANK: VideoClip[] = [];
