import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { Teacher } from "@/types";

interface AppHeaderProps {
  teacher: Teacher;
  isAdmin: boolean;
  onShowProfile: () => void;
  onShowAdmin: () => void;
  onForceSync: () => void;
  onLogout: () => void;
}

export const AppHeader = ({ 
  teacher, 
  isAdmin, 
  onShowProfile, 
  onShowAdmin, 
  onForceSync, 
  onLogout 
}: AppHeaderProps) => {
  return (
    <header className="mb-8 flex items-center justify-between animate-fade-in">
      <div className="flex items-center gap-3">
        <Icon name="GraduationCap" size={40} className="text-primary" />
        <div>
          <h1 className="text-4xl font-bold text-foreground">Успехи учеников</h1>
          <p className="text-muted-foreground text-sm">
            Отслеживайте достижения и мотивируйте учеников
          </p>
        </div>
      </div>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="rounded-full h-12 w-12">
            <Icon name="User" size={24} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="px-2 py-1.5 text-sm font-semibold">{teacher.name}</div>
          <div className="px-2 py-1.5 text-xs text-muted-foreground">{teacher.email || 'Нет email'}</div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onShowProfile}>
            <Icon name="User" size={16} className="mr-2" />
            Профиль
          </DropdownMenuItem>
          {isAdmin && (
            <DropdownMenuItem onClick={onShowAdmin}>
              <Icon name="Shield" size={16} className="mr-2" />
              Админка
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onForceSync}>
            <Icon name="RefreshCw" size={16} className="mr-2" />
            Синхронизировать
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => {
            const link = document.createElement('a');
            link.href = '/import_example.xlsx';
            link.download = 'import_example.xlsx';
            link.click();
          }}>
            <Icon name="Download" size={16} className="mr-2" />
            Скачать пример импорта
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onLogout}>
            <Icon name="LogOut" size={16} className="mr-2" />
            Выйти
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
};