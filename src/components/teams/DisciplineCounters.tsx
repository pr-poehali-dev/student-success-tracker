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

const DISCIPLINE_COLORS = [
  { color: 'hsl(var(--destructive))', label: 'destructive' },
  { color: 'hsl(var(--primary))', label: 'primary' },
  { color: 'hsl(var(--accent))', label: 'accent' },
  { color: 'hsl(25 100% 50%)', label: 'orange' },
  { color: 'hsl(280 70% 60%)', label: 'purple' },
  { color: 'hsl(160 70% 45%)', label: 'green' },
  { color: 'hsl(200 80% 55%)', label: 'blue' },
  { color: 'hsl(340 75% 55%)', label: 'pink' },
];

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
              placeholder="Например: голы, пасы, активность"
              maxLength={20}
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

      {counters.length > 0 && (
        <div className="space-y-2">
          <div className="flex gap-2 items-center">
            <span className="text-xs font-medium text-muted-foreground">Управление дисциплинами:</span>
            {counters.map((counter, index) => {
              const colorConfig = DISCIPLINE_COLORS[index % DISCIPLINE_COLORS.length];
              return (
                <div key={index} className="flex items-center gap-1 px-2 py-1 rounded border" style={{ borderColor: colorConfig.color }}>
                  <span className="text-xs font-medium" style={{ color: colorConfig.color }}>
                    {counter.disciplineName}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeDiscipline(index)}
                    className="h-4 w-4 p-0 hover:bg-destructive/20"
                  >
                    <Icon name="X" size={12} />
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export const DisciplineCountersRow = ({ 
  studentId, 
  counters, 
  onUpdateScore 
}: { 
  studentId: string; 
  counters: DisciplineCounter[]; 
  onUpdateScore: (disciplineIndex: number, studentId: string, delta: number) => void;
}) => {
  if (counters.length === 0) return null;

  return (
    <div className="flex gap-2 ml-auto">
      {counters.map((counter, disciplineIndex) => {
        const colorConfig = DISCIPLINE_COLORS[disciplineIndex % DISCIPLINE_COLORS.length];
        const score = counter.studentScores[studentId] || 0;
        
        return (
          <div key={disciplineIndex} className="flex items-center gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onUpdateScore(disciplineIndex, studentId, -1)}
              className="h-7 w-7 p-0 aspect-square !rounded-none"
              style={{ borderColor: colorConfig.color, color: colorConfig.color }}
            >
              <Icon name="Minus" size={14} />
            </Button>
            <span className="text-xs font-medium min-w-[1.5rem] text-center" style={{ color: colorConfig.color }}>
              {score}
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onUpdateScore(disciplineIndex, studentId, 1)}
              className="h-7 w-7 p-0 aspect-square !rounded-none"
              style={{ borderColor: colorConfig.color, color: colorConfig.color }}
            >
              <Icon name="Plus" size={14} />
            </Button>
          </div>
        );
      })}
    </div>
  );
};

export const DisciplineHeader = ({ counters }: { counters: DisciplineCounter[] }) => {
  if (counters.length === 0) return null;

  return (
    <div className="flex gap-2 ml-auto mb-2">
      {counters.map((counter, index) => {
        const colorConfig = DISCIPLINE_COLORS[index % DISCIPLINE_COLORS.length];
        return (
          <div 
            key={index} 
            className="text-xs font-bold text-center min-w-[4.5rem]"
            style={{ color: colorConfig.color }}
          >
            {counter.disciplineName}
          </div>
        );
      })}
    </div>
  );
};