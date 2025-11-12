import { useState } from "react";
import Icon from "@/components/ui/icon";
import { ClassRoom, ActivityRecord } from "@/types";
import { toast } from "sonner";
import { StudentSelector } from "./game/StudentSelector";
import { DirectionSelector, ACHIEVEMENTS } from "./game/DirectionSelector";
import { ActivityForm } from "./game/ActivityForm";
import { StudentRanking } from "./game/StudentRanking";

interface GameTabProps {
  classes: ClassRoom[];
  setClasses: (classes: ClassRoom[]) => void;
}

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

  const handleClassChange = (classId: string) => {
    setSelectedClassId(classId);
    setSelectedStudentId("");
    setSelectedDirection("");
  };

  const handleStudentChange = (studentId: string) => {
    setSelectedStudentId(studentId);
    setSelectedDirection("");
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
                    achievements: (student.achievements || []).includes(achievementId)
                      ? (student.achievements || [])
                      : [...(student.achievements || []), achievementId]
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
        <StudentSelector
          classes={classes}
          selectedClassId={selectedClassId}
          selectedStudentId={selectedStudentId}
          onClassChange={handleClassChange}
          onStudentChange={handleStudentChange}
        />

        <DirectionSelector
          selectedStudent={selectedStudent}
          selectedDirection={selectedDirection}
          onSelectDirection={giveAchievement}
        />
      </div>

      <ActivityForm
        selectedDirection={selectedDirection}
        lumosityPoints={lumosityPoints}
        setLumosityPoints={setLumosityPoints}
        roboTime={roboTime}
        setRoboTime={setRoboTime}
        sportResult={sportResult}
        setSportResult={setSportResult}
        sportRole={sportRole}
        setSportRole={setSportRole}
        valheimResult={valheimResult}
        setValheimResult={setValheimResult}
        valheimRole={valheimRole}
        setValheimRole={setValheimRole}
        civYear={civYear}
        setCivYear={setCivYear}
        civDefenseYear={civDefenseYear}
        setCivDefenseYear={setCivDefenseYear}
        civProd1={civProd1}
        setCivProd1={setCivProd1}
        civProd2={civProd2}
        setCivProd2={setCivProd2}
        civProd3={civProd3}
        setCivProd3={setCivProd3}
        simcityCitizens={simcityCitizens}
        setSimcityCitizens={setSimcityCitizens}
        simcityHappiness={simcityHappiness}
        setSimcityHappiness={setSimcityHappiness}
        simcityProduction={simcityProduction}
        setSimcityProduction={setSimcityProduction}
        factorioFlasks={factorioFlasks}
        setFactorioFlasks={setFactorioFlasks}
        onAddActivity={addActivity}
      />

      <StudentRanking students={allStudents} />
    </div>
  );
};