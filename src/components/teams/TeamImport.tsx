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

interface TeamDictionary {
  [teamName: string]: TeamMember[];
}

export const TeamImport = ({ allStudents, matches, teacher, onMatchesCreated }: TeamImportProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseTeamsFromSheet = (workbook: XLSX.WorkBook): TeamDictionary => {
    const teamsSheet = workbook.Sheets['Команды'];
    
    if (!teamsSheet) {
      toast.error("Файл должен содержать лист 'Команды'");
      return {};
    }

    const teamsData = XLSX.utils.sheet_to_json<{
      'Команда': string;
      'Ученик': string;
      'Класс': string;
    }>(teamsSheet);

    console.log('📚 [TeamImport] Всего строк в листе "Команды":', teamsData.length);

    const teamDictionary: TeamDictionary = {};

    teamsData.forEach((row, index) => {
      const teamName = row['Команда']?.trim();
      const studentName = row['Ученик']?.trim();
      const className = row['Класс']?.trim();

      if (!teamName || !studentName || !className) {
        console.log(`⚠️ [TeamImport] Команды строка ${index + 1}: пропущена (нет обязательных полей)`, row);
        return;
      }

      const student = allStudents.find(s => 
        s.name === studentName && s.className === className
      );

      if (!student) {
        console.log(`❌ [TeamImport] Команды строка ${index + 1}: Ученик "${studentName}" из класса "${className}" не найден в базе`);
        toast.error(`Ученик "${studentName}" из класса "${className}" не найден в базе`, { duration: 5000 });
        return;
      }

      if (!teamDictionary[teamName]) {
        teamDictionary[teamName] = [];
      }

      teamDictionary[teamName].push({
        studentId: student.id,
        studentName: student.name,
        className: student.className,
        role: "player" as const
      });

      console.log(`✅ [TeamImport] Команды строка ${index + 1}: "${studentName}" (${className}) добавлен в команду "${teamName}"`);
    });

    console.log('📊 [TeamImport] Словарь команд создан:', teamDictionary);
    return teamDictionary;
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        const teamDictionary = parseTeamsFromSheet(workbook);
        
        if (Object.keys(teamDictionary).length === 0) {
          toast.error("Не удалось загрузить команды из листа 'Команды'");
          return;
        }

        const matchesSheet = workbook.Sheets['Матчи'];
        
        if (!matchesSheet) {
          toast.error("Файл должен содержать лист 'Матчи'");
          return;
        }

        const matchesData = XLSX.utils.sheet_to_json<{
          'Игра': string;
          'Команда 1': string;
          'Цвет команды 1': string;
          'Команда 2': string;
          'Цвет команды 2': string;
          'Лига': string;
          'Дата': string;
          'Время': string;
        }>(matchesSheet);

        const createdMatches: Match[] = [];
        console.log('📊 [TeamImport] Всего строк в листе "Матчи":', matchesData.length);

        matchesData.forEach((row, index) => {
          console.log(`\n🔍 [TeamImport] Матчи строка ${index + 1}:`, row);
          
          if (!row['Игра'] || !row['Команда 1'] || !row['Команда 2']) {
            console.log(`❌ [TeamImport] Матчи строка ${index + 1}: пропущена (нет обязательных полей)`, {
              game: row['Игра'],
              team1: row['Команда 1'],
              team2: row['Команда 2']
            });
            return;
          }

          const team1Name = row['Команда 1'].trim();
          const team2Name = row['Команда 2'].trim();

          const team1Members = teamDictionary[team1Name];
          const team2Members = teamDictionary[team2Name];

          if (!team1Members || team1Members.length === 0) {
            console.log(`❌ [TeamImport] Матчи строка ${index + 1}: Команда "${team1Name}" не найдена в словаре команд`);
            toast.error(`Команда "${team1Name}" не найдена в листе "Команды"`, { duration: 5000 });
            return;
          }

          if (!team2Members || team2Members.length === 0) {
            console.log(`❌ [TeamImport] Матчи строка ${index + 1}: Команда "${team2Name}" не найдена в словаре команд`);
            toast.error(`Команда "${team2Name}" не найдена в листе "Команды"`, { duration: 5000 });
            return;
          }

          console.log(`👥 [TeamImport] Матчи строка ${index + 1}: Команда 1 "${team1Name}" (${team1Members.length} учеников)`);
          console.log(`👥 [TeamImport] Матчи строка ${index + 1}: Команда 2 "${team2Name}" (${team2Members.length} учеников)`);

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
          
          console.log(`📅 [TeamImport] Матчи строка ${index + 1}: Расписание`, {
            date: row['Дата'],
            time: row['Время'],
            scheduleCount: importedSchedules.length
          });
          
          const team1Color = row['Цвет команды 1'] || '#FFFFFF';
          const team2Color = row['Цвет команды 2'] || '#FFFFFF';
          const league = row['Лига'] || '';
          
          console.log(`🎮 [TeamImport] Матчи строка ${index + 1}: Параметры`, {
            game: row['Игра'],
            gameLowerCase: row['Игра'].toLowerCase(),
            league: league,
            leagueEmpty: league === '',
          });

          const newMatch = createMatchWithValidation({
            selectedGame: row['Игра'].toLowerCase(),
            team1Members: team1Members,
            team2Members: team2Members,
            team1Name: team1Name,
            team2Name: team2Name,
            team1Color: team1Color,
            team2Color: team2Color,
            scheduledDates: importedSchedules,
            matches: [...matches, ...createdMatches],
            allStudents,
            teacher,
            selectedLeague: league
          });

          if (newMatch) {
            console.log(`✅ [TeamImport] Матчи строка ${index + 1}: Матч создан успешно!`);
            createdMatches.push(newMatch);
          } else {
            console.log(`❌ [TeamImport] Матчи строка ${index + 1}: Матч НЕ создан (валидация не прошла)`);
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
