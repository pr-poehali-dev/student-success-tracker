import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Match, Teacher, DisciplineCounter } from "@/types";
import { GAME_TYPES } from "./GameSelector";
import { DisciplineCounters, DisciplineCountersRow, DisciplineHeader } from "./DisciplineCounters";

interface MatchHistoryProps {
  matches: Match[];
  onSetResult: (matchId: string, winner: "team1" | "team2") => void;
  onDeleteMatch: (matchId: string) => void;
  onUpdateCounters: (matchId: string, counters: DisciplineCounter[]) => void;
  teacher: Teacher;
}

export const MatchHistory = ({ matches, onSetResult, onDeleteMatch, onUpdateCounters, teacher }: MatchHistoryProps) => {
  const [visibleCount, setVisibleCount] = useState(20);
  
  const sortedMatches = [...matches].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  const visibleMatches = sortedMatches.slice(0, visibleCount);
  const hasMore = visibleCount < sortedMatches.length;
  
  const loadMore = () => {
    setVisibleCount(prev => prev + 20);
  };

  const getLeagueName = (league?: string) => {
    const leagues: Record<string, string> = {
      beginner: "Beginner League",
      second: "Second League",
      first: "First League",
      premiere: "Premiere League"
    };
    return league ? leagues[league] : null;
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
            const canDelete = teacher.role === "admin" || match.createdBy === teacher.name;
            return (
              <Card key={match.id} className="p-4 border-2">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded ${game?.color}`}>
                      <Icon name={game?.icon as any} size={20} />
                    </div>
                    <div>
                      <p className="font-semibold">{game?.name}</p>
                      {match.league && (
                        <p className="text-xs font-medium text-primary">
                          {getLeagueName(match.league)}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Создан: {new Date(match.date).toLocaleString('ru-RU')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Организатор: {match.createdBy || "Не указан"}
                      </p>
                    </div>
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              console.log("🚨 [MatchHistory] Delete button clicked", { matchId: match.id, canDelete });
                              if (canDelete) {
                                console.log("🚨 [MatchHistory] Calling onDeleteMatch");
                                onDeleteMatch(match.id);
                              }
                            }}
                            disabled={!canDelete}
                            className={!canDelete ? "cursor-not-allowed opacity-50" : ""}
                          >
                            <Icon name="Trash2" size={16} />
                          </Button>
                        </span>
                      </TooltipTrigger>
                      {!canDelete && (
                        <TooltipContent>
                          <p>Этот матч создали не вы</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
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
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">{match.team1.name}</p>
                      <DisciplineHeader counters={match.disciplineCounters || []} />
                    </div>
                    <div className="space-y-1">
                      {match.team1.members.map(member => {
                        const updateScore = (disciplineIndex: number, studentId: string, delta: number) => {
                          const counters = match.disciplineCounters || [];
                          const updated = counters.map((counter, index) => {
                            if (index !== disciplineIndex) return counter;
                            const currentScore = counter.studentScores[studentId] || 0;
                            return {
                              ...counter,
                              studentScores: {
                                ...counter.studentScores,
                                [studentId]: currentScore + delta
                              }
                            };
                          });
                          onUpdateCounters(match.id, updated);
                        };

                        return (
                          <div key={member.studentId} className="text-sm flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span>{member.studentName}</span>
                              {member.role === "captain" && (
                                <Badge variant="secondary" className="text-xs">Капитан</Badge>
                              )}
                            </div>
                            <DisciplineCountersRow 
                              studentId={member.studentId}
                              counters={match.disciplineCounters || []}
                              onUpdateScore={updateScore}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className={`p-3 rounded border-2 ${match.result === "team2" ? "border-green-500 bg-green-50" : "border-border"}`}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">{match.team2.name}</p>
                      <DisciplineHeader counters={match.disciplineCounters || []} />
                    </div>
                    <div className="space-y-1">
                      {match.team2.members.map(member => {
                        const updateScore = (disciplineIndex: number, studentId: string, delta: number) => {
                          const counters = match.disciplineCounters || [];
                          const updated = counters.map((counter, index) => {
                            if (index !== disciplineIndex) return counter;
                            const currentScore = counter.studentScores[studentId] || 0;
                            return {
                              ...counter,
                              studentScores: {
                                ...counter.studentScores,
                                [studentId]: currentScore + delta
                              }
                            };
                          });
                          onUpdateCounters(match.id, updated);
                        };

                        return (
                          <div key={member.studentId} className="text-sm flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span>{member.studentName}</span>
                              {member.role === "captain" && (
                                <Badge variant="secondary" className="text-xs">Капитан</Badge>
                              )}
                            </div>
                            <DisciplineCountersRow 
                              studentId={member.studentId}
                              counters={match.disciplineCounters || []}
                              onUpdateScore={updateScore}
                            />
                          </div>
                        );
                      })}
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

                <DisciplineCounters match={match} onUpdateCounters={onUpdateCounters} />
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