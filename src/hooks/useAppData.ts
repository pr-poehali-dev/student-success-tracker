import { useState, useEffect } from "react";
import { ClassRoom, Teacher, Match, AppState, GlobalData } from "@/types";
import { saveAppState, loadAppState, clearAppState, saveGlobalData, loadGlobalData } from "@/utils/storage";
import { syncFromServer, syncToServer, deleteTeacherFromServer } from "@/utils/sync";
import { toast } from "sonner";

export const useAppData = () => {
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [globalData, setGlobalData] = useState<GlobalData>({ teachers: [], classes: [], matches: [] });
  const [activeTab, setActiveTab] = useState("classes");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setIsSyncing(true);
      
      try {
        const serverData = await syncFromServer();
        
        saveGlobalData(serverData);
        setGlobalData(serverData);
        
        const savedState = loadAppState();
        if (savedState?.teacher?.id) {
          const teacherStillExists = serverData.teachers.find(t => t.id === savedState.teacher.id);
          
          if (teacherStillExists) {
            setTeacher(savedState.teacher);
            setClasses(savedState.classes);
            setMatches(savedState.matches);
            setIsLoggedIn(true);
            
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
        
        const loadedGlobalData = loadGlobalData();
        setGlobalData(loadedGlobalData);
        
        const savedState = loadAppState();
        if (savedState?.teacher?.id) {
          setTeacher(savedState.teacher);
          setClasses(savedState.classes);
          setMatches(savedState.matches);
          setIsLoggedIn(true);
          
          if (savedState.currentView === 'admin') {
            setShowAdmin(true);
          } else if (savedState.currentView === 'profile') {
            setShowProfile(true);
          }
          
          if (savedState.activeTab) {
            setActiveTab(savedState.activeTab);
          }
        }
        
        toast.error("Не удалось синхронизироваться с сервером. Работа в оффлайн режиме");
      } finally {
        setIsSyncing(false);
      }
    };
    
    loadData();
  }, []);

  useEffect(() => {
    if (!teacher || !isLoggedIn || isSyncing) return;

    const currentView = showAdmin ? 'admin' : showProfile ? 'profile' : 'main';
    const state: AppState = { 
      teacher, 
      classes, 
      matches,
      currentView,
      activeTab
    };
    saveAppState(state);
  }, [teacher, classes, matches, isLoggedIn, isSyncing, showAdmin, showProfile, activeTab]);

  useEffect(() => {
    if (!teacher || !isLoggedIn || isSyncing) return;

    const existingTeacherIndex = globalData.teachers.findIndex(t => t.id === teacher.id);
    const updatedTeachers = existingTeacherIndex >= 0
      ? globalData.teachers.map(t => t.id === teacher.id ? teacher : t)
      : [...globalData.teachers, teacher];

    let updatedGlobalClasses = globalData.classes;
    let updatedGlobalMatches = globalData.matches;

    if (teacher.role === "junior") {
      const myClassIds = classes.map(c => c.id);
      const otherClasses = globalData.classes.filter(c => !myClassIds.includes(c.id));
      updatedGlobalClasses = [...otherClasses, ...classes];

      const myMatchIds = matches.map(m => m.id);
      const otherMatches = globalData.matches.filter(m => !myMatchIds.includes(m.id));
      updatedGlobalMatches = [...otherMatches, ...matches];
    } else if (teacher.role === "admin" || teacher.role === "teacher") {
      updatedGlobalClasses = classes;
      updatedGlobalMatches = matches;
    }

    const newGlobalData: GlobalData = {
      teachers: updatedTeachers,
      classes: updatedGlobalClasses,
      matches: updatedGlobalMatches
    };

    const hasChanges = 
      JSON.stringify(globalData.teachers) !== JSON.stringify(updatedTeachers) ||
      JSON.stringify(globalData.classes) !== JSON.stringify(updatedGlobalClasses) ||
      JSON.stringify(globalData.matches) !== JSON.stringify(updatedGlobalMatches);

    if (hasChanges) {
      setGlobalData(newGlobalData);
      saveGlobalData(newGlobalData);
    }
  }, [teacher, classes, matches, isLoggedIn, isSyncing]);

  const handleLogin = async (loggedInTeacher: Teacher) => {
    setTeacher(loggedInTeacher);
    setIsLoggedIn(true);

    try {
      const serverData = await syncFromServer();
      saveGlobalData(serverData);
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
      
      const state: AppState = {
        teacher: loggedInTeacher,
        classes: loginClasses,
        matches: loginMatches
      };
      saveAppState(state);
      
      toast.success("Данные синхронизированы с сервером");
    } catch (error) {
      console.error("Failed to sync on login", error);
      
      const loadedGlobalData = loadGlobalData();
      let loginClasses: ClassRoom[] = [];
      let loginMatches: Match[] = [];
      
      if (loggedInTeacher.role === "admin" || loggedInTeacher.role === "teacher") {
        loginClasses = loadedGlobalData.classes;
        loginMatches = loadedGlobalData.matches;
      } else if (loggedInTeacher.role === "junior") {
        loginClasses = loadedGlobalData.classes.filter(
          cls => cls.responsibleTeacherId === loggedInTeacher.id
        );
        loginMatches = loadedGlobalData.matches.filter(m => m.createdBy === loggedInTeacher.name);
      }
      
      setClasses(loginClasses);
      setMatches(loginMatches);
      
      const state: AppState = {
        teacher: loggedInTeacher,
        classes: loginClasses,
        matches: loginMatches
      };
      saveAppState(state);
      
      toast.warning("Работа в оффлайн режиме");
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
    saveGlobalData(newGlobalData);
    
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
      await syncToServer({ teacher: updatedTeacher });
      toast.success("Данные синхронизированы с сервером");
    } catch (error) {
      console.error("Failed to sync teacher to server", error);
      toast.error("Ошибка синхронизации с сервером");
    }
  };

  const handleDeleteTeacher = async (teacherId: string) => {
    const updatedTeachers = globalData.teachers.filter(t => t.id !== teacherId);
    const newGlobalData = { ...globalData, teachers: updatedTeachers };
    setGlobalData(newGlobalData);
    saveGlobalData(newGlobalData);
    
    try {
      await deleteTeacherFromServer(teacherId);
      toast.success("Учитель удалён");
    } catch (error) {
      console.error("Failed to delete teacher from server", error);
      toast.error("Ошибка удаления с сервера");
    }
  };

  const handleDeleteClass = async (classId: string) => {
    const updatedClasses = globalData.classes.filter(c => c.id !== classId);
    const newGlobalData = { ...globalData, classes: updatedClasses };
    setGlobalData(newGlobalData);
    saveGlobalData(newGlobalData);
    setClasses(updatedClasses);
    
    try {
      await syncToServer({ classes: updatedClasses });
      toast.success("Класс удалён и синхронизирован");
    } catch (error) {
      console.error("Failed to sync class deletion to server", error);
      toast.error("Ошибка синхронизации с сервером");
    }
  };

  const handleDeleteMatch = async (matchId: string) => {
    const updatedMatches = globalData.matches.filter(m => m.id !== matchId);
    const newGlobalData = { ...globalData, matches: updatedMatches };
    setGlobalData(newGlobalData);
    saveGlobalData(newGlobalData);
    setMatches(updatedMatches);
    
    try {
      await syncToServer({ matches: updatedMatches });
      toast.success("Матч удалён и синхронизирован");
    } catch (error) {
      console.error("Failed to sync match deletion to server", error);
      toast.error("Ошибка синхронизации с сервером");
    }
  };

  const handleUpdateClass = async (updatedClass: ClassRoom) => {
    const updatedClasses = globalData.classes.map(c => 
      c.id === updatedClass.id ? updatedClass : c
    );
    const newGlobalData = { ...globalData, classes: updatedClasses };
    setGlobalData(newGlobalData);
    saveGlobalData(newGlobalData);
    setClasses(updatedClasses);
    
    try {
      await syncToServer({ classes: updatedClasses });
      toast.success("Класс обновлён и синхронизирован");
    } catch (error) {
      console.error("Failed to sync class update to server", error);
      toast.error("Ошибка синхронизации с сервером");
    }
  };

  const handleCreateTeacher = async (newTeacher: Teacher) => {
    const updatedTeachers = [...globalData.teachers, newTeacher];
    const newGlobalData = { ...globalData, teachers: updatedTeachers };
    setGlobalData(newGlobalData);
    saveGlobalData(newGlobalData);
    
    try {
      await syncToServer({ teacher: newTeacher });
    } catch (error) {
      console.error("Failed to sync new teacher to server", error);
      toast.error("Не удалось синхронизировать нового учителя");
    }
  };

  const handleForceSync = async () => {
    try {
      toast.info("Синхронизация...");
      const serverData = await syncFromServer();
      saveGlobalData(serverData);
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
      
      const state: AppState = {
        teacher: teacher!,
        classes: loginClasses,
        matches: loginMatches
      };
      saveAppState(state);
      
      toast.success("Данные успешно синхронизированы");
    } catch (error) {
      console.error("Failed to force sync", error);
      toast.error("Ошибка синхронизации с сервером");
    }
  };

  return {
    teacher,
    classes,
    matches,
    globalData,
    activeTab,
    isLoggedIn,
    showProfile,
    showAdmin,
    setClasses,
    setMatches,
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
    handleUpdateClass,
    handleCreateTeacher,
    handleForceSync,
  };
};
