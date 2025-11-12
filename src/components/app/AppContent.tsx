import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { ClassesTab } from "@/components/ClassesTab";
import { GameTab } from "@/components/GameTab";
import { ExportTab } from "@/components/ExportTab";
import { TeamsTab } from "@/components/TeamsTab";
import { SoftSkillsTab } from "@/components/SoftSkillsTab";
import { TeacherProfile } from "@/components/TeacherProfile";
import { AdminPanel } from "@/components/AdminPanel";
import { ClassRoom, Teacher, Match } from "@/types";

interface AppContentProps {
  teacher: Teacher;
  classes: ClassRoom[];
  matches: Match[];
  globalData: {
    teachers: Teacher[];
    classes: ClassRoom[];
    matches: Match[];
  };
  activeTab: string;
  showProfile: boolean;
  showAdmin: boolean;
  isAdmin: boolean;
  setClasses: (classes: ClassRoom[]) => void;
  setMatches: (matches: Match[]) => void;
  setActiveTab: (tab: string) => void;
  setShowProfile: (show: boolean) => void;
  setShowAdmin: (show: boolean) => void;
  onTeacherUpdate: (teacher: Teacher) => void;
  onClearData: () => void;
  onUpdateTeacher: (teacher: Teacher) => void;
  onDeleteTeacher: (teacherId: string) => void;
  onDeleteClass: (classId: string) => void;
  onDeleteMatch: (matchId: string) => void;
  onUpdateClass: (updatedClass: ClassRoom) => void;
  onCreateTeacher: (teacher: Teacher) => void;
}

export const AppContent = ({
  teacher,
  classes,
  matches,
  globalData,
  activeTab,
  showProfile,
  showAdmin,
  isAdmin,
  setClasses,
  setMatches,
  setActiveTab,
  setShowProfile,
  setShowAdmin,
  onTeacherUpdate,
  onClearData,
  onUpdateTeacher,
  onDeleteTeacher,
  onDeleteClass,
  onDeleteMatch,
  onUpdateClass,
  onCreateTeacher,
}: AppContentProps) => {
  return (
    <>
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
            onUpdate={onTeacherUpdate}
            onClearData={onClearData}
          />
        </Card>
      )}

      {showAdmin && isAdmin && (
        <Card className="shadow-xl border-2 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
              <Icon name="Shield" size={28} />
              Панель администратора
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
            onUpdateTeacher={onUpdateTeacher}
            onDeleteTeacher={onDeleteTeacher}
            onDeleteClass={onDeleteClass}
            onDeleteMatch={onDeleteMatch}
            onUpdateClass={onUpdateClass}
            onCreateTeacher={onCreateTeacher}
          />
        </Card>
      )}

      {!showProfile && !showAdmin && (
        <Card className="shadow-xl border-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5 lg:grid-cols-5">
              <TabsTrigger value="classes" className="flex items-center gap-2">
                <Icon name="Users" size={18} />
                <span className="hidden sm:inline">Классы</span>
              </TabsTrigger>
              <TabsTrigger value="game" className="flex items-center gap-2">
                <Icon name="Gamepad2" size={18} />
                <span className="hidden sm:inline">Игры</span>
              </TabsTrigger>
              <TabsTrigger value="teams" className="flex items-center gap-2">
                <Icon name="Trophy" size={18} />
                <span className="hidden sm:inline">Команды</span>
              </TabsTrigger>
              <TabsTrigger value="soft-skills" className="flex items-center gap-2">
                <Icon name="Brain" size={18} />
                <span className="hidden sm:inline">Soft Skills</span>
              </TabsTrigger>
              <TabsTrigger value="export" className="flex items-center gap-2">
                <Icon name="Download" size={18} />
                <span className="hidden sm:inline">Экспорт</span>
              </TabsTrigger>
            </TabsList>

            <div className="p-6">
              <TabsContent value="classes" className="mt-0">
                <ClassesTab 
                  classes={classes} 
                  setClasses={setClasses} 
                  teacher={teacher}
                  allTeachers={globalData.teachers}
                />
              </TabsContent>

              <TabsContent value="game" className="mt-0">
                <GameTab 
                  classes={classes} 
                  setClasses={setClasses}
                  teacher={teacher}
                />
              </TabsContent>

              <TabsContent value="teams" className="mt-0">
                <TeamsTab 
                  classes={classes}
                  matches={matches}
                  setClasses={setClasses}
                  setMatches={setMatches}
                  teacher={teacher}
                  onDeleteMatch={onDeleteMatch}
                />
              </TabsContent>

              <TabsContent value="soft-skills" className="mt-0">
                <SoftSkillsTab 
                  classes={classes}
                  matches={matches}
                  setClasses={setClasses}
                  teacher={teacher}
                />
              </TabsContent>

              <TabsContent value="export" className="mt-0">
                <ExportTab 
                  classes={classes}
                  matches={matches}
                  teacher={teacher}
                />
              </TabsContent>
            </div>
          </Tabs>
        </Card>
      )}
    </>
  );
};