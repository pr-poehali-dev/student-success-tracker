import { useState } from "react";
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
  const [visibleCount, setVisibleCount] = useState(20);
  
  const sortedMatches = [...matches].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  const visibleMatches = sortedMatches.slice(0, visibleCount);
  const hasMore = visibleCount < sortedMatches.length;
  
  const loadMore = () => {
    setVisibleCount(prev => prev + 20);
  };

  return (
    <>
      {matches.length === 0 ? (
        <Card className="p-8 border-dashed">
          <div className="text-center text-muted-foreground">
            <Icon name="CalendarOff" size={32} className="mx-auto mb-2" />
            <p>Нет матчей по выбранным фильтрам</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {visibleMatches.map(match => {
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
                        Создан: {new Date(match.date).toLocaleString('ru-RU')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Организатор: {match.createdBy || "Не указан"}
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

                {match.scheduledDates && match.scheduledDates.length > 0 && (
                  <div className="mb-3 p-3 bg-secondary/30 rounded">
                    <p className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Icon name="Calendar" size={14} />
                      Расписание:
                    </p>
                    <div className="space-y-1">
                      {match.scheduledDates.map(schedule => (
                        <p key={schedule.id} className="text-xs text-muted-foreground">
                          • {new Date(schedule.date).toLocaleDateString('ru-RU')} в {schedule.time}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

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
          
          {hasMore && (
            <div className="text-center pt-4">
              <Button 
                onClick={loadMore}
                variant="outline"
                className="w-full"
              >
                <Icon name="ChevronDown" size={18} className="mr-2" />
                Показать ещё ({sortedMatches.length - visibleCount} матчей)
              </Button>
            </div>
          )}
        </div>
      )}
    </>
  );
};