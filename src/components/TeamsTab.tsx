import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import { ClassRoom, Match, Team, TeamMember } from "@/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

interface TeamsTabProps {
  classes: ClassRoom[];
  setClasses: (classes: ClassRoom[]) => void;
}

const GAME_TYPES = [
  { id: "valheim", name: "Вальхейм", icon: "Swords", color: "bg-green-100 text-green-700" },
  { id: "civilization", name: "Цивилизация", icon: "Castle", color: "bg-amber-100 text-amber-700" },
  { id: "factorio", name: "Факторио", icon: "Factory", color: "bg-slate-100 text-slate-700" },
  { id: "sport", name: "Спорт", icon: "Trophy", color: "bg-orange-100 text-orange-700" },
  { id: "robo", name: "Робо", icon: "Bot", color: "bg-blue-100 text-blue-700" },
];

export const TeamsTab = ({ classes, setClasses }: TeamsTabProps) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedGame, setSelectedGame] = useState<string>("");
  const [team1Members, setTeam1Members] = useState<TeamMember[]>([]);
  const [team2Members, setTeam2Members] = useState<TeamMember[]>([]);
  const [team1Name, setTeam1Name] = useState<string>("Команда 1");
  const [team2Name, setTeam2Name] = useState<string>("Команда 2");
  const [selectedStudentForTeam1, setSelectedStudentForTeam1] = useState<string>("");
  const [selectedStudentForTeam2, setSelectedStudentForTeam2] = useState<string>("");

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

  const toggleRole = (teamNumber: 1 | 2, studentId: string) => {
    if (teamNumber === 1) {
      setTeam1Members(team1Members.map(member =>
        member.studentId === studentId
          ? { ...member, role: member.role === "player" ? "captain" : "player" }
          : member
      ));
    } else {
      setTeam2Members(team2Members.map(member =>
        member.studentId === studentId
          ? { ...member, role: member.role === "captain" ? "player" : "captain" }
          : member
      ));
    }
  };

  const removeFromTeam = (teamNumber: 1 | 2, studentId: string) => {
    if (teamNumber === 1) {
      setTeam1Members(team1Members.filter(m => m.studentId !== studentId));
    } else {
      setTeam2Members(team2Members.filter(m => m.studentId !== studentId));
    }
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

        const newActivity = {
          type: match.gameType,
          date: match.date,
          result: isWinner ? "win" : "loss",
          role: teamMember?.role || "player"
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

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
        <Icon name="Users" size={28} />
        Управление командами
      </h2>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Icon name="Gamepad2" size={20} className="text-primary" />
          Создание нового матча
        </h3>

        <div className="space-y-4">
          <div>
            <Label>Выберите игру</Label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-2">
              {GAME_TYPES.map(game => (
                <button
                  key={game.id}
                  className={`p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                    selectedGame === game.id 
                      ? 'border-primary bg-primary/10 shadow-lg' 
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedGame(game.id)}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className={`p-3 rounded-full ${game.color}`}>
                      <Icon name={game.icon as any} size={24} />
                    </div>
                    <span className="text-sm font-medium">{game.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {selectedGame && (
            <div className="grid md:grid-cols-2 gap-6 mt-6">
              <Card className="p-4 border-2 border-blue-200">
                <div className="mb-3">
                  <Label>Название команды 1</Label>
                  <Input 
                    value={team1Name} 
                    onChange={(e) => setTeam1Name(e.target.value)}
                    placeholder="Команда 1"
                  />
                </div>

                <div className="mb-3">
                  <Label>Добавить ученика</Label>
                  <div className="flex gap-2">
                    <Select value={selectedStudentForTeam1} onValueChange={setSelectedStudentForTeam1}>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите ученика" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableStudents.map(student => (
                          <SelectItem key={student.id} value={student.id}>
                            {student.name} ({student.className})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button onClick={addToTeam1} size="sm">
                      <Icon name="Plus" size={16} />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Состав ({team1Members.length}/15):</p>
                  {team1Members.map(member => (
                    <div key={member.studentId} className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{member.studentName}</span>
                        <Badge variant="outline" className="text-xs">{member.className}</Badge>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant={member.role === "captain" ? "default" : "outline"}
                          onClick={() => toggleRole(1, member.studentId)}
                        >
                          {member.role === "captain" ? "Капитан" : "Игрок"}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeFromTeam(1, member.studentId)}
                        >
                          <Icon name="X" size={16} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-4 border-2 border-red-200">
                <div className="mb-3">
                  <Label>Название команды 2</Label>
                  <Input 
                    value={team2Name} 
                    onChange={(e) => setTeam2Name(e.target.value)}
                    placeholder="Команда 2"
                  />
                </div>

                <div className="mb-3">
                  <Label>Добавить ученика</Label>
                  <div className="flex gap-2">
                    <Select value={selectedStudentForTeam2} onValueChange={setSelectedStudentForTeam2}>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите ученика" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableStudents.map(student => (
                          <SelectItem key={student.id} value={student.id}>
                            {student.name} ({student.className})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button onClick={addToTeam2} size="sm">
                      <Icon name="Plus" size={16} />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Состав ({team2Members.length}/15):</p>
                  {team2Members.map(member => (
                    <div key={member.studentId} className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{member.studentName}</span>
                        <Badge variant="outline" className="text-xs">{member.className}</Badge>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant={member.role === "captain" ? "default" : "outline"}
                          onClick={() => toggleRole(2, member.studentId)}
                        >
                          {member.role === "captain" ? "Капитан" : "Игрок"}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeFromTeam(2, member.studentId)}
                        >
                          <Icon name="X" size={16} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
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

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Icon name="History" size={20} className="text-primary" />
          История матчей
        </h3>

        {matches.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Icon name="CalendarOff" size={32} className="mx-auto mb-2" />
            <p>Пока нет матчей</p>
          </div>
        ) : (
          <div className="space-y-4">
            {matches.map(match => {
              const game = GAME_TYPES.find(g => g.id === match.gameType);
              return (
                <Card key={match.id} className="p-4 border-2">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded ${game?.color}`}>
                        <Icon name={game?.icon as any} size={20} />
                      </div>
                      <div>
                        <p className="font-semibold">{game?.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(match.date).toLocaleString('ru-RU')}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteMatch(match.id)}
                    >
                      <Icon name="Trash2" size={16} />
                    </Button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-3">
                    <div className={`p-3 rounded border-2 ${match.result === "team1" ? "border-green-500 bg-green-50" : "border-border"}`}>
                      <p className="font-medium mb-2">{match.team1.name}</p>
                      <div className="space-y-1">
                        {match.team1.members.map(member => (
                          <div key={member.studentId} className="text-sm flex items-center gap-2">
                            <span>{member.studentName}</span>
                            {member.role === "captain" && (
                              <Badge variant="secondary" className="text-xs">Капитан</Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className={`p-3 rounded border-2 ${match.result === "team2" ? "border-green-500 bg-green-50" : "border-border"}`}>
                      <p className="font-medium mb-2">{match.team2.name}</p>
                      <div className="space-y-1">
                        {match.team2.members.map(member => (
                          <div key={member.studentId} className="text-sm flex items-center gap-2">
                            <span>{member.studentName}</span>
                            {member.role === "captain" && (
                              <Badge variant="secondary" className="text-xs">Капитан</Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {!match.completed && (
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setMatchResult(match.id, "team1")}
                        className="flex-1"
                        variant="outline"
                      >
                        Победа {match.team1.name}
                      </Button>
                      <Button
                        onClick={() => setMatchResult(match.id, "team2")}
                        className="flex-1"
                        variant="outline"
                      >
                        Победа {match.team2.name}
                      </Button>
                    </div>
                  )}

                  {match.completed && (
                    <div className="text-center p-2 bg-green-100 rounded">
                      <p className="text-sm font-medium text-green-700">
                        ✓ Результаты сохранены
                      </p>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};
