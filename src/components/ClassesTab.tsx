import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import { ClassRoom, Student } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import * as XLSX from "xlsx";

interface ClassesTabProps {
  classes: ClassRoom[];
  setClasses: (classes: ClassRoom[]) => void;
}

export const ClassesTab = ({ classes, setClasses }: ClassesTabProps) => {
  const [newClassName, setNewClassName] = useState("");
  const [newStudentName, setNewStudentName] = useState("");
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [isAddClassOpen, setIsAddClassOpen] = useState(false);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addClass = () => {
    if (!newClassName.trim()) {
      toast.error("Введите название класса");
      return;
    }
    
    const newClass: ClassRoom = {
      id: Date.now().toString(),
      name: newClassName,
      students: []
    };
    
    setClasses([...classes, newClass]);
    setNewClassName("");
    setIsAddClassOpen(false);
    toast.success(`Класс "${newClassName}" добавлен`);
  };

  const addStudent = () => {
    if (!newStudentName.trim()) {
      toast.error("Введите имя ученика");
      return;
    }
    
    if (!selectedClassId) {
      toast.error("Выберите класс");
      return;
    }

    const newStudent: Student = {
      id: Date.now().toString(),
      name: newStudentName,
      points: 0,
      achievements: []
    };

    setClasses(classes.map(cls => 
      cls.id === selectedClassId 
        ? { ...cls, students: [...cls.students, newStudent] }
        : cls
    ));
    
    setNewStudentName("");
    setIsAddStudentOpen(false);
    toast.success(`Ученик "${newStudentName}" добавлен`);
  };

  const deleteClass = (classId: string) => {
    const className = classes.find(c => c.id === classId)?.name;
    setClasses(classes.filter(cls => cls.id !== classId));
    toast.success(`Класс "${className}" удален`);
  };

  const deleteStudent = (classId: string, studentId: string) => {
    setClasses(classes.map(cls => 
      cls.id === classId 
        ? { ...cls, students: cls.students.filter(s => s.id !== studentId) }
        : cls
    ));
    toast.success("Ученик удален");
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        const classesSheet = workbook.Sheets['Классы'];
        const studentsSheet = workbook.Sheets['Ученики'];
        
        if (!classesSheet && !studentsSheet) {
          toast.error("Файл должен содержать листы 'Классы' и/или 'Ученики'");
          return;
        }

        const importedClasses: ClassRoom[] = [...classes];
        
        if (classesSheet) {
          const classesData = XLSX.utils.sheet_to_json<{ Название: string }>(classesSheet);
          classesData.forEach(row => {
            if (row.Название && !importedClasses.find(c => c.name === row.Название)) {
              importedClasses.push({
                id: Date.now().toString() + Math.random(),
                name: row.Название,
                students: []
              });
            }
          });
        }

        if (studentsSheet) {
          const studentsData = XLSX.utils.sheet_to_json<{ 
            ФИО: string; 
            Класс: string;
            Баллы?: number;
          }>(studentsSheet);
          
          studentsData.forEach(row => {
            if (!row.ФИО || !row.Класс) return;
            
            let targetClass = importedClasses.find(c => c.name === row.Класс);
            if (!targetClass) {
              targetClass = {
                id: Date.now().toString() + Math.random(),
                name: row.Класс,
                students: []
              };
              importedClasses.push(targetClass);
            }

            if (!targetClass.students.find(s => s.name === row.ФИО)) {
              targetClass.students.push({
                id: Date.now().toString() + Math.random(),
                name: row.ФИО,
                points: row.Баллы || 0,
                achievements: []
              });
            }
          });
        }

        setClasses(importedClasses);
        toast.success("Данные успешно импортированы!");
      } catch (error) {
        console.error(error);
        toast.error("Ошибка при импорте файла");
      }
    };
    reader.readAsArrayBuffer(file);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
          <Icon name="School" size={28} />
          Управление классами
        </h2>
        
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileImport}
            style={{ display: 'none' }}
          />
          <Button 
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
          >
            <Icon name="Upload" size={20} className="mr-2" />
            Импорт из Excel
          </Button>
          
          <Dialog open={isAddClassOpen} onOpenChange={setIsAddClassOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Icon name="Plus" size={20} className="mr-2" />
                Добавить класс
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Новый класс</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label>Название класса</Label>
                  <Input
                    value={newClassName}
                    onChange={(e) => setNewClassName(e.target.value)}
                    placeholder="Например: 5-А"
                    onKeyPress={(e) => e.key === 'Enter' && addClass()}
                  />
                </div>
                <Button onClick={addClass} className="w-full">
                  Создать класс
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {classes.length === 0 ? (
        <Card className="p-12 text-center border-dashed border-2">
          <Icon name="FolderOpen" size={48} className="mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground text-lg">
            Пока нет классов. Добавьте первый класс!
          </p>
        </Card>
      ) : (
        <div className="grid gap-6">
          {classes.map((classRoom) => (
            <Card key={classRoom.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
                    <Icon name="Users" size={24} className="text-primary" />
                    {classRoom.name}
                  </h3>
                  <p className="text-muted-foreground">
                    Учеников: {classRoom.students.length}
                  </p>
                </div>
                <div className="flex gap-2">
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
                            onKeyPress={(e) => e.key === 'Enter' && addStudent()}
                          />
                        </div>
                        <Button onClick={addStudent} className="w-full">
                          Добавить ученика
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => deleteClass(classRoom.id)}
                  >
                    <Icon name="Trash2" size={16} />
                  </Button>
                </div>
              </div>

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
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <Icon name="User" size={20} className="text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Icon name="Star" size={14} />
                            <span>{student.points} баллов</span>
                          </div>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => deleteStudent(classRoom.id, student.id)}
                      >
                        <Icon name="X" size={16} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};