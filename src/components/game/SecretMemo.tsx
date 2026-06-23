import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Send, X, MessageSquareText } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { QUICK_MESSAGES, PARTIES } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AVATAR_MAP } from '@/lib/avatarMap';

const SecretMemo = () => {
  const { players, currentPlayerIndex, sendMemo, markMemosRead } = useGameStore();
  const [open, setOpen] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState<string | null>(null);
  const [customMessage, setCustomMessage] = useState('');
  const [viewingInbox, setViewingInbox] = useState(false);

  const currentPlayer = players[currentPlayerIndex];
  if (!currentPlayer) return null;

  const otherPlayers = players.filter((_, i) => i !== currentPlayerIndex);
  const unread = currentPlayer.unreadMemos;

  const handleSend = (message: string) => {
    if (!selectedRecipient || !message.trim()) return;
    sendMemo(currentPlayer.id, selectedRecipient, message);
    setSelectedRecipient(null);
    setCustomMessage('');
  };

  const handleOpenInbox = () => {
    setViewingInbox(true);
    markMemosRead(currentPlayer.id);
  };

  return (
    <>
      {/* Floating Memo Button */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setOpen(true)}
        className="fixed bottom-[76px] right-4 z-40 glass-panel p-3 shadow-neon-blue"
      >
        <Mail size={20} className="text-primary" />
        {unread > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center"
          >
            {unread}
          </motion.span>
        )}
      </motion.button>

      {/* Drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setOpen(false); setSelectedRecipient(null); setViewingInbox(false); }}
              className="fixed inset-0 z-50 bg-background/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-[85%] max-w-sm z-50 bg-card border-l border-border flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex gap-2">
                  <button
                    onClick={() => { setViewingInbox(false); setSelectedRecipient(null); }}
                    className={`text-xs font-display font-bold px-3 py-1 rounded-full transition-colors ${!viewingInbox ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
                  >
                    שלח מזכר
                  </button>
                  <button
                    onClick={handleOpenInbox}
                    className={`text-xs font-display font-bold px-3 py-1 rounded-full transition-colors ${viewingInbox ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
                  >
                    תיבת דואר {unread > 0 && `(${unread})`}
                  </button>
                </div>
                <button onClick={() => { setOpen(false); setSelectedRecipient(null); setViewingInbox(false); }}>
                  <X size={20} className="text-muted-foreground" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {viewingInbox ? (
                  /* Inbox */
                  <div className="space-y-3">
                    <h3 className="font-display font-bold text-foreground text-sm flex items-center gap-2">
                      <MessageSquareText size={16} /> הודעות שהתקבלו
                    </h3>
                    {currentPlayer.memos.length === 0 ? (
                      <p className="text-muted-foreground text-sm text-center py-8">אין הודעות עדיין</p>
                    ) : (
                      [...currentPlayer.memos].reverse().map((memo) => {
                        const sender = players.find(p => p.id === memo.fromPlayerId);
                        const senderParty = PARTIES.find(p => p.id === sender?.party);
                        return (
                          <motion.div
                            key={memo.id}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`glass-panel p-3 border-r-2 ${!memo.read ? 'border-r-primary' : 'border-r-border'}`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <img src={AVATAR_MAP[sender?.party || 'blue']} alt="" className="w-6 h-6 rounded-full object-cover" />
                              <span className="text-xs font-display font-bold text-foreground">{sender?.name}</span>
                              <span className="text-[10px] text-muted-foreground mr-auto">
                                {new Date(memo.timestamp).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-sm text-foreground">{memo.message}</p>
                          </motion.div>
                        );
                      })
                    )}
                  </div>
                ) : !selectedRecipient ? (
                  /* Recipient Selection */
                  <div className="space-y-3">
                    <h3 className="font-display font-bold text-foreground text-sm">בחר נמען:</h3>
                    {otherPlayers.map((player) => {
                      const party = PARTIES.find(p => p.id === player.party);
                      return (
                        <motion.button
                          key={player.id}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => setSelectedRecipient(player.id)}
                          className="w-full glass-panel p-3 flex items-center gap-3 hover:border-primary/50 transition-colors"
                        >
                          <img src={AVATAR_MAP[player.party]} alt="" className="w-8 h-8 rounded-full object-cover" />
                          <div className="text-right">
                            <p className="font-display font-bold text-foreground text-sm">{player.name}</p>
                            <p className="text-[10px] text-muted-foreground">{party?.name}</p>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                ) : (
                  /* Message Selection */
                  <div className="space-y-3">
                    <button onClick={() => setSelectedRecipient(null)} className="text-xs text-primary font-display">
                      ← חזרה לבחירת נמען
                    </button>
                    <h3 className="font-display font-bold text-foreground text-sm">הודעות מהירות:</h3>
                    <div className="space-y-2">
                      {QUICK_MESSAGES.map((msg, i) => (
                        <motion.button
                          key={i}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.04 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => handleSend(msg)}
                          className="w-full text-right glass-panel p-3 text-sm text-foreground hover:border-primary/50 transition-colors"
                        >
                          {msg}
                        </motion.button>
                      ))}
                    </div>
                    <div className="border-t border-border pt-3 mt-3">
                      <p className="text-xs text-muted-foreground mb-2">הודעה מותאמת אישית:</p>
                      <div className="flex gap-2">
                        <Input
                          value={customMessage}
                          onChange={(e) => setCustomMessage(e.target.value)}
                          placeholder="כתוב הודעה..."
                          className="bg-muted border-border text-foreground text-sm flex-1"
                          onKeyDown={(e) => e.key === 'Enter' && handleSend(customMessage)}
                        />
                        <Button
                          size="sm"
                          onClick={() => handleSend(customMessage)}
                          disabled={!customMessage.trim()}
                          className="bg-primary text-primary-foreground"
                        >
                          <Send size={14} />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default SecretMemo;
