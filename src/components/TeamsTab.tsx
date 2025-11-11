import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import { ClassRoom, Match, TeamMember } from "@/types";
import { toast } from "sonner";
import { GameSelector } from "./teams/GameSelector";
import { TeamBuilder } from "./teams/TeamBuilder";
import { MatchHistory } from "./teams/MatchHistory";
import * as XLSX from "xlsx";

interface TeamsTabProps {
  classes: ClassRoom[];
  setClasses: (classes: ClassRoom[]) => void;
}

export const TeamsTab = ({ classes, setClasses }: TeamsTabProps) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedGame, setSelectedGame] = useState<string>("");
  const [team1Members, setTeam1Members] = useState<TeamMember[]>([]);
  const [team2Members, setTeam2Members] = useState<TeamMember[]>([]);
  const [team1Name, setTeam1Name] = useState<string>("Команда 1");
  const [team2Name, setTeam2Name] = useState<string>("Команда 2");
  const [selectedStudentForTeam1, setSelectedStudentForTeam1] = useState<string>("");
  const [selectedStudentForTeam2, setSelectedStudentForTeam2] = useState<string>("");
  const [filterClassTeam1, setFilterClassTeam1] = useState<string>("all");
  const [filterClassTeam2, setFilterClassTeam2] = useState<string>("all");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allStudents = classes.flatMap(cls => 
    cls.students.map(student => ({
      id: student.id,
      name: student.name,
      className: cls.name,
      classId: cls.id
    }))
  );

  const availableStudents = allStudents.filter(
    student => 
      !team1Members.some(m => m.studentId === student.id) &&
      !team2Members.some(m => m.studentId === student.id)
  );

  const availableStudentsTeam1 = availableStudents.filter(
    student => filterClassTeam1 === "all" || student.className === filterClassTeam1
  );

  const availableStudentsTeam2 = availableStudents.filter(
    student => filterClassTeam2 === "all" || student.className === filterClassTeam2
  );

  const addToTeam1 = () => {
    if (!selectedStudentForTeam1) {
      toast.error("Выберите ученика");
      return;
    }
    if (team1Members.length >= 15) {
      toast.error("Команда не может содержать более 15 человек");
      return;
    }
    const student = allStudents.find(s => s.id === selectedStudentForTeam1);
    if (!student) return;

    setTeam1Members([...team1Members, {
      studentId: student.id,
      studentName: student.name,
      className: student.className,
      role: "player"
    }]);
    setSelectedStudentForTeam1("");
    toast.success(`${student.name} добавлен в Команду 1`);
  };

  const addToTeam2 = () => {
    if (!selectedStudentForTeam2) {
      toast.error("Выберите ученика");
      return;
    }
    if (team2Members.length >= 15) {
      toast.error("Команда не может содержать более 15 человек");
      return;
    }
    const student = allStudents.find(s => s.id === selectedStudentForTeam2);
    if (!student) return;

    setTeam2Members([...team2Members, {
      studentId: student.id,
      studentName: student.name,
      className: student.className,
      role: "player"
    }]);
    setSelectedStudentForTeam2("");
    toast.success(`${student.name} добавлен в Команду 2`);
  };

  const toggleRoleTeam1 = (studentId: string) => {
    setTeam1Members(team1Members.map(member =>
      member.studentId === studentId
        ? { ...member, role: member.role === "player" ? "captain" : "player" }
        : member
    ));
  };

  const toggleRoleTeam2 = (studentId: string) => {
    setTeam2Members(team2Members.map(member =>
      member.studentId === studentId
        ? { ...member, role: member.role === "captain" ? "player" : "captain" }
        : member
    ));
  };

  const removeFromTeam1 = (studentId: string) => {
    setTeam1Members(team1Members.filter(m => m.studentId !== studentId));
  };

  const removeFromTeam2 = (studentId: string) => {
    setTeam2Members(team2Members.filter(m => m.studentId !== studentId));
  };

  const createMatch = () => {
    if (!selectedGame) {
      toast.error("Выберите игру");
      return;
    }
    if (team1Members.length === 0 || team2Members.length === 0) {
      toast.error("Обе команды должны содержать хотя бы одного ученика");
      return;
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
      completed: false
    };

    setMatches([...matches, newMatch]);
    setTeam1Members([]);
    setTeam2Members([]);
    setTeam1Name("Команда 1");
    setTeam2Name("Команда 2");
    setSelectedGame("");
    toast.success("Матч создан! Теперь можно назначить результат");
  };

  const setMatchResult = (matchId: string, winner: "team1" | "team2") => {
    const match = matches.find(m => m.id === matchId);
    if (!match) return;

    const winningTeam = winner === "team1" ? match.team1 : match.team2;
    const losingTeam = winner === "team1" ? match.team2 : match.team1;

    const updatedClasses = classes.map(cls => ({
      ...cls,
      students: cls.students.map(student => {
        const isWinner = winningTeam.members.some(m => m.studentId === student.id);
        const isLoser = losingTeam.members.some(m => m.studentId === student.id);
        
        if (!isWinner && !isLoser) return student;

        const teamMember = isWinner 
          ? winningTeam.members.find(m => m.studentId === student.id)
          : losingTeam.members.find(m => m.studentId === student.id);

        const playerTeam = isWinner ? winningTeam : losingTeam;
        const opponentTeam = isWinner ? losingTeam : winningTeam;
        const matchName = `${match.team1.name} vs ${match.team2.name}`;

        const newActivity = {
          type: match.gameType,
          date: match.date,
          result: isWinner ? "win" : "loss",
          role: teamMember?.role || "player",
          gameStatus: "finished" as const,
          matchName,
          teamName: playerTeam.name,
          opponentTeamName: opponentTeam.name
        };

        return {
          ...student,
          activities: [...(student.activities || []), newActivity]
        };
      })
    }));

    setClasses(updatedClasses);
    setMatches(matches.map(m => 
      m.id === matchId ? { ...m, result: winner, completed: true } : m
    ));
    
    const winnerName = winner === "team1" ? match.team1.name : match.team2.name;
    toast.success(`Победа ${winnerName}! Результаты сохранены`);
  };

  const deleteMatch = (matchId: string) => {
    setMatches(matches.filter(m => m.id !== matchId));
    toast.success("Матч удалён");
  };

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

          setTeam1Members(team1MembersList);
          setTeam2Members(team2MembersList);
          setTeam1Name(row['Команда 1']);
          setTeam2Name(row['Команда 2']);
          setSelectedGame(row['Тип игры'].toLowerCase());
        });

        toast.success("Команды загружены! Теперь создайте матч");
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
          <Icon name="Users" size={28} />
          Управление командами
        </h2>
        
        <div className="flex gap-2">
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
        </div>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Icon name="Gamepad2" size={20} className="text-primary" />
          Создание нового матча
        </h3>

        <div className="space-y-4">
          <GameSelector 
            selectedGame={selectedGame}
            onSelectGame={setSelectedGame}
          />

          {selectedGame && (
            <div className="grid md:grid-cols-2 gap-6 mt-6">
              <TeamBuilder
                teamNumber={1}
                teamName={team1Name}
                teamMembers={team1Members}
                selectedStudent={selectedStudentForTeam1}
                filterClass={filterClassTeam1}
                availableStudents={availableStudentsTeam1}
                classes={classes}
                onTeamNameChange={setTeam1Name}
                onFilterClassChange={setFilterClassTeam1}
                onStudentSelect={setSelectedStudentForTeam1}
                onAddStudent={addToTeam1}
                onToggleRole={toggleRoleTeam1}
                onRemoveStudent={removeFromTeam1}
              />

              <TeamBuilder
                teamNumber={2}
                teamName={team2Name}
                teamMembers={team2Members}
                selectedStudent={selectedStudentForTeam2}
                filterClass={filterClassTeam2}
                availableStudents={availableStudentsTeam2}
                classes={classes}
                onTeamNameChange={setTeam2Name}
                onFilterClassChange={setFilterClassTeam2}
                onStudentSelect={setSelectedStudentForTeam2}
                onAddStudent={addToTeam2}
                onToggleRole={toggleRoleTeam2}
                onRemoveStudent={removeFromTeam2}
              />
            </div>
          )}

          {selectedGame && team1Members.length > 0 && team2Members.length > 0 && (
            <Button onClick={createMatch} className="w-full" size="lg">
              <Icon name="Plus" size={18} className="mr-2" />
              Создать матч
            </Button>
          )}
        </div>
      </Card>

      <MatchHistory 
        matches={matches}
        onSetResult={setMatchResult}
        onDeleteMatch={deleteMatch}
      />
    </div>
  );
};