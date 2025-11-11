import { useRef } from "react";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { TeamMember, ScheduledDate } from "@/types";
import { toast } from "sonner";
import * as XLSX from "xlsx";

interface TeamImportProps {
  allStudents: Array<{ id: string; name: string; className: string }>;
  onImportComplete: (data: {
    team1Members: TeamMember[];
    team2Members: TeamMember[];
    team1Name: string;
    team2Name: string;
    selectedGame: string;
    scheduledDates: ScheduledDate[];
  }) => void;
}

export const TeamImport = ({ allStudents, onImportComplete }: TeamImportProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        const matchesSheet = workbook.Sheets['Матчи'];
        
        if (!matchesSheet) {
          toast.error("Файл должен содержать лист 'Матчи'");
          return;
        }

        const matchesData = XLSX.utils.sheet_to_json<{
          'Тип игры': string;
          'Команда 1': string;
          'Команда 2': string;
          'Участники команды 1': string;
          'Участники команды 2': string;
          'Даты проведения': string;
          'Время проведения': string;
        }>(matchesSheet);

        matchesData.forEach(row => {
          if (!row['Тип игры'] || !row['Команда 1'] || !row['Команда 2']) return;

          const team1MembersNames = row['Участники команды 1']?.split(',').map(s => s.trim()) || [];
          const team2MembersNames = row['Участники команды 2']?.split(',').map(s => s.trim()) || [];

          const team1MembersList: TeamMember[] = team1MembersNames
            .map(name => {
              const student = allStudents.find(s => s.name === name);
              if (!student) return null;
              return {
                studentId: student.id,
                studentName: student.name,
                className: student.className,
                role: "player" as const
              };
            })
            .filter(m => m !== null) as TeamMember[];

          const team2MembersList: TeamMember[] = team2MembersNames
            .map(name => {
              const student = allStudents.find(s => s.name === name);
              if (!student) return null;
              return {
                studentId: student.id,
                studentName: student.name,
                className: student.className,
                role: "player" as const
              };
            })
            .filter(m => m !== null) as TeamMember[];

          if (team1MembersList.length === 0 || team2MembersList.length === 0) return;

          const dates = row['Даты проведения']?.split(',').map(s => s.trim()) || [];
          const times = row['Время проведения']?.split(',').map(s => s.trim()) || [];
          
          const importedSchedules: ScheduledDate[] = [];
          for (let i = 0; i < Math.max(dates.length, times.length); i++) {
            if (dates[i] && times[i]) {
              importedSchedules.push({
                id: Date.now().toString() + i,
                date: dates[i],
                time: times[i]
              });
            }
          }

          onImportComplete({
            team1Members: team1MembersList,
            team2Members: team2MembersList,
            team1Name: row['Команда 1'],
            team2Name: row['Команда 2'],
            selectedGame: row['Тип игры'].toLowerCase(),
            scheduledDates: importedSchedules
          });
        });

        toast.success("Команды и расписание загружены! Теперь создайте матч");
      } catch (error) {
        console.error(error);
        toast.error("Ошибка при импорте файла");
      }
    };
    reader.readAsArrayBuffer(file);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileImport}
        style={{ display: 'none' }}
      />
      <Button 
        onClick={() => fileInputRef.current?.click()}
        variant="outline"
      >
        <Icon name="Upload" size={20} className="mr-2" />
        Импорт команд
      </Button>
    </>
  );
};
