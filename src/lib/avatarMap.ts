import type { PartyId } from '@/types/game';

import avatarEshkol from '@/assets/avatars/levi-eshkol.png';
import avatarNetanyahu from '@/assets/avatars/benjamin-netanyahu.png';
import avatarRabin from '@/assets/avatars/yitzhak-rabin.png';
import avatarBenGurion from '@/assets/avatars/david-ben-gurion.png';
import avatarBegin from '@/assets/avatars/menachem-begin.png';
import avatarGolda from '@/assets/avatars/golda-meir.png';

export const AVATAR_MAP: Record<PartyId, string> = {
  blue: avatarEshkol,
  red: avatarNetanyahu,
  orange: avatarRabin,
  green: avatarBenGurion,
  purple: avatarBegin,
  yellow: avatarGolda,
};
