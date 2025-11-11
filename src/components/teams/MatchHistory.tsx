import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import { Match } from "@/types";
import { GAME_TYPES } from "./GameSelector";

interface MatchHistoryProps {
  matches: Match[];
  onSetResult: (matchId: string, winner: "team1" | "team2") => void;
  onDeleteMatch: (matchId: string) => void;
}

export const MatchHistory = ({ matches, onSetResult, onDeleteMatch }: MatchHistoryProps) => {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Icon name="History" size={20} className="text-primary" />
        История матчей
      </h3>

      {matches.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Icon name="CalendarOff" size={32} className="mx-auto mb-2" />
          <p>Пока нет матчей</p>
        </div>
      ) : (
        <div className="space-y-4">
          {matches.map(match => {
            const game = GAME_TYPES.find(g => g.id === match.gameType);
            return (
              <Card key={match.id} className="p-4 border-2">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded ${game?.color}`}>
                      <Icon name={game?.icon as any} size={20} />
                    </div>
                    <div>
                      <p className="font-semibold">{game?.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(match.date).toLocaleString('ru-RU')}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDeleteMatch(match.id)}
                  >
                    <Icon name="Trash2" size={16} />
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-3">
                  <div className={`p-3 rounded border-2 ${match.result === "team1" ? "border-green-500 bg-green-50" : "border-border"}`}>
                    <p className="font-medium mb-2">{match.team1.name}</p>
                    <div className="space-y-1">
                      {match.team1.members.map(member => (
                        <div key={member.studentId} className="text-sm flex items-center gap-2">
                          <span>{member.studentName}</span>
                          {member.role === "captain" && (
                            <Badge variant="secondary" className="text-xs">Капитан</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className={`p-3 rounded border-2 ${match.result === "team2" ? "border-green-500 bg-green-50" : "border-border"}`}>
                    <p className="font-medium mb-2">{match.team2.name}</p>
                    <div className="space-y-1">
                      {match.team2.members.map(member => (
                        <div key={member.studentId} className="text-sm flex items-center gap-2">
                          <span>{member.studentName}</span>
                          {member.role === "captain" && (
                            <Badge variant="secondary" className="text-xs">Капитан</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {!match.completed && (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => onSetResult(match.id, "team1")}
                      className="flex-1"
                      variant="outline"
                    >
                      Победа {match.team1.name}
                    </Button>
                    <Button
                      onClick={() => onSetResult(match.id, "team2")}
                      className="flex-1"
                      variant="outline"
                    >
                      Победа {match.team2.name}
                    </Button>
                  </div>
                )}

                {match.completed && (
                  <div className="text-center p-2 bg-green-100 rounded">
                    <p className="text-sm font-medium text-green-700">
                      ✓ Результаты сохранены
                    </p>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </Card>
  );
};
