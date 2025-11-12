import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Teacher, ClassRoom, Match } from "@/types";
import { AdminStatsCards } from "./admin/AdminStatsCards";
import { TeachersManagement } from "./admin/TeachersManagement";
import { ClassesManagement } from "./admin/ClassesManagement";
import { MatchesManagement } from "./admin/MatchesManagement";
import { exportToExcel } from "@/utils/excelExport";
import { toast } from "sonner";

interface AdminPanelProps {
  teachers: Teacher[];
  classes: ClassRoom[];
  matches: Match[];
  onUpdateTeacher: (teacher: Teacher) => void;
  onDeleteTeacher: (teacherId: string) => void;
  onDeleteClass: (classId: string) => void;
  onDeleteMatch: (matchId: string) => void;
  onUpdateClass: (updatedClass: ClassRoom) => void;
  onCreateTeacher?: (teacher: Teacher) => void;
}

export const AdminPanel = ({ 
  teachers, 
  classes, 
  matches, 
  onUpdateTeacher, 
  onDeleteTeacher,
  onDeleteClass,
  onDeleteMatch,
  onUpdateClass,
  onCreateTeacher
}: AdminPanelProps) => {
  const handleExport = () => {
    try {
      exportToExcel(teachers, classes, matches);
      toast.success("Данные экспортированы в Excel");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Ошибка экспорта данных");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
          <Icon name="Shield" size={28} />
          Административная панель
        </h2>
        <Button onClick={handleExport} variant="outline">
          <Icon name="Download" size={16} className="mr-2" />
          Экспорт в Excel
        </Button>
      </div>

      <AdminStatsCards teachers={teachers} classes={classes} matches={matches} />

      <TeachersManagement 
        teachers={teachers}
        onUpdateTeacher={onUpdateTeacher}
        onDeleteTeacher={onDeleteTeacher}
        onCreateTeacher={onCreateTeacher}
      />

      <ClassesManagement 
        teachers={teachers}
        classes={classes}
        onDeleteClass={onDeleteClass}
        onUpdateClass={onUpdateClass}
      />

      <MatchesManagement 
        matches={matches}
        onDeleteMatch={onDeleteMatch}
      />
    </div>
  );
};