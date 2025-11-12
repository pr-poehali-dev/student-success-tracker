import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Icon from "@/components/ui/icon";
import { Teacher } from "@/types";
import { toast } from "sonner";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface LoginProps {
  onLogin: (teacher: Teacher) => void;
}

export const Login = ({ onLogin }: LoginProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "teacher">("teacher");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error("Введите ваше ФИО");
      return;
    }

    const teacher: Teacher = {
      id: Date.now().toString(),
      name: name.trim(),
      email: email.trim(),
      role: role,
      createdAt: new Date().toISOString()
    };

    onLogin(teacher);
    toast.success(`Добро пожаловать, ${name}!`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-accent/30 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 shadow-xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Icon name="GraduationCap" size={40} className="text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Успехи учеников</h1>
          </div>
          <p className="text-muted-foreground">
            Войдите в систему для управления классами
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="name">ФИО преподавателя *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Например: Иванова Мария Петровна"
              className="mt-2"
              autoFocus
            />
          </div>

          <div>
            <Label htmlFor="email">Email (необязательно)</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              className="mt-2"
            />
          </div>

          <div>
            <Label className="mb-3 block">Роль</Label>
            <RadioGroup value={role} onValueChange={(value) => setRole(value as "admin" | "teacher")}>
              <div className="flex items-center space-x-2 mb-2">
                <RadioGroupItem value="teacher" id="teacher-role" />
                <Label htmlFor="teacher-role" className="cursor-pointer font-normal">
                  <div className="flex items-center gap-2">
                    <Icon name="User" size={18} />
                    <div>
                      <p className="font-medium">Учитель</p>
                      <p className="text-xs text-muted-foreground">Может создавать классы и матчи</p>
                    </div>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="admin" id="admin-role" />
                <Label htmlFor="admin-role" className="cursor-pointer font-normal">
                  <div className="flex items-center gap-2">
                    <Icon name="ShieldCheck" size={18} />
                    <div>
                      <p className="font-medium">Администратор</p>
                      <p className="text-xs text-muted-foreground">Полный доступ ко всем данным</p>
                    </div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <Button type="submit" className="w-full" size="lg">
            <Icon name="LogIn" size={20} className="mr-2" />
            Войти
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t text-center text-sm text-muted-foreground">
          <p>Данные сохраняются локально в вашем браузере</p>
        </div>
      </Card>
    </div>
  );
};