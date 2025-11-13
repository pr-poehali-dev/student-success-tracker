import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import { Teacher, ClassRoom } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ClassesManagementProps {
  teachers: Teacher[];
  classes: ClassRoom[];
  onDeleteClass: (classId: string) => void;
  onUpdateClass: (updatedClass: ClassRoom) => void;
}

export const ClassesManagement = ({ 
  teachers, 
  classes, 
  onDeleteClass,
  onUpdateClass
}: ClassesManagementProps) => {
  const [assigningClass, setAssigningClass] = useState<ClassRoom | null>(null);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("none");

  const handleDeleteClass = (classId: string, className: string) => {
    console.log("🚨 [ClassesManagement] handleDeleteClass called", { classId, className });
    if (confirm(`Вы уверены, что хотите удалить класс "${className}" со всеми учениками?`)) {
      console.log("🚨 [ClassesManagement] User confirmed, calling onDeleteClass");
      onDeleteClass(classId);
      toast.success("Класс удалён");
    }
  };

  const handleAssignTeacher = (classRoom: ClassRoom) => {
    setAssigningClass(classRoom);
    setSelectedTeacherId(classRoom.responsibleTeacherId || "none");
  };

  const handleSaveAssignment = () => {
    if (!assigningClass) return;

    const updatedClass: ClassRoom = {
      ...assigningClass,
      responsibleTeacherId: selectedTeacherId === "none" ? undefined : selectedTeacherId
    };

    onUpdateClass(updatedClass);
    setAssigningClass(null);
    setSelectedTeacherId("none");
    toast.success("Ответственный учитель назначен");
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Icon name="School" size={20} className="text-primary" />
        Управление классами
      </h3>

      {classes.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Icon name="School" size={32} className="mx-auto mb-2" />
          <p>Нет созданных классов</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Класс</TableHead>
                <TableHead>Учеников</TableHead>
                <TableHead>Ответственный</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classes.map((classRoom) => {
                const responsibleTeacher = teachers.find(t => t.id === classRoom.responsibleTeacherId);
                return (
                  <TableRow key={classRoom.id}>
                    <TableCell className="font-medium">{classRoom.name}</TableCell>
                    <TableCell>{classRoom.students.length}</TableCell>
                    <TableCell>
                      {responsibleTeacher ? responsibleTeacher.name : "Не назначен"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleAssignTeacher(classRoom)}
                            >
                              <Icon name="UserCog" size={16} />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Назначить ответственного</DialogTitle>
                              <DialogDescription>
                                Выберите учителя для класса {classRoom.name}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 mt-4">
                              <div>
                                <Label>Учитель</Label>
                                <Select value={selectedTeacherId} onValueChange={setSelectedTeacherId}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Выберите учителя" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="none">Не назначен</SelectItem>
                                    {teachers.filter(t => t.role === "teacher" || t.role === "junior").map((teacher) => (
                                      <SelectItem key={teacher.id} value={teacher.id}>
                                        {teacher.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <Button onClick={handleSaveAssignment} className="w-full">
                                Назначить
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteClass(classRoom.id, classRoom.name)}
                        >
                          <Icon name="Trash2" size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </Card>
  );
};