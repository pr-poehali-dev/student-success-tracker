import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Icon from "@/components/ui/icon";

interface AllDataExportProps {
  onExport: () => void;
  disabled: boolean;
}

export const AllDataExport = ({ onExport, disabled }: AllDataExportProps) => {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Icon name="Download" size={20} className="text-primary" />
        Экспорт всех данных
      </h3>
      <p className="text-muted-foreground mb-4">
        Скачайте Excel файл со всеми учениками, их баллами и достижениями
      </p>
      <Button 
        onClick={onExport}
        disabled={disabled}
        className="w-full md:w-auto"
        size="lg"
      >
        <Icon name="FileDown" size={20} className="mr-2" />
        Скачать все данные
      </Button>
    </Card>
  );
};
