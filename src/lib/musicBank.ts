export interface MusicEntry {
  id: number;
  title: string;
  audioFile: string;
  options: string[];
}

/** Songs sourced from image_questions_list.xlsx — גליון "שירים" */
export const MUSIC_BANK: MusicEntry[] = [
  { id: 1, title: 'אינך יכולה', audioFile: '/audio/song-01.mp3', options: ['אינך יכולה', 'בכל פעם מתאהב בך מחדש', 'לך איתה', 'ממעמקים'] },
  { id: 2, title: 'בכל פעם מתאהב בך מחדש', audioFile: '/audio/song-02.mp3', options: ['בכל פעם מתאהב בך מחדש', 'צל עץ תמר', 'לך איתה', 'נהדרת'] },
  { id: 3, title: 'לך איתה', audioFile: '/audio/song-03.mp3', options: ['לך איתה', 'תמיד יחכו לך', 'עוד דקה את עלמת', 'בכל פעם מתאהב בך מחדש'] },
  { id: 4, title: 'מי אוהב אותך יותר ממני', audioFile: '/audio/song-04.mp3', options: ['מי אוהב אותך יותר ממני', 'ממעמקים', 'רק לעלות', 'עוד דקה את עלמת'] },
  { id: 5, title: 'ממעמקים', audioFile: '/audio/song-05.mp3', options: ['ממעמקים', 'עוד דקה את עלמת', 'בכל פעם מתאהב בך מחדש', 'לך איתה'] },
  { id: 6, title: 'נהדרת', audioFile: '/audio/song-06.mp3', options: ['נהדרת', 'תמיד יחכו לך', 'שובי אל ביתי', 'מי אוהב אותך יותר ממני'] },
  { id: 7, title: 'עוד דקה את עלמת', audioFile: '/audio/song-07.mp3', options: ['עוד דקה את עלמת', 'אינך יכולה', 'מי אוהב אותך יותר ממני', 'שובי אל ביתי'] },
  { id: 8, title: 'ציפור מדבר', audioFile: '/audio/song-08.mp3', options: ['ציפור מדבר', 'רק לעלות', 'צל עץ תמר', 'עוד דקה את עלמת'] },
  { id: 9, title: 'צל עץ תמר', audioFile: '/audio/song-09.mp3', options: ['צל עץ תמר', 'לך איתה', 'אינך יכולה', 'נהדרת'] },
  { id: 10, title: 'רק לעלות', audioFile: '/audio/song-10.mp3', options: ['רק לעלות', 'תמיד יחכו לך', 'לך איתה', 'שובי אל ביתי'] },
  { id: 11, title: 'שובי אל ביתי', audioFile: '/audio/song-11.mp3', options: ['שובי אל ביתי', 'אינך יכולה', 'תמיד יחכו לך', 'בכל פעם מתאהב בך מחדש'] },
  { id: 12, title: 'תמיד יחכו לך', audioFile: '/audio/song-12.mp3', options: ['תמיד יחכו לך', 'ציפור מדבר', 'מי אוהב אותך יותר ממני', 'בכל פעם מתאהב בך מחדש'] },
];

export function getRandomSong(): MusicEntry {
  return MUSIC_BANK[Math.floor(Math.random() * MUSIC_BANK.length)];
}
