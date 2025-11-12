import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import { Teacher } from "@/types";
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

interface TeachersManagementProps {
  teachers: Teacher[];
  onUpdateTeacher: (teacher: Teacher) => void;
  onDeleteTeacher: (teacherId: string) => void;
  onCreateTeacher?: (teacher: Teacher) => void;
}

export const TeachersManagement = ({ 
  teachers, 
  onUpdateTeacher, 
  onDeleteTeacher,
  onCreateTeacher
}: TeachersManagementProps) => {
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState<"admin" | "teacher" | "junior">("teacher");
  const [editPassword, setEditPassword] = useState("");
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
    setEditPassword(teacher.password || "");
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
      role: editRole,
      password: editPassword.trim() || editingTeacher.password
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

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewTeacherPassword(password);
    toast.success("Пароль сгенерирован");
  };

  const generateEditPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setEditPassword(password);
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

  const handleGenerateAllPasswords = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let updatedCount = 0;

    teachers.forEach(teacher => {
      if (!teacher.password || teacher.password === '') {
        let password = '';
        for (let i = 0; i < 8; i++) {
          password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        onUpdateTeacher({ ...teacher, password });
        updatedCount++;
      }
    });

    if (updatedCount > 0) {
      toast.success(`Пароли сгенерированы для ${updatedCount} учителей`);
    } else {
      toast.info("Все учителя уже имеют пароли");
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Icon name="Users" size={20} className="text-primary" />
          Управление учителями
        </h3>
        <div className="flex gap-2">
          <Button onClick={handleGenerateAllPasswords} variant="outline">
            <Icon name="Key" size={16} className="mr-2" />
            Сгенерировать пароли
          </Button>
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
                            <div>
                              <Label>Пароль</Label>
                              <div className="flex gap-2 mt-2">
                                <Input
                                  value={editPassword}
                                  onChange={(e) => setEditPassword(e.target.value)}
                                  placeholder="Введите новый пароль"
                                />
                                <Button type="button" onClick={generateEditPassword} variant="outline">
                                  <Icon name="RefreshCw" size={16} />
                                </Button>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                Оставьте пустым, если не хотите менять пароль
                              </p>
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
  );
};