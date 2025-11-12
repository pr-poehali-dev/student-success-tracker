import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import { Teacher, ClassRoom, Match } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState<"admin" | "teacher" | "junior">("teacher");
  const [assigningClass, setAssigningClass] = useState<ClassRoom | null>(null);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("");
  const [isCreatingTeacher, setIsCreatingTeacher] = useState(false);
  const [newTeacherName, setNewTeacherName] = useState("");
  const [newTeacherEmail, setNewTeacherEmail] = useState("");
  const [newTeacherRole, setNewTeacherRole] = useState<"admin" | "teacher" | "junior">("junior");
  const [newTeacherPassword, setNewTeacherPassword] = useState("");

  const handleEditTeacher = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setEditName(teacher.name);
    setEditEmail(teacher.email);
    setEditRole(teacher.role);
  };

  const handleSaveTeacher = () => {
    if (!editingTeacher || !editName.trim()) {
      toast.error("Введите имя учителя");
      return;
    }

    const updatedTeacher: Teacher = {
      ...editingTeacher,
      name: editName.trim(),
      email: editEmail.trim(),
      role: editRole
    };

    onUpdateTeacher(updatedTeacher);
    setEditingTeacher(null);
    toast.success("Учитель обновлён");
  };

  const handleDeleteTeacher = (teacherId: string, teacherName: string) => {
    if (confirm(`Вы уверены, что хотите удалить учителя "${teacherName}"?`)) {
      onDeleteTeacher(teacherId);
      toast.success("Учитель удалён");
    }
  };

  const handleDeleteClass = (classId: string, className: string) => {
    if (confirm(`Вы уверены, что хотите удалить класс "${className}" со всеми учениками?`)) {
      onDeleteClass(classId);
      toast.success("Класс удалён");
    }
  };

  const handleDeleteMatch = (matchId: string) => {
    if (confirm("Вы уверены, что хотите удалить этот матч?")) {
      onDeleteMatch(matchId);
      toast.success("Матч удалён");
    }
  };

  const handleAssignTeacher = (classRoom: ClassRoom) => {
    setAssigningClass(classRoom);
    setSelectedTeacherId(classRoom.responsibleTeacherId || "");
  };

  const handleSaveAssignment = () => {
    if (!assigningClass) return;

    const updatedClass: ClassRoom = {
      ...assigningClass,
      responsibleTeacherId: selectedTeacherId || undefined
    };

    onUpdateClass(updatedClass);
    setAssigningClass(null);
    setSelectedTeacherId("");
    toast.success("Ответственный учитель назначен");
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewTeacherPassword(password);
    toast.success("Пароль сгенерирован");
  };

  const handleCreateTeacher = () => {
    if (!newTeacherName.trim()) {
      toast.error("Введите имя учителя");
      return;
    }

    if (!newTeacherPassword.trim()) {
      toast.error("Сгенерируйте пароль");
      return;
    }

    const newTeacher: Teacher = {
      id: `teacher-${Date.now()}`,
      name: newTeacherName.trim(),
      email: newTeacherEmail.trim(),
      role: newTeacherRole,
      password: newTeacherPassword.trim(),
      createdAt: new Date().toISOString()
    };

    if (onCreateTeacher) {
      onCreateTeacher(newTeacher);
    } else {
      onUpdateTeacher(newTeacher);
    }
    
    setIsCreatingTeacher(false);
    setNewTeacherName("");
    setNewTeacherEmail("");
    setNewTeacherRole("junior");
    setNewTeacherPassword("");
    toast.success("Учитель создан");
  };

  const adminCount = teachers.filter(t => t.role === "admin").length;
  const teacherCount = teachers.filter(t => t.role === "teacher").length;
  const juniorCount = teachers.filter(t => t.role === "junior").length;
  const totalStudents = classes.reduce((sum, cls) => sum + cls.students.length, 0);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
        <Icon name="Shield" size={28} />
        Административная панель
      </h2>

      <div className="grid md:grid-cols-5 gap-4">
        <Card className="p-6 text-center bg-gradient-to-br from-purple-100 to-purple-50">
          <Icon name="ShieldCheck" size={32} className="mx-auto mb-2 text-purple-700" />
          <p className="text-3xl font-bold text-foreground">{adminCount}</p>
          <p className="text-muted-foreground">Админов</p>
        </Card>

        <Card className="p-6 text-center bg-gradient-to-br from-blue-100 to-blue-50">
          <Icon name="Users" size={32} className="mx-auto mb-2 text-blue-700" />
          <p className="text-3xl font-bold text-foreground">{teacherCount}</p>
          <p className="text-muted-foreground">Учителей</p>
        </Card>

        <Card className="p-6 text-center bg-gradient-to-br from-cyan-100 to-cyan-50">
          <Icon name="UserCheck" size={32} className="mx-auto mb-2 text-cyan-700" />
          <p className="text-3xl font-bold text-foreground">{juniorCount}</p>
          <p className="text-muted-foreground">МНС</p>
        </Card>

        <Card className="p-6 text-center bg-gradient-to-br from-green-100 to-green-50">
          <Icon name="GraduationCap" size={32} className="mx-auto mb-2 text-green-700" />
          <p className="text-3xl font-bold text-foreground">{totalStudents}</p>
          <p className="text-muted-foreground">Учеников</p>
        </Card>

        <Card className="p-6 text-center bg-gradient-to-br from-orange-100 to-orange-50">
          <Icon name="Trophy" size={32} className="mx-auto mb-2 text-orange-700" />
          <p className="text-3xl font-bold text-foreground">{matches.length}</p>
          <p className="text-muted-foreground">Матчей</p>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Icon name="Users" size={20} className="text-primary" />
            Управление учителями
          </h3>
          <Dialog open={isCreatingTeacher} onOpenChange={setIsCreatingTeacher}>
            <DialogTrigger asChild>
              <Button onClick={() => setIsCreatingTeacher(true)}>
                <Icon name="UserPlus" size={16} className="mr-2" />
                Создать учителя
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Создать нового учителя</DialogTitle>
                <DialogDescription>
                  Введите данные нового учителя
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label>ФИО *</Label>
                  <Input
                    value={newTeacherName}
                    onChange={(e) => setNewTeacherName(e.target.value)}
                    placeholder="Введите ФИО"
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={newTeacherEmail}
                    onChange={(e) => setNewTeacherEmail(e.target.value)}
                    placeholder="Введите email"
                  />
                </div>
                <div>
                  <Label>Роль</Label>
                  <Select value={newTeacherRole} onValueChange={(value) => setNewTeacherRole(value as "admin" | "teacher" | "junior")}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="junior">Младший научный сотрудник</SelectItem>
                      <SelectItem value="teacher">Учитель</SelectItem>
                      <SelectItem value="admin">Администратор</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Пароль *</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={newTeacherPassword}
                      onChange={(e) => setNewTeacherPassword(e.target.value)}
                      placeholder="Пароль"
                      readOnly
                    />
                    <Button type="button" onClick={generatePassword} variant="outline">
                      <Icon name="RefreshCw" size={16} />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Нажмите на кнопку для генерации пароля
                  </p>
                </div>
                <Button onClick={handleCreateTeacher} className="w-full">
                  Создать
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {teachers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Icon name="Users" size={32} className="mx-auto mb-2" />
            <p>Нет зарегистрированных учителей</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ФИО</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Роль</TableHead>
                  <TableHead>Пароль</TableHead>
                  <TableHead>Дата регистрации</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teachers.map((teacher) => (
                  <TableRow key={teacher.id}>
                    <TableCell className="font-medium">{teacher.name}</TableCell>
                    <TableCell>{teacher.email || "-"}</TableCell>
                    <TableCell>
                      <Badge variant={teacher.role === "admin" ? "default" : "secondary"}>
                        {teacher.role === "admin" ? "Администратор" : teacher.role === "teacher" ? "Учитель" : "МНС"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-1 rounded">{teacher.password || "-"}</code>
                    </TableCell>
                    <TableCell>
                      {new Date(teacher.createdAt).toLocaleDateString('ru-RU')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditTeacher(teacher)}
                            >
                              <Icon name="Pencil" size={16} />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Редактировать учителя</DialogTitle>
                              <DialogDescription>
                                Изменение данных учителя
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 mt-4">
                              <div>
                                <Label>ФИО</Label>
                                <Input
                                  value={editName}
                                  onChange={(e) => setEditName(e.target.value)}
                                  placeholder="Введите ФИО"
                                />
                              </div>
                              <div>
                                <Label>Email</Label>
                                <Input
                                  type="email"
                                  value={editEmail}
                                  onChange={(e) => setEditEmail(e.target.value)}
                                  placeholder="Введите email"
                                />
                              </div>
                              <div>
                                <Label>Роль</Label>
                                <Select value={editRole} onValueChange={(value) => setEditRole(value as "admin" | "teacher" | "junior")}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="junior">Младший научный сотрудник</SelectItem>
                                    <SelectItem value="teacher">Учитель</SelectItem>
                                    <SelectItem value="admin">Администратор</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <Button onClick={handleSaveTeacher} className="w-full">
                                Сохранить
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteTeacher(teacher.id, teacher.name)}
                        >
                          <Icon name="Trash2" size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

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
          <div className="space-y-3">
            {classes.map((cls) => {
              const responsibleTeacher = teachers.find(t => t.id === cls.responsibleTeacherId);
              return (
                <div 
                  key={cls.id}
                  className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium text-lg">{cls.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Учеников: {cls.students.length}
                    </p>
                    {responsibleTeacher && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Ответственный: {responsibleTeacher.name}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAssignTeacher(cls)}
                        >
                          <Icon name="UserCog" size={16} className="mr-2" />
                          Назначить
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Назначить ответственного</DialogTitle>
                          <DialogDescription>
                            Выберите учителя для класса {assigningClass?.name}
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
                                <SelectItem value="">Не назначен</SelectItem>
                                {teachers.filter(t => t.role === "teacher").map((teacher) => (
                                  <SelectItem key={teacher.id} value={teacher.id}>
                                    {teacher.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <Button onClick={handleSaveAssignment} className="w-full">
                            Сохранить
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteClass(cls.id, cls.name)}
                    >
                      <Icon name="Trash2" size={16} className="mr-2" />
                      Удалить
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Icon name="Trophy" size={20} className="text-primary" />
          Управление матчами
        </h3>

        {matches.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Icon name="Trophy" size={32} className="mx-auto mb-2" />
            <p>Нет созданных матчей</p>
          </div>
        ) : (
          <div className="space-y-3">
            {matches.map((match) => (
              <div 
                key={match.id}
                className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors"
              >
                <div>
                  <p className="font-medium text-lg">
                    {match.team1.name} vs {match.team2.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {match.gameType} • Создал: {match.createdBy} • {new Date(match.date).toLocaleDateString('ru-RU')}
                  </p>
                  <div className="flex gap-2 mt-1">
                    <Badge variant={match.completed ? "default" : "secondary"}>
                      {match.completed ? "Завершён" : "В процессе"}
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteMatch(match.id)}
                >
                  <Icon name="Trash2" size={16} className="mr-2" />
                  Удалить
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};