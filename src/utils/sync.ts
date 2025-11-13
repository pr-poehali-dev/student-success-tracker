import { GlobalData, Teacher, ClassRoom, Match } from "@/types";

const SYNC_API_URL = "https://functions.poehali.dev/5f412d00-6e28-4197-9c9d-c71b82e72629";

// Глобальный счетчик для мониторинга всех вызовов API
const globalApiCounter = {
  get: 0,
  post: 0,
  delete: 0,
  errors: 0,
  startTime: Date.now()
};

// Функция для вывода статистики
export const getApiStats = () => {
  const elapsed = (Date.now() - globalApiCounter.startTime) / 1000;
  return {
    ...globalApiCounter,
    elapsedSeconds: Math.floor(elapsed),
    callsPerMinute: ((globalApiCounter.get + globalApiCounter.post + globalApiCounter.delete) / elapsed * 60).toFixed(1)
  };
};

// Функция для сброса счетчика
export const resetApiStats = () => {
  globalApiCounter.get = 0;
  globalApiCounter.post = 0;
  globalApiCounter.delete = 0;
  globalApiCounter.errors = 0;
  globalApiCounter.startTime = Date.now();
  console.log("🔄 API stats reset");
};

// Делаем функции доступными глобально для тестирования
if (typeof window !== 'undefined') {
  (window as any).getApiStats = getApiStats;
  (window as any).resetApiStats = resetApiStats;
  console.log("📊 API Monitoring enabled. Use window.getApiStats() to see stats or window.resetApiStats() to reset.");
}

export const syncFromServer = async (): Promise<GlobalData> => {
  const startTime = Date.now();
  try {
    globalApiCounter.get++;
    console.log(`🌐 API CALL #${globalApiCounter.get + globalApiCounter.post + globalApiCounter.delete} [GET]`, {
      url: SYNC_API_URL,
      timestamp: new Date().toLocaleTimeString()
    });
    
    const response = await fetch(SYNC_API_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const duration = Date.now() - startTime;
    
    console.log(`✅ GET completed in ${duration}ms`, {
      teachers: data.teachers?.length || 0,
      classes: data.classes?.length || 0,
      matches: data.matches?.length || 0
    });
    
    return {
      teachers: data.teachers || [],
      classes: data.classes || [],
      matches: data.matches || []
    };
  } catch (error) {
    globalApiCounter.errors++;
    console.error("❌ GET error:", error);
    throw error;
  }
};

export const syncToServer = async (data: {
  teacher?: Teacher;
  classes?: ClassRoom[];
  matches?: Match[];
  currentTeacher?: Teacher;
}): Promise<void> => {
  const startTime = Date.now();
  try {
    globalApiCounter.post++;
    console.log(`🌐 API CALL #${globalApiCounter.get + globalApiCounter.post + globalApiCounter.delete} [POST]`, {
      url: SYNC_API_URL,
      timestamp: new Date().toLocaleTimeString(),
      hasTeacher: !!data.teacher,
      classesCount: data.classes?.length ?? 0,
      matchesCount: data.matches?.length ?? 0,
      currentTeacher: data.currentTeacher?.name
    });
    
    const response = await fetch(SYNC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    const duration = Date.now() - startTime;
    console.log(`✅ POST completed in ${duration}ms`, result);
    
    // Выводим общую статистику каждые 10 вызовов
    const totalCalls = globalApiCounter.get + globalApiCounter.post + globalApiCounter.delete;
    if (totalCalls % 10 === 0) {
      console.log("📊 TOTAL API STATS:", getApiStats());
    }
  } catch (error) {
    globalApiCounter.errors++;
    console.error("❌ POST error:", error);
    throw error;
  }
};

export const deleteTeacherFromServer = async (teacherId: string): Promise<void> => {
  const startTime = Date.now();
  try {
    globalApiCounter.delete++;
    console.log(`🌐 API CALL #${globalApiCounter.get + globalApiCounter.post + globalApiCounter.delete} [DELETE]`, {
      url: SYNC_API_URL,
      timestamp: new Date().toLocaleTimeString(),
      teacherId
    });
    
    const response = await fetch(SYNC_API_URL, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ teacherId })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    const duration = Date.now() - startTime;
    console.log(`✅ DELETE completed in ${duration}ms`, result);
  } catch (error) {
    globalApiCounter.errors++;
    console.error("❌ DELETE error:", error);
    throw error;
  }
};