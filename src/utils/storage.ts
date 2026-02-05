import { AppState, Teacher } from "@/types";

const STORAGE_KEY = "poehali_teacher_app_state";

export const saveAppState = (state: AppState): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error("Error saving app state:", error);
  }
};

export const loadAppState = (): AppState | null => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;
    return JSON.parse(saved);
  } catch (error) {
    console.error("Error loading app state:", error);
    return null;
  }
};

export const clearAppState = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing app state:", error);
  }
};

export const getDefaultTeacher = (): Teacher => ({
  id: Date.now().toString(),
  name: "Учитель",
  email: "",
  role: "teacher",
  createdAt: new Date().toISOString()
});

export const createBackup = (state: AppState): void => {
  try {
    const backup = {
      version: "1.0",
      timestamp: new Date().toISOString(),
      data: state
    };
    
    const dataStr = JSON.stringify(backup, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_${new Date().toISOString().split('T')[0]}_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error creating backup:", error);
    throw error;
  }
};

export const restoreFromBackup = (file: File): Promise<AppState> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const backup = JSON.parse(e.target?.result as string);
        
        if (!backup.data || !backup.version) {
          reject(new Error("Неверный формат файла бекапа"));
          return;
        }
        
        resolve(backup.data);
      } catch (error) {
        reject(new Error("Ошибка чтения файла бекапа"));
      }
    };
    
    reader.onerror = () => reject(new Error("Ошибка чтения файла"));
    reader.readAsText(file);
  });
};