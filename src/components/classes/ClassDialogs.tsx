import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Icon from "@/components/ui/icon";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface ClassDialogsProps {
  isAddClassOpen: boolean;
  setIsAddClassOpen: (open: boolean) => void;
  newClassName: string;
  setNewClassName: (name: string) => void;
  selectedGames: ("valheim" | "civilization" | "factorio" | "sport" | "robo" | "lumosity")[];
  setSelectedGames: (games: ("valheim" | "civilization" | "factorio" | "sport" | "robo" | "lumosity")[]) => void;
  isEditGamesOpen: boolean;
  setIsEditGamesOpen: (open: boolean) => void;
  onAddClass: () => void;
  onUpdateClassGames: () => void;
  toggleGame: (game: "valheim" | "civilization" | "factorio" | "sport" | "robo" | "lumosity") => void;
}

const gameOptions: { value: "valheim" | "civilization" | "factorio" | "sport" | "robo" | "lumosity"; label: string; icon: string }[] = [
  { value: "lumosity", label: "Люмосити", icon: "Brain" },
  { value: "valheim", label: "Valheim", icon: "Swords" },
  { value: "civilization", label: "Civilization", icon: "Globe" },
  { value: "factorio", label: "Factorio", icon: "Factory" },
  { value: "sport", label: "Спорт", icon: "Trophy" },
  { value: "robo", label: "Робототехника", icon: "Bot" }
];

export const ClassDialogs = ({
  isAddClassOpen,
  setIsAddClassOpen,
  newClassName,
  setNewClassName,
  selectedGames,
  setSelectedGames,
  isEditGamesOpen,
  setIsEditGamesOpen,
  onAddClass,
  onUpdateClassGames,
  toggleGame
}: ClassDialogsProps) => {
  return (
    <>
      <Dialog open={isAddClassOpen} onOpenChange={setIsAddClassOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Новый класс</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Название класса</Label>
              <Input
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                placeholder="Например: 10А"
                onKeyPress={(e) => e.key === 'Enter' && onAddClass()}
              />
            </div>
            <div>
              <Label>Выберите игры для класса (необязательно)</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {gameOptions.map(game => (
                  <Button
                    key={game.value}
                    type="button"
                    variant={selectedGames.includes(game.value) ? "default" : "outline"}
                    onClick={() => toggleGame(game.value)}
                    className="justify-start"
                  >
                    <Icon name={game.icon} size={18} className="mr-2" />
                    {game.label}
                  </Button>
                ))}
              </div>
            </div>
            <Button onClick={onAddClass} className="w-full">
              Создать класс
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditGamesOpen} onOpenChange={setIsEditGamesOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать игры класса</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Выберите игры</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {gameOptions.map(game => (
                  <Button
                    key={game.value}
                    type="button"
                    variant={selectedGames.includes(game.value) ? "default" : "outline"}
                    onClick={() => toggleGame(game.value)}
                    className="justify-start"
                  >
                    <Icon name={game.icon} size={18} className="mr-2" />
                    {game.label}
                  </Button>
                ))}
              </div>
            </div>
            <Button onClick={onUpdateClassGames} className="w-full">
              Сохранить изменения
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
