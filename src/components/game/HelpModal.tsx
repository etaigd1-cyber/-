import { Brain, PersonStanding, Mic, Target, Vote, Zap, Newspaper, HelpCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

const sections = [
  {
    icon: Target,
    title: 'היעד',
    text: 'להיות הראשון שחוצה את רף 61 המנדטים ומקים ממשלה בישראל!',
  },
  {
    icon: Brain,
    title: '🧠 ידע (טריוויה)',
    text: 'ענו נכון ובמהירות על שאלת ידע. המערכת בודקת אתכם אוטומטית.',
    accent: true,
  },
  {
    icon: PersonStanding,
    title: '🏃 משימה (פיזי)',
    text: 'צאו מהמסך! עליכם לבצע משימה בבית תוך זמן קצוב (למשל: למצוא חפץ מסוים).',
    accent: true,
  },
  {
    icon: Mic,
    title: '🎤 דיבייט (שכנוע)',
    text: 'קבלו נושא בוער והציגו את עמדתכם. יש לכם 60 שניות לשכנע את שאר השחקנים!',
    accent: true,
  },
  {
    icon: Vote,
    title: 'מי השופט?',
    text: 'באתגרי ידע – המחשב קובע. במשימות ודיבייטים – השחקנים האחרים מצביעים עם Clap או Boo.',
  },
  {
    icon: Zap,
    title: 'כרטיסי כוח',
    text: 'השתמשו ב"בנק הכוח" שלכם! סריקת קודים מאפשרת להפעיל יכולות מיוחדות, לשנות חוקים או להפריע ליריבים.',
  },
  {
    icon: Newspaper,
    title: 'טיקר החדשות',
    text: 'שימו לב לטיקר בתחתית המסך – שם מופיעים הדיווחים החמים והדירוגים בזמן אמת!',
  },
];

const HelpModal = () => (
  <Dialog>
    <DialogTrigger asChild>
      <button className="fixed bottom-[76px] left-[68px] z-40 w-11 h-11 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors">
        <HelpCircle size={22} />
      </button>
    </DialogTrigger>
    <DialogContent className="max-w-md bg-card border-border p-0 gap-0">
      <DialogHeader className="p-5 pb-3 border-b border-border">
        <DialogTitle className="font-display text-xl text-center">
          🏛️ חוקי המשחק
        </DialogTitle>
      </DialogHeader>
      <ScrollArea className="max-h-[65vh] p-5 pt-3">
        <div className="space-y-4">
          <div className="text-center text-sm text-muted-foreground mb-2">
            בוחרים מחוז → מהמרים מנדטים → יוצאים לאתגר → כובשים!
          </div>
          {sections.map((s) => (
            <div key={s.title} className={`flex gap-3 items-start rounded-lg p-3 ${s.accent ? 'bg-muted/50 border border-border' : ''}`}>
              <div className="mt-0.5 shrink-0 w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center">
                <s.icon size={16} className="text-primary" />
              </div>
              <div>
                <h3 className="font-display font-bold text-sm text-foreground">{s.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{s.text}</p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </DialogContent>
  </Dialog>
);

export default HelpModal;
