import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import { ClassRoom, Student, Teacher, AttendanceRecord } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import * as XLSX from "xlsx";

interface ClassesTabProps {
  classes: ClassRoom[];
  setClasses: (classes: ClassRoom[]) => void;
  teacher: Teacher;
  allTeachers: Teacher[];
  attendance: AttendanceRecord[];
  setAttendance: (attendance: AttendanceRecord[]) => void;
  onDeleteStudent?: (classId: string, studentId: string) => void;
  onDeleteClass?: (classId: string) => void;
}

export const ClassesTab = ({ classes, setClasses, teacher, allTeachers, attendance, setAttendance, onDeleteStudent, onDeleteClass }: ClassesTabProps) => {
  const [newClassName, setNewClassName] = useState("");
  const [newStudentName, setNewStudentName] = useState("");
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [isAddClassOpen, setIsAddClassOpen] = useState(false);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isEditGamesOpen, setIsEditGamesOpen] = useState(false);
  const [editingClassId, setEditingClassId] = useState<string>("");
  const [selectedGames, setSelectedGames] = useState<("valheim" | "civilization" | "factorio" | "sport" | "robo" | "lumosity")[]>([]);
  const [isAttendanceDialogOpen, setIsAttendanceDialogOpen] = useState(false);
  const [selectedStudentForAttendance, setSelectedStudentForAttendance] = useState<string>("");
  const [attendanceDate, setAttendanceDate] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const gameOptions: { value: "valheim" | "civilization" | "factorio" | "sport" | "robo" | "lumosity"; label: string; icon: string }[] = [
    { value: "lumosity", label: "Люмосити", icon: "Brain" },
    { value: "valheim", label: "Valheim", icon: "Swords" },
    { value: "civilization", label: "Civilization", icon: "Globe" },
    { value: "factorio", label: "Factorio", icon: "Factory" },
    { value: "sport", label: "Спорт", icon: "Trophy" },
    { value: "robo", label: "Робототехника", icon: "Bot" }
  ];

  const toggleGame = (game: "valheim" | "civilization" | "factorio" | "sport" | "robo" | "lumosity") => {
    setSelectedGames(prev => 
      prev.includes(game) 
        ? prev.filter(g => g !== game)
        : [...prev, game]
    );
  };

  const addClass = () => {
    if (!newClassName.trim()) {
      toast.error("Введите название класса");
      return;
    }
    
    const newClass: ClassRoom = {
      id: Date.now().toString(),
      name: newClassName,
      students: [],
      games: selectedGames.length > 0 ? selectedGames : undefined
    };
    
    setClasses([...classes, newClass]);
    setNewClassName("");
    setSelectedGames([]);
    setIsAddClassOpen(false);
    toast.success(`Класс "${newClassName}" добавлен`);
  };

  const updateClassGames = () => {
    if (!editingClassId) return;
    
    setClasses(classes.map(cls => 
      cls.id === editingClassId 
        ? { ...cls, games: selectedGames.length > 0 ? selectedGames : undefined }
        : cls
    ));
    
    setSelectedGames([]);
    setEditingClassId("");
    setIsEditGamesOpen(false);
    toast.success("Игры класса обновлены");
  };

  const openEditGames = (classId: string) => {
    const classRoom = classes.find(c => c.id === classId);
    if (classRoom) {
      setSelectedGames(classRoom.games || []);
      setEditingClassId(classId);
      setIsEditGamesOpen(true);
    }
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
    console.log("🚨 [ClassesTab] deleteClass called", { classId, hasCallback: !!onDeleteClass });
    if (onDeleteClass) {
      console.log("🚨 [ClassesTab] Calling onDeleteClass callback");
      // Используем переданную функцию из useAppData (синхронизация напрямую)
      onDeleteClass(classId);
    } else {
      // Fallback на старую логику
      const className = classes.find(c => c.id === classId)?.name;
      setClasses(classes.filter(cls => cls.id !== classId));
      toast.success(`Класс "${className}" удален`);
    }
  };

  const deleteStudent = (classId: string, studentId: string) => {
    console.log("🚨 [ClassesTab] deleteStudent called", { classId, studentId, hasCallback: !!onDeleteStudent });
    if (onDeleteStudent) {
      console.log("🚨 [ClassesTab] Calling onDeleteStudent callback");
      // Используем переданную функцию из useAppData (синхронизация напрямую)
      onDeleteStudent(classId, studentId);
    } else {
      // Fallback на старую логику
      setClasses(classes.map(cls => 
        cls.id === classId 
          ? { ...cls, students: cls.students.filter(s => s.id !== studentId) }
          : cls
      ));
      toast.success("Ученик удален");
    }
  };

  const openAttendanceDialog = (studentId: string) => {
    setSelectedStudentForAttendance(studentId);
    setAttendanceDate("");
    setIsAttendanceDialogOpen(true);
  };

  const markAbsent = (date?: string) => {
    if (!selectedStudentForAttendance) return;

    const finalDate = date || new Date().toISOString().split('T')[0];
    const existingRecord = attendance.find(
      a => a.studentId === selectedStudentForAttendance && a.date === finalDate
    );

    if (existingRecord) {
      setAttendance(attendance.filter(a => a.id !== existingRecord.id));
      toast.success("Отметка \"Н\" снята");
    } else {
      const newAttendance: AttendanceRecord = {
        id: `attendance-${Date.now()}`,
        studentId: selectedStudentForAttendance,
        date: finalDate,
        createdAt: new Date().toISOString()
      };
      setAttendance([...attendance, newAttendance]);
      toast.success("Отметка \"Н\" добавлена");
    }

    setIsAttendanceDialogOpen(false);
    setSelectedStudentForAttendance("");
  };

  const isStudentAbsent = (studentId: string): boolean => {
    return attendance.some(a => a.studentId === studentId);
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
                <div>
                  <Label>Игры класса (опционально)</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {gameOptions.map(game => (
                      <Button
                        key={game.value}
                        type="button"
                        variant={selectedGames.includes(game.value) ? "default" : "outline"}
                        onClick={() => toggleGame(game.value)}
                        className="justify-start"
                      >
                        <Icon name={game.icon} size={18} className="mr-2" />
                        {game.label}
                      </Button>
                    ))}
                  </div>
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
                    onClick={() => openEditGames(classRoom.id)}
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
                      <div className="flex items-center gap-2">
                        <Button 
                          variant={isStudentAbsent(student.id) ? "destructive" : "outline"}
                          size="sm"
                          onClick={() => openAttendanceDialog(student.id)}
                        >
                          Н
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => deleteStudent(classRoom.id, student.id)}
                        >
                          <Icon name="X" size={16} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isEditGamesOpen} onOpenChange={setIsEditGamesOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать игры класса</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Выберите игры</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {gameOptions.map(game => (
                  <Button
                    key={game.value}
                    type="button"
                    variant={selectedGames.includes(game.value) ? "default" : "outline"}
                    onClick={() => toggleGame(game.value)}
                    className="justify-start"
                  >
                    <Icon name={game.icon} size={18} className="mr-2" />
                    {game.label}
                  </Button>
                ))}
              </div>
            </div>
            <Button onClick={updateClassGames} className="w-full">
              Сохранить изменения
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isAttendanceDialogOpen} onOpenChange={setIsAttendanceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Отметить отсутствие</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Дата отсутствия</Label>
              <Input
                type="date"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button 
                onClick={() => markAbsent()} 
                variant="outline"
                className="w-full"
              >
                <Icon name="Calendar" size={16} className="mr-2" />
                Сегодня
              </Button>
              <Button 
                onClick={() => markAbsent(attendanceDate)}
                disabled={!attendanceDate}
                className="w-full"
              >
                Отметить выбранную дату
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};