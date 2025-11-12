import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Icon from "@/components/ui/icon";
import { ClassRoom, Match, Student, SoftSkillRating } from "@/types";
import { toast } from "sonner";

interface SoftSkillsTabProps {
  classes: ClassRoom[];
  matches: Match[];
  teacherName: string;
  onUpdateStudent: (classId: string, student: Student) => void;
}

export const SoftSkillsTab = ({ classes, matches, teacherName, onUpdateStudent }: SoftSkillsTabProps) => {
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [selectedMatchId, setSelectedMatchId] = useState<string>("");
  const [ratings, setRatings] = useState<Omit<SoftSkillRating, 'date' | 'ratedBy'>>({
    leadership: 0,
    selfControl: 0,
    communication: 0,
    selfReflection: 0,
    criticalThinking: 0,
  });

  const selectedClass = classes.find(c => c.id === selectedClassId);
  const selectedStudent = selectedClass?.students.find(s => s.id === selectedStudentId);

  const allStudents = classes.flatMap(cls => 
    cls.students.map(student => ({
      ...student,
      className: cls.name,
      classId: cls.id
    }))
  );

  const StarRating = ({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="focus:outline-none transition-transform hover:scale-110"
          >
            <Icon
              name="Star"
              size={28}
              className={star <= value ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
            />
          </button>
        ))}
      </div>
    </div>
  );

  const handleSubmit = () => {
    if (!selectedStudentId || !selectedClassId) {
      toast.error("Выберите учащегося");
      return;
    }

    if (Object.values(ratings).some(r => r === 0)) {
      toast.error("Оцените все критерии");
      return;
    }

    const newRating: SoftSkillRating = {
      ...ratings,
      matchId: selectedMatchId || undefined,
      date: new Date().toISOString(),
      ratedBy: teacherName,
    };

    const updatedStudent: Student = {
      ...selectedStudent!,
      softSkills: [...(selectedStudent!.softSkills || []), newRating],
    };

    onUpdateStudent(selectedClassId, updatedStudent);

    setRatings({
      leadership: 0,
      selfControl: 0,
      communication: 0,
      selfReflection: 0,
      criticalThinking: 0,
    });
    setSelectedMatchId("");
    setSelectedStudentId("");
    setSelectedClassId("");

    toast.success("Оценка сохранена");
  };

  const getAverageRatings = (student: Student) => {
    if (!student.softSkills || student.softSkills.length === 0) return null;

    const sum = student.softSkills.reduce((acc, rating) => ({
      leadership: acc.leadership + rating.leadership,
      selfControl: acc.selfControl + rating.selfControl,
      communication: acc.communication + rating.communication,
      selfReflection: acc.selfReflection + rating.selfReflection,
      criticalThinking: acc.criticalThinking + rating.criticalThinking,
    }), {
      leadership: 0,
      selfControl: 0,
      communication: 0,
      selfReflection: 0,
      criticalThinking: 0,
    });

    const count = student.softSkills.length;
    return {
      leadership: (sum.leadership / count).toFixed(1),
      selfControl: (sum.selfControl / count).toFixed(1),
      communication: (sum.communication / count).toFixed(1),
      selfReflection: (sum.selfReflection / count).toFixed(1),
      criticalThinking: (sum.criticalThinking / count).toFixed(1),
    };
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Оценка Soft Skills</CardTitle>
          <CardDescription>Оценивайте развитие мягких навыков учащихся</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Класс</Label>
              <Select value={selectedClassId} onValueChange={(value) => {
                setSelectedClassId(value);
                setSelectedStudentId("");
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите класс" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Учащийся</Label>
              <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите учащегося" />
                </SelectTrigger>
                <SelectContent>
                  {selectedClass?.students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Матч (необязательно)</Label>
            <Select value={selectedMatchId || "none"} onValueChange={(value) => setSelectedMatchId(value === "none" ? "" : value)}>
              <SelectTrigger>
                <SelectValue placeholder="Общая оценка (без привязки к матчу)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Общая оценка</SelectItem>
                {matches.map((match) => (
                  <SelectItem key={match.id} value={match.id}>
                    {match.team1.name} vs {match.team2.name} ({new Date(match.date).toLocaleDateString()})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <StarRating
              label="Лидерство"
              value={ratings.leadership}
              onChange={(v) => setRatings({ ...ratings, leadership: v })}
            />
            <StarRating
              label="Самоконтроль"
              value={ratings.selfControl}
              onChange={(v) => setRatings({ ...ratings, selfControl: v })}
            />
            <StarRating
              label="Коммуникация"
              value={ratings.communication}
              onChange={(v) => setRatings({ ...ratings, communication: v })}
            />
            <StarRating
              label="Саморефлексия"
              value={ratings.selfReflection}
              onChange={(v) => setRatings({ ...ratings, selfReflection: v })}
            />
            <StarRating
              label="Критическое мышление"
              value={ratings.criticalThinking}
              onChange={(v) => setRatings({ ...ratings, criticalThinking: v })}
            />
          </div>

          <Button onClick={handleSubmit} className="w-full">
            <Icon name="Save" className="mr-2" size={18} />
            Сохранить оценку
          </Button>
        </CardContent>
      </Card>

      {selectedStudent && (
        <Card>
          <CardHeader>
            <CardTitle>История оценок: {selectedStudent.name}</CardTitle>
            <CardDescription>
              {selectedStudent.softSkills?.length || 0} оценок
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedStudent.softSkills && selectedStudent.softSkills.length > 0 ? (
              <div className="space-y-4">
                <div className="p-4 bg-secondary/20 rounded-lg">
                  <h4 className="font-semibold mb-3">Средние значения</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                    {Object.entries(getAverageRatings(selectedStudent)!).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-2">
                        <Icon name="Star" size={16} className="fill-yellow-400 text-yellow-400" />
                        <span className="capitalize">
                          {key === 'leadership' && 'Лидерство'}
                          {key === 'selfControl' && 'Самоконтроль'}
                          {key === 'communication' && 'Коммуникация'}
                          {key === 'selfReflection' && 'Саморефлексия'}
                          {key === 'criticalThinking' && 'Критическое мышление'}
                        </span>
                        <span className="font-bold">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  {selectedStudent.softSkills.map((rating, index) => (
                    <div key={index} className="p-3 border rounded-lg space-y-2">
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{new Date(rating.date).toLocaleString()}</span>
                        <span>Оценил: {rating.ratedBy}</span>
                      </div>
                      {rating.matchId && (
                        <div className="text-sm text-muted-foreground">
                          Матч: {matches.find(m => m.id === rating.matchId)?.team1.name || 'N/A'}
                        </div>
                      )}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                        <div>Лидерство: {rating.leadership}★</div>
                        <div>Самоконтроль: {rating.selfControl}★</div>
                        <div>Коммуникация: {rating.communication}★</div>
                        <div>Саморефлексия: {rating.selfReflection}★</div>
                        <div>Критическое мышление: {rating.criticalThinking}★</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                Пока нет оценок для этого учащегося
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Общий рейтинг учащихся</CardTitle>
          <CardDescription>Средние показатели soft skills всех учащихся</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {allStudents
              .filter(s => s.softSkills && s.softSkills.length > 0)
              .map((student) => {
                const avg = getAverageRatings(student);
                const totalAvg = avg ? (
                  (parseFloat(avg.leadership) + 
                   parseFloat(avg.selfControl) + 
                   parseFloat(avg.communication) + 
                   parseFloat(avg.selfReflection) + 
                   parseFloat(avg.criticalThinking)) / 5
                ).toFixed(1) : '0';

                return (
                  <div key={student.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{student.name}</div>
                      <div className="text-sm text-muted-foreground">{student.className}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon name="Star" size={20} className="fill-yellow-400 text-yellow-400" />
                      <span className="text-xl font-bold">{totalAvg}</span>
                      <span className="text-sm text-muted-foreground">
                        ({student.softSkills?.length} оценок)
                      </span>
                    </div>
                  </div>
                );
              })}
            {allStudents.filter(s => s.softSkills && s.softSkills.length > 0).length === 0 && (
              <p className="text-muted-foreground text-center py-8">
                Пока нет оценок
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};