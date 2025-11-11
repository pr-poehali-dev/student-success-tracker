import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Icon from "@/components/ui/icon";
import { ClassesTab } from "@/components/ClassesTab";
import { GameTab } from "@/components/GameTab";
import { ExportTab } from "@/components/ExportTab";
import { TeamsTab } from "@/components/TeamsTab";
import { ClassRoom } from "@/types";

const Index = () => {
  const [classes, setClasses] = useState<ClassRoom[]>([
    {
      id: "1",
      name: "5-А",
      students: [
        { id: "1", name: "Алексей Иванов", points: 150, achievements: ["star", "trophy"] },
        { id: "2", name: "Мария Петрова", points: 200, achievements: ["star", "medal", "trophy"] },
        { id: "3", name: "Дмитрий Сидоров", points: 120, achievements: ["medal"] },
      ]
    },
    {
      id: "2",
      name: "5-Б",
      students: [
        { id: "4", name: "Елена Смирнова", points: 180, achievements: ["star", "medal"] },
        { id: "5", name: "Иван Козлов", points: 140, achievements: ["trophy"] },
      ]
    }
  ]);

  const [activeTab, setActiveTab] = useState("classes");

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
              <TeamsTab classes={classes} setClasses={setClasses} />
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