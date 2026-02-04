import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Icon from "@/components/ui/icon";
import { Match, DisciplineCounter } from "@/types";
import { toast } from "sonner";

interface DisciplineCountersProps {
  match: Match;
  onUpdateCounters: (matchId: string, counters: DisciplineCounter[]) => void;
}

export const DisciplineCounters = ({ match, onUpdateCounters }: DisciplineCountersProps) => {
  const [newDisciplineName, setNewDisciplineName] = useState("");
  const [isAddingDiscipline, setIsAddingDiscipline] = useState(false);

  const counters = match.disciplineCounters || [];
  const allStudents = [...match.team1.members, ...match.team2.members];

  const addDiscipline = () => {
    if (!newDisciplineName.trim()) {
      toast.error("Введите название дисциплины");
      return;
    }

    if (counters.length >= 3) {
      toast.error("Максимум 3 дисциплины на матч");
      return;
    }

    const initialScores: { [key: string]: number } = {};
    allStudents.forEach(student => {
      initialScores[student.studentId] = 0;
    });

    const newCounter: DisciplineCounter = {
      disciplineName: newDisciplineName.trim(),
      studentScores: initialScores
    };

    onUpdateCounters(match.id, [...counters, newCounter]);
    setNewDisciplineName("");
    setIsAddingDiscipline(false);
    toast.success(`Дисциплина "${newDisciplineName}" добавлена`);
  };

  const removeDiscipline = (index: number) => {
    const updated = counters.filter((_, i) => i !== index);
    onUpdateCounters(match.id, updated);
    toast.success("Дисциплина удалена");
  };

  const updateScore = (disciplineIndex: number, studentId: string, delta: number) => {
    const updated = counters.map((counter, index) => {
      if (index !== disciplineIndex) return counter;

      const currentScore = counter.studentScores[studentId] || 0;
      const newScore = currentScore + delta;

      return {
        ...counter,
        studentScores: {
          ...counter.studentScores,
          [studentId]: newScore
        }
      };
    });

    onUpdateCounters(match.id, updated);
  };

  return (
    <div className="space-y-4 mt-4 p-4 bg-secondary/20 rounded-lg border">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold flex items-center gap-2">
          <Icon name="ClipboardList" size={18} />
          Оценки по дисциплинам
        </h4>
        {counters.length < 3 && !isAddingDiscipline && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsAddingDiscipline(true)}
          >
            <Icon name="Plus" size={16} className="mr-2" />
            Добавить дисциплину
          </Button>
        )}
      </div>

      {isAddingDiscipline && (
        <div className="flex gap-2 p-3 bg-background rounded border">
          <div className="flex-1">
            <Label htmlFor="discipline-name" className="text-xs mb-1 block">Название дисциплины</Label>
            <Input
              id="discipline-name"
              value={newDisciplineName}
              onChange={(e) => setNewDisciplineName(e.target.value)}
              placeholder="Например: Активность, Тактика, Лидерство"
              maxLength={50}
            />
          </div>
          <div className="flex items-end gap-2">
            <Button size="sm" onClick={addDiscipline}>
              <Icon name="Check" size={16} />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setIsAddingDiscipline(false);
                setNewDisciplineName("");
              }}
            >
              <Icon name="X" size={16} />
            </Button>
          </div>
        </div>
      )}

      {counters.length === 0 && !isAddingDiscipline && (
        <p className="text-sm text-muted-foreground text-center py-4">
          Дисциплины не добавлены. Нажмите "Добавить дисциплину" для начала оценки.
        </p>
      )}

      {counters.map((counter, disciplineIndex) => (
        <div key={disciplineIndex} className="p-3 bg-background rounded border space-y-3">
          <div className="flex items-center justify-between">
            <h5 className="font-medium">Дисциплина: {counter.disciplineName}</h5>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => removeDiscipline(disciplineIndex)}
            >
              <Icon name="Trash2" size={14} />
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium mb-2 text-muted-foreground">
                {match.team1.name}
              </p>
              <div className="space-y-2">
                {match.team1.members.map(member => {
                  const score = counter.studentScores[member.studentId] || 0;
                  return (
                    <div key={member.studentId} className="flex items-center justify-between gap-2 p-2 rounded bg-secondary/30">
                      <span className="text-sm flex-1">{member.studentName}</span>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateScore(disciplineIndex, member.studentId, -1)}
                          className="h-7 w-7 p-0"
                        >
                          <Icon name="Minus" size={14} />
                        </Button>
                        <span className="text-sm font-semibold min-w-[2rem] text-center">
                          {score}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateScore(disciplineIndex, member.studentId, 1)}
                          className="h-7 w-7 p-0"
                        >
                          <Icon name="Plus" size={14} />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-2 text-muted-foreground">
                {match.team2.name}
              </p>
              <div className="space-y-2">
                {match.team2.members.map(member => {
                  const score = counter.studentScores[member.studentId] || 0;
                  return (
                    <div key={member.studentId} className="flex items-center justify-between gap-2 p-2 rounded bg-secondary/30">
                      <span className="text-sm flex-1">{member.studentName}</span>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateScore(disciplineIndex, member.studentId, -1)}
                          className="h-7 w-7 p-0"
                        >
                          <Icon name="Minus" size={14} />
                        </Button>
                        <span className="text-sm font-semibold min-w-[2rem] text-center">
                          {score}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateScore(disciplineIndex, member.studentId, 1)}
                          className="h-7 w-7 p-0"
                        >
                          <Icon name="Plus" size={14} />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
