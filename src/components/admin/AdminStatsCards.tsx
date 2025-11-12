import { Card } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import { Teacher, ClassRoom, Match } from "@/types";

interface AdminStatsCardsProps {
  teachers: Teacher[];
  classes: ClassRoom[];
  matches: Match[];
}

export const AdminStatsCards = ({ teachers, classes, matches }: AdminStatsCardsProps) => {
  const adminCount = teachers.filter(t => t.role === "admin").length;
  const teacherCount = teachers.filter(t => t.role === "teacher").length;
  const juniorCount = teachers.filter(t => t.role === "junior").length;
  const totalStudents = classes.reduce((sum, cls) => sum + cls.students.length, 0);

  return (
    <div className="grid md:grid-cols-5 gap-4">
      <Card className="p-6 text-center bg-gradient-to-br from-purple-100 to-purple-50">
        <Icon name="ShieldCheck" size={32} className="mx-auto mb-2 text-purple-700" />
        <p className="text-3xl font-bold text-foreground">{adminCount}</p>
        <p className="text-muted-foreground">Админов</p>
      </Card>

      <Card className="p-6 text-center bg-gradient-to-br from-blue-100 to-blue-50">
        <Icon name="Users" size={32} className="mx-auto mb-2 text-blue-700" />
        <p className="text-3xl font-bold text-foreground">{teacherCount}</p>
        <p className="text-muted-foreground">Учителей</p>
      </Card>

      <Card className="p-6 text-center bg-gradient-to-br from-cyan-100 to-cyan-50">
        <Icon name="UserCheck" size={32} className="mx-auto mb-2 text-cyan-700" />
        <p className="text-3xl font-bold text-foreground">{juniorCount}</p>
        <p className="text-muted-foreground">МНС</p>
      </Card>

      <Card className="p-6 text-center bg-gradient-to-br from-green-100 to-green-50">
        <Icon name="GraduationCap" size={32} className="mx-auto mb-2 text-green-700" />
        <p className="text-3xl font-bold text-foreground">{totalStudents}</p>
        <p className="text-muted-foreground">Учеников</p>
      </Card>

      <Card className="p-6 text-center bg-gradient-to-br from-orange-100 to-orange-50">
        <Icon name="Trophy" size={32} className="mx-auto mb-2 text-orange-700" />
        <p className="text-3xl font-bold text-foreground">{matches.length}</p>
        <p className="text-muted-foreground">Матчей</p>
      </Card>
    </div>
  );
};
