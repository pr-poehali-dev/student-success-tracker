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
}

export const AdminPanel = ({ 
  teachers, 
  classes, 
  matches, 
  onUpdateTeacher, 
  onDeleteTeacher,
  onDeleteClass,
  onDeleteMatch
}: AdminPanelProps) => {
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState<"admin" | "teacher">("teacher");

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

  const adminCount = teachers.filter(t => t.role === "admin").length;
  const teacherCount = teachers.filter(t => t.role === "teacher").length;
  const totalStudents = classes.reduce((sum, cls) => sum + cls.students.length, 0);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
        <Icon name="Shield" size={28} />
        Административная панель
      </h2>

      <div className="grid md:grid-cols-4 gap-4">
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
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Icon name="Users" size={20} className="text-primary" />
          Управление учителями
        </h3>

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
                        {teacher.role === "admin" ? "Администратор" : "Учитель"}
                      </Badge>
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
                                <Select value={editRole} onValueChange={(value) => setEditRole(value as "admin" | "teacher")}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
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
            {classes.map((cls) => (
              <div 
                key={cls.id}
                className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors"
              >
                <div>
                  <p className="font-medium text-lg">{cls.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Учеников: {cls.students.length}
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteClass(cls.id, cls.name)}
                >
                  <Icon name="Trash2" size={16} className="mr-2" />
                  Удалить
                </Button>
              </div>
            ))}
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
