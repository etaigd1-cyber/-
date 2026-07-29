/** Illustrated police-officer characters shown when a QR card is scanned/activated. */
export const POLICE_BANK: string[] = [
  '/police/police-1.png',
  '/police/police-2.png',
  '/police/police-3.png',
  '/police/police-4.png',
  '/police/police-5.png',
];

export function getRandomPolice(): string {
  return POLICE_BANK[Math.floor(Math.random() * POLICE_BANK.length)];
}
