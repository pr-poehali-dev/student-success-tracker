import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { ClassesTab } from "@/components/ClassesTab";
import { GameTab } from "@/components/GameTab";
import { ExportTab } from "@/components/ExportTab";
import { TeamsTab } from "@/components/TeamsTab";
import { TeacherProfile } from "@/components/TeacherProfile";
import { Login } from "@/components/Login";
import { AdminPanel } from "@/components/AdminPanel";
import { ClassRoom, Teacher, Match, AppState, GlobalData } from "@/types";
import { saveAppState, loadAppState, clearAppState, saveGlobalData, loadGlobalData } from "@/utils/storage";
import { syncFromServer, syncToServer, deleteTeacherFromServer } from "@/utils/sync";
import { toast } from "sonner";

const Index = () => {
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [globalData, setGlobalData] = useState<GlobalData>({ teachers: [], classes: [], matches: [] });
  const [activeTab, setActiveTab] = useState("classes");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);

  useEffect(() => {
    const loadData = () => {
      setIsSyncing(true);
      
      const loadedGlobalData = loadGlobalData();
      setGlobalData(loadedGlobalData);
      
      const savedState = loadAppState();
      if (savedState?.teacher?.id) {
        setTeacher(savedState.teacher);
        setClasses(savedState.classes);
        setMatches(savedState.matches);
        setIsLoggedIn(true);
      }
      
      setIsSyncing(false);
    };
    
    loadData();
  }, []);

  useEffect(() => {
    if (!teacher || !isLoggedIn || isSyncing) return;

    const state: AppState = { teacher, classes, matches };
    saveAppState(state);

    const existingTeacherIndex = globalData.teachers.findIndex(t => t.id === teacher.id);
    const updatedTeachers = existingTeacherIndex >= 0
      ? globalData.teachers.map(t => t.id === teacher.id ? teacher : t)
      : [...globalData.teachers, teacher];

    let updatedGlobalClasses = globalData.classes;
    let updatedGlobalMatches = globalData.matches;

    if (teacher.role === "junior") {
      const myClassIds = classes.map(c => c.id);
      const otherClasses = globalData.classes.filter(c => !myClassIds.includes(c.id));
      updatedGlobalClasses = [...otherClasses, ...classes];

      const myMatchIds = matches.map(m => m.id);
      const otherMatches = globalData.matches.filter(m => !myMatchIds.includes(m.id));
      updatedGlobalMatches = [...otherMatches, ...matches];
    } else if (teacher.role === "admin" || teacher.role === "teacher") {
      updatedGlobalClasses = classes;
      updatedGlobalMatches = matches;
    }

    const newGlobalData: GlobalData = {
      teachers: updatedTeachers,
      classes: updatedGlobalClasses,
      matches: updatedGlobalMatches
    };

    setGlobalData(newGlobalData);
    saveGlobalData(newGlobalData);
  }, [teacher, classes, matches, isLoggedIn, isSyncing, globalData.teachers, globalData.classes, globalData.matches]);

  const handleLogin = async (loggedInTeacher: Teacher) => {
    setTeacher(loggedInTeacher);
    setIsLoggedIn(true);

    const loadedGlobalData = loadGlobalData();
    let loginClasses: ClassRoom[] = [];
    let loginMatches: Match[] = [];
    
    if (loggedInTeacher.role === "admin" || loggedInTeacher.role === "teacher") {
      loginClasses = loadedGlobalData.classes;
      loginMatches = loadedGlobalData.matches;
    } else if (loggedInTeacher.role === "junior") {
      loginClasses = loadedGlobalData.classes.filter(
        cls => cls.responsibleTeacherId === loggedInTeacher.id
      );
      loginMatches = loadedGlobalData.matches.filter(m => m.createdBy === loggedInTeacher.name);
    }
    
    setClasses(loginClasses);
    setMatches(loginMatches);
    
    const state: AppState = {
      teacher: loggedInTeacher,
      classes: loginClasses,
      matches: loginMatches
    };
    saveAppState(state);
  };

  const handleLogout = () => {
    if (confirm("Вы уверены, что хотите выйти? Данные сохранены.")) {
      setIsLoggedIn(false);
      setTeacher(null);
    }
  };

  const handleTeacherUpdate = (updatedTeacher: Teacher) => {
    setTeacher(updatedTeacher);
  };

  const handleClearData = () => {
    clearAppState();
    setClasses([]);
    setMatches([]);
  };

  const handleUpdateTeacher = async (updatedTeacher: Teacher) => {
    const updatedTeachers = globalData.teachers.map(t => 
      t.id === updatedTeacher.id ? updatedTeacher : t
    );
    const newGlobalData = { ...globalData, teachers: updatedTeachers };
    setGlobalData(newGlobalData);
    saveGlobalData(newGlobalData);
    
    if (teacher?.id === updatedTeacher.id) {
      setTeacher(updatedTeacher);
      const state: AppState = {
        teacher: updatedTeacher,
        classes,
        matches
      };
      saveAppState(state);
    }

    try {
      await syncToServer({ teacher: updatedTeacher });
      toast.success("Данные синхронизированы с сервером");
    } catch (error) {
      console.error("Failed to sync teacher to server", error);
      toast.error("Ошибка синхронизации с сервером");
    }
  };

  const handleDeleteTeacher = async (teacherId: string) => {
    const updatedTeachers = globalData.teachers.filter(t => t.id !== teacherId);
    const newGlobalData = { ...globalData, teachers: updatedTeachers };
    setGlobalData(newGlobalData);
    saveGlobalData(newGlobalData);
    
    try {
      await deleteTeacherFromServer(teacherId);
      toast.success("Учитель удалён");
    } catch (error) {
      console.error("Failed to delete teacher from server", error);
      toast.error("Ошибка удаления с сервера");
    }
  };

  const handleDeleteClass = (classId: string) => {
    const updatedClasses = globalData.classes.filter(c => c.id !== classId);
    const newGlobalData = { ...globalData, classes: updatedClasses };
    setGlobalData(newGlobalData);
    saveGlobalData(newGlobalData);
    setClasses(updatedClasses);
  };

  const handleDeleteMatch = (matchId: string) => {
    const updatedMatches = globalData.matches.filter(m => m.id !== matchId);
    const newGlobalData = { ...globalData, matches: updatedMatches };
    setGlobalData(newGlobalData);
    saveGlobalData(newGlobalData);
    setMatches(updatedMatches);
  };

  const handleUpdateClass = (updatedClass: ClassRoom) => {
    const updatedClasses = globalData.classes.map(c => 
      c.id === updatedClass.id ? updatedClass : c
    );
    const newGlobalData = { ...globalData, classes: updatedClasses };
    setGlobalData(newGlobalData);
    saveGlobalData(newGlobalData);
    setClasses(updatedClasses);
  };

  const handleCreateTeacher = async (newTeacher: Teacher) => {
    const updatedTeachers = [...globalData.teachers, newTeacher];
    const newGlobalData = { ...globalData, teachers: updatedTeachers };
    setGlobalData(newGlobalData);
    saveGlobalData(newGlobalData);
    
    try {
      await syncToServer({ teacher: newTeacher });
    } catch (error) {
      console.error("Failed to sync new teacher to server", error);
      toast.error("Не удалось синхронизировать нового учителя");
    }
  };

  if (!isLoggedIn || !teacher) {
    return <Login onLogin={handleLogin} />;
  }

  const isAdmin = teacher.role === "admin";

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-accent/30">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
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
              <DropdownMenuItem onClick={() => { setShowProfile(true); setShowAdmin(false); }}>
                <Icon name="User" size={16} className="mr-2" />
                Профиль
              </DropdownMenuItem>
              {isAdmin && (
                <DropdownMenuItem onClick={() => { setShowAdmin(true); setShowProfile(false); }}>
                  <Icon name="Shield" size={16} className="mr-2" />
                  Админка
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <Icon name="LogOut" size={16} className="mr-2" />
                Выйти
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {showProfile && (
          <Card className="shadow-xl border-2 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
                <Icon name="User" size={28} />
                Личный кабинет
              </h2>
              <Button variant="outline" onClick={() => setShowProfile(false)}>
                <Icon name="X" size={20} className="mr-2" />
                Закрыть
              </Button>
            </div>
            <TeacherProfile 
              teacher={teacher}
              onUpdate={handleTeacherUpdate}
              onClearData={handleClearData}
              onLogout={handleLogout}
            />
          </Card>
        )}

        {showAdmin && isAdmin && (
          <Card className="shadow-xl border-2 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
                <Icon name="Shield" size={28} />
                Административная панель
              </h2>
              <Button variant="outline" onClick={() => setShowAdmin(false)}>
                <Icon name="X" size={20} className="mr-2" />
                Закрыть
              </Button>
            </div>
            <AdminPanel 
              teachers={globalData.teachers}
              classes={globalData.classes}
              matches={globalData.matches}
              onUpdateTeacher={handleUpdateTeacher}
              onDeleteTeacher={handleDeleteTeacher}
              onDeleteClass={handleDeleteClass}
              onDeleteMatch={handleDeleteMatch}
              onUpdateClass={handleUpdateClass}
              onCreateTeacher={handleCreateTeacher}
            />
          </Card>
        )}

        <Card className="shadow-xl border-2 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 h-16 bg-secondary/50">
              <TabsTrigger 
                value="classes" 
                className="text-base data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Icon name="Users" size={20} className="mr-2" />
                Классы
              </TabsTrigger>
              <TabsTrigger 
                value="game" 
                className="text-base data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Icon name="Trophy" size={20} className="mr-2" />
                Игра
              </TabsTrigger>
              <TabsTrigger 
                value="teams" 
                className="text-base data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Icon name="Users" size={20} className="mr-2" />
                Команды
              </TabsTrigger>
              <TabsTrigger 
                value="export" 
                className="text-base data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Icon name="Download" size={20} className="mr-2" />
                Экспорт
              </TabsTrigger>
            </TabsList>

            <TabsContent value="classes" className="p-6">
              <ClassesTab classes={classes} setClasses={setClasses} />
            </TabsContent>

            <TabsContent value="game" className="p-6">
              <GameTab classes={classes} setClasses={setClasses} />
            </TabsContent>

            <TabsContent value="teams" className="p-6">
              <TeamsTab 
                classes={classes} 
                setClasses={setClasses}
                matches={matches}
                setMatches={setMatches}
                teacher={teacher}
              />
            </TabsContent>

            <TabsContent value="export" className="p-6">
              <ExportTab classes={classes} />
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default Index;