import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Icon from "@/components/ui/icon";
import { ClassRoom, Student, SoftSkillRating, Match, Teacher } from "@/types";
import { toast } from "sonner";

interface SoftSkillsTabProps {
  classes: ClassRoom[];
  matches: Match[];
  setClasses: (classes: ClassRoom[]) => void;
  teacher: Teacher;
}

export const SoftSkillsTab = ({ classes, matches, setClasses, teacher }: SoftSkillsTabProps) => {
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [selectedMatchId, setSelectedMatchId] = useState<string>("");
  const [selectedGameType, setSelectedGameType] = useState<"valheim" | "civilization" | "factorio" | "sport" | "robo" | "lumosity" | "">("");
  const [ratings, setRatings] = useState<Omit<SoftSkillRating, 'date' | 'ratedBy'>>({
    leadership: 0,
    selfControl: 0,
    communication: 0,
    selfReflection: 0,
    criticalThinking: 0,
  });

  const selectedClass = classes.find(c => c.id === selectedClassId);
  const selectedStudent = selectedClass?.students.find(s => s.id === selectedStudentId);

  const allStudents = classes.flatMap(cls => 
    cls.students.map(student => ({
      ...student,
      className: cls.name,
      classId: cls.id
    }))
  );

  const StarRating = ({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onChange(star);
            }}
            className="focus:outline-none transition-all hover:scale-110 cursor-pointer"
          >
            <Icon
              name="Star"
              size={32}
              style={{
                fill: star <= value ? '#facc15' : 'transparent',
                color: star <= value ? '#facc15' : '#d1d5db',
                stroke: star <= value ? '#facc15' : '#d1d5db',
                strokeWidth: '1px'
              }}
            />
          </button>
        ))}
      </div>
    </div>
  );

  const handleSubmit = () => {
    if (!selectedStudentId || !selectedClassId) {
      toast.error("Выберите учащегося");
      return;
    }

    if (Object.values(ratings).some(r => r === 0)) {
      toast.error("Оцените все критерии");
      return;
    }

    const newRating: SoftSkillRating = {
      ...ratings,
      matchId: selectedMatchId || undefined,
      gameType: selectedGameType || undefined,
      date: new Date().toISOString(),
      ratedBy: teacher.name,
    };

    const updatedStudent: Student = {
      ...selectedStudent!,
      softSkills: [...(selectedStudent!.softSkills || []), newRating],
    };

    const updatedClasses = classes.map(cls => 
      cls.id === selectedClassId
        ? {
            ...cls,
            students: cls.students.map(s => 
              s.id === selectedStudentId ? updatedStudent : s
            )
          }
        : cls
    );
    setClasses(updatedClasses);

    setRatings({
      leadership: 0,
      selfControl: 0,
      communication: 0,
      selfReflection: 0,
      criticalThinking: 0,
    });
    setSelectedMatchId("");
    setSelectedGameType("");
    setSelectedStudentId("");
    setSelectedClassId("");

    toast.success("Оценка сохранена");
  };

  const getAverageRatings = (student: Student) => {
    if (!student.softSkills || student.softSkills.length === 0) return null;

    const sum = student.softSkills.reduce((acc, rating) => ({
      leadership: acc.leadership + rating.leadership,
      selfControl: acc.selfControl + rating.selfControl,
      communication: acc.communication + rating.communication,
      selfReflection: acc.selfReflection + rating.selfReflection,
      criticalThinking: acc.criticalThinking + rating.criticalThinking,
    }), {
      leadership: 0,
      selfControl: 0,
      communication: 0,
      selfReflection: 0,
      criticalThinking: 0,
    });

    const count = student.softSkills.length;
    return {
      leadership: (sum.leadership / count).toFixed(1),
      selfControl: (sum.selfControl / count).toFixed(1),
      communication: (sum.communication / count).toFixed(1),
      selfReflection: (sum.selfReflection / count).toFixed(1),
      criticalThinking: (sum.criticalThinking / count).toFixed(1),
    };
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Оценка Soft Skills</CardTitle>
          <CardDescription>Оценивайте развитие мягких навыков учащихся</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Класс</Label>
              <Select value={selectedClassId} onValueChange={(value) => {
                setSelectedClassId(value);
                setSelectedStudentId("");
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите класс" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Учащийся</Label>
              <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите учащегося" />
                </SelectTrigger>
                <SelectContent>
                  {selectedClass?.students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Игра (необязательно)</Label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: "lumosity", label: "Люмосити", icon: "Brain" },
                  { value: "valheim", label: "Valheim", icon: "Swords" },
                  { value: "civilization", label: "Civilization", icon: "Globe" },
                  { value: "factorio", label: "Factorio", icon: "Factory" },
                  { value: "sport", label: "Спорт", icon: "Trophy" },
                  { value: "robo", label: "Робо", icon: "Bot" }
                ].map(game => (
                  <Button
                    key={game.value}
                    type="button"
                    variant={selectedGameType === game.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedGameType(selectedGameType === game.value ? "" : game.value as any)}
                    className="justify-start"
                  >
                    <Icon name={game.icon} size={16} className="mr-2" />
                    {game.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Матч (необязательно)</Label>
              <Select value={selectedMatchId || "none"} onValueChange={(value) => setSelectedMatchId(value === "none" ? "" : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Общая оценка (без привязки к матчу)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Общая оценка</SelectItem>
                  {matches
                    .filter(match => 
                      !selectedStudentId || 
                      match.team1.members.some(m => m.studentId === selectedStudentId) ||
                      match.team2.members.some(m => m.studentId === selectedStudentId)
                    )
                    .map((match) => (
                      <SelectItem key={match.id} value={match.id}>
                        {match.team1.name} vs {match.team2.name} ({new Date(match.date).toLocaleDateString()})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <StarRating
              label="Лидерство"
              value={ratings.leadership}
              onChange={(v) => setRatings({ ...ratings, leadership: v })}
            />
            <StarRating
              label="Самоконтроль"
              value={ratings.selfControl}
              onChange={(v) => setRatings({ ...ratings, selfControl: v })}
            />
            <StarRating
              label="Коммуникация"
              value={ratings.communication}
              onChange={(v) => setRatings({ ...ratings, communication: v })}
            />
            <StarRating
              label="Саморефлексия"
              value={ratings.selfReflection}
              onChange={(v) => setRatings({ ...ratings, selfReflection: v })}
            />
            <StarRating
              label="Критическое мышление"
              value={ratings.criticalThinking}
              onChange={(v) => setRatings({ ...ratings, criticalThinking: v })}
            />
          </div>

          <Button onClick={handleSubmit} className="w-full">
            <Icon name="Save" className="mr-2" size={18} />
            Сохранить оценку
          </Button>
        </CardContent>
      </Card>

      {selectedStudent && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Участие в матчах: {selectedStudent.name}</CardTitle>
              <CardDescription>
                Матчи и игры учащегося
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(() => {
                const studentMatches = matches.filter(match => 
                  match.team1.members.some(m => m.studentId === selectedStudent.id) ||
                  match.team2.members.some(m => m.studentId === selectedStudent.id)
                );

                const classRoom = classes.find(c => c.id === selectedClassId);
                const classGames = classRoom?.games || [];

                if (studentMatches.length === 0 && classGames.length === 0) {
                  return <p className="text-muted-foreground text-center py-8">Нет матчей или игр</p>;
                }

                return (
                  <div className="space-y-4">
                    {classGames.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Icon name="Gamepad2" size={18} />
                          Игры класса
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {classGames.map(game => {
                            const gameLabels: Record<string, string> = {
                              lumosity: "Люмосити",
                              valheim: "Valheim",
                              civilization: "Civilization",
                              factorio: "Factorio",
                              sport: "Спорт",
                              robo: "Робототехника"
                            };
                            return (
                              <span key={game} className="bg-secondary px-3 py-1 rounded-full text-sm">
                                {gameLabels[game]}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {studentMatches.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Icon name="Trophy" size={18} />
                          Матчи ({studentMatches.length})
                        </h4>
                        <div className="space-y-2">
                          {studentMatches.map(match => {
                            const isInTeam1 = match.team1.members.some(m => m.studentId === selectedStudent.id);
                            const studentTeam = isInTeam1 ? match.team1 : match.team2;
                            const member = studentTeam.members.find(m => m.studentId === selectedStudent.id);
                            const gameLabels: Record<string, string> = {
                              valheim: "Valheim",
                              civilization: "Civilization",
                              factorio: "Factorio",
                              sport: "Спорт",
                              robo: "Робототехника"
                            };

                            return (
                              <div key={match.id} className="border p-3 rounded-lg">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="font-medium">
                                      {match.team1.name} vs {match.team2.name}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      {gameLabels[match.gameType]} • {new Date(match.date).toLocaleDateString()}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                                      {member?.role === "captain" ? "Капитан" : "Игрок"}
                                    </span>
                                    {match.completed && match.result && (
                                      <p className="text-xs mt-1">
                                        {(match.result === "team1" && isInTeam1) || (match.result === "team2" && !isInTeam1) 
                                          ? "✅ Победа" 
                                          : "❌ Поражение"}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>История оценок: {selectedStudent.name}</CardTitle>
              <CardDescription>
                {selectedStudent.softSkills?.length || 0} оценок
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedStudent.softSkills && selectedStudent.softSkills.length > 0 ? (
                <div className="space-y-4">
                  <div className="p-4 bg-secondary/20 rounded-lg">
                    <h4 className="font-semibold mb-3">Средние значения</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                      {Object.entries(getAverageRatings(selectedStudent)!).map(([key, value]) => (
                        <div key={key} className="flex items-center gap-2">
                          <Icon name="Star" size={16} className="fill-yellow-400 text-yellow-400" />
                          <span className="capitalize">
                            {key === 'leadership' && 'Лидерство'}
                            {key === 'selfControl' && 'Самоконтроль'}
                            {key === 'communication' && 'Коммуникация'}
                            {key === 'selfReflection' && 'Саморефлексия'}
                            {key === 'criticalThinking' && 'Критическое мышление'}
                          </span>
                          <span className="font-bold">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    {selectedStudent.softSkills.map((rating, index) => (
                      <div key={index} className="p-3 border rounded-lg space-y-2">
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>{new Date(rating.date).toLocaleString()}</span>
                          <span>Оценил: {rating.ratedBy}</span>
                        </div>
                        {rating.matchId && (
                          <div className="text-sm text-muted-foreground">
                            Матч: {matches.find(m => m.id === rating.matchId)?.team1.name || 'N/A'}
                          </div>
                        )}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                          <div>Лидерство: {rating.leadership}★</div>
                          <div>Самоконтроль: {rating.selfControl}★</div>
                          <div>Коммуникация: {rating.communication}★</div>
                          <div>Саморефлексия: {rating.selfReflection}★</div>
                          <div>Критическое мышление: {rating.criticalThinking}★</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Пока нет оценок для этого учащегося
                </p>
              )}
            </CardContent>
          </Card>
        </>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Общий рейтинг учащихся</CardTitle>
          <CardDescription>Средние показатели soft skills всех учащихся</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {allStudents
              .filter(s => s.softSkills && s.softSkills.length > 0)
              .map((student) => {
                const avg = getAverageRatings(student);
                const totalAvg = avg ? (
                  (parseFloat(avg.leadership) + 
                   parseFloat(avg.selfControl) + 
                   parseFloat(avg.communication) + 
                   parseFloat(avg.selfReflection) + 
                   parseFloat(avg.criticalThinking)) / 5
                ).toFixed(1) : '0';

                return (
                  <div key={student.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{student.name}</div>
                      <div className="text-sm text-muted-foreground">{student.className}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon name="Star" size={20} className="fill-yellow-400 text-yellow-400" />
                      <span className="text-xl font-bold">{totalAvg}</span>
                      <span className="text-sm text-muted-foreground">
                        ({student.softSkills?.length} оценок)
                      </span>
                    </div>
                  </div>
                );
              })}
            {allStudents.filter(s => s.softSkills && s.softSkills.length > 0).length === 0 && (
              <p className="text-muted-foreground text-center py-8">
                Пока нет оценок
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};