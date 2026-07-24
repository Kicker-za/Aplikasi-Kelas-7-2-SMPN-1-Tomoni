import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar, TabKey } from './components/Sidebar';
import { ToastNotification } from './components/ToastNotification';
import { NotificationDrawer } from './components/NotificationDrawer';

import { DashboardOverview } from './components/DashboardOverview';
import { ClassStructureDashboard } from './components/ClassStructureDashboard';
import { ClassActivityGallery } from './components/ClassActivityGallery';
import { SchoolDataEditor } from './components/SchoolDataEditor';
import { UserManagement } from './components/UserManagement';
import { SmartPickupNotification } from './components/SmartPickupNotification';
import { AttendanceManager } from './components/AttendanceManager';
import { FinancialManager } from './components/FinancialManager';
import { SecurityEncryptionManager } from './components/SecurityEncryptionManager';
import { ApiIntegrationsManager } from './components/ApiIntegrationsManager';
import { ParentAuthModal } from './components/ParentAuthModal';

import { useSimpatiStore } from './lib/store';

export default function App() {
  const store = useSimpatiStore();
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [isNotifDrawerOpen, setIsNotifDrawerOpen] = useState(false);
  const [isParentAuthOpen, setIsParentAuthOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('simpati_dark_mode');
    return saved !== null ? saved === 'true' : true;
  });

  // Dark Mode effect on html root element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('simpati_dark_mode', String(isDarkMode));
  }, [isDarkMode]);

  const handleToggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  const unreadPickupCount = store.students.filter(
    (s) => s.pickupStatus === 'sudah_pulang' || s.pickupStatus === 'menuju_sekolah'
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      {/* Top Navigation Header */}
      <Header
        school={store.profile}
        currentUser={store.currentUser}
        users={store.users}
        onSelectUser={store.setCurrentUser}
        notifications={store.notifications}
        onOpenNotifications={() => setIsNotifDrawerOpen(true)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={handleToggleDarkMode}
        lastSyncTime={store.lastSyncTime}
        onOpenParentAuth={() => setIsParentAuthOpen(true)}
        onNavigate={(tab) => setActiveTab(tab as any)}
      />

      {/* Main Layout Body */}
      <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)]">
        {/* Responsive Sidebar Navigation */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          unreadNotifCount={store.notifications.filter((n) => !n.read).length}
          unreadPickupCount={unreadPickupCount}
          onOpenParentAuth={() => setIsParentAuthOpen(true)}
        />

        {/* Dynamic Content View Area */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          {activeTab === 'overview' && (
            <DashboardOverview
              school={store.profile}
              students={store.students}
              attendance={store.attendance}
              financials={store.financials}
              users={store.users}
              auditLogs={store.auditLogs}
              onNavigate={setActiveTab}
              onOpenParentAuth={() => setIsParentAuthOpen(true)}
            />
          )}

          {activeTab === 'class_structure' && (
            <ClassStructureDashboard
              structure={store.classStructure}
              onUpdateMember={store.updateClassStructureMember}
              onAddMember={store.addClassStructureMember}
              onDeleteMember={store.deleteClassStructureMember}
            />
          )}

          {activeTab === 'class_documentation' && (
            <ClassActivityGallery
              activities={store.classActivities}
              onAddActivity={store.addClassActivity}
              onDeleteActivity={store.deleteClassActivity}
            />
          )}

          {activeTab === 'school_data' && (
            <SchoolDataEditor
              school={store.profile}
              onSave={store.updateSchoolProfile}
            />
          )}

          {activeTab === 'user_management' && (
            <UserManagement
              users={store.users}
              onAddUser={store.addUser}
              onUpdateUser={store.updateUser}
              onToggle2FA={store.toggle2FAForUser}
              onDeleteUser={store.deleteUser}
              onClearDummyUsers={store.clearDummyUsers}
            />
          )}

          {activeTab === 'smart_pickup' && (
            <SmartPickupNotification
              students={store.students}
              onUpdatePickupStatus={store.updateStudentPickupStatus}
            />
          )}

          {activeTab === 'attendance' && (
            <AttendanceManager
              students={store.students}
              attendance={store.attendance}
              profile={store.profile}
              onUpdateAttendance={store.setAttendance}
              showToast={store.showToast}
            />
          )}

          {activeTab === 'security_vault' && (
            <SecurityEncryptionManager
              security={store.security}
              currentUser={store.currentUser}
              auditLogs={store.auditLogs}
              onToggle2FA={store.toggle2FAForUser}
              showToast={store.showToast}
            />
          )}

          {activeTab === 'api_integrations' && (
            <ApiIntegrationsManager
              integrations={store.integrations}
              onSave={store.updateIntegrations}
              showToast={store.showToast}
            />
          )}
        </main>
      </div>

      {/* Notifications Drawer */}
      <NotificationDrawer
        isOpen={isNotifDrawerOpen}
        onClose={() => setIsNotifDrawerOpen(false)}
        notifications={store.notifications}
        onMarkAllRead={store.markNotificationsRead}
      />

      {/* Parent Auth Modal */}
      <ParentAuthModal
        isOpen={isParentAuthOpen}
        onClose={() => setIsParentAuthOpen(false)}
        users={store.users}
        students={store.students}
        currentUser={store.currentUser}
        onSelectUser={store.setCurrentUser}
        onAddUser={store.addUser}
        showToast={store.showToast}
      />

      {/* Real-time Toast Popup */}
      {store.toast && (
        <ToastNotification
          message={store.toast.message}
          type={store.toast.type}
          onClose={() => store.showToast('', 'info')}
        />
      )}
    </div>
  );
}
