import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import { ClassRoom } from "@/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface GameTabProps {
  classes: ClassRoom[];
  setClasses: (classes: ClassRoom[]) => void;
}

const ACHIEVEMENTS = [
  { id: "star", name: "Звезда", icon: "Star", color: "bg-yellow-100 text-yellow-700" },
  { id: "trophy", name: "Кубок", icon: "Trophy", color: "bg-orange-100 text-orange-700" },
  { id: "medal", name: "Медаль", icon: "Medal", color: "bg-purple-100 text-purple-700" },
  { id: "award", name: "Награда", icon: "Award", color: "bg-blue-100 text-blue-700" },
  { id: "flame", name: "Огонь", icon: "Flame", color: "bg-red-100 text-red-700" },
];

export const GameTab = ({ classes, setClasses }: GameTabProps) => {
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [pointsToAdd, setPointsToAdd] = useState<string>("10");

  const allStudents = classes.flatMap(cls => 
    cls.students.map(student => ({ ...student, className: cls.name, classId: cls.id }))
  ).sort((a, b) => b.points - a.points);

  const selectedClass = classes.find(c => c.id === selectedClassId);
  const selectedStudent = selectedClass?.students.find(s => s.id === selectedStudentId);

  const addPoints = () => {
    const points = parseInt(pointsToAdd);
    if (isNaN(points) || points <= 0) {
      toast.error("Введите корректное число баллов");
      return;
    }

    if (!selectedClassId || !selectedStudentId) {
      toast.error("Выберите класс и ученика");
      return;
    }

    setClasses(classes.map(cls => 
      cls.id === selectedClassId 
        ? {
            ...cls,
            students: cls.students.map(student =>
              student.id === selectedStudentId
                ? { ...student, points: student.points + points }
                : student
            )
          }
        : cls
    ));

    toast.success(`+${points} баллов для ${selectedStudent?.name}`);
  };

  const giveAchievement = (achievementId: string) => {
    if (!selectedClassId || !selectedStudentId) {
      toast.error("Выберите класс и ученика");
      return;
    }

    setClasses(classes.map(cls => 
      cls.id === selectedClassId 
        ? {
            ...cls,
            students: cls.students.map(student =>
              student.id === selectedStudentId
                ? { 
                    ...student, 
                    achievements: student.achievements.includes(achievementId)
                      ? student.achievements
                      : [...student.achievements, achievementId]
                  }
                : student
            )
          }
        : cls
    ));

    const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
    toast.success(`Выдано достижение "${achievement?.name}" для ${selectedStudent?.name}`);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
        <Icon name="Gamepad2" size={28} />
        Игровая система мотивации
      </h2>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Icon name="Zap" size={20} className="text-primary" />
            Добавить баллы
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Класс</label>
              <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите класс" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map(cls => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedClassId && (
              <div>
                <label className="text-sm font-medium mb-2 block">Ученик</label>
                <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите ученика" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedClass?.students.map(student => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.name} ({student.points} баллов)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <label className="text-sm font-medium mb-2 block">Количество баллов</label>
              <Input
                type="number"
                value={pointsToAdd}
                onChange={(e) => setPointsToAdd(e.target.value)}
                min="1"
              />
            </div>

            <Button 
              onClick={addPoints} 
              className="w-full"
              disabled={!selectedStudentId}
            >
              <Icon name="Plus" size={18} className="mr-2" />
              Добавить баллы
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Icon name="Award" size={20} className="text-primary" />
            Выдать достижение
          </h3>
          
          {!selectedStudentId ? (
            <div className="text-center py-8 text-muted-foreground">
              <Icon name="User" size={32} className="mx-auto mb-2" />
              <p>Сначала выберите ученика</p>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedStudent && (
                <div className="mb-4 p-3 bg-secondary/30 rounded-lg">
                  <p className="font-medium">{selectedStudent.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Достижений: {selectedStudent.achievements.length}
                  </p>
                </div>
              )}
              
              {ACHIEVEMENTS.map(achievement => (
                <Button
                  key={achievement.id}
                  variant="outline"
                  className="w-full justify-start h-auto py-3"
                  onClick={() => giveAchievement(achievement.id)}
                  disabled={selectedStudent?.achievements.includes(achievement.id)}
                >
                  <Icon name={achievement.icon as any} size={20} className="mr-3" />
                  <span>{achievement.name}</span>
                  {selectedStudent?.achievements.includes(achievement.id) && (
                    <Badge variant="secondary" className="ml-auto">Есть</Badge>
                  )}
                </Button>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Icon name="TrendingUp" size={20} className="text-primary" />
          Рейтинг учеников
        </h3>
        
        {allStudents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Icon name="Users" size={32} className="mx-auto mb-2" />
            <p>Пока нет учеников</p>
          </div>
        ) : (
          <div className="space-y-2">
            {allStudents.map((student, index) => (
              <div 
                key={student.id}
                className="flex items-center gap-4 p-4 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 font-bold text-primary">
                  {index + 1}
                </div>
                
                <div className="flex-1">
                  <p className="font-medium">{student.name}</p>
                  <p className="text-sm text-muted-foreground">{student.className}</p>
                </div>

                <div className="flex items-center gap-2">
                  {student.achievements.slice(0, 3).map(achId => {
                    const achievement = ACHIEVEMENTS.find(a => a.id === achId);
                    return achievement ? (
                      <div key={achId} className={`p-1.5 rounded ${achievement.color}`}>
                        <Icon name={achievement.icon as any} size={16} />
                      </div>
                    ) : null;
                  })}
                  {student.achievements.length > 3 && (
                    <Badge variant="secondary">+{student.achievements.length - 3}</Badge>
                  )}
                </div>

                <div className="text-right">
                  <p className="font-bold text-lg text-primary">{student.points}</p>
                  <p className="text-xs text-muted-foreground">баллов</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
