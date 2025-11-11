import { Match, TeamMember, ScheduledDate, Teacher } from "@/types";
import { toast } from "sonner";

interface CreateMatchParams {
  selectedGame: string;
  team1Members: TeamMember[];
  team2Members: TeamMember[];
  team1Name: string;
  team2Name: string;
  scheduledDates: ScheduledDate[];
  matches: Match[];
  allStudents: Array<{ id: string; name: string }>;
  teacher: Teacher;
}

export const createMatchWithValidation = (params: CreateMatchParams): Match | null => {
  const {
    selectedGame,
    team1Members,
    team2Members,
    team1Name,
    team2Name,
    scheduledDates,
    matches,
    allStudents,
    teacher
  } = params;

  if (!selectedGame) {
    toast.error("Выберите игру");
    return null;
  }
  if (team1Members.length === 0 || team2Members.length === 0) {
    toast.error("Обе команды должны содержать хотя бы одного ученика");
    return null;
  }
  if (scheduledDates.length === 0) {
    toast.error("Добавьте хотя бы одну дату проведения матча");
    return null;
  }

  const allStudentIds = [
    ...team1Members.map(m => m.studentId),
    ...team2Members.map(m => m.studentId)
  ];

  for (const scheduleDate of scheduledDates) {
    for (const existingMatch of matches) {
      if (!existingMatch.scheduledDates) continue;

      for (const existingDate of existingMatch.scheduledDates) {
        if (existingDate.date === scheduleDate.date && existingDate.time === scheduleDate.time) {
          const existingStudentIds = [
            ...existingMatch.team1.members.map(m => m.studentId),
            ...existingMatch.team2.members.map(m => m.studentId)
          ];

          const conflicts = allStudentIds.filter(id => existingStudentIds.includes(id));
          
          if (conflicts.length > 0) {
            const conflictNames = conflicts
              .map(id => allStudents.find(s => s.id === id)?.name || "")
              .filter(n => n)
              .join(", ");
            
            toast.error(
              `Конфликт расписания! Ученики ${conflictNames} заняты в матче "${existingMatch.team1.name} vs ${existingMatch.team2.name}" (${existingDate.date} ${existingDate.time}). Создатель матча: ${existingMatch.createdBy}`,
              { duration: 8000 }
            );
            return null;
          }
        }
      }
    }
  }

  const newMatch: Match = {
    id: Date.now().toString(),
    gameType: selectedGame as any,
    team1: {
      id: Date.now().toString() + "-team1",
      name: team1Name,
      members: team1Members
    },
    team2: {
      id: Date.now().toString() + "-team2",
      name: team2Name,
      members: team2Members
    },
    date: new Date().toISOString(),
    completed: false,
    createdBy: teacher.name,
    scheduledDates: [...scheduledDates]
  };

  toast.success("Матч создан! Теперь можно назначить результат");
  return newMatch;
};
