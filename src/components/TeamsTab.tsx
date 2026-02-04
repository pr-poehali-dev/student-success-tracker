import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import { ClassRoom, Match, TeamMember, Teacher, ScheduledDate, DisciplineCounter } from "@/types";
import { toast } from "sonner";
import { GameSelector, GAME_TYPES } from "./teams/GameSelector";
import { TeamBuilder } from "./teams/TeamBuilder";
import { MatchHistory } from "./teams/MatchHistory";
import { MatchScheduler } from "./teams/MatchScheduler";
import { TeamImport } from "./teams/TeamImport";
import { MatchFilters } from "./teams/MatchFilters";
import { createMatchWithValidation } from "./teams/MatchCreator";

interface TeamsTabProps {
  classes: ClassRoom[];
  setClasses: (classes: ClassRoom[]) => void;
  matches: Match[];
  setMatches: (matches: Match[]) => void;
  teacher: Teacher;
  onDeleteMatch: (matchId: string) => void;
}

export const TeamsTab = ({ classes, setClasses, matches, setMatches, teacher, onDeleteMatch }: TeamsTabProps) => {
  const [selectedGame, setSelectedGame] = useState<string>("");
  const [team1Members, setTeam1Members] = useState<TeamMember[]>([]);
  const [team2Members, setTeam2Members] = useState<TeamMember[]>([]);
  const [team1Name, setTeam1Name] = useState<string>("Команда 1");
  const [team2Name, setTeam2Name] = useState<string>("Команда 2");
  const [selectedStudentForTeam1, setSelectedStudentForTeam1] = useState<string>("");
  const [selectedStudentForTeam2, setSelectedStudentForTeam2] = useState<string>("");
  const [filterClassTeam1, setFilterClassTeam1] = useState<string>("all");
  const [filterClassTeam2, setFilterClassTeam2] = useState<string>("all");
  const [scheduledDates, setScheduledDates] = useState<ScheduledDate[]>([]);
  const [newDate, setNewDate] = useState<string>("");
  const [newTime, setNewTime] = useState<string>("");
  
  const [filterMatchCreator, setFilterMatchCreator] = useState<string>("all");
  const [filterMatchGame, setFilterMatchGame] = useState<string>("all");
  const [filterMatchLeague, setFilterMatchLeague] = useState<string>("all");
  const [selectedLeague, setSelectedLeague] = useState<string>("");

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

  const addScheduledDate = () => {
    if (!newDate || !newTime) {
      toast.error("Укажите дату и время");
      return;
    }

    const newSchedule: ScheduledDate = {
      id: Date.now().toString(),
      date: newDate,
      time: newTime
    };

    setScheduledDates([...scheduledDates, newSchedule]);
    setNewDate("");
    setNewTime("");
    toast.success("Дата добавлена");
  };

  const removeScheduledDate = (id: string) => {
    setScheduledDates(scheduledDates.filter(d => d.id !== id));
  };

  const createMatch = () => {
    const newMatch = createMatchWithValidation({
      selectedGame,
      team1Members,
      team2Members,
      team1Name,
      team2Name,
      scheduledDates,
      matches,
      allStudents,
      teacher,
      selectedLeague
    });

    if (newMatch) {
      setMatches([...matches, newMatch]);
      setTeam1Members([]);
      setTeam2Members([]);
      setTeam1Name("Команда 1");
      setTeam2Name("Команда 2");
      setSelectedGame("");
      setScheduledDates([]);
      setSelectedLeague("");
    }
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
    console.log("🚨 [TeamsTab] deleteMatch called", { matchId });
    console.log("🚨 [TeamsTab] Calling onDeleteMatch callback");
    onDeleteMatch(matchId);
  };

  const updateMatchCounters = (matchId: string, counters: DisciplineCounter[]) => {
    setMatches(matches.map(m => 
      m.id === matchId ? { ...m, disciplineCounters: counters } : m
    ));
  };

  const handleImportComplete = (data: {
    team1Members: TeamMember[];
    team2Members: TeamMember[];
    team1Name: string;
    team2Name: string;
    selectedGame: string;
    scheduledDates: ScheduledDate[];
  }) => {
    setTeam1Members(data.team1Members);
    setTeam2Members(data.team2Members);
    setTeam1Name(data.team1Name);
    setTeam2Name(data.team2Name);
    setSelectedGame(data.selectedGame);
    setScheduledDates(data.scheduledDates);
  };

  const uniqueCreators = useMemo(() => {
    const creators = matches.map(m => m.createdBy).filter(Boolean);
    return Array.from(new Set(creators));
  }, [matches]);

  const filteredMatches = useMemo(() => {
    return matches.filter(match => {
      const creatorMatch = filterMatchCreator === "all" || match.createdBy === filterMatchCreator;
      const gameMatch = filterMatchGame === "all" || match.gameType === filterMatchGame;
      const leagueMatch = filterMatchLeague === "all" || match.league === filterMatchLeague;
      return creatorMatch && gameMatch && leagueMatch;
    });
  }, [matches, filterMatchCreator, filterMatchGame, filterMatchLeague]);

  const handleResetFilters = () => {
    setFilterMatchCreator("all");
    setFilterMatchGame("all");
    setFilterMatchLeague("all");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
          <Icon name="Users" size={28} />
          Управление командами
        </h2>
        
        <TeamImport 
          allStudents={allStudents}
          onImportComplete={handleImportComplete}
        />
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
            <>
              <div>
                <label className="block text-sm font-medium mb-2">Выберите лигу</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <button
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selectedLeague === "beginner"
                        ? "border-primary bg-primary/10 shadow-md"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => setSelectedLeague("beginner")}
                  >
                    <span className="text-sm font-medium">Beginner League</span>
                  </button>
                  <button
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selectedLeague === "second"
                        ? "border-primary bg-primary/10 shadow-md"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => setSelectedLeague("second")}
                  >
                    <span className="text-sm font-medium">Second League</span>
                  </button>
                  <button
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selectedLeague === "first"
                        ? "border-primary bg-primary/10 shadow-md"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => setSelectedLeague("first")}
                  >
                    <span className="text-sm font-medium">First League</span>
                  </button>
                  <button
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selectedLeague === "premiere"
                        ? "border-primary bg-primary/10 shadow-md"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => setSelectedLeague("premiere")}
                  >
                    <span className="text-sm font-medium">Premiere League</span>
                  </button>
                </div>
              </div>

              <MatchScheduler 
                scheduledDates={scheduledDates}
                newDate={newDate}
                newTime={newTime}
                onNewDateChange={setNewDate}
                onNewTimeChange={setNewTime}
                onAddScheduledDate={addScheduledDate}
                onRemoveScheduledDate={removeScheduledDate}
              />

              <Button 
                onClick={createMatch} 
                className="w-full" 
                size="lg"
                disabled={scheduledDates.length === 0 || !selectedLeague}
              >
                <Icon name="Plus" size={18} className="mr-2" />
                Создать матч
              </Button>
            </>
          )}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-xl font-semibold text-foreground flex items-center gap-2 mb-4">
          <Icon name="History" size={24} />
          История матчей
        </h3>

        <MatchFilters 
          filterCreator={filterMatchCreator}
          filterGame={filterMatchGame}
          filterLeague={filterMatchLeague}
          creators={uniqueCreators}
          games={GAME_TYPES}
          onFilterCreatorChange={setFilterMatchCreator}
          onFilterGameChange={setFilterMatchGame}
          onFilterLeagueChange={setFilterMatchLeague}
          onReset={handleResetFilters}
        />

        <MatchHistory 
          matches={filteredMatches}
          onSetResult={setMatchResult}
          onDeleteMatch={deleteMatch}
          onUpdateCounters={updateMatchCounters}
          teacher={teacher}
        />
      </Card>
    </div>
  );
};