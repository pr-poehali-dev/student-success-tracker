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
  compact?: boolean;
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

export const DisciplineCounters = ({ match, onUpdateCounters, compact = false }: DisciplineCountersProps) => {
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

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {counters.length < 3 && !isAddingDiscipline && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsAddingDiscipline(true)}
          >
            <Icon name="Plus" size={14} className="mr-1" />
            Дисциплина
          </Button>
        )}
        {isAddingDiscipline && (
          <div className="flex gap-1 items-center">
            <Input
              value={newDisciplineName}
              onChange={(e) => setNewDisciplineName(e.target.value)}
              placeholder="Название"
              maxLength={20}
              className="h-8 text-xs w-32"
            />
            <Button size="sm" variant="outline" onClick={addDiscipline} className="h-8 w-8 p-0">
              <Icon name="Check" size={14} />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setIsAddingDiscipline(false);
                setNewDisciplineName("");
              }}
              className="h-8 w-8 p-0"
            >
              <Icon name="X" size={14} />
            </Button>
          </div>
        )}
        {counters.length > 0 && (
          <div className="flex gap-1">
            {counters.map((counter, index) => (
              <div key={index} className="flex items-center gap-1 px-2 py-1 rounded border bg-background">
                <span className="text-xs font-medium">
                  {counter.disciplineName}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeDiscipline(index)}
                  className="h-4 w-4 p-0 hover:bg-destructive/20"
                >
                  <Icon name="X" size={10} />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return null;
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
              className="h-7 w-7 p-0"
            >
              <Icon name="Minus" size={14} />
            </Button>
            <span className="text-xs font-medium min-w-[1.5rem] text-center">
              {score}
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onUpdateScore(disciplineIndex, studentId, 1)}
              className="h-7 w-7 p-0"
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
      {counters.map((counter, index) => (
        <div 
          key={index} 
          className="text-xs font-bold text-center min-w-[4.5rem]"
        >
          {counter.disciplineName}
        </div>
      ))}
    </div>
  );
};