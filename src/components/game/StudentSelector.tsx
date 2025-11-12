import { Card } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import { ClassRoom, Student } from "@/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface StudentSelectorProps {
  classes: ClassRoom[];
  selectedClassId: string;
  selectedStudentId: string;
  onClassChange: (classId: string) => void;
  onStudentChange: (studentId: string) => void;
}

export const StudentSelector = ({
  classes,
  selectedClassId,
  selectedStudentId,
  onClassChange,
  onStudentChange
}: StudentSelectorProps) => {
  const selectedClass = classes.find(c => c.id === selectedClassId);

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Icon name="Users" size={20} className="text-primary" />
        Выбор ученика
      </h3>
      
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Класс</label>
          <Select value={selectedClassId} onValueChange={onClassChange}>
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
            <Select value={selectedStudentId} onValueChange={onStudentChange}>
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
  );
};
