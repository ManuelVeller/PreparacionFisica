import React, { useState } from 'react';
import { Routine, Student } from '../../types';
import { StorageService } from '../../services/storageService';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Dumbbell, 
  User as UserIcon, 
  Trash2,
  Clock,
  Sparkles
} from 'lucide-react';

interface CoachCalendarViewProps {
  routines: Routine[];
  students: Student[];
  onSelectDateToPlan: (dateStr: string, studentId?: string) => void;
  onRefresh: () => void;
}

export const CoachCalendarView: React.FC<CoachCalendarViewProps> = ({
  routines,
  students,
  onSelectDateToPlan,
  onRefresh
}) => {
  // Current month reference: September 2026
  const [selectedStudentFilter, setSelectedStudentFilter] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>('2026-09-28');

  // Days of week for September 2026 (Sept 28, 2026 is Monday)
  // Let's generate days for the active week: Monday Sept 28 to Sunday Oct 4
  const weekDays = [
    { date: '2026-09-28', label: 'Lun', dayNum: 28, isToday: true },
    { date: '2026-09-29', label: 'Mar', dayNum: 29, isToday: false },
    { date: '2026-09-30', label: 'Mié', dayNum: 30, isToday: false },
    { date: '2026-10-01', label: 'Jue', dayNum: 1, isToday: false },
    { date: '2026-10-02', label: 'Vie', dayNum: 2, isToday: false },
    { date: '2026-10-03', label: 'Sáb', dayNum: 3, isToday: false },
    { date: '2026-10-04', label: 'Dom', dayNum: 4, isToday: false }
  ];

  const filteredRoutines = routines.filter((r) =>
    selectedStudentFilter === 'all' ? true : r.studentId === selectedStudentFilter
  );

  const activeDayRoutines = filteredRoutines.filter((r) => r.date === selectedDate);

  const handleDeleteRoutine = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('¿Deseas eliminar esta rutina programada?')) {
      StorageService.deleteRoutine(id);
      onRefresh();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
              Calendario Interactivo de Entrenamientos
            </h1>
            <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-100">
              Septiembre / Octubre 2026
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Organiza y visualiza la semana de entrenamiento de tus alumnos
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Student Filter */}
          <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-slate-200 text-xs">
            <UserIcon className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedStudentFilter}
              onChange={(e) => setSelectedStudentFilter(e.target.value)}
              className="bg-transparent text-slate-700 font-medium focus:outline-none cursor-pointer"
            >
              <option value="all">Todos los alumnos</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => onSelectDateToPlan(selectedDate, selectedStudentFilter !== 'all' ? selectedStudentFilter : undefined)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Planificar para este día</span>
          </button>
        </div>
      </div>

      {/* Week Selector Bar */}
      <div className="grid grid-cols-7 gap-2 sm:gap-3">
        {weekDays.map((day) => {
          const isSelected = selectedDate === day.date;
          const dayRoutines = filteredRoutines.filter((r) => r.date === day.date);

          return (
            <div
              key={day.date}
              onClick={() => setSelectedDate(day.date)}
              className={`p-3 sm:p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between min-h-[105px] ${
                isSelected
                  ? 'bg-white border-slate-900 shadow-md ring-2 ring-slate-900/10'
                  : 'bg-white/80 hover:bg-white border-slate-200/80 hover:border-slate-300 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-400 uppercase">
                  {day.label}
                </span>
                {day.isToday && (
                  <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full">
                    HOY
                  </span>
                )}
              </div>

              <div className="text-xl sm:text-2xl font-bold text-slate-800 my-1">
                {day.dayNum}
              </div>

              {/* Routine indicator dots / badge */}
              <div className="mt-1">
                {dayRoutines.length > 0 ? (
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 truncate">
                      {dayRoutines.length} {dayRoutines.length === 1 ? 'rutina' : 'rutinas'}
                    </span>
                  </div>
                ) : (
                  <span className="text-[10px] text-slate-300 font-medium">Descanso</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Day Detail Cards */}
      <div className="card-soft p-6 bg-white space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <span className="text-xs uppercase font-semibold text-slate-400">
              Detalle del Día
            </span>
            <h2 className="text-lg font-bold text-slate-800">
              {selectedDate === '2026-09-28' ? 'Lunes 28 de Septiembre (Hoy)' : `Fecha: ${selectedDate}`}
            </h2>
          </div>

          <button
            onClick={() => onSelectDateToPlan(selectedDate, selectedStudentFilter !== 'all' ? selectedStudentFilter : undefined)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-full border border-emerald-200/60 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Agregar Rutina a este Día</span>
          </button>
        </div>

        {activeDayRoutines.length === 0 ? (
          <div className="py-12 text-center text-slate-400 space-y-2">
            <CalendarIcon className="w-10 h-10 mx-auto text-slate-300 stroke-1" />
            <p className="text-sm font-medium text-slate-600">
              No hay rutinas asignadas para esta fecha.
            </p>
            <p className="text-xs text-slate-400">
              Haz clic en "Agregar Rutina a este Día" o ve a la pestaña "Planificación".
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeDayRoutines.map((routine) => (
              <div
                key={routine.id}
                className="p-4 rounded-2xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-0.5">
                    <span className="inline-block px-2.5 py-0.5 text-[10px] font-semibold bg-white border border-slate-200 rounded-full text-slate-700">
                      Alumno/a: {routine.studentName}
                    </span>
                    <h3 className="font-semibold text-slate-800 text-sm">{routine.title}</h3>
                  </div>

                  <button
                    onClick={(e) => handleDeleteRoutine(routine.id, e)}
                    className="text-slate-400 hover:text-rose-600 p-1 transition cursor-pointer"
                    title="Eliminar rutina"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {routine.notes && (
                  <p className="text-xs text-slate-500 italic bg-white/70 p-2.5 rounded-xl border border-slate-100">
                    "{routine.notes}"
                  </p>
                )}

                {/* Exercises preview */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Ejercicios programados ({routine.exercises.length})
                  </span>
                  <div className="space-y-1">
                    {routine.exercises.map((item, idx) => (
                      <div
                        key={item.id || idx}
                        className="flex items-center justify-between text-xs py-1 px-2.5 bg-white rounded-xl border border-slate-100"
                      >
                        <span className="font-medium text-slate-700 truncate max-w-[200px]">
                          {item.exerciseName}
                        </span>
                        <span className="font-semibold text-slate-500 text-[11px]">
                          {item.sets} vueltas × {item.targetReps} reps {item.suggestedWeightKg ? `(${item.suggestedWeightKg}kg)` : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {routine.paperScanUrl && (
                  <div className="text-[11px] font-medium text-emerald-700 flex items-center gap-1.5 pt-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Incluye foto de hoja en papel original</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
