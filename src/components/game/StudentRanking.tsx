import { Card } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";
import { ACHIEVEMENTS } from "./DirectionSelector";

interface StudentWithClass {
  id: string;
  name: string;
  points: number;
  achievements: string[];
  className: string;
}

interface StudentRankingProps {
  students: StudentWithClass[];
}

export const StudentRanking = ({ students }: StudentRankingProps) => {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Icon name="TrendingUp" size={20} className="text-primary" />
        Рейтинг учеников
      </h3>
      
      {students.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Icon name="Users" size={32} className="mx-auto mb-2" />
          <p>Пока нет учеников</p>
        </div>
      ) : (
        <div className="space-y-2">
          {students.map((student, index) => (
            <div 
              key={student.id}
              className="flex items-center gap-4 p-4 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 font-bold text-primary">
                {index + 1}
              </div>
              
              <div className="flex-1">
                <p className="font-medium">{student.name}</p>
                <p className="text-sm text-muted-foreground">{student.className}</p>
              </div>

              <div className="flex items-center gap-2">
                {(student.achievements || []).slice(0, 3).map(achId => {
                  const achievement = ACHIEVEMENTS.find(a => a.id === achId);
                  return achievement ? (
                    <div key={achId} className={`p-1.5 rounded ${achievement.color}`}>
                      <Icon name={achievement.icon as any} size={16} />
                    </div>
                  ) : null;
                })}
                {(student.achievements || []).length > 3 && (
                  <Badge variant="secondary">+{(student.achievements || []).length - 3}</Badge>
                )}
              </div>

              <div className="text-right">
                <p className="font-bold text-lg text-primary">{student.points}</p>
                <p className="text-xs text-muted-foreground">баллов</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};