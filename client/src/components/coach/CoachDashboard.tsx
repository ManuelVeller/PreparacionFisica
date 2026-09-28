import React, { useState, useEffect } from 'react';
import { User, Student, Routine, Exercise } from '../../types';
import { StorageService } from '../../services/storageService';
import { CoachSidebar, CoachTab } from './CoachSidebar';
import { StudentList } from './StudentList';
import { CoachCalendarView } from './CoachCalendarView';
import { RoutinePlanner } from './RoutinePlanner';
import { PaperRoutineScanner } from './PaperRoutineScanner';
import { MultimediaLibrary } from './MultimediaLibrary';

interface CoachDashboardProps {
  user: User;
  onLogout: () => void;
  onSwitchRole: () => void;
}

export const CoachDashboard: React.FC<CoachDashboardProps> = ({
  user,
  onLogout,
  onSwitchRole
}) => {
  const [activeTab, setActiveTab] = useState<CoachTab>('calendar');
  const [students, setStudents] = useState<Student[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);

  // Navigation state for planner preselection
  const [preselectedStudentId, setPreselectedStudentId] = useState<string | undefined>();
  const [preselectedDate, setPreselectedDate] = useState<string | undefined>();

  const loadData = () => {
    setStudents(StorageService.getStudents());
    setRoutines(StorageService.getRoutines());
    setExercises(StorageService.getExercises());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectStudentForPlan = (student: Student) => {
    setPreselectedStudentId(student.id);
    setPreselectedDate('2026-09-28');
    setActiveTab('planner');
  };

  const handleSelectDateToPlan = (dateStr: string, studentId?: string) => {
    setPreselectedDate(dateStr);
    if (studentId) setPreselectedStudentId(studentId);
    setActiveTab('planner');
  };

  return (
    <div className="flex min-h-screen bg-slate-50/60 font-sans text-slate-800">
      {/* Fixed Left Sidebar */}
      <CoachSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        user={user}
        onLogout={onLogout}
        onSwitchRole={onSwitchRole}
      />

      {/* Main Dynamic View */}
      <main className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
        {activeTab === 'students' && (
          <StudentList
            students={students}
            onSelectStudentForPlan={handleSelectStudentForPlan}
            onRefresh={loadData}
          />
        )}

        {activeTab === 'calendar' && (
          <CoachCalendarView
            routines={routines}
            students={students}
            onSelectDateToPlan={handleSelectDateToPlan}
            onRefresh={loadData}
          />
        )}

        {activeTab === 'planner' && (
          <RoutinePlanner
            students={students}
            exercises={exercises}
            preselectedStudentId={preselectedStudentId}
            preselectedDate={preselectedDate}
            onRoutineSaved={() => {
              loadData();
              setActiveTab('calendar');
            }}
          />
        )}

        {activeTab === 'scanner' && (
          <PaperRoutineScanner
            students={students}
            exercises={exercises}
            onRoutineSaved={() => {
              loadData();
              setActiveTab('calendar');
            }}
          />
        )}

        {activeTab === 'multimedia' && (
          <MultimediaLibrary
            exercises={exercises}
            onRefresh={loadData}
          />
        )}
      </main>
    </div>
  );
};
