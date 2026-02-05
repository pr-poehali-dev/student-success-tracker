import { Card } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import { ClassRoom, Match, AttendanceRecord } from "@/types";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { createExcelWorkbook, createClassExcelWorkbook } from "./export/ExportUtils";
import { StatisticsCards } from "./export/StatisticsCards";
import { AllDataExport } from "./export/AllDataExport";
import { ClassExportList } from "./export/ClassExportList";

interface ExportTabProps {
  classes: ClassRoom[];
  matches: Match[];
  attendance: AttendanceRecord[];
}

export const ExportTab = ({ classes, matches, attendance }: ExportTabProps) => {
  const exportToExcel = () => {
    if (classes.length === 0) {
      toast.error("Нет данных для экспорта");
      return;
    }

    const workbook = createExcelWorkbook(classes, matches, attendance);
    const date = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `Успехи_учеников_${date}.xlsx`);
    
    toast.success("Excel файл успешно скачан!");
  };

  const exportClassToExcel = (classRoom: ClassRoom) => {
    if (classRoom.students.length === 0) {
      toast.error("В классе нет учеников");
      return;
    }

    const workbook = createClassExcelWorkbook(classRoom, matches, attendance);
    const date = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `Класс_${classRoom.name}_${date}.xlsx`);
    
    toast.success(`Excel файл для класса ${classRoom.name} скачан!`);
  };

  const totalStudents = classes.reduce((sum, cls) => sum + cls.students.length, 0);
  const totalPoints = classes.flatMap(c => c.students).reduce((sum, s) => sum + s.points, 0);
  const totalAchievements = classes.flatMap(c => c.students).reduce((sum, s) => sum + (s.achievements || []).length, 0);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
        <Icon name="FileSpreadsheet" size={28} />
        Экспорт данных в Excel
      </h2>

      <StatisticsCards
        totalStudents={totalStudents}
        totalPoints={totalPoints}
        totalAchievements={totalAchievements}
      />

      <AllDataExport
        onExport={exportToExcel}
        disabled={classes.length === 0}
      />

      <ClassExportList
        classes={classes}
        onExportClass={exportClassToExcel}
      />

      <Card className="p-6 bg-accent/10 border-accent/30">
        <div className="flex gap-3">
          <Icon name="Info" size={20} className="text-primary mt-0.5" />
          <div>
            <p className="font-medium mb-1">Что включено в Excel файл?</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Общая сводка по всем активностям учеников</li>
              <li>• Детальная статистика по каждой игре (Люмосити, Робо, Спорт, Вальхейм, Цивилизация, Симсити, Факторио, 3D Физкультура, Lumocity)</li>
              <li>• Оценки Soft Skills (все оценки и средние значения)</li>
              <li>• Отдельные листы для каждого типа активности</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};