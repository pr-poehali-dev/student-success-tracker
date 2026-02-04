import { TEAM_COLORS } from "@/constants/teamColors";

interface TeamColorPickerProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
  teamNumber: number;
}

export const TeamColorPicker = ({ selectedColor, onColorChange, teamNumber }: TeamColorPickerProps) => {
  return (
    <div className="mt-3">
      <label className="block text-sm font-medium mb-2">
        Цвет карточки команды {teamNumber}
      </label>
      <div className="flex flex-wrap gap-2">
        {TEAM_COLORS.map((color) => (
          <button
            key={color.value}
            type="button"
            onClick={() => onColorChange(color.value)}
            className={`w-8 h-8 rounded-full transition-all ${
              selectedColor === color.value
                ? "ring-2 ring-primary ring-offset-2 scale-110"
                : "hover:scale-105"
            }`}
            style={{
              backgroundColor: color.value,
              border: color.border ? `2px solid ${color.border}` : "2px solid transparent"
            }}
            title={color.name}
          />
        ))}
      </div>
    </div>
  );
};
