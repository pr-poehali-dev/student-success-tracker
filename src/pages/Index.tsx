import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { syncFromServer, syncToServer } from "@/utils/sync";
import { toast } from "sonner";

const Index = () => {
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [globalData, setGlobalData] = useState<GlobalData>({ teachers: [], classes: [], matches: [] });
  const [activeTab, setActiveTab] = useState("profile");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setIsSyncing(true);
      try {
        const serverData = await syncFromServer();
        setGlobalData(serverData);
        saveGlobalData(serverData);
        
        const savedState = loadAppState();
        if (savedState && savedState.teacher.name !== "Учитель") {
          setTeacher(savedState.teacher);
          setIsLoggedIn(true);
          
          if (savedState.teacher.role === "admin") {
            setClasses(serverData.classes);
            setMatches(serverData.matches);
          } else {
            const myClasses = serverData.classes.filter(
              cls => cls.responsibleTeacherId === savedState.teacher.id
            );
            const myMatches = serverData.matches.filter(m => m.createdBy === savedState.teacher.name);
            setClasses(myClasses);
            setMatches(myMatches);
          }
        }
      } catch (error) {
        console.error("Failed to sync from server, using local data", error);
        const loadedGlobalData = loadGlobalData();
        setGlobalData(loadedGlobalData);
        
        const savedState = loadAppState();
        if (savedState && savedState.teacher.name !== "Учитель") {
          setTeacher(savedState.teacher);
          setIsLoggedIn(true);
          
          if (savedState.teacher.role === "admin") {
            setClasses(loadedGlobalData.classes);
            setMatches(loadedGlobalData.matches);
          } else {
            setClasses(savedState.classes);
            setMatches(savedState.matches);
          }
        }
      } finally {
        setIsSyncing(false);
      }
    };
    
    loadData();
  }, []);

  useEffect(() => {
    if (teacher && isLoggedIn && !isSyncing) {
      const syncData = async () => {
        const existingTeacherIndex = globalData.teachers.findIndex(t => t.id === teacher.id);
        const updatedTeachers = existingTeacherIndex >= 0
          ? globalData.teachers.map(t => t.id === teacher.id ? teacher : t)
          : [...globalData.teachers, teacher];

        let updatedGlobalClasses = globalData.classes;
        let updatedGlobalMatches = globalData.matches;

        if (teacher.role === "teacher") {
          const myClassIds = classes.map(c => c.id);
          const otherClasses = globalData.classes.filter(c => !myClassIds.includes(c.id));
          updatedGlobalClasses = [...otherClasses, ...classes];

          const myMatchIds = matches.map(m => m.id);
          const otherMatches = globalData.matches.filter(m => !myMatchIds.includes(m.id));
          updatedGlobalMatches = [...otherMatches, ...matches];

          const state: AppState = {
            teacher,
            classes,
            matches
          };
          saveAppState(state);
        } else if (teacher.role === "admin") {
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
        
        try {
          await syncToServer({
            teacher,
            classes: updatedGlobalClasses,
            matches: updatedGlobalMatches
          });
        } catch (error) {
          console.error("Failed to sync to server", error);
        }
      };
      
      syncData();
    }
  }, [teacher, classes, matches, isLoggedIn, isSyncing]);

  const handleLogin = async (loggedInTeacher: Teacher) => {
    setTeacher(loggedInTeacher);
    setIsLoggedIn(true);

    try {
      const serverData = await syncFromServer();
      setGlobalData(serverData);
      
      if (loggedInTeacher.role === "admin") {
        setClasses(serverData.classes);
        setMatches(serverData.matches);
      } else {
        const myClasses = serverData.classes.filter(
          cls => cls.responsibleTeacherId === loggedInTeacher.id
        );
        const myMatches = serverData.matches.filter(m => m.createdBy === loggedInTeacher.name);
        setClasses(myClasses);
        setMatches(myMatches);
      }
      
      await syncToServer({ teacher: loggedInTeacher });
    } catch (error) {
      console.error("Failed to sync on login", error);
      toast.error("Не удалось синхронизировать данные");
      
      const loadedGlobalData = loadGlobalData();
      if (loggedInTeacher.role === "admin") {
        setClasses(loadedGlobalData.classes);
        setMatches(loadedGlobalData.matches);
      } else {
        const myClasses = loadedGlobalData.classes.filter(
          cls => cls.responsibleTeacherId === loggedInTeacher.id
        );
        const myMatches = loadedGlobalData.matches.filter(m => m.createdBy === loggedInTeacher.name);
        setClasses(myClasses);
        setMatches(myMatches);
      }
    }
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

  const handleUpdateTeacher = (updatedTeacher: Teacher) => {
    const updatedTeachers = globalData.teachers.map(t => 
      t.id === updatedTeacher.id ? updatedTeacher : t
    );
    const newGlobalData = { ...globalData, teachers: updatedTeachers };
    setGlobalData(newGlobalData);
    saveGlobalData(newGlobalData);
    
    if (teacher?.id === updatedTeacher.id) {
      setTeacher(updatedTeacher);
    }
  };

  const handleDeleteTeacher = (teacherId: string) => {
    const updatedTeachers = globalData.teachers.filter(t => t.id !== teacherId);
    const newGlobalData = { ...globalData, teachers: updatedTeachers };
    setGlobalData(newGlobalData);
    saveGlobalData(newGlobalData);
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

  if (!isLoggedIn || !teacher) {
    return <Login onLogin={handleLogin} />;
  }

  const isAdmin = teacher.role === "admin";
  const tabsCount = isAdmin ? 6 : 5;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-accent/30">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <header className="mb-8 text-center animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Icon name="GraduationCap" size={40} className="text-primary" />
            <h1 className="text-5xl font-bold text-foreground">Успехи учеников</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Отслеживайте достижения и мотивируйте учеников
          </p>
        </header>

        <Card className="shadow-xl border-2 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className={`grid w-full grid-cols-${tabsCount} h-16 bg-secondary/50`}>
              <TabsTrigger 
                value="profile" 
                className="text-base data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Icon name="User" size={20} className="mr-2" />
                Профиль
              </TabsTrigger>
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
              {isAdmin && (
                <TabsTrigger 
                  value="admin" 
                  className="text-base data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <Icon name="Shield" size={20} className="mr-2" />
                  Админка
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="profile" className="p-6">
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
                  <Icon name="User" size={28} />
                  Личный кабинет
                </h2>
                <TeacherProfile 
                  teacher={teacher}
                  onUpdate={handleTeacherUpdate}
                  onClearData={handleClearData}
                  onLogout={handleLogout}
                />
              </div>
            </TabsContent>

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

            {isAdmin && (
              <TabsContent value="admin" className="p-6">
                <AdminPanel 
                  teachers={globalData.teachers}
                  classes={globalData.classes}
                  matches={globalData.matches}
                  onUpdateTeacher={handleUpdateTeacher}
                  onDeleteTeacher={handleDeleteTeacher}
                  onDeleteClass={handleDeleteClass}
                  onDeleteMatch={handleDeleteMatch}
                  onUpdateClass={handleUpdateClass}
                />
              </TabsContent>
            )}
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default Index;