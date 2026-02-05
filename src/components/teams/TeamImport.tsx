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
    team1Color: string;
    team2Color: string;
    selectedGame: string;
    selectedLeague: string;
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
          'Игра': string;
          'Команда 1': string;
          'Цвет команды 1': string;
          'Класс команды 1': string;
          'Ученики команды 1': string;
          'Команда 2': string;
          'Цвет команды 2': string;
          'Класс команды 2': string;
          'Ученики команды 2': string;
          'Лига': string;
          'Дата': string;
          'Время': string;
        }>(matchesSheet);

        matchesData.forEach(row => {
          if (!row['Игра'] || !row['Команда 1'] || !row['Команда 2']) return;

          const team1MembersNames = row['Ученики команды 1']?.split(',').map(s => s.trim()) || [];
          const team2MembersNames = row['Ученики команды 2']?.split(',').map(s => s.trim()) || [];
          
          const team1ClassFilter = row['Класс команды 1']?.trim() || '';
          const team2ClassFilter = row['Класс команды 2']?.trim() || '';

          const team1MembersList: TeamMember[] = team1MembersNames
            .map(name => {
              const student = allStudents.find(s => 
                s.name === name && 
                (!team1ClassFilter || s.className === team1ClassFilter)
              );
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
              const student = allStudents.find(s => 
                s.name === name && 
                (!team2ClassFilter || s.className === team2ClassFilter)
              );
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

          const importedSchedules: ScheduledDate[] = [];
          if (row['Дата'] && row['Время']) {
            importedSchedules.push({
              id: Date.now().toString(),
              date: row['Дата'],
              time: row['Время']
            });
          }
          
          const team1Color = row['Цвет команды 1'] || '#FFFFFF';
          const team2Color = row['Цвет команды 2'] || '#FFFFFF';
          const league = row['Лига'] || '';

          onImportComplete({
            team1Members: team1MembersList,
            team2Members: team2MembersList,
            team1Name: row['Команда 1'],
            team2Name: row['Команда 2'],
            team1Color: team1Color,
            team2Color: team2Color,
            selectedGame: row['Игра'].toLowerCase(),
            selectedLeague: league,
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