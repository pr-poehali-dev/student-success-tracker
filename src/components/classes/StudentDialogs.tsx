import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Icon from "@/components/ui/icon";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface StudentDialogsProps {
  isAddStudentOpen: boolean;
  setIsAddStudentOpen: (open: boolean) => void;
  newStudentName: string;
  setNewStudentName: (name: string) => void;
  isAttendanceDialogOpen: boolean;
  setIsAttendanceDialogOpen: (open: boolean) => void;
  attendanceDate: string;
  setAttendanceDate: (date: string) => void;
  onAddStudent: () => void;
  onMarkAbsent: (date?: string) => void;
}

export const StudentDialogs = ({
  isAddStudentOpen,
  setIsAddStudentOpen,
  newStudentName,
  setNewStudentName,
  isAttendanceDialogOpen,
  setIsAttendanceDialogOpen,
  attendanceDate,
  setAttendanceDate,
  onAddStudent,
  onMarkAbsent
}: StudentDialogsProps) => {
  return (
    <>
      <Dialog open={isAddStudentOpen} onOpenChange={setIsAddStudentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Новый ученик</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Имя и фамилия</Label>
              <Input
                value={newStudentName}
                onChange={(e) => setNewStudentName(e.target.value)}
                placeholder="Например: Иван Иванов"
                onKeyPress={(e) => e.key === 'Enter' && onAddStudent()}
              />
            </div>
            <Button onClick={onAddStudent} className="w-full">
              Добавить ученика
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isAttendanceDialogOpen} onOpenChange={setIsAttendanceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Отметить отсутствие</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Дата отсутствия</Label>
              <Input
                type="date"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button 
                onClick={() => onMarkAbsent()} 
                variant="outline"
                className="w-full"
              >
                <Icon name="Calendar" size={16} className="mr-2" />
                Сегодня
              </Button>
              <Button 
                onClick={() => onMarkAbsent(attendanceDate)}
                disabled={!attendanceDate}
                className="w-full"
              >
                Отметить выбранную дату
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
