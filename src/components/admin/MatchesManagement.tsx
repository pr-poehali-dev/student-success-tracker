import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import { Match } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface MatchesManagementProps {
  matches: Match[];
  onDeleteMatch: (matchId: string) => void;
}

export const MatchesManagement = ({ matches, onDeleteMatch }: MatchesManagementProps) => {
  const handleDeleteMatch = (matchId: string) => {
    if (confirm("Вы уверены, что хотите удалить этот матч?")) {
      onDeleteMatch(matchId);
      toast.success("Матч удалён");
    }
  };

  const getGameTypeLabel = (gameType: string) => {
    const labels: Record<string, string> = {
      valheim: "Valheim",
      civilization: "Civilization",
      factorio: "Factorio",
      sport: "Спорт",
      robo: "Робототехника"
    };
    return labels[gameType] || gameType;
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Icon name="Trophy" size={20} className="text-primary" />
        Управление матчами
      </h3>

      {matches.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Icon name="Trophy" size={32} className="mx-auto mb-2" />
          <p>Нет созданных матчей</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Тип игры</TableHead>
                <TableHead>Команда 1</TableHead>
                <TableHead>Команда 2</TableHead>
                <TableHead>Дата</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Создал</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {matches.map((match) => (
                <TableRow key={match.id}>
                  <TableCell>
                    <Badge variant="outline">{getGameTypeLabel(match.gameType)}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">{match.team1.name}</TableCell>
                  <TableCell className="font-medium">{match.team2.name}</TableCell>
                  <TableCell>
                    {new Date(match.date).toLocaleDateString('ru-RU')}
                  </TableCell>
                  <TableCell>
                    {match.completed ? (
                      <Badge variant="default">Завершён</Badge>
                    ) : (
                      <Badge variant="secondary">В процессе</Badge>
                    )}
                  </TableCell>
                  <TableCell>{match.createdBy}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteMatch(match.id)}
                    >
                      <Icon name="Trash2" size={16} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </Card>
  );
};
