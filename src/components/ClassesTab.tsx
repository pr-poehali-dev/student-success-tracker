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
  onSaveChanges?: () => void;
}

export const ClassesTab = ({ classes, setClasses, teacher, allTeachers, attendance, setAttendance, onDeleteStudent, onDeleteClass, onSaveChanges }: ClassesTabProps) => {
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
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

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

  const updateClassName = (classId: string, newName: string) => {
    setClasses(classes.map(cls => 
      cls.id === classId ? { ...cls, name: newName } : cls
    ));
    setHasUnsavedChanges(true);
    toast.success("Название класса изменено. Не забудьте сохранить изменения!");
  };

  const updateStudentName = (classId: string, studentId: string, newName: string) => {
    setClasses(classes.map(cls => 
      cls.id === classId 
        ? { 
            ...cls, 
            students: cls.students.map(s => 
              s.id === studentId ? { ...s, name: newName } : s
            ) 
          }
        : cls
    ));
    setHasUnsavedChanges(true);
    toast.success("Имя ученика изменено. Не забудьте сохранить изменения!");
  };

  const handleSaveChanges = () => {
    if (onSaveChanges) {
      onSaveChanges();
      setHasUnsavedChanges(false);
    }
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
    const today = new Date().toISOString().split('T')[0];
    
    // Если студент уже отмечен как отсутствующий СЕГОДНЯ - удаляем только сегодняшнюю отметку
    if (isStudentAbsent(studentId)) {
      setAttendance(attendance.filter(a => !(a.studentId === studentId && a.date === today)));
      toast.success("Отметка \"Н\" на сегодня снята");
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
    const today = new Date().toISOString().split('T')[0];
    return attendance.some(a => a.studentId === studentId && a.date === today);
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawData = XLSX.utils.sheet_to_json<any>(worksheet, { header: 1 });
        
        if (!rawData || rawData.length < 2) {
          toast.error("Файл пустой или не содержит данных");
          return;
        }

        const importedClasses: ClassRoom[] = [...classes];
        let addedStudents = 0;
        let addedClasses = 0;
        
        for (let i = 1; i < rawData.length; i++) {
          const row = rawData[i];
          const className = row[0]?.toString().trim();
          const studentName = row[1]?.toString().trim();
          
          if (!className || !studentName) continue;
          
          let targetClass = importedClasses.find(c => c.name === className);
          
          if (!targetClass) {
            targetClass = {
              id: `class-${Date.now()}-${Math.random()}`,
              name: className,
              students: []
            };
            importedClasses.push(targetClass);
            addedClasses++;
          }
          
          if (!targetClass.students.find(s => s.name === studentName)) {
            targetClass.students.push({
              id: `student-${Date.now()}-${Math.random()}`,
              name: studentName,
              points: 0,
              achievements: []
            });
            addedStudents++;
          }
        }

        setClasses(importedClasses);
        toast.success(`Импортировано: ${addedClasses} классов, ${addedStudents} учеников`);
        setHasUnsavedChanges(true);
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
      {hasUnsavedChanges && onSaveChanges && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
            <Icon name="AlertTriangle" size={20} />
            <span>У вас есть несохраненные изменения</span>
          </div>
          <Button 
            onClick={handleSaveChanges}
            className="bg-green-600 hover:bg-green-700"
          >
            <Icon name="Save" size={16} className="mr-2" />
            Сохранить изменения
          </Button>
        </div>
      )}
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
              onUpdateClassName={updateClassName}
              onUpdateStudentName={updateStudentName}
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