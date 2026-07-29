import { AVATAR_MAP } from '@/lib/avatarMap';
import type { PartyId } from '@/types/game';

interface PartyAvatarProps {
  partyId?: PartyId | null;
  className?: string;
}

/** The character a player picked at registration — shown everywhere their old party emoji used to be. */
const PartyAvatar = ({ partyId, className = 'h-8 w-8 rounded-full' }: PartyAvatarProps) => {
  if (!partyId) return null;
  return (
    <img
      src={AVATAR_MAP[partyId]}
      alt=""
      className={`inline-block object-cover align-middle ${className}`}
    />
  );
};

export default PartyAvatar;
