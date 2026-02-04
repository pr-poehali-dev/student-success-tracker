import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import { ClassRoom, TeamMember } from "@/types";
import { TeamColorPicker } from "./TeamColorPicker";

interface TeamBuilderProps {
  teamNumber: 1 | 2;
  teamName: string;
  teamMembers: TeamMember[];
  selectedStudent: string;
  filterClass: string;
  availableStudents: Array<{ id: string; name: string; className: string; classId: string }>;
  classes: ClassRoom[];
  teamColor: string;
  onTeamNameChange: (name: string) => void;
  onFilterClassChange: (className: string) => void;
  onStudentSelect: (studentId: string) => void;
  onAddStudent: () => void;
  onToggleRole: (studentId: string) => void;
  onRemoveStudent: (studentId: string) => void;
  onTeamColorChange: (color: string) => void;
}

export const TeamBuilder = ({
  teamNumber,
  teamName,
  teamMembers,
  selectedStudent,
  filterClass,
  availableStudents,
  classes,
  teamColor,
  onTeamNameChange,
  onFilterClassChange,
  onStudentSelect,
  onAddStudent,
  onToggleRole,
  onRemoveStudent,
  onTeamColorChange,
}: TeamBuilderProps) => {
  const borderColor = teamNumber === 1 ? "border-blue-200" : "border-red-200";

  return (
    <Card className={`p-4 border-2 ${borderColor}`}>
      <div className="mb-3">
        <Label>Название команды {teamNumber}</Label>
        <Input 
          value={teamName} 
          onChange={(e) => onTeamNameChange(e.target.value)}
          placeholder={`Команда ${teamNumber}`}
        />
      </div>

      <TeamColorPicker 
        selectedColor={teamColor}
        onColorChange={onTeamColorChange}
        teamNumber={teamNumber}
      />

      <div className="mb-3">
        <Label>Фильтр по классу</Label>
        <Select value={filterClass} onValueChange={onFilterClassChange}>
          <SelectTrigger>
            <SelectValue placeholder="Все классы" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все классы</SelectItem>
            {classes.map(cls => (
              <SelectItem key={cls.id} value={cls.name}>
                {cls.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mb-3">
        <Label>Добавить ученика</Label>
        <div className="flex gap-2">
          <Select value={selectedStudent} onValueChange={onStudentSelect}>
            <SelectTrigger>
              <SelectValue placeholder="Выберите ученика" />
            </SelectTrigger>
            <SelectContent>
              {availableStudents.map(student => (
                <SelectItem key={student.id} value={student.id}>
                  {student.name} ({student.className})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={onAddStudent} size="sm">
            <Icon name="Plus" size={16} />
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Состав ({teamMembers.length}/15):</p>
        {teamMembers.map(member => (
          <div key={member.studentId} className="flex items-center justify-between p-2 bg-secondary/30 rounded">
            <div className="flex items-center gap-2">
              <span className="text-sm">{member.studentName}</span>
              <Badge variant="outline" className="text-xs">{member.className}</Badge>
            </div>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant={member.role === "captain" ? "default" : "outline"}
                onClick={() => onToggleRole(member.studentId)}
              >
                {member.role === "captain" ? "Капитан" : "Игрок"}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onRemoveStudent(member.studentId)}
              >
                <Icon name="X" size={16} />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};