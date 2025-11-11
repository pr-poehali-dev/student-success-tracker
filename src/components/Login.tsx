import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Icon from "@/components/ui/icon";
import { Teacher } from "@/types";
import { toast } from "sonner";

interface LoginProps {
  onLogin: (teacher: Teacher) => void;
}

export const Login = ({ onLogin }: LoginProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error("Введите ваше ФИО");
      return;
    }

    const teacher: Teacher = {
      id: Date.now().toString(),
      name: name.trim(),
      email: email.trim()
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
