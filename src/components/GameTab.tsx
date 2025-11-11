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
  { id: "valheim", name: "Вальхейм", icon: "Swords", color: "bg-green-100 text-green-700" },
  { id: "civilization", name: "Цивилизация", icon: "Castle", color: "bg-amber-100 text-amber-700" },
  { id: "simcity", name: "Симсити", icon: "Building2", color: "bg-cyan-100 text-cyan-700" },
  { id: "factorio", name: "Факторио", icon: "Factory", color: "bg-slate-100 text-slate-700" },
  { id: "pe3d", name: "3D Физкультура", icon: "Dumbbell", color: "bg-red-100 text-red-700" },
];

export const GameTab = ({ classes, setClasses }: GameTabProps) => {
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [selectedDirection, setSelectedDirection] = useState<string>("");
  
  const [lumosityPoints, setLumosityPoints] = useState<string>("10");
  const [roboTime, setRoboTime] = useState<string>("30");
  const [sportResult, setSportResult] = useState<"win" | "loss">("win");
  const [sportRole, setSportRole] = useState<"captain" | "player">("player");
  
  const [valheimResult, setValheimResult] = useState<"win" | "loss">("win");
  const [valheimRole, setValheimRole] = useState<"captain" | "player">("player");
  
  const [civYear, setCivYear] = useState<string>("");
  const [civDefenseYear, setCivDefenseYear] = useState<string>("");
  const [civProd1, setCivProd1] = useState<string>("");
  const [civProd2, setCivProd2] = useState<string>("");
  const [civProd3, setCivProd3] = useState<string>("");
  
  const [simcityCitizens, setSimcityCitizens] = useState<string>("");
  const [simcityHappiness, setSimcityHappiness] = useState<string>("");
  const [simcityProduction, setSimcityProduction] = useState<string>("");
  
  const [factorioFlasks, setFactorioFlasks] = useState<string>("");

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
    } else if (selectedDirection === "valheim") {
      activity = {
        type: "valheim",
        date: new Date().toISOString(),
        result: valheimResult,
        role: valheimRole
      };
      pointsToAdd = 0;
    } else if (selectedDirection === "civilization") {
      const year = parseInt(civYear);
      const defenseYear = parseInt(civDefenseYear);
      if (isNaN(year) || isNaN(defenseYear)) {
        toast.error("Введите год объявления и год защиты");
        return;
      }
      activity = {
        type: "civilization",
        date: new Date().toISOString(),
        civilizationYear: year,
        civilizationDefenseYear: defenseYear,
        civilizationProduction1: civProd1,
        civilizationProduction2: civProd2,
        civilizationProduction3: civProd3
      };
      pointsToAdd = 0;
    } else if (selectedDirection === "simcity") {
      const citizens = parseInt(simcityCitizens);
      const happiness = parseInt(simcityHappiness);
      if (isNaN(citizens) || isNaN(happiness)) {
        toast.error("Введите количество граждан и уровень счастья");
        return;
      }
      activity = {
        type: "simcity",
        date: new Date().toISOString(),
        simcityCitizens: citizens,
        simcityHappiness: happiness,
        simcityProduction: simcityProduction
      };
      pointsToAdd = 0;
    } else if (selectedDirection === "factorio") {
      const flasks = parseInt(factorioFlasks);
      if (isNaN(flasks) || flasks <= 0) {
        toast.error("Введите количество колб");
        return;
      }
      activity = {
        type: "factorio",
        date: new Date().toISOString(),
        factorioFlasks: flasks
      };
      pointsToAdd = 0;
    } else if (selectedDirection === "pe3d") {
      activity = {
        type: "pe3d",
        date: new Date().toISOString()
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
    } else if (selectedDirection === "sport") {
      toast.success(`Результат записан`);
    } else {
      toast.success(`Активность записана`);
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
            <div className="space-y-4">
              {selectedStudent && (
                <div className="mb-4 p-3 bg-secondary/30 rounded-lg">
                  <p className="font-medium">{selectedStudent.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Направлений: {selectedStudent.achievements.length}
                  </p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-3">
                {ACHIEVEMENTS.map(achievement => (
                  <button
                    key={achievement.id}
                    className={`relative p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                      selectedDirection === achievement.id 
                        ? 'border-primary bg-primary/10 shadow-lg' 
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => giveAchievement(achievement.id)}
                  >
                    <div className="flex flex-col items-center gap-2 text-center">
                      <div className={`p-3 rounded-full ${achievement.color}`}>
                        <Icon name={achievement.icon as any} size={24} />
                      </div>
                      <span className="text-sm font-medium">{achievement.name}</span>
                      {selectedStudent?.achievements.includes(achievement.id) && (
                        <Badge variant="secondary" className="text-xs">✓</Badge>
                      )}
                    </div>
                  </button>
                ))}
              </div>
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
            {selectedDirection === "valheim" && "Вальхейм - Активность"}
            {selectedDirection === "civilization" && "Цивилизация - Активность"}
            {selectedDirection === "simcity" && "Симсити - Активность"}
            {selectedDirection === "factorio" && "Факторио - Активность"}
            {selectedDirection === "pe3d" && "3D Физкультура - Активность"}
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

          {selectedDirection === "valheim" && (
            <div className="space-y-4">
              <div>
                <Label className="mb-3 block">Результат</Label>
                <RadioGroup value={valheimResult} onValueChange={(value) => setValheimResult(value as "win" | "loss")}>
                  <div className="flex items-center space-x-2 mb-2">
                    <RadioGroupItem value="win" id="valheim-win" />
                    <Label htmlFor="valheim-win" className="cursor-pointer">Победа</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="loss" id="valheim-loss" />
                    <Label htmlFor="valheim-loss" className="cursor-pointer">Поражение</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label className="mb-3 block">Роль</Label>
                <RadioGroup value={valheimRole} onValueChange={(value) => setValheimRole(value as "captain" | "player")}>
                  <div className="flex items-center space-x-2 mb-2">
                    <RadioGroupItem value="captain" id="valheim-captain" />
                    <Label htmlFor="valheim-captain" className="cursor-pointer">Капитан</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="player" id="valheim-player" />
                    <Label htmlFor="valheim-player" className="cursor-pointer">Игрок</Label>
                  </div>
                </RadioGroup>
              </div>

              <Button onClick={addActivity} className="w-full" size="lg">
                <Icon name="Plus" size={18} className="mr-2" />
                Добавить результат
              </Button>
            </div>
          )}

          {selectedDirection === "civilization" && (
            <div className="space-y-4">
              <div>
                <Label>Год объявления</Label>
                <Input
                  type="number"
                  value={civYear}
                  onChange={(e) => setCivYear(e.target.value)}
                  placeholder="Например: 2024"
                />
              </div>
              <div>
                <Label>Год защиты</Label>
                <Input
                  type="number"
                  value={civDefenseYear}
                  onChange={(e) => setCivDefenseYear(e.target.value)}
                  placeholder="Например: 2025"
                />
              </div>
              
              <div className="border-t pt-4">
                <Label className="mb-3 block font-semibold">Производства (необязательно)</Label>
                <div className="space-y-3">
                  <Input
                    value={civProd1}
                    onChange={(e) => setCivProd1(e.target.value)}
                    placeholder="Производство 1"
                  />
                  <Input
                    value={civProd2}
                    onChange={(e) => setCivProd2(e.target.value)}
                    placeholder="Производство 2"
                  />
                  <Input
                    value={civProd3}
                    onChange={(e) => setCivProd3(e.target.value)}
                    placeholder="Производство 3"
                  />
                </div>
              </div>

              <Button onClick={addActivity} className="w-full" size="lg">
                <Icon name="Plus" size={18} className="mr-2" />
                Добавить данные
              </Button>
            </div>
          )}

          {selectedDirection === "simcity" && (
            <div className="space-y-4">
              <div>
                <Label>Количество граждан</Label>
                <Input
                  type="number"
                  value={simcityCitizens}
                  onChange={(e) => setSimcityCitizens(e.target.value)}
                  placeholder="Введите количество"
                  min="0"
                />
              </div>
              <div>
                <Label>Уровень счастья (%)</Label>
                <Input
                  type="number"
                  value={simcityHappiness}
                  onChange={(e) => setSimcityHappiness(e.target.value)}
                  placeholder="От 0 до 100"
                  min="0"
                  max="100"
                />
              </div>
              <div>
                <Label>Производство (необязательно)</Label>
                <Input
                  value={simcityProduction}
                  onChange={(e) => setSimcityProduction(e.target.value)}
                  placeholder="Укажите производство"
                />
              </div>

              <Button onClick={addActivity} className="w-full" size="lg">
                <Icon name="Plus" size={18} className="mr-2" />
                Добавить данные
              </Button>
            </div>
          )}

          {selectedDirection === "factorio" && (
            <div className="space-y-4">
              <div>
                <Label>Количество производимых колб</Label>
                <Input
                  type="number"
                  value={factorioFlasks}
                  onChange={(e) => setFactorioFlasks(e.target.value)}
                  placeholder="Введите количество"
                  min="0"
                />
              </div>

              <Button onClick={addActivity} className="w-full" size="lg">
                <Icon name="Plus" size={18} className="mr-2" />
                Добавить данные
              </Button>
            </div>
          )}

          {selectedDirection === "pe3d" && (
            <div className="space-y-4">
              <div className="p-4 bg-secondary/30 rounded-lg text-center">
                <Icon name="CheckCircle" size={32} className="mx-auto mb-2 text-primary" />
                <p className="text-sm text-muted-foreground">
                  Направление выбрано и сохранено для ученика
                </p>
              </div>
              <Button onClick={addActivity} className="w-full" size="lg">
                <Icon name="Plus" size={18} className="mr-2" />
                Отметить активность
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