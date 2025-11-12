import { Card } from "@/components/ui/card";
import Icon from "@/components/ui/icon";

interface StatisticsCardsProps {
  totalStudents: number;
  totalPoints: number;
  totalAchievements: number;
}

export const StatisticsCards = ({
  totalStudents,
  totalPoints,
  totalAchievements
}: StatisticsCardsProps) => {
  return (
    <div className="grid md:grid-cols-3 gap-4">
      <Card className="p-6 text-center bg-gradient-to-br from-primary/10 to-primary/5">
        <Icon name="Users" size={32} className="mx-auto mb-2 text-primary" />
        <p className="text-3xl font-bold text-foreground">{totalStudents}</p>
        <p className="text-muted-foreground">Всего учеников</p>
      </Card>

      <Card className="p-6 text-center bg-gradient-to-br from-accent/20 to-accent/10">
        <Icon name="Star" size={32} className="mx-auto mb-2 text-primary" />
        <p className="text-3xl font-bold text-foreground">{totalPoints}</p>
        <p className="text-muted-foreground">Всего баллов</p>
      </Card>

      <Card className="p-6 text-center bg-gradient-to-br from-secondary/30 to-secondary/20">
        <Icon name="Award" size={32} className="mx-auto mb-2 text-primary" />
        <p className="text-3xl font-bold text-foreground">{totalAchievements}</p>
        <p className="text-muted-foreground">Всего достижений</p>
      </Card>
    </div>
  );
};
