import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import { ClassRoom, Student, Teacher, AttendanceRecord } from "@/types";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { ClassDialogs } from "./classes/ClassDialogs";
import { StudentDialogs } from "./classes/StudentDialogs";
import { ClassCard } from "./classes/ClassCard";

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
      onDeleteClass(classId);
    } else {
      const className = classes.find(c => c.id === classId)?.name;
      setClasses(classes.filter(cls => cls.id !== classId));
      toast.success(`Класс "${className}" удален`);
    }
  };

  const deleteStudent = (classId: string, studentId: string) => {
    console.log("🚨 [ClassesTab] deleteStudent called", { classId, studentId, hasCallback: !!onDeleteStudent });
    if (onDeleteStudent) {
      console.log("🚨 [ClassesTab] Calling onDeleteStudent callback");
      onDeleteStudent(classId, studentId);
    } else {
      setClasses(classes.map(cls => 
        cls.id === classId 
          ? { ...cls, students: cls.students.filter(s => s.id !== studentId) }
          : cls
      ));
      toast.success("Ученик удален");
    }
  };

  const openAttendanceDialog = (studentId: string) => {
    // Если студент уже отмечен как отсутствующий - удаляем все его отметки
    if (isStudentAbsent(studentId)) {
      const studentAttendance = attendance.filter(a => a.studentId === studentId);
      if (studentAttendance.length > 0) {
        setAttendance(attendance.filter(a => a.studentId !== studentId));
        toast.success(`Удалено отметок: ${studentAttendance.length}`);
      }
      return;
    }
    
    // Если студент не отмечен - открываем диалог для выбора даты
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
        toast.success("Данные успешно импортированы из Excel");
      } catch (error) {
        console.error("Import error:", error);
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
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
          <Icon name="GraduationCap" size={28} />
          Управление классами
        </h2>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
          >
            <Icon name="Upload" size={18} className="mr-2" />
            Импорт из Excel
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileImport}
            className="hidden"
          />
          <Button onClick={() => setIsAddClassOpen(true)}>
            <Icon name="Plus" size={18} className="mr-2" />
            Добавить класс
          </Button>
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
            <ClassCard
              key={classRoom.id}
              classRoom={classRoom}
              allTeachers={allTeachers}
              isStudentAbsent={isStudentAbsent}
              onEditGames={openEditGames}
              onDeleteClass={deleteClass}
              onDeleteStudent={deleteStudent}
              onOpenAttendanceDialog={openAttendanceDialog}
              isAddStudentOpen={isAddStudentOpen}
              setIsAddStudentOpen={setIsAddStudentOpen}
              selectedClassId={selectedClassId}
              setSelectedClassId={setSelectedClassId}
              newStudentName={newStudentName}
              setNewStudentName={setNewStudentName}
              onAddStudent={addStudent}
            />
          ))}
        </div>
      )}

      <ClassDialogs
        isAddClassOpen={isAddClassOpen}
        setIsAddClassOpen={setIsAddClassOpen}
        newClassName={newClassName}
        setNewClassName={setNewClassName}
        selectedGames={selectedGames}
        setSelectedGames={setSelectedGames}
        isEditGamesOpen={isEditGamesOpen}
        setIsEditGamesOpen={setIsEditGamesOpen}
        onAddClass={addClass}
        onUpdateClassGames={updateClassGames}
        toggleGame={toggleGame}
      />

      <StudentDialogs
        isAddStudentOpen={isAddStudentOpen}
        setIsAddStudentOpen={setIsAddStudentOpen}
        newStudentName={newStudentName}
        setNewStudentName={setNewStudentName}
        isAttendanceDialogOpen={isAttendanceDialogOpen}
        setIsAttendanceDialogOpen={setIsAttendanceDialogOpen}
        attendanceDate={attendanceDate}
        setAttendanceDate={setAttendanceDate}
        onAddStudent={addStudent}
        onMarkAbsent={markAbsent}
      />
    </div>
  );
};