import { useRef } from "react";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { TeamMember, ScheduledDate, Match, Teacher } from "@/types";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { createMatchWithValidation } from "./MatchCreator";
import { generateUniqueId } from "@/utils/generateUniqueId";

interface TeamImportProps {
  allStudents: Array<{ id: string; name: string; className: string }>;
  matches: Match[];
  teacher: Teacher;
  onMatchesCreated: (matches: Match[]) => void;
}

export const TeamImport = ({ allStudents, matches, teacher, onMatchesCreated }: TeamImportProps) => {
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

        const createdMatches: Match[] = [];
        console.log('📊 [TeamImport] Всего строк в Excel:', matchesData.length);

        matchesData.forEach((row, index) => {
          console.log(`\n🔍 [TeamImport] Обработка строки ${index + 1}:`, row);
          if (!row['Игра'] || !row['Команда 1'] || !row['Команда 2']) {
            console.log(`❌ [TeamImport] Строка ${index + 1} пропущена: отсутствуют обязательные колонки`, {
              game: row['Игра'],
              team1: row['Команда 1'],
              team2: row['Команда 2']
            });
            return;
          }

          const team1MembersNames = row['Ученики команды 1']?.split(',').map(s => s.trim()) || [];
          const team2MembersNames = row['Ученики команды 2']?.split(',').map(s => s.trim()) || [];
          
          const team1ClassFilter = row['Класс команды 1']?.trim() || '';
          const team2ClassFilter = row['Класс команды 2']?.trim() || '';
          console.log(`👥 [TeamImport] Строка ${index + 1} - Ученики команды 1:`, team1MembersNames);
          console.log(`👥 [TeamImport] Строка ${index + 1} - Ученики команды 2:`, team2MembersNames);

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
              if (!student) {
                console.log(`⚠️ [TeamImport] Строка ${index + 1} - Ученик "${name}" не найден в команде 2`);
                return null;
              }
              return {
                studentId: student.id,
                studentName: student.name,
                className: student.className,
                role: "player" as const
              };
            })
            .filter(m => m !== null) as TeamMember[];

          if (team1MembersList.length === 0 || team2MembersList.length === 0) {
            console.log(`❌ [TeamImport] Строка ${index + 1} пропущена: пустые команды`, {
              team1Count: team1MembersList.length,
              team2Count: team2MembersList.length
            });
            return;
          }

          const existingScheduleIds = matches.flatMap(m => 
            m.scheduledDates?.map(sd => sd.id) || []
          );
          
          const importedSchedules: ScheduledDate[] = [];
          if (row['Дата'] && row['Время']) {
            importedSchedules.push({
              id: generateUniqueId(existingScheduleIds),
              date: row['Дата'],
              time: row['Время']
            });
          }
          console.log(`📅 [TeamImport] Строка ${index + 1} - Расписание:`, {
            date: row['Дата'],
            time: row['Время'],
            scheduleCount: importedSchedules.length
          });
          
          const team1Color = row['Цвет команды 1'] || '#FFFFFF';
          const team2Color = row['Цвет команды 2'] || '#FFFFFF';
          const league = row['Лига'] || '';
          
          console.log(`🎮 [TeamImport] Строка ${index + 1} - Параметры матча:`, {
            game: row['Игра'],
            gameLowerCase: row['Игра'].toLowerCase(),
            league: league,
            leagueEmpty: league === '',
            team1Name: row['Команда 1'],
            team2Name: row['Команда 2']
          });

          const newMatch = createMatchWithValidation({
            selectedGame: row['Игра'].toLowerCase(),
            team1Members: team1MembersList,
            team2Members: team2MembersList,
            team1Name: row['Команда 1'],
            team2Name: row['Команда 2'],
            team1Color: team1Color,
            team2Color: team2Color,
            scheduledDates: importedSchedules,
            matches: [...matches, ...createdMatches],
            allStudents,
            teacher,
            selectedLeague: league
          });

          if (newMatch) {
            console.log(`✅ [TeamImport] Строка ${index + 1} - Матч создан успешно!`);
            createdMatches.push(newMatch);
          } else {
            console.log(`❌ [TeamImport] Строка ${index + 1} - Матч НЕ создан (валидация не прошла)`);
          }
        });

        console.log(`\n📊 [TeamImport] Итог импорта:`, {
          totalRows: matchesData.length,
          createdMatches: createdMatches.length
        });

        if (createdMatches.length > 0) {
          onMatchesCreated(createdMatches);
          toast.success(`Создано матчей: ${createdMatches.length}`);
        } else {
          toast.error("Не удалось создать ни одного матча");
        }
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