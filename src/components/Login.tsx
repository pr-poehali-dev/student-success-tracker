import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Icon from "@/components/ui/icon";
import { Teacher } from "@/types";
import { toast } from "sonner";
import { syncFromServer } from "@/utils/sync";
import { isValidRole, VALID_ROLES } from "@/utils/validation";

interface LoginProps {
  onLogin: (teacher: Teacher) => void;
}

export const Login = ({ onLogin }: LoginProps) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginMode, setLoginMode] = useState<"user" | "admin">("user");
  const [allUsers, setAllUsers] = useState<Teacher[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      try {
        const data = await syncFromServer();
        const activeTeachers = data.teachers.filter(t => {
          if (!isValidRole(t.role)) {
            console.warn(`Пропущен учитель с недопустимой ролью: ${t.name} (${t.role}). Разрешены: ${VALID_ROLES.join(', ')}`);
            return false;
          }
          return t.role === "teacher" || t.role === "junior";
        });
        setAllUsers(activeTeachers);
        console.log("Loaded teachers from server:", activeTeachers.length);
      } catch (error) {
        console.error("Failed to load users", error);
        toast.error("Ошибка загрузки пользователей с сервера");
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (loginMode === "admin") {
        if (username !== "Akrovtus" || password !== "EdenHazard_10") {
          toast.error("Неверный логин или пароль");
          setLoading(false);
          return;
        }
        
        const adminTeacher: Teacher = {
          id: "admin-akrovtus",
          name: "Администратор",
          email: "admin@system.local",
          role: "admin",
          username: "Akrovtus",
          createdAt: new Date().toISOString()
        };
        
        onLogin(adminTeacher);
        toast.success("Добро пожаловать, Администратор!");
      } else {
        if (!selectedUserId) {
          toast.error("Выберите пользователя");
          setLoading(false);
          return;
        }

        if (!password.trim()) {
          toast.error("Введите пароль");
          setLoading(false);
          return;
        }

        const user = allUsers.find(t => t.id === selectedUserId);
        if (!user) {
          toast.error("Пользователь не найден");
          setLoading(false);
          return;
        }

        console.log("Login attempt:", { 
          userId: user.id, 
          userName: user.name,
          hasPassword: !!user.password,
          passwordLength: user.password?.length || 0,
          enteredPasswordLength: password.trim().length
        });

        if (!password.trim()) {
          toast.error("Введите пароль");
          setLoading(false);
          return;
        }

        if (!user.password || user.password === '') {
          toast.error("У этого аккаунта не установлен пароль. Обратитесь к администратору для установки пароля");
          setLoading(false);
          return;
        }

        if (user.password !== password.trim()) {
          console.log("Password mismatch:", { stored: user.password, entered: password.trim() });
          toast.error("Неверный пароль");
          setLoading(false);
          return;
        }

        onLogin(user);
        toast.success(`Добро пожаловать, ${user.name}!`);
      }
    } catch (error) {
      console.error("Login error", error);
      toast.error("Ошибка входа");
      setLoading(false);
    }
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

        <div className="flex gap-2 mb-6">
          <Button
            type="button"
            variant={loginMode === "user" ? "default" : "outline"}
            className="flex-1"
            onClick={() => {
              setLoginMode("user");
              setSelectedUserId("");
              setPassword("");
            }}
          >
            <Icon name="User" size={18} className="mr-2" />
            Логин
          </Button>
          <Button
            type="button"
            variant={loginMode === "admin" ? "default" : "outline"}
            className="flex-1"
            onClick={() => {
              setLoginMode("admin");
              setPassword("");
            }}
          >
            <Icon name="ShieldCheck" size={18} className="mr-2" />
            Админ
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {loginMode === "admin" ? (
            <>
              <div>
                <Label htmlFor="username">Логин *</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Введите логин"
                  className="mt-2"
                  autoFocus
                />
              </div>

              <div>
                <Label htmlFor="password">Пароль *</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Введите пароль"
                  className="mt-2"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <Label htmlFor="user">Выберите пользователя *</Label>
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Выберите ваш аккаунт" />
                  </SelectTrigger>
                  <SelectContent>
                    {allUsers.length === 0 ? (
                      <SelectItem value="none" disabled>
                        Нет доступных аккаунтов
                      </SelectItem>
                    ) : (
                      allUsers.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name} ({user.role === "teacher" ? "Учитель" : "МНС"})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {allUsers.length === 0 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Свяжитесь с администратором для создания аккаунта
                  </p>
                )}
              </div>
              
              <div>
                <Label htmlFor="userPassword">Пароль *</Label>
                <Input
                  id="userPassword"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Введите пароль"
                  className="mt-2"
                />
              </div>
            </>
          )}

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            <Icon name="LogIn" size={20} className="mr-2" />
            {loading ? "Загрузка..." : "Войти"}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t text-center text-sm text-muted-foreground">
          <p>Данные синхронизируются с сервером</p>
        </div>
      </Card>
    </div>
  );
};