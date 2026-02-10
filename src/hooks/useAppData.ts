import { useState, useEffect, useRef } from "react";
import { ClassRoom, Teacher, Match, AppState, GlobalData, AttendanceRecord } from "@/types";
import { saveAppState, loadAppState, clearAppState, createBackup, restoreFromBackup } from "@/utils/storage";
import { syncFromServer, syncToServer, deleteTeacherFromServer } from "@/utils/sync";
import { createWSClient, WSChange } from "@/utils/websocket";
import { toast } from "sonner";

export const useAppData = () => {
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [globalData, setGlobalData] = useState<GlobalData>({ teachers: [], classes: [], matches: [], attendance: [] });
  const [activeTab, setActiveTab] = useState("classes");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSyncInProgress, setIsSyncInProgress] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  
  // Счетчик вызовов для мониторинга
  const syncCounterRef = useRef({ get: 0, post: 0, delete: 0, lastReset: Date.now() });
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Отслеживание предыдущего состояния для определения удалений
  const prevClassesRef = useRef<ClassRoom[]>([]);
  const prevMatchesRef = useRef<Match[]>([]);
  
  // Флаг: пропустить следующую автосинхронизацию (используется при получении WS изменений)
  const skipNextAutoSyncRef = useRef(false);
  
  // WebSocket клиент
  const wsClientRef = useRef(createWSClient());

  useEffect(() => {
    const loadData = async () => {
      setIsSyncing(true);
      
      try {
        console.log("📥 GET: Loading data from server...");
        syncCounterRef.current.get++;
        const serverData = await syncFromServer();
        console.log("✅ GET: Data loaded successfully", {
          teachers: serverData.teachers.length,
          classes: serverData.classes.length,
          matches: serverData.matches.length,
          attendance: serverData.attendance?.length || 0
        });
        setGlobalData(serverData);
        
        const savedState = loadAppState();
        if (savedState?.teacher?.id) {
          const teacherStillExists = serverData.teachers.find(t => t.id === savedState.teacher.id);
          
          if (teacherStillExists) {
            let loginClasses: ClassRoom[] = [];
            let loginMatches: Match[] = [];
            
            if (savedState.teacher.role === "admin" || savedState.teacher.role === "teacher") {
              loginClasses = serverData.classes;
              loginMatches = serverData.matches;
            } else if (savedState.teacher.role === "junior") {
              loginClasses = serverData.classes.filter(
                cls => cls.responsibleTeacherId === savedState.teacher.id
              );
              loginMatches = serverData.matches.filter(m => m.createdBy === savedState.teacher.name);
            }
            
            setTeacher(savedState.teacher);
            setClasses(loginClasses);
            setMatches(loginMatches);
            setAttendance(serverData.attendance || []);
            setIsLoggedIn(true);
            
            // Инициализируем prev refs для отслеживания удалений
            prevClassesRef.current = [...loginClasses];
            prevMatchesRef.current = [...loginMatches];
            
            if (savedState.currentView === 'admin') {
              setShowAdmin(true);
            } else if (savedState.currentView === 'profile') {
              setShowProfile(true);
            }
            
            if (savedState.activeTab) {
              setActiveTab(savedState.activeTab);
            }
          } else {
            clearAppState();
            toast.error("Ваш аккаунт был удалён. Войдите снова");
          }
        }
      } catch (error) {
        console.error("Failed to sync from server on load", error);
        clearAppState();
        toast.error("Не удалось подключиться к серверу. Попробуйте позже");
      } finally {
        setIsSyncing(false);
      }
    };
    
    loadData();
  }, []);

  // WebSocket real-time синхронизация
  useEffect(() => {
    if (!isLoggedIn || !teacher) return;

    const wsClient = wsClientRef.current;
    
    // Обработчик входящих изменений от других пользователей
    wsClient.onChanges((changes: WSChange[]) => {
      console.log(`📥 [WS] Processing ${changes.length} changes`);
      
      changes.forEach((change) => {
        // Игнорируем свои собственные изменения
        if (change.author === teacher.name) return;
        
        console.log(`🔄 [WS] Applying change: ${change.type} from ${change.author}`);
        
        // Обрабатываем разные типы изменений
        if (change.type === 'data_updated') {
          // ОПТИМИЗАЦИЯ: используем данные ИЗ WebSocket, БЕЗ дополнительного GET запроса!
          // Данные уже пришли в change.data, не нужно делать syncFromServer()
          
          // КРИТИЧНО: устанавливаем флаг чтобы НЕ делать POST /sync после обновления данных
          skipNextAutoSyncRef.current = true;
          
          const wsData = change.data as { classes?: ClassRoom[], matches?: Match[], attendance?: AttendanceRecord[] };
          
          if (!wsData || typeof wsData !== 'object') {
            console.error("❌ [WS] Invalid data format:", change.data);
            return;
          }
          
          // Обновляем globalData с данными из WebSocket
          const updatedGlobalData = {
            teachers: globalData.teachers,
            classes: wsData.classes || globalData.classes,
            matches: wsData.matches || globalData.matches,
            attendance: wsData.attendance || globalData.attendance
          };
          setGlobalData(updatedGlobalData);
          
          // Для admin/teacher - получаем все данные
          if (teacher.role === "admin" || teacher.role === "teacher") {
            const currentClassIds = classes.map(c => c.id);
            const currentMatchIds = matches.map(m => m.id);
            
            // Берем новые данные из WS которых нет локально
            const newClasses = (wsData.classes || []).filter(c => !currentClassIds.includes(c.id));
            const newMatches = (wsData.matches || []).filter(m => !currentMatchIds.includes(m.id));
            
            if (newClasses.length > 0) {
              console.log(`📥 [WS] Adding ${newClasses.length} new classes`);
              setClasses(prev => [...prev, ...newClasses]);
              prevClassesRef.current = [...classes, ...newClasses];
            }
            
            if (newMatches.length > 0) {
              console.log(`📥 [WS] Adding ${newMatches.length} new matches`);
              setMatches(prev => [...prev, ...newMatches]);
              prevMatchesRef.current = [...matches, ...newMatches];
            }
          } else if (teacher.role === "junior") {
            // Junior - фильтруем только свои данные
            const juniorClasses = (wsData.classes || []).filter(
              cls => cls.responsibleTeacherId === teacher.id
            );
            const juniorMatches = (wsData.matches || []).filter(m => m.createdBy === teacher.name);
            
            setClasses(juniorClasses);
            setMatches(juniorMatches);
            prevClassesRef.current = [...juniorClasses];
            prevMatchesRef.current = [...juniorMatches];
          }
          
          if (wsData.attendance) {
            setAttendance(wsData.attendance);
          }
          
          console.log("✅ [WS] Data updated from WebSocket (NO GET request, skipping auto-sync POST)");
        }
      });
    });
    
    // Подключаемся к WebSocket
    wsClient.connect();
    console.log("🔌 [WS] Connected to real-time sync");
    
    return () => {
      wsClient.disconnect();
      console.log("🔌 [WS] Disconnected");
    };
  }, [isLoggedIn, teacher, classes, matches]);

  useEffect(() => {
    if (!teacher || !isLoggedIn || isSyncing) return;

    const currentView = showAdmin ? 'admin' : showProfile ? 'profile' : 'main';
    const state: AppState = { 
      teacher, 
      classes, 
      matches,
      attendance,
      currentView,
      activeTab
    };
    saveAppState(state);
  }, [teacher, classes, matches, attendance, isLoggedIn, isSyncing, showAdmin, showProfile, activeTab]);

  useEffect(() => {
    if (!teacher || !isLoggedIn || isSyncing || isSyncInProgress) return;

    // Очищаем предыдущий таймер debounce
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Откладываем синхронизацию на 10 секунд (было 3, увеличено для снижения нагрузки)
    debounceTimerRef.current = setTimeout(() => {
      // Проверяем флаг: если нужно пропустить автосинхронизацию (данные пришли через WS)
      if (skipNextAutoSyncRef.current) {
        console.log("⏭️ [SKIP] Skipping auto-sync (data received via WebSocket)");
        skipNextAutoSyncRef.current = false; // Сбрасываем флаг
        return;
      }
      let updatedGlobalClasses: ClassRoom[];
      let updatedGlobalMatches: Match[];

      // INCREMENTAL UPDATE для ВСЕХ ролей (admin, teacher, junior)
      // Определяем удаленные классы (были в prev, нет в current)
      const prevClassIds = prevClassesRef.current.map(c => c.id);
      const currentClassIds = classes.map(c => c.id);
      const deletedClassIds = prevClassIds.filter(id => !currentClassIds.includes(id));
      
      // Определяем удаленные матчи
      const prevMatchIds = prevMatchesRef.current.map(m => m.id);
      const currentMatchIds = matches.map(m => m.id);
      const deletedMatchIds = prevMatchIds.filter(id => !currentMatchIds.includes(id));
      
      if (teacher.role === "junior") {
        // Junior: берем классы других учителей И удаляем те, что junior удалил
        const otherClasses = globalData.classes.filter(c => 
          !currentClassIds.includes(c.id) && !deletedClassIds.includes(c.id)
        );
        updatedGlobalClasses = [...otherClasses, ...classes];

        // Берем матчи других учителей И удаляем те, что junior удалил
        const otherMatches = globalData.matches.filter(m => 
          !currentMatchIds.includes(m.id) && !deletedMatchIds.includes(m.id)
        );
        updatedGlobalMatches = [...otherMatches, ...matches];
      } else {
        // Admin/Teacher: мерджим с существующими данными из globalData
        // Берем классы которые НЕ в current (другие учителя создали) И НЕ удалены текущим пользователем
        const otherClasses = globalData.classes.filter(c => 
          !currentClassIds.includes(c.id) && !deletedClassIds.includes(c.id)
        );
        updatedGlobalClasses = [...otherClasses, ...classes];

        // Берем матчи которые НЕ в current (другие учителя создали) И НЕ удалены текущим пользователем
        const otherMatches = globalData.matches.filter(m => 
          !currentMatchIds.includes(m.id) && !deletedMatchIds.includes(m.id)
        );
        updatedGlobalMatches = [...otherMatches, ...matches];
      }
      
      // Обновляем prev refs для следующего сравнения (нужно делать ДО проверки изменений!)
      prevClassesRef.current = [...classes];
      prevMatchesRef.current = [...matches];

      const hasClassChanges = JSON.stringify(globalData.classes) !== JSON.stringify(updatedGlobalClasses);
      const hasMatchChanges = JSON.stringify(globalData.matches) !== JSON.stringify(updatedGlobalMatches);
      const hasAttendanceChanges = JSON.stringify(globalData.attendance) !== JSON.stringify(attendance);

      console.log("🔍 [DEBUG] Checking for changes:", {
        hasClassChanges,
        hasMatchChanges,
        hasAttendanceChanges,
        currentGlobalClasses: globalData.classes.map(c => c.id),
        updatedGlobalClasses: updatedGlobalClasses.map(c => c.id),
        currentGlobalMatches: globalData.matches.map(m => m.id),
        updatedGlobalMatches: updatedGlobalMatches.map(m => m.id),
        currentAttendance: globalData.attendance.length,
        updatedAttendance: attendance.length
      });

      if (hasClassChanges || hasMatchChanges || hasAttendanceChanges) {
        // Мониторинг: логируем попытку синхронизации
        const now = Date.now();
        if (now - syncCounterRef.current.lastReset > 60000) {
          console.log("📊 SYNC STATS (last minute):", {
            GET: syncCounterRef.current.get,
            POST: syncCounterRef.current.post,
            DELETE: syncCounterRef.current.delete,
            TOTAL: syncCounterRef.current.get + syncCounterRef.current.post + syncCounterRef.current.delete
          });
          syncCounterRef.current = { get: 0, post: 0, delete: 0, lastReset: now };
        }
        
        console.log("🔄 [DEBOUNCED] Auto-syncing to server:", {
          classesCount: updatedGlobalClasses.length,
          matchesCount: updatedGlobalMatches.length,
          attendanceCount: attendance.length,
          hasClassChanges,
          hasMatchChanges,
          hasAttendanceChanges,
          timestamp: new Date().toLocaleTimeString(),
          classIds: updatedGlobalClasses.map(c => c.id),
          matchIds: updatedGlobalMatches.map(m => m.id)
        });
        
        // Устанавливаем флаг "идет синхронизация"
        setIsSyncInProgress(true);
        toast.loading("Сохранение данных...", { id: 'sync-toast' });
        syncCounterRef.current.post++;
        
        syncToServer({
          classes: updatedGlobalClasses,
          matches: updatedGlobalMatches,
          attendance: attendance,
          currentTeacher: teacher
        }).then(() => {
          console.log("✅ Auto-sync completed successfully");
          
          // Обновляем globalData только ПОСЛЕ успешной синхронизации с сервером
          const existingTeacherIndex = globalData.teachers.findIndex(t => t.id === teacher.id);
          const updatedTeachers = existingTeacherIndex >= 0
            ? globalData.teachers.map(t => t.id === teacher.id ? teacher : t)
            : [...globalData.teachers, teacher];

          const newGlobalData: GlobalData = {
            teachers: updatedTeachers,
            classes: updatedGlobalClasses,
            matches: updatedGlobalMatches,
            attendance: attendance
          };
          setGlobalData(newGlobalData);
          
          // Отправляем уведомление через WebSocket о том что данные обновлены
          // ОПТИМИЗАЦИЯ: отправляем ПОЛНЫЕ данные, чтобы другие клиенты НЕ делали GET запрос
          const wsClient = wsClientRef.current;
          wsClient.sendChange('data_updated', {
            classes: updatedGlobalClasses,
            matches: updatedGlobalMatches,
            attendance: attendance
          }, teacher.name).catch(err => {
            console.error("❌ [WS] Failed to broadcast change:", err);
          });
          
          toast.success("Данные сохранены", { id: 'sync-toast' });
        }).catch(error => {
          console.error("❌ Failed to auto-sync to server", error);
          toast.error("Ошибка синхронизации с сервером", { id: 'sync-toast' });
        }).finally(() => {
          setIsSyncInProgress(false);
        });
      }
    }, 10000); // Debounce 10 секунд (было 3, увеличено для снижения нагрузки на DB)

    // Cleanup функция для очистки таймера
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [teacher, classes, matches, attendance, isLoggedIn, isSyncing, isSyncInProgress, globalData.classes, globalData.matches, globalData.teachers]);

  const handleLogin = async (loggedInTeacher: Teacher) => {
    setTeacher(loggedInTeacher);
    setIsLoggedIn(true);

    try {
      console.log("📥 GET: Login - loading data from server...");
      syncCounterRef.current.get++;
      const serverData = await syncFromServer();
      console.log("✅ GET: Login data loaded");
      setGlobalData(serverData);
      
      let loginClasses: ClassRoom[] = [];
      let loginMatches: Match[] = [];
      
      if (loggedInTeacher.role === "admin" || loggedInTeacher.role === "teacher") {
        loginClasses = serverData.classes;
        loginMatches = serverData.matches;
      } else if (loggedInTeacher.role === "junior") {
        loginClasses = serverData.classes.filter(
          cls => cls.responsibleTeacherId === loggedInTeacher.id
        );
        loginMatches = serverData.matches.filter(m => m.createdBy === loggedInTeacher.name);
      }
      
      setClasses(loginClasses);
      setMatches(loginMatches);
      setAttendance(serverData.attendance || []);
      
      // Инициализируем prev refs для отслеживания удалений
      prevClassesRef.current = [...loginClasses];
      prevMatchesRef.current = [...loginMatches];
      
      const state: AppState = {
        teacher: loggedInTeacher,
        classes: loginClasses,
        matches: loginMatches,
        attendance: serverData.attendance || []
      };
      saveAppState(state);
      
      toast.success("Вход выполнен успешно");
    } catch (error) {
      console.error("Failed to sync on login", error);
      setIsLoggedIn(false);
      setTeacher(null);
      toast.error("Не удалось подключиться к серверу");
    }
  };

  const handleLogout = () => {
    if (confirm("Вы уверены, что хотите выйти? Данные сохранены.")) {
      setIsLoggedIn(false);
      setTeacher(null);
    }
  };

  const handleTeacherUpdate = (updatedTeacher: Teacher) => {
    setTeacher(updatedTeacher);
  };

  const handleClearData = () => {
    clearAppState();
    setClasses([]);
    setMatches([]);
  };

  const handleUpdateTeacher = async (updatedTeacher: Teacher) => {
    const updatedTeachers = globalData.teachers.map(t => 
      t.id === updatedTeacher.id ? updatedTeacher : t
    );
    const newGlobalData = { ...globalData, teachers: updatedTeachers };
    setGlobalData(newGlobalData);
    
    if (teacher?.id === updatedTeacher.id) {
      setTeacher(updatedTeacher);
      const state: AppState = {
        teacher: updatedTeacher,
        classes,
        matches
      };
      saveAppState(state);
    }

    try {
      console.log("🔄 POST: Updating teacher...");
      syncCounterRef.current.post++;
      await syncToServer({ teacher: updatedTeacher });
      console.log("✅ POST: Teacher updated");
      toast.success("Данные синхронизированы с сервером");
    } catch (error) {
      console.error("❌ POST: Failed to sync teacher to server", error);
      toast.error("Ошибка синхронизации с сервером");
    }
  };

  const handleDeleteTeacher = async (teacherId: string) => {
    const updatedTeachers = globalData.teachers.filter(t => t.id !== teacherId);
    const newGlobalData = { ...globalData, teachers: updatedTeachers };
    setGlobalData(newGlobalData);
    
    try {
      console.log("🗑️ DELETE: Deleting teacher...");
      syncCounterRef.current.delete++;
      await deleteTeacherFromServer(teacherId);
      console.log("✅ DELETE: Teacher deleted");
      toast.success("Учитель удалён");
    } catch (error) {
      console.error("❌ DELETE: Failed to delete teacher from server", error);
      toast.error("Ошибка удаления с сервера");
    }
  };

  const handleDeleteClass = async (classId: string) => {
    console.log("🗑️ handleDeleteClass called:", { classId, classesCount: classes.length, globalClassesCount: globalData.classes.length });
    
    const updatedClasses = classes.filter(c => c.id !== classId);
    setClasses(updatedClasses);
    
    // Обновляем globalData напрямую и синхронизируем сразу
    const updatedGlobalClasses = globalData.classes.filter(c => c.id !== classId);
    const newGlobalData = { ...globalData, classes: updatedGlobalClasses };
    setGlobalData(newGlobalData);
    
    // Синхронизируем сразу без debounce
    try {
      if (!teacher) {
        console.error("❌ DELETE: No teacher found");
        toast.error("Ошибка: учитель не авторизован");
        return;
      }
      
      console.log("🔄 DELETE: Syncing class deletion to server...", {
        updatedClassesCount: updatedGlobalClasses.length,
        teacherName: teacher.name
      });
      
      await syncToServer({
        classes: updatedGlobalClasses,
        matches: globalData.matches,
        attendance: attendance,
        currentTeacher: teacher
      });
      console.log("✅ DELETE: Class deletion synced");
      toast.success("Класс удалён");
    } catch (error) {
      console.error("❌ DELETE: Failed to sync class deletion", error);
      toast.error("Ошибка удаления класса");
    }
  };

  const handleDeleteMatch = async (matchId: string) => {
    console.log("🗑️ handleDeleteMatch called:", { matchId, matchesCount: matches.length, globalMatchesCount: globalData.matches.length });
    
    const updatedMatches = matches.filter(m => m.id !== matchId);
    setMatches(updatedMatches);
    
    // Обновляем globalData напрямую и синхронизируем сразу
    const updatedGlobalMatches = globalData.matches.filter(m => m.id !== matchId);
    const newGlobalData = { ...globalData, matches: updatedGlobalMatches };
    setGlobalData(newGlobalData);
    
    // Синхронизируем сразу без debounce
    try {
      if (!teacher) {
        console.error("❌ DELETE: No teacher found");
        toast.error("Ошибка: учитель не авторизован");
        return;
      }
      
      console.log("🔄 DELETE: Syncing match deletion to server...", {
        updatedMatchesCount: updatedGlobalMatches.length,
        teacherName: teacher.name
      });
      
      await syncToServer({
        teacher: teacher,
        classes: globalData.classes,
        matches: updatedGlobalMatches
      });
      console.log("✅ DELETE: Match deletion synced");
      toast.success("Матч удалён");
    } catch (error) {
      console.error("❌ DELETE: Failed to sync match deletion", error);
      toast.error("Ошибка удаления матча");
    }
  };

  const handleDeleteStudent = async (classId: string, studentId: string) => {
    console.log("🗑️ handleDeleteStudent called:", { classId, studentId, classesCount: classes.length });
    
    const updatedClasses = classes.map(cls => 
      cls.id === classId 
        ? { ...cls, students: cls.students.filter(s => s.id !== studentId) }
        : cls
    );
    setClasses(updatedClasses);
    
    // Обновляем globalData напрямую и синхронизируем сразу
    const updatedGlobalClasses = globalData.classes.map(cls => 
      cls.id === classId 
        ? { ...cls, students: cls.students.filter(s => s.id !== studentId) }
        : cls
    );
    const newGlobalData = { ...globalData, classes: updatedGlobalClasses };
    setGlobalData(newGlobalData);
    
    // Синхронизируем сразу без debounce
    try {
      if (!teacher) {
        console.error("❌ DELETE: No teacher found");
        toast.error("Ошибка: учитель не авторизован");
        return;
      }
      
      console.log("🔄 DELETE: Syncing student deletion to server...", {
        updatedClassesCount: updatedGlobalClasses.length,
        teacherName: teacher.name
      });
      
      await syncToServer({
        classes: updatedGlobalClasses,
        matches: globalData.matches,
        attendance: attendance,
        currentTeacher: teacher
      });
      console.log("✅ DELETE: Student deletion synced");
      toast.success("Ученик удален");
    } catch (error) {
      console.error("❌ DELETE: Failed to sync student deletion", error);
      toast.error("Ошибка удаления ученика");
    }
  };

  const handleUpdateClass = async (updatedClass: ClassRoom) => {
    const updatedClasses = classes.map(c => 
      c.id === updatedClass.id ? updatedClass : c
    );
    setClasses(updatedClasses);
  };

  const handleCreateTeacher = async (newTeacher: Teacher) => {
    const updatedTeachers = [...globalData.teachers, newTeacher];
    const newGlobalData = { ...globalData, teachers: updatedTeachers };
    setGlobalData(newGlobalData);
    
    try {
      await syncToServer({ teacher: newTeacher });
    } catch (error) {
      console.error("Failed to sync new teacher to server", error);
      toast.error("Не удалось синхронизировать нового учителя");
    }
  };

  const handleSaveChanges = async () => {
    if (!teacher) {
      toast.error("Ошибка: учитель не авторизован");
      return;
    }

    try {
      toast.loading("Сохранение изменений...", { id: 'save-toast' });
      
      let updatedGlobalClasses: ClassRoom[];
      let updatedGlobalMatches: Match[];

      if (teacher.role === "junior") {
        const prevClassIds = prevClassesRef.current.map(c => c.id);
        const currentClassIds = classes.map(c => c.id);
        const deletedClassIds = prevClassIds.filter(id => !currentClassIds.includes(id));
        
        const prevMatchIds = prevMatchesRef.current.map(m => m.id);
        const currentMatchIds = matches.map(m => m.id);
        const deletedMatchIds = prevMatchIds.filter(id => !currentMatchIds.includes(id));
        
        const otherClasses = globalData.classes.filter(c => 
          !currentClassIds.includes(c.id) && !deletedClassIds.includes(c.id)
        );
        updatedGlobalClasses = [...otherClasses, ...classes];

        const otherMatches = globalData.matches.filter(m => 
          !currentMatchIds.includes(m.id) && !deletedMatchIds.includes(m.id)
        );
        updatedGlobalMatches = [...otherMatches, ...matches];
        
        prevClassesRef.current = [...classes];
        prevMatchesRef.current = [...matches];
      } else {
        updatedGlobalClasses = classes;
        updatedGlobalMatches = matches;
      }

      await syncToServer({
        classes: updatedGlobalClasses,
        matches: updatedGlobalMatches,
        attendance: attendance,
        currentTeacher: teacher
      });
      
      setGlobalData({
        ...globalData,
        classes: updatedGlobalClasses,
        matches: updatedGlobalMatches,
        attendance: attendance
      });
      
      toast.success("Изменения успешно сохранены", { id: 'save-toast' });
    } catch (error) {
      console.error("Failed to save changes", error);
      toast.error("Ошибка сохранения изменений", { id: 'save-toast' });
    }
  };

  const handleForceSync = async () => {
    try {
      toast.info("Синхронизация...");
      const serverData = await syncFromServer();
      setGlobalData(serverData);
      
      let loginClasses: ClassRoom[] = [];
      let loginMatches: Match[] = [];
      
      if (teacher?.role === "admin" || teacher?.role === "teacher") {
        loginClasses = serverData.classes;
        loginMatches = serverData.matches;
      } else if (teacher?.role === "junior") {
        loginClasses = serverData.classes.filter(
          cls => cls.responsibleTeacherId === teacher.id
        );
        loginMatches = serverData.matches.filter(m => m.createdBy === teacher.name);
      }
      
      setClasses(loginClasses);
      setMatches(loginMatches);
      setAttendance(serverData.attendance || []);
      
      // Обновляем prev refs после принудительной синхронизации
      prevClassesRef.current = [...loginClasses];
      prevMatchesRef.current = [...loginMatches];
      
      const state: AppState = {
        teacher: teacher!,
        classes: loginClasses,
        matches: loginMatches,
        attendance: serverData.attendance || []
      };
      saveAppState(state);
      
      toast.success("Данные успешно синхронизированы");
    } catch (error) {
      console.error("Failed to force sync", error);
      toast.error("Ошибка синхронизации с сервером");
    }
  };

  const handleCreateBackup = () => {
    if (!teacher || !isLoggedIn) {
      toast.error("Войдите в систему для создания бекапа");
      return;
    }
    
    try {
      const state: AppState = {
        teacher,
        classes,
        matches,
        attendance,
        currentView: showAdmin ? 'admin' : showProfile ? 'profile' : 'main',
        activeTab
      };
      createBackup(state);
      toast.success("Бекап создан и скачан!");
    } catch (error) {
      console.error("Backup creation failed:", error);
      toast.error("Ошибка при создании бекапа");
    }
  };

  const handleRestoreBackup = async (file: File) => {
    if (!teacher || !isLoggedIn) {
      toast.error("Войдите в систему для восстановления бекапа");
      return;
    }

    try {
      const restoredState = await restoreFromBackup(file);
      
      setClasses(restoredState.classes);
      setMatches(restoredState.matches);
      setAttendance(restoredState.attendance || []);
      
      prevClassesRef.current = [...restoredState.classes];
      prevMatchesRef.current = [...restoredState.matches];
      
      toast.success("Данные восстановлены из бекапа!");
    } catch (error) {
      console.error("Backup restore failed:", error);
      toast.error("Ошибка при восстановлении бекапа");
    }
  };

  return {
    teacher,
    classes,
    matches,
    attendance,
    globalData,
    activeTab,
    isLoggedIn,
    showProfile,
    showAdmin,
    setClasses,
    setMatches,
    setAttendance,
    setActiveTab,
    setShowProfile,
    setShowAdmin,
    handleLogin,
    handleLogout,
    handleTeacherUpdate,
    handleClearData,
    handleUpdateTeacher,
    handleDeleteTeacher,
    handleDeleteClass,
    handleDeleteMatch,
    handleDeleteStudent,
    handleUpdateClass,
    handleCreateTeacher,
    handleForceSync,
    handleSaveChanges,
    handleCreateBackup,
    handleRestoreBackup,
    handleRestoreBackup,
  };
};