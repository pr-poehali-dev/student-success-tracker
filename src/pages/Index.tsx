import { Login } from "@/components/Login";
import { AppHeader } from "@/components/app/AppHeader";
import { AppContent } from "@/components/app/AppContent";
import { useAppData } from "@/hooks/useAppData";

const Index = () => {
  const {
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
  } = useAppData();

  if (!isLoggedIn || !teacher) {
    return <Login onLogin={handleLogin} />;
  }

  const isAdmin = teacher.role === "admin";

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-accent/30">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <AppHeader
          teacher={teacher}
          isAdmin={isAdmin}
          onShowProfile={() => { setShowProfile(true); setShowAdmin(false); }}
          onShowAdmin={() => { setShowAdmin(true); setShowProfile(false); }}
          onForceSync={handleForceSync}
          onCreateBackup={handleCreateBackup}
          onRestoreBackup={handleRestoreBackup}
          onLogout={handleLogout}
        />

        <AppContent
          teacher={teacher}
          classes={classes}
          matches={matches}
          attendance={attendance}
          globalData={globalData}
          activeTab={activeTab}
          showProfile={showProfile}
          showAdmin={showAdmin}
          isAdmin={isAdmin}
          setClasses={setClasses}
          setMatches={setMatches}
          setAttendance={setAttendance}
          setActiveTab={setActiveTab}
          setShowProfile={setShowProfile}
          setShowAdmin={setShowAdmin}
          onTeacherUpdate={handleTeacherUpdate}
          onClearData={handleClearData}
          onUpdateTeacher={handleUpdateTeacher}
          onDeleteTeacher={handleDeleteTeacher}
          onDeleteClass={handleDeleteClass}
          onDeleteMatch={handleDeleteMatch}
          onDeleteStudent={handleDeleteStudent}
          onUpdateClass={handleUpdateClass}
          onCreateTeacher={handleCreateTeacher}
          onSaveChanges={handleSaveChanges}
        />
      </div>
    </div>
  );
};

export default Index;