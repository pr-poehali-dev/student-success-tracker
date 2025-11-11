import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Icon from "@/components/ui/icon";
import { ScheduledDate } from "@/types";
import { toast } from "sonner";

interface MatchSchedulerProps {
  scheduledDates: ScheduledDate[];
  newDate: string;
  newTime: string;
  onNewDateChange: (date: string) => void;
  onNewTimeChange: (time: string) => void;
  onAddScheduledDate: () => void;
  onRemoveScheduledDate: (id: string) => void;
}

export const MatchScheduler = ({
  scheduledDates,
  newDate,
  newTime,
  onNewDateChange,
  onNewTimeChange,
  onAddScheduledDate,
  onRemoveScheduledDate
}: MatchSchedulerProps) => {
  return (
    <Card className="p-4 border-2 border-primary/30">
      <h4 className="font-semibold mb-3 flex items-center gap-2">
        <Icon name="Calendar" size={18} className="text-primary" />
        Расписание проведения матча
      </h4>
      
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Дата</Label>
            <Input 
              type="date"
              value={newDate}
              onChange={(e) => onNewDateChange(e.target.value)}
            />
          </div>
          <div>
            <Label>Время</Label>
            <Input 
              type="time"
              value={newTime}
              onChange={(e) => onNewTimeChange(e.target.value)}
            />
          </div>
        </div>
        
        <Button 
          onClick={onAddScheduledDate} 
          variant="outline" 
          className="w-full"
          size="sm"
        >
          <Icon name="Plus" size={16} className="mr-2" />
          Добавить дату
        </Button>

        {scheduledDates.length > 0 && (
          <div className="space-y-2 mt-4">
            <p className="text-sm font-medium">Запланированные даты:</p>
            {scheduledDates.map(schedule => (
              <div 
                key={schedule.id} 
                className="flex items-center justify-between p-2 bg-secondary/30 rounded"
              >
                <span className="text-sm">
                  {new Date(schedule.date).toLocaleDateString('ru-RU')} в {schedule.time}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onRemoveScheduledDate(schedule.id)}
                >
                  <Icon name="X" size={16} />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};
