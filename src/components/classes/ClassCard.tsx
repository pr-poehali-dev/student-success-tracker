import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import { ClassRoom, Teacher } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ClassCardProps {
  classRoom: ClassRoom;
  allTeachers: Teacher[];
  isStudentAbsent: (studentId: string) => boolean;
  onEditGames: (classId: string) => void;
  onDeleteClass: (classId: string) => void;
  onDeleteStudent: (classId: string, studentId: string) => void;
  onOpenAttendanceDialog: (studentId: string) => void;
  isAddStudentOpen: boolean;
  setIsAddStudentOpen: (open: boolean) => void;
  selectedClassId: string;
  setSelectedClassId: (id: string) => void;
  newStudentName: string;
  setNewStudentName: (name: string) => void;
  onAddStudent: () => void;
  onUpdateClassName: (classId: string, newName: string) => void;
  onUpdateStudentName: (classId: string, studentId: string, newName: string) => void;
}

export const ClassCard = ({
  classRoom,
  allTeachers,
  isStudentAbsent,
  onEditGames,
  onDeleteClass,
  onDeleteStudent,
  onOpenAttendanceDialog,
  isAddStudentOpen,
  setIsAddStudentOpen,
  selectedClassId,
  setSelectedClassId,
  newStudentName,
  setNewStudentName,
  onAddStudent,
  onUpdateClassName,
  onUpdateStudentName
}: ClassCardProps) => {
  const [deleteStudentDialogOpen, setDeleteStudentDialogOpen] = useState(false);
  const [deleteClassDialogOpen, setDeleteClassDialogOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isEditingClassName, setIsEditingClassName] = useState(false);
  const [editedClassName, setEditedClassName] = useState(classRoom.name);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [editedStudentName, setEditedStudentName] = useState("");

  // Сбрасываем состояние редактирования при изменении класса
  useEffect(() => {
    setEditedClassName(classRoom.name);
  }, [classRoom.name]);

  const handleDeleteClick = (studentId: string, studentName: string) => {
    setStudentToDelete({ id: studentId, name: studentName });
    setDeleteStudentDialogOpen(true);
  };

  const confirmDelete = () => {
    if (studentToDelete) {
      onDeleteStudent(classRoom.id, studentToDelete.id);
      setDeleteStudentDialogOpen(false);
      setStudentToDelete(null);
    }
  };

  const confirmDeleteClass = () => {
    console.log('🗑️ [ClassCard] Deleting class:', { id: classRoom.id, name: classRoom.name });
    onDeleteClass(classRoom.id);
    setDeleteClassDialogOpen(false);
  };

  const handleSaveClassName = () => {
    if (editedClassName.trim() && editedClassName !== classRoom.name) {
      onUpdateClassName(classRoom.id, editedClassName.trim());
    }
    setIsEditingClassName(false);
  };

  const handleStartEditStudent = (studentId: string, currentName: string) => {
    setEditingStudentId(studentId);
    setEditedStudentName(currentName);
  };

  const handleSaveStudentName = (studentId: string) => {
    if (editedStudentName.trim()) {
      onUpdateStudentName(classRoom.id, studentId, editedStudentName.trim());
    }
    setEditingStudentId(null);
    setEditedStudentName("");
  };

  const handleCancelEdit = () => {
    setEditingStudentId(null);
    setEditedStudentName("");
  };

  const handleCancelClassNameEdit = () => {
    setIsEditingClassName(false);
    setEditedClassName(classRoom.name);
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          {isEditingClassName ? (
            <div className="flex items-center gap-2 mb-2">
              <Icon name="Users" size={24} className="text-primary" />
              <Input
                value={editedClassName}
                onChange={(e) => setEditedClassName(e.target.value)}
                className="max-w-xs"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') handleSaveClassName();
                  if (e.key === 'Escape') handleCancelClassNameEdit();
                }}
                autoFocus
              />
              <Button size="sm" onClick={handleSaveClassName}>
                <Icon name="Check" size={16} />
              </Button>
              <Button size="sm" variant="ghost" onClick={handleCancelClassNameEdit}>
                <Icon name="X" size={16} />
              </Button>
            </div>
          ) : (
            <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <Icon name="Users" size={24} className="text-primary" />
              {classRoom.name}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsEditingClassName(true)}
              >
                <Icon name="Pencil" size={14} />
              </Button>
            </h3>
          )}
          <p className="text-muted-foreground">
            Учеников: {classRoom.students.length}
            {classRoom.responsibleTeacherId && (() => {
              const responsibleTeacher = allTeachers.find(t => t.id === classRoom.responsibleTeacherId);
              return (
                <span className="ml-2">• Ответственный: {responsibleTeacher?.name || "Неизвестно"}</span>
              );
            })()}
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onEditGames(classRoom.id)}
          >
            <Icon name="Gamepad2" size={16} className="mr-2" />
            Игры
          </Button>

          <Dialog open={isAddStudentOpen && selectedClassId === classRoom.id} 
                  onOpenChange={(open) => {
                    setIsAddStudentOpen(open);
                    if (open) setSelectedClassId(classRoom.id);
                  }}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Icon name="UserPlus" size={16} className="mr-2" />
                Добавить ученика
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Новый ученик в класс {classRoom.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label>Имя и фамилия</Label>
                  <Input
                    value={newStudentName}
                    onChange={(e) => setNewStudentName(e.target.value)}
                    placeholder="Например: Иван Иванов"
                    onKeyPress={(e) => e.key === 'Enter' && onAddStudent()}
                  />
                </div>
                <Button onClick={onAddStudent} className="w-full">
                  Добавить ученика
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button 
            variant="destructive" 
            size="sm"
            onClick={() => setDeleteClassDialogOpen(true)}
          >
            <Icon name="Trash2" size={16} />
          </Button>
        </div>
      </div>

      {classRoom.games && classRoom.games.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {classRoom.games.map(game => {
            const gameLabels: Record<string, string> = {
              lumosity: "Люмосити",
              valheim: "Valheim",
              civilization: "Civilization",
              factorio: "Factorio",
              sport: "Спорт",
              robo: "Робототехника"
            };
            return (
              <span key={game} className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                {gameLabels[game]}
              </span>
            );
          })}
        </div>
      )}

      {classRoom.students.length === 0 ? (
        <div className="text-center py-8 bg-muted/30 rounded-lg">
          <Icon name="UserX" size={32} className="mx-auto mb-2 text-muted-foreground" />
          <p className="text-muted-foreground">В классе пока нет учеников</p>
        </div>
      ) : (
        <div className="space-y-2">
          {classRoom.students.map((student) => (
            <div 
              key={student.id}
              className="flex justify-between items-center p-3 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Icon name="User" size={20} className="text-primary" />
                </div>
                {editingStudentId === student.id ? (
                  <div className="flex items-center gap-2 flex-1">
                    <Input
                      value={editedStudentName}
                      onChange={(e) => setEditedStudentName(e.target.value)}
                      className="max-w-xs"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') handleSaveStudentName(student.id);
                        if (e.key === 'Escape') handleCancelEdit();
                      }}
                      autoFocus
                    />
                    <Button size="sm" onClick={() => handleSaveStudentName(student.id)}>
                      <Icon name="Check" size={16} />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                      <Icon name="X" size={16} />
                    </Button>
                  </div>
                ) : (
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{student.name}</p>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleStartEditStudent(student.id, student.name)}
                      >
                        <Icon name="Pencil" size={12} />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Icon name="Star" size={14} />
                      <span>{student.points} баллов</span>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant={isStudentAbsent(student.id) ? "destructive" : "outline"}
                  size="sm"
                  onClick={() => onOpenAttendanceDialog(student.id)}
                >
                  Н
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleDeleteClick(student.id, student.name)}
                >
                  <Icon name="X" size={16} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AlertDialog open={deleteStudentDialogOpen} onOpenChange={setDeleteStudentDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить ученика?</AlertDialogTitle>
            <AlertDialogDescription>
              Уверены, что хотите удалить {studentToDelete?.name}? Это действие нельзя будет отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteClassDialogOpen} onOpenChange={setDeleteClassDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить класс?</AlertDialogTitle>
            <AlertDialogDescription>
              Уверены, что хотите удалить класс "{classRoom.name}"? Все ученики этого класса ({classRoom.students.length}) также будут удалены. Это действие нельзя будет отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteClass}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Удалить класс
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};