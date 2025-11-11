import { AppState, Teacher, ClassRoom, Match } from "@/types";

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
  email: ""
});
