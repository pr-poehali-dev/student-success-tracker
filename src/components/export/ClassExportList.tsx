import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import { ClassRoom } from "@/types";

interface ClassExportListProps {
  classes: ClassRoom[];
  onExportClass: (classRoom: ClassRoom) => void;
}

export const ClassExportList = ({ classes, onExportClass }: ClassExportListProps) => {
  return (
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
                onClick={() => onExportClass(cls)}
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
  );
};
