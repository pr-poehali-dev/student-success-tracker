import { Match, ScheduledDate } from "@/types";

interface ConflictInfo {
  hasConflict: boolean;
  conflictingMatch?: Match;
  conflictingStudents: string[];
}

export const checkScheduleConflicts = (
  newMatchStudentIds: string[],
  newScheduledDates: ScheduledDate[],
  existingMatches: Match[]
): ConflictInfo => {
  for (const newDate of newScheduledDates) {
    for (const existingMatch of existingMatches) {
      if (!existingMatch.scheduledDates || existingMatch.scheduledDates.length === 0) {
        continue;
      }

      for (const existingDate of existingMatch.scheduledDates) {
        if (existingDate.date === newDate.date && existingDate.time === newDate.time) {
          const existingStudentIds = [
            ...existingMatch.team1.members.map(m => m.studentId),
            ...existingMatch.team2.members.map(m => m.studentId)
          ];

          const conflictingStudents = newMatchStudentIds.filter(id => 
            existingStudentIds.includes(id)
          );

          if (conflictingStudents.length > 0) {
            return {
              hasConflict: true,
              conflictingMatch: existingMatch,
              conflictingStudents
            };
          }
        }
      }
    }
  }

  return {
    hasConflict: false,
    conflictingStudents: []
  };
};

export const getStudentName = (studentId: string, allStudents: Array<{ id: string; name: string }>): string => {
  return allStudents.find(s => s.id === studentId)?.name || "Неизвестный";
};
