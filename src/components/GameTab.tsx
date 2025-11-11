import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import { ClassRoom, ActivityRecord } from "@/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface GameTabProps {
  classes: ClassRoom[];
  setClasses: (classes: ClassRoom[]) => void;
}

const ACHIEVEMENTS = [
  { id: "lumosity", name: "Люмосити", icon: "Brain", color: "bg-purple-100 text-purple-700" },
  { id: "robo", name: "Робо", icon: "Bot", color: "bg-blue-100 text-blue-700" },
  { id: "sport", name: "Спорт", icon: "Trophy", color: "bg-orange-100 text-orange-700" },
];

export const GameTab = ({ classes, setClasses }: GameTabProps) => {
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [selectedDirection, setSelectedDirection] = useState<string>("");
  
  const [lumosityPoints, setLumosityPoints] = useState<string>("10");
  const [roboTime, setRoboTime] = useState<string>("30");
  const [sportResult, setSportResult] = useState<"win" | "loss">("win");
  const [sportRole, setSportRole] = useState<"captain" | "player">("player");

  const allStudents = classes.flatMap(cls => 
    cls.students.map(student => ({ ...student, className: cls.name, classId: cls.id }))
  ).sort((a, b) => b.points - a.points);

  const selectedClass = classes.find(c => c.id === selectedClassId);
  const selectedStudent = selectedClass?.students.find(s => s.id === selectedStudentId);

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
    setSelectedDirection(achievementId);
    toast.success(`Выбрано направление "${achievement?.name}" для ${selectedStudent?.name}`);
  };

  const addActivity = () => {
    if (!selectedClassId || !selectedStudentId || !selectedDirection) {
      toast.error("Выберите класс, ученика и направление");
      return;
    }

    let activity: ActivityRecord;
    let pointsToAdd = 0;

    if (selectedDirection === "lumosity") {
      const points = parseInt(lumosityPoints);
      if (isNaN(points) || points <= 0) {
        toast.error("Введите корректное количество баллов");
        return;
      }
      activity = {
        type: "lumosity",
        date: new Date().toISOString(),
        points
      };
      pointsToAdd = points;
    } else if (selectedDirection === "robo") {
      const time = parseInt(roboTime);
      if (isNaN(time) || time <= 0) {
        toast.error("Введите корректное время");
        return;
      }
      activity = {
        type: "robo",
        date: new Date().toISOString(),
        time
      };
      pointsToAdd = 0;
    } else if (selectedDirection === "sport") {
      activity = {
        type: "sport",
        date: new Date().toISOString(),
        result: sportResult,
        role: sportRole
      };
      pointsToAdd = 0;
    } else {
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
                    points: student.points + pointsToAdd,
                    activities: [...(student.activities || []), activity]
                  }
                : student
            )
          }
        : cls
    ));

    if (selectedDirection === "lumosity") {
      toast.success(`Добавлено! +${pointsToAdd} баллов`);
    } else if (selectedDirection === "robo") {
      toast.success(`Время ${roboTime} мин записано`);
    } else {
      toast.success(`Результат записан`);
    }
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
            <Icon name="Users" size={20} className="text-primary" />
            Выбор ученика
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Класс</label>
              <Select value={selectedClassId} onValueChange={(value) => {
                setSelectedClassId(value);
                setSelectedStudentId("");
                setSelectedDirection("");
              }}>
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
                <Select value={selectedStudentId} onValueChange={(value) => {
                  setSelectedStudentId(value);
                  setSelectedDirection("");
                }}>
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
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Icon name="Award" size={20} className="text-primary" />
            Выбор направления
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
                    Направлений: {selectedStudent.achievements.length}
                  </p>
                </div>
              )}
              
              {ACHIEVEMENTS.map(achievement => (
                <Button
                  key={achievement.id}
                  variant={selectedDirection === achievement.id ? "default" : "outline"}
                  className="w-full justify-start h-auto py-3"
                  onClick={() => giveAchievement(achievement.id)}
                >
                  <Icon name={achievement.icon as any} size={20} className="mr-3" />
                  <span>{achievement.name}</span>
                  {selectedStudent?.achievements.includes(achievement.id) && (
                    <Badge variant="secondary" className="ml-auto">Выбрано</Badge>
                  )}
                </Button>
              ))}
            </div>
          )}
        </Card>
      </div>

      {selectedDirection && (
        <Card className="p-6 border-2 border-primary/30">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Icon name="Pencil" size={20} className="text-primary" />
            {selectedDirection === "lumosity" && "Люмосити - Баллы"}
            {selectedDirection === "robo" && "Робо - Время"}
            {selectedDirection === "sport" && "Спорт - Результат"}
          </h3>

          {selectedDirection === "lumosity" && (
            <div className="space-y-4">
              <div>
                <Label>Количество баллов</Label>
                <Input
                  type="number"
                  value={lumosityPoints}
                  onChange={(e) => setLumosityPoints(e.target.value)}
                  min="1"
                  placeholder="Введите баллы"
                />
              </div>
              <Button onClick={addActivity} className="w-full" size="lg">
                <Icon name="Plus" size={18} className="mr-2" />
                Добавить баллы
              </Button>
            </div>
          )}

          {selectedDirection === "robo" && (
            <div className="space-y-4">
              <div>
                <Label>Время (в минутах)</Label>
                <Input
                  type="number"
                  value={roboTime}
                  onChange={(e) => setRoboTime(e.target.value)}
                  min="1"
                  placeholder="Введите время"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Время будет сохранено в Excel файл
              </p>
              <Button onClick={addActivity} className="w-full" size="lg">
                <Icon name="Plus" size={18} className="mr-2" />
                Добавить время
              </Button>
            </div>
          )}

          {selectedDirection === "sport" && (
            <div className="space-y-4">
              <div>
                <Label className="mb-3 block">Результат</Label>
                <RadioGroup value={sportResult} onValueChange={(value) => setSportResult(value as "win" | "loss")}>
                  <div className="flex items-center space-x-2 mb-2">
                    <RadioGroupItem value="win" id="win" />
                    <Label htmlFor="win" className="cursor-pointer">Победа</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="loss" id="loss" />
                    <Label htmlFor="loss" className="cursor-pointer">Проигрыш</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label className="mb-3 block">Роль</Label>
                <RadioGroup value={sportRole} onValueChange={(value) => setSportRole(value as "captain" | "player")}>
                  <div className="flex items-center space-x-2 mb-2">
                    <RadioGroupItem value="captain" id="captain" />
                    <Label htmlFor="captain" className="cursor-pointer">Капитан</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="player" id="player" />
                    <Label htmlFor="player" className="cursor-pointer">Игрок</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="p-3 bg-secondary/30 rounded-lg text-sm">
                <p className="text-muted-foreground">
                  Результаты будут сохранены в Excel файл
                </p>
              </div>

              <Button onClick={addActivity} className="w-full" size="lg">
                <Icon name="Plus" size={18} className="mr-2" />
                Добавить результат
              </Button>
            </div>
          )}
        </Card>
      )}

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