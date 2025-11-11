import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";

interface MatchFiltersProps {
  filterCreator: string;
  filterGame: string;
  creators: string[];
  games: Array<{ id: string; name: string }>;
  onFilterCreatorChange: (value: string) => void;
  onFilterGameChange: (value: string) => void;
  onReset: () => void;
}

export const MatchFilters = ({
  filterCreator,
  filterGame,
  creators,
  games,
  onFilterCreatorChange,
  onFilterGameChange,
  onReset
}: MatchFiltersProps) => {
  return (
    <Card className="p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <Icon name="Filter" size={18} className="text-primary" />
        <h4 className="font-semibold">Фильтры</h4>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <Label className="text-xs mb-1 block">Создатель матча</Label>
          <Select value={filterCreator} onValueChange={onFilterCreatorChange}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Все" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все</SelectItem>
              {creators.map(creator => (
                <SelectItem key={creator} value={creator}>
                  {creator}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs mb-1 block">Тип игры</Label>
          <Select value={filterGame} onValueChange={onFilterGameChange}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Все" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все</SelectItem>
              {games.map(game => (
                <SelectItem key={game.id} value={game.id}>
                  {game.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end">
          <Button 
            onClick={onReset} 
            variant="outline" 
            size="sm" 
            className="w-full h-9"
          >
            <Icon name="X" size={14} className="mr-1" />
            Сбросить
          </Button>
        </div>
      </div>
    </Card>
  );
};
