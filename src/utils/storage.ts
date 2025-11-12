import { AppState, Teacher, ClassRoom, Match, GlobalData } from "@/types";

const STORAGE_KEY = "poehali_teacher_app_state";
const GLOBAL_DATA_KEY = "poehali_global_data";

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

export const saveGlobalData = (data: GlobalData): void => {
  try {
    localStorage.setItem(GLOBAL_DATA_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Error saving global data:", error);
  }
};

export const loadGlobalData = (): GlobalData => {
  try {
    const saved = localStorage.getItem(GLOBAL_DATA_KEY);
    if (!saved) {
      return { teachers: [], classes: [], matches: [] };
    }
    return JSON.parse(saved);
  } catch (error) {
    console.error("Error loading global data:", error);
    return { teachers: [], classes: [], matches: [] };
  }
};

export const clearGlobalData = (): void => {
  try {
    localStorage.removeItem(GLOBAL_DATA_KEY);
  } catch (error) {
    console.error("Error clearing global data:", error);
  }
};