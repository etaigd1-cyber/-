import { motion } from 'framer-motion';
import type { PartyId } from '@/types/game';
import { AVATAR_MAP } from '@/lib/avatarMap';

const SEATS = [
  { partyId: 'blue' as PartyId, name: 'אשכול' },
  { partyId: 'red' as PartyId, name: 'נתניהו' },
  { partyId: 'orange' as PartyId, name: 'רבין' },
  { partyId: 'green' as PartyId, name: 'בן-גוריון' },
  { partyId: 'purple' as PartyId, name: 'בגין' },
  { partyId: 'yellow' as PartyId, name: 'גולדה' },
];

interface CharacterSeatsProps {
  selectedParty: PartyId | null;
  takenParties: PartyId[];
  onSelect: (partyId: PartyId) => void;
}

const CharacterSeats = ({ selectedParty, takenParties, onSelect }: CharacterSeatsProps) => {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-3 text-center font-display">בחר את הכיסא שלך</p>
      <div className="flex justify-center gap-3 flex-wrap">
        {SEATS.map((seat) => {
          const isTaken = takenParties.includes(seat.partyId);
          const isSelected = selectedParty === seat.partyId;
          const isUnselected = selectedParty !== null && !isSelected;

          return (
            <motion.button
              key={seat.partyId}
              onClick={() => !isTaken && onSelect(seat.partyId)}
              disabled={isTaken}
              whileHover={!isTaken ? { scale: 1.08 } : undefined}
              whileTap={!isTaken ? { scale: 0.95 } : undefined}
              className={`relative flex flex-col items-center gap-1.5 transition-all duration-500 ${
                isTaken ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'
              }`}
            >
              {/* Glow ring for selected */}
              <div
                className={`relative w-16 h-16 rounded-full overflow-hidden border-2 transition-all duration-500 ${
                  isSelected
                    ? 'border-accent shadow-[0_0_20px_4px_hsl(var(--accent)/0.5)]'
                    : isUnselected || isTaken
                      ? 'border-border grayscale'
                      : 'border-border/60 hover:border-muted-foreground/60'
                }`}
              >
                <img
                  src={AVATAR_MAP[seat.partyId]}
                  alt={seat.name}
                  className={`w-full h-full object-cover transition-all duration-500 ${
                    isUnselected || isTaken ? 'grayscale' : ''
                  }`}
                />
              </div>
              <span
                className={`text-[10px] font-display font-bold transition-all duration-500 ${
                  isSelected
                    ? 'text-accent'
                    : isUnselected || isTaken
                      ? 'text-muted-foreground/50'
                      : 'text-muted-foreground'
                }`}
              >
                {seat.name}
              </span>
              {isTaken && (
                <span className="absolute top-0 right-0 text-[8px] text-destructive font-bold">תפוס</span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default CharacterSeats;
