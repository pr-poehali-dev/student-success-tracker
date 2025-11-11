import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import { ClassRoom } from "@/types";
import * as XLSX from "xlsx";
import { toast } from "sonner";

interface ExportTabProps {
  classes: ClassRoom[];
}

export const ExportTab = ({ classes }: ExportTabProps) => {
  const exportToExcel = () => {
    if (classes.length === 0) {
      toast.error("Нет данных для экспорта");
      return;
    }

    const workbook = XLSX.utils.book_new();

    const summaryData = classes.flatMap(cls =>
      cls.students.map(student => ({
        "Класс": cls.name,
        "Имя ученика": student.name,
        "Баллы (Люмосити)": student.points,
        "Направления": student.achievements.join(", "),
        "Всего активностей": student.activities?.length || 0
      }))
    );
    const summarySheet = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, "Общая сводка");

    const lumosityData = classes.flatMap(cls =>
      cls.students.flatMap(student =>
        (student.activities || [])
          .filter(a => a.type === "lumosity")
          .map(activity => ({
            "Класс": cls.name,
            "Имя ученика": student.name,
            "Дата": new Date(activity.date).toLocaleString('ru-RU'),
            "Баллы": activity.points || 0
          }))
      )
    );
    if (lumosityData.length > 0) {
      const lumositySheet = XLSX.utils.json_to_sheet(lumosityData);
      XLSX.utils.book_append_sheet(workbook, lumositySheet, "Люмосити");
    }

    const roboData = classes.flatMap(cls =>
      cls.students.flatMap(student =>
        (student.activities || [])
          .filter(a => a.type === "robo")
          .map(activity => ({
            "Класс": cls.name,
            "Имя ученика": student.name,
            "Дата": new Date(activity.date).toLocaleString('ru-RU'),
            "Время (мин)": activity.time || 0
          }))
      )
    );
    if (roboData.length > 0) {
      const roboSheet = XLSX.utils.json_to_sheet(roboData);
      XLSX.utils.book_append_sheet(workbook, roboSheet, "Робо");
    }

    const sportData = classes.flatMap(cls =>
      cls.students.flatMap(student =>
        (student.activities || [])
          .filter(a => a.type === "sport")
          .map(activity => ({
            "Класс": cls.name,
            "Имя ученика": student.name,
            "Дата": new Date(activity.date).toLocaleString('ru-RU'),
            "Результат": activity.result === "win" ? "Победа" : "Проигрыш",
            "Роль": activity.role === "captain" ? "Капитан" : "Игрок"
          }))
      )
    );
    if (sportData.length > 0) {
      const sportSheet = XLSX.utils.json_to_sheet(sportData);
      XLSX.utils.book_append_sheet(workbook, sportSheet, "Спорт");
    }

    const date = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `Успехи_учеников_${date}.xlsx`);
    
    toast.success("Excel файл успешно скачан!");
  };

  const exportClassToExcel = (classRoom: ClassRoom) => {
    if (classRoom.students.length === 0) {
      toast.error("В классе нет учеников");
      return;
    }

    const workbook = XLSX.utils.book_new();

    const summaryData = classRoom.students.map(student => ({
      "Имя ученика": student.name,
      "Баллы (Люмосити)": student.points,
      "Направления": student.achievements.join(", "),
      "Всего активностей": student.activities?.length || 0
    }));
    const summarySheet = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, "Сводка");

    const lumosityData = classRoom.students.flatMap(student =>
      (student.activities || [])
        .filter(a => a.type === "lumosity")
        .map(activity => ({
          "Имя ученика": student.name,
          "Дата": new Date(activity.date).toLocaleString('ru-RU'),
          "Баллы": activity.points || 0
        }))
    );
    if (lumosityData.length > 0) {
      const lumositySheet = XLSX.utils.json_to_sheet(lumosityData);
      XLSX.utils.book_append_sheet(workbook, lumositySheet, "Люмосити");
    }

    const roboData = classRoom.students.flatMap(student =>
      (student.activities || [])
        .filter(a => a.type === "robo")
        .map(activity => ({
          "Имя ученика": student.name,
          "Дата": new Date(activity.date).toLocaleString('ru-RU'),
          "Время (мин)": activity.time || 0
        }))
    );
    if (roboData.length > 0) {
      const roboSheet = XLSX.utils.json_to_sheet(roboData);
      XLSX.utils.book_append_sheet(workbook, roboSheet, "Робо");
    }

    const sportData = classRoom.students.flatMap(student =>
      (student.activities || [])
        .filter(a => a.type === "sport")
        .map(activity => ({
          "Имя ученика": student.name,
          "Дата": new Date(activity.date).toLocaleString('ru-RU'),
          "Результат": activity.result === "win" ? "Победа" : "Проигрыш",
          "Роль": activity.role === "captain" ? "Капитан" : "Игрок"
        }))
    );
    if (sportData.length > 0) {
      const sportSheet = XLSX.utils.json_to_sheet(sportData);
      XLSX.utils.book_append_sheet(workbook, sportSheet, "Спорт");
    }

    const date = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `Класс_${classRoom.name}_${date}.xlsx`);
    
    toast.success(`Excel файл для класса ${classRoom.name} скачан!`);
  };

  const totalStudents = classes.reduce((sum, cls) => sum + cls.students.length, 0);
  const totalPoints = classes.flatMap(c => c.students).reduce((sum, s) => sum + s.points, 0);
  const totalAchievements = classes.flatMap(c => c.students).reduce((sum, s) => sum + s.achievements.length, 0);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
        <Icon name="FileSpreadsheet" size={28} />
        Экспорт данных в Excel
      </h2>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="p-6 text-center bg-gradient-to-br from-primary/10 to-primary/5">
          <Icon name="Users" size={32} className="mx-auto mb-2 text-primary" />
          <p className="text-3xl font-bold text-foreground">{totalStudents}</p>
          <p className="text-muted-foreground">Всего учеников</p>
        </Card>

        <Card className="p-6 text-center bg-gradient-to-br from-accent/20 to-accent/10">
          <Icon name="Star" size={32} className="mx-auto mb-2 text-primary" />
          <p className="text-3xl font-bold text-foreground">{totalPoints}</p>
          <p className="text-muted-foreground">Всего баллов</p>
        </Card>

        <Card className="p-6 text-center bg-gradient-to-br from-secondary/30 to-secondary/20">
          <Icon name="Award" size={32} className="mx-auto mb-2 text-primary" />
          <p className="text-3xl font-bold text-foreground">{totalAchievements}</p>
          <p className="text-muted-foreground">Всего достижений</p>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Icon name="Download" size={20} className="text-primary" />
          Экспорт всех данных
        </h3>
        <p className="text-muted-foreground mb-4">
          Скачайте Excel файл со всеми учениками, их баллами и достижениями
        </p>
        <Button 
          onClick={exportToExcel}
          disabled={classes.length === 0}
          className="w-full md:w-auto"
          size="lg"
        >
          <Icon name="FileDown" size={20} className="mr-2" />
          Скачать все данные
        </Button>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Icon name="FolderDown" size={20} className="text-primary" />
          Экспорт по классам
        </h3>
        
        {classes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Icon name="FolderOpen" size={32} className="mx-auto mb-2" />
            <p>Нет классов для экспорта</p>
          </div>
        ) : (
          <div className="space-y-3">
            {classes.map(cls => (
              <div 
                key={cls.id}
                className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors"
              >
                <div>
                  <p className="font-medium text-lg">{cls.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Учеников: {cls.students.length} • 
                    Баллов: {cls.students.reduce((sum, s) => sum + s.points, 0)}
                  </p>
                </div>
                <Button
                  onClick={() => exportClassToExcel(cls)}
                  disabled={cls.students.length === 0}
                  variant="outline"
                >
                  <Icon name="Download" size={18} className="mr-2" />
                  Скачать
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-6 bg-accent/10 border-accent/30">
        <div className="flex gap-3">
          <Icon name="Info" size={20} className="text-primary mt-0.5" />
          <div>
            <p className="font-medium mb-1">Что включено в Excel файл?</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Список всех учеников с их классами</li>
              <li>• Количество набранных баллов</li>
              <li>• Полученные достижения</li>
              <li>• Статистика по каждому ученику</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};