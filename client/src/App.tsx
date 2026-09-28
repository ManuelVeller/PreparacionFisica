import React, { useState, useEffect } from 'react';
import { User } from './types';
import { StorageService } from './services/storageService';
import { LoginModal } from './components/auth/LoginModal';
import { CoachDashboard } from './components/coach/CoachDashboard';
import { StudentDashboard } from './components/student/StudentDashboard';

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Initialize default exercises, routines and students
    StorageService.init();

    // Check saved session
    const savedUser = StorageService.getCurrentUser();
    if (savedUser) {
      setCurrentUser(savedUser);
    }
    setIsReady(true);
  }, []);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    StorageService.setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    StorageService.setCurrentUser(null);
  };

  const handleSwitchRole = () => {
    if (!currentUser) return;
    const newRole = currentUser.role === 'profe' ? 'alumno' : 'profe';
    const updatedUser: User = {
      ...currentUser,
      role: newRole,
      name: newRole === 'profe' ? 'Prof. Alejandro Gómez' : 'Martina Rossi',
      id: newRole === 'profe' ? 'coach-main' : 'student-1'
    };
    setCurrentUser(updatedUser);
    StorageService.setCurrentUser(updatedUser);
  };

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 text-sm">
        Cargando EduFísica...
      </div>
    );
  }

  if (!currentUser) {
    return <LoginModal onLoginSuccess={handleLoginSuccess} />;
  }

  return currentUser.role === 'profe' ? (
    <CoachDashboard
      user={currentUser}
      onLogout={handleLogout}
      onSwitchRole={handleSwitchRole}
    />
  ) : (
    <StudentDashboard
      user={currentUser}
      onLogout={handleLogout}
      onSwitchRole={handleSwitchRole}
    />
  );
};

export default App;
