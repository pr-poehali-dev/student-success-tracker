import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Icon from "@/components/ui/icon";
import { ClassesTab } from "@/components/ClassesTab";
import { GameTab } from "@/components/GameTab";
import { ExportTab } from "@/components/ExportTab";
import { TeamsTab } from "@/components/TeamsTab";
import { TeacherProfile } from "@/components/TeacherProfile";
import { ClassRoom, Teacher, Match, AppState } from "@/types";
import { saveAppState, loadAppState, getDefaultTeacher } from "@/utils/storage";

const Index = () => {
  const [teacher, setTeacher] = useState<Teacher>(getDefaultTeacher());
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    const savedState = loadAppState();
    if (savedState) {
      setTeacher(savedState.teacher);
      setClasses(savedState.classes);
      setMatches(savedState.matches);
    }
  }, []);

  useEffect(() => {
    const state: AppState = {
      teacher,
      classes,
      matches
    };
    saveAppState(state);
  }, [teacher, classes, matches]);

  const handleTeacherUpdate = (updatedTeacher: Teacher) => {
    setTeacher(updatedTeacher);
  };

  const handleClearData = () => {
    setTeacher(getDefaultTeacher());
    setClasses([]);
    setMatches([]);
  };

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
            <TabsList className="grid w-full grid-cols-5 h-16 bg-secondary/50">
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
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default Index;
