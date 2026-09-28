import React from 'react';
import { 
  Users, 
  Calendar as CalendarIcon, 
  ClipboardList, 
  Camera, 
  Video, 
  LogOut, 
  Dumbbell,
  Sparkles
} from 'lucide-react';
import { User } from '../../types';

export type CoachTab = 'students' | 'calendar' | 'planner' | 'scanner' | 'multimedia';

interface CoachSidebarProps {
  activeTab: CoachTab;
  onTabChange: (tab: CoachTab) => void;
  user: User;
  onLogout: () => void;
  onSwitchRole: () => void;
}

export const CoachSidebar: React.FC<CoachSidebarProps> = ({
  activeTab,
  onTabChange,
  user,
  onLogout,
  onSwitchRole
}) => {
  const menuItems = [
    {
      id: 'students' as CoachTab,
      label: 'Alumnos/as',
      icon: Users,
      badge: '3 activos'
    },
    {
      id: 'calendar' as CoachTab,
      label: 'Calendario',
      icon: CalendarIcon,
      badge: 'Hoy'
    },
    {
      id: 'planner' as CoachTab,
      label: 'Planificación',
      icon: ClipboardList,
      badge: null
    },
    {
      id: 'scanner' as CoachTab,
      label: 'Escanear Papel',
      icon: Camera,
      badge: 'Sharp + OCR'
    },
    {
      id: 'multimedia' as CoachTab,
      label: 'Multimedia',
      icon: Video,
      badge: '5 videos'
    }
  ];

  return (
    <aside className="w-64 lg:w-72 bg-white border-r border-slate-100 flex flex-col h-screen sticky top-0 select-none z-20">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
            <Dumbbell className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800 tracking-tight leading-tight">
              EduFísica
            </h2>
            <span className="text-xs text-emerald-600 font-semibold uppercase tracking-wider">
              Panel Profesor
            </span>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        <div className="px-3 py-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
          Gestión & Planificación
        </div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl font-medium text-sm transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User profile & Switcher */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-3">
        <div className="flex items-center gap-3 p-2 bg-white rounded-2xl border border-slate-100 shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 font-semibold flex items-center justify-center text-sm">
            {user.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-800 truncate">{user.name}</p>
            <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onSwitchRole}
            className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 transition cursor-pointer"
            title="Cambiar vista a Alumno"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Ver Alumno</span>
          </button>
          <button
            onClick={onLogout}
            className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-medium text-rose-600 hover:text-rose-700 bg-white hover:bg-rose-50 border border-slate-200 transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Salir</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
