import { Card } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import { Student } from "@/types";
import { Badge } from "@/components/ui/badge";

export const ACHIEVEMENTS = [
  { id: "lumosity", name: "Люмосити", icon: "Brain", color: "bg-purple-100 text-purple-700" },
  { id: "robo", name: "Робо", icon: "Bot", color: "bg-blue-100 text-blue-700" },
  { id: "sport", name: "Спорт", icon: "Trophy", color: "bg-orange-100 text-orange-700" },
  { id: "valheim", name: "Вальхейм", icon: "Swords", color: "bg-green-100 text-green-700" },
  { id: "civilization", name: "Цивилизация", icon: "Castle", color: "bg-amber-100 text-amber-700" },
  { id: "simcity", name: "Симсити", icon: "Building2", color: "bg-cyan-100 text-cyan-700" },
  { id: "factorio", name: "Факторио", icon: "Factory", color: "bg-slate-100 text-slate-700" },
  { id: "pe3d", name: "3D Физкультура", icon: "Dumbbell", color: "bg-red-100 text-red-700" },
];

interface DirectionSelectorProps {
  selectedStudent: Student | undefined;
  selectedDirection: string;
  onSelectDirection: (achievementId: string) => void;
}

export const DirectionSelector = ({
  selectedStudent,
  selectedDirection,
  onSelectDirection
}: DirectionSelectorProps) => {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Icon name="Award" size={20} className="text-primary" />
        Выбор направления
      </h3>
      
      {!selectedStudent ? (
        <div className="text-center py-8 text-muted-foreground">
          <Icon name="User" size={32} className="mx-auto mb-2" />
          <p>Сначала выберите ученика</p>
        </div>
      ) : (
        <div className="space-y-4">
          {selectedStudent && (
            <div className="mb-4 p-3 bg-secondary/30 rounded-lg">
              <p className="font-medium">{selectedStudent.name}</p>
              <p className="text-sm text-muted-foreground">
                Направлений: {selectedStudent.achievements?.length || 0}
              </p>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-3">
            {ACHIEVEMENTS.map(achievement => {
              const isSelected = selectedDirection === achievement.id;
              const hasAchievement = selectedStudent?.achievements?.includes(achievement.id);
              
              return (
                <button
                  key={achievement.id}
                  className={`relative p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                    isSelected
                      ? 'border-primary bg-primary/10 shadow-lg' 
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => onSelectDirection(achievement.id)}
                >
                  {hasAchievement && !isSelected && (
                    <div className="absolute top-1 right-1">
                      <div className="w-2 h-2 rounded-full bg-green-500" title="Уже получал"></div>
                    </div>
                  )}
                  
                  <div className="flex flex-col items-center gap-2 text-center">
                    <div className={`p-3 rounded-full ${achievement.color}`}>
                      <Icon name={achievement.icon as any} size={24} />
                    </div>
                    <span className="text-sm font-medium">{achievement.name}</span>
                    {isSelected && (
                      <Badge variant="default" className="text-xs">Выбрано</Badge>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
};