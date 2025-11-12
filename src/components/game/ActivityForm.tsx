import { Card } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface ActivityFormProps {
  selectedDirection: string;
  lumosityPoints: string;
  setLumosityPoints: (value: string) => void;
  roboTime: string;
  setRoboTime: (value: string) => void;
  sportResult: "win" | "loss";
  setSportResult: (value: "win" | "loss") => void;
  sportRole: "captain" | "player";
  setSportRole: (value: "captain" | "player") => void;
  valheimResult: "win" | "loss";
  setValheimResult: (value: "win" | "loss") => void;
  valheimRole: "captain" | "player";
  setValheimRole: (value: "captain" | "player") => void;
  civYear: string;
  setCivYear: (value: string) => void;
  civDefenseYear: string;
  setCivDefenseYear: (value: string) => void;
  civProd1: string;
  setCivProd1: (value: string) => void;
  civProd2: string;
  setCivProd2: (value: string) => void;
  civProd3: string;
  setCivProd3: (value: string) => void;
  simcityCitizens: string;
  setSimcityCitizens: (value: string) => void;
  simcityHappiness: string;
  setSimcityHappiness: (value: string) => void;
  simcityProduction: string;
  setSimcityProduction: (value: string) => void;
  factorioFlasks: string;
  setFactorioFlasks: (value: string) => void;
  onAddActivity: () => void;
}

