import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Icon from "@/components/ui/icon";
import { Teacher } from "@/types";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { validateTeacher, ROLE_LABELS } from "@/utils/validation";

interface TeacherProfileProps {
  teacher: Teacher;
  onUpdate: (teacher: Teacher) => void;
  onClearData: () => void;
  onLogout: () => void;
}

export const TeacherProfile = ({ teacher, onUpdate, onClearData, onLogout }: TeacherProfileProps) => {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editName, setEditName] = useState(teacher.name);
  const [editEmail, setEditEmail] = useState(teacher.email);

  const handleSave = () => {
    const updatedTeacher = {
      ...teacher,
      name: editName,
      email: editEmail
    };

    const validation = validateTeacher(updatedTeacher);
    if (!validation.valid) {
      validation.errors.forEach(error => toast.error(error));
      return;
    }

    onUpdate(updatedTeacher);
    setIsEditOpen(false);
    toast.success("Профиль обновлён");
  };

  const handleClearData = () => {
    if (confirm("Вы уверены? Все данные будут удалены безвозвратно!")) {
      onClearData();
      toast.success("Все данные очищены");
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-full">
            <Icon name="User" size={32} className="text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-semibold">{teacher.name}</h3>
            <p className="text-sm text-muted-foreground">
              {ROLE_LABELS[teacher.role] || teacher.role}
            </p>
            {teacher.email && (
              <p className="text-xs text-muted-foreground mt-1">{teacher.email}</p>
            )}
          </div>
        </div>

        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Icon name="Edit" size={16} className="mr-2" />
              Редактировать
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Редактирование профиля</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>ФИО</Label>
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Введите ФИО"
                />
              </div>
              <div>
                <Label>Email (необязательно)</Label>
                <Input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="Введите email"
                />
              </div>
              <Button onClick={handleSave} className="w-full">
                Сохранить
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="pt-4 border-t space-y-3">
        <p className="text-sm text-muted-foreground">
          Все ваши данные сохраняются локально в браузере
        </p>
        <div className="flex gap-2">
          <Button 
            onClick={onLogout}
            variant="outline"
            size="sm"
          >
            <Icon name="LogOut" size={16} className="mr-2" />
            Выйти
          </Button>
          <Button 
            onClick={handleClearData}
            variant="destructive"
            size="sm"
          >
            <Icon name="Trash2" size={16} className="mr-2" />
            Очистить все данные
          </Button>
        </div>
      </div>
    </Card>
  );
};