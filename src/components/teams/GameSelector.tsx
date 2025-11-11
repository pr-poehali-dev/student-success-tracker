import Icon from "@/components/ui/icon";
import { Label } from "@/components/ui/label";

export const GAME_TYPES = [
  { id: "valheim", name: "Вальхейм", icon: "Swords", color: "bg-green-100 text-green-700" },
  { id: "civilization", name: "Цивилизация", icon: "Castle", color: "bg-amber-100 text-amber-700" },
  { id: "factorio", name: "Факторио", icon: "Factory", color: "bg-slate-100 text-slate-700" },
  { id: "sport", name: "Спорт", icon: "Trophy", color: "bg-orange-100 text-orange-700" },
  { id: "robo", name: "Робо", icon: "Bot", color: "bg-blue-100 text-blue-700" },
];

interface GameSelectorProps {
  selectedGame: string;
  onSelectGame: (gameId: string) => void;
}

export const GameSelector = ({ selectedGame, onSelectGame }: GameSelectorProps) => {
  return (
    <div>
      <Label>Выберите игру</Label>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-2">
        {GAME_TYPES.map(game => (
          <button
            key={game.id}
            className={`p-4 rounded-lg border-2 transition-all hover:scale-105 ${
              selectedGame === game.id 
                ? 'border-primary bg-primary/10 shadow-lg' 
                : 'border-border hover:border-primary/50'
            }`}
            onClick={() => onSelectGame(game.id)}
          >
            <div className="flex flex-col items-center gap-2">
              <div className={`p-3 rounded-full ${game.color}`}>
                <Icon name={game.icon as any} size={24} />
              </div>
              <span className="text-sm font-medium">{game.name}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