export const ActivityForm = ({
  selectedDirection,
  lumosityPoints,
  setLumosityPoints,
  roboTime,
  setRoboTime,
  sportResult,
  setSportResult,
  sportRole,
  setSportRole,
  valheimResult,
  setValheimResult,
  valheimRole,
  setValheimRole,
  civYear,
  setCivYear,
  civDefenseYear,
  setCivDefenseYear,
  civProd1,
  setCivProd1,
  civProd2,
  setCivProd2,
  civProd3,
  setCivProd3,
  simcityCitizens,
  setSimcityCitizens,
  simcityHappiness,
  setSimcityHappiness,
  simcityProduction,
  setSimcityProduction,
  factorioFlasks,
  setFactorioFlasks,
  onAddActivity
}: ActivityFormProps) => {
  if (!selectedDirection) return null;

  return (
    <Card className="p-6 border-2 border-primary/30">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Icon name="Pencil" size={20} className="text-primary" />
        {selectedDirection === "lumosity" && "Люмосити - Баллы"}
        {selectedDirection === "robo" && "Робо - Время"}
        {selectedDirection === "sport" && "Спорт - Результат"}
        {selectedDirection === "valheim" && "Вальхейм - Активность"}
        {selectedDirection === "civilization" && "Цивилизация - Активность"}
        {selectedDirection === "simcity" && "Симсити - Активность"}
        {selectedDirection === "factorio" && "Факторио - Активность"}
        {selectedDirection === "pe3d" && "3D Физкультура - Активность"}
      </h3>

      {selectedDirection === "lumosity" && (
        <div className="space-y-4">
          <div>
            <Label>Количество баллов</Label>
            <Input
              type="number"
              value={lumosityPoints}
              onChange={(e) => setLumosityPoints(e.target.value)}
              min="1"
              placeholder="Введите баллы"
            />
          </div>
          <Button onClick={onAddActivity} className="w-full" size="lg">
            <Icon name="Plus" size={18} className="mr-2" />
            Добавить баллы
          </Button>
        </div>
      )}

      {selectedDirection === "robo" && (
        <div className="space-y-4">
          <div>
            <Label>Время (в минутах)</Label>
            <Input
              type="number"
              value={roboTime}
              onChange={(e) => setRoboTime(e.target.value)}
              min="1"
              placeholder="Введите время"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Время будет сохранено в Excel файл
          </p>
          <Button onClick={onAddActivity} className="w-full" size="lg">
            <Icon name="Plus" size={18} className="mr-2" />
            Добавить время
          </Button>
        </div>
      )}

      {selectedDirection === "sport" && (
        <div className="space-y-4">
          <div>
            <Label className="mb-3 block">Результат</Label>
            <RadioGroup value={sportResult} onValueChange={(value) => setSportResult(value as "win" | "loss")}>
              <div className="flex items-center space-x-2 mb-2">
                <RadioGroupItem value="win" id="win" />
                <Label htmlFor="win" className="cursor-pointer">Победа</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="loss" id="loss" />
                <Label htmlFor="loss" className="cursor-pointer">Проигрыш</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label className="mb-3 block">Роль</Label>
            <RadioGroup value={sportRole} onValueChange={(value) => setSportRole(value as "captain" | "player")}>
              <div className="flex items-center space-x-2 mb-2">
                <RadioGroupItem value="captain" id="captain" />
                <Label htmlFor="captain" className="cursor-pointer">Капитан</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="player" id="player" />
                <Label htmlFor="player" className="cursor-pointer">Игрок</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="p-3 bg-secondary/30 rounded-lg text-sm">
            <p className="text-muted-foreground">
              Результаты будут сохранены в Excel файл
            </p>
          </div>

          <Button onClick={onAddActivity} className="w-full" size="lg">
            <Icon name="Plus" size={18} className="mr-2" />
            Добавить результат
          </Button>
        </div>
      )}

      {selectedDirection === "valheim" && (
        <div className="space-y-4">
          <div>
            <Label className="mb-3 block">Результат</Label>
            <RadioGroup value={valheimResult} onValueChange={(value) => setValheimResult(value as "win" | "loss")}>
              <div className="flex items-center space-x-2 mb-2">
                <RadioGroupItem value="win" id="valheim-win" />
                <Label htmlFor="valheim-win" className="cursor-pointer">Победа</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="loss" id="valheim-loss" />
                <Label htmlFor="valheim-loss" className="cursor-pointer">Поражение</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label className="mb-3 block">Роль</Label>
            <RadioGroup value={valheimRole} onValueChange={(value) => setValheimRole(value as "captain" | "player")}>
              <div className="flex items-center space-x-2 mb-2">
                <RadioGroupItem value="captain" id="valheim-captain" />
                <Label htmlFor="valheim-captain" className="cursor-pointer">Капитан</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="player" id="valheim-player" />
                <Label htmlFor="valheim-player" className="cursor-pointer">Игрок</Label>
              </div>
            </RadioGroup>
          </div>

          <Button onClick={onAddActivity} className="w-full" size="lg">
            <Icon name="Plus" size={18} className="mr-2" />
            Добавить результат
          </Button>
        </div>
      )}

      {selectedDirection === "civilization" && (
        <div className="space-y-4">
          <div>
            <Label>Год объявления</Label>
            <Input
              type="number"
              value={civYear}
              onChange={(e) => setCivYear(e.target.value)}
              placeholder="Например: 2024"
            />
          </div>
          <div>
            <Label>Год защиты</Label>
            <Input
              type="number"
              value={civDefenseYear}
              onChange={(e) => setCivDefenseYear(e.target.value)}
              placeholder="Например: 2025"
            />
          </div>
          
          <div className="border-t pt-4">
            <Label className="mb-3 block font-semibold">Производства (необязательно)</Label>
            <div className="space-y-3">
              <Input
                value={civProd1}
                onChange={(e) => setCivProd1(e.target.value)}
                placeholder="Производство 1"
              />
              <Input
                value={civProd2}
                onChange={(e) => setCivProd2(e.target.value)}
                placeholder="Производство 2"
              />
              <Input
                value={civProd3}
                onChange={(e) => setCivProd3(e.target.value)}
                placeholder="Производство 3"
              />
            </div>
          </div>

          <Button onClick={onAddActivity} className="w-full" size="lg">
            <Icon name="Plus" size={18} className="mr-2" />
            Добавить данные
          </Button>
        </div>
      )}

      {selectedDirection === "simcity" && (
        <div className="space-y-4">
          <div>
            <Label>Количество граждан</Label>
            <Input
              type="number"
              value={simcityCitizens}
              onChange={(e) => setSimcityCitizens(e.target.value)}
              placeholder="Введите количество"
              min="0"
            />
          </div>
          <div>
            <Label>Уровень счастья (%)</Label>
            <Input
              type="number"
              value={simcityHappiness}
              onChange={(e) => setSimcityHappiness(e.target.value)}
              placeholder="От 0 до 100"
              min="0"
              max="100"
            />
          </div>
          <div>
            <Label>Производство (необязательно)</Label>
            <Input
              value={simcityProduction}
              onChange={(e) => setSimcityProduction(e.target.value)}
              placeholder="Укажите производство"
            />
          </div>

          <Button onClick={onAddActivity} className="w-full" size="lg">
            <Icon name="Plus" size={18} className="mr-2" />
            Добавить данные
          </Button>
        </div>
      )}

      {selectedDirection === "factorio" && (
        <div className="space-y-4">
          <div>
            <Label>Количество производимых колб</Label>
            <Input
              type="number"
              value={factorioFlasks}
              onChange={(e) => setFactorioFlasks(e.target.value)}
              placeholder="Введите количество"
              min="0"
            />
          </div>

          <Button onClick={onAddActivity} className="w-full" size="lg">
            <Icon name="Plus" size={18} className="mr-2" />
            Добавить данные
          </Button>
        </div>
      )}

      {selectedDirection === "pe3d" && (
        <div className="space-y-4">
          <div className="p-4 bg-secondary/30 rounded-lg text-center">
            <Icon name="CheckCircle" size={32} className="mx-auto mb-2 text-primary" />
            <p className="text-sm text-muted-foreground">
              Направление выбрано и сохранено для ученика
            </p>
          </div>
          <Button onClick={onAddActivity} className="w-full" size="lg">
            <Icon name="Plus" size={18} className="mr-2" />
            Отметить активность
          </Button>
        </div>
      )}
    </Card>
  );
};
